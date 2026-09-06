import { describe, it, expect } from 'vitest'
import { HuetteSchema, HaltestelleSchema, GebietSchema, StartortSchema } from '@/lib/content/schema'

describe('StartortSchema', () => {
  it('akzeptiert Offenburg', () => {
    const r = StartortSchema.safeParse({
      id: 'offenburg', name: 'Offenburg', haltestelleId: 'de-DELFI_de:08317:14506_G',
      lat: 48.476, lon: 7.946, sichtbar: true,
    })
    expect(r.success).toBe(true)
  })
  it('lehnt Großbuchstaben in der id ab', () => {
    const r = StartortSchema.safeParse({
      id: 'Offenburg', name: 'Offenburg', haltestelleId: 'x', lat: 1, lon: 1, sichtbar: true,
    })
    expect(r.success).toBe(false)
  })
})

describe('HaltestelleSchema', () => {
  it('richtwerte ist optional und wird zu leerem Objekt', () => {
    const r = HaltestelleSchema.parse({
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch-x', lat: 46.49, lon: 7.67,
      land: 'CH', region: 'Berner Oberland',
    })
    expect(r.richtwerte).toEqual({})
  })
  it('validiert einen Richtwert', () => {
    const r = HaltestelleSchema.safeParse({
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch-x', lat: 46.49, lon: 7.67,
      land: 'CH', region: 'Berner Oberland',
      richtwerte: { offenburg: { fahrzeitMin: 250, umstiege: 2, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' } },
    })
    expect(r.success).toBe(true)
  })
})

describe('GebietSchema', () => {
  it('braucht mindestens eine Haltestelle und eine Sportart', () => {
    const r = GebietSchema.safeParse({
      id: 'kandersteg', name: 'Kandersteg', beschreibung: 'x', haltestellen: [], sportarten: ['wandern'],
      saison: 'sommer', lat: 1, lon: 1,
    })
    expect(r.success).toBe(false)
  })
})

describe('HuetteSchema', () => {
  it('akzeptiert eine vollständige Hütte', () => {
    const r = HuetteSchema.safeParse({
      id: 'doldenhornhuette', name: 'Doldenhornhütte',
      betreiber: { typ: 'sac', sektion: 'Emmental' },
      hoehe: 1915, lat: 46.47, lon: 7.69, gebietId: 'kandersteg', saison: 'sommer',
      zustiege: [{ haltestelleId: 'kandersteg', gehzeitMin: 150, hoehenmeter: 750 }],
      quelle: 'https://de.wikipedia.org/wiki/Doldenhornh%C3%BCtte',
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.geschaetzt).toBe(false)
      expect(r.data.zustiege[0].bergbahn).toBe(false)
    }
  })
  it('lehnt unbekannten Betreibertyp ab', () => {
    const r = HuetteSchema.safeParse({
      id: 'x', name: 'x', betreiber: { typ: 'alpenclub' }, hoehe: 1, lat: 1, lon: 1, gebietId: 'g',
      saison: 'sommer', zustiege: [{ haltestelleId: 'h', gehzeitMin: 1, hoehenmeter: 1 }], quelle: 'https://a.b',
    })
    expect(r.success).toBe(false)
  })
})
