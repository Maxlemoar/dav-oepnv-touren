import type { Gebiet, Haltestelle, Huette, ZeitraumImJahr } from './content/schema'

/** Datum "JJJJ-MM-TT" liegt im wiederkehrenden Zeitraum; Zeiträume dürfen über den Jahreswechsel gehen. */
export function imZeitraum(datum: string, z: ZeitraumImJahr): boolean {
  const md = datum.slice(5)
  return z.von <= z.bis ? md >= z.von && md <= z.bis : md >= z.von || md <= z.bis
}

const imEinem = (datum: string, zs: ZeitraumImJahr[]) => zs.some((z) => imZeitraum(datum, z))

/** Wird die Haltestelle am Datum bedient? Ohne Angabe ganzjährig. */
export function bedientAm(h: Pick<Haltestelle, 'bedient'>, datum: string): boolean {
  return !h.bedient || imEinem(datum, h.bedient)
}

/** Schätzung, wann Hütten ohne belegte Zeiten bewirtschaftet sind. */
const GESCHAETZT: Record<Huette['saison'], ZeitraumImJahr[]> = {
  sommer: [{ von: '06-01', bis: '10-15' }],
  winter: [{ von: '12-15', bis: '04-15' }],
  ganzjaehrig: [{ von: '01-01', bis: '12-31' }],
}

export type HuettenZustand = { zustand: 'offen' | 'winterraum' | 'geschlossen'; hinweis?: string; sicher: boolean }

/**
 * Zustand einer Hütte am Datum. `sicher` ist false, wenn er nur aus der Saison geschätzt ist.
 * Status geschlossen oder Umbau gilt bis `statusBis` (ohne Enddatum dauerhaft).
 */
export function huetteZustandAm(h: Huette, datum: string): HuettenZustand {
  if (h.status !== 'offen' && (!h.statusBis || datum < h.statusBis)) {
    return h.statusHinweis ? { zustand: 'geschlossen', hinweis: h.statusHinweis, sicher: true } : { zustand: 'geschlossen', sicher: true }
  }
  const belegt = Boolean(h.bewirtschaftet)
  const zeiten = h.bewirtschaftet ?? GESCHAETZT[h.saison]
  if (imEinem(datum, zeiten)) return { zustand: 'offen', sicher: belegt }
  if (h.winterraum) return { zustand: 'winterraum', sicher: belegt }
  return { zustand: 'geschlossen', sicher: belegt }
}

/** Grobe Jahreszeit eines Gebiets: Sommergebiete Mitte Mai bis Oktober, Wintergebiete Dezember bis April. */
export function gebietPasstZurJahreszeit(g: Pick<Gebiet, 'saison'>, datum: string): boolean {
  if (g.saison === 'sommer') return imZeitraum(datum, { von: '05-15', bis: '10-31' })
  if (g.saison === 'winter') return imZeitraum(datum, { von: '12-01', bis: '04-30' })
  return true
}

export type Tagesklasse = 'sa' | 'so' | 'werktag'

/** Ostersonntag nach Gauß (gregorianisch). */
function ostersonntag(jahr: number): Date {
  const a = jahr % 19, b = Math.floor(jahr / 100), c = jahr % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const monat = Math.floor((h + l - 7 * m + 114) / 31), tag = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(jahr, monat - 1, tag))
}

/** Gesetzliche Feiertage in Baden-Württemberg; dort fährt der Nahverkehr nach Sonntagsfahrplan. */
function feiertageBW(jahr: number): Set<string> {
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const ostern = ostersonntag(jahr)
  const plus = (t: number) => iso(new Date(ostern.getTime() + t * 86400_000))
  return new Set([
    `${jahr}-01-01`, `${jahr}-01-06`, plus(-2), plus(1), `${jahr}-05-01`, plus(39), plus(50), plus(60),
    `${jahr}-10-03`, `${jahr}-11-01`, `${jahr}-12-25`, `${jahr}-12-26`,
  ])
}

/** Welche vorberechnete Fahrplanlage gilt für das Datum? Feiertage zählen wie Sonntag. */
export function tagesklasse(datum: string): Tagesklasse {
  if (feiertageBW(Number(datum.slice(0, 4))).has(datum)) return 'so'
  const wt = new Date(`${datum}T12:00:00Z`).getUTCDay()
  return wt === 6 ? 'sa' : wt === 0 ? 'so' : 'werktag'
}
