// Bewusst ohne zod und ohne Laufzeit-Importe: wird auch im Browser gebraucht.
import type { Tagesklasse } from '@/lib/saison'
import type { Land, Ticket, ZeitraumImJahr } from '@/lib/content/schema'

/** Uhrzeiten lokal "HH:MM" (Europe/Berlin). */
export type Fahrt = { ab: string; an: string; umstiege: number; via: string[]; fern: boolean }
export type Tagesplan = { hin: Fahrt[]; rueck: Fahrt[] }
/** Folge von [lon, lat], 5 Nachkommastellen. */
export type Linie = [number, number][]
export type MusterOrt = { plaene: Partial<Record<Tagesklasse, Tagesplan>>; strecke?: Linie[] }
export type Musterfahrplan = {
  startortId: string
  berechnetAm: string
  liveBis: string
  referenzTage: Partial<Record<Tagesklasse, string>>
  /** Schlüssel: Haltestellen-id des Hauptzugangs */
  orte: Record<string, MusterOrt>
}
export type Ausgangsort = {
  /** Gebiets-id, zugleich Pfad /gebiet/<id> */
  id: string
  haltestelleId: string
  name: string
  gebiet: string
  region: string
  land: Land
  lat: number
  lon: number
  ticket?: Ticket
  fahrzeitMin?: number
  bedient?: ZeitraumImJahr[]
}
