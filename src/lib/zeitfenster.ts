import { datumKurz, lokalesDatum, naechsterSamstag, tageAddieren, tageDifferenz } from '@/lib/datum'
import { rueckAnheben } from '@/lib/zeitraum'

/** Reine, browsersichere Helfer (kein zod): das Zeitfenster einer Tour in der Seiten-URL. */
export type Zeitfenster = { datum: string; rueck: string; abMin: number; bisMin: number; vorOrtMin: number }

/** Los ab Offenburg, zurück bis Offenburg, mindestens vor Ort. */
export const STANDARD_ZEITFENSTER = { abMin: 360, bisMin: 1260, vorOrtMin: 240 } as const
export const ZEITBAND = { vonMin: 240, bisMin: 1440, schrittMin: 30 } as const
export const VOR_ORT_MAX_MIN = 600
/** Wandern in internen Links mit. */
export const ZEITFENSTER_PARAMETER = ['datum', 'rueck', 'ab', 'bis', 'vorort'] as const

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/

/** Echtes Kalenderdatum JJJJ-MM-TT (Rundreise über Date fängt 2026-13-45 und 2026-02-30 ab). */
function istDatum(x: string | null): x is string {
  if (!x || !ISO_DATUM.test(x)) return false
  const d = new Date(`${x}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === x
}
const UHRZEIT = /^(\d{1,2}):(\d{2})$/

/** "06:30" → 390, "24:00" → 1440, sonst undefined. */
export function alsMin(hhmm: string): number | undefined {
  const m = UHRZEIT.exec(hhmm)
  if (!m) return undefined
  const h = Number(m[1])
  const min = Number(m[2])
  if (min > 59) return undefined
  const gesamt = h * 60 + min
  return gesamt <= ZEITBAND.bisMin ? gesamt : undefined
}

/** 390 → "6:30", 1440 → "24:00". */
export function alsUhrzeit(min: number): string {
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`
}

/** Schnellwahl der Startseite: kommender Samstag (an einem Samstag heute) und der Sonntag danach, Label "Sa 21.11.". */
export function schnellwahl(heute: string): { label: string; datum: string }[] {
  const samstag = naechsterSamstag(new Date(`${heute}T12:00:00Z`))
  return [samstag, tageAddieren(samstag, 1)].map((datum) => ({ label: datumKurz(datum), datum }))
}

export function naechte(z: Pick<Zeitfenster, 'datum' | 'rueck'>): number {
  return tageDifferenz(z.datum, z.rueck)
}

function runden(min: number): number {
  return Math.round(min / ZEITBAND.schrittMin) * ZEITBAND.schrittMin
}

function uhrzeitParam(sp: URLSearchParams, name: string): number | undefined {
  const roh = sp.get(name)
  const min = roh === null ? undefined : alsMin(roh)
  if (min === undefined) return undefined
  const gerundet = runden(min)
  return gerundet >= ZEITBAND.vonMin && gerundet <= ZEITBAND.bisMin ? gerundet : undefined
}

function vorOrtParam(sp: URLSearchParams): number | undefined {
  const roh = sp.get('vorort')
  if (roh === null || !/^\d+$/.test(roh)) return undefined
  const min = Number(roh)
  if (min > VOR_ORT_MAX_MIN) return undefined
  return runden(min)
}

/**
 * Zeitfenster aus der Seiten-URL. Ohne gültiges oder mit vergangenem datum gilt der kommende Samstag, ohne rueck
 * das Hin-Datum (rueck liegt nie vor datum + mindestNaechte). Ungültige Zeiten fallen auf die Vorgaben zurück;
 * am selben Tag liegt bis mindestens eine Stufe nach ab (bei gewähltem ab wird angehoben, sonst gilt die Vorgabe). `gewaehlt`: die URL trägt ein gültiges, nicht vergangenes datum.
 */
export function zeitfensterAusUrl(
  sp: URLSearchParams,
  opts: { mindestNaechte?: number; heute?: string } = {},
): Zeitfenster & { gewaehlt: boolean } {
  const heute = opts.heute ?? lokalesDatum(new Date())
  const roh = sp.get('datum')
  const datumGueltig = istDatum(roh) && roh >= heute
  const datum = datumGueltig ? roh : naechsterSamstag(new Date(`${heute}T12:00:00Z`))
  const rueckRoh = sp.get('rueck')
  const rueckGueltig = istDatum(rueckRoh)
  const rueck = rueckAnheben(datum, rueckGueltig ? rueckRoh : undefined, opts.mindestNaechte ?? 0)

  const ab = uhrzeitParam(sp, 'ab')
  let bis = uhrzeitParam(sp, 'bis')
  const vorOrt = vorOrtParam(sp)

  const abMin = ab ?? STANDARD_ZEITFENSTER.abMin
  // Am selben Tag liegt bis mindestens eine Stufe nach ab: bei gewähltem ab wird angehoben,
  // bei vorgegebenem ab passt das bis nicht dazu und verfällt.
  if (rueck === datum && (bis ?? STANDARD_ZEITFENSTER.bisMin) < abMin + ZEITBAND.schrittMin) {
    bis = ab === undefined ? undefined : Math.min(ZEITBAND.bisMin, abMin + ZEITBAND.schrittMin)
  }
  const bisMin = bis ?? STANDARD_ZEITFENSTER.bisMin

  return {
    datum,
    rueck,
    abMin,
    bisMin,
    vorOrtMin: vorOrt ?? STANDARD_ZEITFENSTER.vorOrtMin,
    gewaehlt: datumGueltig,
  }
}

/** Schreibt das Zeitfenster in eine Kopie von `sp`: Vorgaben entfallen, rueck nur wenn ≠ datum, fenster wird gelöscht; `ohneDatum` lässt datum und rueck weg. */
export function zeitfensterSchreiben(
  sp: URLSearchParams,
  z: Zeitfenster,
  opts: { ohneDatum?: boolean } = {},
): URLSearchParams {
  const neu = new URLSearchParams(sp)
  for (const k of ZEITFENSTER_PARAMETER) neu.delete(k)
  neu.delete('fenster')
  if (!opts.ohneDatum) {
    neu.set('datum', z.datum)
    if (z.rueck !== z.datum) neu.set('rueck', z.rueck)
  }
  if (z.abMin !== STANDARD_ZEITFENSTER.abMin) neu.set('ab', `${String(Math.floor(z.abMin / 60)).padStart(2, '0')}:${String(z.abMin % 60).padStart(2, '0')}`)
  if (z.bisMin !== STANDARD_ZEITFENSTER.bisMin) neu.set('bis', `${String(Math.floor(z.bisMin / 60)).padStart(2, '0')}:${String(z.bisMin % 60).padStart(2, '0')}`)
  if (z.vorOrtMin !== STANDARD_ZEITFENSTER.vorOrtMin) neu.set('vorort', String(z.vorOrtMin))
  return neu
}
