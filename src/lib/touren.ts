import { SPORTART_LABEL, type Tour } from './content/schema'
import { minutenAlsDauer } from './datum'

/** Meta-Zeile der Tour-Card: nur belegte Werte, in fester Reihenfolge (Sportart, Dauer, Höhenmeter, Länge, Schwierigkeit). */
export function tourMeta(t: Tour): string[] {
  const teile: string[] = []
  if (t.sportart) teile.push(SPORTART_LABEL[t.sportart])
  if (t.dauerMin !== undefined) teile.push(minutenAlsDauer(t.dauerMin))
  if (t.hoehenmeter !== undefined) teile.push(`${t.hoehenmeter} hm`)
  if (t.laengeKm !== undefined) teile.push(`${t.laengeKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km`)
  if (t.schwierigkeit) teile.push(t.schwierigkeit)
  return teile
}
