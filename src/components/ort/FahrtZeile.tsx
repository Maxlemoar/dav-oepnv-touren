'use client'
import { useState } from 'react'
import { lokaleUhrzeit, minutenAlsDauer } from '@/lib/datum'
import { umstiegKnopfText } from '@/lib/fahrtenwahl'
import type { FahrtLive } from '@/lib/verbindung/fahrten'
import { VerbindungDetail } from '../VerbindungDetail'

type Props = {
  f: FahrtLive
  gewaehlt: boolean
  onWahl: () => void
  /** Fahrplanlink für genau diese Fahrt ("bei SBB" / "bei bahn.de"). */
  link: { href: string; text: string }
}

const LAGE_TEXT = { frueher: 'früher als gewünscht', spaeter: 'später als gewünscht' } as const

function umstiegsText(f: FahrtLive): string {
  if (f.via.length > 0) return `via ${f.via.join(', ')}`
  if (f.umstiege === 0) return 'direkt'
  return `${f.umstiege} ${f.umstiege === 1 ? 'Umstieg' : 'Umstiege'}`
}

/**
 * Eine Fahrt: "06:12 → 09:41 · 3:29 h · via Basel SBB, Bern". Die Zeile ist ein Knopf (`aria-pressed`) und wählt die
 * Fahrt; daneben ein eigener Knopf für die Abschnitte (nicht verschachtelt). Fahrten außerhalb des Fensters gedämpft.
 */
export function FahrtZeile({ f, gewaehlt, onWahl, link }: Props) {
  const [offen, setOffen] = useState(false)
  const gedaempft = f.lage !== 'passend'
  const hatAbschnitte = f.abschnitte.length > 0

  return (
    <li>
      <div className="flex items-start gap-2">
        <button type="button" aria-pressed={gewaehlt} onClick={onWahl}
          className={`flex min-h-11 flex-1 items-start gap-2.5 rounded-[var(--radius-knopf)] border px-2.5 py-2 text-left ${
            gewaehlt ? 'border-tanne bg-tanne-tint' : 'border-transparent hover:border-linie'}`}>
          <span aria-hidden className={`mt-1.5 inline-block size-3 shrink-0 rounded-full border-2 ${gewaehlt ? 'border-tanne bg-tanne' : 'border-linie bg-karte'}`} />
          <span className={`min-w-0 ${gedaempft ? 'text-tinte-3' : ''}`}>
            <span className="zahl whitespace-nowrap">{lokaleUhrzeit(f.ab)} → {lokaleUhrzeit(f.an)}</span>
            <span className={`text-sm ${gedaempft ? '' : 'text-tinte-2'}`}> · {minutenAlsDauer(f.dauerMin)} · {umstiegsText(f)}</span>
            {gedaempft && <span className="block text-xs">{LAGE_TEXT[f.lage as keyof typeof LAGE_TEXT]}</span>}
          </span>
        </button>
        {hatAbschnitte ? (
          <button type="button" aria-expanded={offen} onClick={() => setOffen((o) => !o)}
            aria-label={`${umstiegKnopfText(f.umstiege, offen)} zur Fahrt ${lokaleUhrzeit(f.ab)} bis ${lokaleUhrzeit(f.an)}`}
            className="min-h-11 shrink-0 px-1 text-sm text-tanne underline">
            {umstiegKnopfText(f.umstiege, offen)}
          </button>
        ) : (
          <a href={link.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center px-1 text-sm text-tanne underline">
            {link.text}
          </a>
        )}
      </div>
      {offen && hatAbschnitte && (
        <div className="mt-1 ml-6 rounded-[var(--radius-knopf)] bg-papier p-3">
          <VerbindungDetail titel={`${lokaleUhrzeit(f.ab)} → ${lokaleUhrzeit(f.an)}`} v={f} link={link} />
        </div>
      )}
    </li>
  )
}
