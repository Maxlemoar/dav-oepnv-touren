import type { Startort, Haltestelle, TicketTabelle, Richtwert } from '@/lib/content/schema'
import { bewerte, NICHT_BEDIENT, passungPaar, type Bewertung } from '@/lib/bewertung'
import { lokaleMinuten, lokalesDatum, lokaleUhrzeit, zuUtcIso } from '@/lib/datum'
import { ladeMusterfahrplan } from '@/lib/musterfahrplan/laden'
import type { Fahrt, Musterfahrplan } from '@/lib/musterfahrplan/typen'
import { bedientAm, tagesklasse } from '@/lib/saison'
import { naechte, type Zeitfenster } from '@/lib/zeitfenster'
import { planen as planenStandard, dienstNichtErreichbar, type Itinerary, type PlanParameter } from './transitous'
import { waehleHinfahrt, waehleRueckfahrt, kurzfassung, hatFernverkehr, type VerbindungKurz } from './auswerten'
import { ticketFuer, type TicketHinweis } from './regeln'
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
  /**
   * Passt die Tour ins Zeitfenster? Live aus der gezeigten Hin- und Rückfahrt, sonst aus dem Musterfahrplan. Fehlt, wenn
   * sich das nicht sagen lässt (Abfrage gescheitert, kein Plan). Wird die Haltestelle am Datum nicht bedient, passt sie nie.
   */
  passung?: Bewertung
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
  /** Hin- und Rückdatum (rueck nie vor datum; die Routen prüfen das), los ab, zurück bis, mindestens vor Ort. */
  z: Zeitfenster
  tickets: TicketTabelle
  /** Heutiges Datum in Europe/Berlin; davor liegende Daten werden nicht abgefragt. Standard: jetzt. */
  heute?: string
  /** Fahrplangrenze; Standard: content/fahrplan.yaml. */
  fahrplan?: Fahrplan
}

type Abhaengigkeiten = {
  planen: (p: PlanParameter) => Promise<Itinerary[]>
  /** Musterfahrplan für die Passung ohne Live-Daten; nur dann und höchstens einmal je Anfrage geladen. */
  muster?: () => Musterfahrplan | undefined
}

export const SAISON_HINWEIS = 'Am Datum keine Busverbindung (Saisonbetrieb)'
const VERGANGEN_HINWEIS = 'Das Datum liegt in der Vergangenheit.'
/** Gibt es zwischen den Hinfahrt-Fenstern nichts, gilt die früheste Ankunft bei Abfahrt bis 14 Uhr. */
const SPAETESTE_HINFAHRT_MIN = 14 * 60

function fehlermeldung(r: PromiseSettledResult<unknown>): string | undefined {
  return r.status === 'rejected' ? (r.reason as Error).message : undefined
}

function bedientBeide(a: VerbindungAnfrage): boolean {
  return bedientAm(a.haltestelle, a.z.datum) && bedientAm(a.haltestelle, a.z.rueck)
}

const nichtBedient = (z: Zeitfenster): Bewertung => ({ passt: false, grund: NICHT_BEDIENT, naechte: naechte(z) })

/**
 * Passung ohne Live-Daten aus dem Musterfahrplan: Hinfahrten aus dem Plan der Tagesklasse von datum, Rückfahrten aus dem
 * von rueck. Ohne Eintrag (oder für einen anderen Startort) keine Passung. Ein leerer Plan einer Saisonhaltestelle stammt
 * vermutlich aus der Nebensaison und sagt über die Hauptsaison nichts; dann lieber keine Passung als eine falsche.
 */
function passungAusMuster(a: VerbindungAnfrage, laden: () => Musterfahrplan | undefined): Bewertung | undefined {
  if (!bedientBeide(a)) return nichtBedient(a.z)
  const m = laden()
  if (!m || m.startortId !== a.startort.id) return undefined
  const plaene = m.orte[a.haltestelle.id]?.plaene
  const hinPlan = plaene?.[tagesklasse(a.z.datum)]
  const rueckPlan = plaene?.[tagesklasse(a.z.rueck)]
  if (!hinPlan || !rueckPlan) return undefined
  if (a.haltestelle.bedient && (hinPlan.hin.length === 0 || rueckPlan.rueck.length === 0)) return undefined
  return bewerte({ bedient: a.haltestelle.bedient }, hinPlan, rueckPlan, a.z)
}

/** Antwort ohne Live-Verbindung: Richtwert, Ticket aus dem Richtwert und (außer für vergangene Daten) Passung aus dem Musterfahrplan. */
function ohneLive(
  a: VerbindungAnfrage,
  laden: () => Musterfahrplan | undefined,
  zusatz: { fehlerArt?: FehlerArt; hinweis?: string; fehler?: string },
): VerbindungAntwort {
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  const land = a.haltestelle.land
  // Ticket aus dem Richtwert, Hinweistext aus der Tabelle; ohne Richtwert nur die Tabelle.
  const ticket = richtwert
    ? { ticket: richtwert.ticket, hinweis: ticketFuer(land, richtwert.ticket === 'keins' && land === 'DE', a.tickets).hinweis }
    : ticketFuer(land, false, a.tickets)
  const passung = zusatz.fehlerArt === 'datum_vergangen' ? undefined : passungAusMuster(a, laden)
  return {
    quelle: 'richtwert', datum: a.z.datum, rueckfahrtDatum: a.z.rueck, naechte: naechte(a.z), ticket,
    ...(richtwert && { richtwert }),
    ...(passung && { passung }),
    ...(zusatz.fehlerArt && { fehlerArt: zusatz.fehlerArt }),
    ...(zusatz.hinweis && { hinweis: zusatz.hinweis }),
    ...(zusatz.fehler && { fehler: zusatz.fehler }),
  }
}

/** Live-Verbindung als Fahrt mit lokalen Uhrzeiten, wie sie passungPaar erwartet. */
function alsFahrt(it: Itinerary): Fahrt {
  return { ab: lokaleUhrzeit(it.startTime), an: lokaleUhrzeit(it.endTime), umstiege: it.transfers, via: [], fern: hatFernverkehr(it) }
}

export async function verbindungErmitteln(
  a: VerbindungAnfrage,
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<VerbindungAntwort> {
  const { z } = a
  const { datum, rueck } = z
  const bedient = bedientBeide(a)
  const saisonHinweis = a.haltestelle.bedientHinweis ?? SAISON_HINWEIS
  const heute = a.heute ?? lokalesDatum(new Date())
  const fahrplan = a.fahrplan ?? ladeFahrplan()
  const laden = deps.muster ?? ladeMusterfahrplan

  if (datum < heute) return ohneLive(a, laden, { fehlerArt: 'datum_vergangen', hinweis: VERGANGEN_HINWEIS })
  if (nachLiveBis(datum, fahrplan) || nachLiveBis(rueck, fahrplan)) {
    // Ohne Bus am Datum hilft auch der Richtwert nicht; sonst typische Zeiten mit Hinweis auf den Fahrplan.
    if (!bedient) return ohneLive(a, laden, { fehlerArt: 'keine_verbindung', hinweis: saisonHinweis })
    return ohneLive(a, laden, { fehlerArt: 'fahrplan_noch_nicht_verfuegbar', hinweis: fahrplan.hinweis })
  }

  const start = { lat: a.startort.lat, lon: a.startort.lon }
  const ziel = { lat: a.haltestelle.lat, lon: a.haltestelle.lon }
  const [hinErgebnis, rueckErgebnis] = await Promise.allSettled([
    deps.planen({ von: a.startort.haltestelleId, nach: a.haltestelle.haltestelleId, vonKoord: start, nachKoord: ziel, zeit: zuUtcIso(datum, z.abMin), ankunftBis: false, anzahl: 12 }),
    deps.planen({ von: a.haltestelle.haltestelleId, nach: a.startort.haltestelleId, vonKoord: ziel, nachKoord: start, zeit: zuUtcIso(rueck, z.bisMin), ankunftBis: true, anzahl: 6 }),
  ])
  const fehler = [fehlermeldung(hinErgebnis), fehlermeldung(rueckErgebnis)].filter(Boolean).join('; ') || undefined
  const hinDienstFehler = hinErgebnis.status === 'rejected' && dienstNichtErreichbar(hinErgebnis.reason)

  if (hinErgebnis.status === 'rejected' && rueckErgebnis.status === 'rejected') {
    return ohneLive(a, laden, { fehlerArt: hinDienstFehler ? 'dienst_nicht_erreichbar' : undefined, fehler })
  }

  const land = a.haltestelle.land
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  // In Deutschland zählt das Deutschlandticket: Nahverkehr vorziehen, wenn er nicht viel später ankommt.
  const alleHin = hinErgebnis.status === 'fulfilled' ? hinErgebnis.value : []
  let { hinfahrt, hinfahrtSpaeter } = waehleHinfahrt(alleHin, { nahverkehrBevorzugen: land === 'DE', abMin: z.abMin })
  // Fährt in den ersten drei Stunden ab "los ab" nichts, gilt die nächste Abfahrt in der vierten Stunde, sonst die
  // früheste Ankunft bei Abfahrt bis 14 Uhr. Für Hüttentouren reicht das, bei Tagestouren erklärt die Passung den Rest.
  if (!hinfahrt && hinfahrtSpaeter) { hinfahrt = hinfahrtSpaeter; hinfahrtSpaeter = undefined }
  hinfahrt ??= spaetereHinfahrt(alleHin, z.abMin)
  const rueckfahrt = rueckErgebnis.status === 'fulfilled' ? waehleRueckfahrt(rueckErgebnis.value, rueck, z.bisMin) : undefined
  const keineVerbindung = hinErgebnis.status === 'fulfilled' && !hinfahrt
  const fehlerArt: FehlerArt | undefined = hinDienstFehler ? 'dienst_nicht_erreichbar' : keineVerbindung ? 'keine_verbindung' : undefined

  // Am Datum nicht bedient: passt nie, auch wenn Transitous etwas findet. Sonst nur mit bekannter Hin- und Rückfahrt-Lage.
  let passung: Bewertung | undefined
  if (!bedient) passung = nichtBedient(z)
  else if (keineVerbindung) passung = passungPaar(undefined, undefined, z)
  else if (hinfahrt && rueckErgebnis.status === 'fulfilled') passung = passungPaar(alsFahrt(hinfahrt), rueckfahrt && alsFahrt(rueckfahrt), z)

  return {
    quelle: 'live',
    datum, rueckfahrtDatum: rueck, naechte: naechte(z),
    hinfahrt: hinfahrt && kurzfassung(hinfahrt),
    hinfahrtSpaeter: hinfahrtSpaeter && kurzfassung(hinfahrtSpaeter),
    rueckfahrt: rueckfahrt && kurzfassung(rueckfahrt),
    ...(passung && { passung }),
    ticket: ticketFuer(land, hinfahrt ? hatFernverkehr(hinfahrt) : false, a.tickets),
    ...(richtwert && { richtwert }),
    ...(fehlerArt && { fehlerArt }),
    ...(keineVerbindung && !bedient && { hinweis: saisonHinweis }),
    ...(fehler && { fehler }),
  }
}

/** Früheste Ankunft unter den Verbindungen mit Abfahrt zwischen "los ab" und 14 Uhr (Ortszeit). */
function spaetereHinfahrt(its: Itinerary[], abMin: number): Itinerary | undefined {
  return its
    .filter((i) => { const m = lokaleMinuten(i.startTime); return m >= abMin && m < SPAETESTE_HINFAHRT_MIN })
    .sort((x, y) => Date.parse(x.endTime) - Date.parse(y.endTime))[0]
}
