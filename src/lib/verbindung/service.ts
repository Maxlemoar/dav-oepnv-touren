import type { Startort, Haltestelle, TicketTabelle, Richtwert } from '@/lib/content/schema'
import { lokaleMinuten, lokalesDatum, lokaleUhrzeit, tageDifferenz, zuUtcIso } from '@/lib/datum'
import { bedientAm, tagesklasse } from '@/lib/saison'
import { planen as planenStandard, dienstNichtErreichbar, type Itinerary, type PlanParameter } from './transitous'
import { waehleHinfahrt, waehleRueckfahrt, kurzfassung, hatFernverkehr, HINFAHRT_FENSTER, RUECKFAHRT_ANKUNFT_BIS, type VerbindungKurz } from './auswerten'
import { gueltigesFenster, tageszielAusFenster, ticketFuer, tourenfensterMin, type TageszielUrteil, type TicketHinweis } from './regeln'
import { ladeFahrplan, nachLiveBis, type Fahrplan } from './fahrplan'

/**
 * Warum es keine (vollständige) Live-Verbindung gibt:
 * - datum_vergangen: Datum liegt vor heute, es wurde nichts abgefragt.
 * - fahrplan_noch_nicht_verfuegbar: Datum nach `liveBis`, Transitous kennt den Fahrplan noch nicht; Richtwert und `hinweis`.
 * - keine_verbindung: Am Datum keine Hinfahrt im Zeitfenster (live) oder die Haltestelle wird nicht bedient.
 * - dienst_nicht_erreichbar: Transitous überlastet, Serverfehler oder Netzfehler.
 */
export type FehlerArt = 'datum_vergangen' | 'fahrplan_noch_nicht_verfuegbar' | 'keine_verbindung' | 'dienst_nicht_erreichbar'

export type VerbindungAntwort = {
  quelle: 'live' | 'richtwert'
  datum: string
  rueckfahrtDatum: string
  /** Tage zwischen Hin- und Rückfahrt; 0 bei Tagestour. */
  naechte: number
  hinfahrt?: VerbindungKurz
  hinfahrtSpaeter?: VerbindungKurz
  rueckfahrt?: VerbindungKurz
  tourenfensterMin?: number
  tagesziel?: boolean
  /** Begründung, wenn tagesziel false ist, z. B. "Ankunft erst 10:40". */
  tageszielGrund?: string
  ticket: TicketHinweis
  richtwert?: Richtwert
  fehlerArt?: FehlerArt
  /** Erklärung für die Oberfläche, etwa zum Fahrplan nach liveBis oder zum Saisonbetrieb. */
  hinweis?: string
  /** Technische Fehlermeldung von Transitous. */
  fehler?: string
}

export type VerbindungAnfrage = {
  startort: Startort
  haltestelle: Haltestelle
  datum: string
  /** Nie vor datum; die Routen prüfen das. */
  rueckfahrtDatum: string
  mindestFensterMin: number
  tickets: TicketTabelle
  /** Heutiges Datum in Europe/Berlin; davor liegende Daten werden nicht abgefragt. Standard: jetzt. */
  heute?: string
  /** Fahrplangrenze; Standard: content/fahrplan.yaml. */
  fahrplan?: Fahrplan
}

type Abhaengigkeiten = { planen: (p: PlanParameter) => Promise<Itinerary[]> }

export const SAISON_HINWEIS = 'Am Datum keine Busverbindung (Saisonbetrieb)'
const VERGANGEN_HINWEIS = 'Das Datum liegt in der Vergangenheit.'

function fehlermeldung(r: PromiseSettledResult<unknown>): string | undefined {
  return r.status === 'rejected' ? (r.reason as Error).message : undefined
}

/** Urteil als Antwortfelder, ohne leere Schlüssel. */
function urteilFelder(u: TageszielUrteil): Pick<VerbindungAntwort, 'tagesziel' | 'tageszielGrund'> {
  return { ...(u.tagesziel !== undefined && { tagesziel: u.tagesziel }), ...(u.grund && { tageszielGrund: u.grund }) }
}

/** Antwort ohne Live-Verbindung: Richtwert, Ticket aus dem Richtwert und Urteil aus dem typischen Tagesfenster. */
function ohneLive(
  a: VerbindungAnfrage,
  zusatz: { fehlerArt?: FehlerArt; hinweis?: string; fehler?: string; urteil?: TageszielUrteil },
): VerbindungAntwort {
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  const land = a.haltestelle.land
  const naechte = tageDifferenz(a.datum, a.rueckfahrtDatum)
  // Ticket aus dem Richtwert, Hinweistext aus der Tabelle; ohne Richtwert nur die Tabelle.
  const ticket = richtwert
    ? { ticket: richtwert.ticket, hinweis: ticketFuer(land, richtwert.ticket === 'keins' && land === 'DE', a.tickets).hinweis }
    : ticketFuer(land, false, a.tickets)
  const urteil = naechte > 0 ? {} : zusatz.urteil ?? tageszielAusFenster(gueltigesFenster(a.haltestelle, richtwert?.tagesfenster?.[tagesklasse(a.datum)]), a.mindestFensterMin)
  return {
    quelle: 'richtwert', datum: a.datum, rueckfahrtDatum: a.rueckfahrtDatum, naechte, ticket,
    ...(richtwert && { richtwert }),
    ...urteilFelder(urteil),
    ...(zusatz.fehlerArt && { fehlerArt: zusatz.fehlerArt }),
    ...(zusatz.hinweis && { hinweis: zusatz.hinweis }),
    ...(zusatz.fehler && { fehler: zusatz.fehler }),
  }
}

export async function verbindungErmitteln(
  a: VerbindungAnfrage,
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<VerbindungAntwort> {
  const { datum, rueckfahrtDatum } = a
  const gleicherTag = rueckfahrtDatum === datum
  const bedient = bedientAm(a.haltestelle, datum)
  const saisonHinweis = a.haltestelle.bedientHinweis ?? SAISON_HINWEIS
  const heute = a.heute ?? lokalesDatum(new Date())
  const fahrplan = a.fahrplan ?? ladeFahrplan()

  if (datum < heute) return ohneLive(a, { fehlerArt: 'datum_vergangen', hinweis: VERGANGEN_HINWEIS })
  if (nachLiveBis(datum, fahrplan) || nachLiveBis(rueckfahrtDatum, fahrplan)) {
    // Ohne Bus am Datum hilft auch der Richtwert nicht; sonst typische Zeiten mit Hinweis auf den Fahrplan.
    if (!bedient) return ohneLive(a, { fehlerArt: 'keine_verbindung', hinweis: saisonHinweis, urteil: { tagesziel: false, grund: SAISON_HINWEIS } })
    return ohneLive(a, { fehlerArt: 'fahrplan_noch_nicht_verfuegbar', hinweis: fahrplan.hinweis })
  }

  const start = { lat: a.startort.lat, lon: a.startort.lon }
  const ziel = { lat: a.haltestelle.lat, lon: a.haltestelle.lon }
  const [hinErgebnis, rueckErgebnis] = await Promise.allSettled([
    deps.planen({ von: a.startort.haltestelleId, nach: a.haltestelle.haltestelleId, vonKoord: start, nachKoord: ziel, zeit: zuUtcIso(datum, HINFAHRT_FENSTER.fruehVon), ankunftBis: false, anzahl: 12 }),
    deps.planen({ von: a.haltestelle.haltestelleId, nach: a.startort.haltestelleId, vonKoord: ziel, nachKoord: start, zeit: zuUtcIso(rueckfahrtDatum, RUECKFAHRT_ANKUNFT_BIS), ankunftBis: true, anzahl: 6 }),
  ])
  const fehler = [fehlermeldung(hinErgebnis), fehlermeldung(rueckErgebnis)].filter(Boolean).join('; ') || undefined
  const hinDienstFehler = hinErgebnis.status === 'rejected' && dienstNichtErreichbar(hinErgebnis.reason)

  if (hinErgebnis.status === 'rejected' && rueckErgebnis.status === 'rejected') {
    return ohneLive(a, { fehlerArt: hinDienstFehler ? 'dienst_nicht_erreichbar' : undefined, fehler })
  }

  const land = a.haltestelle.land
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  // In Deutschland zählt das Deutschlandticket: Nahverkehr vorziehen, wenn er nicht viel später ankommt.
  const alleHin = hinErgebnis.status === 'fulfilled' ? hinErgebnis.value : []
  let { hinfahrt, hinfahrtSpaeter } = waehleHinfahrt(alleHin, { nahverkehrBevorzugen: land === 'DE' })
  // Fährt zwischen 5 und 8 Uhr nichts, gilt die nächste Abfahrt bis 9 Uhr, sonst die früheste Ankunft bei Abfahrt
  // bis 14 Uhr. Für Hüttentouren reicht das, für Tagestouren erklärt das Urteil dann die späte Ankunft.
  if (!hinfahrt && hinfahrtSpaeter) { hinfahrt = hinfahrtSpaeter; hinfahrtSpaeter = undefined }
  hinfahrt ??= spaetereHinfahrt(alleHin)
  const rueckfahrt = rueckErgebnis.status === 'fulfilled' ? waehleRueckfahrt(rueckErgebnis.value, rueckfahrtDatum) : undefined
  const keineVerbindung = hinErgebnis.status === 'fulfilled' && !hinfahrt
  const fehlerArt: FehlerArt | undefined = hinDienstFehler ? 'dienst_nicht_erreichbar' : keineVerbindung ? 'keine_verbindung' : undefined
  const antwort: VerbindungAntwort = {
    quelle: 'live',
    datum, rueckfahrtDatum, naechte: tageDifferenz(datum, rueckfahrtDatum),
    hinfahrt: hinfahrt && kurzfassung(hinfahrt),
    hinfahrtSpaeter: hinfahrtSpaeter && kurzfassung(hinfahrtSpaeter),
    rueckfahrt: rueckfahrt && kurzfassung(rueckfahrt),
    ticket: ticketFuer(land, hinfahrt ? hatFernverkehr(hinfahrt) : false, a.tickets),
    ...(richtwert && { richtwert }),
    ...(fehlerArt && { fehlerArt }),
    ...(keineVerbindung && !bedient && { hinweis: saisonHinweis }),
    ...(fehler && { fehler }),
  }

  // Tourenfenster und Tagesziel-Urteil gibt es nur, wenn Hin- und Rückfahrt am selben Tag liegen.
  if (gleicherTag && hinfahrt && rueckfahrt) {
    antwort.tourenfensterMin = tourenfensterMin(hinfahrt.endTime, rueckfahrt.startTime)
    const fenster = { ankunft: lokaleUhrzeit(hinfahrt.endTime), letzteRueckfahrt: lokaleUhrzeit(rueckfahrt.startTime) }
    Object.assign(antwort, urteilFelder(tageszielAusFenster(fenster, a.mindestFensterMin)))
  } else if (gleicherTag && keineVerbindung) {
    Object.assign(antwort, urteilFelder({ tagesziel: false, grund: bedient ? 'Keine Hinfahrt zwischen 5 und 9 Uhr' : SAISON_HINWEIS }))
  }
  return antwort
}

/** Früheste Ankunft unter den Verbindungen mit Abfahrt zwischen 5 und 14 Uhr (Ortszeit). */
function spaetereHinfahrt(its: Itinerary[]): Itinerary | undefined {
  return its
    .filter((i) => { const m = lokaleMinuten(i.startTime); return m >= 5 * 60 && m < 14 * 60 })
    .sort((x, y) => Date.parse(x.endTime) - Date.parse(y.endTime))[0]
}
