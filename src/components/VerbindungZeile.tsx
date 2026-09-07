'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import type { BahnOrt, Land } from '@/lib/content/schema'
import { datumKurz, lokaleUhrzeit, minutenAlsDauer, tageDifferenz, wochentagKurz } from '@/lib/datum'
import { zeitraumAusUrl } from '@/lib/verbindung/parameter'
import { naechteText } from '@/lib/zeitraum'
import { fahrplanLink, rueckfahrtLink } from '@/lib/links'
import { TageszielBadge, TicketBadge } from './Badges'
import { VerbindungDetail } from './VerbindungDetail'

type Props = {
  von: { id: string; name: string; bahn?: BahnOrt }
  nach: { id: string; name: string; land: Land; bahn?: BahnOrt }
  /** Hütte 1 (Rückfahrt frühestens am Folgetag), Gebiet 0. */
  mindestNaechte: 0 | 1
  /** Gehzeit bis zur Hütte, für "an der Hütte gegen …" */
  zustiegMin?: number
}

export function VerbindungZeile({ von, nach, mindestNaechte, zustiegMin }: Props) {
  const sp = useSearchParams()
  const { datum, rueck, fenster } = zeitraumAusUrl(sp, mindestNaechte)
  // Antwort wird mit ihrer Anfrage gespeichert; passt sie nicht mehr, zeigt die Zeile das Skeleton.
  const anfrage = new URLSearchParams({ von: von.id, nach: nach.id, datum, rueck, fenster: String(fenster) }).toString()
  const [geladen, setGeladen] = useState<{ anfrage: string; antwort: VerbindungAntwort } | null>(null)
  const [offen, setOffen] = useState(false)
  const antwort = geladen?.anfrage === anfrage ? geladen.antwort : null

  useEffect(() => {
    let aktiv = true
    // Der Zeitraum steckt in der Anfrage; für den Fallback dort wieder herauslesen.
    const q = new URLSearchParams(anfrage)
    const datumAnfrage = q.get('datum')!
    const rueckAnfrage = q.get('rueck')!
    fetch(`/api/verbindung?${anfrage}`)
      .then((r) => r.json())
      .then((a: VerbindungAntwort) => { if (aktiv) setGeladen({ anfrage, antwort: a }) })
      .catch(() => {
        if (!aktiv) return
        const antwort: VerbindungAntwort = {
          quelle: 'richtwert', datum: datumAnfrage, rueckfahrtDatum: rueckAnfrage,
          naechte: tageDifferenz(datumAnfrage, rueckAnfrage), ticket: { ticket: 'keins', hinweis: '' },
        }
        setGeladen({ anfrage, antwort })
      })
    return () => { aktiv = false }
  }, [anfrage])

  const portal = nach.land === 'CH' ? 'SBB' : 'bahn.de'
  // Links tragen Datum und lokale Abfahrtszeit der gezeigten Verbindung; ohne Live-Daten die Standardzeiten.
  const hinLink = (zeitLokal?: string) => fahrplanLink({ land: nach.land, von, nach, datum, zeitLokal })
  const rueckLink = (rueckDatum: string, zeitLokal?: string) => rueckfahrtLink({ land: nach.land, von, nach, datum: rueckDatum, zeitLokal })

  if (!antwort) {
    return (
      <div className="space-y-2" aria-busy>
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    )
  }

  if (antwort.quelle === 'richtwert' || !antwort.hinfahrt) {
    const r = antwort.richtwert
    return (
      <div className="space-y-1">
        <div>
          {r ? <><span className="zahl text-lg">ca. {minutenAlsDauer(r.fahrzeitMin)}</span> <span className="text-tinte-2">· {r.umstiege} Umstiege · {taktText(r.takt)} ab {von.name}</span></>
             : <span className="text-tinte-2">Keine Verbindung im Zeitfenster gefunden.</span>}
        </div>
        <div className="text-sm text-tinte-3">
          {antwort.quelle === 'richtwert' ? 'Live-Fahrplan gerade nicht erreichbar. ' : ''}
          <a href={hinLink()} target="_blank" rel="noreferrer" className="underline">Hinfahrt bei {portal}</a>
          {' · '}
          <a href={rueckLink(antwort.rueckfahrtDatum)} target="_blank" rel="noreferrer" className="underline">Rückfahrt bei {portal}</a>
        </div>
      </div>
    )
  }

  const h = antwort.hinfahrt
  const hinfahrtUrl = hinLink(lokaleUhrzeit(h.ab))
  const rueckfahrtUrl = rueckLink(antwort.rueckfahrtDatum, antwort.rueckfahrt ? lokaleUhrzeit(antwort.rueckfahrt.ab) : undefined)
  const ankunftHuette = zustiegMin ? new Date(Date.parse(h.an) + zustiegMin * 60_000).toISOString() : undefined

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="zahl text-lg">{wochentagKurz(datum)} {lokaleUhrzeit(h.ab)}</span>
        <span className="text-tinte-2">ab {von.name} ·</span>
        <span className="zahl text-lg">{lokaleUhrzeit(h.an)}</span>
        <span className="text-tinte-2">in {nach.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-tinte-2">
        <span>{minutenAlsDauer(h.dauerMin)}, {h.umstiege === 0 ? 'direkt' : `${h.umstiege} ${h.umstiege === 1 ? 'Umstieg' : 'Umstiege'}`}</span>
        {ankunftHuette && <span>· an der Hütte gegen <span className="zahl">{lokaleUhrzeit(ankunftHuette)}</span></span>}
        {mindestNaechte >= 1 && antwort.naechte >= 1 && <span>· {naechteText(antwort.naechte)}</span>}
        <TageszielBadge tagesziel={antwort.tagesziel} />
        <TicketBadge ticket={antwort.ticket.ticket} />
      </div>
      {antwort.rueckfahrt && (
        <div className="text-sm text-tinte-2">
          Rückfahrt {datumKurz(antwort.rueckfahrtDatum)}: <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.ab)}</span> ab {nach.name},{' '}
          <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.an)}</span> in {von.name}
          {antwort.tourenfensterMin !== undefined && <> · <span className="zahl">{minutenAlsDauer(antwort.tourenfensterMin)}</span> am Berg</>}
        </div>
      )}
      <button type="button" onClick={() => setOffen((o) => !o)} className="min-h-11 text-sm text-tanne underline" aria-expanded={offen}>
        {offen ? 'Details ausblenden' : 'Umstiege und Ticket'}
      </button>
      {offen && (
        <div className="space-y-3 rounded-[var(--radius-knopf)] bg-papier p-3">
          <VerbindungDetail titel="Hinfahrt" v={h} link={{ href: hinfahrtUrl, text: `Hinfahrt bei ${portal}` }} />
          {antwort.hinfahrtSpaeter && (
            <VerbindungDetail titel="Später los" v={antwort.hinfahrtSpaeter} link={{ href: hinLink(lokaleUhrzeit(antwort.hinfahrtSpaeter.ab)), text: `Spätere Hinfahrt bei ${portal}` }} />
          )}
          {antwort.rueckfahrt && <VerbindungDetail titel="Rückfahrt" v={antwort.rueckfahrt} link={{ href: rueckfahrtUrl, text: `Rückfahrt bei ${portal}` }} />}
          <p className="text-sm text-tinte-2">{antwort.ticket.hinweis}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={hinfahrtUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer w-full sm:w-auto">Hinfahrt bei {portal}</a>
            <a href={rueckfahrtUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer w-full sm:w-auto">Rückfahrt bei {portal}</a>
          </div>
        </div>
      )}
    </div>
  )
}

/** Der Takt zählt Abfahrten am Startort zwischen 6 und 12 Uhr, nicht die Bedienung am Ziel. */
function taktText(t: string) {
  return t === 'stuendlich' ? 'stündlich' : t === 'zweistuendlich' ? 'zweistündlich' : 'unregelmäßig'
}
