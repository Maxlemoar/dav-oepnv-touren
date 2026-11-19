// Bewusst ohne zod: läuft im Browser. Beurteilt, ob ein Ausgangsort ins Zeitfenster passt.
import { minutenAlsDauer } from '@/lib/datum'
import { bedientAm, tagesklasse, type Tagesklasse } from '@/lib/saison'
import type { Stufe } from '@/lib/stufe'
import type { Ausgangsort, Fahrt, Tagesplan } from '@/lib/musterfahrplan/typen'
import { alsMin, alsUhrzeit, naechte, type Zeitfenster } from '@/lib/zeitfenster'

export type Bewertung =
  | { passt: true; hin: Fahrt; rueck: Fahrt; vorOrtMin: number; naechte: number }
  | { passt: false; grund: string; naechte: number }

const min = (hhmm: string): number => alsMin(hhmm) ?? Number.NaN
/** Fahrten über Mitternacht (an < ab) oder mit unlesbarer Zeit zählen nie. */
const gueltig = (f: Fahrt): boolean => min(f.an) >= min(f.ab)
const nein = (grund: string, n: number): Bewertung => ({ passt: false, grund, naechte: n })

/** Bewertet ein festes Paar Hin-/Rückfahrt gegen das Zeitfenster. */
export function passungPaar(hin: Fahrt | undefined, rueck: Fahrt | undefined, z: Zeitfenster): Bewertung {
  const n = naechte(z)
  if (!hin || !gueltig(hin) || min(hin.ab) < z.abMin) return nein(`keine Hinfahrt ab ${alsUhrzeit(z.abMin)}`, n)
  if (!rueck || !gueltig(rueck) || min(rueck.an) > z.bisMin) return nein(`keine Rückfahrt bis ${alsUhrzeit(z.bisMin)}`, n)
  const vorOrtMin = n * 1440 + min(rueck.ab) - min(hin.an)
  if (n === 0) {
    if (min(rueck.ab) < min(hin.an)) return nein(`Ankunft erst ${alsUhrzeit(min(hin.an))}`, n)
    if (vorOrtMin < z.vorOrtMin) return nein(`nur ${minutenAlsDauer(vorOrtMin)} vor Ort`, n)
  }
  return { passt: true, hin, rueck, vorOrtMin, naechte: n }
}

export function bewerte(
  ort: Pick<Ausgangsort, 'bedient'>,
  hinPlan: Tagesplan | undefined,
  rueckPlan: Tagesplan | undefined,
  z: Zeitfenster,
): Bewertung {
  const n = naechte(z)
  if (!bedientAm(ort, z.datum) || !bedientAm(ort, z.rueck)) return nein('fährt am Datum nicht', n)
  if (!hinPlan || !rueckPlan) return nein('keine Fahrplandaten', n)
  const hins = hinPlan.hin.filter((h) => gueltig(h) && min(h.ab) >= z.abMin)
  if (hins.length === 0) return nein(`keine Hinfahrt ab ${alsUhrzeit(z.abMin)}`, n)
  const ruecks = rueckPlan.rueck.filter((r) => gueltig(r) && min(r.an) <= z.bisMin)
  if (ruecks.length === 0) return nein(`keine Rückfahrt bis ${alsUhrzeit(z.bisMin)}`, n)

  if (n > 0) {
    // Früheste Ankunft, späteste Abfahrt (bei Gleichstand weniger Umstiege, früherer Beginn).
    const hin = hins.reduce((a, b) => (min(b.an) < min(a.an) || (min(b.an) === min(a.an) && b.umstiege < a.umstiege) ? b : a))
    const rueck = ruecks.reduce((a, b) => (min(b.ab) > min(a.ab) || (min(b.ab) === min(a.ab) && b.umstiege < a.umstiege) ? b : a))
    return passungPaar(hin, rueck, z)
  }

  let best: { hin: Fahrt; rueck: Fahrt; weile: number } | undefined
  for (const h of hins) {
    for (const r of ruecks) {
      const weile = min(r.ab) - min(h.an)
      if (weile < 0) continue
      const besser =
        !best ||
        weile > best.weile ||
        (weile === best.weile &&
          (h.umstiege + r.umstiege < best.hin.umstiege + best.rueck.umstiege ||
            (h.umstiege + r.umstiege === best.hin.umstiege + best.rueck.umstiege && min(h.ab) < min(best.hin.ab))))
      if (besser) best = { hin: h, rueck: r, weile }
    }
  }
  if (!best) return nein(`Ankunft erst ${alsUhrzeit(Math.min(...hins.map((h) => min(h.an))))}`, n)
  return passungPaar(best.hin, best.rueck, z)
}

/**
 * Bewertet alle Ausgangsorte (Schlüssel: Gebiets-id). Hinfahrten aus dem Plan der Tagesklasse von `datum`,
 * Rückfahrten aus dem der Tagesklasse von `rueck`; die Pläne sind nach Haltestellen-id abgelegt.
 */
export function bewerteAlle(
  orte: Ausgangsort[],
  plaene: Partial<Record<Tagesklasse, Record<string, Tagesplan>>>,
  z: Zeitfenster,
): Record<string, Bewertung> {
  const hinPlaene = plaene[tagesklasse(z.datum)]
  const rueckPlaene = plaene[tagesklasse(z.rueck)]
  const ergebnis: Record<string, Bewertung> = {}
  for (const ort of orte) ergebnis[ort.id] = bewerte(ort, hinPlaene?.[ort.haltestelleId], rueckPlaene?.[ort.haltestelleId], z)
  return ergebnis
}

/** Passende zuerst: Tagestour nach Zeit vor Ort (mehr zuerst), mehrere Tage und nicht Passende nach Fahrzeit. */
export function sortiere<T extends { ort: Ausgangsort; bewertung: Bewertung }>(eintraege: T[], mehrtaegig: boolean): T[] {
  const fahrzeit = (e: T) => e.ort.fahrzeitMin ?? Number.POSITIVE_INFINITY
  const nachFahrzeit = (a: T, b: T) => (fahrzeit(a) === fahrzeit(b) ? 0 : fahrzeit(a) < fahrzeit(b) ? -1 : 1)
  return [...eintraege].sort((a, b) => {
    if (a.bewertung.passt !== b.bewertung.passt) return a.bewertung.passt ? -1 : 1
    if (a.bewertung.passt && b.bewertung.passt && !mehrtaegig) return b.bewertung.vorOrtMin - a.bewertung.vorOrtMin
    return nachFahrzeit(a, b)
  })
}

export function vorOrtStufe(minuten: number): Stufe {
  if (minuten >= 480) return 2
  if (minuten >= 360) return 3
  if (minuten >= 240) return 4
  return 5
}
