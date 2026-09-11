'use client'
import type { Ansicht } from '@/lib/steuerleiste'

export type { Ansicht }

type Props = {
  /** Beschriftung der Zeitraum-Pill, siehe zeitraumText(). */
  zeitraum: string
  anzahlFilter: number
  ansicht: Ansicht
  onZeitraum: () => void
  onFilter: () => void
  onAnsicht: (a: Ansicht) => void
}

const ANSICHTEN: { wert: Ansicht; label: string }[] = [{ wert: 'liste', label: 'Liste' }, { wert: 'karte', label: 'Karte' }]

/**
 * Sticky Leiste unter dem Header: Pills für Zeitraum und Filter (öffnen je ein Sheet) und rechts
 * das Segment Liste | Karte (nur unter lg, ab lg stehen beide nebeneinander). Höhe 56 px + 1 px Linie.
 */
export function Steuerleiste({ zeitraum, anzahlFilter, ansicht, onZeitraum, onFilter, onAnsicht }: Props) {
  return (
    <div className="sticky top-14 z-10 -mx-4 border-b border-linie bg-papier/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
        <button type="button" className="pill" aria-haspopup="dialog" onClick={onZeitraum}>
          <KalenderSymbol />{zeitraum}
        </button>
        <button type="button" className="pill" aria-haspopup="dialog" onClick={onFilter}>
          <FilterSymbol />Filter
          {anzahlFilter > 0 && <span className="pill-zaehler" aria-label={`${anzahlFilter} aktiv`}>{anzahlFilter}</span>}
        </button>
        <div role="group" aria-label="Ansicht" className="ml-auto flex h-10 shrink-0 overflow-hidden rounded-full border border-linie bg-karte lg:hidden">
          {ANSICHTEN.map((a) => {
            const aktiv = ansicht === a.wert
            return (
              <button key={a.wert} type="button" onClick={() => onAnsicht(a.wert)} aria-pressed={aktiv}
                className={`h-full px-3.5 text-sm font-medium ${aktiv ? 'bg-tanne text-white' : 'text-tinte-2'}`}>{a.label}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function KalenderSymbol() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
    </svg>
  )
}

function FilterSymbol() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M2 4h12M4.5 8h7M7 12h2" />
    </svg>
  )
}
