import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseUebersichtParameter } from '@/lib/verbindung/parameter'
import { GET } from '@/app/api/uebersicht/route'
import type { VerbindungAnfrage, VerbindungAntwort } from '@/lib/verbindung/service'

const antwort: VerbindungAntwort = {
  quelle: 'richtwert', datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', naechte: 0,
  ticket: { ticket: 'halbtax', hinweis: 'CH' }, fehler: 'Test',
}
const ermitteln = vi.fn<(a?: VerbindungAnfrage) => Promise<VerbindungAntwort>>(async () => antwort)
vi.mock('@/lib/verbindung/service', () => ({ verbindungErmitteln: (a: VerbindungAnfrage) => ermitteln(a) }))

afterEach(() => { vi.useRealTimers(); ermitteln.mockReset(); ermitteln.mockImplementation(async () => antwort) })

describe('parseUebersichtParameter', () => {
  it('liest von, datum, fenster mit Standardwert', () => {
    const p = parseUebersichtParameter(new URLSearchParams('von=offenburg&datum=2026-09-12'))
    expect(p).toEqual({ ok: true, wert: { von: 'offenburg', datum: '2026-09-12', rueck: '2026-09-12', fenster: 360 } })
  })
  it('liest rueck und lehnt rueck vor datum ab', () => {
    const p = parseUebersichtParameter(new URLSearchParams('von=offenburg&datum=2026-09-12&rueck=2026-09-13'))
    expect(p.ok && p.wert.rueck).toBe('2026-09-13')
    expect(parseUebersichtParameter(new URLSearchParams('von=offenburg&datum=2026-09-12&rueck=2026-09-11')).ok).toBe(false)
  })
  it('braucht kein nach', () => {
    const p = parseUebersichtParameter(new URLSearchParams('von=offenburg&datum=2026-09-12&fenster=240'))
    expect(p.ok && p.wert.fenster).toBe(240)
  })
  it('lehnt fehlendes von und ungültiges Datum ab', () => {
    expect(parseUebersichtParameter(new URLSearchParams('datum=2026-09-12')).ok).toBe(false)
    expect(parseUebersichtParameter(new URLSearchParams('von=offenburg&datum=2026-99-99')).ok).toBe(false)
  })
})

describe('GET /api/uebersicht', () => {
  it('antwortet 400 ohne von', async () => {
    const r = await GET(new Request('http://x/api/uebersicht?datum=2026-09-12'))
    expect(r.status).toBe(400)
  })
  it('antwortet 404 bei unbekanntem Startort', async () => {
    const r = await GET(new Request('http://x/api/uebersicht?von=nirgendwo&datum=2026-09-12'))
    expect(r.status).toBe(404)
  })
  it('liefert alle Gebiete mit CDN-Cache-Header', async () => {
    const r = await GET(new Request('http://x/api/uebersicht?von=offenburg&datum=2026-09-12'))
    expect(r.status).toBe(200)
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=86400, stale-while-revalidate=3600')
    expect(r.headers.get('X-Unvollstaendig')).toBeNull()
    const d = (await r.json()) as Record<string, VerbindungAntwort>
    expect(Object.keys(d).length).toBeGreaterThan(4)
    expect(d.kandersteg.quelle).toBe('richtwert')
  })
  it('reicht rueck als rueckfahrtDatum an jedes Gebiet durch', async () => {
    const r = await GET(new Request('http://x/api/uebersicht?von=offenburg&datum=2026-09-12&rueck=2026-09-13'))
    expect(r.status).toBe(200)
    expect(ermitteln.mock.calls.length).toBeGreaterThan(0)
    for (const [a] of ermitteln.mock.calls) expect(a).toMatchObject({ datum: '2026-09-12', rueckfahrtDatum: '2026-09-13' })
  })
  it('bricht nach der Gesamt-Deadline keine neuen Gebiete mehr an', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-06T10:00:00Z'))
    // Jede Abfrage lässt die Uhr um 20 s vorrücken: nach der ersten Runde ist die Deadline von 45 s überschritten.
    ermitteln.mockImplementation(async () => { vi.setSystemTime(Date.now() + 20_000); return antwort })
    const r = await GET(new Request('http://x/api/uebersicht?von=offenburg&datum=2026-09-12'))
    expect(r.status).toBe(200)
    expect(r.headers.get('X-Unvollstaendig')).toBe('1')
    const d = (await r.json()) as Record<string, VerbindungAntwort>
    expect(Object.keys(d).length).toBeLessThan(7)
    expect(Object.keys(d).length).toBeGreaterThan(0)
  })
})
