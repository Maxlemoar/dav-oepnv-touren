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
  constructor(message: string, public readonly status?: number, public readonly netz: boolean = false) {
    super(message)
    this.name = 'TransitousFehler'
  }
}

export const BASIS = process.env.TRANSITOUS_BASIS ?? 'https://api.transitous.org'
export const USER_AGENT = process.env.TRANSITOUS_USER_AGENT ?? 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)'
const TIMEOUT_MS = 8000
const CACHE_SEKUNDEN = 86400

export type Koordinate = { lat: number; lon: number }

export type PlanParameter = {
  von: string
  nach: string
  /** UTC-ISO, z.B. 2026-09-12T03:00:00Z */
  zeit: string
  /** true: Ankunft spätestens `zeit`; false: Abfahrt frühestens `zeit` */
  ankunftBis?: boolean
  anzahl?: number
  /** Ausweg, wenn Transitous die Kennung nicht mehr kennt (Fahrplanjahr in der Kennung). */
  vonKoord?: Koordinate
  nachKoord?: Koordinate
}

const alsOrt = (k: Koordinate) => `${k.lat},${k.lon}`

/** Plan-URL; mit `mitKoordinaten` ersetzen vorhandene Koordinaten die Haltestellen-Kennungen. */
export function planUrl(p: PlanParameter, mitKoordinaten = false): string {
  const q = new URLSearchParams({
    fromPlace: mitKoordinaten && p.vonKoord ? alsOrt(p.vonKoord) : p.von,
    toPlace: mitKoordinaten && p.nachKoord ? alsOrt(p.nachKoord) : p.nach,
    time: p.zeit,
    arriveBy: String(p.ankunftBis ?? false),
    numItineraries: String(p.anzahl ?? 10),
    language: 'de',
  })
  return `${BASIS}/api/v1/plan?${q.toString()}`
}

export const hatKoordinaten = (p: PlanParameter) => Boolean(p.vonKoord || p.nachKoord)

const UNBEKANNT = /unknown|not found|no such|nicht gefunden|invalid (stop|place|location)/i

/** Kennt Transitous den Ort nicht (mehr)? HTTP 404 oder eine entsprechende Meldung bei 200/400/422. */
export function istUnbekannterOrt(status: number, text: string): boolean {
  if (status === 404) return true
  return (status === 200 || status === 400 || status === 422) && UNBEKANNT.test(text)
}

/** Überlast, Serverfehler, Zeitüberschreitung oder Netzfehler: Transitous ist gerade nicht nutzbar. */
export function dienstNichtErreichbar(e: unknown): boolean {
  if (!(e instanceof TransitousFehler)) return true
  if (e.status === undefined) return e.netz
  return e.status === 429 || e.status >= 500
}

type FetchOptionen = RequestInit & { next?: { revalidate: number } }

async function einmalPlanen(url: string, fetchImpl: typeof fetch): Promise<{ its?: Itinerary[]; status: number; text: string }> {
  let antwort: Response
  try {
    const optionen: FetchOptionen = {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: CACHE_SEKUNDEN },
    }
    antwort = await fetchImpl(url, optionen)
  } catch (e) {
    throw new TransitousFehler(`Transitous nicht erreichbar: ${(e as Error).message}`, undefined, true)
  }
  if (!antwort.ok) return { status: antwort.status, text: await antwort.text().catch(() => '') }
  const daten = (await antwort.json()) as { itineraries?: Itinerary[]; error?: string }
  if (Array.isArray(daten.itineraries)) return { its: daten.itineraries, status: 200, text: '' }
  return { status: 200, text: daten.error ?? 'keine itineraries' }
}

/**
 * Verbindungen planen. Kennt Transitous eine Kennung nicht (HTTP 404 oder Meldung zu unbekanntem Ort),
 * wird einmal mit den Koordinaten wiederholt, sofern welche übergeben sind.
 */
export async function planen(p: PlanParameter, fetchImpl: typeof fetch = fetch): Promise<Itinerary[]> {
  let r = await einmalPlanen(planUrl(p), fetchImpl)
  if (!r.its && hatKoordinaten(p) && istUnbekannterOrt(r.status, r.text)) r = await einmalPlanen(planUrl(p, true), fetchImpl)
  if (r.its) return r.its
  if (r.status !== 200) throw new TransitousFehler(`Transitous HTTP ${r.status}`, r.status)
  throw new TransitousFehler(`Transitous: ${r.text}`)
}
