import { z } from 'zod'

const Id = z.string().regex(/^[a-z0-9-]+$/, 'id: nur a-z, 0-9 und Bindestrich')
const Koordinate = { lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }

/** Bahnhof bei bahn.de (Orte-API): extId = EVA-Nummer, x/y = lon/lat × 1e6 wie in der DB-Orts-ID. */
export const BahnOrtSchema = z.object({
  extId: z.string().regex(/^\d+$/, 'extId: nur Ziffern'),
  name: z.string().min(1),
  x: z.number().int(),
  y: z.number().int(),
})

export const SportartSchema = z.enum(['wandern', 'hochtour', 'skitour', 'klettern', 'klettersteig', 'schneeschuh'])
export const SaisonSchema = z.enum(['sommer', 'winter', 'ganzjaehrig'])
export const LandSchema = z.enum(['DE', 'FR', 'CH', 'AT'])
export const TicketSchema = z.enum(['deutschlandticket', 'halbtax', 'europass', 'keins'])
export const TaktSchema = z.enum(['stuendlich', 'zweistuendlich', 'unregelmaessig'])
export const BetreiberTypSchema = z.enum(['dav', 'sac', 'oeav', 'caf', 'naturfreunde', 'privat'])

export const StartortSchema = z.object({
  id: Id,
  name: z.string().min(1),
  haltestelleId: z.string().min(1),
  ...Koordinate,
  sichtbar: z.boolean(),
  bahn: BahnOrtSchema.optional(),
})

export const RichtwertSchema = z.object({
  fahrzeitMin: z.number().int().positive(),
  umstiege: z.number().int().min(0),
  takt: TaktSchema,
  ticket: TicketSchema,
  strassenKm: z.number().positive().optional(),
  bahnKm: z.number().positive().optional(),
  berechnetAm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const HaltestelleSchema = z.object({
  id: Id,
  name: z.string().min(1),
  haltestelleId: z.string().min(1),
  ...Koordinate,
  land: LandSchema,
  region: z.string().min(1),
  richtwerte: z.record(z.string(), RichtwertSchema).default({}),
  bahn: BahnOrtSchema.optional(),
})

export const GebietSchema = z.object({
  id: Id,
  name: z.string().min(1),
  beschreibung: z.string().min(1),
  haltestellen: z.array(Id).min(1),
  sportarten: z.array(SportartSchema).min(1),
  saison: SaisonSchema,
  links: z.array(z.object({ titel: z.string().min(1), url: z.string().url() })).default([]),
  ...Koordinate,
})

export const ZustiegSchema = z.object({
  haltestelleId: Id,
  gehzeitMin: z.number().int().min(0),
  hoehenmeter: z.number().int(),
  bergbahn: z.boolean().default(false),
  hinweis: z.string().optional(),
})

export const HuetteSchema = z.object({
  id: Id,
  name: z.string().min(1),
  betreiber: z.object({ typ: BetreiberTypSchema, sektion: z.string().optional() }),
  hoehe: z.number().int(),
  ...Koordinate,
  gebietId: Id,
  saison: SaisonSchema,
  buchungUrl: z.string().url().optional(),
  webUrl: z.string().url().optional(),
  zustiege: z.array(ZustiegSchema).min(1),
  quelle: z.string().url(),
  geschaetzt: z.boolean().default(false),
})

export const TicketRegelSchema = z.object({
  land: LandSchema,
  ticket: TicketSchema,
  hinweis: z.string().min(1),
})
export const TicketTabelleSchema = z.object({
  regeln: z.array(TicketRegelSchema).min(1),
  fernverkehrHinweis: z.string().min(1),
})

export const EmissionenSchema = z.object({
  quelle: z.string().min(1),
  quelleUrl: z.string().url(),
  stand: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pkwGrammProFahrzeugKm: z.number().positive(),
  personenProPkw: z.number().positive(),
  bahnGrammProPersonenKm: z.number().positive(),
})

export type Sportart = z.infer<typeof SportartSchema>
export type Saison = z.infer<typeof SaisonSchema>
export type Land = z.infer<typeof LandSchema>
export type Ticket = z.infer<typeof TicketSchema>
export type Takt = z.infer<typeof TaktSchema>
export type BetreiberTyp = z.infer<typeof BetreiberTypSchema>
export type BahnOrt = z.infer<typeof BahnOrtSchema>
export type Startort = z.infer<typeof StartortSchema>
export type Richtwert = z.infer<typeof RichtwertSchema>
export type Haltestelle = z.infer<typeof HaltestelleSchema>
export type Gebiet = z.infer<typeof GebietSchema>
export type Zustieg = z.infer<typeof ZustiegSchema>
export type Huette = z.infer<typeof HuetteSchema>
export type TicketTabelle = z.infer<typeof TicketTabelleSchema>
export type Emissionen = z.infer<typeof EmissionenSchema>

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
export const TICKET_LABEL: Record<Ticket, string> = {
  deutschlandticket: 'Deutschlandticket', halbtax: 'Halbtax', europass: 'Europass', keins: 'Einzelticket',
}
