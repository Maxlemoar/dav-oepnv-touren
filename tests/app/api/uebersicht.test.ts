import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseUebersichtParameter } from '@/lib/verbindung/parameter'
import { GET } from '@/app/api/uebersicht/route'
import type { UebersichtEintrag } from '@/lib/verbindung/uebersicht'

afterEach(() => { vi.restoreAllMocks() })

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
  it('liefert alle Gebiete aus den Tagesfenstern, ohne eine Anfrage an Transitous', async () => {
    const f = vi.spyOn(globalThis, 'fetch')
    const r = await GET(new Request('http://x/api/uebersicht?von=offenburg&datum=2026-11-21'))
    expect(r.status).toBe(200)
    expect(f).not.toHaveBeenCalled()
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=3600')
    const d = (await r.json()) as Record<string, UebersichtEintrag>
    expect(Object.keys(d).length).toBeGreaterThan(4)
    expect(d.kandersteg).toMatchObject({ naechte: 0, quelle: 'tagesfenster' })
  })
  it('mehrtägig ohne Urteil', async () => {
    const r = await GET(new Request('http://x/api/uebersicht?von=offenburg&datum=2026-11-21&rueck=2026-11-22'))
    const d = (await r.json()) as Record<string, UebersichtEintrag>
    for (const e of Object.values(d)) {
      expect(e.naechte).toBe(1)
      expect(e.tagesziel).toBeUndefined()
    }
  })
})
