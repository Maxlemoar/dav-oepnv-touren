import { NextResponse } from 'next/server'
import { findeGebiet, findeHuette, huettenImGebiet, inhalt } from '@/lib/content/laden'
import { openMeteoUrl, wetterAusOpenMeteo, wetterDaten, type WetterAntwort } from '@/lib/wetter'

/** Vorhersagen ändern sich über den Tag; drei Stunden im CDN halten die Abfragen bei Open-Meteo klein (Limit pro IP). */
const CACHE = 'public, s-maxage=10800, stale-while-revalidate=3600'
const CACHE_KURZ = 'public, s-maxage=300'
const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/

/**
 * Wetter am Hin- und Rückdatum für eine Hütte (Höhe der Hütte) oder ein Gebiet (Höhe der ersten Hütte, sonst die des
 * Geländemodells). Der Ort kommt aus den Inhalten, nicht aus der Anfrage: keine freien Koordinaten, besserer Cache.
 * Daten über 14 Tage voraus oder in der Vergangenheit liefern leere `tage`.
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const datum = sp.get('datum') ?? ''
  const rueck = sp.get('rueck') || datum
  if (!ISO_DATUM.test(datum) || !ISO_DATUM.test(rueck)) return NextResponse.json({ fehler: 'datum fehlt oder ist ungültig' }, { status: 400 })
  if (rueck < datum) return NextResponse.json({ fehler: 'rueck darf nicht vor datum liegen' }, { status: 400 })

  const i = inhalt()
  const huetteId = sp.get('huette')
  const gebietId = sp.get('gebiet')
  let ort: { lat: number; lon: number; hoehe?: number } | undefined
  if (huetteId) {
    const h = findeHuette(i, huetteId)
    if (h) ort = { lat: h.lat, lon: h.lon, hoehe: h.hoehe }
  } else if (gebietId) {
    const g = findeGebiet(i, gebietId)
    if (g) ort = { lat: g.lat, lon: g.lon, hoehe: huettenImGebiet(i, g.id)[0]?.hoehe }
  }
  if (!ort) return NextResponse.json({ fehler: 'Hütte oder Gebiet unbekannt' }, { status: 404 })

  const daten = wetterDaten(datum, rueck)
  if (daten.length === 0) return NextResponse.json({ tage: [] } satisfies WetterAntwort, { headers: { 'Cache-Control': CACHE } })

  try {
    const r = await fetch(openMeteoUrl({ ...ort, von: daten[0], bis: daten[daten.length - 1] }), { signal: AbortSignal.timeout(8000) })
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`)
    const antwort: WetterAntwort = { tage: wetterAusOpenMeteo(await r.json(), daten), ...(ort.hoehe !== undefined && { hoehe: ort.hoehe }) }
    return NextResponse.json(antwort, { headers: { 'Cache-Control': antwort.tage.length ? CACHE : CACHE_KURZ } })
  } catch (e) {
    return NextResponse.json({ tage: [], fehler: (e as Error).message }, { status: 502, headers: { 'Cache-Control': CACHE_KURZ } })
  }
}
