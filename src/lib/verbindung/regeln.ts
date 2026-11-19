import type { Land, Tagesfenster, Ticket, TicketTabelle } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'

export const TAGESZIEL = {
  ankunftBisMin: 10 * 60,
  rueckfahrtAbMin: 16 * 60 + 30,
  mindestFensterMin: 6 * 60,
} as const

export function tourenfensterMin(ankunftIso: string, rueckfahrtAbfahrtIso: string): number {
  return Math.round((Date.parse(rueckfahrtAbfahrtIso) - Date.parse(ankunftIso)) / 60_000)
}

export function istTagesziel(
  w: { ankunftMin: number; rueckfahrtMin: number; tourenfensterMin: number },
  mindestFensterMin: number = TAGESZIEL.mindestFensterMin,
): boolean {
  return (
    w.ankunftMin <= TAGESZIEL.ankunftBisMin &&
    w.rueckfahrtMin >= TAGESZIEL.rueckfahrtAbMin &&
    w.tourenfensterMin >= mindestFensterMin
  )
}

export type TageszielUrteil = { tagesziel?: boolean; grund?: string }

const alsMinuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
/** "09:12" → "9:12" */
const uhrzeit = (hhmm: string) => hhmm.replace(/^0(?=\d:)/, '')

/**
 * Tagesziel-Urteil aus einem Tagesfenster (früheste Ankunft, letzte Rückfahrt, beide lokal "HH:MM").
 * Ohne Fenster kein Urteil; fehlt Ankunft oder Rückfahrt im Fenster, gibt es an dem Tag keine Verbindung.
 */
export function tageszielAusFenster(
  fenster: Tagesfenster | undefined,
  mindestFensterMin: number = TAGESZIEL.mindestFensterMin,
): TageszielUrteil {
  if (!fenster) return {}
  if (!fenster.ankunft) return { tagesziel: false, grund: 'Keine Hinfahrt an diesem Tag' }
  if (!fenster.letzteRueckfahrt) return { tagesziel: false, grund: 'Keine Rückfahrt am selben Tag' }
  const ankunft = alsMinuten(fenster.ankunft)
  const rueckfahrt = alsMinuten(fenster.letzteRueckfahrt)
  if (ankunft > TAGESZIEL.ankunftBisMin) return { tagesziel: false, grund: `Ankunft erst ${uhrzeit(fenster.ankunft)}` }
  if (rueckfahrt < TAGESZIEL.rueckfahrtAbMin) return { tagesziel: false, grund: `Letzte Rückfahrt schon ${uhrzeit(fenster.letzteRueckfahrt)}` }
  const amBerg = rueckfahrt - ankunft
  if (amBerg < mindestFensterMin) return { tagesziel: false, grund: `Nur ${minutenAlsDauer(amBerg)} am Berg` }
  return { tagesziel: true }
}

export type TicketHinweis = { ticket: Ticket; hinweis: string }

export function ticketFuer(land: Land, hatFernverkehr: boolean, tabelle: TicketTabelle): TicketHinweis {
  const regel = tabelle.regeln.find((r) => r.land === land)
  if (!regel) return { ticket: 'keins', hinweis: 'Kein Ticket-Hinweis für dieses Land.' }
  if (land === 'DE' && hatFernverkehr) return { ticket: 'keins', hinweis: tabelle.fernverkehrHinweis }
  return { ticket: regel.ticket, hinweis: regel.hinweis }
}
