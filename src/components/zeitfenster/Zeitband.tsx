'use client'
import { alsUhrzeit, ZEITBAND } from '@/lib/zeitfenster'

type Props = {
  abMin: number
  bisMin: number
  /** Meldet beide Werte; geändert hat sich der eine, den die Person bewegt hat. Abhängigkeiten (bis nach ab) regelt der Aufrufer. */
  onChange: (z: { abMin: number; bisMin: number }) => void
}

/**
 * "Los ab" und "zurück bis" auf der Uhrzeit-Spur 4:00 bis 24:00 in 30-Minuten-Schritten.
 * Zwei getrennte Schieber statt zwei Griffen auf einer Spur: bei einem Schritt Abstand (auf 375 px etwa 8 px) lägen die
 * Griffe übereinander und hakelten auf dem Handy, und bei mehreren Tagen darf "zurück bis" vor "los ab" liegen.
 * Beide Schieber teilen Skala und Breite, sodass sie untereinander wie ein Band zu lesen sind.
 */
export function Zeitband({ abMin, bisMin, onChange }: Props) {
  return (
    <div className="space-y-1">
      <Schieber label="Los ab" ariaLabel="los ab" wert={abMin} onWert={(v) => onChange({ abMin: v, bisMin })} />
      <Schieber label="Zurück bis" ariaLabel="zurück bis" wert={bisMin} onWert={(v) => onChange({ abMin, bisMin: v })} />
      <div className="flex justify-between text-xs text-tinte-3" aria-hidden>
        <span>{alsUhrzeit(ZEITBAND.vonMin)}</span>
        <span>{alsUhrzeit(ZEITBAND.bisMin)}</span>
      </div>
    </div>
  )
}

function Schieber({ label, ariaLabel, wert, onWert }: { label: string; ariaLabel: string; wert: number; onWert: (v: number) => void }) {
  const text = alsUhrzeit(wert)
  return (
    <label className="block">
      <span className="text-sm text-tinte-2">{label} <span className="zahl text-tinte">{text}</span></span>
      <input type="range" min={ZEITBAND.vonMin} max={ZEITBAND.bisMin} step={ZEITBAND.schrittMin} value={wert}
        aria-label={ariaLabel} aria-valuetext={text}
        onChange={(e) => onWert(Number(e.target.value))}
        className="block h-11 w-full cursor-pointer accent-tanne" />
    </label>
  )
}
