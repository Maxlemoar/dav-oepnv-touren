// Bewusst ohne zod und ohne MapLibre: reine Aufbereitung der Kartendaten, läuft im Browser und in Tests.
import type { Feature, FeatureCollection, MultiLineString, Point } from 'geojson'
import { vorOrtStufe, type Bewertung } from './bewertung'
import { minutenAlsDauer } from './datum'
import type { Ausgangsort, Fahrt, Linie } from './musterfahrplan/typen'
import { reisezeitStufe, type Stufe } from './stufe'
import { alsMin, alsUhrzeit } from './zeitfenster'
import { naechteText } from './zeitraum'

export type PunktEigenschaften = {
  id: string
  name: string
  passt: boolean
  /** Farbstufe passender Orte; `null` bei nicht passenden (grau). */
  stufe: Stufe | null
  /** Zeichenreihenfolge: Minuten vor Ort, nicht passende -1. Höher liegt oben. */
  rang: number
  /** Hin, zurück und Zeit vor Ort (bzw. Nächte) oder der Grund, warum der Ort nicht passt. */
  zeile: string
}
export type LinienEigenschaften = { id: string; stufe: Stufe; rang: number }
export type KarteDaten = {
  punkte: FeatureCollection<Point, PunktEigenschaften>
  linien: FeatureCollection<MultiLineString, LinienEigenschaften>
}

/** "06:12" → "6:12" */
function uhrzeit(hhmm: string): string {
  const m = alsMin(hhmm)
  return m === undefined ? hhmm : alsUhrzeit(m)
}
const fahrtText = (f: Fahrt) => `${uhrzeit(f.ab)} → ${uhrzeit(f.an)}`

/** Fahrzeit für die Farbe bei mehreren Tagen: Richtwert, sonst die Dauer der gewählten Hinfahrt. */
function fahrzeit(ort: Ausgangsort, hin: Fahrt): number {
  if (ort.fahrzeitMin !== undefined) return ort.fahrzeitMin
  const ab = alsMin(hin.ab)
  const an = alsMin(hin.an)
  return ab === undefined || an === undefined ? Number.POSITIVE_INFINITY : an - ab
}

/**
 * Punkte je bewertetem Ausgangsort und die Strecken der passenden. Tagestour: Farbe nach Zeit vor Ort (`vorOrtStufe`),
 * mehrere Tage: nach Fahrzeit (`reisezeitStufe`). Ohne Bewertungen (kein Datum gewählt) bleibt die Karte leer.
 * `strecken` ist nach Haltestellen-id geschlüsselt, `bewertungen` nach Gebiets-id.
 */
export function karteDaten(
  orte: Ausgangsort[],
  strecken: Record<string, Linie[]>,
  bewertungen: Record<string, Bewertung> | null,
  mehrtaegig: boolean,
): KarteDaten {
  const punkte: Feature<Point, PunktEigenschaften>[] = []
  const linien: Feature<MultiLineString, LinienEigenschaften>[] = []
  if (bewertungen) {
    for (const ort of orte) {
      const b = bewertungen[ort.id]
      if (!b) continue
      const geometry: Point = { type: 'Point', coordinates: [ort.lon, ort.lat] }
      if (!b.passt) {
        punkte.push({ type: 'Feature', geometry, properties: { id: ort.id, name: ort.name, passt: false, stufe: null, rang: -1, zeile: b.grund } })
        continue
      }
      const stufe = mehrtaegig ? reisezeitStufe(fahrzeit(ort, b.hin)) : vorOrtStufe(b.vorOrtMin)
      const dauer = mehrtaegig ? naechteText(b.naechte) : `${minutenAlsDauer(b.vorOrtMin)} vor Ort`
      const zeile = `${fahrtText(b.hin)} · ${fahrtText(b.rueck)} · ${dauer}`
      punkte.push({ type: 'Feature', geometry, properties: { id: ort.id, name: ort.name, passt: true, stufe, rang: b.vorOrtMin, zeile } })
      const s = strecken[ort.haltestelleId]
      if (s && s.length > 0) {
        linien.push({ type: 'Feature', geometry: { type: 'MultiLineString', coordinates: s }, properties: { id: ort.id, stufe, rang: b.vorOrtMin } })
      }
    }
  }
  return { punkte: { type: 'FeatureCollection', features: punkte }, linien: { type: 'FeatureCollection', features: linien } }
}

/** Popup beim Überfahren: Name fett, darunter die Zeile. */
export function hoverHtml(p: Pick<PunktEigenschaften, 'name' | 'zeile'>): string {
  return `<strong class="font-semibold">${escapeHtml(String(p.name))}</strong>`
    + `<div class="text-xs text-tinte-2">${escapeHtml(String(p.zeile))}</div>`
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)
}
