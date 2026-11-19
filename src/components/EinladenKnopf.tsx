'use client'
import { useState } from 'react'
import { einladungsText, einladungsUrl, type Einladung } from '@/lib/teilen'

type Props = { einladung: Omit<Einladung, 'url'> & { rueckDatum: string } }

/**
 * "Mitfahrende einladen": teilt per Web Share API (Handy) oder kopiert den Text in die Zwischenablage.
 * Klappt beides nicht, steht der Text zum Markieren da.
 */
export function EinladenKnopf({ einladung }: Props) {
  const [status, setStatus] = useState<{ art: 'kopiert' | 'manuell'; text: string } | null>(null)

  async function einladen() {
    const url = einladungsUrl(window.location.origin, window.location.pathname, einladung.datum, einladung.rueckDatum)
    const text = einladungsText({ ...einladung, url })
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ art: 'kopiert', text })
    } catch {
      setStatus({ art: 'manuell', text })
    }
  }

  return (
    <>
      <button type="button" onClick={einladen} className="min-h-11 text-sm text-tanne underline">Mitfahrende einladen</button>
      <span aria-live="polite" className="basis-full text-sm text-tinte-2 empty:hidden">
        {status?.art === 'kopiert' && 'Einladung kopiert, jetzt im Messenger einfügen.'}
        {status?.art === 'manuell' && (
          <>Zum Kopieren markieren:<span className="mt-1 block select-all whitespace-pre-line rounded-[var(--radius-knopf)] bg-papier p-2 text-tinte">{status.text}</span></>
        )}
      </span>
    </>
  )
}
