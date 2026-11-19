'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { datumKurz, lokalesDatum, minutenAlsDauer, tageAddieren } from '@/lib/datum'
import { rueckAnheben } from '@/lib/zeitraum'
import {
  schnellwahl, VOR_ORT_MAX_MIN, ZEITBAND, zeitfensterAusUrl, zeitfensterSchreiben, type Zeitfenster,
} from '@/lib/zeitfenster'
import { Zeitband } from './Zeitband'

type Props = {
  /** 1: nur Zeiträume mit Übernachtung (Hüttenseite), ohne Umschalter und ohne "Mindestens vor Ort". Standard 0. */
  mindestNaechte?: 0 | 1
}

const FELD = 'min-h-11 rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base text-tinte disabled:opacity-50'

/** Schreibt das Zeitfenster per replaceState in die URL; Next gleicht useSearchParams ab. `mitDatum: false` lässt datum und rueck weg. */
function schreibe(z: Zeitfenster, mitDatum: boolean) {
  const neu = zeitfensterSchreiben(new URLSearchParams(window.location.search), z, { ohneDatum: !mitDatum })
  const q = neu.toString()
  window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
}

function vorOrtText(min: number): string {
  if (min === 0) return 'egal'
  return min % 60 === 0 ? `${min / 60} h` : minutenAlsDauer(min)
}

/**
 * Wann geht es los, wann zurück: Datum (kommendes Wochenende oder Datumsfeld), Tagestour | Mehrere Tage, los ab und
 * zurück bis, bei Tagestour mindestens vor Ort. Alles steht in der URL. Ohne gewähltes Datum schreiben die Schieber nur die
 * Uhrzeiten (ein Schieber wählt nie ein Datum); erst Chip oder Datumsfeld setzen datum.
 */
export function ZeitfensterWahl(props: Props) {
  return (
    <Suspense fallback={<div className="skeleton h-72" aria-hidden />}>
      <ZeitfensterWahlInnen {...props} />
    </Suspense>
  )
}

function ZeitfensterWahlInnen({ mindestNaechte = 0 }: Props) {
  const z = zeitfensterAusUrl(useSearchParams(), { mindestNaechte })
  // Ohne gewähltes Datum steht keine Rückfahrt in der URL; "Mehrere Tage" wird bis zur Datumswahl hier vorgemerkt.
  const [mehrVorgemerkt, setMehrVorgemerkt] = useState(false)
  const heute = lokalesDatum(new Date())
  const mehrtaegig = mindestNaechte > 0 || (z.gewaehlt ? z.rueck !== z.datum : mehrVorgemerkt)
  const mindestRueck = Math.max(1, mindestNaechte)

  function waehleDatum(datum: string) {
    const rueck = mehrtaegig ? rueckAnheben(datum, z.gewaehlt ? z.rueck : undefined, mindestRueck) : datum
    schreibe({ ...z, datum, rueck }, true)
  }

  function waehleArt(mehr: boolean) {
    if (!z.gewaehlt) { setMehrVorgemerkt(mehr); return }
    schreibe({ ...z, rueck: mehr ? tageAddieren(z.datum, 1) : z.datum }, true)
  }

  function band(neu: { abMin: number; bisMin: number }) {
    let { abMin, bisMin } = neu
    // Am selben Tag liegt "zurück bis" mindestens eine Stufe nach "los ab"; der andere Wert weicht aus.
    if (z.rueck === z.datum) {
      const s = ZEITBAND.schrittMin
      if (abMin !== z.abMin) {
        abMin = Math.min(abMin, ZEITBAND.bisMin - s)
        bisMin = Math.max(bisMin, abMin + s)
      } else {
        bisMin = Math.max(bisMin, ZEITBAND.vonMin + s)
        abMin = Math.min(abMin, bisMin - s)
      }
    }
    schreibe({ ...z, abMin, bisMin }, z.gewaehlt)
  }

  return (
    <section aria-label="Zeitfenster" className="space-y-4">
      <div>
        <p className="text-sm font-medium">{mehrtaegig ? 'Hinfahrt am' : 'Datum'}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {schnellwahl(heute).map((s) => {
            const aktiv = z.gewaehlt && z.datum === s.datum
            return (
              <button key={s.datum} type="button" aria-pressed={aktiv} onClick={() => waehleDatum(s.datum)}
                className={`chip min-h-11 ${aktiv ? 'chip-aktiv' : ''}`}>{s.label}</button>
            )
          })}
          <input type="date" aria-label={mehrtaegig ? 'Hinfahrt am' : 'Datum'} min={heute} value={z.gewaehlt ? z.datum : ''}
            className={FELD} onChange={(e) => { if (e.target.value >= heute) waehleDatum(e.target.value) }} />
        </div>
      </div>

      {mindestNaechte === 0 && (
        <div role="group" aria-label="Art" className="flex h-11 w-full overflow-hidden rounded-full border border-linie bg-karte sm:w-auto sm:max-w-sm">
          {[{ mehr: false, label: 'Tagestour' }, { mehr: true, label: 'Mehrere Tage' }].map((a) => {
            const aktiv = mehrtaegig === a.mehr
            return (
              <button key={a.label} type="button" aria-pressed={aktiv} onClick={() => waehleArt(a.mehr)}
                className={`h-full flex-1 px-3.5 text-sm font-medium ${aktiv ? 'bg-tanne text-white' : 'text-tinte-2'}`}>{a.label}</button>
            )
          })}
        </div>
      )}

      {mehrtaegig && (
        <label className="block">
          <span className="text-sm font-medium">Rückfahrt am</span>
          <input type="date" min={tageAddieren(z.datum, mindestRueck)} value={z.gewaehlt ? z.rueck : ''} disabled={!z.gewaehlt}
            className={`${FELD} mt-2 block`}
            onChange={(e) => { if (e.target.value) schreibe({ ...z, rueck: rueckAnheben(z.datum, e.target.value, mindestRueck) }, true) }} />
          {!z.gewaehlt && <span className="mt-1 block text-xs text-tinte-3">Zuerst das Datum der Hinfahrt wählen.</span>}
        </label>
      )}

      <div>
        <Zeitband abMin={z.abMin} bisMin={z.bisMin} onChange={band} />
        {mehrtaegig && z.gewaehlt && (
          <p className="mt-1 text-xs text-tinte-3">
            Los ab gilt für {datumKurz(z.datum)}, zurück bis für {datumKurz(z.rueck)}.
          </p>
        )}
      </div>

      {!mehrtaegig && (
        <label className="block">
          <span className="text-sm text-tinte-2">Mindestens vor Ort <span className="zahl text-tinte">{vorOrtText(z.vorOrtMin)}</span></span>
          <input type="range" min={0} max={VOR_ORT_MAX_MIN} step={ZEITBAND.schrittMin} value={z.vorOrtMin}
            aria-label="mindestens vor Ort" aria-valuetext={vorOrtText(z.vorOrtMin)}
            onChange={(e) => schreibe({ ...z, vorOrtMin: Number(e.target.value) }, z.gewaehlt)}
            className="block h-11 w-full cursor-pointer accent-tanne" />
        </label>
      )}
    </section>
  )
}
