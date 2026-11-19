'use client'
import type { Ansicht } from '@/lib/steuerleiste'

/** Bausteine der Kartenleiste: Segment Liste | Karte und das Kalendersymbol der Zeitfenster-Pill. */
const ANSICHTEN: { wert: Ansicht; label: string }[] = [{ wert: 'liste', label: 'Liste' }, { wert: 'karte', label: 'Karte' }]

/** Segment Liste | Karte; ohne `onAnsicht` (Server-HTML vor der Hydration) ohne Wirkung. */
export function AnsichtSegment({ ansicht, onAnsicht, className = '' }: { ansicht: Ansicht; onAnsicht?: (a: Ansicht) => void; className?: string }) {
  return (
    <div role="group" aria-label="Ansicht" className={`flex h-10 shrink-0 overflow-hidden rounded-full border border-linie bg-karte ${className}`}>
      {ANSICHTEN.map((a) => {
        const aktiv = ansicht === a.wert
        return (
          <button key={a.wert} type="button" onClick={onAnsicht && (() => onAnsicht(a.wert))} aria-pressed={aktiv}
            className={`h-full px-3.5 text-sm font-medium ${aktiv ? 'bg-tanne text-white' : 'text-tinte-2'}`}>{a.label}</button>
        )
      })}
    </div>
  )
}

export function KalenderSymbol() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
    </svg>
  )
}
