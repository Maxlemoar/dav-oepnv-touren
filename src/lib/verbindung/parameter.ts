import { z } from 'zod'

const Id = z.string().regex(/^[a-z0-9-]+$/)
const Datum = z.iso.date()

const RUECK_FEHLER = { path: ['rueck'], message: 'darf nicht vor datum liegen' }
const rueckNichtVorDatum = (v: { datum: string; rueck?: string }) => v.rueck === undefined || v.rueck >= v.datum
/** Fehlt rueck, gilt die Rückfahrt am Hin-Datum. */
const rueckErgaenzen = <T extends { datum: string; rueck?: string }>(v: T) => ({ ...v, rueck: v.rueck ?? v.datum })

/** Orte und Daten; die Uhrzeiten (ab, bis, vorort) liest zeitfensterAusUrl, ungültige werden zu Vorgaben. */
const VerbindungSchema = z.object({
  von: Id,
  nach: Id,
  datum: Datum,
  rueck: Datum.optional(),
}).refine(rueckNichtVorDatum, RUECK_FEHLER).transform(rueckErgaenzen)

/** Datum und Zeiten liest zeitfensterAusUrl; hier nur Orte und das Nachladen. */
const FahrtenSchema = z.object({
  von: Id,
  nach: Id,
  weiter: z.enum(['hin', 'rueck']).optional(),
  zeit: z.iso.datetime({ offset: true }).optional(),
}).refine((v) => v.weiter === undefined || v.zeit !== undefined, { path: ['zeit'], message: 'fehlt bei weiter' })

export type VerbindungParameter = z.infer<typeof VerbindungSchema>
export type FahrtenParameter = z.infer<typeof FahrtenSchema>

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
  return parseParameter(q, VerbindungSchema, ['von', 'nach', 'datum', 'rueck'])
}

export function parseFahrtenParameter(q: URLSearchParams): Ergebnis<FahrtenParameter> {
  return parseParameter(q, FahrtenSchema, ['von', 'nach', 'weiter', 'zeit'])
}
