import type { Gebiet, Haltestelle, Startort } from '@/lib/content/schema'
import { tageDifferenz } from '@/lib/datum'
import { bedientAm, tagesklasse } from '@/lib/saison'
import { tageszielAusFenster } from './regeln'
import { SAISON_HINWEIS } from './service'

/** Urteil der Startseite je Gebiet; `tagesziel` fehlt, wenn es kein Urteil gibt (mehrtägig, kein Tagesfenster). */
export type UebersichtEintrag = { tagesziel?: boolean; grund?: string; naechte: number; quelle: 'tagesfenster' }

/**
 * Tagesziel-Urteile für alle Gebiete aus den vorberechneten Tagesfenstern des Hauptzugangs (erste Haltestelle),
 * ganz ohne Live-Abfragen. Fährt der Hauptzugang am Datum nicht (Saisonbetrieb), ist es kein Tagesziel.
 */
export function uebersichtBerechnen(
  inhalt: { gebiete: Gebiet[]; haltestellen: Haltestelle[] },
  startort: Pick<Startort, 'id'>,
  z: { datum: string; rueck: string; fenster: number },
): Record<string, UebersichtEintrag> {
  const naechte = tageDifferenz(z.datum, z.rueck)
  const klasse = tagesklasse(z.datum)
  const ergebnis: Record<string, UebersichtEintrag> = {}
  for (const g of inhalt.gebiete) {
    const h = inhalt.haltestellen.find((x) => x.id === g.haltestellen[0])
    if (!h) continue
    const basis = { naechte, quelle: 'tagesfenster' as const }
    if (!bedientAm(h, z.datum)) {
      ergebnis[g.id] = naechte > 0 ? { grund: SAISON_HINWEIS, ...basis } : { tagesziel: false, grund: SAISON_HINWEIS, ...basis }
      continue
    }
    if (naechte > 0) { ergebnis[g.id] = basis; continue }
    const u = tageszielAusFenster(h.richtwerte[startort.id]?.tagesfenster?.[klasse], z.fenster)
    ergebnis[g.id] = { ...u, ...basis }
  }
  return ergebnis
}
