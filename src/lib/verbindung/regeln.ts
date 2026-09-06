import type { Land, Ticket, TicketTabelle } from '@/lib/content/schema'

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

export type TicketHinweis = { ticket: Ticket; hinweis: string }

export function ticketFuer(land: Land, hatFernverkehr: boolean, tabelle: TicketTabelle): TicketHinweis {
  const regel = tabelle.regeln.find((r) => r.land === land)
  if (!regel) return { ticket: 'keins', hinweis: 'Kein Ticket-Hinweis für dieses Land.' }
  if (land === 'DE' && hatFernverkehr) return { ticket: 'keins', hinweis: tabelle.fernverkehrHinweis }
  return { ticket: regel.ticket, hinweis: regel.hinweis }
}
