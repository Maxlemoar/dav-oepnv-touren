// Bewusst ohne zod: Aufzählungen und Beschriftungen, die auch im Browser gebraucht werden.
// schema.ts baut daraus die Zod-Schemas und exportiert alles weiter; Client-Komponenten importieren nur von hier.
import type { Huette, Land } from './schema'

export const SPORTARTEN = ['wandern', 'hochtour', 'skitour', 'klettern', 'klettersteig', 'schneeschuh'] as const
export const SAISONS = ['sommer', 'winter', 'ganzjaehrig'] as const
export const TICKETS = ['deutschlandticket', 'halbtax', 'europass', 'keins'] as const
export const BETREIBER_TYPEN = ['dav', 'sac', 'oeav', 'caf', 'naturfreunde', 'privat'] as const
export const TOUR_ANBIETER = ['alpenvereinaktiv', 'sac', 'komoot', 'sonstig'] as const

export type Sportart = (typeof SPORTARTEN)[number]
export type Saison = (typeof SAISONS)[number]
export type Ticket = (typeof TICKETS)[number]
export type BetreiberTyp = (typeof BETREIBER_TYPEN)[number]
export type TourAnbieter = (typeof TOUR_ANBIETER)[number]

/** Sektion, deren Häuser auf der Seite hervorgehoben werden. */
export const EIGENE_SEKTION = 'Offenburg'

export function istSektionshaus(h: Pick<Huette, 'betreiber'>): boolean {
  return h.betreiber.typ === 'dav' && h.betreiber.sektion === EIGENE_SEKTION
}

export const SPORTART_LABEL: Record<Sportart, string> = {
  wandern: 'Wandern', hochtour: 'Hochtour', skitour: 'Skitour',
  klettern: 'Klettern', klettersteig: 'Klettersteig', schneeschuh: 'Schneeschuh',
}
export const SAISON_LABEL: Record<Saison, string> = {
  sommer: 'Sommer', winter: 'Winter', ganzjaehrig: 'ganzjährig',
}
export const BETREIBER_LABEL: Record<BetreiberTyp, string> = {
  dav: 'DAV', sac: 'SAC', oeav: 'ÖAV', caf: 'CAF', naturfreunde: 'Naturfreunde', privat: 'privat',
}
export const TOUR_ANBIETER_LABEL: Record<TourAnbieter, string> = {
  alpenvereinaktiv: 'Alpenvereinaktiv', sac: 'SAC-Tourenportal', komoot: 'komoot', sonstig: 'Tourenportal',
}
export const TICKET_LABEL: Record<Ticket, string> = {
  deutschlandticket: 'Deutschlandticket', halbtax: 'Halbtax', europass: 'Europass', keins: 'Einzelticket',
}
export const LAND_LABEL: Record<Land, string> = {
  DE: 'Deutschland', FR: 'Frankreich', CH: 'Schweiz', AT: 'Österreich',
}
