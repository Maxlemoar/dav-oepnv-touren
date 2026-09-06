'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import type { Land } from '@/lib/content/schema'
import { datumLesbar, lokaleUhrzeit, minutenAlsDauer, wochentagKurz } from '@/lib/datum'
import { verbindungParameter } from '@/lib/verbindung/parameter'
import { fahrplanLink } from '@/lib/links'
import { TageszielBadge, TicketBadge } from './Badges'
import { VerbindungDetail } from './VerbindungDetail'

type Props = {
  von: { id: string; name: string }
  nach: { id: string; name: string; land: Land }
  rueckfahrt: 'gleicher-tag' | 'folgetag'
  /** Gehzeit bis zur Hütte, für "an der Hütte gegen …" */
  zustiegMin?: number
}

export function VerbindungZeile({ von, nach, rueckfahrt, zustiegMin }: Props) {
  const sp = useSearchParams()
  const { datum, fenster } = verbindungParameter(sp)
  // Antwort wird mit ihrer Anfrage gespeichert; passt sie nicht mehr, zeigt die Zeile das Skeleton.
  const anfrage = new URLSearchParams({ von: von.id, nach: nach.id, datum, rueckfahrt, fenster: String(fenster) }).toString()
  const [geladen, setGeladen] = useState<{ anfrage: string; antwort: VerbindungAntwort } | null>(null)
  const [offen, setOffen] = useState(false)
  const antwort = geladen?.anfrage === anfrage ? geladen.antwort : null

  useEffect(() => {
    let aktiv = true
    // Das Datum steckt in der Anfrage; für den Fallback dort wieder herauslesen.
    const datumAnfrage = new URLSearchParams(anfrage).get('datum')!
    fetch(`/api/verbindung?${anfrage}`)
      .then((r) => r.json())
      .then((a: VerbindungAntwort) => { if (aktiv) setGeladen({ anfrage, antwort: a }) })
      .catch(() => { if (aktiv) setGeladen({ anfrage, antwort: { quelle: 'richtwert', datum: datumAnfrage, rueckfahrtDatum: datumAnfrage, ticket: { ticket: 'keins', hinweis: '' } } }) })
    return () => { aktiv = false }
  }, [anfrage])

  const link = fahrplanLink(nach.land, von.name, nach.name, datum)

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
          {r ? <><span className="zahl text-lg">ca. {minutenAlsDauer(r.fahrzeitMin)}</span> <span className="text-tinte-2">· {r.umstiege} Umstiege · {taktText(r.takt)}</span></>
             : <span className="text-tinte-2">Keine Verbindung im Zeitfenster gefunden.</span>}
        </div>
        <div className="text-sm text-tinte-3">
          {antwort.quelle === 'richtwert' ? 'Live-Fahrplan gerade nicht erreichbar. ' : ''}
          <a href={link} target="_blank" rel="noreferrer" className="underline">Fahrplan bei {nach.land === 'CH' ? 'SBB' : 'bahn.de'} öffnen</a>
        </div>
      </div>
    )
  }

  const h = antwort.hinfahrt
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
        <TageszielBadge tagesziel={antwort.tagesziel} />
        <TicketBadge ticket={antwort.ticket.ticket} />
      </div>
      {antwort.rueckfahrt && (
        <div className="text-sm text-tinte-2">
          Rückfahrt {datumLesbar(antwort.rueckfahrtDatum)}: <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.ab)}</span> ab {nach.name},{' '}
          <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.an)}</span> in {von.name}
          {antwort.tourenfensterMin !== undefined && <> · <span className="zahl">{minutenAlsDauer(antwort.tourenfensterMin)}</span> am Berg</>}
        </div>
      )}
      <button type="button" onClick={() => setOffen((o) => !o)} className="min-h-11 text-sm text-tanne underline" aria-expanded={offen}>
        {offen ? 'Details ausblenden' : 'Umstiege und Ticket'}
      </button>
      {offen && (
        <div className="space-y-3 rounded-[var(--radius-knopf)] bg-papier p-3">
          <VerbindungDetail titel="Hinfahrt" v={h} />
          {antwort.hinfahrtSpaeter && <VerbindungDetail titel="Später los" v={antwort.hinfahrtSpaeter} />}
          {antwort.rueckfahrt && <VerbindungDetail titel="Rückfahrt" v={antwort.rueckfahrt} />}
          <p className="text-sm text-tinte-2">{antwort.ticket.hinweis}</p>
          <a href={link} target="_blank" rel="noreferrer" className="knopf-sekundaer w-full sm:w-auto">
            Bei {nach.land === 'CH' ? 'SBB' : 'bahn.de'} buchen
          </a>
        </div>
      )}
    </div>
  )
}

function taktText(t: string) {
  return t === 'stuendlich' ? 'stündlich' : t === 'zweistuendlich' ? 'zweistündlich' : 'unregelmäßig'
}
