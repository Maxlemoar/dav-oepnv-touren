import Link from 'next/link'
import type { Haltestelle } from '@/lib/content/schema'
import { anreise, type Sektionstour } from '@/lib/dav360'
import { datumKurz, datumLesbar } from '@/lib/datum'
import { SektionstourVerbindung } from './SektionstourVerbindung'

export type SektionstourZiel = {
  gebiet: { id: string; name: string }
  huette?: { id: string; name: string }
  zugang: Haltestelle
  sicherheit: 'hoch' | 'mittel'
  grund: string
}

type Props = {
  tour: Sektionstour
  ziel?: SektionstourZiel
  start: { id: string; name: string }
}

function zeitraum(t: Sektionstour): string {
  return t.ende === t.start ? datumLesbar(t.start) : `${datumKurz(t.start)} – ${datumLesbar(t.ende)}`
}

export function SektionstourKarte({ tour, ziel, start }: Props) {
  const a = anreise(tour)
  const richtwert = ziel?.zugang.richtwerte[start.id]
  return (
    <article className="karte-card space-y-3">
      <div>
        <p className="text-sm text-tinte-3">
          <span className="zahl text-tinte-2">{zeitraum(tour)}</span>
          {tour.kategorie && <> · {tour.kategorie}</>}
        </p>
        <h3 className="mt-0.5 text-lg font-semibold leading-snug">
          {tour.link
            ? <a href={tour.link} target="_blank" rel="noreferrer" className="text-tinte underline decoration-linie underline-offset-4 hover:decoration-tanne">{tour.titel}</a>
            : tour.titel}
        </h3>
        {tour.untertitel && <p className="text-sm text-tinte-2">{tour.untertitel}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-tinte-2">
          {a.art === 'oeffi' && <span className="badge bg-tanne-tint text-tanne">Öffi</span>}
          {a.art === 'andere' && <span className="badge bg-nebel text-tinte-2" title={tour.anreisehinweis}>{a.kurz}</span>}
          {tour.leitung.length > 0 && <span>Leitung: {tour.leitung.join(', ')}</span>}
        </div>
      </div>

      {ziel ? (
        <div className="space-y-2 border-t border-linie pt-3">
          <p className="text-sm text-tinte-2">
            {ziel.sicherheit === 'mittel' ? 'Vermutlich: ' : 'Ziel: '}
            <Link href={`/gebiet/${ziel.gebiet.id}?${new URLSearchParams({ datum: tour.start, rueck: tour.ende }).toString()}`} className="font-medium text-tanne underline">
              {ziel.gebiet.name}
            </Link>
            {ziel.huette && <> · {ziel.huette.name}</>}
            <span className="text-tinte-3" title={ziel.grund}> · ab {ziel.zugang.name}</span>
          </p>
          <SektionstourVerbindung
            tourId={tour.id}
            start={start}
            ziel={{ id: ziel.zugang.id, name: ziel.zugang.name, land: ziel.zugang.land }}
            gebietId={ziel.gebiet.id}
            datum={tour.start}
            rueck={tour.ende}
            richtwert={richtwert && { fahrzeitMin: richtwert.fahrzeitMin, umstiege: richtwert.umstiege }}
          />
        </div>
      ) : (
        <p className="text-xs text-tinte-3">Kein Ziel aus unserer Liste erkannt.</p>
      )}
    </article>
  )
}
