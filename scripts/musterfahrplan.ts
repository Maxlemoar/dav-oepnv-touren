/**
 * Berechnet den typischen Tagesfahrplan je Ausgangsort (erste Haltestelle jedes Gebiets) und Tagesklasse
 * (Werktag = nächster Freitag, Samstag, Sonntag) für die Zeitfenster-Karte der Startseite und schreibt
 * ihn nach content/musterfahrplan.json. Vorhandene Orte und Klassen anderer Läufe bleiben erhalten.
 *
 *   npm run musterfahrplan                               alle Orte, alle Klassen
 *   npm run musterfahrplan -- --nur kandersteg           ein Ort
 *   npm run musterfahrplan -- --klasse sa --klasse so    nur diese Klassen (werktag|sa|so)
 *   npm run musterfahrplan -- --sa 2026-12-05 --so 2026-12-06 --werktag 2026-12-04   Referenztage vorgeben
 *
 * Anfragebudget (Transitous, projektweit etwa 720 /plan-Anfragen je Tag): je Ort und Klasse 2 Anfragen
 * (Hin ab 04:00, Rück bis 24:00, je 20 Verbindungen). Voller Lauf: 84 Orte × 3 Klassen × 2 = 504 Anfragen.
 * Vor jedem Lauf das Tagesbudget prüfen; Teilläufe mit --nur und --klasse sind vorzuziehen.
 * Am Ende werden Orte gemeldet, deren Abdeckung dünn aussieht (letzte Hinfahrt vor 14:00 oder früheste
 * Rückfahrt nach 14:00).
 */
import fs from 'node:fs'
import path from 'node:path'
import { ladeInhalt } from '../src/lib/content/laden'
import { lokalesDatum } from '../src/lib/datum'
import { planenGeduldig } from '../src/lib/verbindung/transitous-geduldig'
import { ladeFahrplan } from '../src/lib/verbindung/fahrplan'
import { referenzTage, tagesfensterZiele, TAGESKLASSEN } from '../src/lib/richtwerte'
import { ladeMusterfahrplan, MUSTERFAHRPLAN_DATEI } from '../src/lib/musterfahrplan/laden'
import { tagesplanBerechnen, abdeckungsWarnungen, type Planen } from '../src/lib/musterfahrplan/berechnen'
import { streckeAus } from '../src/lib/musterfahrplan/erzeugen'
import type { Musterfahrplan, MusterOrt } from '../src/lib/musterfahrplan/typen'
import type { Tagesklasse } from '../src/lib/saison'

const args = process.argv.slice(2)
const arg = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const alle = (k: string) => args.flatMap((a, i) => (a === k ? [args[i + 1]] : []))
const nur = arg('--nur')
const klassenArg = alle('--klasse')
const PARALLEL = 2
/** Reihenfolge, in der die Strecke aus der ersten berechneten Klasse genommen wird. */
const STRECKE_REIHENFOLGE: Tagesklasse[] = ['sa', 'so', 'werktag']

async function inParallel<T>(liste: T[], breite: number, fn: (x: T) => Promise<void>): Promise<void> {
  let naechster = 0
  await Promise.all(Array.from({ length: breite }, async () => {
    for (let k = naechster++; k < liste.length; k = naechster++) await fn(liste[k])
  }))
}

async function main() {
  for (const k of klassenArg) if (!(TAGESKLASSEN as string[]).includes(k)) throw new Error(`--klasse ${k}: erlaubt sind werktag, sa, so`)
  const klassen = TAGESKLASSEN.filter((k) => klassenArg.length === 0 || klassenArg.includes(k))
  const wurzel = path.join(process.cwd(), 'content')
  const inhalt = ladeInhalt(wurzel)
  const { liveBis } = ladeFahrplan(path.join(wurzel, 'fahrplan.yaml'))
  const heute = lokalesDatum(new Date())
  const tage = referenzTage(heute, liveBis, { sa: arg('--sa'), so: arg('--so'), werktag: arg('--werktag') })

  const alleZiele = tagesfensterZiele(inhalt.gebiete, inhalt.haltestellen, inhalt.startorte)
  const startort = alleZiele[0]?.startort
  if (!startort) throw new Error('Kein sichtbarer Startort')
  const ziele = alleZiele.map((z) => z.haltestelle).filter((h) => !nur || h.id === nur)
  if (nur && ziele.length === 0) throw new Error(`Haltestelle "${nur}" ist kein erster Zugang eines Gebiets`)

  const vorhanden = ladeMusterfahrplan()
  if (vorhanden && vorhanden.startortId !== startort.id) throw new Error(`content/musterfahrplan.json gehört zu "${vorhanden.startortId}", nicht zu "${startort.id}"`)
  const ergebnis: Musterfahrplan = {
    startortId: startort.id,
    berechnetAm: heute,
    liveBis,
    referenzTage: { ...vorhanden?.referenzTage },
    orte: { ...vorhanden?.orte },
  }
  for (const k of klassen) ergebnis.referenzTage[k] = tage[k]

  const planen: Planen = (p) => planenGeduldig(p)
  const speichern = () => {
    const orte = Object.fromEntries(Object.entries(ergebnis.orte).sort(([a], [b]) => a.localeCompare(b)))
    fs.writeFileSync(MUSTERFAHRPLAN_DATEI, JSON.stringify({ ...ergebnis, orte }, null, 2) + '\n')
  }

  console.log(`Musterfahrplan ab ${startort.id}: ${klassen.map((k) => `${k} ${tage[k]}`).join(', ')}; ${ziele.length} Orte, ${ziele.length * klassen.length * 2} Anfragen`)
  let anfragen = 0
  let fehler = 0
  const warnungen: string[] = []
  const zaehlendes: Planen = (p) => { anfragen++; return planen(p) }

  await inParallel(ziele, PARALLEL, async (ziel) => {
    const ort: MusterOrt = { plaene: { ...ergebnis.orte[ziel.id]?.plaene }, ...(ergebnis.orte[ziel.id]?.strecke ? { strecke: ergebnis.orte[ziel.id].strecke } : {}) }
    const hinAntworten: Partial<Record<Tagesklasse, Awaited<ReturnType<typeof tagesplanBerechnen>>['hinItineraries']>> = {}
    for (const klasse of klassen) {
      try {
        const { plan, hinItineraries } = await tagesplanBerechnen(zaehlendes, startort, ziel, tage[klasse])
        ort.plaene[klasse] = plan
        hinAntworten[klasse] = hinItineraries
        const w = abdeckungsWarnungen(plan)
        console.log(`  ${ziel.id} ${klasse}: ${plan.hin.length} hin, ${plan.rueck.length} rück${w.length ? `  ACHTUNG ${w.join(', ')}` : ''}`)
        if (w.length) warnungen.push(`${ziel.id} ${klasse}: ${w.join(', ')}`)
      } catch (e) {
        fehler++
        console.warn(`  ${ziel.id} ${klasse}: FEHLER ${(e as Error).message}`)
      }
    }
    const streckenKlasse = STRECKE_REIHENFOLGE.find((k) => hinAntworten[k])
    if (streckenKlasse) {
      const strecke = streckeAus(hinAntworten[streckenKlasse]!)
      if (strecke) ort.strecke = strecke
      else console.warn(`  ${ziel.id}: keine Strecke aus ${streckenKlasse}`)
    }
    if (Object.keys(ort.plaene).length) { ergebnis.orte[ziel.id] = ort; speichern() }
  })

  console.log(`${anfragen} Anfragen, ${ziele.length} Orte, ${fehler} Fehler`)
  if (warnungen.length) console.log(`Abdeckung prüfen (${warnungen.length}):\n  ${warnungen.join('\n  ')}`)
  else console.log('Abdeckung: keine Auffälligkeiten')
}

main().catch((e) => { console.error(e); process.exit(1) })
