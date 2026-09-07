import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { parseUebersichtParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln, type VerbindungAntwort } from '@/lib/verbindung/service'

export const maxDuration = 60

const PARALLEL = 4
/** Nach dieser Zeit beginnen die Arbeiter keine neuen Gebiete mehr; die Antwort ist dann unvollständig. */
const DEADLINE_MS = 45_000
const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

export async function GET(req: Request) {
  const p = parseUebersichtParameter(new URL(req.url).searchParams)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  if (!startort) return NextResponse.json({ fehler: 'Startort unbekannt' }, { status: 404 })
  const { datum, rueck, fenster } = p.wert

  const start = Date.now()
  const ergebnis: Record<string, VerbindungAntwort> = {}
  const warteschlange = [...i.gebiete]
  const arbeiter = async () => {
    while (warteschlange.length && Date.now() - start < DEADLINE_MS) {
      const g = warteschlange.shift()!
      const haltestelle = findeHaltestelle(i, g.haltestellen[0])
      if (!haltestelle) continue
      ergebnis[g.id] = await verbindungErmitteln({
        startort, haltestelle, datum, rueckfahrtDatum: rueck, mindestFensterMin: fenster, tickets: i.tickets,
      })
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, arbeiter))

  const headers: Record<string, string> = { 'Cache-Control': CACHE_CONTROL }
  if (warteschlange.length) headers['X-Unvollstaendig'] = '1'
  return NextResponse.json(ergebnis, { headers })
}
