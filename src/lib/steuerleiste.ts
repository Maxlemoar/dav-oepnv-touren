/** Liste oder Karte; unter lg schaltet das Segment im Kartenrahmen um, ab lg stehen beide nebeneinander. */
export type Ansicht = 'liste' | 'karte'

/**
 * Ohne Angabe startet das Handy mit der Liste: über ihr steht das Zeitfenster, die Seite fragt zuerst "wann". Ab lg
 * stehen Karte und Liste ohnehin nebeneinander.
 */
export const STANDARD_ANSICHT: Ansicht = 'liste'

/**
 * URL schlägt gemerkte Wahl schlägt Standard. Unbekannte Werte werden ignoriert. Ohne gewähltes Datum gilt die Liste mit
 * dem Zeitfenster, auch wenn die Karte gemerkt ist (die Karte zeigt dann nur Offenburg); nur ein ausdrückliches
 * `ansicht=karte` in der URL (Antippen von "Karte") öffnet sie.
 */
export function ansichtAus(ausUrl: string | null, gemerkt: string | null, opts: { datumGewaehlt?: boolean } = {}): Ansicht {
  if (ausUrl === 'liste' || ausUrl === 'karte') return ausUrl
  if (opts.datumGewaehlt === false) return 'liste'
  if (gemerkt === 'liste' || gemerkt === 'karte') return gemerkt
  return STANDARD_ANSICHT
}
