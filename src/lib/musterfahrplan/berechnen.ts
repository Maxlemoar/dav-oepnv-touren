// Nur für Skripte: die Anfragefunktion wird übergeben (Tests, planenGeduldig).
import { zuUtcIso } from '@/lib/datum'
import type { Itinerary, PlanParameter } from '@/lib/verbindung/transitous'
import { hinfahrtenAus, rueckfahrtenAus } from './erzeugen'
import type { Tagesplan } from './typen'

export type Planen = (p: PlanParameter) => Promise<Itinerary[]>
type Ort = { haltestelleId: string; lat: number; lon: number }

/** Früheste Hinfahrt ab 04:00, späteste Rückkehr bis 24:00 (lokal). */
export const HIN_AB_MIN = 4 * 60
export const RUECK_AN_MIN = 24 * 60
export const ANZAHL = 20

const koord = (o: Ort) => ({ lat: o.lat, lon: o.lon })

/** Zwei Anfragen (Hin, Rück) für einen Ort an einem Tag. */
export async function tagesplanBerechnen(
  planen: Planen, startort: Ort, ziel: Ort, tag: string,
): Promise<{ plan: Tagesplan; hinItineraries: Itinerary[] }> {
  const hinItineraries = await planen({
    von: startort.haltestelleId, nach: ziel.haltestelleId, vonKoord: koord(startort), nachKoord: koord(ziel),
    zeit: zuUtcIso(tag, HIN_AB_MIN), ankunftBis: false, anzahl: ANZAHL,
  })
  const rueck = await planen({
    von: ziel.haltestelleId, nach: startort.haltestelleId, vonKoord: koord(ziel), nachKoord: koord(startort),
    zeit: zuUtcIso(tag, RUECK_AN_MIN), ankunftBis: true, anzahl: ANZAHL,
  })
  return { plan: { hin: hinfahrtenAus(hinItineraries, tag), rueck: rueckfahrtenAus(rueck, tag) }, hinItineraries }
}

/** Abdeckung prüfen: letzte Hinfahrt vor 14:00 oder früheste Rückfahrt nach 14:00 deutet auf zu kurze Antwortlisten. */
export function abdeckungsWarnungen(plan: Tagesplan): string[] {
  const w: string[] = []
  const letzteHin = plan.hin[plan.hin.length - 1]
  const ersteRueck = plan.rueck[0]
  if (!letzteHin) w.push('keine Hinfahrt')
  else if (letzteHin.ab < '14:00') w.push(`letzte Hinfahrt ${letzteHin.ab}`)
  if (!ersteRueck) w.push('keine Rückfahrt')
  else if (ersteRueck.ab > '14:00') w.push(`früheste Rückfahrt ${ersteRueck.ab}`)
  return w
}
