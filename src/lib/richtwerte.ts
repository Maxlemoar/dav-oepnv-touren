import type { Document } from 'yaml'
import type { Gebiet, Haltestelle, Land, Richtwert, Startort, Takt, TicketTabelle } from './content/schema'
import { lokaleMinuten, tageAddieren } from './datum'
import { tagesklasse, type Tagesklasse } from './saison'
import type { Itinerary } from './verbindung/transitous'
import { waehleHinfahrt, kurzfassung } from './verbindung/auswerten'
import { ticketFuer } from './verbindung/regeln'

const TAKT_FENSTER = { von: 6 * 60, bis: 12 * 60 } as const

/** Takt aus der Zahl verschiedener Abfahrten zwischen 6 und 12 Uhr lokal. */
export function taktAus(its: Itinerary[]): Takt {
  const abfahrten = new Set(
    its.map((i) => lokaleMinuten(i.startTime)).filter((m) => m >= TAKT_FENSTER.von && m < TAKT_FENSTER.bis),
  )
  if (abfahrten.size >= 5) return 'stuendlich'
  if (abfahrten.size >= 3) return 'zweistuendlich'
  return 'unregelmaessig'
}

/** Richtwert aus der Hinfahrt, die auch die Seite wählen würde; undefined ohne Hinfahrt im Frühfenster. */
export function richtwertAus(its: Itinerary[], land: Land, tickets: TicketTabelle, heute: string): Richtwert | undefined {
  const { hinfahrt } = waehleHinfahrt(its, { nahverkehrBevorzugen: land === 'DE' })
  if (!hinfahrt) return undefined
  const k = kurzfassung(hinfahrt)
  return {
    fahrzeitMin: k.dauerMin,
    umstiege: k.umstiege,
    takt: taktAus(its),
    ticket: ticketFuer(land, k.fernverkehr, tickets).ticket,
    berechnetAm: heute,
  }
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(a))
}

const WOCHENTAG: Record<Tagesklasse, number> = { werktag: 5, sa: 6, so: 0 }
export const TAGESKLASSEN: Tagesklasse[] = ['werktag', 'sa', 'so']

/**
 * Referenztage für den Musterfahrplan: nächster Freitag (Werktag), Samstag und Sonntag nach heute, die keine
 * Feiertage sind und nicht nach liveBis liegen. Überschreibungen müssen zur Tagesklasse passen.
 */
export function referenzTage(heute: string, liveBis: string, ueber: Partial<Record<Tagesklasse, string>> = {}): Record<Tagesklasse, string> {
  const tage = {} as Record<Tagesklasse, string>
  for (const k of TAGESKLASSEN) {
    const vorgabe = ueber[k]
    if (vorgabe) {
      if (tagesklasse(vorgabe) !== k) throw new Error(`--${k} ${vorgabe} gehört nicht zur Tagesklasse ${k}`)
      tage[k] = vorgabe
      continue
    }
    let d = tageAddieren(heute, 1)
    while (new Date(`${d}T12:00:00Z`).getUTCDay() !== WOCHENTAG[k] || tagesklasse(d) !== k) d = tageAddieren(d, 1)
    if (d > liveBis) throw new Error(`Nächster Tag für ${k} (${d}) liegt nach liveBis ${liveBis}; bitte mit --${k} JJJJ-MM-TT vorgeben`)
    tage[k] = d
  }
  return tage
}

/** Hauptzugänge: Haltestellen, die erster Zugang eines Gebiets sind (je einmal), mit den sichtbaren Startorten. */
export function hauptzugaenge(gebiete: Gebiet[], haltestellen: Haltestelle[], startorte: Startort[]): { haltestelle: Haltestelle; startort: Startort }[] {
  const ids = [...new Set(gebiete.map((g) => g.haltestellen[0]))]
  const sichtbar = startorte.filter((s) => s.sichtbar)
  return ids.flatMap((id) => {
    const haltestelle = haltestellen.find((h) => h.id === id)
    return haltestelle ? sichtbar.map((startort) => ({ haltestelle, startort })) : []
  })
}

/** Richtwert-Felder einzeln setzen, damit Reihenfolge und Formatierung in der Datei erhalten bleiben. */
export function richtwertSchreiben(dok: Document, startortId: string, werte: Richtwert): void {
  for (const [k, v] of Object.entries(werte)) if (v !== undefined) dok.setIn(['richtwerte', startortId, k], v)
}
