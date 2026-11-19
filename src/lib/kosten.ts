import type { Ticket } from '@/lib/content/labels'

/**
 * Fahrtkostenregel der Sektion für Fahrgemeinschaften: "Kostenbeteiligung von 0,30 € pro Person und km"
 * (geprüft am 19.11.2026), ohne Maut und Parkgebühren.
 */
export const FAHRTKOSTEN_REGEL = {
  euroProPersonUndKm: 0.3,
  quelle: 'https://www.dav-offenburg.de/programm/touren/Hinweise',
} as const

/** Mitfahrkosten pro Person für Hin- und Rückfahrt mit dem Auto, auf 5 € gerundet, mindestens 5 €. */
export function autoKostenEuro(strassenKm: number | undefined, satz: number = FAHRTKOSTEN_REGEL.euroProPersonUndKm): number | undefined {
  if (!strassenKm) return undefined
  return Math.max(5, Math.round((strassenKm * 2 * satz) / 5) * 5)
}

/** Kurzer Ticket-Hinweis für die Bahn, bewusst ohne Preise (die schwanken und sind nicht belegt). */
export function bahnTicketKurz(ticket: Ticket): string {
  switch (ticket) {
    case 'deutschlandticket': return 'Mit dem Deutschlandticket ohne Zusatzkosten.'
    case 'halbtax': return 'Mit der Bahn bis Basel Bad Bf mit Deutschlandticket, ab dort SBB-Ticket, mit Halbtax zum halben Preis.'
    case 'europass': return 'Mit der Bahn bis Kehl mit Deutschlandticket, ab dort Europass oder TER-Ticket.'
    case 'keins': return 'Mit der Bahn: Einzelticket, Sparpreis früh buchen.'
  }
}
