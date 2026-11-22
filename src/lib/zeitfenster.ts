import { datumKurz, lokalesDatum, naechsterSamstag, tageAddieren, tageDifferenz } from '@/lib/datum'

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

/**
 * Schnellwahl: kommender Samstag (an einem Samstag heute) und der Sonntag danach als Tagestouren, dazu „Wochenende“
 * (Samstag hin, Sonntag zurück). Einträge mit weniger Nächten als `mindestNaechte` fallen weg (Hüttenseite).
 */
export function schnellwahl(heute: string, mindestNaechte = 0): { label: string; datum: string; rueck: string }[] {
  const samstag = naechsterSamstag(new Date(`${heute}T12:00:00Z`))
  const sonntag = tageAddieren(samstag, 1)
  return [
    { label: datumKurz(samstag), datum: samstag, rueck: samstag },
    { label: datumKurz(sonntag), datum: sonntag, rueck: sonntag },
    { label: 'Wochenende', datum: samstag, rueck: sonntag },
  ].filter((s) => tageDifferenz(s.datum, s.rueck) >= mindestNaechte)
}

/** Rückdatum, wenn das Hindatum wechselt: Die Zahl der Nächte bleibt (Tagestour bleibt Tagestour), mindestens `mindestNaechte`. */
export function rueckNachHinwechsel(alt: Pick<Zeitfenster, 'datum' | 'rueck'>, neuesDatum: string, mindestNaechte = 0): string {
  return tageAddieren(neuesDatum, Math.max(naechte(alt), mindestNaechte))
}

/**
 * Am selben Tag liegt „zurück bis“ mindestens eine Stufe nach „los ab“: Die geänderte Uhrzeit gilt, die andere weicht
 * aus (Grenzen 4:00 bis 24:00). Bei mehreren Tagen gehören die Zeiten zu verschiedenen Tagen; nichts weicht aus.
 */
export function zeitenAusweichen(
  alt: { abMin: number; bisMin: number },
  neu: { abMin: number; bisMin: number },
  gleicherTag: boolean,
): { abMin: number; bisMin: number } {
  if (!gleicherTag) return neu
  const s = ZEITBAND.schrittMin
  if (neu.abMin !== alt.abMin) {
    const abMin = Math.min(neu.abMin, ZEITBAND.bisMin - s)
    return { abMin, bisMin: Math.max(neu.bisMin, abMin + s) }
  }
  const bisMin = Math.max(neu.bisMin, ZEITBAND.vonMin + s)
  return { abMin: Math.min(neu.abMin, bisMin - s), bisMin }
}

/** Rückfahrt frühestens `mindestNaechte` Tage nach der Hinfahrt; fehlt sie oder liegt sie davor, wird sie angehoben. */
export function rueckAnheben(datum: string, rueck: string | undefined, mindestNaechte = 0): string {
  const fruehestens = tageAddieren(datum, mindestNaechte)
  return rueck && rueck > fruehestens ? rueck : fruehestens
}

/**
 * Wert eines Datumsfelds, wenn er übernommen werden darf: ein echtes Kalenderdatum ab `fruehestens`, sonst undefined.
 * Zwischenstände beim Tippen (Chrome meldet etwa 0002-12-05) und Vergangenes fallen heraus.
 */
export function datumAusEingabe(wert: string, fruehestens: string): string | undefined {
  return istDatum(wert) && wert >= fruehestens ? wert : undefined
}

/**
 * Wird aus mehreren Tagen eine Tagestour (Chip, Rückdatum), passt ein „zurück bis“ vor „los ab“ nicht mehr: Es fällt auf
 * die Vorgabe zurück, mindestens eine Stufe nach „los ab“. Sonst bleibt alles, wie es ist.
 */
export function zeitenFuerTagestour<Z extends Zeitfenster>(z: Z): Z {
  const s = ZEITBAND.schrittMin
  if (z.rueck !== z.datum || z.bisMin >= z.abMin + s) return z
  return { ...z, bisMin: Math.min(ZEITBAND.bisMin, Math.max(STANDARD_ZEITFENSTER.bisMin, z.abMin + s)) }
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
  // Ein rueck gehört zu seinem datum: Fehlt das datum oder ist es abgelaufen, gilt es nicht mehr (sonst blieben Nächte
  // eines alten Links unsichtbar hinter leeren Datumsfeldern stehen).
  const rueck = rueckAnheben(datum, datumGueltig && rueckGueltig ? rueckRoh : undefined, opts.mindestNaechte ?? 0)

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
