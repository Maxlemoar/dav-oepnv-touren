'use client'
import { useEffect, useId, useRef, useState } from 'react'
import {
  LngLatBounds, Map as MlMap, NavigationControl, Popup, setWorkerUrl,
  type ExpressionSpecification, type GeoJSONSource, type MapGeoJSONFeature,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { hoverHtml, type KarteDaten, type PunktEigenschaften } from '@/lib/karte-ausgangsorte'
import { STUFE_FARBE, type Stufe } from '@/lib/stufe'
import { KartePlatzhalter } from '@/components/KartePlatzhalter'

const STIL = 'https://tiles.openfreemap.org/styles/liberty'
// Worker als eigene Datei (siehe scripts/maplibre-worker.ts): Turbopack löst die interne Worker-URL sonst falsch auf.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
const OFFENBURG: [number, number] = [7.946, 48.476]
const GRAU = '#7a8078'
/** Unter dieser Höhe (Kartenstreifen auf dem Handy) entfällt die Legende. */
const KLEIN_PX = 240

const STUFENFARBE: ExpressionSpecification = ['match', ['get', 'stufe'], 2, STUFE_FARBE[2], 3, STUFE_FARBE[3], 4, STUFE_FARBE[4], 5, STUFE_FARBE[5], GRAU]

type Props = {
  daten: KarteDaten
  /** Mehrere Tage: Farben nach Fahrzeit statt nach Zeit vor Ort (nur für die Legende). */
  mehrtaegig: boolean
  /** Gebiets-id des geöffneten Orts: seine Strecke tritt hervor, die übrigen zurück. */
  auswahl?: string
  /** Lage des gewählten Orts, falls er (noch) keinen Punkt hat, etwa ohne gewähltes Datum. */
  auswahlLage?: [number, number]
  onWahl: (id: string) => void
}

/**
 * Karte der Ausgangsorte: Punkte nach Stufe gefärbt, Strecken passender Orte in derselben Farbe (mehr Zeit vor Ort oben),
 * Offenburg als Start. Maus: Überfahren zeigt das Popup, Klick öffnet den Ort. Touch (kein Hover): erstes Antippen zeigt
 * das Popup, zweites Antippen desselben Punkts oder Antippen des Popups öffnet den Ort; Tippen daneben schließt es.
 */
export function AusgangsortKarte({ daten, mehrtaegig, auswahl, auswahlLage, onWahl }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const karte = useRef<MlMap | null>(null)
  // Die Handler werden einmal registriert und lesen die aktuellen Props über Refs.
  const datenRef = useRef(daten)
  const onWahlRef = useRef(onWahl)
  const auswahlRef = useRef({ auswahl, auswahlLage })
  useEffect(() => {
    datenRef.current = daten
    onWahlRef.current = onWahl
    auswahlRef.current = { auswahl, auswahlLage }
  }, [daten, onWahl, auswahl, auswahlLage])
  const hinweisId = useId()
  const [bereit, setBereit] = useState(false)
  const [klein, setKlein] = useState(false)

  useEffect(() => {
    if (!container.current || karte.current) return
    const m = new MlMap({
      container: container.current, style: STIL, center: [8.2, 47.4], zoom: 6.3,
      attributionControl: { compact: true },
    })
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    karte.current = m
    const touch = window.matchMedia('(hover: none)').matches
    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 12, maxWidth: '280px', className: touch ? '' : 'pointer-events-none' })
    let popupId: string | null = null
    let geladen = false

    function zeige(f: MapGeoJSONFeature) {
      if (f.geometry.type !== 'Point') return
      const p = f.properties as PunktEigenschaften
      const id = String(p.id)
      popup.setLngLat(f.geometry.coordinates as [number, number])
        .setHTML(hoverHtml(p) + (touch ? '<div class="mt-1 text-xs font-medium text-tanne">Antippen öffnet den Ort</div>' : ''))
        .addTo(m)
      popupId = id
      if (touch) popup.getElement().addEventListener('click', () => waehle(id))
    }
    function schliesse() {
      popup.remove()
      popupId = null
    }
    function waehle(id: string) {
      schliesse()
      onWahlRef.current(id)
    }

    m.on('load', () => {
      if (karte.current !== m) return
      const d = datenRef.current
      m.addSource('linien', { type: 'geojson', data: d.linien })
      m.addSource('punkte', { type: 'geojson', data: d.punkte })
      m.addSource('start', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: OFFENBURG }, properties: { name: 'Offenburg' } }] },
      })
      m.addLayer({
        id: 'linien', type: 'line', source: 'linien',
        layout: { 'line-join': 'round', 'line-cap': 'round', 'line-sort-key': ['get', 'rang'] },
        paint: { 'line-color': STUFENFARBE, 'line-width': 3, 'line-opacity': 0.9 },
      })
      m.addLayer({
        id: 'punkte', type: 'circle', source: 'punkte',
        layout: { 'circle-sort-key': ['get', 'rang'] },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, ['case', ['get', 'passt'], 6, 3.5], 10, ['case', ['get', 'passt'], 10, 6]],
          'circle-color': ['case', ['get', 'passt'], STUFENFARBE, GRAU],
          'circle-stroke-color': '#fff', 'circle-stroke-width': ['case', ['get', 'passt'], 2, 1],
        },
      })
      // Unsichtbare, größere Trefferfläche, damit kleine Punkte auch mit dem Finger zu treffen sind. Gleiche Reihenfolge wie
      // die Punkte: Überlappen sich Flächen, gewinnt der oben gezeichnete (passende, mehr Zeit vor Ort, die Auswahl).
      m.addLayer({
        id: 'punkte-treffer', type: 'circle', source: 'punkte',
        layout: { 'circle-sort-key': ['get', 'rang'] },
        paint: { 'circle-radius': 14, 'circle-opacity': 0 },
      })
      m.addLayer({
        id: 'punkte-label', type: 'symbol', source: 'punkte', minzoom: 7,
        layout: {
          'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.2], 'text-anchor': 'top',
          'text-font': ['Noto Sans Regular'], 'symbol-sort-key': ['-', ['get', 'rang']],
        },
        paint: { 'text-color': '#1b1f1c', 'text-halo-color': '#f7f6f2', 'text-halo-width': 1.5 },
      })
      m.addLayer({
        id: 'start', type: 'circle', source: 'start',
        paint: { 'circle-radius': 7, 'circle-color': '#1b1f1c', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
      })
      m.addLayer({
        id: 'start-label', type: 'symbol', source: 'start',
        layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.2], 'text-anchor': 'top', 'text-font': ['Noto Sans Regular'] },
        paint: { 'text-color': '#1b1f1c', 'text-halo-color': '#f7f6f2', 'text-halo-width': 1.5 },
      })

      if (!touch) {
        m.on('mousemove', 'punkte-treffer', (e) => {
          m.getCanvas().style.cursor = 'pointer'
          const f = e.features?.[0]
          if (f && String(f.properties.id) !== popupId) zeige(f)
        })
        m.on('mouseleave', 'punkte-treffer', () => {
          m.getCanvas().style.cursor = ''
          schliesse()
        })
      }
      m.on('click', (e) => {
        const f = m.queryRenderedFeatures(e.point, { layers: ['punkte-treffer'] })[0]
        if (!f) {
          if (touch) schliesse()
          return
        }
        const id = String(f.properties.id)
        if (touch && popupId !== id) zeige(f)
        else waehle(id)
      })
      geladen = true
      setBereit(true)
    })

    const beobachter = new ResizeObserver(() => {
      m.resize()
      setKlein(m.getContainer().clientHeight < KLEIN_PX)
      // Streifen → große Karte (oder umgekehrt): den gewählten Ort neu einpassen.
      if (geladen) passeAn(m, datenRef.current, auswahlRef.current.auswahl, auswahlRef.current.auswahlLage, false)
    })
    beobachter.observe(container.current)
    const frame = requestAnimationFrame(() => m.resize())

    return () => {
      cancelAnimationFrame(frame)
      beobachter.disconnect()
      popup.remove()
      m.remove()
      karte.current = null
    }
  }, [])

  // Daten: Quellen tauschen, die Karte bleibt.
  useEffect(() => {
    const m = karte.current
    if (!bereit || !m) return
    ;(m.getSource('linien') as GeoJSONSource | undefined)?.setData(daten.linien)
    ;(m.getSource('punkte') as GeoJSONSource | undefined)?.setData(daten.punkte)
  }, [bereit, daten])

  // Auswahl: deren Strecke breit und oben, alles andere tritt zurück.
  useEffect(() => {
    const m = karte.current
    if (!bereit || !m) return
    const ist: ExpressionSpecification = ['==', ['get', 'id'], auswahl ?? '']
    const zurueck = (voll: number): ExpressionSpecification | number => (auswahl ? ['case', ist, voll, 0.2] : voll)
    m.setPaintProperty('linien', 'line-width', auswahl ? ['case', ist, 5, 3] : 3)
    m.setPaintProperty('linien', 'line-opacity', zurueck(0.9))
    m.setLayoutProperty('linien', 'line-sort-key', auswahl ? ['case', ist, 1e6, ['get', 'rang']] : ['get', 'rang'])
    const reihenfolge: ExpressionSpecification = auswahl ? ['case', ist, 1e6, ['get', 'rang']] : ['get', 'rang']
    m.setLayoutProperty('punkte', 'circle-sort-key', reihenfolge)
    m.setLayoutProperty('punkte-treffer', 'circle-sort-key', reihenfolge)
    m.setPaintProperty('punkte', 'circle-opacity', zurueck(1))
    m.setPaintProperty('punkte', 'circle-stroke-opacity', zurueck(1))
    m.setPaintProperty('punkte-label', 'text-opacity', zurueck(1))
  }, [bereit, auswahl])

  // Einpassen nur, wenn sich die Auswahl ändert oder ihre Strecke bzw. ihr Punkt erst erscheint, nicht bei jedem Schieberschritt.
  const hatLinie = !!auswahl && daten.linien.features.some((f) => f.properties.id === auswahl)
  const hatPunkt = !!auswahl && (!!auswahlLage || daten.punkte.features.some((f) => f.properties.id === auswahl))
  useEffect(() => {
    const m = karte.current
    if (!bereit || !m || !auswahl) return
    passeAn(m, datenRef.current, auswahl, auswahlRef.current.auswahlLage, true)
  }, [bereit, auswahl, hatLinie, hatPunkt])

  return (
    <div className="relative h-full w-full" role="region" aria-label="Karte der Ausgangsorte" aria-describedby={hinweisId}>
      <div ref={container} className="h-full w-full" />
      <p id={hinweisId} className="sr-only">Alle Ausgangsorte auch in der Liste. Die Kartenpunkte sind nicht per Tastatur erreichbar.</p>
      {!bereit && <KartePlatzhalter />}
      {!klein && daten.punkte.features.length > 0 && <Legende mehrtaegig={mehrtaegig} />}
    </div>
  )
}

/** Strecke des gewählten Orts plus Offenburg einpassen; ohne Strecke zum Punkt fliegen. */
function passeAn(m: MlMap, daten: KarteDaten, auswahl: string | undefined, auswahlLage: [number, number] | undefined, animiert: boolean) {
  if (!auswahl) return
  const { clientWidth: w, clientHeight: h } = m.getContainer()
  if (!w || !h) return // versteckt (Handy, Liste offen); der ResizeObserver holt es nach
  const rand = Math.max(8, Math.min(48, Math.floor(Math.min(w, h) / 5)))
  const dauer = animiert ? 600 : 0
  const linie = daten.linien.features.find((f) => f.properties.id === auswahl)
  if (linie) {
    const grenzen = new LngLatBounds(OFFENBURG, OFFENBURG)
    for (const teil of linie.geometry.coordinates) for (const c of teil) grenzen.extend(c as [number, number])
    m.fitBounds(grenzen, { padding: rand, maxZoom: 10, duration: dauer })
    return
  }
  const punkt = daten.punkte.features.find((f) => f.properties.id === auswahl)?.geometry.coordinates ?? auswahlLage
  if (punkt) m.flyTo({ center: punkt as [number, number], zoom: Math.max(m.getZoom(), 8.5), duration: dauer })
}

const LEGENDE_TAG: [Stufe, string][] = [[2, '8 h und mehr'], [3, '6 h'], [4, '4 h'], [5, 'weniger']]
const LEGENDE_MEHRTAEGIG: [Stufe, string][] = [[2, 'bis 2 h'], [3, '3 h'], [4, '4 h'], [5, 'über 4 h']]

/** Legende unten links: vier Stufen (Zeit vor Ort bzw. Fahrzeit) und grau für nicht passende Orte. */
function Legende({ mehrtaegig }: { mehrtaegig: boolean }) {
  const stufen = mehrtaegig ? LEGENDE_MEHRTAEGIG : LEGENDE_TAG
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-4rem)] rounded-[var(--radius-knopf)] bg-karte/90 px-2 py-1.5 text-[11px] leading-tight text-tinte-2 shadow-[var(--shadow-karte)]">
      <p className="font-medium text-tinte">{mehrtaegig ? 'Fahrzeit ab Offenburg' : 'Zeit vor Ort'}</p>
      <ul className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {stufen.map(([s, text]) => (
          <li key={s} className="inline-flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full border border-white" style={{ background: STUFE_FARBE[s] }} aria-hidden />{text}
          </li>
        ))}
        <li className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full border border-white" style={{ background: GRAU }} aria-hidden />passt nicht
        </li>
      </ul>
    </div>
  )
}
