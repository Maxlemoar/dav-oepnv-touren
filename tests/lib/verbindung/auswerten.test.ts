import { describe, it, expect } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { waehleHinfahrt, waehleRueckfahrt, hatFernverkehr, abschnitte, kurzfassung } from '@/lib/verbindung/auswerten'
import type { Itinerary } from '@/lib/verbindung/transitous'

const its = fixture as Itinerary[]

describe('waehleHinfahrt', () => {
  it('früheste Ankunft mit Abfahrt zwischen 5:00 und 8:00, plus spätere Alternative 8:00 bis 9:00', () => {
    const w = waehleHinfahrt(its)
    expect(w.hinfahrt?.startTime).toBe('2026-09-12T04:30:00Z') // 06:30 lokal
    expect(w.hinfahrtSpaeter?.startTime).toBe('2026-09-12T06:30:00Z') // 08:30 lokal
  })
  it('ignoriert Abfahrten vor 5:00', () => {
    const w = waehleHinfahrt(its)
    expect(w.hinfahrt?.startTime).not.toBe('2026-09-12T02:40:00Z')
  })
  it('bevorzugt bei gleicher Ankunft weniger Umstiege', () => {
    const a = { ...its[1], transfers: 3 }
    const b = { ...its[1], transfers: 0 }
    expect(waehleHinfahrt([a, b]).hinfahrt).toBe(b)
  })
  it('liefert undefined, wenn nichts im Fenster liegt', () => {
    expect(waehleHinfahrt([its[0]]).hinfahrt).toBeUndefined()
  })
  it('ohne Option die schnellste Verbindung, auch mit Fernverkehr', () => {
    expect(waehleHinfahrt(its).hinfahrt?.startTime).toBe('2026-09-12T04:30:00Z') // ICE 06:30, an 10:40
  })
  it('mit nahverkehrBevorzugen die Nahverkehrsverbindung, wenn sie höchstens 30 Minuten später ankommt', () => {
    const w = waehleHinfahrt(its, { nahverkehrBevorzugen: true })
    expect(w.hinfahrt?.startTime).toBe('2026-09-12T04:12:00Z') // Regio 06:12, an 10:55
    expect(w.hinfahrt?.endTime).toBe('2026-09-12T08:55:00Z')
    expect(w.hinfahrtSpaeter?.startTime).toBe('2026-09-12T06:30:00Z') // keine Alternative im Spätfenster
  })
  it('mit kleiner Toleranz wieder den Fernverkehr', () => {
    expect(waehleHinfahrt(its, { nahverkehrBevorzugen: true, toleranzMin: 10 }).hinfahrt?.startTime).toBe('2026-09-12T04:30:00Z')
  })
  it('bevorzugt Nahverkehr auch im Spätfenster', () => {
    const spaetNah: Itinerary = { ...its[5], startTime: '2026-09-12T06:12:00Z', endTime: '2026-09-12T10:00:00Z', legs: [] }
    expect(waehleHinfahrt([...its, spaetNah], { nahverkehrBevorzugen: true }).hinfahrtSpaeter).toBe(spaetNah)
  })
})

describe('waehleRueckfahrt', () => {
  const rueck: Itinerary[] = [
    { startTime: '2026-09-13T14:14:00Z', endTime: '2026-09-13T17:56:00Z', duration: 1, transfers: 2, legs: [] },
    { startTime: '2026-09-13T16:14:00Z', endTime: '2026-09-13T20:38:00Z', duration: 1, transfers: 2, legs: [] },
    { startTime: '2026-09-13T17:14:00Z', endTime: '2026-09-13T22:10:00Z', duration: 1, transfers: 2, legs: [] }, // 00:10 Folgetag lokal
  ]
  it('späteste Abfahrt mit Ankunft am selben lokalen Tag bis 23:00', () => {
    expect(waehleRueckfahrt(rueck, '2026-09-13')?.startTime).toBe('2026-09-13T16:14:00Z')
  })
  it('undefined ohne passende', () => {
    expect(waehleRueckfahrt([rueck[2]], '2026-09-13')).toBeUndefined()
  })
})

describe('hatFernverkehr', () => {
  it('erkennt HIGHSPEED_RAIL', () => {
    expect(hatFernverkehr(its[1])).toBe(true)
    expect(hatFernverkehr(its[0])).toBe(false)
  })
})

describe('abschnitte', () => {
  it('lässt kurze Fußwege weg und formatiert lokal', () => {
    const a = abschnitte(its[1])
    expect(a).toEqual([
      { modus: 'zug', linie: 'ICE 271', von: 'Offenburg', nach: 'Bern', ab: '06:30', an: '08:56' },
      { modus: 'zug', linie: 'RE1', von: 'Bern', nach: 'Kandersteg', ab: '09:39', an: '10:40' },
    ])
  })
})

describe('abschnitte Modus', () => {
  it('ordnet LONG_DISTANCE (IC/EC bei Transitous) dem Zug zu', () => {
    const it2 = { ...its[1], legs: [{ ...its[1].legs[0], mode: 'LONG_DISTANCE', routeShortName: 'IC61' }] }
    expect(abschnitte(it2)[0]).toMatchObject({ modus: 'zug', linie: 'IC61' })
  })
})

describe('kurzfassung', () => {
  it('fasst Zeiten, Dauer, Umstiege und Abschnitte zusammen', () => {
    const k = kurzfassung(its[1])
    expect(k).toMatchObject({ ab: '2026-09-12T04:30:00Z', an: '2026-09-12T08:40:00Z', dauerMin: 250, umstiege: 1 })
    expect(k.abschnitte).toHaveLength(2)
  })
})
