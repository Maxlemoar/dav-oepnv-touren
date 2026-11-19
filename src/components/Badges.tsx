import { BETREIBER_LABEL, EIGENE_SEKTION, TICKET_LABEL, type BetreiberTyp, type Ticket } from '@/lib/content/labels'
import { minutenAlsDauer } from '@/lib/datum'
import { reisezeitStufe } from '@/lib/stufe'
import type { SaisonProblem } from '@/lib/filter'
import type { HuettenZustand } from '@/lib/saison'

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

/** Tagesziel-Urteil; bei "Besser mit Übernachtung" steht die Begründung klein daneben ("Ankunft erst 10:40"). */
export function TageszielBadge({ tagesziel, grund }: { tagesziel: boolean | undefined; grund?: string }) {
  if (tagesziel === undefined) return null
  if (tagesziel) return <span className="badge bg-signal text-white">Tagesziel</span>
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      <span className="badge bg-nebel text-tinte-2">Besser mit Übernachtung</span>
      {grund && <span className="text-xs text-tinte-3">· {grund}</span>}
    </span>
  )
}

const SAISON_PROBLEM_TEXT: Record<SaisonProblem, string> = { saisonziel: 'Saisonziel', kein_bus: 'am Datum kein Bus' }

/** Hinweis auf Gebieten, die am gewählten Datum schlecht passen (nur sichtbar, wenn der Saison-Schalter aus ist). */
export function SaisonBadge({ problem }: { problem: SaisonProblem }) {
  return <span className="badge border border-signal/40 bg-signal-tint text-signal">{SAISON_PROBLEM_TEXT[problem]}</span>
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

/** Markiert Gebiete mit einem Haus der eigenen Sektion. */
export function SektionshausBadge() {
  return <span className="badge bg-tanne-tint text-tanne">{`Haus der Sektion ${EIGENE_SEKTION}`}</span>
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
