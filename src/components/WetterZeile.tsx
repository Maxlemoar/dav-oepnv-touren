'use client'
import { Suspense, useEffect, useState } from 'react'
import { datumKurz } from '@/lib/datum'
import { wetterCode, wetterDaten, wetterKurz, type WetterAntwort } from '@/lib/wetter'
import { useZeitraum } from './Zeitraum'

type Props = {
  /** Hüttenseite: Hütte (Hüttenhöhe), Gebietsseite: Gebiet (Höhe der ersten Hütte). */
  ort: { huette: string } | { gebiet: string }
  mindestNaechte: 0 | 1
  className?: string
}

/**
 * Wetter am Hin- und ggf. Rückdatum, eine kleine Zeile je Tag. Nur für Daten bis 14 Tage voraus;
 * sonst und bei Fehlern erscheint nichts.
 */
export function WetterZeile(props: Props) {
  return <Suspense fallback={null}><WetterInnen {...props} /></Suspense>
}

function WetterInnen({ ort, mindestNaechte, className }: Props) {
  const { datum, rueck } = useZeitraum(mindestNaechte)
  const daten = wetterDaten(datum, rueck)
  const anfrage = daten.length > 0 ? new URLSearchParams({ ...ort, datum, rueck }).toString() : ''
  const [geladen, setGeladen] = useState<{ anfrage: string; antwort: WetterAntwort | null } | null>(null)

  useEffect(() => {
    if (!anfrage) return
    let aktiv = true
    fetch(`/api/wetter?${anfrage}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((a: WetterAntwort | null) => { if (aktiv) setGeladen({ anfrage, antwort: a }) })
      .catch(() => { if (aktiv) setGeladen({ anfrage, antwort: null }) })
    return () => { aktiv = false }
  }, [anfrage])

  if (!anfrage) return null
  if (geladen?.anfrage !== anfrage) return <div className={`skeleton h-5 w-2/3 ${className ?? ''}`} aria-busy />
  const tage = geladen.antwort?.tage ?? []
  if (tage.length === 0) return null
  const hoehe = geladen.antwort?.hoehe

  return (
    <div className={`space-y-0.5 text-sm text-tinte-2 ${className ?? ''}`}>
      {tage.map((t) => {
        const c = wetterCode(t.code)
        return (
          <p key={t.datum}>
            <span aria-hidden>{c.symbol}</span> <span className="zahl">{datumKurz(t.datum)}</span> {c.text} · {wetterKurz(t)}
          </p>
        )
      })}
      <p className="text-tinte-3">
        Vorhersage{hoehe !== undefined ? ` für ${hoehe} m` : ''} von{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline">Open-Meteo</a>
      </p>
    </div>
  )
}
