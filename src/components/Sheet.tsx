'use client'
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'

type Props = {
  offen: boolean
  titel: string
  onClose: () => void
  children: ReactNode
  /** Weitere Knöpfe links neben "Fertig", z. B. "Zurücksetzen". */
  aktionen?: ReactNode
}

/**
 * Natives <dialog> als Sheet: auf dem Handy von unten mit Griff-Linie, ab sm zentriert.
 * Esc (nativ) und Klick auf den Backdrop schließen; solange es offen ist, scrollt die Seite dahinter nicht.
 * Der Fokus geht beim Öffnen auf das erste Bedienelement im Inhalt.
 */
export function Sheet({ offen, titel, onClose, children, aktionen }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titelId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d || !offen) return
    if (!d.open) d.showModal()
    d.querySelector<HTMLElement>('[data-inhalt] :is(button, input, select, summary, a[href]):not([disabled])')?.focus()
    const vorher = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = vorher
      if (d.open) d.close()
    }
  }, [offen])

  // Ein Klick auf den Backdrop trifft das dialog-Element selbst; alles Innere liegt im Wrapper darunter.
  function klick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <dialog ref={ref} onClick={klick} onClose={onClose} aria-labelledby={titelId}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none flex-col overflow-hidden rounded-t-2xl bg-papier p-0 text-tinte shadow-xl backdrop:bg-tinte/50 open:flex sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-2xl">
      <div className="flex max-h-[85dvh] flex-col">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-linie sm:hidden" aria-hidden />
        <h2 id={titelId} className="shrink-0 px-4 pt-3 pb-2 text-lg font-semibold">{titel}</h2>
        <div data-inhalt className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        <div className="flex shrink-0 gap-2 border-t border-linie p-4">
          {aktionen}
          <button type="button" onClick={onClose} className="knopf flex-1">Fertig</button>
        </div>
      </div>
    </dialog>
  )
}
