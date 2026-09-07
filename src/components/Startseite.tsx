'use client'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { filtereGebiete, leseFilter, schreibeFilter, STANDARD_FILTER, type FilterZustand, type GebietEintrag } from '@/lib/filter'
import { naechsterSamstag, tageDifferenz } from '@/lib/datum'
import { anzahlAktiverFilter, STANDARD_FENSTER, zeitraumText } from '@/lib/steuerleiste'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import { verbindungParameter } from '@/lib/verbindung/parameter'
import { DatumWahl } from './DatumWahl'
import { Filter } from './Filter'
import { Sheet } from './Sheet'
import { Steuerleiste, type Ansicht } from './Steuerleiste'
import { Suche, type SuchEintrag } from './Suche'
import { GebietKarte } from './GebietKarte'

const KARTE_SKELETON = <div className="skeleton h-full w-full" />
const Karte = dynamic(() => import('./Karte').then((m) => m.Karte), { ssr: false, loading: () => KARTE_SKELETON })

/** Höhe des sticky Headers (h-14) in Pixeln; die Steuerleiste klebt direkt darunter. */
const HEADER_PX = 56

type Props = {
  startort: { id: string; name: string }
  /** Nach Richtwert-Fahrzeit sortiert. */
  gebiete: GebietEintrag[]
  suchEintraege: SuchEintrag[]
  /** Serverseitig gerenderte Empfehlungsleiste, wird bei aktiver Suche ausgeblendet. */
  empfehlungen: ReactNode
}

type Auswahl = { filter: FilterZustand; datum: string; rueck: string; fenster: number }
type SheetName = 'wann' | 'was' | null

/**
 * Die Seiten-URL als externer Store: window.location.search, Server-Wert leer. So braucht die Seite
 * kein useSearchParams und keine Suspense-Grenze; das Server-HTML zeigt die ungefilterte Liste mit dem
 * kommenden Samstag, nach der Hydration liest React die echte URL. Änderungen gehen per
 * history.replaceState (in den Next-Router integriert) und benachrichtigen die Abonnenten.
 */
const hoerer = new Set<() => void>()
function abonniereUrl(cb: () => void) {
  hoerer.add(cb)
  window.addEventListener('popstate', cb)
  return () => { hoerer.delete(cb); window.removeEventListener('popstate', cb) }
}
const leseUrl = () => window.location.search
const leseUrlServer = () => ''
function schreibeUrl(sp: URLSearchParams) {
  const q = sp.toString()
  window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  hoerer.forEach((cb) => cb())
}

const abonniereNichts = () => () => {}

const LG = '(min-width: 1024px)'
function abonniereBreit(cb: () => void) {
  const mq = window.matchMedia(LG)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function Startseite({ startort, gebiete, suchEintraege, empfehlungen }: Props) {
  const suche = useSyncExternalStore(abonniereUrl, leseUrl, leseUrlServer)
  const { filter, datum, rueck, fenster } = useMemo<Auswahl>(() => {
    if (!suche) {
      const samstag = naechsterSamstag()
      return { filter: STANDARD_FILTER, datum: samstag, rueck: samstag, fenster: STANDARD_FENSTER }
    }
    const sp = new URLSearchParams(suche)
    return { filter: leseFilter(sp), ...verbindungParameter(sp) }
  }, [suche])
  const [ansicht, setAnsicht] = useState<Ansicht>('liste')
  const [sheet, setSheet] = useState<SheetName>(null)
  const karteOffen = ansicht === 'karte'
  // Die Karte (ssr: false) erst nach der Hydration rendern, damit im Server-HTML nur das Skeleton steht.
  const montiert = useSyncExternalStore(abonniereNichts, () => true, () => false)
  // MapLibre darf erst starten, wenn der Container sichtbar ist (sonst Nullgröße, keine Kacheln, kein load-Event).
  // Ab lg ist die Karte immer sichtbar; auf dem Handy nach dem ersten Öffnen, danach bleibt sie montiert.
  const breit = useSyncExternalStore(abonniereBreit, () => window.matchMedia(LG).matches, () => false)
  const [einmalGeoeffnet, setEinmalGeoeffnet] = useState(false)
  // Abstandhalter direkt vor der Steuerleiste; seine Unterkante ist deren natürliche Oberkante. Die Leiste selbst
  // liefert im festgeklebten Zustand nur die Sticky-Position.
  const anker = useRef<HTMLDivElement>(null)
  const karteMontieren = montiert && (breit || karteOffen || einmalGeoeffnet)

  const naechte = tageDifferenz(datum, rueck)
  // Tagesziel gibt es nur bei Rückfahrt am selben Tag; sonst gilt der Filter "Tagestour" wie "Alle".
  const tagestourMoeglich = naechte === 0
  const filterWirksam = tagestourMoeglich || filter.art !== 'tag' ? filter : { ...filter, art: 'alle' as const }

  // Übersicht wird mit ihrer Anfrage gespeichert; passt sie nicht mehr, gilt sie als ladend.
  const anfrage = `von=${startort.id}&datum=${datum}${tagestourMoeglich ? '' : `&rueck=${rueck}`}&fenster=${fenster}`
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

  function aendere(neu: Auswahl) {
    const sp = schreibeFilter(new URLSearchParams(window.location.search), neu.filter)
    if (neu.datum === naechsterSamstag()) sp.delete('datum'); else sp.set('datum', neu.datum)
    if (neu.rueck === neu.datum) sp.delete('rueck'); else sp.set('rueck', neu.rueck)
    if (neu.fenster === STANDARD_FENSTER) sp.delete('fenster'); else sp.set('fenster', String(neu.fenster))
    schreibeUrl(sp)
  }
  const onFilter = (f: FilterZustand) => aendere({ filter: f, datum, rueck, fenster })

  function zeigeAnsicht(a: Ansicht) {
    setAnsicht(a)
    if (a !== 'karte') return
    setEinmalGeoeffnet(true)
    // Die Karte liegt direkt unter der Steuerleiste: so scrollen, dass die Leiste am Header klebt und die Karte den Rest
    // füllt. Ohne Animation, weil die Liste im selben Moment verschwindet und es nichts zu verfolgen gibt.
    const el = anker.current
    if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().bottom + window.scrollY - HEADER_PX) })
  }

  const sichtbar = filtereGebiete(gebiete, filterWirksam, uebersicht)
  // Das Tourenfenster zählt nur, wenn es wirkt (Rückfahrt am selben Tag).
  const anzahlFilter = anzahlAktiverFilter(filterWirksam, tagestourMoeglich ? fenster : STANDARD_FENSTER)

  return (
    <div>
      <Suche eintraege={suchEintraege} wert={filter.suche} onChange={(suche) => onFilter({ ...filter, suche })} />

      <div ref={anker} className="h-2" aria-hidden />
      {/* Direktes Kind dieses Containers, damit sticky bis zum Ende der Ergebnisse trägt. */}
      <Steuerleiste zeitraum={zeitraumText(datum, rueck)} anzahlFilter={anzahlFilter} ansicht={ansicht}
        onZeitraum={() => setSheet('wann')} onFilter={() => setSheet('was')} onAnsicht={zeigeAnsicht} />

      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-6">
        <section className={`space-y-3 pt-3 ${karteOffen ? 'hidden lg:block' : ''}`}>
          {!filter.suche && empfehlungen}
          <h2 className="text-sm text-tinte-3">{`${sichtbar.length} ${sichtbar.length === 1 ? 'Ziel' : 'Ziele'}, nach Fahrzeit sortiert`}</h2>
          {sichtbar.map((g) => <GebietKarte key={g.id} g={g} tagesziel={uebersicht[g.id]} laedt={laedt} naechte={naechte} />)}
          {sichtbar.length === 0 && <p className="text-tinte-2">Nichts gefunden. Filter lockern oder Fahrzeit erhöhen.</p>}
        </section>
        {/* Handy: füllt den Bereich unter Header (3.5rem) und Steuerleiste (3.5rem + 1px). Ab lg: sticky rechte Spalte. */}
        <section className={`${karteOffen ? 'block' : 'hidden'} -mx-4 h-[calc(100dvh-7rem-1px)] overflow-hidden border-b border-linie sm:-mx-6 lg:sticky lg:top-[calc(8rem+1px)] lg:mx-0 lg:mt-3 lg:block lg:h-[calc(100dvh-9rem-1px)] lg:rounded-[var(--radius-karte)] lg:border`}>
          {karteMontieren ? <Karte gebietIds={sichtbar.map((g) => g.id)} uebersicht={uebersicht} /> : KARTE_SKELETON}
        </section>
      </div>

      <Sheet offen={sheet === 'wann'} titel="Wann?" onClose={() => setSheet(null)}>
        <DatumWahl datum={datum} rueck={rueck} fenster={fenster}
          onZeitraum={(d, r) => aendere({ filter, datum: d, rueck: r, fenster })}
          onFenster={(f) => aendere({ filter, datum, rueck, fenster: f })} />
      </Sheet>
      <Sheet offen={sheet === 'was'} titel="Was?" onClose={() => setSheet(null)}
        aktionen={<button type="button" className="knopf-sekundaer" onClick={() => onFilter({ ...STANDARD_FILTER, suche: filter.suche })}>Zurücksetzen</button>}>
        <Filter wert={filter} tagestourMoeglich={tagestourMoeglich} onChange={onFilter} />
      </Sheet>
    </div>
  )
}
