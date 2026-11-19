import { ZEITFENSTER_PARAMETER } from '@/lib/zeitfenster'

export function naechteText(n: number): string {
  return `${n} ${n === 1 ? 'Nacht' : 'Nächte'}`
}

/**
 * "?datum=…&rueck=…&ab=…&bis=…&vorort=…" mit den gesetzten Zeitfenster-Parametern (`ZEITFENSTER_PARAMETER`), sonst "".
 * Das alte `fenster` wandert nicht mehr mit.
 * Mit `datumStandard` (dem auf der Seite verwendeten Hin-Datum) wird datum ausdrücklich ergänzt, wenn nur rueck
 * gesetzt ist; sonst bekäme die Zielseite ein anderes Hin-Datum, sobald sich der kommende Samstag verschiebt.
 */
export function zeitraumQuery(sp: URLSearchParams, datumStandard?: string): string {
  const neu = new URLSearchParams()
  for (const k of ZEITFENSTER_PARAMETER) {
    const v = sp.get(k) || (k === 'datum' && sp.get('rueck') ? datumStandard : undefined)
    if (v) neu.set(k, v)
  }
  const q = neu.toString()
  return q ? `?${q}` : ''
}

export function mitZeitraum(pfad: string, query: string): string {
  return `${pfad}${query}`
}
