import type { Startort, Haltestelle, TicketTabelle } from '@/lib/content/schema'
import { lokaleMinuten, lokalesDatum, zuUtcIso } from '@/lib/datum'
import { bedientAm } from '@/lib/saison'
import { viaAus } from '@/lib/musterfahrplan/erzeugen'
import type { Fahrt, Tagesplan } from '@/lib/musterfahrplan/typen'
import { alsMin, type Zeitfenster } from '@/lib/zeitfenster'
import { planen as planenStandard, dienstNichtErreichbar, type Itinerary, type PlanParameter } from './transitous'
import { kurzfassung, type VerbindungKurz } from './auswerten'
import { ticketFuer, type TicketHinweis } from './regeln'
import { ladeFahrplan, nachLiveBis, type Fahrplan } from './fahrplan'
import type { FehlerArt } from './service'

export type Lage = 'frueher' | 'passend' | 'spaeter'
export type FahrtLive = VerbindungKurz & { via: string[]; lage: Lage }
export type FahrtenAntwort = {
  quelle: 'live' | 'typisch'
  datum: string
  rueck: string
  hin: FahrtLive[]
  rueckfahrten: FahrtLive[]
  ticket: TicketHinweis
  /** Live-Hinfahrt dauert so viel länger als typisch (nur ab 30 Minuten). */
  abweichungMin?: number
  fehlerArt?: FehlerArt
  hinweis?: string
}

export type FahrtenAnfrage = {
  startort: Startort
  haltestelle: Haltestelle
  z: Zeitfenster
  tickets: TicketTabelle
  /** Typischer Tag am Hin-Datum (hin) und am Rückfahrt-Datum (rueck). */
  muster?: { hin?: Tagesplan['hin']; rueck?: Tagesplan['rueck'] }
  heute?: string
  fahrplan?: Fahrplan
}

type Abhaengigkeiten = { planen: (p: PlanParameter) => Promise<Itinerary[]> }

const VORLAUF_MIN = 90
const ANZAHL = 8
const MAX_PASSEND = 3
const ABWEICHUNG_SCHWELLE_MIN = 30
const SAISON_HINWEIS = 'Am Datum keine Busverbindung (Saisonbetrieb)'
const VERGANGEN_HINWEIS = 'Das Datum liegt in der Vergangenheit.'

function mitLage(it: Itinerary, lage: Lage): FahrtLive {
  return { ...kurzfassung(it), via: viaAus(it), lage }
}

/** Gleiche (ab, an) nur einmal, weniger Umstiege gewinnt. */
function eindeutig(its: Itinerary[]): Itinerary[] {
  const proZeit = new Map<string, Itinerary>()
  for (const i of its) {
    const k = `${i.startTime}|${i.endTime}`
    const v = proZeit.get(k)
    if (!v || i.transfers < v.transfers) proZeit.set(k, i)
  }
  return [...proZeit.values()]
}

const nachAbfahrt = (a: { ab: string }, b: { ab: string }) => Date.parse(a.ab) - Date.parse(b.ab)
const nachAnkunft = (a: { an: string }, b: { an: string }) => Date.parse(a.an) - Date.parse(b.an)

/** Eine frühere (letzte vor abMin) und bis zu drei Abfahrten ab abMin, aufsteigend. */
function waehleHin(fahrten: FahrtLive[], datum: string, abMin: number): FahrtLive[] {
  const tag = fahrten.filter((f) => lokalesDatum(f.ab) === datum).sort(nachAbfahrt)
  const frueher = tag.filter((f) => lokaleMinuten(f.ab) < abMin).slice(-1)
  const passend = tag.filter((f) => lokaleMinuten(f.ab) >= abMin).slice(0, MAX_PASSEND)
  return [...frueher.map((f) => ({ ...f, lage: 'frueher' as const })), ...passend.map((f) => ({ ...f, lage: 'passend' as const }))]
}

/** Die drei spätesten Ankünfte bis bisMin (aufsteigend) und die erste danach, alle am Rückfahrt-Datum. */
function waehleRueck(fahrten: FahrtLive[], rueck: string, bisMin: number): FahrtLive[] {
  const tag = fahrten.filter((f) => lokalesDatum(f.an) === rueck).sort(nachAnkunft)
  const passend = tag.filter((f) => lokaleMinuten(f.an) <= bisMin).slice(-MAX_PASSEND)
  const spaeter = tag.filter((f) => lokaleMinuten(f.an) > bisMin).slice(0, 1)
  return [...passend.map((f) => ({ ...f, lage: 'passend' as const })), ...spaeter.map((f) => ({ ...f, lage: 'spaeter' as const }))]
}

/** Musterfahrt ("HH:MM") auf ein Datum gesetzt; abschnitte bleiben leer. */
function ausMuster(f: Fahrt, datum: string): FahrtLive {
  const ab = alsMin(f.ab) ?? 0
  const an = alsMin(f.an) ?? ab
  return {
    ab: zuUtcIso(datum, ab), an: zuUtcIso(datum, an), dauerMin: an - ab, umstiege: f.umstiege,
    fernverkehr: f.fern, abschnitte: [], via: f.via, lage: 'passend',
  }
}

function hinAusMuster(plan: Fahrt[] | undefined, datum: string, abMin: number): FahrtLive[] {
  return waehleHin((plan ?? []).map((f) => ausMuster(f, datum)), datum, abMin)
}
function rueckAusMuster(plan: Fahrt[] | undefined, rueck: string, bisMin: number): FahrtLive[] {
  return waehleRueck((plan ?? []).map((f) => ausMuster(f, rueck)), rueck, bisMin)
}

function ticketTypisch(a: FahrtenAnfrage): TicketHinweis {
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  const land = a.haltestelle.land
  return richtwert
    ? { ticket: richtwert.ticket, hinweis: ticketFuer(land, richtwert.ticket === 'keins' && land === 'DE', a.tickets).hinweis }
    : ticketFuer(land, false, a.tickets)
}

function typisch(a: FahrtenAnfrage, zusatz: { fehlerArt?: FehlerArt; hinweis?: string }): FahrtenAntwort {
  const { z } = a
  return {
    quelle: 'typisch', datum: z.datum, rueck: z.rueck,
    hin: hinAusMuster(a.muster?.hin, z.datum, z.abMin),
    rueckfahrten: rueckAusMuster(a.muster?.rueck, z.rueck, z.bisMin),
    ticket: ticketTypisch(a),
    ...(zusatz.fehlerArt && { fehlerArt: zusatz.fehlerArt }),
    ...(zusatz.hinweis && { hinweis: zusatz.hinweis }),
  }
}

function liveBisHinweis(liveBis: string): string {
  const [, m, t] = liveBis.split('-')
  return `Typische Zeiten, nach dem Fahrplan bis ${Number(t)}.${Number(m)}.; Verbindung am Datum auf der Ortsseite prüfen`
}

/** Kürzeste Live-Hinfahrt minus kürzeste typische Hinfahrt ab abMin; nur ab 30 Minuten. */
function abweichung(live: FahrtLive[], muster: Fahrt[] | undefined, abMin: number): number | undefined {
  const passend = live.filter((f) => f.lage === 'passend')
  const typische = (muster ?? []).filter((f) => (alsMin(f.ab) ?? -1) >= abMin).map((f) => (alsMin(f.an) ?? 0) - (alsMin(f.ab) ?? 0))
  if (!passend.length || !typische.length) return undefined
  const diff = Math.min(...passend.map((f) => f.dauerMin)) - Math.min(...typische)
  return diff >= ABWEICHUNG_SCHWELLE_MIN ? diff : undefined
}

export async function fahrtenErmitteln(
  a: FahrtenAnfrage,
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<FahrtenAntwort> {
  const { z } = a
  const heute = a.heute ?? lokalesDatum(new Date())
  const fahrplan = a.fahrplan ?? ladeFahrplan()

  if (z.datum < heute) return typisch(a, { fehlerArt: 'datum_vergangen', hinweis: VERGANGEN_HINWEIS })
  if (nachLiveBis(z.datum, fahrplan) || nachLiveBis(z.rueck, fahrplan)) {
    if (!bedientAm(a.haltestelle, z.datum)) {
      return { ...typisch(a, { fehlerArt: 'keine_verbindung', hinweis: a.haltestelle.bedientHinweis ?? SAISON_HINWEIS }), hin: [], rueckfahrten: [] }
    }
    return typisch(a, { fehlerArt: 'fahrplan_noch_nicht_verfuegbar', hinweis: liveBisHinweis(fahrplan.liveBis) })
  }

  const start = { lat: a.startort.lat, lon: a.startort.lon }
  const ziel = { lat: a.haltestelle.lat, lon: a.haltestelle.lon }
  const [hinErgebnis, rueckErgebnis] = await Promise.allSettled([
    deps.planen({ von: a.startort.haltestelleId, nach: a.haltestelle.haltestelleId, vonKoord: start, nachKoord: ziel, zeit: zuUtcIso(z.datum, z.abMin - VORLAUF_MIN), ankunftBis: false, anzahl: ANZAHL }),
    deps.planen({ von: a.haltestelle.haltestelleId, nach: a.startort.haltestelleId, vonKoord: ziel, nachKoord: start, zeit: zuUtcIso(z.rueck, z.bisMin + VORLAUF_MIN), ankunftBis: true, anzahl: ANZAHL }),
  ])

  if (hinErgebnis.status === 'rejected' && rueckErgebnis.status === 'rejected') {
    const dienst = dienstNichtErreichbar(hinErgebnis.reason) || dienstNichtErreichbar(rueckErgebnis.reason)
    return typisch(a, dienst ? { fehlerArt: 'dienst_nicht_erreichbar' } : {})
  }

  const hin = hinErgebnis.status === 'fulfilled'
    ? waehleHin(eindeutig(hinErgebnis.value).map((i) => mitLage(i, 'passend')), z.datum, z.abMin)
    : hinAusMuster(a.muster?.hin, z.datum, z.abMin)
  const rueckfahrten = rueckErgebnis.status === 'fulfilled'
    ? waehleRueck(eindeutig(rueckErgebnis.value).map((i) => mitLage(i, 'passend')), z.rueck, z.bisMin)
    : rueckAusMuster(a.muster?.rueck, z.rueck, z.bisMin)

  const hinweis = hinErgebnis.status === 'rejected' ? 'Hinfahrt nach typischem Fahrplan'
    : rueckErgebnis.status === 'rejected' ? 'Rückfahrt nach typischem Fahrplan' : undefined
  const erstePassende = hin.find((f) => f.lage === 'passend')
  const land = a.haltestelle.land
  const keineHin = hinErgebnis.status === 'fulfilled' && hin.length === 0
  const abw = hinErgebnis.status === 'fulfilled' ? abweichung(hin, a.muster?.hin, z.abMin) : undefined
  return {
    quelle: 'live', datum: z.datum, rueck: z.rueck, hin, rueckfahrten,
    ticket: hinErgebnis.status === 'fulfilled'
      ? ticketFuer(land, erstePassende?.fernverkehr ?? false, a.tickets)
      : ticketTypisch(a),
    ...(abw !== undefined && { abweichungMin: abw }),
    ...(keineHin && { fehlerArt: 'keine_verbindung' as const }),
    ...(keineHin && !bedientAm(a.haltestelle, z.datum) && { hinweis: a.haltestelle.bedientHinweis ?? SAISON_HINWEIS }),
    ...(hinweis && { hinweis }),
  }
}

function plusMinute(iso: string): string {
  return new Date(Date.parse(iso) + 60_000).toISOString().replace('.000Z', 'Z')
}

/** Eine Anfrage: die nächsten Abfahrten nach zeitIso (hin: Offenburg → Ort, rueck: Ort → Offenburg). */
export async function weitereFahrten(
  a: { startort: Startort; haltestelle: Haltestelle; richtung: 'hin' | 'rueck'; zeitIso: string; z: Zeitfenster },
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<FahrtLive[]> {
  const start = { lat: a.startort.lat, lon: a.startort.lon }
  const ziel = { lat: a.haltestelle.lat, lon: a.haltestelle.lon }
  const hin = a.richtung === 'hin'
  const its = await deps.planen({
    von: hin ? a.startort.haltestelleId : a.haltestelle.haltestelleId,
    nach: hin ? a.haltestelle.haltestelleId : a.startort.haltestelleId,
    vonKoord: hin ? start : ziel, nachKoord: hin ? ziel : start,
    zeit: plusMinute(a.zeitIso), ankunftBis: false, anzahl: 4,
  })
  const nach = eindeutig(its).filter((i) => Date.parse(i.startTime) > Date.parse(a.zeitIso))
  const fahrten = nach.map((i) => mitLage(i, 'passend')).sort(nachAbfahrt)
  if (hin) return fahrten
  return fahrten
    .filter((f) => lokalesDatum(f.an) === a.z.rueck)
    .map((f) => ({ ...f, lage: lokaleMinuten(f.an) <= a.z.bisMin ? 'passend' as const : 'spaeter' as const }))
}
