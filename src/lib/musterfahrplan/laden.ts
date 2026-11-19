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

/**
 * Gelesener Standardpfad je Prozess: die Routen /api/fahrten und /api/verbindung brauchen ihn bei jeder Anfrage, Lesen
 * und Prüfen (zod) kosten mehr als ein stat. Neu gelesen wird nur, wenn sich die Datei ändert (Zeitstempel, Größe),
 * etwa nach einem Lauf von `npm run musterfahrplan` neben dem Entwicklungsserver.
 */
let gemerkt: { stempel: string; wert: Musterfahrplan } | undefined

/** Für Tests: den Speicher des Standardpfads leeren. */
export function musterfahrplanCacheLeeren() {
  gemerkt = undefined
}

/** Fehlt die Datei, ist das kein Fehler (noch nicht berechnet): `undefined`. Ein ausdrücklicher Pfad umgeht den Speicher. */
export function ladeMusterfahrplan(datei: string = MUSTERFAHRPLAN_DATEI): Musterfahrplan | undefined {
  if (datei !== MUSTERFAHRPLAN_DATEI) return lade(datei, false)
  // Standardpfad statisch, damit der Build nur content/ einpackt.
  let stat: fs.Stats
  try {
    stat = fs.statSync(path.join(process.cwd(), 'content', 'musterfahrplan.json'))
  } catch {
    gemerkt = undefined
    return undefined
  }
  const stempel = `${stat.mtimeMs}:${stat.size}`
  if (gemerkt?.stempel === stempel) return gemerkt.wert
  const wert = lade(datei, true)
  gemerkt = wert && { stempel, wert }
  return wert
}

function lade(datei: string, standard: boolean): Musterfahrplan | undefined {
  // Andere Pfade (Tests) vom Tracing ausnehmen.
  if (!standard && !fs.existsSync(/*turbopackIgnore: true*/ datei)) return undefined
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
