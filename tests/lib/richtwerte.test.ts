import { describe, it, expect } from 'vitest'
import fixture from '../fixtures/itineraries-kandersteg.json'
import { parseDocument } from 'yaml'
import { taktAus, richtwertAus, haversineKm, tagesfensterAus, referenzTage, tagesfensterZiele, richtwertSchreiben, tagesfensterSchreiben } from '@/lib/richtwerte'
import type { Gebiet, Haltestelle, Startort } from '@/lib/content/schema'
import type { Itinerary } from '@/lib/verbindung/transitous'
import { hatFernverkehr } from '@/lib/verbindung/auswerten'

const its = fixture as Itinerary[]
const tickets = { regeln: [{ land: 'CH' as const, ticket: 'halbtax' as const, hinweis: 'Ab Basel' }], fernverkehrHinweis: 'Fernverkehr' }

describe('taktAus', () => {
  it('zählt verschiedene Abfahrten 6 bis 12 Uhr lokal', () => {
    // Fixture: 04:40 (vor dem Fenster), 06:30, 07:12, 08:30, 09:30, 06:12 lokal -> 5 -> stuendlich
    expect(taktAus(its)).toBe('stuendlich')
    // 06:30, 07:12, 08:30 -> 3 -> zweistuendlich
    expect(taktAus(its.slice(0, 4))).toBe('zweistuendlich')
    expect(taktAus(its.slice(0, 2))).toBe('unregelmaessig')
  })
  it('zählt doppelte Abfahrtszeiten nur einmal', () => {
    expect(taktAus([...its.slice(0, 4), ...its.slice(0, 4)])).toBe('zweistuendlich')
  })
})

describe('richtwertAus', () => {
  it('nimmt die gewählte Hinfahrt', () => {
    const r = richtwertAus(its, 'CH', tickets, '2026-09-06')
    expect(r).toMatchObject({ fahrzeitMin: 250, umstiege: 1, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' })
  })
  it('undefined ohne Hinfahrt im Fenster', () => {
    expect(richtwertAus([its[0]], 'CH', { regeln: [], fernverkehrHinweis: '' }, '2026-09-06')).toBeUndefined()
  })
  const de = { regeln: [{ land: 'DE' as const, ticket: 'deutschlandticket' as const, hinweis: 'Nahverkehr' }], fernverkehrHinweis: 'Fernverkehr' }
  it('in Deutschland mit Fernverkehr ohne Alternative kein Deutschlandticket', () => {
    expect(richtwertAus(its.filter(hatFernverkehr), 'DE', de, '2026-09-06')?.ticket).toBe('keins')
  })
  it('in Deutschland wird die Nahverkehrsverbindung bevorzugt', () => {
    expect(richtwertAus(its, 'DE', de, '2026-09-06')).toMatchObject({ fahrzeitMin: 283, umstiege: 2, ticket: 'deutschlandticket' })
  })
  it('in der Schweiz zählt die schnellste Verbindung', () => {
    expect(richtwertAus(its, 'CH', tickets, '2026-09-06')).toMatchObject({ fahrzeitMin: 250, umstiege: 1 })
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

const rueck: Itinerary[] = [
  { startTime: '2026-09-12T14:14:00Z', endTime: '2026-09-12T17:56:00Z', duration: 1, transfers: 2, legs: [] },
  { startTime: '2026-09-12T16:14:00Z', endTime: '2026-09-12T20:38:00Z', duration: 1, transfers: 2, legs: [] },
  // kommt erst nach 23 Uhr an
  { startTime: '2026-09-12T18:14:00Z', endTime: '2026-09-12T21:30:00Z', duration: 1, transfers: 2, legs: [] },
]

describe('tagesfensterAus', () => {
  it('früheste Ankunft der gewählten Hinfahrt zwischen 5 und 8 Uhr, letzte Rückfahrt mit Ankunft bis 23 Uhr', () => {
    expect(tagesfensterAus(its, rueck, '2026-09-12', 'CH')).toEqual({ ankunft: '10:40', letzteRueckfahrt: '18:14' })
  })
  it('in Deutschland wie die Seite mit Vorrang für den Nahverkehr', () => {
    expect(tagesfensterAus(its, rueck, '2026-09-12', 'DE').ankunft).toBe('10:55')
  })
  it('ohne Abfahrt zwischen 5 und 8 Uhr die früheste Ankunft überhaupt, aber nicht vor 5 Uhr abgefahren', () => {
    const spaet = its.filter((i) => i.startTime === '2026-09-12T07:30:00Z' || i.startTime === '2026-09-12T02:40:00Z')
    expect(tagesfensterAus(spaet, rueck, '2026-09-12', 'CH').ankunft).toBe('13:40')
  })
  it('lässt Felder ohne Verbindung weg', () => {
    expect(tagesfensterAus([], [], '2026-09-12', 'CH')).toEqual({})
    expect(tagesfensterAus(its, [], '2026-09-12', 'CH')).toEqual({ ankunft: '10:40' })
  })
})

describe('referenzTage', () => {
  it('nächster Freitag, Samstag, Sonntag nach heute', () => {
    expect(referenzTage('2026-11-19', '2026-12-12')).toEqual({ werktag: '2026-11-20', sa: '2026-11-21', so: '2026-11-22' })
  })
  it('heute zählt nicht mit', () => {
    expect(referenzTage('2026-11-21', '2026-12-12')).toEqual({ werktag: '2026-11-27', sa: '2026-11-28', so: '2026-11-22' })
  })
  it('überspringt Feiertage: Freitag muss Werktag, Samstag kein Feiertag sein', () => {
    // 25.12.2026 (Fr), 26.12. (Sa) und 1.1.2027 (Fr) sind Feiertage
    expect(referenzTage('2026-12-23', '2027-01-31')).toEqual({ werktag: '2027-01-08', sa: '2027-01-02', so: '2026-12-27' })
  })
  it('lässt sich je Tagesklasse überschreiben', () => {
    expect(referenzTage('2026-11-19', '2026-12-12', { sa: '2026-12-05' })).toEqual({ werktag: '2026-11-20', sa: '2026-12-05', so: '2026-11-22' })
  })
  it('wirft, wenn der Standardtag nach liveBis läge', () => {
    expect(() => referenzTage('2026-12-11', '2026-12-12')).toThrow(/--werktag/)
  })
  it('wirft bei Überschreibung mit falscher Tagesklasse', () => {
    expect(() => referenzTage('2026-11-19', '2026-12-12', { sa: '2026-11-22' })).toThrow(/--sa/)
  })
})

describe('tagesfensterZiele', () => {
  const st = (id: string, sichtbar: boolean): Startort => ({ id, name: id, haltestelleId: id, lat: 48, lon: 7, sichtbar })
  const h = (id: string): Haltestelle => ({ id, name: id, haltestelleId: id, lat: 46, lon: 8, land: 'CH', region: 'R', richtwerte: {} })
  const g = (id: string, hs: string[]): Gebiet => ({ id, name: id, beschreibung: 'b', haltestellen: hs, sportarten: ['wandern'], saison: 'sommer', touren: [], links: [], lat: 46, lon: 8 })
  it('nur erste Zugänge der Gebiete, je einmal, mal sichtbare Startorte', () => {
    const ziele = tagesfensterZiele([g('a', ['x', 'y']), g('b', ['x']), g('c', ['z'])], [h('x'), h('y'), h('z')], [st('offenburg', true), st('kehl', false)])
    expect(ziele.map((z) => `${z.startort.id}>${z.haltestelle.id}`)).toEqual(['offenburg>x', 'offenburg>z'])
  })
})

describe('YAML schreiben', () => {
  const yaml = `id: x
# Kommentar bleibt
richtwerte:
  offenburg:
    fahrzeitMin: 100
    umstiege: 1
    takt: stuendlich
    ticket: halbtax
    berechnetAm: 2026-09-07
    strassenKm: 200
    tagesfenster:
      sa:
        ankunft: "09:00"
        letzteRueckfahrt: "18:00"
bahn:
  extId: "1"
`
  it('tagesfensterSchreiben ändert nur die Tagesklasse', () => {
    const dok = parseDocument(yaml)
    tagesfensterSchreiben(dok, 'offenburg', 'so', { ankunft: '09:30', letzteRueckfahrt: '17:12' })
    tagesfensterSchreiben(dok, 'offenburg', 'sa', { ankunft: '08:50' })
    const text = dok.toString({ lineWidth: 0 })
    expect(text).toContain('# Kommentar bleibt')
    const d = dok.toJS() as { richtwerte: { offenburg: Record<string, unknown> } }
    expect(d.richtwerte.offenburg).toMatchObject({ fahrzeitMin: 100, strassenKm: 200, tagesfenster: { sa: { ankunft: '08:50' }, so: { ankunft: '09:30', letzteRueckfahrt: '17:12' } } })
    expect((d.richtwerte.offenburg.tagesfenster as { sa: object }).sa).toEqual({ ankunft: '08:50' })
    // Uhrzeiten bleiben Zeichenketten, auch nach erneutem Lesen
    expect((parseDocument(text).toJS() as typeof d).richtwerte.offenburg.tagesfenster).toMatchObject({ so: { letzteRueckfahrt: '17:12' } })
  })
  it('richtwertSchreiben ersetzt Felder einzeln und behält das Tagesfenster', () => {
    const dok = parseDocument(yaml)
    richtwertSchreiben(dok, 'offenburg', { fahrzeitMin: 95, umstiege: 2, takt: 'zweistuendlich', ticket: 'halbtax', berechnetAm: '2026-11-20', bahnKm: 250 })
    const d = dok.toJS() as { richtwerte: { offenburg: Record<string, unknown> } }
    expect(d.richtwerte.offenburg).toMatchObject({ fahrzeitMin: 95, umstiege: 2, bahnKm: 250, strassenKm: 200, tagesfenster: { sa: { ankunft: '09:00' } } })
  })
  it('richtwertSchreiben legt einen neuen Startort an', () => {
    const dok = parseDocument(yaml)
    richtwertSchreiben(dok, 'lahr', { fahrzeitMin: 90, umstiege: 1, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-11-20' })
    expect((dok.toJS() as { richtwerte: Record<string, { fahrzeitMin: number }> }).richtwerte.lahr.fahrzeitMin).toBe(90)
  })
})
