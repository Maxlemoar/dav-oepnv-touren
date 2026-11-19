// Nur für Skripte: die Anfragefunktion wird übergeben (Tests, planenGeduldig).
import { lokaleMinuten, lokalesDatum, zuUtcIso } from '@/lib/datum'
import type { Itinerary, PlanParameter } from '@/lib/verbindung/transitous'
import { hinfahrtenAus, rueckfahrtenAus } from './erzeugen'
import type { Fahrt, MusterOrt, Tagesplan } from './typen'

export type Planen = (p: PlanParameter) => Promise<Itinerary[]>
type Ort = { haltestelleId: string; lat: number; lon: number }

/** Früheste Hinfahrt ab 04:00, späteste Rückkehr bis 24:00 (lokal). */
export const HIN_AB_MIN = 4 * 60
export const RUECK_AN_MIN = 24 * 60
export const ANZAHL = 20
/** Hinfahrten sollen bis mindestens 20:00 reichen; höchstens zwei Folgeanfragen. */
export const HIN_ABEND_MIN = 20 * 60
export const MAX_FOLGEANFRAGEN = 2

/** Späteste Abfahrt (ms) einer Verbindung am Datum, die auch am selben Tag ankommt. */
function letzteAbfahrtMs(its: Itinerary[], tag: string): number | undefined {
  const zeiten = hinfahrtenOhneAuswahl(its, tag)
  return zeiten.length ? Math.max(...zeiten) : undefined
}
const hinfahrtenOhneAuswahl = (its: Itinerary[], tag: string) =>
  its.filter((i) => lokalesDatum(i.startTime) === tag).map((i) => Date.parse(i.startTime))

const koord = (o: Ort) => ({ lat: o.lat, lon: o.lon })

/** Zwei Anfragen (Hin, Rück) für einen Ort an einem Tag. */
export async function tagesplanBerechnen(
  planen: Planen, startort: Ort, ziel: Ort, tag: string,
): Promise<{ plan: Tagesplan; hinItineraries: Itinerary[] }> {
  const hinAnfrage = (zeit: string) => planen({
    von: startort.haltestelleId, nach: ziel.haltestelleId, vonKoord: koord(startort), nachKoord: koord(ziel),
    zeit, ankunftBis: false, anzahl: ANZAHL,
  })
  const hinItineraries = await hinAnfrage(zuUtcIso(tag, HIN_AB_MIN))
  // Folgeanfragen ab der letzten gefundenen Abfahrt, bis die Hinfahrten in den Abend reichen.
  for (let n = 0; n < MAX_FOLGEANFRAGEN; n++) {
    const letzte = letzteAbfahrtMs(hinItineraries, tag)
    if (letzte === undefined || lokaleMinuten(new Date(letzte).toISOString()) >= HIN_ABEND_MIN) break
    const mehr = await hinAnfrage(new Date(letzte + 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z'))
    const neu = mehr.filter((i) => Date.parse(i.startTime) > letzte)
    if (neu.length === 0) break
    hinItineraries.push(...neu)
  }
  const rueck = await planen({
    von: ziel.haltestelleId, nach: startort.haltestelleId, vonKoord: koord(ziel), nachKoord: koord(startort),
    zeit: zuUtcIso(tag, RUECK_AN_MIN), ankunftBis: true, anzahl: ANZAHL,
  })
  return { plan: { hin: hinfahrtenAus(hinItineraries, tag), rueck: rueckfahrtenAus(rueck, tag) }, hinItineraries }
}

/** Abdeckung prüfen: letzte Hinfahrt vor 20:00 oder früheste Rückfahrt nach 14:00 deutet auf zu kurze Antwortlisten. */
export function abdeckungsWarnungen(plan: Tagesplan): string[] {
  const w: string[] = []
  const letzteHin = plan.hin[plan.hin.length - 1]
  const ersteRueck = plan.rueck[0]
  if (!letzteHin) w.push('keine Hinfahrt')
  else if (letzteHin.ab < '20:00') w.push(`letzte Hinfahrt ${letzteHin.ab}`)
  if (!ersteRueck) w.push('keine Rückfahrt')
  else if (ersteRueck.ab > '14:00') w.push(`früheste Rückfahrt ${ersteRueck.ab}`)
  return w
}

/**
 * Regeln aus der Erzeugung auf gespeicherte Fahrten anwenden: nur HH:MM liegt vor, also fällt jede Fahrt
 * mit Ankunft vor Abfahrt (über Mitternacht, fehlerhaft) heraus. Verändert die Eingabe nicht.
 */
export function bereinigeOrt(ort: MusterOrt): MusterOrt {
  const ok = (f: Fahrt) => f.an >= f.ab
  const plaene: MusterOrt['plaene'] = {}
  for (const [klasse, plan] of Object.entries(ort.plaene) as [keyof MusterOrt['plaene'], Tagesplan][]) {
    plaene[klasse] = { hin: plan.hin.filter(ok), rueck: plan.rueck.filter(ok) }
  }
  return { ...ort, plaene }
}

export type Fehlschlag = { ortId: string; klasse: string; anfragen: number; meldung: string }

/** Zusammenfassung der Fehlschläge mit je einem Befehl zum Nachholen; leer, wenn nichts fehlschlug. */
export function fehlschlagZusammenfassung(fehlschlaege: Fehlschlag[]): string[] {
  if (fehlschlaege.length === 0) return []
  const verbraucht = fehlschlaege.reduce((n, f) => n + f.anfragen, 0)
  return [
    `${fehlschlaege.length} Fehlschläge (${verbraucht} Anfragen verbraucht, alter Stand bleibt erhalten); zum Nachholen:`,
    ...fehlschlaege.map(
      (f) => `  npm run musterfahrplan -- --nur ${f.ortId} --klasse ${f.klasse}   (${f.anfragen} Anfragen verbraucht: ${f.meldung})`,
    ),
  ]
}
