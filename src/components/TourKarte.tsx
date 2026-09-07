import { TOUR_ANBIETER_LABEL, type Tour } from '@/lib/content/schema'
import { tourMeta } from '@/lib/touren'

export function TourKarte({ tour }: { tour: Tour }) {
  const meta = tourMeta(tour)
  return (
    <div className="karte-card">
      <h3 className="text-lg font-semibold leading-snug">
        <a href={tour.url} target="_blank" rel="noreferrer" className="text-tinte no-underline hover:underline">{tour.titel}</a>
      </h3>
      {meta.length > 0 && (
        <p className="mt-1 text-sm text-tinte-2 tabular-nums">{meta.join(' · ')}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="badge bg-nebel text-tinte-2">{TOUR_ANBIETER_LABEL[tour.anbieter]}</span>
        {tour.oeffiTauglich && <span className="badge bg-tanne-tint text-tanne">ÖV-tauglich</span>}
      </div>
    </div>
  )
}
