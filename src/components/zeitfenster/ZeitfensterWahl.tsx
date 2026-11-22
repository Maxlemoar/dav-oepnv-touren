'use client'
import { Suspense, useEffect, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { drossel } from '@/lib/drossel'
import { lokalesDatum, minutenAlsDauer, tageAddieren } from '@/lib/datum'
import {
  alsUhrzeit, datumAusEingabe, rueckNachHinwechsel, schnellwahl, VOR_ORT_MAX_MIN, ZEITBAND, zeitenAusweichen, zeitenFuerTagestour,
  zeitfensterAusUrl, zeitfensterSchreiben, type Zeitfenster,
} from '@/lib/zeitfenster'

type Props = {
  /** 1: nur Zeiträume mit Übernachtung (Hüttenseite): Rückfahrt frühestens am Folgetag, ohne "Mindestens vor Ort". Standard 0. */
  mindestNaechte?: 0 | 1
}

const FELD = 'min-h-11 rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base text-tinte disabled:opacity-50'

type Uhrzeiten = Pick<Zeitfenster, 'abMin' | 'bisMin' | 'vorOrtMin'>

/** Alle wählbaren Uhrzeiten: 4:00 bis 24:00 in 30-Minuten-Stufen. */
const UHRZEITEN = Array.from(
  { length: (ZEITBAND.bisMin - ZEITBAND.vonMin) / ZEITBAND.schrittMin + 1 },
  (_, i) => ZEITBAND.vonMin + i * ZEITBAND.schrittMin,
)

/**
 * Abstand der URL-Schreibvorgänge beim Ziehen des Schiebers. Browser drosseln bzw. verweigern zu viele replaceState-Aufrufe
 * (Safari ab etwa 100 je 10 s); Next ruft zu jedem eigenen Aufruf noch einmal replaceState auf. 250 ms ergeben höchstens
 * etwa 80 je 10 s.
 */
const SCHREIB_ABSTAND_MS = 250

/**
 * Schreibt das Zeitfenster per replaceState in die URL; Next gleicht useSearchParams ab. `mitDatum: false` lässt datum
 * und rueck weg. Wirft nie: verweigert der Browser den Aufruf (Safari, Firefox: SecurityError bei zu vielen), bleibt die
 * URL beim letzten Stand und der nächste Aufruf versucht es wieder.
 */
function schreibe(z: Zeitfenster, mitDatum: boolean) {
  const neu = zeitfensterSchreiben(new URLSearchParams(window.location.search), z, { ohneDatum: !mitDatum })
  const q = neu.toString()
  try {
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  } catch { /* gedrosselt; der nächste Schreibvorgang holt es nach */ }
}

const gleich = (a: Uhrzeiten, b: Uhrzeiten) => a.abMin === b.abMin && a.bisMin === b.bisMin && a.vorOrtMin === b.vorOrtMin

function vorOrtText(min: number): string {
  if (min === 0) return 'egal'
  return min % 60 === 0 ? `${min / 60} h` : minutenAlsDauer(min)
}

/**
 * Wann geht es los, wann zurück, wie im DB Navigator: je eine Zeile für Hinfahrt (Datum, ab) und Rückfahrt (Datum, bis),
 * darunter Schnellwahl (Samstag, Sonntag, Wochenende) und bei einer Tagestour "mindestens vor Ort". Ob es eine Tagestour
 * ist, ergibt sich aus den Daten; einen Schalter gibt es nicht. Alles steht in der URL. Ohne gewähltes Datum schreiben
 * Uhrzeiten und Schieber nur die Uhrzeiten (eine Uhrzeit wählt nie ein Datum); erst Chip oder Hindatum setzen datum.
 */
export function ZeitfensterWahl(props: Props) {
  return (
    <Suspense fallback={<div className="skeleton h-72" aria-hidden />}>
      <ZeitfensterWahlInnen {...props} />
    </Suspense>
  )
}

function ZeitfensterWahlInnen({ mindestNaechte = 0 }: Props) {
  const ausUrl = zeitfensterAusUrl(useSearchParams(), { mindestNaechte })
  // Beim Ziehen folgt der Schieber diesen Werten sofort; die URL (und damit die Liste) zieht gedrosselt nach.
  // Hat die URL den Entwurf eingeholt, gilt wieder die URL (angepasster Zustand während des Renderns, kein Effekt).
  const [entwurf, setEntwurf] = useState<Uhrzeiten | null>(null)
  if (entwurf && gleich(entwurf, ausUrl)) setEntwurf(null)
  const z = entwurf ? { ...ausUrl, ...entwurf } : ausUrl
  const [schreiber] = useState(() => drossel(schreibe, SCHREIB_ABSTAND_MS))
  // Ein offener Schreibvorgang darf nach dem Verlassen der Seite nicht mehr in eine fremde URL schreiben.
  useEffect(() => () => schreiber.abbrechen(), [schreiber])
  const heute = lokalesDatum(new Date())
  const gleicherTag = z.rueck === z.datum

  /** Sofort schreiben (Datum, Chip, Uhrzeit-Auswahl); ein offener Schieber-Schreibvorgang entfällt. Ohne Datum nur die Uhrzeiten (R6). */
  function setze(neu: Zeitfenster, mitDatum: boolean) {
    schreiber.abbrechen()
    setEntwurf(null)
    schreibe(zeitenFuerTagestour(neu), mitDatum)
  }

  function waehleHin(datum: string) {
    setze({ ...z, datum, rueck: rueckNachHinwechsel(z, datum, mindestNaechte) }, true)
  }

  function waehleZeit(neu: { abMin: number; bisMin: number }) {
    setze({ ...z, ...zeitenAusweichen(z, neu, gleicherTag) }, z.gewaehlt)
  }

  /** Schieber "vor Ort": sofort sichtbar, URL gedrosselt. */
  function schiebeVorOrt(vorOrtMin: number) {
    const neu = { abMin: z.abMin, bisMin: z.bisMin, vorOrtMin }
    setEntwurf(neu)
    schreiber.rufe({ ...z, ...neu }, z.gewaehlt)
  }
  const loslassen = () => schreiber.sofort()

  return (
    <section aria-label="Zeitfenster" className="space-y-4">
      <div className="space-y-3">
        <Zeile titel="Hinfahrt">
          <DatumFeld aria-label="Datum der Hinfahrt" fruehestens={heute} wert={z.gewaehlt ? z.datum : ''}
            className={`${FELD} min-w-0 flex-1`} onWahl={waehleHin} />
          <UhrzeitWahl beschriftung="ab" aria-label="Hinfahrt ab Offenburg" wert={z.abMin}
            onWahl={(abMin) => waehleZeit({ abMin, bisMin: z.bisMin })} />
        </Zeile>
        <Zeile titel="Rückfahrt">
          <DatumFeld aria-label="Datum der Rückfahrt" fruehestens={tageAddieren(z.datum, mindestNaechte)}
            wert={z.gewaehlt ? z.rueck : ''} disabled={!z.gewaehlt} className={`${FELD} min-w-0 flex-1`}
            onWahl={(rueck) => setze({ ...z, rueck }, true)} />
          <UhrzeitWahl beschriftung="bis" aria-label="zurück in Offenburg bis" wert={z.bisMin}
            onWahl={(bisMin) => waehleZeit({ abMin: z.abMin, bisMin })} />
        </Zeile>
        {!z.gewaehlt && (
          <p className="text-xs text-tinte-3">
            Zuerst das Datum der Hinfahrt wählen, die Rückfahrt folgt {mindestNaechte > 0 ? 'am Tag danach' : 'am selben Tag'}.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {schnellwahl(heute, mindestNaechte).map((s) => {
            const aktiv = z.gewaehlt && z.datum === s.datum && z.rueck === s.rueck
            return (
              <button key={s.label} type="button" aria-pressed={aktiv}
                onClick={() => setze({ ...z, datum: s.datum, rueck: s.rueck }, true)}
                className={`chip min-h-11 ${aktiv ? 'chip-aktiv' : ''}`}>{s.label}</button>
            )
          })}
        </div>
      </div>

      {mindestNaechte === 0 && gleicherTag && (
        <label className="block">
          <span className="text-sm text-tinte-2">Mindestens vor Ort <span className="zahl text-tinte">{vorOrtText(z.vorOrtMin)}</span></span>
          <input type="range" min={0} max={VOR_ORT_MAX_MIN} step={ZEITBAND.schrittMin} value={z.vorOrtMin}
            aria-label="mindestens vor Ort" aria-valuetext={vorOrtText(z.vorOrtMin)}
            onChange={(e) => schiebeVorOrt(Number(e.target.value))}
            onPointerUp={loslassen} onKeyUp={loslassen} onBlur={loslassen}
            className="block h-11 w-full cursor-pointer accent-tanne" />
        </label>
      )}
    </section>
  )
}

/** Eine Zeile "Hinfahrt" oder "Rückfahrt": Titel, darunter Datum und Uhrzeit nebeneinander. */
function Zeile({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{titel}</legend>
      <div className="mt-1.5 flex items-center gap-2">{children}</div>
    </fieldset>
  )
}

/** Uhrzeit in 30-Minuten-Stufen (select statt input type=time: Safari ignoriert step). */
function UhrzeitWahl({ beschriftung, wert, onWahl, ...rest }: { beschriftung: string; wert: number; onWahl: (min: number) => void; 'aria-label': string }) {
  return (
    <label className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-tinte-2">{beschriftung}</span>
      <select {...rest} value={wert} onChange={(e) => onWahl(Number(e.target.value))} className={`${FELD} zahl pr-8`}>
        {UHRZEITEN.map((m) => <option key={m} value={m}>{alsUhrzeit(m)}</option>)}
      </select>
    </label>
  )
}

type DatumFeldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'min' | 'onChange' | 'onBlur'> & {
  /** Übernommener Wert aus der URL ('' ohne gewähltes Datum). */
  wert: string
  fruehestens: string
  onWahl: (datum: string) => void
}

/**
 * Datumsfeld mit eigenem Entwurf: Beim Tippen meldet Chrome Zwischenstände (0002-12-05); sie bleiben im Feld stehen und
 * gehen nicht in die URL. Übernommen wird nur ein gültiges Datum ab `fruehestens`, beim Ändern; beim Verlassen springt ein
 * unvollständiger oder zu früher Entwurf auf den übernommenen Wert zurück. Hat die URL den Entwurf eingeholt, gilt wieder
 * die URL (angepasster Zustand während des Renderns).
 */
function DatumFeld({ wert, fruehestens, onWahl, ...rest }: DatumFeldProps) {
  const [entwurf, setEntwurf] = useState<string | null>(null)
  if (entwurf !== null && entwurf === wert) setEntwurf(null)
  return (
    <input {...rest} type="date" min={fruehestens} value={entwurf ?? wert}
      onChange={(e) => {
        const v = e.target.value
        setEntwurf(v)
        const d = datumAusEingabe(v, fruehestens)
        if (d !== undefined && d !== wert) onWahl(d)
      }}
      onBlur={(e) => { if (datumAusEingabe(e.target.value, fruehestens) === undefined) setEntwurf(null) }} />
  )
}
