import Link from 'next/link'
import { SPORTART_LABEL } from '@/lib/content/schema'
import type { GebietEintrag } from '@/lib/filter'
import { naechteText } from '@/lib/zeitraum'
import { ReisezeitBadge, SektionshausBadge, TageszielBadge, TicketBadge } from './Badges'

type Props = {
  g: GebietEintrag
  tagesziel: boolean | undefined
  laedt: boolean
  /** Nächte im gewählten Zeitraum; ab 1 gibt es kein Tagesziel-Urteil, dafür die Nächte-Zeile bei Gebieten mit Hütten. */
  naechte: number
}

export function GebietKarte({ g, tagesziel, laedt, naechte }: Props) {
  const tagestour = naechte === 0
  return (
    <Link href={`/gebiet/${g.id}`} className="karte-card no-underline hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug">{g.name}</h3>
        <span className="shrink-0 pt-0.5">
          {g.fahrzeitMin !== undefined ? <ReisezeitBadge fahrzeitMin={g.fahrzeitMin} ca /> : <span className="badge bg-nebel">Fahrzeit offen</span>}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-tinte-2">{g.beschreibung}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-tinte-3">
        {g.umstiege !== undefined && <span>{g.umstiege} Umstiege</span>}
        {g.anzahlHuetten > 0 && <span>· {g.anzahlHuetten} {g.anzahlHuetten === 1 ? 'Hütte' : 'Hütten'}</span>}
        {g.anzahlTouren > 0 && <span>· {g.anzahlTouren} {g.anzahlTouren === 1 ? 'Tour' : 'Touren'}</span>}
        <span>· {g.region}</span>
        <span>· {g.sportarten.map((s) => SPORTART_LABEL[s]).join(', ')}</span>
      </div>
      {(tagestour || g.ticket || g.sektionshaus) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {g.sektionshaus && <SektionshausBadge />}
          {tagestour && (laedt ? <span className="skeleton h-6 w-24" /> : <TageszielBadge tagesziel={tagesziel} />)}
          {g.ticket && <TicketBadge ticket={g.ticket} />}
        </div>
      )}
      {!tagestour && g.anzahlHuetten > 0 && <p className="mt-1.5 text-xs text-tinte-3">{naechteText(naechte)}</p>}
    </Link>
  )
}
