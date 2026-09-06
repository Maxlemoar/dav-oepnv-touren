import { SportartSchema, type Sportart, type Saison, type Takt, type Ticket } from '@/lib/content/schema'

export type GebietEintrag = {
  id: string
  name: string
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

export const STANDARD_FILTER: FilterZustand = { sport: [], art: 'alle', maxStd: 5, suche: '' }

export function leseFilter(sp: URLSearchParams): FilterZustand {
  const sport = (sp.get('sport') ?? '').split(',').filter((s): s is Sportart => (SportartSchema.options as string[]).includes(s))
  const art = (sp.get('art') ?? 'alle') as Art
  const maxStd = Number(sp.get('max') ?? 5)
  return { sport, art: ['alle', 'tag', 'nacht'].includes(art) ? art : 'alle', maxStd: [2, 3, 4, 5].includes(maxStd) ? maxStd : 5, suche: sp.get('q') ?? '' }
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

/** uebersicht: gebietId -> tagesziel (true/false), fehlt = noch nicht geladen */
export function filtereGebiete(gebiete: GebietEintrag[], f: FilterZustand, uebersicht: Record<string, boolean | undefined>): GebietEintrag[] {
  const q = f.suche.trim().toLowerCase()
  return gebiete
    .filter((g) => (g.fahrzeitMin ?? 0) <= f.maxStd * 60)
    .filter((g) => f.sport.length === 0 || f.sport.some((s) => g.sportarten.includes(s)))
    .filter((g) => f.art !== 'tag' || uebersicht[g.id] !== false)
    .filter((g) => f.art !== 'nacht' || g.anzahlHuetten > 0)
    .filter((g) => !q || g.name.toLowerCase().includes(q))
    .sort((a, b) => (a.fahrzeitMin ?? 9999) - (b.fahrzeitMin ?? 9999))
}
