import { tageAddieren } from '@/lib/datum'
import { ZEITFENSTER_PARAMETER } from '@/lib/zeitfenster'

export type ZeitraumVorschlag = { label: string; datum: string; rueck: string }

/** Chips für das kommende Wochenende: Sa, So, Wochenende (Sa→So), Fr–So. */
export function zeitraumVorschlaege(samstag: string): ZeitraumVorschlag[] {
  const freitag = tageAddieren(samstag, -1)
  const sonntag = tageAddieren(samstag, 1)
  return [
    { label: 'Sa', datum: samstag, rueck: samstag },
    { label: 'So', datum: sonntag, rueck: sonntag },
    { label: 'Wochenende', datum: samstag, rueck: sonntag },
    { label: 'Fr–So', datum: freitag, rueck: sonntag },
  ]
}

/** Rückfahrt frühestens `mindestNaechte` Tage nach der Hinfahrt; fehlt sie oder liegt sie davor, wird sie angehoben. */
export function rueckAnheben(datum: string, rueck: string | undefined, mindestNaechte = 0): string {
  const fruehestens = tageAddieren(datum, mindestNaechte)
  return rueck && rueck > fruehestens ? rueck : fruehestens
}

export function naechteText(n: number): string {
  return `${n} ${n === 1 ? 'Nacht' : 'Nächte'}`
}

/**
 * "?datum=…&rueck=…&ab=…&bis=…&vorort=…" mit den gesetzten Zeitfenster-Parametern (`ZEITFENSTER_PARAMETER`), sonst "".
 * Das alte `fenster` wandert nicht mehr mit.
 * Mit `datumStandard` (dem auf der Seite verwendeten Hin-Datum) wird datum ausdrücklich ergänzt, wenn nur rueck
 * gesetzt ist; sonst bekäme die Zielseite ein anderes Hin-Datum, sobald sich der kommende Samstag verschiebt.
 */
export function zeitraumQuery(sp: URLSearchParams, datumStandard?: string): string {
  const neu = new URLSearchParams()
  for (const k of ZEITFENSTER_PARAMETER) {
    const v = sp.get(k) || (k === 'datum' && sp.get('rueck') ? datumStandard : undefined)
    if (v) neu.set(k, v)
  }
  const q = neu.toString()
  return q ? `?${q}` : ''
}

export function mitZeitraum(pfad: string, query: string): string {
  return `${pfad}${query}`
}
