'use client'
import { SPORTART_LABEL, SportartSchema, type Sportart } from '@/lib/content/schema'
import { MAX_STD_WERTE, type Art, type FilterZustand } from '@/lib/filter'

const ARTEN: { wert: Art; label: string }[] = [
  { wert: 'alle', label: 'Alle' }, { wert: 'tag', label: 'Tagestour' }, { wert: 'nacht', label: 'Mit Hütte' },
]

export function Filter({ wert, onChange }: { wert: FilterZustand; onChange: (f: FilterZustand) => void }) {
  function toggleSport(s: Sportart) {
    const sport = wert.sport.includes(s) ? wert.sport.filter((x) => x !== s) : [...wert.sport, s]
    onChange({ ...wert, sport })
  }
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Art" className="grid grid-cols-3 overflow-hidden rounded-[var(--radius-knopf)] border border-linie bg-karte">
        {ARTEN.map((a) => (
          <button key={a.wert} type="button" onClick={() => onChange({ ...wert, art: a.wert })} aria-pressed={wert.art === a.wert}
            className={`min-h-11 text-sm ${wert.art === a.wert ? 'bg-tanne text-white' : 'text-tinte-2'}`}>{a.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sportart">
        {SportartSchema.options.map((s) => (
          <button key={s} type="button" onClick={() => toggleSport(s)} aria-pressed={wert.sport.includes(s)}
            className={`chip ${wert.sport.includes(s) ? 'chip-aktiv' : ''}`}>{SPORTART_LABEL[s]}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Maximale Fahrzeit">
        <span className="text-sm text-tinte-2">Fahrzeit bis</span>
        {MAX_STD_WERTE.map((h) => (
          <button key={h} type="button" onClick={() => onChange({ ...wert, maxStd: h })} aria-pressed={wert.maxStd === h}
            className={`chip ${wert.maxStd === h ? 'chip-aktiv' : ''}`}>{h === 99 ? 'alle' : `${h} h`}</button>
        ))}
      </div>
    </div>
  )
}
