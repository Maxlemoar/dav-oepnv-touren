import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln } from '@/lib/verbindung/service'

export async function GET(req: Request) {
  const p = parseVerbindungParameter(new URL(req.url).searchParams)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  const haltestelle = findeHaltestelle(i, p.wert.nach)
  if (!startort || !haltestelle) return NextResponse.json({ fehler: 'Startort oder Haltestelle unbekannt' }, { status: 404 })
  const antwort = await verbindungErmitteln({
    startort, haltestelle, datum: p.wert.datum, rueckfahrt: p.wert.rueckfahrt,
    mindestFensterMin: p.wert.fenster, tickets: i.tickets,
  })
  return NextResponse.json(antwort, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
