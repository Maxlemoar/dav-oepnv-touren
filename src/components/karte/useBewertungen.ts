'use client'
import { useEffect, useMemo, useState } from 'react'
import type { AusgangsortDatei } from '@/lib/ausgangsorte'
import { bewerteAlle, type Bewertung } from '@/lib/bewertung'
import type { Ausgangsort, Linie, Tagesplan } from '@/lib/musterfahrplan/typen'
import { tagesklasse, type Tagesklasse } from '@/lib/saison'
import type { Zeitfenster } from '@/lib/zeitfenster'

export type Bewertungen = {
  orte: Ausgangsort[]
  strecken: Record<string, Linie[]>
  liveBis?: string
  /** Schlüssel: Gebiets-id. `null` ohne gewähltes Datum, beim Laden und nach einem Ladefehler. */
  bewertungen: Record<string, Bewertung> | null
  laedt: boolean
}

const AUSGANGSORTE = '/ausgangsorte.json'
const tagesplanPfad = (k: Tagesklasse) => `/tagesplaene/${k}.json`

/** Eine Anfrage je Datei und Sitzung; schlägt sie fehl, fliegt sie aus dem Cache, damit ein späterer Aufruf es neu versucht. */
const anfragen = new Map<string, Promise<unknown>>()
function lade(pfad: string): Promise<unknown> {
  let p = anfragen.get(pfad)
  if (!p) {
    p = fetch(pfad).then((r) => {
      if (!r.ok) throw new Error(`${pfad}: HTTP ${r.status}`)
      return r.json() as Promise<unknown>
    })
    p.catch(() => anfragen.delete(pfad))
    anfragen.set(pfad, p)
  }
  return p
}

function ohne(f: Record<string, true>, pfad: string): Record<string, true> {
  if (!(pfad in f)) return f
  const neu = { ...f }
  delete neu[pfad]
  return neu
}

const KEINE_ORTE: Ausgangsort[] = []
const KEINE_STRECKEN: Record<string, Linie[]> = {}

/**
 * Lädt Ausgangsorte und die nötigen Tagespläne (Klasse von `datum` und `rueck`) und bewertet alle Orte im Browser.
 * Tagespläne werden erst mit gewähltem Datum geladen. Wirft nie: bei einem Ladefehler bleiben Orte und Bewertungen leer.
 */
export function useBewertungen(z: Zeitfenster & { gewaehlt: boolean }): Bewertungen {
  const { datum, rueck, abMin, bisMin, vorOrtMin, gewaehlt } = z
  const klassen = useMemo(() => [...new Set([tagesklasse(datum), tagesklasse(rueck)])], [datum, rueck])
  const pfade = useMemo(() => [AUSGANGSORTE, ...(gewaehlt ? klassen.map(tagesplanPfad) : [])], [gewaehlt, klassen])
  const [geladen, setGeladen] = useState<Record<string, unknown>>({})
  const [fehler, setFehler] = useState<Record<string, true>>({})

  useEffect(() => {
    let aktiv = true
    for (const pfad of pfade) {
      lade(pfad).then(
        (d) => {
          if (!aktiv) return
          setGeladen((g) => (pfad in g ? g : { ...g, [pfad]: d }))
          setFehler((f) => ohne(f, pfad)) // ein erneuter Versuch nach einem Fehler war erfolgreich
        },
        () => { if (aktiv) setFehler((f) => (pfad in f ? f : { ...f, [pfad]: true })) },
      )
    }
    return () => { aktiv = false }
  }, [pfade])

  const hatFehler = pfade.some((p) => fehler[p])
  const fertig = !hatFehler && pfade.every((p) => p in geladen)
  const datei = hatFehler ? undefined : (geladen[AUSGANGSORTE] as AusgangsortDatei | undefined)

  const bewertungen = useMemo(() => {
    if (!gewaehlt || !fertig || !datei) return null
    const plaene: Partial<Record<Tagesklasse, Record<string, Tagesplan>>> = {}
    for (const k of klassen) plaene[k] = geladen[tagesplanPfad(k)] as Record<string, Tagesplan>
    return bewerteAlle(datei.orte, plaene, { datum, rueck, abMin, bisMin, vorOrtMin })
  }, [gewaehlt, fertig, datei, klassen, geladen, datum, rueck, abMin, bisMin, vorOrtMin])

  return {
    orte: datei?.orte ?? KEINE_ORTE,
    strecken: datei?.strecken ?? KEINE_STRECKEN,
    liveBis: datei?.liveBis,
    bewertungen,
    laedt: !hatFehler && !fertig,
  }
}
