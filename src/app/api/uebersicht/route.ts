import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln, type VerbindungAntwort } from '@/lib/verbindung/service'

const PARALLEL = 4

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  q.set('nach', 'alle')
  const p = parseVerbindungParameter(q)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  if (!startort) return NextResponse.json({ fehler: 'Startort unbekannt' }, { status: 404 })

  const ergebnis: Record<string, VerbindungAntwort> = {}
  const warteschlange = [...i.gebiete]
  const arbeiter = async () => {
    for (let g = warteschlange.shift(); g; g = warteschlange.shift()) {
      const haltestelle = findeHaltestelle(i, g.haltestellen[0])
      if (!haltestelle) continue
      ergebnis[g.id] = await verbindungErmitteln({
        startort, haltestelle, datum: p.wert.datum, rueckfahrt: 'gleicher-tag',
        mindestFensterMin: p.wert.fenster, tickets: i.tickets,
      })
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, arbeiter))
  return NextResponse.json(ergebnis, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
