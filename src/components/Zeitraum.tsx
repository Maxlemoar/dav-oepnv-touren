'use client'
import { Suspense, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Saison } from '@/lib/content/labels'
import { datumKurz, naechsterSamstag } from '@/lib/datum'
import { gebietPasstZurJahreszeit } from '@/lib/saison'
import { schreibeZeitraum, zeitraumText } from '@/lib/steuerleiste'
import { zeitraumAusUrl } from '@/lib/verbindung/url'
import { mitZeitraum, zeitraumQuery } from '@/lib/zeitraum'
import { DatumWahl } from './DatumWahl'
import { Sheet } from './Sheet'
import { KalenderSymbol } from './Steuerleiste'

/**
 * Zeitraum der Detailseiten aus der URL (datum, rueck, fenster). Gebietsseiten 0, Hüttenseiten 1 Mindestnacht.
 * Nutzt useSearchParams; aufrufende Komponenten stehen deshalb in einer Suspense-Grenze.
 */
export function useZeitraum(mindestNaechte: number) {
  return zeitraumAusUrl(useSearchParams(), mindestNaechte)
}

type LinkProps = { href: string; className?: string; children: ReactNode }

/** Interner Link, der den Zeitraum der aktuellen Seite mitnimmt. Ohne JavaScript bzw. bis zur Hydration ohne Zeitraum. */
export function ZeitraumLink(props: LinkProps) {
  return (
    <Suspense fallback={<Link href={props.href} className={props.className}>{props.children}</Link>}>
      <ZeitraumLinkInnen {...props} />
    </Suspense>
  )
}

function ZeitraumLinkInnen({ href, className, children }: LinkProps) {
  const sp = useSearchParams()
  return <Link href={mitZeitraum(href, zeitraumQuery(sp))} className={className}>{children}</Link>
}

type PillProps = {
  mindestNaechte: 0 | 1
  /** Saison des Gebiets; außerhalb der Saison erscheint ein Warnhinweis. */
  saison?: Saison
}

const PILL_PLATZHALTER = (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-sm text-tinte-2">Verbindung für</span>
    <span className="pill text-tinte-2"><KalenderSymbol />Kommender Samstag</span>
  </div>
)

/**
 * Zeitraum-Pill der Gebiets- und Hüttenseite: nennt das verwendete Datum ("Verbindung für Sa 14.11.") und öffnet
 * das Sheet "Wann?". Änderungen landen per history.replaceState in der URL; Next gleicht useSearchParams ab,
 * sodass Verbindungszeilen und Links sofort reagieren.
 */
export function ZeitraumPill(props: PillProps) {
  return (
    <Suspense fallback={PILL_PLATZHALTER}>
      <ZeitraumPillInnen {...props} />
    </Suspense>
  )
}

function ZeitraumPillInnen({ mindestNaechte, saison }: PillProps) {
  const sp = useSearchParams()
  const { datum, rueck, fenster } = zeitraumAusUrl(sp, mindestNaechte)
  const [offen, setOffen] = useState(false)
  const text = zeitraumText(datum, rueck)
  const ausserSaison = saison !== undefined && !gebietPasstZurJahreszeit({ saison }, datum)

  function aendere(z: { datum: string; rueck: string; fenster: number }) {
    const neu = schreibeZeitraum(new URLSearchParams(window.location.search), z, naechsterSamstag())
    const q = neu.toString()
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-tinte-2">Verbindung für</span>
        <button type="button" className="pill" aria-haspopup="dialog" aria-label={`Zeitraum ändern: ${text}`} onClick={() => setOffen(true)}>
          <KalenderSymbol />{text}
        </button>
      </div>
      {ausserSaison && (
        <p className="warnhinweis">
          {saison === 'sommer' ? 'Sommerziel' : 'Winterziel'}: Am {datumKurz(datum)} liegt es außerhalb der üblichen Saison. Hütten und Busse können geschlossen sein.
        </p>
      )}
      {offen && (
        <Sheet offen titel="Wann?" onClose={() => setOffen(false)}>
          <DatumWahl datum={datum} rueck={rueck} fenster={fenster} mindestNaechte={mindestNaechte}
            onZeitraum={(d, r) => aendere({ datum: d, rueck: r, fenster })}
            onFenster={(f) => aendere({ datum, rueck, fenster: f })} />
        </Sheet>
      )}
    </div>
  )
}
