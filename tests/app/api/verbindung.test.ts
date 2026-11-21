import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { GET } from '@/app/api/verbindung/route'
import { verbindungErmitteln, type VerbindungAntwort } from '@/lib/verbindung/service'

const richtwertAntwort: VerbindungAntwort = {
  quelle: 'richtwert', datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', naechte: 0,
  ticket: { ticket: 'halbtax', hinweis: 'CH' }, fehler: 'Test',
}
const liveAntwort: VerbindungAntwort = {
  quelle: 'live', datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', naechte: 0, ticket: { ticket: 'halbtax', hinweis: 'CH' },
}

vi.mock('@/lib/verbindung/service', () => ({ verbindungErmitteln: vi.fn() }))

beforeEach(() => { vi.mocked(verbindungErmitteln).mockReset(); vi.mocked(verbindungErmitteln).mockResolvedValue(richtwertAntwort) })

describe('parseVerbindungParameter', () => {
  it('liest Orte und Datum, rueck fehlt: Rückfahrt am Hin-Datum', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(p).toEqual({ ok: true, wert: { von: 'offenburg', nach: 'kandersteg', datum: '2026-09-12', rueck: '2026-09-12' } })
  })
  it('akzeptiert rueck und ignoriert fenster', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&rueck=2026-09-13&fenster=10'))
    expect(p).toEqual({ ok: true, wert: { von: 'offenburg', nach: 'kandersteg', datum: '2026-09-12', rueck: '2026-09-13' } })
  })
  it('lehnt rueck vor datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&rueck=2026-09-11'))
    expect(p.ok).toBe(false)
    expect(!p.ok && p.fehler).toMatch(/rueck/)
  })
  it('lehnt ein ungültiges rueck ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&rueck=13.09.2026'))
    expect(p.ok).toBe(false)
  })
  it('lehnt falsches Datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=12.09.2026'))
    expect(p.ok).toBe(false)
  })
  it('lehnt ein kalendarisch ungültiges Datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-99-99'))
    expect(p.ok).toBe(false)
  })
})

describe('GET /api/verbindung', () => {
  it('antwortet 400 bei fehlendem Parameter', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&datum=2026-09-12'))
    expect(r.status).toBe(400)
    expect((await r.json()).fehler).toMatch(/nach/)
  })
  it('antwortet 400 bei rueck vor datum', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12&rueck=2026-09-11'))
    expect(r.status).toBe(400)
    expect((await r.json()).fehler).toMatch(/rueck/)
  })
  it('reicht datum und rueck im Zeitfenster an den Dienst durch', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-11&rueck=2026-09-13'))
    expect(r.status).toBe(200)
    expect(vi.mocked(verbindungErmitteln).mock.calls[0][0].z).toMatchObject({ datum: '2026-09-11', rueck: '2026-09-13' })
  })
  it('setzt rueck ohne Angabe auf das Datum, Zeiten auf die Vorgaben', async () => {
    await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(vi.mocked(verbindungErmitteln).mock.calls[0][0].z).toEqual({ datum: '2026-09-12', rueck: '2026-09-12', abMin: 360, bisMin: 1260, vorOrtMin: 240 })
  })
  it('ignoriert fenster und liest ab, bis und vorort', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12&fenster=360&ab=07:00&bis=20:00&vorort=300'))
    expect(r.status).toBe(200)
    const anfrage = vi.mocked(verbindungErmitteln).mock.calls[0][0]
    expect(anfrage.z).toEqual({ datum: '2026-09-12', rueck: '2026-09-12', abMin: 420, bisMin: 1200, vorOrtMin: 300 })
    expect(anfrage).not.toHaveProperty('mindestFensterMin')
  })
  it('nimmt bei ungültigen Zeiten die Vorgaben statt 400', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12&ab=xx&bis=99:99&vorort=-5&fenster=10'))
    expect(r.status).toBe(200)
    expect(vi.mocked(verbindungErmitteln).mock.calls[0][0].z).toMatchObject({ abMin: 360, bisMin: 1260, vorOrtMin: 240 })
  })
  it('hebt rueck mit mindestnaechte=1 auf den Folgetag', async () => {
    await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12&mindestnaechte=1'))
    expect(vi.mocked(verbindungErmitteln).mock.calls[0][0].z).toMatchObject({ datum: '2026-09-12', rueck: '2026-09-13' })
  })
  it('behält ein vergangenes Datum (der Dienst meldet es)', async () => {
    await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2020-01-04'))
    expect(vi.mocked(verbindungErmitteln).mock.calls[0][0].z).toMatchObject({ datum: '2020-01-04', rueck: '2020-01-04' })
  })
  it('antwortet 404 bei unbekannter Haltestelle', async () => {
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=nirgendwo&datum=2026-09-12'))
    expect(r.status).toBe(404)
  })
  it('speichert Live-Antworten einen Tag', async () => {
    vi.mocked(verbindungErmitteln).mockResolvedValue(liveAntwort)
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(r.status).toBe(200)
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=86400, stale-while-revalidate=3600')
    expect((await r.json()).quelle).toBe('live')
  })
  it('speichert Richtwert-Antworten nur fünf Minuten', async () => {
    vi.mocked(verbindungErmitteln).mockResolvedValue({ ...richtwertAntwort, fehler: undefined, fehlerArt: 'fahrplan_noch_nicht_verfuegbar' })
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=300')
  })
  it('speichert Live-Antworten mit Fehler nur fünf Minuten', async () => {
    vi.mocked(verbindungErmitteln).mockResolvedValue({ ...liveAntwort, fehler: 'Transitous HTTP 503' })
    const r = await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(r.headers.get('Cache-Control')).toBe('public, s-maxage=300')
  })
  it('gibt heute (Europe/Berlin) und die Fahrplangrenze an den Dienst', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-19T23:30:00Z')) // in Berlin schon der 20.
    try {
      await GET(new Request('http://x/api/verbindung?von=offenburg&nach=kandersteg&datum=2026-11-21'))
    } finally { vi.useRealTimers() }
    const anfrage = vi.mocked(verbindungErmitteln).mock.calls[0][0]
    expect(anfrage.heute).toBe('2026-11-20')
    expect(anfrage.fahrplan?.liveBis).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
