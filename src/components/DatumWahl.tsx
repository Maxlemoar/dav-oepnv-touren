'use client'
import { lokalesDatum, naechsterSamstag } from '@/lib/datum'
import { FENSTER_WERTE, zeitraumKurz } from '@/lib/steuerleiste'
import { rueckAnheben, zeitraumVorschlaege } from '@/lib/zeitraum'

type Props = {
  datum: string
  rueck: string
  fenster: number
  onZeitraum: (datum: string, rueck: string) => void
  onFenster: (fenster: number) => void
}

const FELD = 'min-h-11 w-full rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base text-tinte'

/** Inhalt des Sheets "Wann?": Wochenend-Chips, aufklappbar ein freies Datum, darunter das Tourenfenster. */
export function DatumWahl({ datum, rueck, fenster, onZeitraum, onFenster }: Props) {
  const heute = lokalesDatum(new Date())
  const vorschlaege = zeitraumVorschlaege(naechsterSamstag())
  const gleicherTag = datum === rueck
  const passtVorschlag = vorschlaege.some((v) => v.datum === datum && v.rueck === rueck)

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Zeitraum" className="grid grid-cols-2 gap-2">
        {vorschlaege.map((v) => {
          const aktiv = v.datum === datum && v.rueck === rueck
          return (
            <button key={v.label} type="button" aria-pressed={aktiv} onClick={() => onZeitraum(v.datum, v.rueck)}
              className={`chip h-auto min-h-11 w-full flex-col justify-center gap-0 py-1 ${aktiv ? 'chip-aktiv' : ''}`}>
              <span>{v.label}</span>
              <span className="text-xs font-normal opacity-70">{zeitraumKurz(v.datum, v.rueck)}</span>
            </button>
          )
        })}
      </div>

      {/* Offen, wenn das gewählte Datum zu keinem Chip passt, damit die Felder die Auswahl zeigen. */}
      <details open={!passtVorschlag} className="rounded-[var(--radius-knopf)] border border-linie bg-karte">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          Anderes Datum<span aria-hidden className="text-tinte-3">▾</span>
        </summary>
        <div className="grid grid-cols-2 gap-2 border-t border-linie p-3">
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
      </details>

      <div>
        <p className="text-sm font-medium">Mindestens am Berg</p>
        <div role="group" aria-label="Mindestens am Berg" className="mt-2 flex flex-wrap gap-2">
          {FENSTER_WERTE.map((m) => {
            const aktiv = fenster === m
            return (
              <button key={m} type="button" onClick={() => onFenster(m)} aria-pressed={aktiv} disabled={!gleicherTag}
                className={`chip min-h-11 ${aktiv ? 'chip-aktiv' : ''} disabled:cursor-not-allowed disabled:opacity-50`}>{m / 60} h</button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-tinte-3">
          {gleicherTag ? 'Zeit zwischen Ankunft und letzter Rückfahrt.' : 'Nur bei Hin- und Rückfahrt am selben Tag.'}
        </p>
      </div>
    </div>
  )
}
