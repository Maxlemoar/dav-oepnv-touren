import { describe, it, expect, vi } from 'vitest'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { GET } from '@/app/api/verbindung/route'
import type { VerbindungAntwort } from '@/lib/verbindung/service'

vi.mock('@/lib/verbindung/service', () => ({
  verbindungErmitteln: vi.fn(async (): Promise<VerbindungAntwort> => ({
    quelle: 'richtwert', datum: '2026-09-12', rueckfahrtDatum: '2026-09-12',
    ticket: { ticket: 'halbtax', hinweis: 'CH' }, fehler: 'Test',
  })),
}))

describe('parseVerbindungParameter', () => {
  it('liest gültige Parameter mit Standardwerten', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(p).toEqual({ ok: true, wert: { von: 'offenburg', nach: 'kandersteg', datum: '2026-09-12', rueckfahrt: 'gleicher-tag', fenster: 360 } })
  })
  it('akzeptiert folgetag und fenster', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&rueckfahrt=folgetag&fenster=240'))
    expect(p.ok && p.wert.rueckfahrt).toBe('folgetag')
    expect(p.ok && p.wert.fenster).toBe(240)
  })
  it('lehnt falsches Datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=12.09.2026'))
    expect(p.ok).toBe(false)
  })
  it('lehnt ein kalendarisch ungültiges Datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-99-99'))
    expect(p.ok).toBe(false)
  })
  it('lehnt Fenster außerhalb 60 bis 720 ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&fenster=10'))
    expect(p.ok).toBe(false)
  })
})

describe('GET /api/verbindung', () => {
  it('antwortet 400 bei fehlendem Parameter', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&datum=2026-09-12'))
    expect(r.status).toBe(400)
    expect((await r.json()).fehler).toMatch(/nach/)
  })
  it('antwortet 404 bei unbekannter Haltestelle', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=nirgendwo&datum=2026-09-12'))
    expect(r.status).toBe(404)
  })
  it('setzt CDN-Cache-Header bei Erfolg', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(r.status).toBe(200)
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=86400, stale-while-revalidate=3600')
    expect((await r.json()).quelle).toBe('richtwert')
  })
})
