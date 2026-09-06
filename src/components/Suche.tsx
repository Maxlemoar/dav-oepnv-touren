'use client'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export type SuchEintrag = { id: string; name: string; typ: 'gebiet' | 'huette'; meta: string }

const VERZOEGERUNG_MS = 250

export function Suche({ eintraege, wert, onChange }: { eintraege: SuchEintrag[]; wert: string; onChange: (v: string) => void }) {
  const router = useRouter()
  const listeId = useId()
  const [text, setText] = useState(wert)
  const [gesendet, setGesendet] = useState(wert)
  const [vorherWert, setVorherWert] = useState(wert)
  const [offen, setOffen] = useState(false)
  const [aktiv, setAktiv] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ändert sich der Wert von außen (Zurück-Taste, Link), übernehmen; die eigene,
  // gerade erst gesendete Eingabe dabei nicht überschreiben.
  if (wert !== vorherWert) {
    setVorherWert(wert)
    if (wert !== gesendet) {
      setGesendet(wert)
      setText(wert)
    }
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function sende(v: string) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setGesendet(v)
    onChange(v)
  }

  function eingabe(v: string) {
    setText(v)
    setAktiv(-1)
    setOffen(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => sende(v), VERZOEGERUNG_MS)
  }

  const q = text.trim().toLowerCase()
  const treffer = q ? eintraege.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8) : []
  const listeSichtbar = offen && treffer.length > 0
  const optionId = (n: number) => `${listeId}-${n}`

  function taste(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOffen(true)
      setAktiv((a) => Math.min(a + 1, treffer.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAktiv((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter') {
      const t = listeSichtbar ? treffer[aktiv] : undefined
      if (t) {
        e.preventDefault()
        setOffen(false)
        router.push(`/${t.typ}/${t.id}`)
      } else {
        sende(text)
      }
    } else if (e.key === 'Escape') {
      setOffen(false)
      setAktiv(-1)
    }
  }

  function verlassen(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOffen(false)
  }

  return (
    <div className="relative" onFocus={() => setOffen(true)} onBlur={verlassen}>
      <input type="search" value={text} onChange={(e) => eingabe(e.target.value)} onKeyDown={taste}
        placeholder="Wohin willst du? Hütte oder Gebiet" aria-label="Ziel suchen" autoComplete="off"
        role="combobox" aria-expanded={listeSichtbar} aria-controls={listeId} aria-autocomplete="list"
        aria-activedescendant={listeSichtbar && aktiv >= 0 ? optionId(aktiv) : undefined}
        className="min-h-12 w-full rounded-[var(--radius-karte)] border border-linie bg-karte px-4 text-base shadow-[var(--shadow-karte)]" />
      {listeSichtbar && (
        <ul id={listeId} role="listbox" aria-label="Treffer"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-karte shadow-md">
          {treffer.map((t, n) => (
            <li key={`${t.typ}-${t.id}`} role="none">
              <Link href={`/${t.typ}/${t.id}`} id={optionId(n)} role="option" aria-selected={n === aktiv}
                onMouseEnter={() => setAktiv(n)}
                className={`flex min-h-11 items-center justify-between px-4 no-underline hover:bg-papier ${n === aktiv ? 'bg-papier' : ''}`}>
                <span>{t.name}</span><span className="text-sm text-tinte-3">{t.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
