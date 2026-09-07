'use client'
import { lokalesDatum, naechsterSamstag } from '@/lib/datum'
import { rueckAnheben, zeitraumVorschlaege } from '@/lib/zeitraum'

export const STANDARD_FENSTER = 360

type Props = {
  datum: string
  rueck: string
  fenster: number
  onZeitraum: (datum: string, rueck: string) => void
  onFenster: (fenster: number) => void
}

const FELD = 'min-h-11 w-full rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base text-tinte'

export function DatumWahl({ datum, rueck, fenster, onZeitraum, onFenster }: Props) {
  const heute = lokalesDatum(new Date())
  const vorschlaege = zeitraumVorschlaege(naechsterSamstag())
  const gleicherTag = datum === rueck

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-tinte-3">
          Hin
          <input type="date" value={datum} min={heute} className={FELD}
            // "Zurück" zieht mit, wenn die Hinfahrt dahinter rutscht.
            onChange={(e) => { if (e.target.value) onZeitraum(e.target.value, rueckAnheben(e.target.value, rueck)) }} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-tinte-3">
          Zurück
          <input type="date" value={rueck} min={datum} className={FELD}
            onChange={(e) => { if (e.target.value) onZeitraum(datum, rueckAnheben(datum, e.target.value)) }} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {vorschlaege.map((v) => {
          const aktiv = v.datum === datum && v.rueck === rueck
          return (
            <button key={v.label} type="button" className={`chip ${aktiv ? 'chip-aktiv' : ''}`} aria-pressed={aktiv}
              onClick={() => onZeitraum(v.datum, v.rueck)}>{v.label}</button>
          )
        })}
        {gleicherTag && (
          <label className="ml-auto flex items-center gap-2 text-sm text-tinte-2">
            Mindestens am Berg
            <select value={fenster} onChange={(e) => onFenster(Number(e.target.value))} className="min-h-11 rounded-[var(--radius-knopf)] border border-linie bg-karte px-2 text-base text-tinte">
              {[180, 240, 300, 360, 420, 480].map((m) => <option key={m} value={m}>{m / 60} h</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
