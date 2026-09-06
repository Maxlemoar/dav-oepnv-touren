'use client'
import { useEffect, useMemo, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { filtereGebiete, leseFilter, schreibeFilter, type GebietEintrag } from '@/lib/filter'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import { verbindungParameter } from './VerbindungZeile'
import { DatumWahl } from './DatumWahl'
import { Filter } from './Filter'
import { Suche, type SuchEintrag } from './Suche'
import { GebietKarte } from './GebietKarte'

const Karte = dynamic(() => import('./Karte').then((m) => m.Karte), { ssr: false, loading: () => <div className="skeleton h-full w-full" /> })

type Props = {
  startort: { id: string; name: string }
  gebiete: GebietEintrag[]
  suchEintraege: SuchEintrag[]
  empfehlungen: { id: string; name: string; meta: string }[]
}

export function Startseite(props: Props) {
  return <Suspense fallback={<div className="skeleton h-40 w-full" />}><StartseiteInnen {...props} /></Suspense>
}

function StartseiteInnen({ startort, gebiete, suchEintraege, empfehlungen }: Props) {
  const sp = useSearchParams()
  const router = useRouter()
  const pfad = usePathname()
  const filter = useMemo(() => leseFilter(sp), [sp])
  const { datum, fenster } = verbindungParameter(sp)
  // Übersicht wird mit ihrer Anfrage gespeichert; passt sie nicht mehr, gilt sie als ladend.
  const anfrage = `von=${startort.id}&datum=${datum}&fenster=${fenster}`
  const [geladen, setGeladen] = useState<{ anfrage: string; uebersicht: Record<string, boolean | undefined> } | null>(null)
  const [karteOffen, setKarteOffen] = useState(false)
  const laedt = geladen?.anfrage !== anfrage
  const uebersicht = useMemo(() => (laedt ? {} : geladen!.uebersicht), [laedt, geladen])

  useEffect(() => {
    let aktiv = true
    fetch(`/api/uebersicht?${anfrage}`)
      .then((r) => r.json())
      .then((d: Record<string, VerbindungAntwort>) => {
        const u: Record<string, boolean | undefined> = {}
        for (const [id, a] of Object.entries(d)) u[id] = a.tagesziel
        return u
      })
      .catch(() => ({}) as Record<string, boolean | undefined>)
      .then((u) => { if (aktiv) setGeladen({ anfrage, uebersicht: u }) })
    return () => { aktiv = false }
  }, [anfrage])

  function setzeFilter(f: typeof filter) {
    router.replace(`${pfad}?${schreibeFilter(sp, f).toString()}`, { scroll: false })
  }

  const sichtbar = filtereGebiete(gebiete, filter, uebersicht)

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">In die Berge, ohne Auto.</h1>
        <p className="text-tinte-2">Hütten und Tourengebiete, die du von {startort.name} aus mit Bahn und Bus erreichst. Mit echter Verbindung für dein Datum.</p>
        <Suche eintraege={suchEintraege} wert={filter.suche} onChange={(suche) => setzeFilter({ ...filter, suche })} />
      </section>

      <section className="space-y-3">
        <DatumWahl />
        <Filter wert={filter} onChange={setzeFilter} />
      </section>

      {empfehlungen.length > 0 && !filter.suche && (
        <section className="rounded-[var(--radius-karte)] bg-tanne-tint p-4">
          <h2 className="text-sm font-semibold text-tanne">Häuser der Sektion Offenburg</h2>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {empfehlungen.map((e) => <li key={e.id}><a href={`/huette/${e.id}`} className="text-tanne underline">{e.name}</a> <span className="text-tinte-2">{e.meta}</span></li>)}
          </ul>
        </section>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-6">
        <section className={`space-y-3 ${karteOffen ? 'hidden lg:block' : ''}`}>
          <h2 className="text-sm text-tinte-3">{sichtbar.length} {sichtbar.length === 1 ? 'Ziel' : 'Ziele'}, nach Fahrzeit sortiert</h2>
          {sichtbar.map((g) => <GebietKarte key={g.id} g={g} tagesziel={uebersicht[g.id]} laedt={laedt} />)}
          {sichtbar.length === 0 && <p className="text-tinte-2">Nichts gefunden. Filter lockern oder Fahrzeit erhöhen.</p>}
        </section>
        <section className={`${karteOffen ? 'block' : 'hidden'} h-[70dvh] overflow-hidden rounded-[var(--radius-karte)] border border-linie lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-6rem)]`}>
          <Karte gebietIds={sichtbar.map((g) => g.id)} uebersicht={uebersicht} />
        </section>
      </div>

      <button type="button" onClick={() => setKarteOffen((o) => !o)}
        className="knopf fixed bottom-4 left-1/2 z-30 -translate-x-1/2 shadow-lg lg:hidden">
        {karteOffen ? 'Liste' : 'Karte'}
      </button>
    </div>
  )
}
