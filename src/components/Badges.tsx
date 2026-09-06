import { BETREIBER_LABEL, TICKET_LABEL, type BetreiberTyp, type Ticket } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'

export function reisezeitStufe(fahrzeitMin: number): 2 | 3 | 4 | 5 {
  if (fahrzeitMin <= 120) return 2
  if (fahrzeitMin <= 180) return 3
  if (fahrzeitMin <= 240) return 4
  return 5
}

const STUFE_KLASSE = { 2: 'bg-stufe-2', 3: 'bg-stufe-3', 4: 'bg-stufe-4', 5: 'bg-stufe-5' } as const

export function ReisezeitBadge({ fahrzeitMin, ca }: { fahrzeitMin: number; ca?: boolean }) {
  const s = reisezeitStufe(fahrzeitMin)
  return (
    <span className={`badge text-white ${STUFE_KLASSE[s]}`}>
      {ca ? 'ca. ' : ''}{minutenAlsDauer(fahrzeitMin)}
    </span>
  )
}

export function TageszielBadge({ tagesziel }: { tagesziel: boolean | undefined }) {
  if (tagesziel === undefined) return null
  return tagesziel
    ? <span className="badge bg-signal text-white">Tagesziel</span>
    : <span className="badge bg-nebel text-tinte-2">Besser mit Übernachtung</span>
}

export function TicketBadge({ ticket }: { ticket: Ticket }) {
  return <span className="badge bg-nebel text-tinte-2">{TICKET_LABEL[ticket]}</span>
}

const BETREIBER_PUNKT: Record<BetreiberTyp, string> = {
  dav: 'bg-dav', sac: 'bg-sac', oeav: 'bg-tinte-2', naturfreunde: 'bg-stufe-3', privat: 'bg-tinte-3',
}

export function BetreiberBadge({ typ, sektion }: { typ: BetreiberTyp; sektion?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-tinte-2">
      <span className={`inline-block size-2.5 rounded-full ${BETREIBER_PUNKT[typ]}`} aria-hidden />
      {BETREIBER_LABEL[typ]}{sektion ? ` ${sektion}` : ''}
    </span>
  )
}
