import { notFound } from 'next/navigation'
import { Fragment, Suspense } from 'react'
import { inhalt, findeGebiet, findeHaltestelle, huettenImGebiet, sichtbareStartorte } from '@/lib/content/laden'
import { SAISON_LABEL, SPORTART_LABEL } from '@/lib/content/labels'
import { co2ErsparnisKg } from '@/lib/co2'
import { lawinendienste, lawinenRelevant } from '@/lib/lawinen'
import { gruppenHinweisFuer } from '@/lib/teilen'
import { Co2Zeile } from '@/components/Co2Zeile'
import { FehlerMelden } from '@/components/FehlerMelden'
import { HuetteKarte } from '@/components/HuetteKarte'
import { KostenZeile } from '@/components/KostenZeile'
import { LawinenHinweis } from '@/components/LawinenHinweis'
import { WetterZeile } from '@/components/WetterZeile'
import { BedientHinweis } from '@/components/HuettenZustand'
import { ZeitraumLink, ZeitraumPill } from '@/components/Zeitraum'
import { TourEmbed } from '@/components/TourEmbed'
import { TourKarte } from '@/components/TourKarte'
import { VerbindungZeile } from '@/components/VerbindungZeile'
import type { Metadata } from 'next'
import { gebietBeschreibungFuer, gebietJsonLd, jsonLdText, seitenMetadaten } from '@/lib/metadaten'

export function generateStaticParams() {
  return inhalt().gebiete.map((g) => ({ id: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const i = inhalt()
  const gebiet = findeGebiet(i, id)
  if (!gebiet) return { title: 'Gebiet' }
  return seitenMetadaten({ titel: gebiet.name, beschreibung: gebietBeschreibungFuer(i, gebiet), pfad: `/gebiet/${gebiet.id}` })
}


export default async function GebietSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const gebiet = findeGebiet(i, id)
  if (!gebiet) notFound()
  const startort = sichtbareStartorte(i)[0]
  const huetten = huettenImGebiet(i, gebiet.id)
  const haltestellen = gebiet.haltestellen.map((hid) => findeHaltestelle(i, hid)!)
  const dienste = lawinenRelevant({ sportarten: gebiet.sportarten }) ? lawinendienste(haltestellen) : []

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(gebietJsonLd(gebiet, gebietBeschreibungFuer(i, gebiet))) }} />
      <header>
        <ZeitraumLink href="/" className="text-sm text-tanne">← Alle Ziele</ZeitraumLink>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{gebiet.name}</h1>
        <p className="mt-2 text-tinte-2">{gebiet.beschreibung}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-tinte-2">
          {gebiet.sportarten.map((s) => <span key={s} className="badge bg-nebel">{SPORTART_LABEL[s]}</span>)}
          <span className="badge bg-nebel">{SAISON_LABEL[gebiet.saison]}</span>
        </div>
        <div className="mt-4"><ZeitraumPill mindestNaechte={0} saison={gebiet.saison} /></div>
        <WetterZeile ort={{ gebiet: gebiet.id }} mindestNaechte={0} className="mt-3" />
        <LawinenHinweis dienste={dienste} mindestNaechte={0} className="mt-3" />
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Anreise ab {startort.name}</h2>
        {haltestellen.map((h) => {
          const r = h.richtwerte[startort.id]
          return (
            <div key={h.id} className="karte-card space-y-3">
              <div>
                <div className="font-medium">Bis {h.name}</div>
                <BedientHinweis haltestelle={h} />
              </div>
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={{ id: startort.id, name: startort.name, bahn: startort.bahn }} nach={{ id: h.id, name: h.name, land: h.land, bahn: h.bahn }} mindestNaechte={0}
                  gruppe={gruppenHinweisFuer(i.tickets, h.land)} />
              </Suspense>
              {r && <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />}
              {r && <KostenZeile strassenKm={r.strassenKm} ticket={r.ticket} />}
            </div>
          )
        })}
      </section>

      {(gebiet.touren.length > 0 || gebiet.links.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Touren</h2>
          {gebiet.sammlungEmbed && <TourEmbed sammlung={gebiet.sammlungEmbed} titel={`Tourensammlung ${gebiet.name}`} />}
          {gebiet.touren.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {gebiet.touren.map((t) => (
                <Fragment key={t.url}>
                  <TourKarte tour={t} />
                  {t.embed && (
                    // Eigenes Raster-Kind über beide Spalten, damit die Karte volle Breite bekommt.
                    <details className="group sm:col-span-2">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm text-tanne underline">
                        <span className="group-open:hidden">Karte anzeigen: {t.titel}</span>
                        <span className="hidden group-open:inline">Karte ausblenden: {t.titel}</span>
                      </summary>
                      <div className="mt-2"><TourEmbed tour={t.embed} titel={t.titel} /></div>
                    </details>
                  )}
                </Fragment>
              ))}
            </div>
          )}
          {gebiet.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-tinte-2">
              <span>Mehr Touren:</span>
              {gebiet.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="knopf-sekundaer no-underline">{l.titel}</a>)}
            </div>
          )}
        </section>
      )}

      {huetten.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Hütten</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {huetten.map((h) => <HuetteKarte key={h.id} huette={h} haltestellen={i.haltestellen} />)}
          </div>
        </section>
      )}

      <footer className="text-sm text-tinte-3"><FehlerMelden titel={gebiet.name} /></footer>
    </article>
  )
}
