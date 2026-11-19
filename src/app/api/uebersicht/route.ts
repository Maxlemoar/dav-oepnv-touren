import { NextResponse } from 'next/server'
import { inhalt, findeStartort } from '@/lib/content/laden'
import { parseUebersichtParameter } from '@/lib/verbindung/parameter'
import { uebersichtBerechnen } from '@/lib/verbindung/uebersicht'

/** Rein aus den Inhalten berechnet, keine Live-Abfragen; eine Stunde reicht, damit neue Inhalte bald greifen. */
const CACHE_CONTROL = 'public, s-maxage=3600'

export async function GET(req: Request) {
  const p = parseUebersichtParameter(new URL(req.url).searchParams)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  if (!startort) return NextResponse.json({ fehler: 'Startort unbekannt' }, { status: 404 })
  return NextResponse.json(uebersichtBerechnen(i, startort, p.wert), { headers: { 'Cache-Control': CACHE_CONTROL } })
}
