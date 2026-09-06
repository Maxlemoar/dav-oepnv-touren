import type { Startort, Haltestelle, TicketTabelle, Richtwert } from '@/lib/content/schema'
import { folgetag, lokaleMinuten, zuUtcIso } from '@/lib/datum'
import { planen as planenStandard, type Itinerary, type PlanParameter } from './transitous'
import { waehleHinfahrt, waehleRueckfahrt, kurzfassung, RUECKFAHRT_ANKUNFT_BIS, type VerbindungKurz } from './auswerten'
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

const HINFAHRT_START_UTC = '03:00' // 05:00 CEST bzw. 04:00 CET, Fenster wird lokal gefiltert

export async function verbindungErmitteln(
  a: VerbindungAnfrage,
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<VerbindungAntwort> {
  const rueckfahrtDatum = a.rueckfahrt === 'folgetag' ? folgetag(a.datum) : a.datum
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  const basis = { datum: a.datum, rueckfahrtDatum, richtwert }

  let hinIts: Itinerary[]
  let rueckIts: Itinerary[]
  try {
    ;[hinIts, rueckIts] = await Promise.all([
      deps.planen({ von: a.startort.haltestelleId, nach: a.haltestelle.haltestelleId, zeit: `${a.datum}T${HINFAHRT_START_UTC}:00Z`, ankunftBis: false, anzahl: 10 }),
      deps.planen({ von: a.haltestelle.haltestelleId, nach: a.startort.haltestelleId, zeit: zuUtcIso(rueckfahrtDatum, RUECKFAHRT_ANKUNFT_BIS), ankunftBis: true, anzahl: 6 }),
    ])
  } catch (e) {
    return {
      ...basis,
      quelle: 'richtwert',
      ticket: ticketFuer(a.haltestelle.land, false, a.tickets),
      fehler: (e as Error).message,
    }
  }

  const { hinfahrt, hinfahrtSpaeter } = waehleHinfahrt(hinIts)
  const rueckfahrt = waehleRueckfahrt(rueckIts, rueckfahrtDatum)
  const antwort: VerbindungAntwort = {
    ...basis,
    quelle: 'live',
    hinfahrt: hinfahrt && kurzfassung(hinfahrt),
    hinfahrtSpaeter: hinfahrtSpaeter && kurzfassung(hinfahrtSpaeter),
    rueckfahrt: rueckfahrt && kurzfassung(rueckfahrt),
    ticket: ticketFuer(a.haltestelle.land, hinfahrt ? antwortFernverkehr(hinfahrt) : false, a.tickets),
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

function antwortFernverkehr(it: Itinerary): boolean {
  return kurzfassung(it).fernverkehr
}
