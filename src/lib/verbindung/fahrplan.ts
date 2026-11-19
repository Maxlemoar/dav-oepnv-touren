import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'

/** Wie weit der Fahrplan bei Transitous reicht; liegt eigenständig in content/fahrplan.yaml. */
const FahrplanSchema = z.object({
  liveBis: z.iso.date(),
  hinweis: z.string().min(1),
})

export type Fahrplan = z.infer<typeof FahrplanSchema>

const STANDARD_DATEI = path.join(process.cwd(), 'content', 'fahrplan.yaml')
let zwischenspeicher: Fahrplan | undefined

export function ladeFahrplan(datei: string = STANDARD_DATEI): Fahrplan {
  if (datei === STANDARD_DATEI && zwischenspeicher) return zwischenspeicher
  const r = FahrplanSchema.safeParse(parse(fs.readFileSync(datei, 'utf8')))
  if (!r.success) {
    const gruende = r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    throw new Error(`Ungültiger Inhalt in fahrplan.yaml: ${gruende}`)
  }
  if (datei === STANDARD_DATEI) zwischenspeicher = r.data
  return r.data
}

/** Liegt das Datum nach dem Tag, bis zu dem Transitous den Fahrplan verlässlich kennt? */
export function nachLiveBis(datum: string, f: Pick<Fahrplan, 'liveBis'>): boolean {
  return datum > f.liveBis
}
