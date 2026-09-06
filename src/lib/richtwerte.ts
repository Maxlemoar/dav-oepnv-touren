import type { Land, Richtwert, Takt, TicketTabelle } from './content/schema'
import { lokaleMinuten } from './datum'
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
  const { hinfahrt } = waehleHinfahrt(its)
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
