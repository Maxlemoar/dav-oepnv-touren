/**
 * Geduldiger Transitous-Abruf für Skripte (Richtwerte): per curl mit 45 s Wartezeit, bis zu drei
 * Wiederholungen bei Überlast, Serverfehler oder Zeitüberschreitung und Koordinaten-Ausweg bei
 * unbekannter Haltestellen-Kennung. Nicht in Seiten oder Routen verwenden (child_process).
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { planUrl, hatKoordinaten, istUnbekannterOrt, TransitousFehler, USER_AGENT, type Itinerary, type PlanParameter } from './transitous'

export type AbrufErgebnis = { status: number; body: string }
export type Abruf = (url: string) => Promise<AbrufErgebnis>

const MARKE = '\n__STATUS__'
const WARTEZEIT_S = 45
const WIEDERHOLUNGEN = 3

/** curl-Ausgabe mit angehängtem `-w '\n__STATUS__%{http_code}'` zerlegen; Status 0 = keine Antwort. */
export function curlAusgabeLesen(stdout: string): AbrufErgebnis {
  const idx = stdout.lastIndexOf(MARKE)
  if (idx < 0) return { status: 0, body: stdout }
  return { status: Number(stdout.slice(idx + MARKE.length)) || 0, body: stdout.slice(0, idx) }
}

const exec = promisify(execFile)

export const curlAbruf: Abruf = async (url) => {
  const { stdout } = await exec('curl', ['-s', '-m', String(WARTEZEIT_S), '-A', USER_AGENT, '-w', `${MARKE}%{http_code}`, url], { maxBuffer: 50_000_000 })
  return curlAusgabeLesen(stdout)
}

const schlafStandard = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const wiederholbar = (status: number) => status === 0 || status === 429 || status >= 500

export async function planenGeduldig(
  p: PlanParameter,
  opts: { abruf?: Abruf; schlaf?: (ms: number) => Promise<void> } = {},
): Promise<Itinerary[]> {
  const abruf = opts.abruf ?? curlAbruf
  const schlaf = opts.schlaf ?? schlafStandard
  let koordinaten = false
  let wiederholungen = 0
  for (;;) {
    let r: AbrufErgebnis
    try {
      r = await abruf(planUrl(p, koordinaten))
    } catch (e) {
      // curl beendet sich bei Zeitüberschreitung mit Fehlercode; das zählt wie keine Antwort.
      r = { status: 0, body: (e as Error).message }
    }
    let fehlertext = r.body
    if (r.status === 200) {
      let daten: { itineraries?: Itinerary[]; error?: string }
      try { daten = JSON.parse(r.body) } catch { throw new TransitousFehler('Transitous: Antwort ist kein JSON') }
      if (Array.isArray(daten.itineraries)) return daten.itineraries
      fehlertext = daten.error ?? 'keine itineraries'
    }
    if (!koordinaten && hatKoordinaten(p) && istUnbekannterOrt(r.status, fehlertext)) { koordinaten = true; continue }
    if (r.status === 200) throw new TransitousFehler(`Transitous: ${fehlertext}`)
    if (!wiederholbar(r.status) || wiederholungen >= WIEDERHOLUNGEN) {
      throw new TransitousFehler(r.status ? `Transitous HTTP ${r.status}` : `Transitous nicht erreichbar: ${fehlertext}`, r.status || undefined, r.status === 0)
    }
    wiederholungen++
    await schlaf(5000 * wiederholungen)
  }
}
