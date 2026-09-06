'use client'
import { useEffect, useMemo, useState, Suspense, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { filtereGebiete, leseFilter, schreibeFilter, STANDARD_FILTER, type FilterZustand, type GebietEintrag } from '@/lib/filter'
import { naechsterSamstag } from '@/lib/datum'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import { verbindungParameter } from './VerbindungZeile'
import { DatumWahl, STANDARD_FENSTER } from './DatumWahl'
import { Filter } from './Filter'
import { Suche, type SuchEintrag } from './Suche'
import { GebietKarte } from './GebietKarte'

const Karte = dynamic(() => import('./Karte').then((m) => m.Karte), { ssr: false, loading: () => <div className="skeleton h-full w-full" /> })

type Props = {
  startort: { id: string; name: string }
  /** Nach Richtwert-Fahrzeit sortiert. */
  gebiete: GebietEintrag[]
  suchEintraege: SuchEintrag[]
  /** Serverseitig gerenderter Empfehlungskasten, wird bei aktiver Suche ausgeblendet. */
  empfehlungen: ReactNode
}

/**
 * Nur der URL-gebundene Teil liest useSearchParams und braucht deshalb eine Suspense-Grenze.
 * Der Fallback ist die ungefilterte Liste, damit die Seite auch ohne JavaScript vollständig ist.
 */
export function Startseite(props: Props) {
  return (
    <Suspense fallback={<StartseiteStatisch {...props} />}>
      <StartseiteMitUrl {...props} />
    </Suspense>
  )
}

function StartseiteStatisch(props: Props) {
  return (
    <StartseiteInhalt {...props} filter={STANDARD_FILTER} datum={naechsterSamstag()} fenster={STANDARD_FENSTER}
      uebersicht={{}} laedt onFilter={() => {}} onDatum={() => {}} onFenster={() => {}} />
  )
}

function StartseiteMitUrl(props: Props) {
  const sp = useSearchParams()
  const router = useRouter()
  const pfad = usePathname()
  const filter = useMemo(() => leseFilter(sp), [sp])
  const { datum, fenster } = verbindungParameter(sp)
  // Übersicht wird mit ihrer Anfrage gespeichert; passt sie nicht mehr, gilt sie als ladend.
  const anfrage = `von=${props.startort.id}&datum=${datum}&fenster=${fenster}`
  const [geladen, setGeladen] = useState<{ anfrage: string; uebersicht: Record<string, boolean | undefined> } | null>(null)
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

  function setzeFilter(f: FilterZustand) {
    router.replace(`${pfad}?${schreibeFilter(sp, f).toString()}`, { scroll: false })
  }

  function setzeParameter(k: 'datum' | 'fenster', v: string, standard: string) {
    const neu = new URLSearchParams(sp)
    if (v === standard) neu.delete(k); else neu.set(k, v)
    router.replace(`${pfad}?${neu.toString()}`, { scroll: false })
  }

  return (
    <StartseiteInhalt {...props} filter={filter} datum={datum} fenster={fenster} uebersicht={uebersicht} laedt={laedt}
      onFilter={setzeFilter}
      onDatum={(d) => setzeParameter('datum', d, naechsterSamstag())}
      onFenster={(f) => setzeParameter('fenster', String(f), String(STANDARD_FENSTER))} />
  )
}

type InhaltProps = Props & {
  filter: FilterZustand
  datum: string
  fenster: number
  uebersicht: Record<string, boolean | undefined>
  laedt: boolean
  onFilter: (f: FilterZustand) => void
  onDatum: (d: string) => void
  onFenster: (f: number) => void
}

function StartseiteInhalt({ gebiete, suchEintraege, empfehlungen, filter, datum, fenster, uebersicht, laedt, onFilter, onDatum, onFenster }: InhaltProps) {
  const [karteOffen, setKarteOffen] = useState(false)
  const sichtbar = filtereGebiete(gebiete, filter, uebersicht)

  return (
    <div className="space-y-5">
      <section>
        <Suche eintraege={suchEintraege} wert={filter.suche} onChange={(suche) => onFilter({ ...filter, suche })} />
      </section>

      <section className="space-y-3">
        <DatumWahl datum={datum} fenster={fenster} onDatum={onDatum} onFenster={onFenster} />
        <Filter wert={filter} onChange={onFilter} />
      </section>

      {!filter.suche && empfehlungen}

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
