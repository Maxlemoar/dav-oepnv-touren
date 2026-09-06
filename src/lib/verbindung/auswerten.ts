import { lokaleMinuten, lokaleUhrzeit, lokalesDatum } from '@/lib/datum'
import type { Itinerary, Leg } from './transitous'

export const HINFAHRT_FENSTER = { fruehVon: 5 * 60, fruehBis: 8 * 60, spaetBis: 9 * 60 } as const
export const RUECKFAHRT_ANKUNFT_BIS = 23 * 60

const FERNVERKEHR = new Set(['HIGHSPEED_RAIL', 'LONG_DISTANCE'])
const MIN_FUSSWEG_SEKUNDEN = 300

export type Modus = 'zug' | 'bus' | 'seilbahn' | 'schiff' | 'fuss' | 'sonstig'

export type Abschnitt = { modus: Modus; linie: string; von: string; nach: string; ab: string; an: string }

export type VerbindungKurz = {
  ab: string
  an: string
  dauerMin: number
  umstiege: number
  fernverkehr: boolean
  abschnitte: Abschnitt[]
}

function fruehesteAnkunft(kandidaten: Itinerary[]): Itinerary | undefined {
  return [...kandidaten].sort((a, b) =>
    Date.parse(a.endTime) - Date.parse(b.endTime) || a.transfers - b.transfers,
  )[0]
}

export function waehleHinfahrt(its: Itinerary[]): { hinfahrt?: Itinerary; hinfahrtSpaeter?: Itinerary } {
  const { fruehVon, fruehBis, spaetBis } = HINFAHRT_FENSTER
  const frueh = its.filter((i) => { const m = lokaleMinuten(i.startTime); return m >= fruehVon && m < fruehBis })
  const spaet = its.filter((i) => { const m = lokaleMinuten(i.startTime); return m >= fruehBis && m < spaetBis })
  return { hinfahrt: fruehesteAnkunft(frueh), hinfahrtSpaeter: fruehesteAnkunft(spaet) }
}

/** Späteste Abfahrt, deren Ankunft am gegebenen lokalen Tag vor 23:00 liegt. */
export function waehleRueckfahrt(its: Itinerary[], datum: string): Itinerary | undefined {
  const passend = its.filter((i) => lokalesDatum(i.endTime) === datum && lokaleMinuten(i.endTime) <= RUECKFAHRT_ANKUNFT_BIS)
  return [...passend].sort((a, b) =>
    Date.parse(b.startTime) - Date.parse(a.startTime) || a.transfers - b.transfers,
  )[0]
}

export function hatFernverkehr(it: Itinerary): boolean {
  return it.legs.some((l) => FERNVERKEHR.has(l.mode))
}

function modusFuer(mode: string): Modus {
  if (mode === 'WALK') return 'fuss'
  if (mode === 'BUS' || mode === 'COACH') return 'bus'
  if (mode === 'FERRY') return 'schiff'
  if (mode === 'GONDOLA' || mode === 'FUNICULAR' || mode === 'AERIAL_LIFT' || mode === 'CABLE_CAR') return 'seilbahn'
  if (mode.includes('RAIL') || mode === 'LONG_DISTANCE' || mode === 'TRAM' || mode === 'SUBWAY' || mode === 'METRO') return 'zug'
  return 'sonstig'
}

function dauerSekunden(l: Leg): number {
  return (Date.parse(l.endTime) - Date.parse(l.startTime)) / 1000
}

export function abschnitte(it: Itinerary): Abschnitt[] {
  return it.legs
    .filter((l) => l.mode !== 'WALK' || dauerSekunden(l) >= MIN_FUSSWEG_SEKUNDEN)
    .map((l) => ({
      modus: modusFuer(l.mode),
      linie: l.routeShortName ?? (l.mode === 'WALK' ? 'Fußweg' : l.mode),
      von: l.from.name,
      nach: l.to.name,
      ab: lokaleUhrzeit(l.startTime),
      an: lokaleUhrzeit(l.endTime),
    }))
}

export function kurzfassung(it: Itinerary): VerbindungKurz {
  return {
    ab: it.startTime,
    an: it.endTime,
    dauerMin: Math.round((Date.parse(it.endTime) - Date.parse(it.startTime)) / 60_000),
    umstiege: it.transfers,
    fernverkehr: hatFernverkehr(it),
    abschnitte: abschnitte(it),
  }
}
