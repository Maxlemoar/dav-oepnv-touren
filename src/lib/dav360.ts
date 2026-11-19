/**
 * Tourenprogramm der Sektion aus DAV360 (offene JSON-Schnittstelle der Sektionsseite, siehe
 * docs/research/dav360-api.md). Wir lesen nur; das System der Wahrheit bleibt DAV360.
 * Ohne Server-Abhängigkeiten, damit Client-Komponenten den Anreisetext hier bauen können.
 */
import type { Land, Ticket } from '@/lib/content/schema'
import { lokalesDatum, lokaleUhrzeit, wochentagKurz } from '@/lib/datum'

export const SEKTION_BASIS = 'https://www.dav-offenburg.de'
export const PROGRAMM_URL = `${SEKTION_BASIS}/programm/touren`
export const DAV360_URL = `${SEKTION_BASIS}/api/events/get-event-list-view-by-id/17307?additionalData=%7B%7D`
/** Sechs Stunden, wie die Seite. */
export const DAV360_REVALIDATE = 21600
const ZEITLIMIT_MS = 8000

export type Sektionstour = {
  id: number
  titel: string
  untertitel?: string
  /** Beschreibung als Klartext. */
  beschreibung?: string
  kategorie?: string
  art?: string
  /** JJJJ-MM-TT, Ortszeit wie in DAV360 gepflegt. */
  start: string
  /** JJJJ-MM-TT, nie vor start; fehlt das Ende in DAV360, gilt start. */
  ende: string
  /** HH:MM, nur wenn in DAV360 eine Uhrzeit gepflegt ist. */
  startZeit?: string
  leitung: string[]
  treffpunkt?: string
  anreisehinweis?: string
  /** DAV360-Feld "ÖV möglich" ist gesetzt. */
  oeffiMoeglich: boolean
  buchungscode?: string
  /** Absolute Adresse der Detailseite bei der Sektion. */
  link?: string
  anmeldeschluss?: string
  /** Kurs oder Abend ohne Ziel (Werkstatt, Theorie, Halle): keine Anreise zu planen. */
  ohneOrt: boolean
}

const ENTITAETEN: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
  eacute: 'é', egrave: 'è', agrave: 'à', ndash: '–', mdash: '—', bdquo: '„', ldquo: '“', rdquo: '”', hellip: '…',
}

/** Zeichen zu einem numerischen HTML-Verweis; ungültige Codepunkte bleiben stehen statt zu werfen. */
function zeichen(code: number): string | undefined {
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : undefined
}

/** HTML aus DAV360 als einzeiliger Klartext: Tags raus, Entitäten aufgelöst, Leerraum zusammengefasst. */
export function htmlZuText(html: unknown): string {
  if (typeof html !== 'string') return ''
  return html
    .replace(/<(br|\/p|\/li|\/div|\/h\d)\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (m, n: string) => zeichen(Number(n)) ?? m)
    .replace(/&#x([0-9a-f]+);/gi, (m, n: string) => zeichen(parseInt(n, 16)) ?? m)
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITAETEN[name] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

const text = (v: unknown): string | undefined => {
  const t = htmlZuText(v)
  return t || undefined
}
const obj = (v: unknown): Record<string, unknown> | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined
const DATUM_ZEIT = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/

function datumUndZeit(v: unknown): { datum: string; zeit?: string } | undefined {
  if (typeof v !== 'string') return undefined
  const m = DATUM_ZEIT.exec(v.trim())
  if (!m) return undefined
  return { datum: m[1], zeit: m[2] && m[2] !== '00:00' ? m[2] : undefined }
}

// Titel oder Kategorie mit diesen Wörtern sind Kurse und Abende ohne Ziel draußen.
const OHNE_ORT = /\b(werkstatt|schrauber\w*|theorie\w*|vortrag|vortr[aä]ge|stammtisch|versammlung|mitgliederversammlung|kletterhalle|hallentraining|erste[ -]hilfe|schulung)\b/i

export function istOhneOrt(t: { titel: string; untertitel?: string; kategorie?: string }): boolean {
  return OHNE_ORT.test([t.titel, t.untertitel, t.kategorie].filter(Boolean).join(' '))
}

/** Eine Veranstaltung aus der Schnittstelle; undefined, wenn Kernfelder (id, Titel, Datum) fehlen. */
export function parseVeranstaltung(roh: unknown): Sektionstour | undefined {
  const e = obj(roh)
  if (!e) return undefined
  const id = typeof e.id === 'number' ? e.id : Number(e.id)
  const titel = text(e.title)
  const termine = Array.isArray(e.dates) ? e.dates.map(obj).filter((d) => d !== undefined) : []
  const start = datumUndZeit(termine[0]?.dateTimeStart)
  if (!Number.isFinite(id) || !titel || !start) return undefined
  // Bei mehreren Terminen zählt das späteste Ende.
  const enden = termine.map((d) => datumUndZeit(d.dateTimeEnd)?.datum).filter((d): d is string => !!d && d >= start.datum)
  const ende = enden.sort().at(-1) ?? start.datum
  const leitung = (Array.isArray(e.leaders) ? e.leaders : [])
    .map(obj)
    .map((p) => [p?.firstName, p?.lastName].filter((x) => typeof x === 'string' && x.trim()).join(' ').trim())
    .filter(Boolean)
  const route = typeof e.detailRoute === 'string' && e.detailRoute.startsWith('/') ? e.detailRoute : undefined
  const t: Omit<Sektionstour, 'ohneOrt'> = {
    id,
    titel,
    untertitel: text(e.subtitle),
    beschreibung: text(e.description),
    kategorie: text(obj(e.category)?.name),
    art: text(obj(e.classification)?.name),
    start: start.datum,
    ende,
    startZeit: start.zeit,
    leitung,
    treffpunkt: text(e.meetingPoint),
    anreisehinweis: text(e.arrivalHints),
    oeffiMoeglich: e.isPublicTransportAvailable === true,
    buchungscode: text(e.bookingCode),
    link: route && `${SEKTION_BASIS}${route}`,
    anmeldeschluss: datumUndZeit(e.registerEnd)?.datum,
  }
  return { ...t, ohneOrt: istOhneOrt(t) }
}

export function parseVeranstaltungen(roh: unknown): Sektionstour[] {
  if (!Array.isArray(roh)) return []
  return roh.map(parseVeranstaltung).filter((t): t is Sektionstour => t !== undefined)
}

/** Touren ab heute (Europe/Berlin), nach Datum und Titel sortiert. */
export function kommendeTouren(touren: Sektionstour[], heute: string): Sektionstour[] {
  return touren
    .filter((t) => t.start >= heute)
    .sort((a, b) => a.start.localeCompare(b.start) || a.titel.localeCompare(b.titel, 'de'))
}

export type Anreise =
  | { art: 'oeffi' }
  | { art: 'andere'; kurz: string }
  | { art: 'unbekannt' }

const OEFFI = /(öpnv|\böv\b|öffentlich|öffis?\b|\bbahn\b|\bzug\b|deutschlandticket)/i

/** Wie die Tourenleitung die Anreise plant, aus "ÖV möglich", Anreisehinweis oder einem Anfahrt-Satz in der Beschreibung. */
export function anreise(t: Pick<Sektionstour, 'oeffiMoeglich' | 'anreisehinweis' | 'beschreibung'>): Anreise {
  const hinweis = t.anreisehinweis ?? /\b(anfahrt|anreise)\b[^.]{0,80}/i.exec(t.beschreibung ?? '')?.[0]
  if (t.oeffiMoeglich || (hinweis && OEFFI.test(hinweis))) return { art: 'oeffi' }
  if (!hinweis) return { art: 'unbekannt' }
  if (/kleinbus|mietfahrzeug|mietwagen|vereinsbus/i.test(hinweis)) return { art: 'andere', kurz: 'Kleinbus' }
  if (/fahrgemeinschaft/i.test(hinweis)) return { art: 'andere', kurz: 'Fahrgemeinschaft' }
  if (/\b(pkw|auto)\b/i.test(hinweis)) return { art: 'andere', kurz: 'Pkw' }
  const kurz = hinweis.replace(/^(anfahrt|anreise)\s*:?\s*/i, '')
  return { art: 'andere', kurz: kurz.length > 40 ? `${kurz.slice(0, 39).trimEnd()}…` : kurz }
}

export type SektionstourenErgebnis = { touren: Sektionstour[]; fehler: boolean }

type LadeOptionen = { fetch?: typeof fetch; heute?: string }

/** Kommende Touren der Sektion; bei Fehlern der Schnittstelle leere Liste mit Fehlerflag. */
export async function ladeSektionstouren(o: LadeOptionen = {}): Promise<SektionstourenErgebnis> {
  const holen = o.fetch ?? fetch
  const heute = o.heute ?? lokalesDatum(new Date())
  try {
    const r = await holen(DAV360_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(ZEITLIMIT_MS),
      next: { revalidate: DAV360_REVALIDATE },
    } as RequestInit)
    if (!r.ok) return { touren: [], fehler: true }
    const roh: unknown = await r.json()
    if (!Array.isArray(roh)) return { touren: [], fehler: true }
    return { touren: kommendeTouren(parseVeranstaltungen(roh), heute), fehler: false }
  } catch {
    return { touren: [], fehler: true }
  }
}

/** Kurzer Ticket-Satz für den Anreisetext. */
export function ticketKurz(ticket: Ticket, land: Land): string {
  if (ticket === 'deutschlandticket') return 'Deutschlandticket'
  if (ticket === 'halbtax') return 'Deutschlandticket bis Basel, ab dort Halbtax'
  if (ticket === 'europass') return 'Deutschlandticket bis Kehl, ab dort Europass'
  return land === 'AT' ? 'Sparpreis Europa (DB) oder Sparschiene (ÖBB)' : 'Fernverkehrsticket nötig'
}

type Fahrt = { ab: string; an: string; umstiege: number }

export type AnreisetextDaten = {
  startName: string
  zielName: string
  hinfahrt?: Fahrt
  rueckfahrt?: Fahrt
  /** Richtwert, wenn keine Live-Verbindung vorliegt. */
  richtwert?: { fahrzeitMin: number; umstiege: number }
  ticket?: string
  /** Absoluter Link auf unsere Gebietsseite mit Datum. */
  link: string
}

function umstiegeText(n: number): string {
  return n === 0 ? 'direkt' : `${n} ${n === 1 ? 'Umstieg' : 'Umstiege'}`
}

function fahrtText(f: Fahrt, von: string, nach: string): string {
  const tag = wochentagKurz(lokalesDatum(f.ab))
  return `${tag} ${lokaleUhrzeit(f.ab)} ab ${von}, ${lokaleUhrzeit(f.an)} an ${nach} (${umstiegeText(f.umstiege)})`
}

function dauerText(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')} h`
}

/** Text für das DAV360-Feld "Anreisehinweis". */
export function anreisetext(d: AnreisetextDaten): string {
  const saetze: string[] = []
  if (d.hinfahrt) {
    saetze.push(`Anreise mit Bahn und Bus möglich: ${fahrtText(d.hinfahrt, d.startName, d.zielName)}.`)
  } else if (d.richtwert) {
    saetze.push(`Anreise mit Bahn und Bus bis ${d.zielName} möglich, ab ${d.startName} ca. ${dauerText(d.richtwert.fahrzeitMin)} (${umstiegeText(d.richtwert.umstiege)}).`)
  } else {
    saetze.push(`Anreise mit Bahn und Bus bis ${d.zielName} möglich.`)
  }
  if (d.rueckfahrt) saetze.push(`Rückfahrt ${fahrtText(d.rueckfahrt, d.zielName, d.startName)}.`)
  if (d.ticket) saetze.push(`Ticket: ${d.ticket}.`)
  saetze.push(`Verbindung prüfen: ${d.link}`)
  return saetze.join(' ')
}
