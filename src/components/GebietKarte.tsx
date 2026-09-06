import Link from 'next/link'
import { SPORTART_LABEL } from '@/lib/content/schema'
import type { GebietEintrag } from '@/lib/filter'
import { ReisezeitBadge, TageszielBadge, TicketBadge } from './Badges'

export function GebietKarte({ g, tagesziel, laedt }: { g: GebietEintrag; tagesziel: boolean | undefined; laedt: boolean }) {
  return (
    <Link href={`/gebiet/${g.id}`} className="karte-card no-underline hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{g.name}</h3>
        {g.fahrzeitMin !== undefined ? <ReisezeitBadge fahrzeitMin={g.fahrzeitMin} ca /> : <span className="badge bg-nebel">Fahrzeit offen</span>}
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-tinte-2">{g.beschreibung}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-tinte-3">
        {g.umstiege !== undefined && <span>{g.umstiege} Umstiege</span>}
        {g.anzahlHuetten > 0 && <span>· {g.anzahlHuetten} {g.anzahlHuetten === 1 ? 'Hütte' : 'Hütten'}</span>}
        <span>· {g.sportarten.map((s) => SPORTART_LABEL[s]).join(', ')}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {laedt ? <span className="skeleton h-6 w-24" /> : <TageszielBadge tagesziel={tagesziel} />}
        {g.ticket && <TicketBadge ticket={g.ticket} />}
      </div>
    </Link>
  )
}
