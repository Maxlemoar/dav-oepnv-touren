import { describe, it, expect, vi } from 'vitest'
import { planen, TransitousFehler } from '@/lib/verbindung/transitous'

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
})
