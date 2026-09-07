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
  it('akzeptiert optionale bahn.de-Daten', () => {
    const r = StartortSchema.safeParse({
      id: 'offenburg', name: 'Offenburg', haltestelleId: 'x', lat: 48.476, lon: 7.946, sichtbar: true,
      bahn: { extId: '8000290', name: 'Offenburg', x: 7946725, y: 48476479 },
    })
    expect(r.success).toBe(true)
  })
  it('lehnt bahn.extId mit Buchstaben ab', () => {
    const r = StartortSchema.safeParse({
      id: 'offenburg', name: 'Offenburg', haltestelleId: 'x', lat: 48.476, lon: 7.946, sichtbar: true,
      bahn: { extId: 'A8000290', name: 'Offenburg', x: 7946725, y: 48476479 },
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
    expect(r.bahn).toBeUndefined()
  })
  it('akzeptiert bahn.de-Daten mit ganzzahligen Koordinaten', () => {
    const r = HaltestelleSchema.safeParse({
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch-x', lat: 46.49, lon: 7.67,
      land: 'CH', region: 'Berner Oberland',
      bahn: { extId: '8507475', name: 'Kandersteg', x: 7671412, y: 46495401 },
    })
    expect(r.success).toBe(true)
    const falsch = HaltestelleSchema.safeParse({
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch-x', lat: 46.49, lon: 7.67,
      land: 'CH', region: 'Berner Oberland',
      bahn: { extId: '8507475', name: 'Kandersteg', x: 7.671412, y: 46.495401 },
    })
    expect(falsch.success).toBe(false)
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
  const basis = { id: 'kandersteg', name: 'Kandersteg', beschreibung: 'x', haltestellen: ['kandersteg'], sportarten: ['wandern'], saison: 'sommer', lat: 1, lon: 1 }

  it('braucht mindestens eine Haltestelle und eine Sportart', () => {
    const r = GebietSchema.safeParse({ ...basis, haltestellen: [] })
    expect(r.success).toBe(false)
  })
  it('touren ist optional und wird zu leerem Array, sammlungEmbed bleibt undefined', () => {
    const r = GebietSchema.parse(basis)
    expect(r.touren).toEqual([])
    expect(r.sammlungEmbed).toBeUndefined()
  })
  it('akzeptiert eine minimale Tour und setzt oeffiTauglich auf true', () => {
    const r = GebietSchema.parse({ ...basis, touren: [{ titel: 'Oeschinensee', url: 'https://www.alpenvereinaktiv.com/de/tour/x/1/', anbieter: 'alpenvereinaktiv' }] })
    expect(r.touren[0].oeffiTauglich).toBe(true)
    expect(r.touren[0].embed).toBeUndefined()
  })
  it('akzeptiert eine vollständige Tour mit embed', () => {
    const r = GebietSchema.safeParse({ ...basis, touren: [{
      titel: 'Kandersteg-Ryharts-Allmenalp', url: 'https://www.alpenvereinaktiv.com/de/tour/kandersteg-ryharts-allmenalp/50994062/',
      anbieter: 'alpenvereinaktiv', sportart: 'wandern', dauerMin: 135, hoehenmeter: 604, laengeKm: 4, schwierigkeit: 'T2', oeffiTauglich: true,
      embed: { anbieter: 'alpenvereinaktiv', id: '50994062', slug: 'kandersteg-ryharts-allmenalp' },
    }] })
    expect(r.success).toBe(true)
  })
  it('lehnt unbekannten Anbieter, ungültige URL und Dezimal-Dauer ab', () => {
    const tour = { titel: 'x', url: 'https://a.b/', anbieter: 'alpenvereinaktiv' }
    expect(GebietSchema.safeParse({ ...basis, touren: [{ ...tour, anbieter: 'bergfex' }] }).success).toBe(false)
    expect(GebietSchema.safeParse({ ...basis, touren: [{ ...tour, url: 'alpenvereinaktiv.com/tour' }] }).success).toBe(false)
    expect(GebietSchema.safeParse({ ...basis, touren: [{ ...tour, dauerMin: 90.5 }] }).success).toBe(false)
  })
  it('embed erlaubt nur alpenvereinaktiv und komoot', () => {
    const tour = { titel: 'x', url: 'https://a.b/', anbieter: 'sac' }
    expect(GebietSchema.safeParse({ ...basis, touren: [{ ...tour, embed: { anbieter: 'komoot', id: '384495679' } }] }).success).toBe(true)
    expect(GebietSchema.safeParse({ ...basis, touren: [{ ...tour, embed: { anbieter: 'sac', id: '1' } }] }).success).toBe(false)
  })
  it('sammlungEmbed braucht id und slug', () => {
    expect(GebietSchema.safeParse({ ...basis, sammlungEmbed: { id: '202105012', slug: 'nur-mit-oeffis' } }).success).toBe(true)
    expect(GebietSchema.safeParse({ ...basis, sammlungEmbed: { id: '202105012' } }).success).toBe(false)
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
