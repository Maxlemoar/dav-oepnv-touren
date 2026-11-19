// Zuständiger Lawinenwarndienst. Bewusst ohne zod: läuft im Browser. Nur Links, keine Gefahrenstufen
// (Lizenz für die EAWS-Daten ungeklärt, siehe docs/research/naechstes-level.md).
import type { Land } from '@/lib/content/schema'
import type { Sportart } from '@/lib/content/labels'
import { imZeitraum } from '@/lib/saison'

export type Lawinendienst = { id: 'slf' | 'vorarlberg' | 'tirol' | 'bayern'; name: string; url: string }

/** URLs geprüft am 19.11.2026 (HTTP 200). */
export const LAWINENDIENSTE = {
  slf: { id: 'slf', name: 'Lawinenbulletin des SLF', url: 'https://www.slf.ch/de/lawinenbulletin-und-schneesituation/' },
  vorarlberg: { id: 'vorarlberg', name: 'Lawinenwarndienst Vorarlberg', url: 'https://warnung.vorarlberg.at/vtgdb/dist/index.html#//lwd_lagebericht_de.html' },
  tirol: { id: 'tirol', name: 'Lawinen.report (Tirol)', url: 'https://lawinen.report/bulletin/latest' },
  bayern: { id: 'bayern', name: 'Lawinenwarndienst Bayern', url: 'https://lawinenwarndienst.bayern.de/' },
} as const satisfies Record<Lawinendienst['id'], Lawinendienst>

/** Zuordnung über Land und Region der Haltestelle. Schwarzwald, Alb und Vogesen haben keinen Lawinenwarndienst. */
export function lawinendienstFuer(h: { land: Land; region: string }): Lawinendienst | undefined {
  if (h.land === 'CH') return LAWINENDIENSTE.slf
  if (h.land === 'AT') return /Tirol/.test(h.region) ? LAWINENDIENSTE.tirol : LAWINENDIENSTE.vorarlberg
  if (h.land === 'DE' && /Allgäu|Oberbayern|Berchtesgaden|Werdenfels|Chiemgau/.test(h.region)) return LAWINENDIENSTE.bayern
  return undefined
}

/** Alle zuständigen Dienste der Haltestellen, jeder einmal. */
export function lawinendienste(haltestellen: { land: Land; region: string }[]): Lawinendienst[] {
  const dienste = haltestellen.map(lawinendienstFuer).filter((d): d is Lawinendienst => Boolean(d))
  return [...new Map(dienste.map((d) => [d.id, d])).values()]
}

/** Winterziel: Skitouren oder Schneeschuh im Gebiet oder Hütte über 1500 m. */
export function lawinenRelevant(o: { sportarten?: readonly Sportart[]; hoehe?: number }): boolean {
  return Boolean(o.sportarten?.some((s) => s === 'skitour' || s === 'schneeschuh')) || (o.hoehe ?? 0) > 1500
}

/** Lawinenzeit vom 1. Dezember bis 30. April. */
export function lawinenSaison(datum: string): boolean {
  return imZeitraum(datum, { von: '12-01', bis: '04-30' })
}
