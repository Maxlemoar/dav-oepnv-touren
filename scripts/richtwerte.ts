/**
 * Berechnet Richtwerte (Fahrzeit, Umstiege, Takt, Ticket, Distanzen) für jeden Startort × Haltestelle
 * an einem Referenz-Samstag und schreibt sie in content/haltestellen/*.yaml.
 *
 *   npm run richtwerte                       nächster Samstag in mindestens 7 Tagen
 *   npm run richtwerte -- --datum 2026-09-19
 *   npm run richtwerte -- --nur kandersteg
 *   npm run richtwerte -- --fehlend          nur Haltestellen ohne Richtwerte für alle Startorte
 *
 * Tagesfenster (früheste Ankunft, letzte Rückfahrt) für die Tagesziel-Urteile der Startseite:
 *
 *   npm run richtwerte -- --nur-tagesfenster                 nächster Fr, Sa, So bis liveBis (content/fahrplan.yaml)
 *   npm run richtwerte -- --nur-tagesfenster --sa 2026-12-05 --so 2026-12-06 --werktag 2026-12-04
 *   npm run richtwerte -- --nur-tagesfenster --nur kandersteg
 */
import fs from 'node:fs'
import path from 'node:path'
import { parseDocument } from 'yaml'
import { ladeInhalt } from '../src/lib/content/laden'
import { naechsterSamstag, lokalesDatum, zuUtcIso } from '../src/lib/datum'
import { planenGeduldig } from '../src/lib/verbindung/transitous-geduldig'
import { ladeFahrplan } from '../src/lib/verbindung/fahrplan'
import { HINFAHRT_FENSTER, RUECKFAHRT_ANKUNFT_BIS } from '../src/lib/verbindung/auswerten'
import {
  richtwertAus, haversineKm, tagesfensterAus, referenzTage, tagesfensterZiele, richtwertSchreiben, tagesfensterSchreiben, TAGESKLASSEN,
} from '../src/lib/richtwerte'
import type { Haltestelle, Startort } from '../src/lib/content/schema'
import type { Tagesklasse } from '../src/lib/saison'

const args = process.argv.slice(2)
const arg = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const inEinerWoche = new Date(Date.now() + 7 * 86400_000)
const datum = arg('--datum') ?? naechsterSamstag(inEinerWoche)
const nur = arg('--nur')
const fehlend = args.includes('--fehlend')
const nurTagesfenster = args.includes('--nur-tagesfenster')
const heute = lokalesDatum(new Date())
const wurzel = path.join(process.cwd(), 'content')
/** Bahnstrecke ist im Mittel etwa ein Viertel länger als die Luftlinie. */
const BAHN_FAKTOR = 1.25
/** Gleichzeitige Anfragen an Transitous beim Tagesfenster. */
const PARALLEL = 2

const schlaf = (ms: number) => new Promise((r) => setTimeout(r, ms))
const koord = (o: { lat: number; lon: number }) => ({ lat: o.lat, lon: o.lon })

async function strassenKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): Promise<number | undefined> {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) return undefined
    const d = (await r.json()) as { routes?: { distance: number }[] }
    const m = d.routes?.[0]?.distance
    return m !== undefined ? Math.round(m / 1000) : undefined
  } catch {
    return undefined
  }
}

async function inParallel<T>(liste: T[], breite: number, fn: (x: T) => Promise<void>): Promise<void> {
  let naechster = 0
  await Promise.all(Array.from({ length: breite }, async () => {
    for (let k = naechster++; k < liste.length; k = naechster++) await fn(liste[k])
  }))
}

function dateiFuer(h: Haltestelle) {
  return path.join(wurzel, 'haltestellen', `${h.id}.yaml`)
}

async function richtwerteBerechnen() {
  const i = ladeInhalt(wurzel)
  const haltestellen = nur
    ? i.haltestellen.filter((h) => h.id === nur)
    : fehlend
      ? i.haltestellen.filter((h) => i.startorte.some((s) => !h.richtwerte[s.id]))
      : i.haltestellen
  if (nur && haltestellen.length === 0) throw new Error(`Haltestelle "${nur}" nicht gefunden`)
  console.log(`Richtwerte für ${datum}, ${haltestellen.length} Haltestellen × ${i.startorte.length} Startorte`)

  for (const h of haltestellen) {
    const datei = dateiFuer(h)
    // Als Dokument bearbeiten, damit Kommentare und Reihenfolge in der Datei erhalten bleiben.
    const dok = parseDocument(fs.readFileSync(datei, 'utf8'))

    for (const [n, s] of i.startorte.entries()) {
      if (n > 0) await schlaf(1000)
      try {
        const its = await planenGeduldig({
          von: s.haltestelleId, nach: h.haltestelleId, vonKoord: koord(s), nachKoord: koord(h),
          zeit: zuUtcIso(datum, HINFAHRT_FENSTER.fruehVon), ankunftBis: false, anzahl: 15,
        })
        const r = richtwertAus(its, h.land, i.tickets, heute)
        if (!r) { console.warn(`  ${s.id} → ${h.id}: keine Hinfahrt im Fenster (${its.length} Itineraries)`); continue }
        const strasse = await strassenKm(s, h)
        const bahn = Math.round(haversineKm(s.lat, s.lon, h.lat, h.lon) * BAHN_FAKTOR)
        richtwertSchreiben(dok, s.id, { ...r, ...(strasse !== undefined ? { strassenKm: strasse } : {}), bahnKm: bahn })
        console.log(`  ${s.id} → ${h.id}: ${r.fahrzeitMin} min, ${r.umstiege} Umstiege, ${r.takt}, ${r.ticket}, Straße ${strasse ?? '?'} km`)
      } catch (e) {
        console.warn(`  ${s.id} → ${h.id}: FEHLER ${(e as Error).message}`)
      }
    }
    fs.writeFileSync(datei, dok.toString({ lineWidth: 0 }))
  }
}

async function tagesfensterBerechnen() {
  const i = ladeInhalt(wurzel)
  const { liveBis } = ladeFahrplan(path.join(wurzel, 'fahrplan.yaml'))
  const tage = referenzTage(heute, liveBis, { sa: arg('--sa'), so: arg('--so'), werktag: arg('--werktag') })
  const ziele = tagesfensterZiele(i.gebiete, i.haltestellen, i.startorte).filter((z) => !nur || z.haltestelle.id === nur)
  if (nur && ziele.length === 0) throw new Error(`Haltestelle "${nur}" ist kein erster Zugang eines Gebiets`)

  type Aufgabe = { haltestelle: Haltestelle; startort: Startort; klasse: Tagesklasse }
  const aufgaben: Aufgabe[] = ziele.flatMap((z) => TAGESKLASSEN.map((klasse) => ({ ...z, klasse })))
  console.log(`Tagesfenster für Werktag ${tage.werktag}, Sa ${tage.sa}, So ${tage.so}: ${ziele.length} Ziele, ${aufgaben.length * 2} Anfragen`)

  const ergebnisse = new Map<string, { startort: Startort; klasse: Tagesklasse; fenster: ReturnType<typeof tagesfensterAus> }[]>()
  let fertig = 0
  let fehler = 0
  await inParallel(aufgaben, PARALLEL, async ({ haltestelle: h, startort: s, klasse }) => {
    const tag = tage[klasse]
    try {
      const hin = await planenGeduldig({
        von: s.haltestelleId, nach: h.haltestelleId, vonKoord: koord(s), nachKoord: koord(h),
        zeit: zuUtcIso(tag, HINFAHRT_FENSTER.fruehVon), ankunftBis: false, anzahl: 12,
      })
      const rueck = await planenGeduldig({
        von: h.haltestelleId, nach: s.haltestelleId, vonKoord: koord(h), nachKoord: koord(s),
        zeit: zuUtcIso(tag, RUECKFAHRT_ANKUNFT_BIS), ankunftBis: true, anzahl: 6,
      })
      // Nur schreiben, wenn beide Abfragen geklappt haben: fehlende Felder bedeuten dann "keine Verbindung".
      const fenster = tagesfensterAus(hin, rueck, tag, h.land)
      const liste = ergebnisse.get(h.id) ?? []
      liste.push({ startort: s, klasse, fenster })
      ergebnisse.set(h.id, liste)
      console.log(`  ${s.id} → ${h.id} ${klasse}: an ${fenster.ankunft ?? '–'}, zurück ab ${fenster.letzteRueckfahrt ?? '–'}`)
    } catch (e) {
      fehler++
      console.warn(`  ${s.id} → ${h.id} ${klasse}: FEHLER ${(e as Error).message}`)
    }
    fertig++
    if (fertig % 10 === 0) console.log(`Fortschritt: ${fertig}/${aufgaben.length}`)
  })

  let geschrieben = 0
  for (const h of i.haltestellen) {
    const liste = ergebnisse.get(h.id)
    if (!liste) continue
    const datei = dateiFuer(h)
    const dok = parseDocument(fs.readFileSync(datei, 'utf8'))
    for (const { startort, klasse, fenster } of liste) {
      // Ohne Richtwert wäre der Eintrag ungültig (Fahrzeit fehlt); erst npm run richtwerte laufen lassen.
      if (!h.richtwerte[startort.id]) { console.warn(`  ${startort.id} → ${h.id}: kein Richtwert, Tagesfenster übersprungen`); continue }
      tagesfensterSchreiben(dok, startort.id, klasse, fenster)
      geschrieben++
    }
    fs.writeFileSync(datei, dok.toString({ lineWidth: 0 }))
  }
  console.log(`${geschrieben} Tagesfenster geschrieben, ${fehler} Fehler`)
}

const main = nurTagesfenster ? tagesfensterBerechnen : richtwerteBerechnen
main().catch((e) => { console.error(e); process.exit(1) })
