import type { Startort, Haltestelle, TicketTabelle, Richtwert } from '@/lib/content/schema'
import { folgetag, lokaleMinuten, zuUtcIso } from '@/lib/datum'
import { planen as planenStandard, type Itinerary, type PlanParameter } from './transitous'
import { waehleHinfahrt, waehleRueckfahrt, kurzfassung, hatFernverkehr, HINFAHRT_FENSTER, RUECKFAHRT_ANKUNFT_BIS, type VerbindungKurz } from './auswerten'
import { istTagesziel, ticketFuer, tourenfensterMin, type TicketHinweis } from './regeln'

export type Rueckfahrtart = 'gleicher-tag' | 'folgetag'

export type VerbindungAntwort = {
  quelle: 'live' | 'richtwert'
  datum: string
  rueckfahrtDatum: string
  hinfahrt?: VerbindungKurz
  hinfahrtSpaeter?: VerbindungKurz
  rueckfahrt?: VerbindungKurz
  tourenfensterMin?: number
  tagesziel?: boolean
  ticket: TicketHinweis
  richtwert?: Richtwert
  fehler?: string
}

export type VerbindungAnfrage = {
  startort: Startort
  haltestelle: Haltestelle
  datum: string
  rueckfahrt: Rueckfahrtart
  mindestFensterMin: number
  tickets: TicketTabelle
}

type Abhaengigkeiten = { planen: (p: PlanParameter) => Promise<Itinerary[]> }

function fehlermeldung(r: PromiseSettledResult<unknown>): string | undefined {
  return r.status === 'rejected' ? (r.reason as Error).message : undefined
}

export async function verbindungErmitteln(
  a: VerbindungAnfrage,
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<VerbindungAntwort> {
  const rueckfahrtDatum = a.rueckfahrt === 'folgetag' ? folgetag(a.datum) : a.datum
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  const land = a.haltestelle.land
  const basis = { datum: a.datum, rueckfahrtDatum, richtwert }

  const [hinErgebnis, rueckErgebnis] = await Promise.allSettled([
    deps.planen({ von: a.startort.haltestelleId, nach: a.haltestelle.haltestelleId, zeit: zuUtcIso(a.datum, HINFAHRT_FENSTER.fruehVon), ankunftBis: false, anzahl: 12 }),
    deps.planen({ von: a.haltestelle.haltestelleId, nach: a.startort.haltestelleId, zeit: zuUtcIso(rueckfahrtDatum, RUECKFAHRT_ANKUNFT_BIS), ankunftBis: true, anzahl: 6 }),
  ])
  const fehler = [fehlermeldung(hinErgebnis), fehlermeldung(rueckErgebnis)].filter(Boolean).join('; ') || undefined

  if (hinErgebnis.status === 'rejected' && rueckErgebnis.status === 'rejected') {
    // Ticket aus dem Richtwert, Hinweistext aus der Tabelle; ohne Richtwert nur die Tabelle.
    const ticket = richtwert
      ? { ticket: richtwert.ticket, hinweis: ticketFuer(land, richtwert.ticket === 'keins' && land === 'DE', a.tickets).hinweis }
      : ticketFuer(land, false, a.tickets)
    return { ...basis, quelle: 'richtwert', ticket, fehler }
  }

  // In Deutschland zählt das Deutschlandticket: Nahverkehr vorziehen, wenn er nicht viel später ankommt.
  const { hinfahrt, hinfahrtSpaeter } = waehleHinfahrt(hinErgebnis.status === 'fulfilled' ? hinErgebnis.value : [], { nahverkehrBevorzugen: land === 'DE' })
  const rueckfahrt = rueckErgebnis.status === 'fulfilled' ? waehleRueckfahrt(rueckErgebnis.value, rueckfahrtDatum) : undefined
  const antwort: VerbindungAntwort = {
    ...basis,
    quelle: 'live',
    hinfahrt: hinfahrt && kurzfassung(hinfahrt),
    hinfahrtSpaeter: hinfahrtSpaeter && kurzfassung(hinfahrtSpaeter),
    rueckfahrt: rueckfahrt && kurzfassung(rueckfahrt),
    ticket: ticketFuer(land, hinfahrt ? hatFernverkehr(hinfahrt) : false, a.tickets),
    fehler,
  }

  if (a.rueckfahrt === 'gleicher-tag' && hinfahrt && rueckfahrt) {
    const fenster = tourenfensterMin(hinfahrt.endTime, rueckfahrt.startTime)
    antwort.tourenfensterMin = fenster
    antwort.tagesziel = istTagesziel(
      { ankunftMin: lokaleMinuten(hinfahrt.endTime), rueckfahrtMin: lokaleMinuten(rueckfahrt.startTime), tourenfensterMin: fenster },
      a.mindestFensterMin,
    )
  }
  return antwort
}
