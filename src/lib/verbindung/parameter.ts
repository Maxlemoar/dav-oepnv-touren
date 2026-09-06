import { z } from 'zod'

const Schema = z.object({
  von: z.string().regex(/^[a-z0-9-]+$/),
  nach: z.string().regex(/^[a-z0-9-]+$/),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rueckfahrt: z.enum(['gleicher-tag', 'folgetag']).default('gleicher-tag'),
  fenster: z.coerce.number().int().min(60).max(720).default(360),
})

export type VerbindungParameter = z.infer<typeof Schema>

export function parseVerbindungParameter(q: URLSearchParams):
  { ok: true; wert: VerbindungParameter } | { ok: false; fehler: string } {
  const roh: Record<string, string> = {}
  for (const k of ['von', 'nach', 'datum', 'rueckfahrt', 'fenster']) {
    const v = q.get(k)
    if (v !== null) roh[k] = v
  }
  const r = Schema.safeParse(roh)
  if (!r.success) return { ok: false, fehler: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
  return { ok: true, wert: r.data }
}
