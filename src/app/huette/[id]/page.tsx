import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { inhalt, findeHuette, findeGebiet, findeHaltestelle, sichtbareStartorte } from '@/lib/content/laden'
import { SAISON_LABEL } from '@/lib/content/labels'
import { co2ErsparnisKg } from '@/lib/co2'
import { minutenAlsDauer } from '@/lib/datum'
import { lawinendienste, lawinenRelevant } from '@/lib/lawinen'
import { gruppenHinweisFuer } from '@/lib/teilen'
import { BetreiberBadge } from '@/components/Badges'
import { Co2Zeile } from '@/components/Co2Zeile'
import { FehlerMelden } from '@/components/FehlerMelden'
import { KostenZeile } from '@/components/KostenZeile'
import { LawinenHinweis } from '@/components/LawinenHinweis'
import { WetterZeile } from '@/components/WetterZeile'
import { VerbindungZeile } from '@/components/VerbindungZeile'
import { huettenMerkmale } from '@/components/HuetteKarte'
import { BedientHinweis, HuettenZustandBanner } from '@/components/HuettenZustand'
import { ZeitraumLink, ZeitraumPill } from '@/components/Zeitraum'
import type { Metadata } from 'next'
import { huetteBeschreibungFuer, huetteJsonLd, jsonLdText, seitenMetadaten } from '@/lib/metadaten'

export function generateStaticParams() {
  return inhalt().huetten.map((h) => ({ id: h.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const i = inhalt()
  const h = findeHuette(i, id)
  if (!h) return { title: 'Hütte' }
  return seitenMetadaten({ titel: h.name, beschreibung: huetteBeschreibungFuer(i, h), pfad: `/huette/${h.id}` })
}


export default async function HuetteSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const huette = findeHuette(i, id)
  if (!huette) notFound()
  const gebiet = findeGebiet(i, huette.gebietId)!
  const startort = sichtbareStartorte(i)[0]
  const dienste = lawinenRelevant({ sportarten: gebiet.sportarten, hoehe: huette.hoehe })
    ? lawinendienste(huette.zustiege.map((z) => findeHaltestelle(i, z.haltestelleId)!))
    : []

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(huetteJsonLd(huette, huetteBeschreibungFuer(i, huette))) }} />
      <header>
        <ZeitraumLink href={`/gebiet/${gebiet.id}`} className="text-sm text-tanne">← {gebiet.name}</ZeitraumLink>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{huette.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-tinte-2">
          <BetreiberBadge typ={huette.betreiber.typ} sektion={huette.betreiber.sektion} />
          <span className="zahl">{huette.hoehe} m</span>
          <span>{SAISON_LABEL[huette.saison]}</span>
          {huettenMerkmale(huette).map((m) => <span key={m} className="badge bg-nebel text-tinte-2">{m}</span>)}
        </div>
        <div className="mt-3"><HuettenZustandBanner huette={huette} /></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {huette.buchungUrl && <a href={huette.buchungUrl} target="_blank" rel="noreferrer" className="knopf">Buchen</a>}
          {huette.webUrl && <a href={huette.webUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer">Hüttenseite</a>}
        </div>
        <div className="mt-4"><ZeitraumPill mindestNaechte={1} /></div>
        <WetterZeile ort={{ huette: huette.id }} mindestNaechte={1} className="mt-3" />
        <LawinenHinweis dienste={dienste} mindestNaechte={1} className="mt-3" />
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Anreise ab {startort.name}</h2>
        {huette.zustiege.map((z, n) => {
          const h = findeHaltestelle(i, z.haltestelleId)!
          const r = h.richtwerte[startort.id]
          return (
            <div key={n} className="karte-card space-y-3">
              <div>
                <div className="font-medium">Bis {h.name}</div>
                <BedientHinweis haltestelle={h} />
                <p className="text-sm text-tinte-2">
                  Zustieg {minutenAlsDauer(z.gehzeitMin)}{z.bergbahn ? ' mit Bergbahn' : ''}{z.hoehenmeter ? `, ${z.hoehenmeter} hm` : ''}
                  {z.hinweis ? ` · ${z.hinweis}` : ''}
                </p>
              </div>
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={{ id: startort.id, name: startort.name, bahn: startort.bahn }} nach={{ id: h.id, name: h.name, land: h.land, bahn: h.bahn }} mindestNaechte={1} zustiegMin={z.gehzeitMin}
                  bergbahn={z.bergbahn} huetteName={huette.name} gruppe={gruppenHinweisFuer(i.tickets, h.land)} />
              </Suspense>
              {r && <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />}
              {r && <KostenZeile strassenKm={r.strassenKm} ticket={r.ticket} />}
            </div>
          )
        })}
        {huette.geschaetzt && <p className="text-sm text-tinte-3">Zustiegszeiten sind geschätzt. <FehlerMelden titel={huette.name} /></p>}
      </section>

      <footer className="text-sm text-tinte-3">
        Quelle: <a href={huette.quelle} target="_blank" rel="noreferrer" className="underline">{new URL(huette.quelle).hostname}</a> · <FehlerMelden titel={huette.name} />
      </footer>
    </article>
  )
}
