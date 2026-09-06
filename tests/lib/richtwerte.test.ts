import { describe, it, expect } from 'vitest'
import fixture from '../fixtures/itineraries-kandersteg.json'
import { taktAus, richtwertAus, haversineKm } from '@/lib/richtwerte'
import type { Itinerary } from '@/lib/verbindung/transitous'

const its = fixture as Itinerary[]
const tickets = { regeln: [{ land: 'CH' as const, ticket: 'halbtax' as const, hinweis: 'Ab Basel' }], fernverkehrHinweis: 'Fernverkehr' }

describe('taktAus', () => {
  it('zählt verschiedene Abfahrten 6 bis 12 Uhr lokal', () => {
    // Fixture: 04:40 (vor dem Fenster), 06:30, 07:12, 08:30, 09:30 lokal -> 4 -> zweistuendlich
    expect(taktAus(its)).toBe('zweistuendlich')
    expect(taktAus([...its, { ...its[4], startTime: '2026-09-12T08:30:00Z' }])).toBe('stuendlich')
    expect(taktAus(its.slice(0, 2))).toBe('unregelmaessig')
  })
  it('zählt doppelte Abfahrtszeiten nur einmal', () => {
    expect(taktAus([...its, ...its])).toBe('zweistuendlich')
  })
})

describe('richtwertAus', () => {
  it('nimmt die gewählte Hinfahrt', () => {
    const r = richtwertAus(its, 'CH', tickets, '2026-09-06')
    expect(r).toMatchObject({ fahrzeitMin: 250, umstiege: 1, takt: 'zweistuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' })
  })
  it('undefined ohne Hinfahrt im Fenster', () => {
    expect(richtwertAus([its[0]], 'CH', { regeln: [], fernverkehrHinweis: '' }, '2026-09-06')).toBeUndefined()
  })
  it('in Deutschland mit Fernverkehr kein Deutschlandticket', () => {
    const de = { regeln: [{ land: 'DE' as const, ticket: 'deutschlandticket' as const, hinweis: 'Nahverkehr' }], fernverkehrHinweis: 'Fernverkehr' }
    expect(richtwertAus(its, 'DE', de, '2026-09-06')?.ticket).toBe('keins')
  })
})

describe('haversineKm', () => {
  it('Offenburg–Kandersteg etwa 221 km Luftlinie', () => {
    expect(haversineKm(48.476, 7.946, 46.495, 7.671)).toBeCloseTo(221, 0)
  })
  it('gleicher Punkt ist 0 km', () => {
    expect(haversineKm(48.476, 7.946, 48.476, 7.946)).toBe(0)
  })
})
