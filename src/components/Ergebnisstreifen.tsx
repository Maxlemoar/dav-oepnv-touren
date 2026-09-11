'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { GebietEintrag } from '@/lib/filter'
import { ReisezeitBadge } from './Badges'

/** Höhe des Streifens in Pixeln, damit die Karte ihre Punkte darüber hält. */
export const STREIFEN_PX = 128

type Props = {
  gebiete: GebietEintrag[]
  /** Meldet das Gebiet, das nach dem Wischen in der Mitte steht; die Karte fliegt dorthin. */
  onFokus: (id: string) => void
}

/**
 * Ergebnisse über der Karte: waagerecht wischbare Karten mit Einrasten. Ohne sie zeigt die
 * Kartenansicht auf dem Handy keine lesbaren Ziele. Ab lg steht daneben die Liste, dort entfällt er.
 */
export function Ergebnisstreifen({ gebiete, onFokus }: Props) {
  const spur = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current) }, [])

  function beiScroll() {
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const el = spur.current
      if (!el) return
      const mitte = el.scrollLeft + el.clientWidth / 2
      let beste: { id: string; abstand: number } | undefined
      for (const kind of Array.from(el.children) as HTMLElement[]) {
        const id = kind.dataset.gebiet
        if (!id) continue
        const abstand = Math.abs(kind.offsetLeft + kind.offsetWidth / 2 - mitte)
        if (!beste || abstand < beste.abstand) beste = { id, abstand }
      }
      if (beste) onFokus(beste.id)
    })
  }

  if (gebiete.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 lg:hidden">
      <div ref={spur} onScroll={beiScroll} aria-label="Ziele auf der Karte"
        className="pointer-events-auto flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-7 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {gebiete.map((g) => (
          <Link key={g.id} href={`/gebiet/${g.id}`} data-gebiet={g.id}
            className="w-[78vw] max-w-xs shrink-0 snap-center rounded-[var(--radius-karte)] bg-karte p-3 no-underline shadow-md">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-base font-semibold leading-snug">{g.name}</h3>
              <span className="shrink-0">
                {g.fahrzeitMin !== undefined ? <ReisezeitBadge fahrzeitMin={g.fahrzeitMin} ca /> : <span className="badge bg-nebel">offen</span>}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-tinte-3">
              <span>{g.region}</span>
              {g.anzahlHuetten > 0 && <span>· {g.anzahlHuetten} {g.anzahlHuetten === 1 ? 'Hütte' : 'Hütten'}</span>}
              {g.anzahlTouren > 0 && <span>· {g.anzahlTouren} {g.anzahlTouren === 1 ? 'Tour' : 'Touren'}</span>}
              {g.sektionshaus && <span className="font-medium text-tanne">· Haus der Sektion</span>}
            </div>
            <p className="mt-1 truncate text-sm text-tinte-2">{g.beschreibung}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
