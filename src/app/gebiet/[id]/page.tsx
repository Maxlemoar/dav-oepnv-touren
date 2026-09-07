import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { inhalt, findeGebiet, findeHaltestelle, huettenImGebiet, sichtbareStartorte } from '@/lib/content/laden'
import { SAISON_LABEL, SPORTART_LABEL } from '@/lib/content/schema'
import { co2ErsparnisKg } from '@/lib/co2'
import { Co2Zeile } from '@/components/Co2Zeile'
import { FehlerMelden } from '@/components/FehlerMelden'
import { HuetteKarte } from '@/components/HuetteKarte'
import { VerbindungZeile } from '@/components/VerbindungZeile'

export function generateStaticParams() {
  return inhalt().gebiete.map((g) => ({ id: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: findeGebiet(inhalt(), id)?.name ?? 'Gebiet' }
}


export default async function GebietSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const gebiet = findeGebiet(i, id)
  if (!gebiet) notFound()
  const startort = sichtbareStartorte(i)[0]
  const huetten = huettenImGebiet(i, gebiet.id)

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href="/" className="text-sm text-tanne">← Alle Ziele</Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{gebiet.name}</h1>
        <p className="mt-2 text-tinte-2">{gebiet.beschreibung}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-tinte-2">
          {gebiet.sportarten.map((s) => <span key={s} className="badge bg-nebel">{SPORTART_LABEL[s]}</span>)}
          <span className="badge bg-nebel">{SAISON_LABEL[gebiet.saison]}</span>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Anreise ab {startort.name}</h2>
        {gebiet.haltestellen.map((hid) => {
          const h = findeHaltestelle(i, hid)!
          const r = h.richtwerte[startort.id]
          return (
            <div key={hid} className="karte-card space-y-3">
              <div className="font-medium">Bis {h.name}</div>
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={{ id: startort.id, name: startort.name, bahn: startort.bahn }} nach={{ id: h.id, name: h.name, land: h.land, bahn: h.bahn }} mindestNaechte={0} />
              </Suspense>
              {r && <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />}
            </div>
          )
        })}
      </section>

      {huetten.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Hütten</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {huetten.map((h) => <HuetteKarte key={h.id} huette={h} haltestellen={i.haltestellen} />)}
          </div>
        </section>
      )}

      {gebiet.links.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Touren</h2>
          <ul className="space-y-1">
            {gebiet.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer" className="text-tanne underline">{l.titel}</a></li>)}
          </ul>
        </section>
      )}

      <footer className="text-sm text-tinte-3"><FehlerMelden titel={gebiet.name} /></footer>
    </article>
  )
}
