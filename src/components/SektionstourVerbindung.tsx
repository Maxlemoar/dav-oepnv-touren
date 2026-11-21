'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Land } from '@/lib/content/schema'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import { anreisetext, ticketKurz } from '@/lib/dav360'
import { lokaleUhrzeit, minutenAlsDauer, wochentagKurz, lokalesDatum } from '@/lib/datum'
import { machbar, sektionstourAnfrage } from '@/lib/sektionstour-verbindung'
import { useSektionstourMeldung } from './SektionstourZaehler'

type Props = {
  tourId: number
  start: { id: string; name: string }
  ziel: { id: string; name: string; land: Land }
  gebietId: string
  datum: string
  rueck: string
  richtwert?: { fahrzeitMin: number; umstiege: number }
}

type Zustand = { status: 'laedt' } | { status: 'fertig'; antwort?: VerbindungAntwort }

function umstiege(n: number) {
  return n === 0 ? 'direkt' : `${n} ${n === 1 ? 'Umstieg' : 'Umstiege'}`
}

const tagUndZeit = (iso: string) => `${wochentagKurz(lokalesDatum(iso))} ${lokaleUhrzeit(iso)}`

const LAEDT = <div className="skeleton h-6 w-3/4" aria-busy />

/** Verbindung zu einer Sektionstour; liest ab/bis aus der Seiten-URL (sonst 5:00 bis 23:00), daher in einer Suspense-Grenze. */
export function SektionstourVerbindung(props: Props) {
  return <Suspense fallback={LAEDT}><SektionstourVerbindungInnen {...props} /></Suspense>
}

function SektionstourVerbindungInnen({ tourId, start, ziel, gebietId, datum, rueck, richtwert }: Props) {
  const melde = useSektionstourMeldung()
  const [zustand, setZustand] = useState<Zustand>({ status: 'laedt' })
  const [kopiert, setKopiert] = useState<'nein' | 'ja' | 'fehler'>('nein')
  const anfrage = sektionstourAnfrage(start.id, ziel.id, datum, rueck, useSearchParams())

  useEffect(() => {
    let aktiv = true
    fetch(`/api/verbindung?${anfrage}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then((a: VerbindungAntwort | undefined) => {
        if (!aktiv) return
        setZustand({ status: 'fertig', antwort: a })
        melde(tourId, machbar(a))
      })
      .catch(() => {
        if (!aktiv) return
        setZustand({ status: 'fertig' })
        melde(tourId, false)
      })
    return () => { aktiv = false }
  }, [anfrage, melde, tourId])

  if (zustand.status === 'laedt') return LAEDT

  const a = zustand.antwort
  const live = a?.quelle === 'live' ? a : undefined
  const hin = live?.hinfahrt
  const zurueck = live?.rueckfahrt
  const rw = a?.richtwert ?? richtwert
  const richtwertKurz = rw && { fahrzeitMin: rw.fahrzeitMin, umstiege: rw.umstiege }
  const hinweis = a?.hinweis ?? (a?.quelle === 'live' ? 'keine Verbindung im Zeitfenster gefunden' : 'Live-Fahrplan für das Datum nicht erreichbar')
  // Grund, wenn die Verbindung nicht passt (etwa "fährt am Datum nicht"); bei gefundener Hinfahrt unter der Zeile.
  const grund = a?.passung && !a.passung.passt ? a.passung.grund : undefined

  function text() {
    const basis = typeof window === 'undefined' ? '' : window.location.origin
    return anreisetext({
      startName: start.name,
      zielName: ziel.name,
      hinfahrt: hin && { ab: hin.ab, an: hin.an, umstiege: hin.umstiege },
      rueckfahrt: zurueck && { ab: zurueck.ab, an: zurueck.an, umstiege: zurueck.umstiege },
      richtwert: richtwertKurz,
      ticket: a ? ticketKurz(a.ticket.ticket, ziel.land) : undefined,
      link: `${basis}/gebiet/${gebietId}?${new URLSearchParams({ datum, rueck }).toString()}`,
    })
  }

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text())
      setKopiert('ja')
      setTimeout(() => setKopiert('nein'), 2500)
    } catch {
      setKopiert('fehler')
    }
  }

  return (
    <div className="space-y-2">
      {hin ? (
        <p className="text-sm text-tinte-2">
          <span className="zahl text-base text-tinte">{tagUndZeit(hin.ab)}–{lokaleUhrzeit(hin.an)}</span> bis {ziel.name}, {umstiege(hin.umstiege)}
          {zurueck && (
            <> · zurück <span className="zahl text-base text-tinte">{tagUndZeit(zurueck.ab)}–{lokaleUhrzeit(zurueck.an)}</span></>
          )}
          {!zurueck && <> · <span className="text-tinte-3">keine Rückfahrt gefunden</span></>}
          {grund && <span className="block text-xs text-tinte-3">{grund}</span>}
        </p>
      ) : (
        <p className="text-sm text-tinte-2">
          {richtwertKurz
            ? <><span className="zahl text-base text-tinte">ca. {minutenAlsDauer(richtwertKurz.fahrzeitMin)}</span> bis {ziel.name}, {umstiege(richtwertKurz.umstiege)}</>
            : <>Bis {ziel.name}</>}
          <span className="block text-xs text-tinte-3">{grund ?? hinweis}</span>
        </p>
      )}
      <button type="button" onClick={kopieren} className="knopf-sekundaer w-full text-sm sm:w-auto">
        {kopiert === 'ja' ? 'Kopiert' : 'Anreisetext kopieren'}
      </button>
      <span className="sr-only" aria-live="polite">{kopiert === 'ja' ? 'Anreisetext in die Zwischenablage kopiert' : ''}</span>
      {kopiert === 'fehler' && (
        <label className="block text-xs text-tinte-3">
          Kopieren nicht möglich, bitte von Hand markieren:
          <textarea readOnly value={text()} rows={4} className="mt-1 w-full rounded-[var(--radius-knopf)] border border-linie bg-karte p-2 text-sm text-tinte" onFocus={(e) => e.currentTarget.select()} />
        </label>
      )}
    </div>
  )
}
