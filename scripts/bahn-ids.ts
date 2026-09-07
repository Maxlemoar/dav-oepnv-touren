/**
 * Holt für Startorte und Haltestellen die bahn.de-Bahnhofsdaten (EVA-Nummer, Name, Koordinaten)
 * aus der Orte-API und schreibt sie als Feld `bahn` in die YAML-Dateien. Ohne diese Daten
 * meldet der Buchungslink bei bahn.de "Reise nicht gefunden".
 *
 *   npm run bahn-ids              nur Einträge ohne `bahn`
 *   npm run bahn-ids -- --alle    alle Einträge neu abfragen
 *   npm run bahn-ids -- --nur kandersteg
 *
 * Die Abfrage läuft über `curl`: bahn.de (Akamai) beantwortet Anfragen aus Nodes fetch mit 403,
 * dieselbe Anfrage per curl mit demselben User-Agent aber mit 200.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { parseDocument } from 'yaml'
import { ladeInhalt } from '../src/lib/content/laden'
import { haversineKm } from '../src/lib/richtwerte'
import type { BahnOrt } from '../src/lib/content/schema'

const args = process.argv.slice(2)
const alle = args.includes('--alle')
const nurIdx = args.indexOf('--nur')
const nur = nurIdx >= 0 ? args[nurIdx + 1] : undefined
const wurzel = path.join(process.cwd(), 'content')
const USER_AGENT = 'Mozilla/5.0 (compatible; dav-oepnv-touren; +https://github.com/Maxlemoar/dav-oepnv-touren)'
/** Treffer weiter weg als das gelten nicht als derselbe Bahnhof. */
const MAX_ABSTAND_KM = 1.5
const PAUSE_MS = 800

type Ort = { extId: string; id: string; name: string; type: string; lat: number; lon: number }
type Eintrag = { id: string; name: string; lat: number; lon: number; bahn?: BahnOrt }

const schlaf = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Suchvarianten vom vollständigen Namen zur Kurzform: Bahnhofs-Zusatz, Klammer, Teil nach Komma weglassen. */
export function namensVarianten(name: string): string[] {
  const varianten: string[] = []
  const merke = (s: string) => { const t = s.replace(/\s+/g, ' ').trim(); if (t && !varianten.includes(t)) varianten.push(t) }
  merke(name)
  const ohneBahnhof = name.replace(/\s+(Hauptbahnhof|Busbahnhof|Bahnhof|Bhf\.?)\b/g, '')
  merke(ohneBahnhof)
  const ohneKlammer = ohneBahnhof.replace(/\s*\([^)]*\)/g, '')
  merke(ohneKlammer)
  merke(ohneKlammer.split(',')[0])
  merke(name.split(',')[0])
  return varianten
}

const curl = promisify(execFile)

async function sucheOrte(begriff: string): Promise<Ort[]> {
  const { stdout } = await curl('curl', [
    '--silent', '--show-error', '--fail-with-body', '--max-time', '15', '--get',
    '--user-agent', USER_AGENT, '--header', 'Accept: application/json',
    '--data-urlencode', `suchbegriff=${begriff}`, '--data-urlencode', 'typ=ALL', '--data-urlencode', 'limit=10',
    'https://www.bahn.de/web/api/reiseloesung/orte',
  ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }).catch((e: Error & { stdout?: string }) => {
    throw new Error(`Orte-API für "${begriff}": ${e.message.split('\n')[0]}`)
  })
  return JSON.parse(stdout) as Ort[]
}

/** X/Y aus der DB-ID (lon/lat × 1e6); Fallback aus lat/lon. */
function koordinatenAus(o: Ort): { x: number; y: number } {
  const x = /@X=(-?\d+)@/.exec(o.id)?.[1]
  const y = /@Y=(-?\d+)@/.exec(o.id)?.[1]
  return { x: x ? Number(x) : Math.round(o.lon * 1e6), y: y ? Number(y) : Math.round(o.lat * 1e6) }
}

async function findeBahnOrt(e: Eintrag): Promise<{ bahn: BahnOrt; variante: string; abstandKm: number } | { grund: string }> {
  const gruende: string[] = []
  for (const [n, variante] of namensVarianten(e.name).entries()) {
    if (n > 0) await schlaf(PAUSE_MS)
    const orte = await sucheOrte(variante)
    const bahnhoefe = orte.filter((o) => o.type === 'ST' && /^\d+$/.test(o.extId))
    if (bahnhoefe.length === 0) { gruende.push(`"${variante}": kein Bahnhof`); continue }
    const mitAbstand = bahnhoefe
      .map((o) => ({ o, abstandKm: haversineKm(e.lat, e.lon, o.lat, o.lon) }))
      .sort((a, b) => a.abstandKm - b.abstandKm)
    const bester = mitAbstand[0]
    if (bester.abstandKm > MAX_ABSTAND_KM) {
      gruende.push(`"${variante}": nächster Treffer "${bester.o.name}" ${bester.abstandKm.toFixed(1)} km entfernt`)
      continue
    }
    return { bahn: { extId: bester.o.extId, name: bester.o.name, ...koordinatenAus(bester.o) }, variante, abstandKm: bester.abstandKm }
  }
  return { grund: gruende.join('; ') }
}

async function bearbeite(art: 'startorte' | 'haltestellen', eintraege: Eintrag[]): Promise<{ ok: number; uebersprungen: string[] }> {
  let ok = 0
  const uebersprungen: string[] = []
  for (const e of eintraege) {
    const datei = path.join(wurzel, art, `${e.id}.yaml`)
    await schlaf(PAUSE_MS)
    try {
      const ergebnis = await findeBahnOrt(e)
      if ('grund' in ergebnis) {
        console.warn(`  ${e.id}: ÜBERSPRUNGEN – ${ergebnis.grund}`)
        uebersprungen.push(`${e.id} (${ergebnis.grund})`)
        continue
      }
      // Als Dokument bearbeiten, damit Kommentare und Reihenfolge in der Datei erhalten bleiben.
      const dok = parseDocument(fs.readFileSync(datei, 'utf8'))
      dok.setIn(['bahn'], ergebnis.bahn)
      fs.writeFileSync(datei, dok.toString({ lineWidth: 0 }))
      ok++
      console.log(`  ${e.id}: ${ergebnis.bahn.name} (${ergebnis.bahn.extId}, ${ergebnis.abstandKm.toFixed(2)} km, Suche "${ergebnis.variante}")`)
    } catch (err) {
      console.warn(`  ${e.id}: FEHLER ${(err as Error).message}`)
      uebersprungen.push(`${e.id} (Fehler: ${(err as Error).message})`)
    }
  }
  return { ok, uebersprungen }
}

async function main() {
  const i = ladeInhalt(wurzel)
  const filter = (e: Eintrag) => (nur ? e.id === nur : alle || !e.bahn)
  const startorte = i.startorte.filter(filter)
  const haltestellen = i.haltestellen.filter(filter)
  if (nur && startorte.length + haltestellen.length === 0) throw new Error(`"${nur}" nicht gefunden`)
  console.log(`bahn.de-IDs für ${startorte.length} Startorte und ${haltestellen.length} Haltestellen${alle ? ' (--alle)' : ''}`)

  console.log('Startorte:')
  const s = await bearbeite('startorte', startorte)
  console.log('Haltestellen:')
  const h = await bearbeite('haltestellen', haltestellen)

  console.log(`\nFertig: ${s.ok}/${startorte.length} Startorte, ${h.ok}/${haltestellen.length} Haltestellen mit bahn-Feld.`)
  const offen = [...s.uebersprungen, ...h.uebersprungen]
  if (offen.length > 0) console.warn(`Ohne bahn-Feld (${offen.length}):\n  ${offen.join('\n  ')}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
