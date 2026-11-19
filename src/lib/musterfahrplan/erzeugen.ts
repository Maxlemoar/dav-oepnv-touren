import { lokaleMinuten, lokaleUhrzeit, lokalesDatum } from '@/lib/datum'
import { hatFernverkehr } from '@/lib/verbindung/auswerten'
import type { Itinerary } from '@/lib/verbindung/transitous'
import type { Fahrt, Linie } from './typen'

const STRECKE_FRUEHESTENS_MIN = 6 * 60
const STANDARD_TOLERANZ_GRAD = 0.002

/** `to.name` aller Nicht-Fußweg-Abschnitte außer dem letzten, ohne direkte Wiederholungen. */
export function viaAus(it: Itinerary): string[] {
  const fahrten = it.legs.filter((l) => l.mode !== 'WALK')
  const via: string[] = []
  for (const l of fahrten.slice(0, -1)) {
    if (via[via.length - 1] !== l.to.name) via.push(l.to.name)
  }
  return via
}

export function fahrtAus(it: Itinerary): Fahrt {
  return {
    ab: lokaleUhrzeit(it.startTime),
    an: lokaleUhrzeit(it.endTime),
    umstiege: it.transfers,
    via: viaAus(it),
    fern: hatFernverkehr(it),
  }
}

/** Nach Abfahrt sortiert; gleiche (ab, an) nur einmal, weniger Umstiege gewinnt. */
function eindeutigSortiert(its: Itinerary[]): Fahrt[] {
  const proZeit = new Map<string, Fahrt>()
  for (const f of its.map(fahrtAus)) {
    const schluessel = `${f.ab}-${f.an}`
    const vorhanden = proZeit.get(schluessel)
    if (!vorhanden || f.umstiege < vorhanden.umstiege) proZeit.set(schluessel, f)
  }
  return [...proZeit.values()].sort((a, b) => a.ab.localeCompare(b.ab) || a.an.localeCompare(b.an))
}

export function hinfahrtenAus(its: Itinerary[], datum: string): Fahrt[] {
  return eindeutigSortiert(its.filter((i) => lokalesDatum(i.startTime) === datum))
}

export function rueckfahrtenAus(its: Itinerary[], datum: string): Fahrt[] {
  return eindeutigSortiert(its.filter((i) => lokalesDatum(i.endTime) === datum))
}

/** Google Encoded Polyline → [lon, lat]. */
export function dekodierePolyline(kodiert: string, praezision: number): Linie {
  const faktor = 10 ** praezision
  const linie: Linie = []
  let i = 0
  let lat = 0
  let lon = 0
  const naechsterWert = (): number => {
    let ergebnis = 0
    let schub = 0
    let b: number
    do {
      b = kodiert.charCodeAt(i++) - 63
      ergebnis |= (b & 0x1f) << schub
      schub += 5
    } while (b >= 0x20)
    return ergebnis & 1 ? ~(ergebnis >> 1) : ergebnis >> 1
  }
  while (i < kodiert.length) {
    lat += naechsterWert()
    lon += naechsterWert()
    linie.push([lon / faktor, lat / faktor])
  }
  return linie
}

function abstandZurStrecke(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const laenge2 = dx * dx + dy * dy
  const t = laenge2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / laenge2))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

const runde5 = (n: number) => Math.round(n * 1e5) / 1e5

/** Douglas-Peucker (Toleranz in Grad), Punkte auf 5 Nachkommastellen gerundet. */
export function vereinfache(linie: Linie, toleranzGrad = STANDARD_TOLERANZ_GRAD): Linie {
  if (linie.length < 3) return linie.map(([x, y]) => [runde5(x), runde5(y)])
  const behalten = new Array<boolean>(linie.length).fill(false)
  behalten[0] = behalten[linie.length - 1] = true
  const stapel: [number, number][] = [[0, linie.length - 1]]
  while (stapel.length) {
    const [von, bis] = stapel.pop()!
    let maxAbstand = 0
    let index = -1
    for (let k = von + 1; k < bis; k++) {
      const d = abstandZurStrecke(linie[k], linie[von], linie[bis])
      if (d > maxAbstand) { maxAbstand = d; index = k }
    }
    if (index !== -1 && maxAbstand > toleranzGrad) {
      behalten[index] = true
      stapel.push([von, index], [index, bis])
    }
  }
  return linie.filter((_, k) => behalten[k]).map(([x, y]) => [runde5(x), runde5(y)])
}

const dauerMs = (it: Itinerary) => Date.parse(it.endTime) - Date.parse(it.startTime)

/** Schnellste Hinfahrt mit Abfahrt ab 06:00 (bei Gleichstand weniger Umstiege), je Nicht-Fußweg-Abschnitt eine Linie. */
export function streckeAus(its: Itinerary[]): Linie[] | undefined {
  const kandidaten = its.filter((i) => lokaleMinuten(i.startTime) >= STRECKE_FRUEHESTENS_MIN)
  const beste = kandidaten.reduce<Itinerary | undefined>(
    (b, i) => (!b || dauerMs(i) < dauerMs(b) || (dauerMs(i) === dauerMs(b) && i.transfers < b.transfers) ? i : b),
    undefined,
  )
  if (!beste) return undefined
  const linien = beste.legs
    .filter((l) => l.mode !== 'WALK' && l.legGeometry)
    .map((l) => vereinfache(dekodierePolyline(l.legGeometry!.points, l.legGeometry!.precision)))
  return linien.length ? linien : undefined
}
