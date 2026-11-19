// Einladungstext "Mitfahrende einladen". Bewusst ohne zod: läuft im Browser.
import type { Land, TicketTabelle } from '@/lib/content/schema'
import { datumKurz, lokaleUhrzeit } from '@/lib/datum'

export type Einladung = {
  startort: string
  /** Haltestelle, an der die Hinfahrt endet. */
  ziel: string
  /** Hütte als eigentliches Ziel, falls es eine Hüttenseite ist. */
  huette?: string
  datum: string
  /** Abfahrt und Ankunft der Hinfahrt als ISO-Zeitpunkte. */
  ab: string
  an: string
  rueckDatum?: string
  /** Abfahrt der Rückfahrt an der Haltestelle als ISO-Zeitpunkt. */
  rueckAb?: string
  gruppenHinweis?: string
  url: string
}

/** Text zum Teilen per Messenger, mit Link am Ende. */
export function einladungsText(e: Einladung): string {
  let satz = `Ich fahre ${datumKurz(e.datum)} um ${lokaleUhrzeit(e.ab)} ab ${e.startort} nach ${e.ziel} (an ${lokaleUhrzeit(e.an)})`
  if (e.huette) satz += ` und weiter zur ${e.huette}`
  if (e.rueckAb) {
    const tag = e.rueckDatum && e.rueckDatum !== e.datum ? ` ${datumKurz(e.rueckDatum)}` : ''
    satz += `, zurück${tag} um ${lokaleUhrzeit(e.rueckAb)}`
  }
  const zeilen = [`${satz}. Kommst du mit?`]
  if (e.gruppenHinweis) zeilen.push(`Zu mehreren: ${e.gruppenHinweis}`)
  zeilen.push(e.url)
  return zeilen.join('\n')
}

/** Link auf die Seite mit festem Datum, damit Eingeladene dieselbe Verbindung sehen. */
export function einladungsUrl(origin: string, pfad: string, datum: string, rueck: string): string {
  const q = new URLSearchParams({ datum })
  if (rueck !== datum) q.set('rueck', rueck)
  return `${origin}${pfad}?${q.toString()}`
}

export type GruppenHinweis = { hinweis: string; quelle?: string }

/** Gruppenhinweis des Landes aus content/tickets.yaml, sonst nichts. */
export function gruppenHinweisFuer(tabelle: TicketTabelle, land: Land): GruppenHinweis | undefined {
  const r = tabelle.regeln.find((x) => x.land === land)
  if (!r?.gruppenHinweis) return undefined
  return { hinweis: r.gruppenHinweis, ...(r.gruppenQuelle && { quelle: r.gruppenQuelle }) }
}
