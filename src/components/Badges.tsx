import { BETREIBER_LABEL, TICKET_LABEL, type BetreiberTyp, type Ticket } from '@/lib/content/labels'
import type { Bewertung } from '@/lib/bewertung'
import { minutenAlsDauer } from '@/lib/datum'
import type { HuettenZustand } from '@/lib/saison'
import { naechteText } from '@/lib/zeitraum'

/**
 * Passt die Verbindung ins Zeitfenster? Tagestour "passt, 7:37 h vor Ort", mehrere Tage "passt · 1 Nacht", sonst der
 * Grund ("keine Rückfahrt bis 21:00", "fährt am Datum nicht").
 */
export function PassungBadge({ passung }: { passung: Bewertung | undefined }) {
  if (!passung) return null
  if (!passung.passt) return <span className="badge bg-nebel text-tinte-2">{passung.grund}</span>
  const text = passung.naechte > 0 ? `passt · ${naechteText(passung.naechte)}` : `passt, ${minutenAlsDauer(passung.vorOrtMin)} vor Ort`
  return <span className="badge bg-tanne-tint text-tanne">{text}</span>
}

const ZUSTAND_TEXT: Record<HuettenZustand['zustand'], string> = { offen: 'offen', winterraum: 'nur Winterraum', geschlossen: 'geschlossen' }
const ZUSTAND_KLASSE: Record<HuettenZustand['zustand'], string> = {
  offen: 'bg-tanne-tint text-tanne', winterraum: 'bg-nebel text-tinte', geschlossen: 'bg-signal-tint text-signal',
}

/** Zustand einer Hütte am Datum; "vermutlich", wenn er nur aus der Saison geschätzt ist. */
export function ZustandBadge({ zustand, datumText }: { zustand: HuettenZustand; datumText?: string }) {
  const text = `${zustand.sicher ? '' : 'vermutlich '}${ZUSTAND_TEXT[zustand.zustand]}`
  return <span className={`badge ${ZUSTAND_KLASSE[zustand.zustand]}`}>{datumText ? `${datumText}: ${text}` : text}</span>
}

export function TicketBadge({ ticket }: { ticket: Ticket }) {
  return <span className="badge bg-nebel text-tinte-2">{TICKET_LABEL[ticket]}</span>
}

const BETREIBER_PUNKT: Record<BetreiberTyp, string> = {
  dav: 'bg-dav', sac: 'bg-sac', oeav: 'bg-tinte-2', caf: 'bg-stufe-4', naturfreunde: 'bg-stufe-3', privat: 'bg-tinte-3',
}

export function BetreiberBadge({ typ, sektion }: { typ: BetreiberTyp; sektion?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-tinte-2">
      <span className={`inline-block size-2.5 rounded-full ${BETREIBER_PUNKT[typ]}`} aria-hidden />
      {BETREIBER_LABEL[typ]}{sektion ? ` ${sektion}` : ''}
    </span>
  )
}
