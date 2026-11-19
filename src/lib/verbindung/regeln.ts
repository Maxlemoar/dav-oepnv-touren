import type { Land, Ticket, TicketTabelle } from '@/lib/content/schema'

export type TicketHinweis = { ticket: Ticket; hinweis: string }

export function ticketFuer(land: Land, hatFernverkehr: boolean, tabelle: TicketTabelle): TicketHinweis {
  const regel = tabelle.regeln.find((r) => r.land === land)
  if (!regel) return { ticket: 'keins', hinweis: 'Kein Ticket-Hinweis für dieses Land.' }
  if (land === 'DE' && hatFernverkehr) return { ticket: 'keins', hinweis: tabelle.fernverkehrHinweis }
  return { ticket: regel.ticket, hinweis: regel.hinweis }
}
