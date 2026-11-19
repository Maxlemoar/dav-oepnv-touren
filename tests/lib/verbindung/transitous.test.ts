import { describe, it, expect, vi } from 'vitest'
import { planen, planUrl, TransitousFehler, dienstNichtErreichbar, istUnbekannterOrt } from '@/lib/verbindung/transitous'

const antwort = {
  itineraries: [{
    startTime: '2026-09-12T04:30:00Z', endTime: '2026-09-12T08:40:00Z', duration: 15000, transfers: 1,
    legs: [
      { mode: 'HIGHSPEED_RAIL', from: { name: 'Offenburg' }, to: { name: 'Bern' }, startTime: '2026-09-12T04:30:00Z', endTime: '2026-09-12T06:56:00Z', routeShortName: 'ICE 271', agencyName: 'DB Fernverkehr AG' },
      { mode: 'WALK', from: { name: 'Bern' }, to: { name: 'Bern' }, startTime: '2026-09-12T06:56:00Z', endTime: '2026-09-12T06:58:00Z' },
      { mode: 'REGIONAL_RAIL', from: { name: 'Bern' }, to: { name: 'Kandersteg' }, startTime: '2026-09-12T07:39:00Z', endTime: '2026-09-12T08:40:00Z', routeShortName: 'RE1', agencyName: 'BLS AG' },
    ],
  }],
}

function fetchMock(status: number, body: unknown) {
  return vi.fn(async (url: string, init?: RequestInit) => ({
    ok: status >= 200 && status < 300, status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    _url: url, _init: init,
  })) as unknown as typeof fetch
}

describe('planen', () => {
  it('baut die URL und setzt User-Agent und Cache', async () => {
    const f = fetchMock(200, antwort)
    const its = await planen({ von: 'a:1', nach: 'b:2', zeit: '2026-09-12T03:00:00Z', ankunftBis: false, anzahl: 5 }, f)
    expect(its).toHaveLength(1)
    expect(its[0].transfers).toBe(1)
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit & { next?: { revalidate: number } }][] } }).mock.calls[0]
    expect(url).toBe('https://api.transitous.org/api/v1/plan?fromPlace=a%3A1&toPlace=b%3A2&time=2026-09-12T03%3A00%3A00Z&arriveBy=false&numItineraries=5&language=de')
    expect((init.headers as Record<string, string>)['User-Agent']).toMatch(/dav-oepnv-touren/)
    expect(init.next?.revalidate).toBe(86400)
  })
  it('wirft TransitousFehler bei HTTP-Fehler', async () => {
    await expect(planen({ von: 'a', nach: 'b', zeit: '2026-09-12T03:00:00Z' }, fetchMock(503, { error: 'x' })))
      .rejects.toBeInstanceOf(TransitousFehler)
  })
  it('wirft TransitousFehler bei fehlendem itineraries-Feld', async () => {
    await expect(planen({ von: 'a', nach: 'b', zeit: '2026-09-12T03:00:00Z' }, fetchMock(200, { error: 'unknown feed id' })))
      .rejects.toBeInstanceOf(TransitousFehler)
  })
  it('wirft TransitousFehler mit Netz-Kennung, wenn fetch scheitert', async () => {
    const f = vi.fn(async () => { throw new Error('timeout') }) as unknown as typeof fetch
    const e = await planen({ von: 'a', nach: 'b', zeit: '2026-09-12T03:00:00Z' }, f).catch((x) => x)
    expect(e).toBeInstanceOf(TransitousFehler)
    expect(dienstNichtErreichbar(e)).toBe(true)
  })
})

/** fetch-Mock mit einer Antwort je Aufruf. */
function fetchFolge(...antworten: [number, unknown][]) {
  let n = 0
  return vi.fn(async () => {
    const [status, body] = antworten[Math.min(n++, antworten.length - 1)]
    return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) }
  }) as unknown as typeof fetch & { mock: { calls: [string][] } }
}

const koord = { vonKoord: { lat: 48.476475, lon: 7.946723 }, nachKoord: { lat: 46.495396, lon: 7.671415 } }
const basis = { von: 'de:og', nach: 'ch-opentransportdataswiss26_x', zeit: '2026-12-19T04:00:00Z' }

describe('planen mit Koordinaten-Ausweg', () => {
  it('wiederholt nach HTTP 404 einmal mit lat,lon', async () => {
    const f = fetchFolge([404, { error: 'not found' }], [200, antwort])
    const its = await planen({ ...basis, ...koord }, f)
    expect(its).toHaveLength(1)
    expect(f.mock.calls).toHaveLength(2)
    const zweite = new URL(f.mock.calls[1][0])
    expect(zweite.searchParams.get('fromPlace')).toBe('48.476475,7.946723')
    expect(zweite.searchParams.get('toPlace')).toBe('46.495396,7.671415')
  })
  it('wiederholt bei einem Fehler zu unbekanntem Ort', async () => {
    const f = fetchFolge([400, { error: 'unknown stop id ch-opentransportdataswiss26_x' }], [200, antwort])
    await expect(planen({ ...basis, ...koord }, f)).resolves.toHaveLength(1)
    expect(f.mock.calls).toHaveLength(2)
  })
  it('wiederholt auch bei 200 mit Fehlermeldung zu unbekanntem Ort', async () => {
    const f = fetchFolge([200, { error: 'location not found' }], [200, antwort])
    await expect(planen({ ...basis, ...koord }, f)).resolves.toHaveLength(1)
  })
  it('wiederholt höchstens einmal', async () => {
    const f = fetchFolge([404, {}], [404, {}])
    const e = await planen({ ...basis, ...koord }, f).catch((x) => x)
    expect(e).toBeInstanceOf(TransitousFehler)
    expect(e.status).toBe(404)
    expect(f.mock.calls).toHaveLength(2)
  })
  it('ohne Koordinaten kein zweiter Versuch', async () => {
    const f = fetchFolge([404, {}], [200, antwort])
    await expect(planen(basis, f)).rejects.toBeInstanceOf(TransitousFehler)
    expect(f.mock.calls).toHaveLength(1)
  })
  it('bei Überlast kein Koordinaten-Versuch', async () => {
    const f = fetchFolge([429, {}], [200, antwort])
    const e = await planen({ ...basis, ...koord }, f).catch((x) => x)
    expect(e.status).toBe(429)
    expect(dienstNichtErreichbar(e)).toBe(true)
    expect(f.mock.calls).toHaveLength(1)
  })
})

describe('planUrl', () => {
  it('setzt Koordinaten nur, wenn verlangt und vorhanden', () => {
    expect(new URL(planUrl({ ...basis, ...koord })).searchParams.get('fromPlace')).toBe('de:og')
    const u = new URL(planUrl({ ...basis, nachKoord: koord.nachKoord }, true))
    expect(u.searchParams.get('fromPlace')).toBe('de:og')
    expect(u.searchParams.get('toPlace')).toBe('46.495396,7.671415')
  })
})

describe('istUnbekannterOrt und dienstNichtErreichbar', () => {
  it('erkennt 404 und Meldungen zu unbekannten Orten', () => {
    expect(istUnbekannterOrt(404, '')).toBe(true)
    expect(istUnbekannterOrt(400, '{"error":"unknown stop"}')).toBe(true)
    expect(istUnbekannterOrt(400, '{"error":"bad time"}')).toBe(false)
    expect(istUnbekannterOrt(429, 'not found')).toBe(false)
    expect(istUnbekannterOrt(503, '')).toBe(false)
  })
  it('Überlast, Serverfehler und Netzfehler gelten als nicht erreichbar', () => {
    expect(dienstNichtErreichbar(new TransitousFehler('x', 429))).toBe(true)
    expect(dienstNichtErreichbar(new TransitousFehler('x', 502))).toBe(true)
    expect(dienstNichtErreichbar(new TransitousFehler('x', 404))).toBe(false)
    expect(dienstNichtErreichbar(new TransitousFehler('x'))).toBe(false)
    expect(dienstNichtErreichbar(new TypeError('fetch failed'))).toBe(true)
  })
})
