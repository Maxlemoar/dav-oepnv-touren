import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { lokalesDatum } from '@/lib/datum'
import { tagesklasse } from '@/lib/saison'
import { zeitfensterAusUrl } from '@/lib/zeitfenster'
import { ladeMusterfahrplan } from '@/lib/musterfahrplan/laden'
import { ladeFahrplan } from '@/lib/verbindung/fahrplan'
import { parseFahrtenParameter } from '@/lib/verbindung/parameter'
import { fahrtenErmitteln, weitereFahrten, type FahrtenAntwort } from '@/lib/verbindung/fahrten'

const CACHE_LIVE = 'public, s-maxage=86400, stale-while-revalidate=3600'
/** Typische Zeiten und Fehlschläge nur kurz speichern, damit die nächste Anfrage es live erneut versucht. */
const CACHE_KURZ = 'public, s-maxage=300'

function cacheControlFuer(a: Pick<FahrtenAntwort, 'quelle' | 'fehlerArt' | 'hinweis'>): string {
  return a.quelle === 'typisch' || a.fehlerArt || a.hinweis ? CACHE_KURZ : CACHE_LIVE
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const p = parseFahrtenParameter(sp)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  const haltestelle = findeHaltestelle(i, p.wert.nach)
  if (!startort || !haltestelle) return NextResponse.json({ fehler: 'Startort oder Haltestelle unbekannt' }, { status: 404 })

  // Ungültige Werte werden zu Vorgaben, nie zu 400.
  const { datum, rueck, abMin, bisMin, vorOrtMin } = zeitfensterAusUrl(sp, { mindestNaechte: 0 })
  const z = { datum, rueck, abMin, bisMin, vorOrtMin }

  if (p.wert.weiter && p.wert.zeit) {
    try {
      const fahrten = await weitereFahrten({ startort, haltestelle, richtung: p.wert.weiter, zeitIso: p.wert.zeit, z })
      return NextResponse.json({ fahrten }, { headers: { 'Cache-Control': CACHE_LIVE } })
    } catch (e) {
      return NextResponse.json({ fehler: (e as Error).message }, { status: 502, headers: { 'Cache-Control': CACHE_KURZ } })
    }
  }

  // Der Musterfahrplan gilt nur für seinen Startort.
  const muster = ladeMusterfahrplan()
  const plaene = muster?.startortId === startort.id ? muster.orte[haltestelle.haltestelleId]?.plaene : undefined
  const antwort = await fahrtenErmitteln({
    startort, haltestelle, z, tickets: i.tickets,
    muster: { hin: plaene?.[tagesklasse(datum)]?.hin, rueck: plaene?.[tagesklasse(rueck)]?.rueck },
    heute: lokalesDatum(new Date()), fahrplan: ladeFahrplan(),
  })
  return NextResponse.json(antwort, { headers: { 'Cache-Control': cacheControlFuer(antwort) } })
}
