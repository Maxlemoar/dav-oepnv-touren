import { datumKurz } from '@/lib/datum'
import { STANDARD_FILTER, type FilterZustand } from '@/lib/filter'

/** Liste oder Karte; unter lg schaltet das Segment der Steuerleiste um, ab lg stehen beide nebeneinander. */
export type Ansicht = 'liste' | 'karte'

/** Ohne Angabe startet die Seite mit der Karte: sie zeigt Lage und Reisezeit auf einen Blick. */
export const STANDARD_ANSICHT: Ansicht = 'karte'

/** URL schlägt gemerkte Wahl schlägt Standard. Unbekannte Werte werden ignoriert. */
export function ansichtAus(ausUrl: string | null, gemerkt: string | null): Ansicht {
  if (ausUrl === 'liste' || ausUrl === 'karte') return ausUrl
  if (gemerkt === 'liste' || gemerkt === 'karte') return gemerkt
  return STANDARD_ANSICHT
}

/** Tourenfenster-Standard "Mindestens am Berg" in Minuten (6 h). */
export const STANDARD_FENSTER = 360

/** Chips "Mindestens am Berg" in Minuten. */
export const FENSTER_WERTE = [180, 240, 300, 360, 480]

/**
 * Zähler auf der Filter-Pill: jede gewählte Sportart, eine abweichende Art, eine abweichende
 * Fahrzeitgrenze, ein abweichendes Tourenfenster und der ausgeschaltete Saison-Schalter zählen je eins. Die Suche zählt nicht,
 * sie steht sichtbar im Feld.
 */
export function anzahlAktiverFilter(filter: FilterZustand, fenster: number): number {
  return filter.sport.length
    + (filter.art !== STANDARD_FILTER.art ? 1 : 0)
    + (filter.maxStd !== STANDARD_FILTER.maxStd ? 1 : 0)
    + (fenster !== STANDARD_FENSTER ? 1 : 0)
    + (filter.nurPassend !== STANDARD_FILTER.nurPassend ? 1 : 0)
}

/**
 * Zeitraum in die Suchparameter schreiben; andere Parameter bleiben. Standardwerte fallen weg:
 * datum am kommenden Samstag, rueck am Hin-Datum, Tourenfenster 6 h.
 */
export function schreibeZeitraum(sp: URLSearchParams, z: { datum: string; rueck: string; fenster: number }, samstag: string): URLSearchParams {
  const neu = new URLSearchParams(sp)
  if (z.datum === samstag) neu.delete('datum'); else neu.set('datum', z.datum)
  if (z.rueck === z.datum) neu.delete('rueck'); else neu.set('rueck', z.rueck)
  if (z.fenster === STANDARD_FENSTER) neu.delete('fenster'); else neu.set('fenster', String(z.fenster))
  return neu
}

/** Beschriftung der Zeitraum-Pill: "Sa 12.9." oder "Sa 12.9. – So 13.9.". */
export function zeitraumText(datum: string, rueck: string): string {
  return datum === rueck ? datumKurz(datum) : `${datumKurz(datum)} – ${datumKurz(rueck)}`
}

/** Datum ohne Wochentag und Jahr: "12.9.". */
function tagMonat(datum: string): string {
  const [, m, t] = datum.split('-')
  return `${Number(t)}.${Number(m)}.`
}

/** Zweite Zeile im Zeitraum-Chip: "12.9.", "12.–13.9." oder über den Monat "31.10.–1.11.". */
export function zeitraumKurz(datum: string, rueck: string): string {
  if (datum === rueck) return tagMonat(datum)
  const gleicherMonat = datum.slice(0, 7) === rueck.slice(0, 7)
  return gleicherMonat ? `${Number(datum.slice(8))}.–${tagMonat(rueck)}` : `${tagMonat(datum)}–${tagMonat(rueck)}`
}
