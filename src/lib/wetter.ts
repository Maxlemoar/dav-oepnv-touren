// Wetter am Datum über Open-Meteo (CC BY 4.0). Bewusst ohne zod: Übersetzung und Format laufen auch im Browser.
import { lokalesDatum, tageDifferenz } from '@/lib/datum'

/** Open-Meteo rechnet 16 Tage voraus; ab etwa zwei Wochen ist die Vorhersage für Touren kaum brauchbar. */
export const WETTER_TAGE_VORAUS = 14
export const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const TAGESWERTE = ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'weather_code', 'wind_speed_10m_max'] as const

export type WetterTag = { datum: string; tMax: number; tMin: number; niederschlagMm: number; code: number; windKmh: number }
export type WetterAntwort = { tage: WetterTag[]; hoehe?: number }

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/

/** Hin- und Rückdatum, soweit sie zwischen heute und 14 Tagen voraus liegen; jedes Datum einmal. */
export function wetterDaten(datum: string, rueck: string, heute: string = lokalesDatum(new Date())): string[] {
  const passt = (d: string) => {
    if (!ISO_DATUM.test(d)) return false
    const n = tageDifferenz(heute, d)
    return n >= 0 && n <= WETTER_TAGE_VORAUS
  }
  return [...new Set([datum, rueck])].filter(passt)
}

/** WMO-Wettercode (Open-Meteo `weather_code`) als Symbol und kurzer Text. */
export function wetterCode(code: number): { symbol: string; text: string } {
  if (code === 0) return { symbol: '☀️', text: 'sonnig' }
  if (code === 1) return { symbol: '🌤️', text: 'überwiegend sonnig' }
  if (code === 2) return { symbol: '⛅', text: 'teils bewölkt' }
  if (code === 3) return { symbol: '☁️', text: 'bedeckt' }
  if (code === 45 || code === 48) return { symbol: '🌫️', text: 'Nebel' }
  if (code >= 51 && code <= 55) return { symbol: '🌦️', text: 'Nieselregen' }
  if (code === 56 || code === 57) return { symbol: '🌧️', text: 'gefrierender Niesel' }
  if (code >= 61 && code <= 65) return { symbol: '🌧️', text: 'Regen' }
  if (code === 66 || code === 67) return { symbol: '🌧️', text: 'gefrierender Regen' }
  if (code >= 71 && code <= 75) return { symbol: '🌨️', text: 'Schneefall' }
  if (code === 77) return { symbol: '🌨️', text: 'Schneegriesel' }
  if (code >= 80 && code <= 82) return { symbol: '🌦️', text: 'Regenschauer' }
  if (code === 85 || code === 86) return { symbol: '🌨️', text: 'Schneeschauer' }
  if (code === 95) return { symbol: '⛈️', text: 'Gewitter' }
  if (code === 96 || code === 99) return { symbol: '⛈️', text: 'Gewitter mit Hagel' }
  return { symbol: '·', text: 'keine Angabe' }
}

export function openMeteoUrl(o: { lat: number; lon: number; hoehe?: number; von: string; bis: string }): string {
  const q = new URLSearchParams({
    latitude: String(o.lat),
    longitude: String(o.lon),
    ...(o.hoehe !== undefined && { elevation: String(o.hoehe) }),
    daily: TAGESWERTE.join(','),
    timezone: 'Europe/Berlin',
    start_date: o.von,
    end_date: o.bis,
  })
  return `${OPEN_METEO_URL}?${q.toString()}`
}

const zahl = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Tageswerte aus der Spalten-Antwort von Open-Meteo, nur für die gewünschten Daten und nur vollständige Tage. */
export function wetterAusOpenMeteo(json: unknown, daten: string[]): WetterTag[] {
  const d = (json as { daily?: Record<string, unknown[]> } | null)?.daily
  if (!d || !Array.isArray(d.time)) return []
  const spalte = (k: (typeof TAGESWERTE)[number], n: number) => (Array.isArray(d[k]) ? d[k][n] : undefined)
  const tage: WetterTag[] = []
  d.time.forEach((t, n) => {
    if (typeof t !== 'string' || !daten.includes(t)) return
    const [tMax, tMin, niederschlagMm, code, windKmh] = TAGESWERTE.map((k) => spalte(k, n))
    if (![tMax, tMin, niederschlagMm, code, windKmh].every(zahl)) return
    tage.push({ datum: t, tMax: tMax as number, tMin: tMin as number, niederschlagMm: niederschlagMm as number, code: code as number, windKmh: windKmh as number })
  })
  return tage
}

/** "−12 bis 1 °C · 6,6 mm · Wind bis 5 km/h" */
export function wetterKurz(t: WetterTag): string {
  const grad = (v: number) => String(Math.round(v) || 0).replace('-', '−')
  const regen = t.niederschlagMm > 0 ? `${t.niederschlagMm.toFixed(1).replace('.', ',')} mm` : 'trocken'
  return `${grad(t.tMin)} bis ${grad(t.tMax)} °C · ${regen} · Wind bis ${Math.round(t.windKmh)} km/h`
}
