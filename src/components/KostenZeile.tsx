import type { Ticket } from '@/lib/content/labels'
import { autoKostenEuro, bahnTicketKurz, FAHRTKOSTEN_REGEL } from '@/lib/kosten'

const SATZ = FAHRTKOSTEN_REGEL.euroProPersonUndKm.toFixed(2).replace('.', ',')

/** Kostenvergleich unter der CO2-Zeile: Mitfahrkosten nach der Sektionsregel gegen den Ticket-Hinweis, ohne Ticketpreise. */
export function KostenZeile({ strassenKm, ticket }: { strassenKm?: number; ticket?: Ticket }) {
  const euro = autoKostenEuro(strassenKm)
  if (euro === undefined) return null
  return (
    <p className="text-sm text-tinte-2">
      🚗 Als Mitfahrer im Auto nach der{' '}
      <a href={FAHRTKOSTEN_REGEL.quelle} target="_blank" rel="noreferrer" className="underline">Fahrtkostenregel der Sektion</a>{' '}
      ({SATZ} € pro Person und km): ca. <span className="zahl">{euro} €</span> hin und zurück, zuzüglich Maut und Parken.
      {ticket && <> {bahnTicketKurz(ticket)}</>}
    </p>
  )
}
