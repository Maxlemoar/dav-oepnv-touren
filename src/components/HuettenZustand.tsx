'use client'
import { Suspense, type ReactNode } from 'react'
import type { Haltestelle, Huette } from '@/lib/content/schema'
import { datumKurz } from '@/lib/datum'
import { bedientAm, huetteZustandAm } from '@/lib/saison'
import { ZustandBadge } from './Badges'
import { useZeitraum } from './Zeitraum'

/**
 * Geschlossen oder Umbau laut Status steht schon im Server-HTML (ohne JavaScript, für Suchmaschinen). Liegt das gewählte
 * Datum nach statusBis, ersetzt die Client-Darstellung den Platzhalter.
 */
const lautStatusZu = (h: Huette) => h.status !== 'offen'
const bisText = (h: Huette) => (h.statusBis ? ` bis ${Number(h.statusBis.slice(8))}.${Number(h.statusBis.slice(5, 7))}.${h.statusBis.slice(0, 4)}` : '')

/** Kleiner Zustands-Badge für die Hüttenkarte: "Sa 14.11.: vermutlich geschlossen". */
export function HuettenZustandKurz({ huette }: { huette: Huette }) {
  const fallback = lautStatusZu(huette) ? <ZustandBadge zustand={{ zustand: 'geschlossen', sicher: true }} /> : null
  return <Suspense fallback={fallback}><KurzInnen huette={huette} /></Suspense>
}

function KurzInnen({ huette }: { huette: Huette }) {
  const { datum } = useZeitraum(1)
  return <ZustandBadge zustand={huetteZustandAm(huette, datum)} datumText={datumKurz(datum)} />
}

/**
 * Zustand der Hütte am Anreisetag für die Hüttenseite. Geschlossene Hütten bekommen einen deutlichen Warnhinweis
 * samt statusHinweis, Winterräume einen ruhigeren Hinweis.
 */
export function HuettenZustandBanner({ huette }: { huette: Huette }) {
  const fallback = lautStatusZu(huette) ? <Banner titel={`Geschlossen${bisText(huette)}`} hinweis={huette.statusHinweis} /> : null
  return <Suspense fallback={fallback}><BannerInnen huette={huette} /></Suspense>
}

function BannerInnen({ huette }: { huette: Huette }) {
  const { datum } = useZeitraum(1)
  const z = huetteZustandAm(huette, datum)
  const am = datumKurz(datum)
  if (z.zustand === 'geschlossen') {
    return <Banner titel={`${z.sicher ? 'Geschlossen' : 'Vermutlich geschlossen'} am ${am}`} hinweis={z.hinweis} />
  }
  if (z.zustand === 'winterraum') {
    return (
      <p className="rounded-[var(--radius-knopf)] border border-linie bg-nebel px-3 py-2 text-sm">
        <strong>{z.sicher ? 'Am' : 'Vermutlich am'} {am} nur Winterraum.</strong> Unbewirtschaftet, Verpflegung und Schlafsack selbst mitbringen.
      </p>
    )
  }
  return <ZustandBadge zustand={z} datumText={am} />
}

function Banner({ titel, hinweis }: { titel: string; hinweis?: string }) {
  return (
    <div role="note" className="warnhinweis border-signal/50">
      <p className="font-semibold text-signal">{titel}</p>
      <p className="mt-0.5">{hinweis ?? 'Vor der Tour bei der Hütte nachfragen.'}</p>
    </div>
  )
}

/** Hinweis zur Bedienung einer Haltestelle (Saisonbus); am Datum ohne Bus als Warnhinweis. */
export function BedientHinweis({ haltestelle }: { haltestelle: Pick<Haltestelle, 'bedient' | 'bedientHinweis'> }) {
  const text = haltestelle.bedientHinweis ?? (haltestelle.bedient ? 'Nur in der Saison bedient.' : undefined)
  if (!text) return null
  const neutral = <p className="text-sm text-tinte-3">{text}</p>
  return <Suspense fallback={neutral}><BedientInnen haltestelle={haltestelle} text={text} neutral={neutral} /></Suspense>
}

function BedientInnen({ haltestelle, text, neutral }: { haltestelle: Pick<Haltestelle, 'bedient'>; text: string; neutral: ReactNode }) {
  const { datum } = useZeitraum(0)
  if (bedientAm(haltestelle, datum)) return neutral
  return <p className="warnhinweis">Am {datumKurz(datum)} kein Bus: {text}</p>
}
