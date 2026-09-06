import { BETREIBER_LABEL, TICKET_LABEL, type BetreiberTyp, type Ticket } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'
import { reisezeitStufe } from '@/lib/stufe'

export { reisezeitStufe }

// Helle Stufen tragen dunklen Text, damit der Kontrast über 4.5:1 bleibt.
const STUFE_KLASSE = {
  2: 'bg-stufe-2 text-white', 3: 'bg-stufe-3 text-tinte', 4: 'bg-stufe-4 text-tinte', 5: 'bg-stufe-5 text-white',
} as const

export function ReisezeitBadge({ fahrzeitMin, ca }: { fahrzeitMin: number; ca?: boolean }) {
  const s = reisezeitStufe(fahrzeitMin)
  return (
    <span className={`badge ${STUFE_KLASSE[s]}`}>
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
