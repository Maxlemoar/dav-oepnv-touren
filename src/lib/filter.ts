import { SPORTARTEN, type Sportart, type Saison, type Ticket } from '@/lib/content/labels'
import type { Takt, ZeitraumImJahr } from '@/lib/content/schema'
import { bedientAm, gebietPasstZurJahreszeit } from '@/lib/saison'

export type GebietEintrag = {
  id: string
  name: string
  /** Region der Hauptzugangs-Haltestelle, z. B. "Südschwarzwald". */
  region: string
  beschreibung: string
  sportarten: Sportart[]
  saison: Saison
  fahrzeitMin?: number
  umstiege?: number
  takt?: Takt
  ticket?: Ticket
  anzahlHuetten: number
  anzahlTouren: number
  /** Im Gebiet steht ein Haus der eigenen Sektion. */
  sektionshaus: boolean
  lat: number
  lon: number
  hauptHaltestelleId: string
  /** Namen der Hütten im Gebiet, damit die Suche das Gebiet auch über sie findet. */
  huettenNamen: string[]
  /** Titel der Touren im Gebiet, ebenfalls für die Suche. */
  tourenTitel: string[]
  /** Bedienzeiten des Hauptzugangs (Saisonbus); fehlt, wenn ganzjährig bedient. */
  bedient?: ZeitraumImJahr[]
}

export type Art = 'alle' | 'tag' | 'nacht'
/** nurPassend: nur Ziele, die zum gewählten Datum passen (Saison und Bus am Hauptzugang); Standard an. */
export type FilterZustand = { sport: Sportart[]; art: Art; maxStd: number; suche: string; nurPassend: boolean }

/** 99 = keine Grenze (Grenzfälle über 5 h) */
export const MAX_STD_WERTE = [2, 3, 4, 5, 99]

export const STANDARD_FILTER: FilterZustand = { sport: [], art: 'alle', maxStd: 5, suche: '', nurPassend: true }

export function leseFilter(sp: URLSearchParams): FilterZustand {
  const sport = (sp.get('sport') ?? '').split(',').filter((s): s is Sportart => (SPORTARTEN as readonly string[]).includes(s))
  const art = (sp.get('art') ?? 'alle') as Art
  const maxStd = Number(sp.get('max') ?? 5)
  return { sport, art: ['alle', 'tag', 'nacht'].includes(art) ? art : 'alle', maxStd: MAX_STD_WERTE.includes(maxStd) ? maxStd : 5, suche: sp.get('q') ?? '', nurPassend: sp.get('saison') !== 'alle' }
}

export function schreibeFilter(sp: URLSearchParams, f: FilterZustand): URLSearchParams {
  const neu = new URLSearchParams(sp)
  for (const k of ['sport', 'art', 'max', 'q', 'saison']) neu.delete(k)
  if (f.sport.length) neu.set('sport', f.sport.join(','))
  if (f.art !== 'alle') neu.set('art', f.art)
  if (f.maxStd !== 5) neu.set('max', String(f.maxStd))
  if (f.suche) neu.set('q', f.suche)
  if (!f.nurPassend) neu.set('saison', 'alle')
  return neu
}

/** Kleinbuchstaben ohne Diakritika: "Südschwarzwald" -> "sudschwarzwald". */
function normalisiere(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/** Alle Suchwörter (durch Leerzeichen getrennt) müssen im Text vorkommen; ohne Groß/Klein und Diakritika. Leere Suche passt immer. */
export function passtZurSuche(text: string, suche: string): boolean {
  const woerter = normalisiere(suche).split(/\s+/).filter(Boolean)
  if (woerter.length === 0) return true
  const t = normalisiere(text)
  return woerter.every((w) => t.includes(w))
}

/** Höchstens `max` Einträge, deren Name oder Suchtext zur Suche passt; leere Suche liefert nichts. */
export function sucheTreffer<T extends { name: string; suchtext?: string }>(eintraege: T[], suche: string, max: number): T[] {
  if (!suche.trim()) return []
  return eintraege.filter((e) => passtZurSuche(`${e.name} ${e.suchtext ?? ''}`, suche)).slice(0, max)
}

/** Warum ein Gebiet am Datum schlecht passt: Hauptzugang ohne Bus (Saisonbetrieb) oder Ziel außerhalb seiner Saison. */
export type SaisonProblem = 'kein_bus' | 'saisonziel'

export function saisonProblem(g: Pick<GebietEintrag, 'saison' | 'bedient'>, datum: string): SaisonProblem | undefined {
  if (!bedientAm(g, datum)) return 'kein_bus'
  if (!gebietPasstZurJahreszeit(g, datum)) return 'saisonziel'
  return undefined
}

/**
 * uebersicht: gebietId -> tagesziel (true/false), fehlt = noch nicht geladen.
 * datum: gewählter Tag; nur damit greift der Schalter "Nur was am Datum geht".
 */
export function filtereGebiete(
  gebiete: GebietEintrag[], f: FilterZustand, uebersicht: Record<string, boolean | undefined>, datum?: string,
): GebietEintrag[] {
  return gebiete
    .filter((g) => (g.fahrzeitMin ?? 0) <= f.maxStd * 60)
    .filter((g) => f.sport.length === 0 || f.sport.some((s) => g.sportarten.includes(s)))
    .filter((g) => f.art !== 'tag' || uebersicht[g.id] !== false)
    .filter((g) => f.art !== 'nacht' || g.anzahlHuetten > 0)
    .filter((g) => !f.nurPassend || !datum || !saisonProblem(g, datum))
    .filter((g) => passtZurSuche(`${g.name} ${g.region} ${g.beschreibung} ${g.huettenNamen.join(' ')} ${g.tourenTitel.join(' ')}`, f.suche))
    .sort((a, b) => (a.fahrzeitMin ?? 9999) - (b.fahrzeitMin ?? 9999))
}

/** Wie viele Ziele nur wegen des Saison-Schalters bzw. nur wegen der Fahrzeitgrenze fehlen. */
export function ausgeblendet(
  gebiete: GebietEintrag[], f: FilterZustand, uebersicht: Record<string, boolean | undefined>, datum?: string,
): { saison: number; fahrzeit: number } {
  const sichtbar = filtereGebiete(gebiete, f, uebersicht, datum).length
  return {
    saison: filtereGebiete(gebiete, { ...f, nurPassend: false }, uebersicht, datum).length - sichtbar,
    fahrzeit: filtereGebiete(gebiete, { ...f, maxStd: 99 }, uebersicht, datum).length - sichtbar,
  }
}
