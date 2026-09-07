import { z } from 'zod'
import { naechsterSamstag } from '@/lib/datum'
import { rueckAnheben } from '@/lib/zeitraum'

const Id = z.string().regex(/^[a-z0-9-]+$/)
const Datum = z.iso.date()
const Fenster = z.coerce.number().int().min(60).max(720).default(360)

const RUECK_FEHLER = { path: ['rueck'], message: 'darf nicht vor datum liegen' }
const rueckNichtVorDatum = (v: { datum: string; rueck?: string }) => v.rueck === undefined || v.rueck >= v.datum
/** Fehlt rueck, gilt die Rückfahrt am Hin-Datum. */
const rueckErgaenzen = <T extends { datum: string; rueck?: string }>(v: T) => ({ ...v, rueck: v.rueck ?? v.datum })

const VerbindungSchema = z.object({
  von: Id,
  nach: Id,
  datum: Datum,
  rueck: Datum.optional(),
  fenster: Fenster,
}).refine(rueckNichtVorDatum, RUECK_FEHLER).transform(rueckErgaenzen)

const UebersichtSchema = z.object({
  von: Id,
  datum: Datum,
  rueck: Datum.optional(),
  fenster: Fenster,
}).refine(rueckNichtVorDatum, RUECK_FEHLER).transform(rueckErgaenzen)

export type VerbindungParameter = z.infer<typeof VerbindungSchema>
export type UebersichtParameter = z.infer<typeof UebersichtSchema>

type Ergebnis<T> = { ok: true; wert: T } | { ok: false; fehler: string }

function parseParameter<T>(q: URLSearchParams, schema: z.ZodType<T>, schluessel: string[]): Ergebnis<T> {
  const roh: Record<string, string> = {}
  for (const k of schluessel) {
    const v = q.get(k)
    if (v !== null) roh[k] = v
  }
  const r = schema.safeParse(roh)
  if (!r.success) return { ok: false, fehler: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
  return { ok: true, wert: r.data }
}

export function parseVerbindungParameter(q: URLSearchParams): Ergebnis<VerbindungParameter> {
  return parseParameter(q, VerbindungSchema, ['von', 'nach', 'datum', 'rueck', 'fenster'])
}

export function parseUebersichtParameter(q: URLSearchParams): Ergebnis<UebersichtParameter> {
  return parseParameter(q, UebersichtSchema, ['von', 'datum', 'rueck', 'fenster'])
}

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/

/**
 * Zeitraum und Tourenfenster aus der Seiten-URL. Ohne datum gilt der kommende Samstag, ohne rueck das
 * Hin-Datum; rueck liegt nie vor datum + mindestNaechte (Hüttenseiten 1, Gebiete 0).
 */
export function zeitraumAusUrl(sp: URLSearchParams, mindestNaechte: number) {
  const datum = sp.get('datum') ?? naechsterSamstag()
  const rueckRoh = sp.get('rueck')
  return {
    datum,
    rueck: rueckAnheben(datum, rueckRoh && ISO_DATUM.test(rueckRoh) ? rueckRoh : undefined, mindestNaechte),
    fenster: Number(sp.get('fenster') ?? 360),
  }
}

/** Zeitraum ohne Mindestnächte, für die Startseite. */
export function verbindungParameter(sp: URLSearchParams) {
  return zeitraumAusUrl(sp, 0)
}
