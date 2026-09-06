import type { Inhalt } from './content/laden'
import { reisezeitStufe, type Stufe } from './stufe'

export type KarteFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties:
    | { typ: 'gebiet'; id: string; name: string; fahrzeitMin: number | null; stufe: Stufe | null; sportarten: string; huetten: number }
    | { typ: 'huette'; id: string; name: string; betreiber: string; gebietId: string; hoehe: number }
}
export type KarteGeoJson = { type: 'FeatureCollection'; features: KarteFeature[] }

/** Punkte aller Gebiete und Hütten; Fahrzeit und Stufe aus dem Richtwert der ersten Haltestelle ab `startortId`. */
export function karteGeoJson(i: Inhalt, startortId: string): KarteGeoJson {
  const gebiete: KarteFeature[] = i.gebiete.map((g) => {
    const h = i.haltestellen.find((x) => x.id === g.haltestellen[0])
    const r = h?.richtwerte[startortId]
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [g.lon, g.lat] },
      properties: {
        typ: 'gebiet', id: g.id, name: g.name,
        fahrzeitMin: r?.fahrzeitMin ?? null, stufe: r ? reisezeitStufe(r.fahrzeitMin) : null,
        sportarten: g.sportarten.join(','), huetten: i.huetten.filter((x) => x.gebietId === g.id).length,
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
