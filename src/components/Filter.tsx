'use client'
import { SPORTART_LABEL, SPORTARTEN, type Sportart } from '@/lib/content/labels'
import { MAX_STD_WERTE, type Art, type FilterZustand } from '@/lib/filter'

const ARTEN: { wert: Art; label: string }[] = [
  { wert: 'alle', label: 'Alle' }, { wert: 'tag', label: 'Tagestour' }, { wert: 'nacht', label: 'Mit Hütte' },
]

const TAGESTOUR_HINWEIS = 'Nur bei Hin- und Rückfahrt am selben Tag'

type Props = {
  wert: FilterZustand
  /** false bei mehrtägigem Zeitraum: "Tagestour" ist gesperrt, ein gesetztes art=tag wirkt wie "Alle". */
  tagestourMoeglich?: boolean
  onChange: (f: FilterZustand) => void
  /** Zahl der Ziele, die der Saison-Schalter gerade ausblendet. */
  ausgeblendetSaison?: number
}

/** Inhalt des Sheets "Was?": Art-Segment, Sportart-Chips (Mehrfachwahl), Fahrzeit-Chips (Einfachwahl). */
export function Filter({ wert, tagestourMoeglich = true, onChange, ausgeblendetSaison = 0 }: Props) {
  // Die URL behält art=tag, damit der Filter bei Rückkehr zum Tagesausflug wieder greift; angezeigt wird "Alle".
  const artAngezeigt = !tagestourMoeglich && wert.art === 'tag' ? 'alle' : wert.art
  function toggleSport(s: Sportart) {
    const sport = wert.sport.includes(s) ? wert.sport.filter((x) => x !== s) : [...wert.sport, s]
    onChange({ ...wert, sport })
  }
  return (
    <div className="space-y-4">
      <div>
        <button type="button" role="switch" aria-checked={wert.nurPassend} onClick={() => onChange({ ...wert, nurPassend: !wert.nurPassend })}
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-medium">
          Nur was am Datum geht
          <span aria-hidden className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors ${wert.nurPassend ? 'bg-tanne' : 'bg-linie'}`}>
            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${wert.nurPassend ? 'left-[1.125rem]' : 'left-0.5'}`} />
          </span>
        </button>
        <p className="text-xs text-tinte-3">Blendet Sommerziele außerhalb der Saison und Ziele ohne Bus am Datum aus.</p>
        {wert.nurPassend && ausgeblendetSaison > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-tinte-2">
            {ausgeblendetSaison} {ausgeblendetSaison === 1 ? 'Ziel' : 'Ziele'} wegen Saison ausgeblendet.
            <button type="button" className="min-h-11 text-tanne underline" onClick={() => onChange({ ...wert, nurPassend: false })}>Einblenden</button>
          </p>
        )}
      </div>
      <div>
        <p className="text-sm font-medium">Art</p>
        <div role="group" aria-label="Art" className="mt-2 grid grid-cols-3 overflow-hidden rounded-[var(--radius-knopf)] border border-linie bg-karte">
          {ARTEN.map((a) => {
            const gesperrt = a.wert === 'tag' && !tagestourMoeglich
            const aktiv = artAngezeigt === a.wert
            return (
              <button key={a.wert} type="button" onClick={() => onChange({ ...wert, art: a.wert })} aria-pressed={aktiv}
                disabled={gesperrt} aria-disabled={gesperrt} title={gesperrt ? TAGESTOUR_HINWEIS : undefined}
                className={`min-h-11 text-sm ${aktiv ? 'bg-tanne text-white' : 'text-tinte-2'} disabled:cursor-not-allowed disabled:text-tinte-3`}>{a.label}</button>
            )
          })}
        </div>
        {!tagestourMoeglich && <p className="mt-2 text-xs text-tinte-3">Tagestour: {TAGESTOUR_HINWEIS.toLowerCase()}.</p>}
      </div>
      <div>
        <p className="text-sm font-medium">Sportart</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Sportart">
          {SPORTARTEN.map((s) => (
            <button key={s} type="button" onClick={() => toggleSport(s)} aria-pressed={wert.sport.includes(s)}
              className={`chip min-h-11 ${wert.sport.includes(s) ? 'chip-aktiv' : ''}`}>{SPORTART_LABEL[s]}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">Fahrzeit bis</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Maximale Fahrzeit">
          {MAX_STD_WERTE.map((h) => (
            <button key={h} type="button" onClick={() => onChange({ ...wert, maxStd: h })} aria-pressed={wert.maxStd === h}
              className={`chip min-h-11 ${wert.maxStd === h ? 'chip-aktiv' : ''}`}>{h === 99 ? 'alle' : `${h} h`}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
