// Bewusst ohne zod und ohne Laufzeit-Importe aus der Verbindungslogik: läuft im Browser.
import type { VerbindungAntwort } from '@/lib/verbindung/service'

/**
 * Sektionstouren haben keine Zeitfenster-Wahl. Sie fragen deshalb mit "los ab 5:00" und "zurück bis 23:00" an, wie vor dem
 * Zeitfenster; nur wenn die Seiten-URL `ab` oder `bis` trägt, gelten diese.
 */
export const SEKTIONSTOUR_FENSTER = { ab: '05:00', bis: '23:00' } as const

/** Query für /api/verbindung einer Sektionstour. */
export function sektionstourAnfrage(von: string, nach: string, datum: string, rueck: string, seite: URLSearchParams): string {
  const q = new URLSearchParams({ von, nach, datum, rueck })
  q.set('ab', seite.get('ab') ?? SEKTIONSTOUR_FENSTER.ab)
  q.set('bis', seite.get('bis') ?? SEKTIONSTOUR_FENSTER.bis)
  const vorort = seite.get('vorort')
  if (vorort !== null) q.set('vorort', vorort)
  return q.toString()
}

/**
 * Machbar heißt: die Passung sagt "passt" (wird die Haltestelle am Datum nicht bedient, nie). Ohne Passung: live Hin- und
 * Rückfahrt gefunden, oder der Fahrplan für das Datum ist noch nicht veröffentlicht und der Richtwert zeigt eine typische
 * Verbindung.
 */
export function machbar(a: VerbindungAntwort | undefined): boolean {
  if (!a) return false
  if (a.passung) return a.passung.passt
  if (a.quelle === 'live') return Boolean(a.hinfahrt && a.rueckfahrt)
  return a.fehlerArt === 'fahrplan_noch_nicht_verfuegbar' && Boolean(a.richtwert)
}
