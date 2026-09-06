'use client'
import { folgetag, naechsterSamstag } from '@/lib/datum'

export const STANDARD_FENSTER = 360

type Props = {
  datum: string
  fenster: number
  onDatum: (datum: string) => void
  onFenster: (fenster: number) => void
}

export function DatumWahl({ datum, fenster, onDatum, onFenster }: Props) {
  const samstag = naechsterSamstag()
  const sonntag = folgetag(samstag)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-sm">
        <span className="sr-only">Datum</span>
        <input type="date" value={datum} min={new Date().toISOString().slice(0, 10)} onChange={(e) => onDatum(e.target.value)}
          className="rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base" />
      </label>
      <button type="button" className={`chip ${datum === samstag ? 'chip-aktiv' : ''}`} onClick={() => onDatum(samstag)}>Sa</button>
      <button type="button" className={`chip ${datum === sonntag ? 'chip-aktiv' : ''}`} onClick={() => onDatum(sonntag)}>So</button>
      <label className="ml-auto flex items-center gap-2 text-sm text-tinte-2">
        Mindestens am Berg
        <select value={fenster} onChange={(e) => onFenster(Number(e.target.value))} className="min-h-11 rounded-[var(--radius-knopf)] border border-linie bg-karte px-2 text-base text-tinte">
          {[180, 240, 300, 360, 420, 480].map((m) => <option key={m} value={m}>{m / 60} h</option>)}
        </select>
      </label>
    </div>
  )
}
