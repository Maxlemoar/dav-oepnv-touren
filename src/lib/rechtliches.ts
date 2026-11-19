import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'

const Text = z.string().trim().min(1)
/** Leere Felder in YAML (`feld:`) kommen als null an; leere Texte behandeln wir genauso. */
const Leer = z.union([z.null(), z.undefined(), z.literal('')]).transform(() => undefined)

const AnschriftSchema = z.array(Text).min(1)

export const VerantwortlichSchema = z.object({
  art: z.enum(['verein', 'person']),
  name: Text,
  anschrift: AnschriftSchema,
  email: z.email(),
  telefon: Text.optional(),
  vertretungsberechtigt: z.array(Text).min(1).optional(),
  registergericht: Text.optional(),
  registernummer: Text.optional(),
  inhaltlichVerantwortlich: z.object({ name: Text, anschrift: AnschriftSchema }).optional(),
  datenschutzbeauftragter: Text.optional(),
}).superRefine((v, ctx) => {
  if (v.art === 'verein' && !v.vertretungsberechtigt) {
    ctx.addIssue({ code: 'custom', path: ['vertretungsberechtigt'], message: 'Verein braucht vertretungsberechtigte Personen' })
  }
  if (Boolean(v.registergericht) !== Boolean(v.registernummer)) {
    ctx.addIssue({ code: 'custom', path: ['registernummer'], message: 'Registergericht und Registernummer nur gemeinsam' })
  }
})

export const RechtlichesSchema = z.object({
  verantwortlich: z.union([Leer, VerantwortlichSchema]).optional(),
  projekt: Text,
  kontaktEmail: z.union([Leer, z.email()]).optional(),
})

export type Verantwortlich = z.infer<typeof VerantwortlichSchema>
export type Rechtliches = z.infer<typeof RechtlichesSchema>

const STANDARD_DATEI = path.join(process.cwd(), 'content', 'rechtliches.yaml')

/** Prüft rohe Daten (z. B. geparste YAML); wirft mit lesbarer Begründung. */
export function pruefeRechtliches(roh: unknown): Rechtliches {
  const ergebnis = RechtlichesSchema.safeParse(roh)
  if (!ergebnis.success) {
    const gruende = ergebnis.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    throw new Error(`Ungültiger Inhalt in content/rechtliches.yaml: ${gruende}`)
  }
  return ergebnis.data
}

export function ladeRechtliches(datei: string = STANDARD_DATEI): Rechtliches {
  return pruefeRechtliches(parse(fs.readFileSync(datei, 'utf8')))
}

let zwischenspeicher: Rechtliches | undefined

export function rechtliches(): Rechtliches {
  zwischenspeicher ??= ladeRechtliches()
  return zwischenspeicher
}
