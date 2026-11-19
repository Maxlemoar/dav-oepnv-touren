import { datumKurz, lokaleMinuten, minutenAlsDauer } from '@/lib/datum'
import { naechteText } from '@/lib/zeitraum'
import { alsUhrzeit, naechte, zeitfensterSchreiben, type Zeitfenster } from '@/lib/zeitfenster'
import type { FahrtenAntwort, FahrtLive } from '@/lib/verbindung/fahrten'

/** Reine, browsersichere Helfer der Fahrtenwahl auf der Ortsseite (nur Typ-Importe aus der Verbindungslogik). */

/**
 * Query für /api/fahrten: Orte, Datum, ggf. Rückdatum und vom Standard abweichende Zeiten. `vorort` bleibt weg, weil es
 * die Antwort nicht ändert; so löst der Schieber "Mindestens vor Ort" keine neue Anfrage aus.
 */
export function fahrtenAnfrage(von: string, nach: string, z: Zeitfenster): string {
  const q = zeitfensterSchreiben(new URLSearchParams({ von, nach }), z)
  q.delete('vorort')
  return q.toString()
}

/**
 * Query für /api/verbindung (Hüttenseiten, weitere Haltestellen): Orte, Datum, rueck, abweichende Zeiten und `vorort=0`.
 * Die Mindestzeit vor Ort ändert nur das Urteil; das rechnet der Browser (`mitMindestVorOrt`), damit der Schieber
 * "Mindestens vor Ort" keine neue Live-Anfrage auslöst.
 */
export function verbindungAnfrage(von: string, nach: string, z: Zeitfenster, mindestNaechte: 0 | 1): string {
  const q = zeitfensterSchreiben(new URLSearchParams({ von, nach }), { ...z, vorOrtMin: 0 })
  q.set('rueck', z.rueck)
  if (mindestNaechte > 0) q.set('mindestnaechte', String(mindestNaechte))
  return q.toString()
}

/** Eine Fahrt ist durch Abfahrt und Ankunft bestimmt (so entdoppelt auch die API). */
export function fahrtSchluessel(f: Pick<FahrtLive, 'ab' | 'an'>): string {
  return `${f.ab}|${f.an}`
}

const minutenZwischen = (vonIso: string, bisIso: string) => Math.round((Date.parse(bisIso) - Date.parse(vonIso)) / 60_000)

function passendeIndizes(fs: FahrtLive[]): number[] {
  return fs.flatMap((f, i) => (f.lage === 'passend' ? [i] : []))
}

/**
 * Vorausgewähltes Paar (Indizes in `a.hin` und `a.rueckfahrten`), nur aus passenden Fahrten. Tagestour: größte Zeit vor
 * Ort (Rückfahrt-Abfahrt minus Hinfahrt-Ankunft), bei Gleichstand weniger Umstiege. Mehrere Tage: früheste passende
 * Hinfahrt, späteste passende Rückfahrt. Ohne passende Fahrt bleibt die Richtung leer.
 */
export function vorauswahl(a: FahrtenAntwort, z: Zeitfenster): { hin?: number; rueck?: number } {
  const hin = passendeIndizes(a.hin)
  const rueck = passendeIndizes(a.rueckfahrten)
  const nachAb = (fs: FahrtLive[]) => (x: number, y: number) => Date.parse(fs[x].ab) - Date.parse(fs[y].ab)

  if (naechte(z) > 0 || !hin.length || !rueck.length) {
    const h = [...hin].sort(nachAb(a.hin))[0]
    const r = [...rueck].sort(nachAb(a.rueckfahrten)).at(-1)
    return { ...(h !== undefined && { hin: h }), ...(r !== undefined && { rueck: r }) }
  }

  let beste: { hin: number; rueck: number; vorOrt: number; umstiege: number } | undefined
  for (const h of hin) {
    for (const r of rueck) {
      const vorOrt = minutenZwischen(a.hin[h].an, a.rueckfahrten[r].ab)
      const umstiege = a.hin[h].umstiege + a.rueckfahrten[r].umstiege
      if (!beste || vorOrt > beste.vorOrt || (vorOrt === beste.vorOrt && umstiege < beste.umstiege)) {
        beste = { hin: h, rueck: r, vorOrt, umstiege }
      }
    }
  }
  return beste ? { hin: beste.hin, rueck: beste.rueck } : {}
}

/** "7:37 h vor Ort (9:41 bis 17:18)"; bei mehreren Tagen "1 Nacht". */
export function vorOrtText(hin: FahrtLive | undefined, rueck: FahrtLive | undefined, n: number): string {
  if (n > 0) return naechteText(n)
  if (!hin || !rueck) return 'Hin- und Rückfahrt wählen'
  const vorOrt = minutenZwischen(hin.an, rueck.ab)
  if (vorOrt < 0) return 'Rückfahrt vor der Ankunft'
  return `${minutenAlsDauer(vorOrt)} vor Ort (${alsUhrzeit(lokaleMinuten(hin.an))} bis ${alsUhrzeit(lokaleMinuten(rueck.ab))})`
}

/** Knopf zum Aufklappen der Abschnitte einer Fahrt: "Umstiege", bei Direktfahrten "Details", offen "Weniger". */
export function umstiegKnopfText(umstiege: number, offen: boolean): string {
  if (offen) return 'Weniger'
  return umstiege === 0 ? 'Details' : 'Umstiege'
}

/** "Sa 21.11., 6:00–21:00" bzw. "Sa 21.11. – So 22.11., 6:00–21:00". */
export function zeitfensterKurz(z: Pick<Zeitfenster, 'datum' | 'rueck' | 'abMin' | 'bisMin'>): string {
  const tage = z.rueck === z.datum ? datumKurz(z.datum) : `${datumKurz(z.datum)} – ${datumKurz(z.rueck)}`
  return `${tage}, ${alsUhrzeit(z.abMin)}–${alsUhrzeit(z.bisMin)}`
}

/** "Am Sa 21.11. rund 0:45 h länger als üblich", auf Viertelstunden gerundet. */
export function abweichungText(datum: string, abweichungMin: number): string {
  return `Am ${datumKurz(datum)} rund ${minutenAlsDauer(Math.round(abweichungMin / 15) * 15)} länger als üblich`
}

/** Nachgeladene Fahrten ohne die schon gezeigten und ohne Doppelte (gleiche Abfahrt und Ankunft). */
export function neueFahrten(bekannt: FahrtLive[], geladen: FahrtLive[]): FahrtLive[] {
  const gesehen = new Set(bekannt.map(fahrtSchluessel))
  return geladen.filter((f) => {
    const k = fahrtSchluessel(f)
    if (gesehen.has(k)) return false
    gesehen.add(k)
    return true
  })
}

const KEINE_VERBINDUNG = 'Am gewählten Datum keine passende Verbindung gefunden.'
const AUSFALL = 'Live-Fahrplan gerade nicht erreichbar.'

export type FahrtenStatus =
  /** Es fährt nachweislich nichts (Live-Ergebnis leer oder Saisonbetrieb). */
  | { art: 'keine_verbindung'; text: string }
  /** Kein Live-Fahrplan (Ausfall, nach liveBis): typische Fahrten, `leer` wenn keine hinterlegt sind. */
  | { art: 'typisch'; text: string; leer: boolean }
  | { art: 'live'; hinweis?: string }

/**
 * Was die Fahrtenwahl über die Antwort sagt. "Keine Verbindung" nur, wenn die API das meldet oder live ohne Fehler nichts
 * kam; fehlt der Live-Fahrplan, steht der wahre Grund da (Ausfall bzw. Hinweis der API), auch wenn keine typischen
 * Fahrten hinterlegt sind.
 */
export function fahrtenStatus(a: FahrtenAntwort): FahrtenStatus {
  const leer = a.hin.length === 0 && a.rueckfahrten.length === 0
  if (a.fehlerArt === 'keine_verbindung') return { art: 'keine_verbindung', text: a.hinweis ?? KEINE_VERBINDUNG }
  if (a.quelle === 'typisch') {
    // Nach liveBis bzw. bei vergangenem Datum liefert die API den Hinweis; bei Ausfall (mit oder ohne fehlerArt) fehlt er.
    return { art: 'typisch', text: a.hinweis ?? AUSFALL, leer }
  }
  if (!a.fehlerArt && leer) return { art: 'keine_verbindung', text: a.hinweis ?? KEINE_VERBINDUNG }
  return { art: 'live', ...(a.hinweis && { hinweis: a.hinweis }) }
}

/** Für die Sitzung merken nur vollständige Live-Antworten; alles andere cacht auch der Server nur kurz. */
export function merkenswert(a: FahrtenAntwort): boolean {
  return a.quelle === 'live' && !a.fehlerArt && !a.hinweis
}
