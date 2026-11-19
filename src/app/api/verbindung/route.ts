import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { lokalesDatum } from '@/lib/datum'
import { ladeFahrplan } from '@/lib/verbindung/fahrplan'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln, type VerbindungAntwort } from '@/lib/verbindung/service'

const CACHE_LIVE = 'public, s-maxage=86400, stale-while-revalidate=3600'
/** Fehlschläge und Richtwerte nur kurz speichern, damit die nächste Anfrage es live erneut versucht. */
const CACHE_KURZ = 'public, s-maxage=300'

function cacheControlFuer(a: Pick<VerbindungAntwort, 'quelle' | 'fehler'>): string {
  return a.fehler || a.quelle === 'richtwert' ? CACHE_KURZ : CACHE_LIVE
}

export async function GET(req: Request) {
  const p = parseVerbindungParameter(new URL(req.url).searchParams)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  const haltestelle = findeHaltestelle(i, p.wert.nach)
  if (!startort || !haltestelle) return NextResponse.json({ fehler: 'Startort oder Haltestelle unbekannt' }, { status: 404 })
  const antwort = await verbindungErmitteln({
    startort, haltestelle, datum: p.wert.datum, rueckfahrtDatum: p.wert.rueck,
    mindestFensterMin: p.wert.fenster, tickets: i.tickets,
    heute: lokalesDatum(new Date()), fahrplan: ladeFahrplan(),
  })
  return NextResponse.json(antwort, { headers: { 'Cache-Control': cacheControlFuer(antwort) } })
}
