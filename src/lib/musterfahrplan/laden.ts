import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import type { Musterfahrplan } from './typen'

const Uhrzeit = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM')
const Datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format JJJJ-MM-TT')

const FahrtSchema = z.object({
  ab: Uhrzeit,
  an: Uhrzeit,
  umstiege: z.number().int().min(0),
  via: z.array(z.string()),
  fern: z.boolean(),
})
const TagesplanSchema = z.object({ hin: z.array(FahrtSchema), rueck: z.array(FahrtSchema) })
const PunktSchema = z.tuple([z.number(), z.number()])

export const MusterfahrplanSchema = z.object({
  startortId: z.string().min(1),
  berechnetAm: Datum,
  liveBis: Datum,
  referenzTage: z.object({ werktag: Datum.optional(), sa: Datum.optional(), so: Datum.optional() }),
  orte: z.record(
    z.string(),
    z.object({
      plaene: z.object({ werktag: TagesplanSchema.optional(), sa: TagesplanSchema.optional(), so: TagesplanSchema.optional() }),
      strecke: z.array(z.array(PunktSchema)).optional(),
    }),
  ),
})

export const MUSTERFAHRPLAN_DATEI = path.join(process.cwd(), 'content', 'musterfahrplan.json')

/** Fehlt die Datei, ist das kein Fehler (noch nicht berechnet): `undefined`. */
export function ladeMusterfahrplan(datei: string = MUSTERFAHRPLAN_DATEI): Musterfahrplan | undefined {
  // Standardpfad statisch, damit der Build nur content/ einpackt; andere Pfade (Tests) vom Tracing ausnehmen.
  const standard = datei === MUSTERFAHRPLAN_DATEI
  const vorhanden = standard
    ? fs.existsSync(path.join(process.cwd(), 'content', 'musterfahrplan.json'))
    : fs.existsSync(/*turbopackIgnore: true*/ datei)
  if (!vorhanden) return undefined
  const name = path.basename(datei)
  let roh: unknown
  try {
    const text = standard
      ? fs.readFileSync(path.join(process.cwd(), 'content', 'musterfahrplan.json'), 'utf8')
      : fs.readFileSync(/*turbopackIgnore: true*/ datei, 'utf8')
    roh = JSON.parse(text)
  } catch (e) {
    throw new Error(`Ungültiges JSON in ${name}: ${(e as Error).message}`)
  }
  const ergebnis = MusterfahrplanSchema.safeParse(roh)
  if (!ergebnis.success) {
    const gruende = ergebnis.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    throw new Error(`Ungültiger Inhalt in ${name}: ${gruende}`)
  }
  return ergebnis.data as Musterfahrplan
}
