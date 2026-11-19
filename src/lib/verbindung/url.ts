// Bewusst ohne zod: diese Hilfen laufen im Browser (Startseite, Verbindungszeile).
import { lokalesDatum, naechsterSamstag } from '@/lib/datum'
import { rueckAnheben } from '@/lib/zeitraum'

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/
const STANDARD_FENSTER = 360

/**
 * Zeitraum und Tourenfenster aus der Seiten-URL. Ohne gültiges oder mit vergangenem datum gilt der kommende
 * Samstag, ohne rueck das Hin-Datum; rueck liegt nie vor datum + mindestNaechte (Hüttenseiten 1, Gebiete 0).
 */
export function zeitraumAusUrl(sp: URLSearchParams, mindestNaechte: number, heute: string = lokalesDatum(new Date())) {
  const roh = sp.get('datum')
  const datum = roh && ISO_DATUM.test(roh) && roh >= heute ? roh : naechsterSamstag(new Date(`${heute}T12:00:00Z`))
  const rueckRoh = sp.get('rueck')
  return {
    datum,
    rueck: rueckAnheben(datum, rueckRoh && ISO_DATUM.test(rueckRoh) ? rueckRoh : undefined, mindestNaechte),
    fenster: fensterAusUrl(sp.get('fenster')),
  }
}

/** Tourenfenster in Minuten, auf 1 bis 12 Stunden begrenzt; Unlesbares wird zum Standard von 6 Stunden. */
export function fensterAusUrl(roh: string | null): number {
  const n = Number(roh ?? STANDARD_FENSTER)
  if (!Number.isFinite(n)) return STANDARD_FENSTER
  return Math.min(720, Math.max(60, Math.round(n)))
}

/** Zeitraum ohne Mindestnächte, für die Startseite. */
export function verbindungParameter(sp: URLSearchParams, heute?: string) {
  return zeitraumAusUrl(sp, 0, heute)
}
