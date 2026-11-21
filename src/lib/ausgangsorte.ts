import type { Inhalt } from './content/laden'
import type { Tagesklasse } from './saison'
import type { Ausgangsort, Linie, Musterfahrplan, Tagesplan } from './musterfahrplan/typen'

/** Je Gebiet der Hauptzugang (erste Haltestelle) mit Richtwert ab `startortId`. Gebiete ohne vorhandene Haltestelle entfallen. */
export function ausgangsorte(i: Inhalt, startortId: string): Ausgangsort[] {
  const orte: Ausgangsort[] = []
  for (const g of i.gebiete) {
    const h = i.haltestellen.find((x) => x.id === g.haltestellen[0])
    if (!h) continue
    const r = h.richtwerte[startortId]
    orte.push({
      id: g.id,
      haltestelleId: h.id,
      name: h.name,
      gebiet: g.name,
      region: h.region,
      land: h.land,
      lat: h.lat,
      lon: h.lon,
      ...(r ? { ticket: r.ticket, fahrzeitMin: r.fahrzeitMin } : {}),
      ...(h.bedient ? { bedient: h.bedient } : {}),
    })
  }
  return orte
}

/** `strecken` ist nach Haltestellen-id (`Ausgangsort.haltestelleId`) geschlüsselt, wie die Tagespläne. */
export type AusgangsortDatei = { liveBis: string; berechnetAm?: string; orte: Ausgangsort[]; strecken: Record<string, Linie[]> }

export function ausgangsortDatei(orte: Ausgangsort[], m: Musterfahrplan | undefined, liveBis: string): AusgangsortDatei {
  const strecken: Record<string, Linie[]> = {}
  for (const o of orte) {
    const s = m?.orte[o.haltestelleId]?.strecke
    if (s && s.length > 0) strecken[o.haltestelleId] = s
  }
  return { liveBis, ...(m ? { berechnetAm: m.berechnetAm } : {}), orte, strecken }
}

/** Tagesplan je Haltestellen-id für eine Tagesklasse. `via` bleibt leer: nur der serverseitige Rückfall braucht die Namen. */
export function tagesplanDatei(m: Musterfahrplan | undefined, klasse: Tagesklasse): Record<string, Tagesplan> {
  const aus: Record<string, Tagesplan> = {}
  if (!m) return aus
  for (const [id, ort] of Object.entries(m.orte)) {
    const p = ort.plaene[klasse]
    if (!p) continue
    const leer = (fs: Tagesplan['hin']) => fs.map((f) => ({ ...f, via: [] }))
    aus[id] = { hin: leer(p.hin), rueck: leer(p.rueck) }
  }
  return aus
}
