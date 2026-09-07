import { SportartSchema, type Sportart, type Saison, type Takt, type Ticket } from '@/lib/content/schema'

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
  lat: number
  lon: number
  hauptHaltestelleId: string
}

export type Art = 'alle' | 'tag' | 'nacht'
export type FilterZustand = { sport: Sportart[]; art: Art; maxStd: number; suche: string }

/** 99 = keine Grenze (Grenzfälle über 5 h) */
export const MAX_STD_WERTE = [2, 3, 4, 5, 99]

export const STANDARD_FILTER: FilterZustand = { sport: [], art: 'alle', maxStd: 5, suche: '' }

export function leseFilter(sp: URLSearchParams): FilterZustand {
  const sport = (sp.get('sport') ?? '').split(',').filter((s): s is Sportart => (SportartSchema.options as string[]).includes(s))
  const art = (sp.get('art') ?? 'alle') as Art
  const maxStd = Number(sp.get('max') ?? 5)
  return { sport, art: ['alle', 'tag', 'nacht'].includes(art) ? art : 'alle', maxStd: MAX_STD_WERTE.includes(maxStd) ? maxStd : 5, suche: sp.get('q') ?? '' }
}

export function schreibeFilter(sp: URLSearchParams, f: FilterZustand): URLSearchParams {
  const neu = new URLSearchParams(sp)
  for (const k of ['sport', 'art', 'max', 'q']) neu.delete(k)
  if (f.sport.length) neu.set('sport', f.sport.join(','))
  if (f.art !== 'alle') neu.set('art', f.art)
  if (f.maxStd !== 5) neu.set('max', String(f.maxStd))
  if (f.suche) neu.set('q', f.suche)
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

/** uebersicht: gebietId -> tagesziel (true/false), fehlt = noch nicht geladen */
export function filtereGebiete(gebiete: GebietEintrag[], f: FilterZustand, uebersicht: Record<string, boolean | undefined>): GebietEintrag[] {
  return gebiete
    .filter((g) => (g.fahrzeitMin ?? 0) <= f.maxStd * 60)
    .filter((g) => f.sport.length === 0 || f.sport.some((s) => g.sportarten.includes(s)))
    .filter((g) => f.art !== 'tag' || uebersicht[g.id] !== false)
    .filter((g) => f.art !== 'nacht' || g.anzahlHuetten > 0)
    .filter((g) => passtZurSuche(`${g.name} ${g.region} ${g.beschreibung}`, f.suche))
    .sort((a, b) => (a.fahrzeitMin ?? 9999) - (b.fahrzeitMin ?? 9999))
}
