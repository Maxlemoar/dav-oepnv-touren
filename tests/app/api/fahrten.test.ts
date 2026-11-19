import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/fahrten/route'
import { fahrtenErmitteln, weitereFahrten, type FahrtenAntwort } from '@/lib/verbindung/fahrten'

vi.mock('@/lib/verbindung/fahrten', () => ({ fahrtenErmitteln: vi.fn(), weitereFahrten: vi.fn() }))

const live: FahrtenAntwort = { quelle: 'live', datum: '2026-09-12', rueck: '2026-09-12', hin: [], rueckfahrten: [], ticket: { ticket: 'halbtax', hinweis: 'CH' } }

beforeEach(() => {
  vi.mocked(fahrtenErmitteln).mockReset().mockResolvedValue(live)
  vi.mocked(weitereFahrten).mockReset().mockResolvedValue([])
})

describe('GET /api/fahrten', () => {
  it('antwortet nur mit von und nach mit den Vorgaben', async () => {
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=kandersteg'))
    expect(r.status).toBe(200)
    const z = vi.mocked(fahrtenErmitteln).mock.calls[0][0].z
    expect(new Date(`${z.datum}T12:00:00Z`).getUTCDay()).toBe(6)
    expect(z).toMatchObject({ abMin: 360, bisMin: 1260 })
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=86400, stale-while-revalidate=3600')
  })
  it('nimmt bei ungültigem ab die Vorgabe statt 400', async () => {
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=kandersteg&ab=xx'))
    expect(r.status).toBe(200)
    expect(vi.mocked(fahrtenErmitteln).mock.calls[0][0].z.abMin).toBe(360)
  })
  it('antwortet 404 bei unbekannter Haltestelle', async () => {
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=nirgendwo'))
    expect(r.status).toBe(404)
  })
  it('antwortet 400 bei ungültigem von', async () => {
    const r = await GET(new Request('http://x/api/fahrten?von=Of%20x&nach=kandersteg'))
    expect(r.status).toBe(400)
  })
  it('speichert typische Antworten nur fünf Minuten', async () => {
    vi.mocked(fahrtenErmitteln).mockResolvedValue({ ...live, quelle: 'typisch' })
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=kandersteg'))
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=300')
  })
  it('liefert mit weiter und zeit weitere Fahrten', async () => {
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=kandersteg&weiter=hin&zeit=2026-09-12T05:12:00Z'))
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ fahrten: [] })
    expect(fahrtenErmitteln).not.toHaveBeenCalled()
    expect(vi.mocked(weitereFahrten).mock.calls[0][0]).toMatchObject({ richtung: 'hin', zeitIso: '2026-09-12T05:12:00Z' })
  })
  it('antwortet 400 bei weiter ohne gültige zeit', async () => {
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=kandersteg&weiter=hin'))
    expect(r.status).toBe(400)
  })
  it('antwortet bei fehlgeschlagenem Nachladen mit 502 und kurzem Cache', async () => {
    vi.mocked(weitereFahrten).mockRejectedValue(new Error('Transitous HTTP 503'))
    const r = await GET(new Request('http://x/api/fahrten?von=offenburg&nach=kandersteg&weiter=hin&zeit=2026-09-12T05:12:00Z'))
    expect(r.status).toBe(502)
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=300')
  })
})
