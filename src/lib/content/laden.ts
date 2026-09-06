import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { ZodType } from 'zod'
import {
  StartortSchema, HaltestelleSchema, GebietSchema, HuetteSchema,
  TicketTabelleSchema, EmissionenSchema,
  type Startort, type Haltestelle, type Gebiet, type Huette, type TicketTabelle, type Emissionen,
} from './schema'

export type Inhalt = {
  startorte: Startort[]
  haltestellen: Haltestelle[]
  gebiete: Gebiet[]
  huetten: Huette[]
  tickets: TicketTabelle
  emissionen: Emissionen
}

const STANDARD_VERZEICHNIS = path.join(process.cwd(), 'content')

function leseDatei<T>(datei: string, schema: ZodType<T>, wurzel: string): T {
  const rel = path.relative(wurzel, datei)
  let roh: unknown
  try {
    roh = parse(fs.readFileSync(datei, 'utf8'))
  } catch (e) {
    throw new Error(`Ungültige YAML in ${rel}: ${(e as Error).message}`)
  }
  const ergebnis = schema.safeParse(roh)
  if (!ergebnis.success) {
    const gruende = ergebnis.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    throw new Error(`Ungültiger Inhalt in ${rel}: ${gruende}`)
  }
  return ergebnis.data
}

function leseSammlung<T extends { id: string }>(verzeichnis: string, schema: ZodType<T>, wurzel: string): T[] {
  if (!fs.existsSync(verzeichnis)) throw new Error(`Verzeichnis ${path.relative(wurzel, verzeichnis)} fehlt`)
  const dateien = fs.readdirSync(verzeichnis).filter((f) => f.endsWith('.yaml')).sort()
  const ids = new Set<string>()
  return dateien.map((f) => {
    const datei = path.join(verzeichnis, f)
    const e = leseDatei(datei, schema, wurzel)
    const erwartet = path.basename(f, '.yaml')
    if (e.id !== erwartet) throw new Error(`Dateiname ${path.relative(wurzel, datei)} passt nicht zu id "${e.id}"`)
    if (ids.has(e.id)) throw new Error(`Doppelte id "${e.id}" in ${path.relative(wurzel, verzeichnis)}`)
    ids.add(e.id)
    return e
  })
}

export function ladeInhalt(wurzel: string = STANDARD_VERZEICHNIS): Inhalt {
  return {
    startorte: leseSammlung(path.join(wurzel, 'startorte'), StartortSchema, wurzel),
    haltestellen: leseSammlung(path.join(wurzel, 'haltestellen'), HaltestelleSchema, wurzel),
    gebiete: leseSammlung(path.join(wurzel, 'gebiete'), GebietSchema, wurzel),
    huetten: leseSammlung(path.join(wurzel, 'huetten'), HuetteSchema, wurzel),
    tickets: leseDatei(path.join(wurzel, 'tickets.yaml'), TicketTabelleSchema, wurzel),
    emissionen: leseDatei(path.join(wurzel, 'emissionen.yaml'), EmissionenSchema, wurzel),
  }
}

export function pruefeQuerverweise(inhalt: Inhalt): string[] {
  const fehler: string[] = []
  const startortIds = new Set(inhalt.startorte.map((s) => s.id))
  const haltestellenIds = new Set(inhalt.haltestellen.map((h) => h.id))
  const gebietIds = new Set(inhalt.gebiete.map((g) => g.id))
  const benutzteHaltestellen = new Set<string>()

  for (const g of inhalt.gebiete) {
    for (const h of g.haltestellen) {
      if (!haltestellenIds.has(h)) fehler.push(`gebiet ${g.id}: haltestelle "${h}" unbekannt`)
      benutzteHaltestellen.add(h)
    }
  }
  for (const h of inhalt.huetten) {
    if (!gebietIds.has(h.gebietId)) fehler.push(`huette ${h.id}: gebietId "${h.gebietId}" unbekannt`)
    for (const z of h.zustiege) {
      if (!haltestellenIds.has(z.haltestelleId)) fehler.push(`huette ${h.id}: zustieg haltestelleId "${z.haltestelleId}" unbekannt`)
    }
  }
  for (const h of inhalt.haltestellen) {
    if (!benutzteHaltestellen.has(h.id)) fehler.push(`haltestelle ${h.id}: gehört zu keinem Gebiet`)
    for (const s of Object.keys(h.richtwerte)) {
      if (!startortIds.has(s)) fehler.push(`haltestelle ${h.id}: richtwert für unbekannten startort "${s}"`)
    }
  }
  return fehler
}

let zwischenspeicher: Inhalt | undefined

/** Geprüfter Inhalt für Seiten und Routen. Wirft, wenn Querverweise kaputt sind. */
export function inhalt(): Inhalt {
  if (zwischenspeicher) return zwischenspeicher
  const geladen = ladeInhalt()
  const fehler = pruefeQuerverweise(geladen)
  if (fehler.length) throw new Error(`Inhalt fehlerhaft:\n${fehler.join('\n')}`)
  zwischenspeicher = geladen
  return geladen
}

export function findeStartort(i: Inhalt, id: string): Startort | undefined { return i.startorte.find((s) => s.id === id) }
export function findeHaltestelle(i: Inhalt, id: string): Haltestelle | undefined { return i.haltestellen.find((h) => h.id === id) }
export function findeGebiet(i: Inhalt, id: string): Gebiet | undefined { return i.gebiete.find((g) => g.id === id) }
export function findeHuette(i: Inhalt, id: string): Huette | undefined { return i.huetten.find((h) => h.id === id) }
export function huettenImGebiet(i: Inhalt, gebietId: string): Huette[] { return i.huetten.filter((h) => h.gebietId === gebietId) }
export function sichtbareStartorte(i: Inhalt): Startort[] { return i.startorte.filter((s) => s.sichtbar) }
