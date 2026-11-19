import type { Huette, Haltestelle } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'
import { BetreiberBadge } from './Badges'
import { HuettenZustandKurz } from './HuettenZustand'
import { ZeitraumLink } from './Zeitraum'

/** Merkmale, die vor der Buchung zählen: "nur für Mitglieder", "Selbstversorger", "40 Plätze". */
export function huettenMerkmale(h: Pick<Huette, 'nurMitglieder' | 'selbstversorger' | 'plaetze'>): string[] {
  return [
    ...(h.nurMitglieder ? ['nur für Mitglieder'] : []),
    ...(h.selbstversorger ? ['Selbstversorger'] : []),
    ...(h.plaetze ? [`${h.plaetze} Plätze`] : []),
  ]
}

export function HuetteKarte({ huette, haltestellen }: { huette: Huette; haltestellen: Haltestelle[] }) {
  const z = huette.zustiege[0]
  const h = haltestellen.find((x) => x.id === z.haltestelleId)
  const merkmale = huettenMerkmale(huette)
  return (
    <ZeitraumLink href={`/huette/${huette.id}`} className="karte-card no-underline hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{huette.name}</h3>
        <span className="zahl text-sm text-tinte-2">{huette.hoehe} m</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <BetreiberBadge typ={huette.betreiber.typ} sektion={huette.betreiber.sektion} />
        <HuettenZustandKurz huette={huette} />
      </div>
      <p className="mt-2 text-sm text-tinte-2">
        {huette.geschaetzt ? 'ca. ' : ''}{minutenAlsDauer(z.gehzeitMin)} Zustieg{z.bergbahn ? ' mit Bergbahn' : ''} ab {h?.name ?? z.haltestelleId}
        {z.hoehenmeter ? ` · ${z.hoehenmeter} hm` : ''}
      </p>
      {merkmale.length > 0 && <p className="mt-1 text-xs text-tinte-3">{merkmale.join(' · ')}</p>}
    </ZeitraumLink>
  )
}
