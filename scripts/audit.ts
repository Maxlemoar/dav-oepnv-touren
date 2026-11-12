/**
 * Maschinelle Prüfung aller Inhalte. Schreibt Rohdaten und eine lesbare Zusammenfassung.
 *
 *   npm run audit                                  alles
 *   npm run audit -- --teil verbindungen           nur Bahn- und Busverbindungen (Transitous)
 *   npm run audit -- --teil huetten                Höhen, Zustiege, Entfernungen (Geländemodell)
 *   npm run audit -- --teil touren                 Tourenseiten: erreichbar, Start an Haltestelle, Kennzahlen
 *   npm run audit -- --teil links                  Hütten- und Gebietslinks
 *   npm run audit -- --aus docs/audit/2026-11      Ausgabeordner
 *   npm run audit -- --winter 2026-11-21 --nach-wechsel 2026-12-19
 *
 * Geländehöhen: Open-Meteo Elevation API (frei, ohne Schlüssel, ca. 90 m Raster).
 * Verbindungen: Transitous, höchstens eine Anfrage je 600 ms.
 * Webseiten: curl, weil manche Server Node-Anfragen blockieren.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ladeInhalt } from '../src/lib/content/laden'
import { folgetag, lokaleUhrzeit, naechsterSamstag, zuUtcIso } from '../src/lib/datum'
import type { Itinerary } from '../src/lib/verbindung/transitous'
import { waehleHinfahrt, waehleRueckfahrt, kurzfassung, HINFAHRT_FENSTER, RUECKFAHRT_ANKUNFT_BIS } from '../src/lib/verbindung/auswerten'
import { haversineKm } from '../src/lib/richtwerte'

const exec = promisify(execFile)
const args = process.argv.slice(2)
const arg = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const teil = arg('--teil') ?? 'alle'
const aus = arg('--aus') ?? `docs/audit/${new Date().toISOString().slice(0, 7)}`
const winter = arg('--winter') ?? naechsterSamstag(new Date(Date.now() + 7 * 86400_000))
const nachWechsel = arg('--nach-wechsel') ?? '2026-12-19'
const schlaf = (ms: number) => new Promise((r) => setTimeout(r, ms))
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

fs.mkdirSync(aus, { recursive: true })
const i = ladeInhalt()
const offenburg = i.startorte.find((s) => s.id === 'offenburg')!

// ---------- Hilfen ----------

/** Gehzeit nach DAV-Faustregel: 4 km/h waagrecht (Wege 35 % länger als Luftlinie), 300 hm/h bergauf. */
function gehzeitSchaetzungMin(luftlinieKm: number, aufstiegHm: number): number {
  const h = (luftlinieKm * 1.35) / 4
  const v = Math.max(0, aufstiegHm) / 300
  return Math.round((Math.max(h, v) + Math.min(h, v) / 2) * 60)
}

async function hoehen(punkte: { lat: number; lon: number }[]): Promise<(number | null)[]> {
  const ergebnis: (number | null)[] = []
  for (let a = 0; a < punkte.length; a += 100) {
    const teilstueck = punkte.slice(a, a + 100)
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${teilstueck.map((p) => p.lat.toFixed(5)).join(',')}&longitude=${teilstueck.map((p) => p.lon.toFixed(5)).join(',')}`
    try {
      const { stdout } = await exec('curl', ['-s', '-m', '30', url], { maxBuffer: 10_000_000 })
      const d = JSON.parse(stdout) as { elevation?: number[] }
      ergebnis.push(...(d.elevation ?? teilstueck.map(() => null)))
    } catch {
      ergebnis.push(...teilstueck.map(() => null))
    }
    await schlaf(300)
  }
  return ergebnis
}

async function httpStatus(url: string): Promise<{ status: number; endUrl: string }> {
  const versuch = async (ua?: string, methode: 'HEAD' | 'GET' = 'HEAD') => {
    const a = ['-s', '-o', '/dev/null', '-L', '-m', '20', '-w', '%{http_code} %{url_effective}']
    if (methode === 'HEAD') a.push('-I')
    if (ua) a.push('-A', ua)
    a.push(url)
    try {
      const { stdout } = await exec('curl', a)
      const [code, ...rest] = stdout.trim().split(' ')
      return { status: Number(code), endUrl: rest.join(' ') }
    } catch {
      return { status: 0, endUrl: url }
    }
  }
  let r = await versuch(undefined, 'HEAD')
  if (r.status === 0 || r.status >= 400) r = await versuch(undefined, 'GET')
  if (r.status === 0 || r.status >= 400) r = await versuch(BROWSER_UA, 'GET')
  return r
}

async function seite(url: string): Promise<{ status: number; html: string }> {
  try {
    const { stdout } = await exec('curl', ['-s', '-L', '-m', '30', '-w', '\n__STATUS__%{http_code}', url], { maxBuffer: 20_000_000 })
    const idx = stdout.lastIndexOf('\n__STATUS__')
    return { status: Number(stdout.slice(idx + 11)), html: stdout.slice(0, idx) }
  } catch {
    return { status: 0, html: '' }
  }
}

function schreibe(name: string, daten: unknown) {
  fs.writeFileSync(path.join(aus, name), JSON.stringify(daten, null, 2))
}

// ---------- Verbindungen ----------

/** Wie planen(), aber per curl mit 45 s Wartezeit und bis zu drei Wiederholungen bei Überlast. */
async function planenGeduldig(p: { von: string; nach: string; zeit: string; ankunftBis?: boolean; anzahl?: number }): Promise<Itinerary[]> {
  const q = new URLSearchParams({ fromPlace: p.von, toPlace: p.nach, time: p.zeit, arriveBy: String(p.ankunftBis ?? false), numItineraries: String(p.anzahl ?? 10), language: 'de' })
  const url = `https://api.transitous.org/api/v1/plan?${q.toString()}`
  let letzterFehler = ''
  for (let versuch = 0; versuch < 4; versuch++) {
    try {
      const { stdout } = await exec('curl', ['-s', '-m', '45', '-A', 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)', '-w', '\n__STATUS__%{http_code}', url], { maxBuffer: 50_000_000 })
      const idx = stdout.lastIndexOf('\n__STATUS__')
      const status = Number(stdout.slice(idx + 11))
      if (status === 200) {
        const d = JSON.parse(stdout.slice(0, idx)) as { itineraries?: Itinerary[] }
        return d.itineraries ?? []
      }
      letzterFehler = `HTTP ${status}`
      if (status !== 429 && status !== 0 && status < 500) break
    } catch (e) { letzterFehler = (e as Error).message }
    await schlaf(5000 * (versuch + 1))
  }
  throw new Error(letzterFehler)
}

async function inParallel<T, R>(liste: T[], breite: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const ergebnis: R[] = new Array(liste.length)
  let naechster = 0
  await Promise.all(Array.from({ length: breite }, async () => {
    for (let k = naechster++; k < liste.length; k = naechster++) ergebnis[k] = await fn(liste[k])
  }))
  return ergebnis
}

type VerbindungBefund = {
  id: string; name: string; land: string; region: string
  richtwertMin?: number; richtwertUmstiege?: number
  winterHin?: { ab: string; an: string; min: number; umstiege: number }
  winterErsteAnkunft?: string
  winterRueckSo?: { ab: string; an: string }
  nachWechselHin?: { ab: string; an: string; min: number; umstiege: number }
  fehler?: string[]
  flags: string[]
}

async function pruefeVerbindungen(): Promise<VerbindungBefund[]> {
  const sonntag = folgetag(winter)
  // Nach dem Fahrplanwechsel nur die Hauptzugänge der Gebiete, das spart ein Drittel der Abfragen.
  const hauptzugaenge = new Set(i.gebiete.map((g) => g.haltestellen[0]))
  let fertig = 0
  const befunde = await inParallel(i.haltestellen, 2, async (h): Promise<VerbindungBefund> => {
    const r = h.richtwerte.offenburg
    const b: VerbindungBefund = { id: h.id, name: h.name, land: h.land, region: h.region, richtwertMin: r?.fahrzeitMin, richtwertUmstiege: r?.umstiege, flags: [], fehler: [] }
    const hin = async (datum: string) => {
      const its = await planenGeduldig({ von: offenburg.haltestelleId, nach: h.haltestelleId, zeit: zuUtcIso(datum, HINFAHRT_FENSTER.fruehVon), anzahl: 12 })
      const { hinfahrt } = waehleHinfahrt(its, { nahverkehrBevorzugen: h.land === 'DE' })
      return { its, hinfahrt }
    }
    try {
      const { its, hinfahrt } = await hin(winter)
      if (hinfahrt) {
        const k = kurzfassung(hinfahrt)
        b.winterHin = { ab: lokaleUhrzeit(k.ab), an: lokaleUhrzeit(k.an), min: k.dauerMin, umstiege: k.umstiege }
      } else if (its.length) {
        const frueheste = [...its].sort((a, c) => Date.parse(a.endTime) - Date.parse(c.endTime))[0]
        b.winterErsteAnkunft = lokaleUhrzeit(frueheste.endTime)
        b.flags.push('winter_keine_fruehe_hinfahrt')
      } else {
        b.flags.push('winter_unerreichbar')
      }
    } catch (e) { b.fehler!.push(`winter hin: ${(e as Error).message}`) }
    await schlaf(300)

    try {
      const its = await planenGeduldig({ von: h.haltestelleId, nach: offenburg.haltestelleId, zeit: zuUtcIso(sonntag, RUECKFAHRT_ANKUNFT_BIS), ankunftBis: true, anzahl: 6 })
      const rueck = waehleRueckfahrt(its, sonntag)
      if (rueck) b.winterRueckSo = { ab: lokaleUhrzeit(rueck.startTime), an: lokaleUhrzeit(rueck.endTime) }
      else b.flags.push('winter_keine_rueckfahrt_sonntag')
    } catch (e) { b.fehler!.push(`rueck: ${(e as Error).message}`) }
    await schlaf(300)

    if (hauptzugaenge.has(h.id)) {
      try {
        const { hinfahrt } = await hin(nachWechsel)
        if (hinfahrt) {
          const k = kurzfassung(hinfahrt)
          b.nachWechselHin = { ab: lokaleUhrzeit(k.ab), an: lokaleUhrzeit(k.an), min: k.dauerMin, umstiege: k.umstiege }
        }
      } catch (e) { b.fehler!.push(`nach wechsel: ${(e as Error).message}`) }
      await schlaf(300)
    }

    if (r && b.winterHin) {
      if (b.winterHin.min > r.fahrzeitMin * 1.25 && b.winterHin.min - r.fahrzeitMin >= 30) b.flags.push('deutlich_langsamer_als_richtwert')
      if (b.winterHin.umstiege >= r.umstiege + 2) b.flags.push('mehr_umstiege_als_richtwert')
    }
    if (b.winterHin && b.nachWechselHin && Math.abs(b.nachWechselHin.min - b.winterHin.min) >= 20) b.flags.push('fahrplanwechsel_aendert_fahrzeit')
    if (hauptzugaenge.has(h.id) && b.winterHin && !b.nachWechselHin && !b.fehler!.some((f) => f.startsWith('nach wechsel'))) b.flags.push('nach_fahrplanwechsel_keine_hinfahrt')
    if (b.fehler!.length) b.flags.push('abfrage_fehlgeschlagen'); else delete b.fehler
    fertig++
    if (fertig % 10 === 0) console.log(`verbindungen: ${fertig}/${i.haltestellen.length}`)
    return b
  })
  schreibe('verbindungen.json', befunde)
  return befunde
}

// ---------- Hütten ----------

type HuetteBefund = {
  id: string; name: string; gebietId: string; hoeheYaml: number; hoeheGelaende: number | null
  zustiege: { haltestelleId: string; luftlinieKm: number; gehzeitMin: number; schaetzungMin: number; hmYaml: number; hmGelaende: number | null; bergbahn: boolean }[]
  abstandGebietKm: number
  geschaetzt: boolean
  flags: string[]
}

async function pruefeHuetten(): Promise<HuetteBefund[]> {
  const huettenHoehen = await hoehen(i.huetten)
  const halteHoehen = await hoehen(i.haltestellen)
  const halteHoehe = new Map(i.haltestellen.map((h, k) => [h.id, halteHoehen[k]]))
  const befunde = i.huetten.map((h, k): HuetteBefund => {
    const gebiet = i.gebiete.find((g) => g.id === h.gebietId)!
    const dem = huettenHoehen[k]
    const flags: string[] = []
    if (dem !== null && Math.abs(dem - h.hoehe) > 150) flags.push('hoehe_passt_nicht_zu_koordinaten')
    const zustiege = h.zustiege.map((z) => {
      const st = i.haltestellen.find((x) => x.id === z.haltestelleId)!
      const km = haversineKm(st.lat, st.lon, h.lat, h.lon)
      const stHoehe = halteHoehe.get(st.id) ?? null
      const hmGelaende = dem !== null && stHoehe !== null ? Math.round(dem - stHoehe) : null
      const schaetzung = gehzeitSchaetzungMin(km, hmGelaende ?? z.hoehenmeter)
      if (!z.bergbahn) {
        if (z.gehzeitMin < schaetzung * 0.55) flags.push(`zustieg_zu_kurz:${st.id}`)
        if (z.gehzeitMin > schaetzung * 3 && z.gehzeitMin - schaetzung > 60) flags.push(`zustieg_sehr_lang:${st.id}`)
        if (km > 12) flags.push(`zustieg_weit:${st.id}`)
        if (hmGelaende !== null && Math.abs(hmGelaende - z.hoehenmeter) > 300) flags.push(`hoehenmeter_abweichung:${st.id}`)
      } else if (km > 25) {
        flags.push(`zustieg_weit_trotz_bergbahn:${st.id}`)
      }
      return { haltestelleId: st.id, luftlinieKm: Math.round(km * 10) / 10, gehzeitMin: z.gehzeitMin, schaetzungMin: schaetzung, hmYaml: z.hoehenmeter, hmGelaende, bergbahn: z.bergbahn }
    })
    const abstandGebiet = haversineKm(gebiet.lat, gebiet.lon, h.lat, h.lon)
    if (abstandGebiet > 35) flags.push('weit_vom_gebiet')
    return { id: h.id, name: h.name, gebietId: h.gebietId, hoeheYaml: h.hoehe, hoeheGelaende: dem === null ? null : Math.round(dem), zustiege, abstandGebietKm: Math.round(abstandGebiet), geschaetzt: h.geschaetzt, flags }
  })
  schreibe('huetten.json', befunde)
  return befunde
}

// ---------- Touren ----------

type Punkt = { lat: number; lon: number; name?: string; hoehe?: number }
type TourBefund = {
  gebietId: string; titel: string; url: string; status: number
  start?: Punkt; ende?: Punkt
  startNaechsteHaltestelle?: { id: string; km: number }; endeNaechsteHaltestelle?: { id: string; km: number }
  startNaechsteHuette?: { id: string; km: number }
  seite?: { dauerMin?: number; aufstiegHm?: number; laengeKm?: number }
  yaml: { dauerMin?: number; hoehenmeter?: number; laengeKm?: number; sportart?: string }
  flags: string[]
}

function ldJson(html: string): Record<string, unknown>[] {
  const ergebnis: Record<string, unknown>[] = []
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1])
      if (Array.isArray(d)) ergebnis.push(...d); else ergebnis.push(d)
    } catch { /* kaputtes JSON-LD überspringen */ }
  }
  return ergebnis
}

function punktAus(o: unknown): Punkt | undefined {
  const p = o as { name?: string; geo?: { latitude?: string | number; longitude?: string | number; elevation?: string | number } }
  const lat = Number(p?.geo?.latitude), lon = Number(p?.geo?.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined
  return { lat, lon, name: p.name, hoehe: p.geo?.elevation !== undefined ? Number(p.geo.elevation) : undefined }
}

/** Dauer aus Werten wie "PT4H30M", "4:30 h" oder Minuten. */
function dauerAus(v: unknown): number | undefined {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return undefined
  const iso = v.match(/^PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (iso) return Number(iso[1] ?? 0) * 60 + Number(iso[2] ?? 0)
  const hm = v.match(/(\d+):(\d{2})/)
  if (hm) return Number(hm[1]) * 60 + Number(hm[2])
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function naechste<T extends { id: string; lat: number; lon: number }>(p: Punkt, liste: T[]): { id: string; km: number } | undefined {
  let beste: { id: string; km: number } | undefined
  for (const x of liste) {
    const km = haversineKm(p.lat, p.lon, x.lat, x.lon)
    if (!beste || km < beste.km) beste = { id: x.id, km: Math.round(km * 100) / 100 }
  }
  return beste
}

async function pruefeTouren(): Promise<TourBefund[]> {
  const befunde: TourBefund[] = []
  const alle = i.gebiete.flatMap((g) => g.touren.map((t) => ({ g, t })))
  let n = 0
  for (const { g, t } of alle) {
    n++
    const b: TourBefund = { gebietId: g.id, titel: t.titel, url: t.url, status: 0, yaml: { dauerMin: t.dauerMin, hoehenmeter: t.hoehenmeter, laengeKm: t.laengeKm, sportart: t.sportart }, flags: [] }
    const { status, html } = await seite(t.url)
    b.status = status
    if (status !== 200) b.flags.push(`url_status_${status}`)
    for (const d of ldJson(html)) {
      const aktion = d.potentialAction as Record<string, unknown> | undefined
      if (aktion) {
        b.start ??= punktAus(aktion.fromLocation)
        b.ende ??= punktAus(aktion.toLocation)
        const dist = (aktion.distance as { value?: number } | undefined)?.value
        if (dist) b.seite = { ...b.seite, laengeKm: Math.round(dist / 100) / 10 }
      }
      for (const f of (d.amenityFeature as { name?: string; value?: unknown }[] | undefined) ?? []) {
        if (f.name === 'elevation_ascent' && f.value !== undefined) b.seite = { ...b.seite, aufstiegHm: Number(f.value) }
        if (f.name === 'duration' && f.value !== undefined) b.seite = { ...b.seite, dauerMin: dauerAus(f.value) }
      }
    }
    // Start und Ende gegen Haltestellen des Datenbestands und Hütten des Gebiets
    const huettenImGebiet = i.huetten.filter((h) => h.gebietId === g.id)
    if (b.start) {
      b.startNaechsteHaltestelle = naechste(b.start, i.haltestellen)
      b.startNaechsteHuette = huettenImGebiet.length ? naechste(b.start, huettenImGebiet) : undefined
      const anHaltestelle = (b.startNaechsteHaltestelle?.km ?? 99) <= 2
      const anHuette = (b.startNaechsteHuette?.km ?? 99) <= 0.5
      if (!anHaltestelle && !anHuette) b.flags.push('start_nicht_an_haltestelle')
      const imGebiet = g.haltestellen.includes(b.startNaechsteHaltestelle!.id)
      if (anHaltestelle && !imGebiet) b.flags.push('start_an_haltestelle_ausserhalb_gebiet')
    } else if (status === 200) {
      b.flags.push('keine_startkoordinaten')
    }
    if (b.ende && b.start && haversineKm(b.start.lat, b.start.lon, b.ende.lat, b.ende.lon) > 0.5) {
      b.endeNaechsteHaltestelle = naechste(b.ende, i.haltestellen)
      const anHuetteEnde = huettenImGebiet.some((h) => haversineKm(b.ende!.lat, b.ende!.lon, h.lat, h.lon) <= 0.5)
      if ((b.endeNaechsteHaltestelle?.km ?? 99) > 2 && !anHuetteEnde) b.flags.push('ende_nicht_an_haltestelle')
    }
    // Kennzahlen gegen die Tourenseite
    const weicht = (a?: number, c?: number) => a !== undefined && c !== undefined && c > 0 && Math.abs(a - c) / c > 0.15
    if (weicht(t.dauerMin, b.seite?.dauerMin)) b.flags.push('dauer_weicht_ab')
    if (weicht(t.hoehenmeter, b.seite?.aufstiegHm)) b.flags.push('hoehenmeter_weichen_ab')
    if (weicht(t.laengeKm, b.seite?.laengeKm)) b.flags.push('laenge_weicht_ab')
    if (t.sportart === 'skitour' && g.saison === 'sommer') b.flags.push('skitour_in_sommergebiet')
    befunde.push(b)
    if (n % 25 === 0) console.log(`touren: ${n}/${alle.length}`)
    await schlaf(400)
  }
  schreibe('touren.json', befunde)
  return befunde
}

// ---------- Links ----------

type LinkBefund = { wo: string; url: string; status: number; endUrl: string }

async function pruefeLinks(): Promise<LinkBefund[]> {
  const liste: { wo: string; url: string }[] = []
  for (const h of i.huetten) {
    if (h.webUrl) liste.push({ wo: `huette ${h.id} webUrl`, url: h.webUrl })
    if (h.buchungUrl) liste.push({ wo: `huette ${h.id} buchungUrl`, url: h.buchungUrl })
    liste.push({ wo: `huette ${h.id} quelle`, url: h.quelle })
  }
  for (const g of i.gebiete) for (const l of g.links) liste.push({ wo: `gebiet ${g.id} link`, url: l.url })
  const befunde: LinkBefund[] = []
  const gesehen = new Map<string, { status: number; endUrl: string }>()
  for (const { wo, url } of liste) {
    let r = gesehen.get(url)
    if (!r) { r = await httpStatus(url); gesehen.set(url, r); await schlaf(250) }
    befunde.push({ wo, url, ...r })
  }
  schreibe('links.json', befunde)
  return befunde
}

// ---------- Zusammenfassung ----------

function tabelle(kopf: string[], zeilen: (string | number | undefined)[][]): string {
  if (!zeilen.length) return '_keine_\n'
  return `| ${kopf.join(' | ')} |\n|${kopf.map(() => '---').join('|')}|\n` + zeilen.map((z) => `| ${z.map((x) => String(x ?? '').replace(/\|/g, '/')).join(' | ')} |`).join('\n') + '\n'
}

function zaehle(flags: string[][]): Record<string, number> {
  const z: Record<string, number> = {}
  for (const f of flags.flat()) { const k = f.split(':')[0]; z[k] = (z[k] ?? 0) + 1 }
  return z
}

async function main() {
  console.log(`Prüfung: Teil ${teil}, Winter-Samstag ${winter}, nach Fahrplanwechsel ${nachWechsel}, Ausgabe ${aus}`)
  const laeuft = (t: string) => teil === 'alle' || teil === t
  // Verbindungen (Transitous) parallel zu den übrigen Teilen (andere Server)
  const [verbindungen, rest] = await Promise.all([
    laeuft('verbindungen') ? pruefeVerbindungen() : Promise.resolve(lese<VerbindungBefund[]>('verbindungen.json')),
    (async () => ({
      huetten: laeuft('huetten') ? await pruefeHuetten() : lese<HuetteBefund[]>('huetten.json'),
      touren: laeuft('touren') ? await pruefeTouren() : lese<TourBefund[]>('touren.json'),
      links: laeuft('links') ? await pruefeLinks() : lese<LinkBefund[]>('links.json'),
    }))(),
  ])
  const { huetten, touren, links } = rest

  let md = `# Maschinelle Prüfung\n\nErzeugt am ${new Date().toISOString().slice(0, 10)} mit \`npm run audit\`. Winter-Samstag ${winter}, Rückfahrt Sonntag ${folgetag(winter)}, nach Fahrplanwechsel ${nachWechsel}. Rohdaten als JSON im selben Ordner.\n\n`

  if (verbindungen) {
    md += `## Verbindungen (${verbindungen.length} Haltestellen)\n\nZähler: ${JSON.stringify(zaehle(verbindungen.map((v) => v.flags)))}\n\n`
    md += tabelle(['Haltestelle', 'Region', 'Richtwert', 'Winter Sa', 'Rückfahrt So', 'Nach Wechsel', 'Befund'],
      verbindungen.filter((v) => v.flags.length).map((v) => [v.id, v.region, v.richtwertMin, v.winterHin ? `${v.winterHin.ab}–${v.winterHin.an} (${v.winterHin.min} min, ${v.winterHin.umstiege} U)` : v.winterErsteAnkunft ? `erst an ${v.winterErsteAnkunft}` : '–', v.winterRueckSo ? `${v.winterRueckSo.ab}–${v.winterRueckSo.an}` : '–', v.nachWechselHin ? `${v.nachWechselHin.min} min` : '–', v.flags.join(', ')]))
    md += '\n'
  }
  if (huetten) {
    md += `## Hütten (${huetten.length})\n\nZähler: ${JSON.stringify(zaehle(huetten.map((h) => h.flags)))}\n\n`
    md += tabelle(['Hütte', 'Höhe YAML / Gelände', 'Zustieg (Luftlinie, Gehzeit YAML / Schätzung, hm YAML / Gelände)', 'geschätzt', 'Befund'],
      huetten.filter((h) => h.flags.length).map((h) => [h.id, `${h.hoeheYaml} / ${h.hoeheGelaende ?? '?'}`, h.zustiege.map((z) => `${z.haltestelleId}: ${z.luftlinieKm} km, ${z.gehzeitMin}/${z.schaetzungMin} min, ${z.hmYaml}/${z.hmGelaende ?? '?'} hm${z.bergbahn ? ', Bahn' : ''}`).join('; '), h.geschaetzt ? 'ja' : '', h.flags.join(', ')]))
    md += '\n'
  }
  if (touren) {
    md += `## Touren (${touren.length})\n\nZähler: ${JSON.stringify(zaehle(touren.map((t) => t.flags)))}\n\n`
    md += tabelle(['Gebiet', 'Tour', 'Start (nächste Haltestelle)', 'Ende', 'YAML / Seite', 'Befund'],
      touren.filter((t) => t.flags.length).map((t) => [t.gebietId, `[${t.titel}](${t.url})`, t.start ? `${t.start.name ?? ''} (${t.startNaechsteHaltestelle?.id} ${t.startNaechsteHaltestelle?.km} km)` : '–', t.endeNaechsteHaltestelle ? `${t.ende?.name ?? ''} (${t.endeNaechsteHaltestelle.id} ${t.endeNaechsteHaltestelle.km} km)` : '', `${t.yaml.dauerMin ?? '-'}/${t.seite?.dauerMin ?? '-'} min, ${t.yaml.hoehenmeter ?? '-'}/${t.seite?.aufstiegHm ?? '-'} hm, ${t.yaml.laengeKm ?? '-'}/${t.seite?.laengeKm ?? '-'} km`, t.flags.join(', ')]))
    md += '\n'
  }
  if (links) {
    const kaputt = links.filter((l) => l.status === 0 || l.status >= 400)
    md += `## Links (${links.length}, davon ${kaputt.length} nicht erreichbar)\n\n`
    md += tabelle(['Wo', 'URL', 'Status'], kaputt.map((l) => [l.wo, l.url, l.status]))
  }
  fs.writeFileSync(path.join(aus, 'automatisch.md'), md)
  console.log(`fertig: ${path.join(aus, 'automatisch.md')}`)
}

function lese<T>(name: string): T | undefined {
  const p = path.join(aus, name)
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, 'utf8')) as T) : undefined
}

main().catch((e) => { console.error(e); process.exit(1) })
