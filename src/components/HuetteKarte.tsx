import Link from 'next/link'
import type { Huette, Haltestelle } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'
import { BetreiberBadge } from './Badges'

export function HuetteKarte({ huette, haltestellen }: { huette: Huette; haltestellen: Haltestelle[] }) {
  const z = huette.zustiege[0]
  const h = haltestellen.find((x) => x.id === z.haltestelleId)
  return (
    <Link href={`/huette/${huette.id}`} className="karte-card no-underline hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{huette.name}</h3>
        <span className="zahl text-sm text-tinte-2">{huette.hoehe} m</span>
      </div>
      <div className="mt-1"><BetreiberBadge typ={huette.betreiber.typ} sektion={huette.betreiber.sektion} /></div>
      <p className="mt-2 text-sm text-tinte-2">
        {minutenAlsDauer(z.gehzeitMin)} Zustieg{z.bergbahn ? ' mit Bergbahn' : ''} ab {h?.name ?? z.haltestelleId}
        {z.hoehenmeter ? ` · ${z.hoehenmeter} hm` : ''}
      </p>
    </Link>
  )
}
