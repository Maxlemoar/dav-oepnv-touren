import { z } from 'zod'

const Id = z.string().regex(/^[a-z0-9-]+$/)
const Datum = z.iso.date()
const Fenster = z.coerce.number().int().min(60).max(720).default(360)

const VerbindungSchema = z.object({
  von: Id,
  nach: Id,
  datum: Datum,
  rueckfahrt: z.enum(['gleicher-tag', 'folgetag']).default('gleicher-tag'),
  fenster: Fenster,
})

const UebersichtSchema = z.object({
  von: Id,
  datum: Datum,
  fenster: Fenster,
})

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
  return parseParameter(q, VerbindungSchema, ['von', 'nach', 'datum', 'rueckfahrt', 'fenster'])
}

export function parseUebersichtParameter(q: URLSearchParams): Ergebnis<UebersichtParameter> {
  return parseParameter(q, UebersichtSchema, ['von', 'datum', 'fenster'])
}
