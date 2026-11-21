'use client'
import { useEffect, useState } from 'react'
import { ruhigerAbruf, type AbrufErgebnis } from '@/lib/ruhiger-abruf'

/**
 * Lädt `anfrage` erst, wenn sie etwa 800 ms gleich bleibt (die erste sofort), und bricht überholte Abrufe ab; siehe
 * `ruhigerAbruf`. `lade` und `fertig` gelten ab dem ersten Render und dürfen nur Stabiles benutzen (Modulfunktionen,
 * setState).
 */
export function useRuhigerAbruf<T>(
  anfrage: string,
  lade: (anfrage: string, signal: AbortSignal) => Promise<T>,
  fertig: (anfrage: string, e: AbrufErgebnis<T>) => void,
) {
  const [abruf] = useState(() => ruhigerAbruf<T>({ lade, fertig }))
  useEffect(() => { abruf.anfrage(anfrage) }, [abruf, anfrage])
  useEffect(() => () => abruf.beenden(), [abruf])
}
