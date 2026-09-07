import { tageAddieren } from '@/lib/datum'

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
