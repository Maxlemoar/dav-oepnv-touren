'use client'
import { usePathname } from 'next/navigation'
import { FehlerMelden } from './FehlerMelden'

/** "Fehler melden" für jede Seite; als Titel dient der Pfad, z. B. "Seite /gebiet/kandersteg". */
export function FehlerMeldenFooter() {
  const pfad = usePathname()
  return <FehlerMelden titel={`Seite ${pfad}`} />
}
