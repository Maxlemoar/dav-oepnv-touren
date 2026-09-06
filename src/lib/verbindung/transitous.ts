export type Leg = {
  mode: string
  from: { name: string }
  to: { name: string }
  startTime: string
  endTime: string
  routeShortName?: string
  agencyName?: string
}

export type Itinerary = {
  startTime: string
  endTime: string
  duration: number
  transfers: number
  legs: Leg[]
}

export class TransitousFehler extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'TransitousFehler'
  }
}

const BASIS = process.env.TRANSITOUS_BASIS ?? 'https://api.transitous.org'
const USER_AGENT = process.env.TRANSITOUS_USER_AGENT ?? 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)'
const TIMEOUT_MS = 8000
const CACHE_SEKUNDEN = 86400

export type PlanParameter = {
  von: string
  nach: string
  /** UTC-ISO, z.B. 2026-09-12T03:00:00Z */
  zeit: string
  /** true: Ankunft spätestens `zeit`; false: Abfahrt frühestens `zeit` */
  ankunftBis?: boolean
  anzahl?: number
}

export async function planen(p: PlanParameter, fetchImpl: typeof fetch = fetch): Promise<Itinerary[]> {
  const q = new URLSearchParams({
    fromPlace: p.von,
    toPlace: p.nach,
    time: p.zeit,
    arriveBy: String(p.ankunftBis ?? false),
    numItineraries: String(p.anzahl ?? 10),
    language: 'de',
  })
  const url = `${BASIS}/api/v1/plan?${q.toString()}`
  let antwort: Response
  try {
    antwort = await fetchImpl(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: CACHE_SEKUNDEN },
    } as RequestInit)
  } catch (e) {
    throw new TransitousFehler(`Transitous nicht erreichbar: ${(e as Error).message}`)
  }
  if (!antwort.ok) throw new TransitousFehler(`Transitous HTTP ${antwort.status}`, antwort.status)
  const daten = (await antwort.json()) as { itineraries?: Itinerary[]; error?: string }
  if (!Array.isArray(daten.itineraries)) throw new TransitousFehler(`Transitous: ${daten.error ?? 'keine itineraries'}`)
  return daten.itineraries
}
