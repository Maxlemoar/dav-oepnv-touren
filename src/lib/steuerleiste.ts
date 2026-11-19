/** Liste oder Karte; unter lg schaltet das Segment im Kartenrahmen um, ab lg stehen beide nebeneinander. */
export type Ansicht = 'liste' | 'karte'

/** Ohne Angabe startet die Seite mit der Karte: sie zeigt Lage und Zeit vor Ort auf einen Blick. */
export const STANDARD_ANSICHT: Ansicht = 'karte'

/** URL schlägt gemerkte Wahl schlägt Standard. Unbekannte Werte werden ignoriert. */
export function ansichtAus(ausUrl: string | null, gemerkt: string | null): Ansicht {
  if (ausUrl === 'liste' || ausUrl === 'karte') return ausUrl
  if (gemerkt === 'liste' || gemerkt === 'karte') return gemerkt
  return STANDARD_ANSICHT
}
