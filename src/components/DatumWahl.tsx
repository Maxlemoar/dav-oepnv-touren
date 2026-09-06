'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { folgetag, naechsterSamstag } from '@/lib/datum'

export function DatumWahl() {
  const sp = useSearchParams()
  const router = useRouter()
  const pfad = usePathname()
  const samstag = naechsterSamstag()
  const sonntag = folgetag(samstag)
  const datum = sp.get('datum') ?? samstag
  const fenster = Number(sp.get('fenster') ?? 360)

  function setze(k: string, v: string, standard: string) {
    const neu = new URLSearchParams(sp)
    if (v === standard) neu.delete(k); else neu.set(k, v)
    router.replace(`${pfad}?${neu.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-sm">
        <span className="sr-only">Datum</span>
        <input type="date" value={datum} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setze('datum', e.target.value, samstag)}
          className="rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base" />
      </label>
      <button type="button" className={`chip ${datum === samstag ? 'chip-aktiv' : ''}`} onClick={() => setze('datum', samstag, samstag)}>Sa</button>
      <button type="button" className={`chip ${datum === sonntag ? 'chip-aktiv' : ''}`} onClick={() => setze('datum', sonntag, samstag)}>So</button>
      <label className="ml-auto flex items-center gap-2 text-sm text-tinte-2">
        Mindestens am Berg
        <select value={fenster} onChange={(e) => setze('fenster', e.target.value, '360')} className="min-h-11 rounded-[var(--radius-knopf)] border border-linie bg-karte px-2 text-base text-tinte">
          {[180, 240, 300, 360, 420, 480].map((m) => <option key={m} value={m}>{m / 60} h</option>)}
        </select>
      </label>
    </div>
  )
}
