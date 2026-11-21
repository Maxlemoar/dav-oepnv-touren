import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { lokalesDatum } from '@/lib/datum'
import { ladeFahrplan } from '@/lib/verbindung/fahrplan'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln, type VerbindungAntwort } from '@/lib/verbindung/service'
import { zeitfensterAusUrl } from '@/lib/zeitfenster'

const CACHE_LIVE = 'public, s-maxage=86400, stale-while-revalidate=3600'
/** Fehlschläge und Richtwerte nur kurz speichern, damit die nächste Anfrage es live erneut versucht. */
const CACHE_KURZ = 'public, s-maxage=300'

function cacheControlFuer(a: Pick<VerbindungAntwort, 'quelle' | 'fehler'>): string {
  return a.fehler || a.quelle === 'richtwert' ? CACHE_KURZ : CACHE_LIVE
}

/**
 * von, nach, datum und rueck werden geprüft (400 bei Fehlern). ab, bis und vorort liest zeitfensterAusUrl; Ungültiges
 * wird zur Vorgabe, nie zu 400. Das alte `fenster` wird ignoriert. `mindestnaechte=1` (Hüttenseiten) hebt rueck
 * mindestens auf den Folgetag.
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const p = parseVerbindungParameter(sp)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  const haltestelle = findeHaltestelle(i, p.wert.nach)
  if (!startort || !haltestelle) return NextResponse.json({ fehler: 'Startort oder Haltestelle unbekannt' }, { status: 404 })

  const mindestNaechte = sp.get('mindestnaechte') === '1' ? 1 : 0
  // Mit heute = datum übernimmt zeitfensterAusUrl das geprüfte Datum auch dann, wenn es schon vorbei ist;
  // vergangene Daten meldet der Dienst selbst (datum_vergangen).
  const { datum, rueck, abMin, bisMin, vorOrtMin } = zeitfensterAusUrl(sp, { mindestNaechte, heute: p.wert.datum })
  const antwort = await verbindungErmitteln({
    startort, haltestelle, z: { datum, rueck, abMin, bisMin, vorOrtMin }, tickets: i.tickets,
    heute: lokalesDatum(new Date()), fahrplan: ladeFahrplan(),
  })
  return NextResponse.json(antwort, { headers: { 'Cache-Control': cacheControlFuer(antwort) } })
}
