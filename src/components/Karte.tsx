'use client'
import { useEffect, useRef, useState } from 'react'
import { Map as MlMap, NavigationControl, Popup, type MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { STUFE_FARBE } from '@/lib/stufe'
import type { KarteGeoJson } from '@/lib/karte'
import { minutenAlsDauer } from '@/lib/datum'

const STIL = 'https://tiles.openfreemap.org/styles/liberty'
const OFFENBURG: [number, number] = [7.946, 48.476]
const OHNE_STUFE = '#7a8078'

type Props = { gebietIds: string[]; uebersicht: Record<string, boolean | undefined> }

/** MapLibre-Karte mit Gebieten (Farbe nach Reisezeitstufe) und Hütten ab Zoom 9; Daten aus /karte.json. */
export function Karte({ gebietIds, uebersicht }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const karte = useRef<MlMap | null>(null)
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
      m.addSource('ziele', { type: 'geojson', data: fc })
      m.addSource('start', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: OFFENBURG }, properties: {} }] },
      })
      m.addLayer({
        id: 'start', type: 'circle', source: 'start',
        paint: { 'circle-radius': 7, 'circle-color': '#1b1f1c', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
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
          const p = f.properties as Record<string, string | number | null>
          const pfad = p.typ === 'gebiet' ? `/gebiet/${p.id}` : `/huette/${p.id}`
          const meta = p.typ === 'gebiet'
            ? (p.fahrzeitMin ? `ca. ${minutenAlsDauer(Number(p.fahrzeitMin))}` : '')
            : `${p.hoehe} m`
          new Popup({ offset: 12, closeButton: false })
            .setLngLat(f.geometry.coordinates as [number, number])
            .setHTML(`<a href="${pfad}" class="font-semibold text-tanne underline">${escapeHtml(String(p.name))}</a><div class="text-xs text-tinte-2">${meta}</div>`)
            .addTo(m)
        })
        m.on('mouseenter', ebene, () => { m.getCanvas().style.cursor = 'pointer' })
        m.on('mouseleave', ebene, () => { m.getCanvas().style.cursor = '' })
      }
      setBereit(true)
    })

    const beobachter = new ResizeObserver(() => m.resize())
    beobachter.observe(container.current)

    return () => {
      beobachter.disconnect()
      m.remove()
      karte.current = null
      setBereit(false)
    }
  }, [])

  useEffect(() => {
    const m = karte.current
    if (bereit && m && m.getLayer('gebiete')) wendeFilterAn(m, gebietIds)
  }, [bereit, gebietIds, uebersicht])

  return <div ref={container} className="h-full w-full" role="region" aria-label="Karte der Ziele" />
}

function wendeFilterAn(m: MlMap, gebietIds: string[]) {
  const ids = gebietIds.length ? gebietIds : ['__keine__']
  m.setFilter('gebiete', ['all', ['==', ['get', 'typ'], 'gebiet'], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('gebiete-label', ['all', ['==', ['get', 'typ'], 'gebiet'], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('huetten', ['all', ['==', ['get', 'typ'], 'huette'], ['in', ['get', 'gebietId'], ['literal', ids]]])
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)
}
