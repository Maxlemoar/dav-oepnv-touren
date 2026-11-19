import { describe, expect, it } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import type { Itinerary, Leg } from '@/lib/verbindung/transitous'
import {
  dekodierePolyline, fahrtAus, hinfahrtenAus, rueckfahrtenAus, streckeAus, vereinfache, viaAus,
} from '@/lib/musterfahrplan/erzeugen'

const leg = (mode: string, von: string, nach: string, start: string, ende: string, extra: Partial<Leg> = {}): Leg =>
  ({ mode, from: { name: von }, to: { name: nach }, startTime: start, endTime: ende, ...extra })

const it_ = (start: string, ende: string, transfers: number, legs: Leg[] = []): Itinerary =>
  ({ startTime: start, endTime: ende, duration: 0, transfers, legs })

describe('dekodierePolyline', () => {
  it('dekodiert den Google-Referenzvektor als [lon, lat]', () => {
    expect(dekodierePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5)).toEqual([
      [-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252],
    ])
  })
})

describe('vereinfache', () => {
  it('reduziert eine Gerade auf Anfang und Ende', () => {
    const linie: [number, number][] = Array.from({ length: 52 }, (_, i) => [8 + i * 0.01, 48 + i * 0.01])
    expect(vereinfache(linie)).toEqual([[8, 48], [8.51, 48.51]])
  })
})

describe('fahrtAus', () => {
  it('liefert lokale Uhrzeiten und Umstiege', () => {
    const f = fahrtAus((fixture as Itinerary[])[0])
    expect(f.ab).toBe('04:40')
    expect(f.an).toBe('09:10')
    expect(f.umstiege).toBe((fixture as Itinerary[])[0].transfers)
  })
})

describe('viaAus', () => {
  it('nennt Umsteigeorte ohne Fußweg und Wiederholung', () => {
    const t = '2026-09-12T05:00:00Z'
    const i = it_(t, t, 2, [
      leg('REGIONAL_RAIL', 'Offenburg', 'Basel', t, t),
      leg('WALK', 'Basel', 'Basel', t, t),
      leg('REGIONAL_RAIL', 'Basel', 'Bern', t, t),
      leg('REGIONAL_RAIL', 'Bern', 'Kandersteg', t, t),
    ])
    expect(viaAus(i)).toEqual(['Basel', 'Bern'])
  })
})

describe('hinfahrtenAus / rueckfahrtenAus', () => {
  it('verwirft Rückfahrten mit Ankunft nach Mitternacht', () => {
    const spaet = it_('2026-11-29T20:00:00Z', '2026-11-29T23:20:00Z', 1)
    const frueh = it_('2026-11-28T15:00:00Z', '2026-11-28T18:00:00Z', 1)
    expect(rueckfahrtenAus([spaet, frueh], '2026-11-28').map((f) => f.an)).toEqual(['19:00'])
  })

  it('behält bei gleicher (ab, an) die Fahrt mit weniger Umstiegen', () => {
    const a = it_('2026-11-28T05:00:00Z', '2026-11-28T09:00:00Z', 2)
    const b = it_('2026-11-28T05:00:00Z', '2026-11-28T09:00:00Z', 1)
    const r = hinfahrtenAus([a, b], '2026-11-28')
    expect(r).toHaveLength(1)
    expect(r[0].umstiege).toBe(1)
  })

  it('filtert nach Abfahrtsdatum und sortiert nach Abfahrt', () => {
    const x = it_('2026-11-28T07:00:00Z', '2026-11-28T10:00:00Z', 0)
    const y = it_('2026-11-28T05:00:00Z', '2026-11-28T09:00:00Z', 0)
    const z = it_('2026-11-29T05:00:00Z', '2026-11-29T09:00:00Z', 0)
    expect(hinfahrtenAus([x, y, z], '2026-11-28').map((f) => f.ab)).toEqual(['06:00', '08:00'])
  })
})

describe('streckeAus', () => {
  it('nimmt die schnellste Fahrt ab 06:00 und lässt Fußwege aus', () => {
    const geo = { points: '_p~iF~ps|U_ulLnnqC_mqNvxq`@', precision: 5 }
    const schnell = it_('2026-11-28T05:00:00Z', '2026-11-28T08:00:00Z', 0, [
      leg('WALK', 'A', 'B', '2026-11-28T05:00:00Z', '2026-11-28T05:05:00Z', { legGeometry: geo }),
      leg('BUS', 'B', 'C', '2026-11-28T05:05:00Z', '2026-11-28T08:00:00Z', { legGeometry: geo }),
    ])
    const langsam = it_('2026-11-28T05:30:00Z', '2026-11-28T10:00:00Z', 0, [
      leg('BUS', 'B', 'C', '2026-11-28T05:30:00Z', '2026-11-28T10:00:00Z', { legGeometry: geo }),
    ])
    const zuFrueh = it_('2026-11-28T03:00:00Z', '2026-11-28T04:00:00Z', 0, [
      leg('BUS', 'B', 'C', '2026-11-28T03:00:00Z', '2026-11-28T04:00:00Z', { legGeometry: geo }),
    ])
    const s = streckeAus([langsam, zuFrueh, schnell])
    expect(s).toHaveLength(1)
    expect(s![0]).toHaveLength(3)
    expect(streckeAus([zuFrueh])).toBeUndefined()
  })
})
