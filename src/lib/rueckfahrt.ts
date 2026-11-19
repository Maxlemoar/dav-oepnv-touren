// Rückfahrt-Rechner "Spätestens los um …". Bewusst ohne zod: läuft im Browser (Verbindungszeile).
import { lokaleUhrzeit } from '@/lib/datum'

/** Abstieg als Anteil der Aufstiegs-Gehzeit (Faustregel, ohne Höhenmeter-Modell). */
export const ABSTIEG_ANTEIL = 0.7
/** Mindestpuffer zwischen Ankunft an der Haltestelle und Abfahrt. */
export const MIN_PUFFER_MIN = 15
const RUNDEN_MS = 5 * 60_000

export function abstiegMin(aufstiegMin: number): number {
  return Math.round(aufstiegMin * ABSTIEG_ANTEIL)
}

/** Mindestens 15 Minuten, bei langen Abstiegen 10 % des Abstiegs. */
export function pufferMin(abstieg: number): number {
  return Math.max(MIN_PUFFER_MIN, Math.round(abstieg * 0.1))
}

export type SpaetestensLos = {
  /** Abfahrt der letzten Rückfahrt an der Haltestelle, lokal "HH:MM". */
  haltestelleUm: string
  /** Spätester Abmarsch an der Hütte, lokal "HH:MM", auf 5 Minuten abgerundet. */
  losUm: string
  abstiegMin: number
  pufferMin: number
  /** Zustieg mit Bergbahn: deren letzte Talfahrt kann früher liegen. */
  bergbahnPruefen: boolean
}

/** Rechnet von der Abfahrt der Rückfahrt (ISO) über Abstieg und Puffer zurück auf den spätesten Abmarsch. */
export function spaetestensLos(rueckfahrtAbIso: string, zustieg: { gehzeitMin: number; bergbahn?: boolean }): SpaetestensLos {
  const abstieg = abstiegMin(zustieg.gehzeitMin)
  const puffer = pufferMin(abstieg)
  const los = Date.parse(rueckfahrtAbIso) - (abstieg + puffer) * 60_000
  // Abrunden auf 5 Minuten; die Zeitzonen-Versätze sind volle Stunden, UTC-Raster passt also lokal.
  const losGerundet = Math.floor(los / RUNDEN_MS) * RUNDEN_MS
  return {
    haltestelleUm: lokaleUhrzeit(rueckfahrtAbIso),
    losUm: lokaleUhrzeit(new Date(losGerundet).toISOString()),
    abstiegMin: abstieg,
    pufferMin: puffer,
    bergbahnPruefen: Boolean(zustieg.bergbahn),
  }
}

/** Gebietsseite: bis wann man zurück an der Haltestelle sein muss (Abfahrt der letzten Rückfahrt). */
export function spaetestensZurueck(rueckfahrtAbIso: string): string {
  return lokaleUhrzeit(rueckfahrtAbIso)
}
