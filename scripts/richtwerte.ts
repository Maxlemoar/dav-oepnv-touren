/**
 * Berechnet Richtwerte (Fahrzeit, Umstiege, Takt, Ticket, Distanzen) für jeden Startort × Haltestelle
 * an einem Referenz-Samstag und schreibt sie in content/haltestellen/*.yaml.
 *
 *   npm run richtwerte                       nächster Samstag in mindestens 7 Tagen
 *   npm run richtwerte -- --datum 2026-09-19
 *   npm run richtwerte -- --nur kandersteg
 */
import fs from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'
import { ladeInhalt } from '../src/lib/content/laden'
import { naechsterSamstag, lokalesDatum, zuUtcIso } from '../src/lib/datum'
import { planen } from '../src/lib/verbindung/transitous'
import { HINFAHRT_FENSTER } from '../src/lib/verbindung/auswerten'
import { richtwertAus, haversineKm } from '../src/lib/richtwerte'

const args = process.argv.slice(2)
const arg = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const inEinerWoche = new Date(Date.now() + 7 * 86400_000)
const datum = arg('--datum') ?? naechsterSamstag(inEinerWoche)
const nur = arg('--nur')
const heute = lokalesDatum(new Date())
const wurzel = path.join(process.cwd(), 'content')
/** Bahnstrecke ist im Mittel etwa ein Viertel länger als die Luftlinie. */
const BAHN_FAKTOR = 1.25

const schlaf = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function strassenKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): Promise<number | undefined> {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) return undefined
    const d = (await r.json()) as { routes?: { distance: number }[] }
    const m = d.routes?.[0]?.distance
    return m ? Math.round(m / 1000) : undefined
  } catch {
    return undefined
  }
}

async function main() {
  const i = ladeInhalt(wurzel)
  const haltestellen = nur ? i.haltestellen.filter((h) => h.id === nur) : i.haltestellen
  if (nur && haltestellen.length === 0) throw new Error(`Haltestelle "${nur}" nicht gefunden`)
  console.log(`Richtwerte für ${datum}, ${haltestellen.length} Haltestellen × ${i.startorte.length} Startorte`)

  for (const h of haltestellen) {
    const datei = path.join(wurzel, 'haltestellen', `${h.id}.yaml`)
    const dok = parse(fs.readFileSync(datei, 'utf8')) as Record<string, unknown> & { richtwerte?: Record<string, unknown> }
    dok.richtwerte = dok.richtwerte ?? {}

    for (const s of i.startorte) {
      try {
        const its = await planen({ von: s.haltestelleId, nach: h.haltestelleId, zeit: zuUtcIso(datum, HINFAHRT_FENSTER.fruehVon), ankunftBis: false, anzahl: 15 })
        const r = richtwertAus(its, h.land, i.tickets, heute)
        if (!r) { console.warn(`  ${s.id} → ${h.id}: keine Hinfahrt im Fenster (${its.length} Itineraries)`); continue }
        const strasse = await strassenKm(s, h)
        const bahn = Math.round(haversineKm(s.lat, s.lon, h.lat, h.lon) * BAHN_FAKTOR)
        dok.richtwerte[s.id] = { ...r, ...(strasse ? { strassenKm: strasse } : {}), bahnKm: bahn }
        console.log(`  ${s.id} → ${h.id}: ${r.fahrzeitMin} min, ${r.umstiege} Umstiege, ${r.takt}, ${r.ticket}, Straße ${strasse ?? '?'} km`)
      } catch (e) {
        console.warn(`  ${s.id} → ${h.id}: FEHLER ${(e as Error).message}`)
      }
      await schlaf(500)
    }
    fs.writeFileSync(datei, stringify(dok, { lineWidth: 0 }))
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
