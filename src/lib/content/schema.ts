import { z } from 'zod'
import { BETREIBER_TYPEN, SAISONS, SPORTARTEN, TICKETS, TOUR_ANBIETER } from './labels'

const Id = z.string().regex(/^[a-z0-9-]+$/, 'id: nur a-z, 0-9 und Bindestrich')
const Koordinate = { lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }

/** Bahnhof bei bahn.de (Orte-API): extId = EVA-Nummer, x/y = lon/lat × 1e6 wie in der DB-Orts-ID. */
export const BahnOrtSchema = z.object({
  extId: z.string().regex(/^\d+$/, 'extId: nur Ziffern'),
  name: z.string().min(1),
  x: z.number().int(),
  y: z.number().int(),
})

export const SportartSchema = z.enum(SPORTARTEN)
export const SaisonSchema = z.enum(SAISONS)
export const LandSchema = z.enum(['DE', 'FR', 'CH', 'AT'])
export const TicketSchema = z.enum(TICKETS)
export const TaktSchema = z.enum(['stuendlich', 'zweistuendlich', 'unregelmaessig'])
export const BetreiberTypSchema = z.enum(BETREIBER_TYPEN)
export const TourAnbieterSchema = z.enum(TOUR_ANBIETER)

export const StartortSchema = z.object({
  id: Id,
  name: z.string().min(1),
  haltestelleId: z.string().min(1),
  ...Koordinate,
  sichtbar: z.boolean(),
  bahn: BahnOrtSchema.optional(),
})

const MonatTag = z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Format MM-TT')
const Datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format JJJJ-MM-TT')

/** Wiederkehrender Zeitraum im Jahr, z. B. { von: "06-15", bis: "10-15" }; darf über den Jahreswechsel gehen. */
export const ZeitraumImJahrSchema = z.object({ von: MonatTag, bis: MonatTag })

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
  /** Nur in diesen Zeiträumen bedient (Saisonbus, Sommerbahn). Fehlt das Feld, gilt ganzjährig. */
  bedient: z.array(ZeitraumImJahrSchema).min(1).optional(),
  bedientHinweis: z.string().min(1).optional(),
})

/** Einbettbare Tour: Alpenvereinaktiv nur mit Pro+-Konto (siehe README), komoot nur eigene Touren. */
export const TourEmbedSchema = z.object({
  anbieter: z.enum(['alpenvereinaktiv', 'komoot']),
  id: z.string().regex(/^\d+$/, 'id: nur Ziffern'),
  slug: z.string().min(1).optional(),
})

export const TourSchema = z.object({
  titel: z.string().min(1),
  url: z.string().url(),
  anbieter: TourAnbieterSchema,
  sportart: SportartSchema.optional(),
  dauerMin: z.number().int().positive().optional(),
  hoehenmeter: z.number().int().min(0).optional(),
  laengeKm: z.number().positive().optional(),
  /** Freitext wie "T3", "WS", "mittel" – die Skalen der Anbieter unterscheiden sich. */
  schwierigkeit: z.string().min(1).optional(),
  oeffiTauglich: z.boolean().default(true),
  /** Wie man vom Bahnhof zum Start kommt, wenn es nicht direkt an einer Haltestelle des Gebiets beginnt. */
  startHinweis: z.string().min(1).optional(),
  /** Aktuelle Einschränkung, z. B. gesperrter Weg oder geschlossene Hütte. */
  hinweis: z.string().min(1).optional(),
  embed: TourEmbedSchema.optional(),
})

/** Alpenvereinaktiv-Sammlung (Liste mit Karte) für das ganze Gebiet, z.B. "Nur mit Öffis". */
export const SammlungEmbedSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id: nur Ziffern'),
  slug: z.string().min(1),
})

export const GebietSchema = z.object({
  id: Id,
  name: z.string().min(1),
  beschreibung: z.string().min(1),
  haltestellen: z.array(Id).min(1),
  sportarten: z.array(SportartSchema).min(1),
  saison: SaisonSchema,
  touren: z.array(TourSchema).default([]),
  sammlungEmbed: SammlungEmbedSchema.optional(),
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
  /** Geschlossen oder im Umbau überstimmt alle Bewirtschaftungszeiten bis statusBis. */
  status: z.enum(['offen', 'geschlossen', 'umbau']).default('offen'),
  statusHinweis: z.string().min(1).optional(),
  statusBis: Datum.optional(),
  /** Bewirtschaftungszeiten; fehlt das Feld, wird aus `saison` geschätzt. */
  bewirtschaftet: z.array(ZeitraumImJahrSchema).min(1).optional(),
  winterraum: z.boolean().optional(),
  nurMitglieder: z.boolean().optional(),
  selbstversorger: z.boolean().optional(),
  plaetze: z.number().int().positive().optional(),
})

export const TicketRegelSchema = z.object({
  land: LandSchema,
  ticket: TicketSchema,
  hinweis: z.string().min(1),
  /** Kurzer, belegter Hinweis für Gruppen (Verbindungsdetail und Einladungstext), mit Quelle. */
  gruppenHinweis: z.string().min(1).optional(),
  gruppenQuelle: z.string().url().optional(),
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
export type ZeitraumImJahr = z.infer<typeof ZeitraumImJahrSchema>
export type Startort = z.infer<typeof StartortSchema>
export type Richtwert = z.infer<typeof RichtwertSchema>
export type Haltestelle = z.infer<typeof HaltestelleSchema>
export type Gebiet = z.infer<typeof GebietSchema>
export type Tour = z.infer<typeof TourSchema>
export type TourAnbieter = z.infer<typeof TourAnbieterSchema>
export type TourEmbed = z.infer<typeof TourEmbedSchema>
export type SammlungEmbed = z.infer<typeof SammlungEmbedSchema>
export type Zustieg = z.infer<typeof ZustiegSchema>
export type Huette = z.infer<typeof HuetteSchema>
export type TicketTabelle = z.infer<typeof TicketTabelleSchema>
export type Emissionen = z.infer<typeof EmissionenSchema>

// Konstanten und Beschriftungen liegen zod-frei in labels.ts (auch für den Browser) und werden hier weitergereicht.
export {
  EIGENE_SEKTION, istSektionshaus, SPORTARTEN, SAISONS, TICKETS, BETREIBER_TYPEN, TOUR_ANBIETER,
  SPORTART_LABEL, SAISON_LABEL, BETREIBER_LABEL, TOUR_ANBIETER_LABEL, TICKET_LABEL,
} from './labels'
