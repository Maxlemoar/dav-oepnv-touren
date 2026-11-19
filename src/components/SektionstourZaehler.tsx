'use client'
import { createContext, useCallback, useContext, useState } from 'react'

type Melden = (tourId: number, machbar: boolean) => void

const ZaehlerKontext = createContext<Melden>(() => {})

/** Verbindungszeilen melden hierher, ob die Tour mit Bahn und Bus machbar ist. */
export function useSektionstourMeldung(): Melden {
  return useContext(ZaehlerKontext)
}

type Props = {
  /** Touren mit Ziel draußen (ohne Kurse und Abende). */
  gesamt: number
  /** Davon mit Gebiet aus unserer Liste; nur diese fragen eine Verbindung ab. */
  zugeordnet: number
  children: React.ReactNode
}

export function SektionstourZaehlerRahmen({ gesamt, zugeordnet, children }: Props) {
  const [stand, setStand] = useState<Record<number, boolean>>({})
  const melde = useCallback<Melden>((id, machbar) => {
    setStand((s) => (s[id] === machbar ? s : { ...s, [id]: machbar }))
  }, [])
  const gemeldet = Object.keys(stand).length
  const machbar = Object.values(stand).filter(Boolean).length
  const offen = Math.max(0, zugeordnet - gemeldet)

  return (
    <ZaehlerKontext.Provider value={melde}>
      <p className="text-sm text-tinte-2" aria-live="polite">
        <span className="zahl text-lg text-tinte">{machbar} von {gesamt}</span> Touren mit Bahn und Bus machbar
        {offen > 0 && <span className="text-tinte-3"> · prüfe noch {offen}</span>}
      </p>
      {children}
    </ZaehlerKontext.Provider>
  )
}
