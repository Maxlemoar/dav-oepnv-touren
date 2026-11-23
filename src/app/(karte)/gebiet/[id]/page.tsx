import { notFound } from 'next/navigation'
import { Fragment, Suspense } from 'react'
import { inhalt, findeGebiet, findeHaltestelle, huettenImGebiet, sichtbareStartorte } from '@/lib/content/laden'
import { LAND_LABEL, SAISON_LABEL, SPORTART_LABEL, TICKET_LABEL, type Ticket } from '@/lib/content/labels'
import type { Haltestelle } from '@/lib/content/schema'
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
import { ZeitraumLink } from '@/components/Zeitraum'
import { TourEmbed } from '@/components/TourEmbed'
import { TourKarte } from '@/components/TourKarte'
import { VerbindungZeile } from '@/components/VerbindungZeile'
import { AufklappHaltestelle } from '@/components/ort/AufklappHaltestelle'
import { ErreichbarReihenfolge } from '@/components/ort/ErreichbarReihenfolge'
import { Fahrtenwahl } from '@/components/ort/Fahrtenwahl'
import { ZeitfensterPill } from '@/components/ort/ZeitfensterPill'
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

function ticketText(t: Ticket): string {
  return t === 'keins' ? TICKET_LABEL.keins : `${TICKET_LABEL[t]} gilt`
}

/**
 * Ortsseite neben der Karte: Überschrift ist der Hauptzugang (erste Haltestelle), darunter zuerst die wählbaren Hin- und
 * Rückfahrten am Datum, dann die weiteren Haltestellen (Live-Verbindung erst beim Aufklappen), dann "Von hier
 * erreichbar". Die Seite bleibt statisch; alles, was vom Zeitfenster in der URL abhängt, rendert im Browser.
 */
export default async function GebietSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const gebiet = findeGebiet(i, id)
  if (!gebiet) notFound()
  const startort = sichtbareStartorte(i)[0]
  const von = { id: startort.id, name: startort.name, bahn: startort.bahn }
  const huetten = huettenImGebiet(i, gebiet.id)
  const haltestellen = gebiet.haltestellen.map((hid) => findeHaltestelle(i, hid)!)
  const [haupt, ...weitere] = haltestellen
  const rHaupt = haupt.richtwerte[startort.id]
  const dienste = lawinenRelevant({ sportarten: gebiet.sportarten }) ? lawinendienste(haltestellen) : []

  /** CO₂- und Kostenzeile aus dem Richtwert der Haltestelle. */
  const vergleich = (h: Haltestelle) => {
    const r = h.richtwerte[startort.id]
    if (!r) return null
    return (
      <div className="space-y-1">
        <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />
        <KostenZeile strassenKm={r.strassenKm} ticket={r.ticket} />
      </div>
    )
  }

  const touren = (gebiet.touren.length > 0 || gebiet.links.length > 0 || gebiet.sammlungEmbed) && (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Touren</h3>
      {gebiet.sammlungEmbed && <TourEmbed sammlung={gebiet.sammlungEmbed} titel={`Tourensammlung ${gebiet.name}`} />}
      {gebiet.touren.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
  )

  const huettenAbschnitt = huetten.length > 0 && (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Hütten</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {huetten.map((h) => <HuetteKarte key={h.id} huette={h} haltestellen={i.haltestellen} />)}
      </div>
    </section>
  )

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(gebietJsonLd(gebiet, gebietBeschreibungFuer(i, gebiet))) }} />
      {/* Bleibt beim Scrollen oben stehen: ab lg am oberen Rand der Seitenleiste (-top-4 gleicht deren pt-4 aus, sonst bleibt ein Spalt), darunter unter der Kopfzeile. */}
      <div className="sticky z-10 -mx-4 -mt-4 mb-2 bg-papier px-4 py-2 max-lg:top-14 lg:-top-4 sm:-mx-6 sm:px-6">
        <ZeitraumLink href="/" className="pill min-h-11 no-underline">← Zurück</ZeitraumLink>
      </div>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{haupt.name}</h1>
        <p className="mt-1 text-tinte-2">
          Gebiet {gebiet.name} · {haupt.region} · {LAND_LABEL[haupt.land]}{rHaupt && <> · {ticketText(rHaupt.ticket)}</>}
        </p>
        <BedientHinweis haltestelle={haupt} />
        <div className="mt-4"><ZeitfensterPill saison={gebiet.saison} /></div>
      </header>

      <div className="space-y-3">
        <Fahrtenwahl von={von} nach={{ id: haupt.id, name: haupt.name, land: haupt.land, bahn: haupt.bahn }}
          gruppe={gruppenHinweisFuer(i.tickets, haupt.land)} />
        {vergleich(haupt)}
      </div>

      {weitere.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Weitere Haltestellen im Gebiet</h2>
          {weitere.map((h) => (
            <AufklappHaltestelle key={h.id} titel={`Bis ${h.name}`}>
              <BedientHinweis haltestelle={h} />
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={von} nach={{ id: h.id, name: h.name, land: h.land, bahn: h.bahn }} mindestNaechte={0}
                  gruppe={gruppenHinweisFuer(i.tickets, h.land)} />
              </Suspense>
              {vergleich(h)}
            </AufklappHaltestelle>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Von hier erreichbar</h2>
          <p className="mt-1 text-tinte-2">{gebiet.beschreibung}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-tinte-2">
            {gebiet.sportarten.map((s) => <span key={s} className="badge bg-nebel">{SPORTART_LABEL[s]}</span>)}
            <span className="badge bg-nebel">{SAISON_LABEL[gebiet.saison]}</span>
          </div>
          <WetterZeile ort={{ gebiet: gebiet.id }} mindestNaechte={0} className="mt-3" />
          <LawinenHinweis dienste={dienste} mindestNaechte={0} className="mt-3" />
        </div>
        <ErreichbarReihenfolge touren={touren} huetten={huettenAbschnitt} />
      </section>

      <footer className="text-sm text-tinte-3"><FehlerMelden titel={gebiet.name} /></footer>
    </article>
  )
}
