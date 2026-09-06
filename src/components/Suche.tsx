'use client'
import { useState } from 'react'
import Link from 'next/link'

export type SuchEintrag = { id: string; name: string; typ: 'gebiet' | 'huette'; meta: string }

export function Suche({ eintraege, wert, onChange }: { eintraege: SuchEintrag[]; wert: string; onChange: (v: string) => void }) {
  const [fokus, setFokus] = useState(false)
  const q = wert.trim().toLowerCase()
  const treffer = q ? eintraege.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8) : []
  return (
    <div className="relative">
      <input type="search" value={wert} onChange={(e) => onChange(e.target.value)} onFocus={() => setFokus(true)} onBlur={() => setTimeout(() => setFokus(false), 150)}
        placeholder="Wohin willst du? Hütte oder Gebiet" aria-label="Ziel suchen" autoComplete="off"
        className="min-h-12 w-full rounded-[var(--radius-karte)] border border-linie bg-karte px-4 text-base shadow-[var(--shadow-karte)]" />
      {fokus && treffer.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-karte shadow-md">
          {treffer.map((t) => (
            <li key={`${t.typ}-${t.id}`}>
              <Link href={`/${t.typ}/${t.id}`} className="flex min-h-11 items-center justify-between px-4 no-underline hover:bg-papier">
                <span>{t.name}</span><span className="text-sm text-tinte-3">{t.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
