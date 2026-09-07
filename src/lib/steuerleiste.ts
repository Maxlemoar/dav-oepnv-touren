import { datumKurz } from '@/lib/datum'
import { STANDARD_FILTER, type FilterZustand } from '@/lib/filter'

/** Tourenfenster-Standard "Mindestens am Berg" in Minuten (6 h). */
export const STANDARD_FENSTER = 360

/** Chips "Mindestens am Berg" in Minuten. */
export const FENSTER_WERTE = [180, 240, 300, 360, 480]

/**
 * Zähler auf der Filter-Pill: jede gewählte Sportart, eine abweichende Art, eine abweichende
 * Fahrzeitgrenze und ein abweichendes Tourenfenster zählen je eins. Die Suche zählt nicht,
 * sie steht sichtbar im Feld.
 */
export function anzahlAktiverFilter(filter: FilterZustand, fenster: number): number {
  return filter.sport.length
    + (filter.art !== STANDARD_FILTER.art ? 1 : 0)
    + (filter.maxStd !== STANDARD_FILTER.maxStd ? 1 : 0)
    + (fenster !== STANDARD_FENSTER ? 1 : 0)
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
