'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LngLatBounds, Map as MlMap, NavigationControl, Popup, setWorkerUrl, type MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { STUFE_FARBE } from '@/lib/stufe'
import { popupHtml, type KarteGeoJson } from '@/lib/karte'

const STIL = 'https://tiles.openfreemap.org/styles/liberty'
// Worker als eigene Datei (siehe scripts/maplibre-worker.ts): Turbopack löst die interne Worker-URL sonst falsch auf.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
const OFFENBURG: [number, number] = [7.946, 48.476]
const OHNE_STUFE = '#7a8078'

type Props = {
  gebietIds: string[]
  uebersicht: Record<string, boolean | undefined>
  /** Gebiet, auf das die Karte fliegt (aus dem Ergebnisstreifen); ohne Wert bleibt der Ausschnitt. */
  fokusGebiet?: string
  /** Vom Ergebnisstreifen verdeckte Höhe in Pixeln; Punkte bleiben darüber. */
  randUnten?: number
}

/** MapLibre-Karte mit Gebieten (Farbe nach Reisezeitstufe) und Hütten ab Zoom 9; Daten aus /karte.json. */
export function Karte({ gebietIds, uebersicht, fokusGebiet, randUnten = 0 }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const karte = useRef<MlMap | null>(null)
  const daten = useRef<KarteGeoJson | null>(null)
  const router = useRouter()
  // Der Klick-Handler wird einmal registriert; Übersicht und Router deshalb über Refs lesen, nicht aus der Closure.
  const uebersichtRef = useRef(uebersicht)
  const routerRef = useRef(router)
  useEffect(() => { uebersichtRef.current = uebersicht; routerRef.current = router }, [uebersicht, router])
  // Wird nach dem Laden der Ebenen gesetzt, damit der Filter-Effekt mit den aktuellen Props läuft.
  const [bereit, setBereit] = useState(false)

  useEffect(() => {
    if (!container.current || karte.current) return
    const m = new MlMap({
      container: container.current, style: STIL, center: [8.2, 47.4], zoom: 6.3,
      attributionControl: { compact: true },
    })
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    karte.current = m

    m.on('load', async () => {
      let fc: KarteGeoJson
      try {
        fc = (await fetch('/karte.json').then((r) => r.json())) as KarteGeoJson
      } catch {
        return
      }
      if (karte.current !== m) return
      daten.current = fc
      m.addSource('ziele', { type: 'geojson', data: fc })
      m.addSource('start', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: OFFENBURG }, properties: {} }] },
      })
      m.addLayer({
        id: 'start', type: 'circle', source: 'start',
        paint: { 'circle-radius': 7, 'circle-color': '#1b1f1c', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
      })
      // Dunkler Ring hinter dem Punkt markiert Gebiete mit einem Haus der Sektion; das Popup nennt es im Klartext.
      // Eigene Ebene statt Rahmenfarbe, weil ein dunkler Rahmen auf dunkelgrüner Füllung verschwimmt.
      m.addLayer({
        id: 'gebiete-sektion', type: 'circle', source: 'ziele',
        filter: ['all', ['==', ['get', 'typ'], 'gebiet'], ['==', ['get', 'sektionshaus'], true]],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 13, 10, 20],
          'circle-color': '#1b1f1c',
        },
      })
      m.addLayer({
        id: 'gebiete', type: 'circle', source: 'ziele', filter: ['==', ['get', 'typ'], 'gebiet'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 9, 10, 16],
          'circle-color': ['match', ['get', 'stufe'], 2, STUFE_FARBE[2], 3, STUFE_FARBE[3], 4, STUFE_FARBE[4], 5, STUFE_FARBE[5], OHNE_STUFE],
          'circle-stroke-color': '#fff', 'circle-stroke-width': 2, 'circle-opacity': 0.9,
        },
      })
      m.addLayer({
        id: 'gebiete-label', type: 'symbol', source: 'ziele', filter: ['==', ['get', 'typ'], 'gebiet'],
        layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.4], 'text-anchor': 'top', 'text-font': ['Noto Sans Regular'] },
        paint: { 'text-color': '#1b1f1c', 'text-halo-color': '#f7f6f2', 'text-halo-width': 1.5 },
      })
      m.addLayer({
        id: 'huetten', type: 'circle', source: 'ziele', minzoom: 9, filter: ['==', ['get', 'typ'], 'huette'],
        paint: {
          'circle-radius': 6,
          'circle-color': ['match', ['get', 'betreiber'], 'dav', '#2f6b52', 'sac', '#c8102e', OHNE_STUFE],
          'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5,
        },
      })
      for (const ebene of ['gebiete', 'huetten']) {
        m.on('click', ebene, (e: MapLayerMouseEvent) => {
          const f = e.features?.[0]
          if (!f || f.geometry.type !== 'Point') return
          const p = f.properties as Record<string, string | number | boolean | null>
          const pfad = p.typ === 'gebiet' ? `/gebiet/${p.id}` : `/huette/${p.id}`
          const popup = new Popup({ offset: 12, closeButton: false })
            .setLngLat(f.geometry.coordinates as [number, number])
            .setHTML(popupHtml(pfad, p, uebersichtRef.current[String(p.id)]))
            .addTo(m)
          // Link im Popup per Router öffnen statt mit vollem Seitenneuladen.
          popup.getElement().addEventListener('click', (ev) => {
            const a = (ev.target as HTMLElement).closest('a')
            if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return
            ev.preventDefault()
            routerRef.current.push(a.getAttribute('href') ?? pfad)
          })
        })
        m.on('mouseenter', ebene, () => { m.getCanvas().style.cursor = 'pointer' })
        m.on('mouseleave', ebene, () => { m.getCanvas().style.cursor = '' })
      }
      setBereit(true)
    })

    const beobachter = new ResizeObserver(() => m.resize())
    beobachter.observe(container.current)
    const frame = requestAnimationFrame(() => m.resize())

    return () => {
      cancelAnimationFrame(frame)
      beobachter.disconnect()
      m.remove()
      karte.current = null
    }
  }, [])

  const gebietSchluessel = gebietIds.join(',')
  useEffect(() => {
    const m = karte.current
    if (!bereit || !m || !m.getLayer('gebiete') || !m.getLayer('gebiete-sektion')) return
    const ids = gebietSchluessel ? gebietSchluessel.split(',') : []
    wendeFilterAn(m, ids)
    zoomeAufGebiete(m, daten.current, ids, randUnten)
  }, [bereit, gebietSchluessel, randUnten])

  useEffect(() => {
    const m = karte.current
    if (!bereit || !m || !fokusGebiet) return
    const f = daten.current?.features.find((x) => x.properties.typ === 'gebiet' && x.properties.id === fokusGebiet)
    if (!f) return
    // Ziel um die halbe Streifenhöhe nach oben versetzen, damit es nicht hinter den Karten liegt.
    m.flyTo({ center: f.geometry.coordinates, zoom: Math.max(m.getZoom(), 8.5), offset: [0, -randUnten / 2], duration: 500 })
  }, [bereit, fokusGebiet, randUnten])

  return <div ref={container} className="h-full w-full" role="region" aria-label="Karte der Ziele" />
}

function wendeFilterAn(m: MlMap, gebietIds: string[]) {
  const ids = gebietIds.length ? gebietIds : ['__keine__']
  m.setFilter('gebiete', ['all', ['==', ['get', 'typ'], 'gebiet'], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('gebiete-sektion', ['all', ['==', ['get', 'typ'], 'gebiet'], ['==', ['get', 'sektionshaus'], true], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('gebiete-label', ['all', ['==', ['get', 'typ'], 'gebiet'], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('huetten', ['all', ['==', ['get', 'typ'], 'huette'], ['in', ['get', 'gebietId'], ['literal', ids]]])
}

/** Kartenausschnitt auf Startort und sichtbare Gebiete legen, damit z.B. eine Suche nach "Schwarzwald" dorthin springt. */
function zoomeAufGebiete(m: MlMap, fc: KarteGeoJson | null, gebietIds: string[], randUnten: number) {
  if (!fc || gebietIds.length === 0) return
  const ids = new Set(gebietIds)
  const grenzen = new LngLatBounds(OFFENBURG, OFFENBURG)
  for (const f of fc.features) {
    if (f.properties.typ === 'gebiet' && ids.has(f.properties.id)) grenzen.extend(f.geometry.coordinates)
  }
  m.fitBounds(grenzen, { padding: { top: 48, right: 48, bottom: 48 + randUnten, left: 48 }, maxZoom: 9.5, duration: 600 })
}
