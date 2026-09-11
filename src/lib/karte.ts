import type { Inhalt } from './content/laden'
import { istSektionshaus, SPORTART_LABEL, type Sportart } from './content/schema'
import { minutenAlsDauer } from './datum'
import { reisezeitStufe, type Stufe } from './stufe'

export type KarteFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties:
    | { typ: 'gebiet'; id: string; name: string; fahrzeitMin: number | null; stufe: Stufe | null; sportarten: string; huetten: number; sektionshaus: boolean }
    | { typ: 'huette'; id: string; name: string; betreiber: string; gebietId: string; hoehe: number }
}
export type KarteGeoJson = { type: 'FeatureCollection'; features: KarteFeature[] }

/** Punkte aller Gebiete und Hütten; Fahrzeit und Stufe aus dem Richtwert der ersten Haltestelle ab `startortId`. */
export function karteGeoJson(i: Inhalt, startortId: string): KarteGeoJson {
  const gebiete: KarteFeature[] = i.gebiete.map((g) => {
    const h = i.haltestellen.find((x) => x.id === g.haltestellen[0])
    const r = h?.richtwerte[startortId]
    const huetten = i.huetten.filter((x) => x.gebietId === g.id)
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [g.lon, g.lat] },
      properties: {
        typ: 'gebiet', id: g.id, name: g.name,
        fahrzeitMin: r?.fahrzeitMin ?? null, stufe: r ? reisezeitStufe(r.fahrzeitMin) : null,
        sportarten: g.sportarten.join(','), huetten: huetten.length, sektionshaus: huetten.some(istSektionshaus),
      },
    }
  })
  const huetten: KarteFeature[] = i.huetten.map((h) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [h.lon, h.lat] },
    properties: { typ: 'huette', id: h.id, name: h.name, betreiber: h.betreiber.typ, gebietId: h.gebietId, hoehe: h.hoehe },
  }))
  return { type: 'FeatureCollection', features: [...gebiete, ...huetten] }
}

/**
 * Popup-Inhalt: Name als Link, darunter Fahrzeit, Sportarten und Tagesziel-Urteil (Gebiete) bzw. Höhe (Hütten).
 * `tagesziel` undefined (Übersicht noch nicht geladen) lässt die Zeile weg.
 */
export function popupHtml(pfad: string, p: Record<string, string | number | boolean | null | undefined>, tagesziel: boolean | undefined): string {
  const zeilen: string[] = []
  if (p.typ === 'gebiet') {
    if (p.fahrzeitMin) zeilen.push(`ca. ${minutenAlsDauer(Number(p.fahrzeitMin))}`)
    const sportarten = String(p.sportarten ?? '').split(',').filter((s): s is Sportart => s in SPORTART_LABEL).map((s) => SPORTART_LABEL[s])
    if (sportarten.length) zeilen.push(sportarten.join(', '))
    if (p.sektionshaus === true) zeilen.push('Haus der Sektion')
    if (tagesziel === true) zeilen.push('Tagesziel')
    if (tagesziel === false) zeilen.push('Besser mit Übernachtung')
  } else {
    zeilen.push(`${p.hoehe} m`)
  }
  return `<a href="${pfad}" class="font-semibold text-tanne underline">${escapeHtml(String(p.name))}</a>`
    + zeilen.map((z) => `<div class="text-xs text-tinte-2">${escapeHtml(z)}</div>`).join('')
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)
}
