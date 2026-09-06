import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { inhalt, findeHuette, findeGebiet, findeHaltestelle, sichtbareStartorte } from '@/lib/content/laden'
import { SAISON_LABEL } from '@/lib/content/schema'
import { co2ErsparnisKg } from '@/lib/co2'
import { minutenAlsDauer } from '@/lib/datum'
import { BetreiberBadge } from '@/components/Badges'
import { Co2Zeile } from '@/components/Co2Zeile'
import { FehlerMelden } from '@/components/FehlerMelden'
import { VerbindungZeile } from '@/components/VerbindungZeile'

export function generateStaticParams() {
  return inhalt().huetten.map((h) => ({ id: h.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const h = findeHuette(inhalt(), id)
  return { title: h?.name ?? 'Hütte' }
}


export default async function HuetteSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const huette = findeHuette(i, id)
  if (!huette) notFound()
  const gebiet = findeGebiet(i, huette.gebietId)!
  const startort = sichtbareStartorte(i)[0]

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href={`/gebiet/${gebiet.id}`} className="text-sm text-tanne">← {gebiet.name}</Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{huette.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-tinte-2">
          <BetreiberBadge typ={huette.betreiber.typ} sektion={huette.betreiber.sektion} />
          <span className="zahl">{huette.hoehe} m</span>
          <span>{SAISON_LABEL[huette.saison]}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {huette.buchungUrl && <a href={huette.buchungUrl} target="_blank" rel="noreferrer" className="knopf">Buchen</a>}
          {huette.webUrl && <a href={huette.webUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer">Hüttenseite</a>}
        </div>
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
                <p className="text-sm text-tinte-2">
                  Zustieg {minutenAlsDauer(z.gehzeitMin)}{z.bergbahn ? ' mit Bergbahn' : ''}{z.hoehenmeter ? `, ${z.hoehenmeter} hm` : ''}
                  {z.hinweis ? ` · ${z.hinweis}` : ''}
                </p>
              </div>
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={{ id: startort.id, name: startort.name }} nach={{ id: h.id, name: h.name, land: h.land }} rueckfahrt="folgetag" zustiegMin={z.gehzeitMin} />
              </Suspense>
              {r && <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />}
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
