import { describe, it, expect, vi } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { verbindungErmitteln } from '@/lib/verbindung/service'
import { TransitousFehler, type Itinerary } from '@/lib/verbindung/transitous'
import { hatFernverkehr } from '@/lib/verbindung/auswerten'
import type { Startort, Haltestelle, TicketTabelle } from '@/lib/content/schema'

const startort: Startort = { id: 'offenburg', name: 'Offenburg', haltestelleId: 'de:og', lat: 48.4, lon: 7.9, sichtbar: true }
const haltestelle: Haltestelle = {
  id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch:ka', lat: 46.4, lon: 7.6, land: 'CH', region: 'BO',
  richtwerte: { offenburg: { fahrzeitMin: 250, umstiege: 2, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' } },
}
const tickets: TicketTabelle = {
  regeln: [{ land: 'CH', ticket: 'halbtax', hinweis: 'CH' }, { land: 'DE', ticket: 'deutschlandticket', hinweis: 'DE' }],
  fernverkehrHinweis: 'Fern',
}
const hin = fixture as Itinerary[]
const rueck: Itinerary[] = [
  { startTime: '2026-09-12T14:14:00Z', endTime: '2026-09-12T17:56:00Z', duration: 1, transfers: 2, legs: [] },
  { startTime: '2026-09-12T16:14:00Z', endTime: '2026-09-12T20:38:00Z', duration: 1, transfers: 2, legs: [] },
]

describe('verbindungErmitteln', () => {
  it('liefert live Hinfahrt, Rückfahrt, Tourenfenster und Tagesziel', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.tourenfensterMin).toBe(454) // 10:40 bis 18:14
    expect(a.tagesziel).toBe(false) // Ankunft 10:40 ist nach 10:00
    expect(a.naechte).toBe(0)
    expect(a.rueckfahrtDatum).toBe('2026-09-12')
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
    // Hinfahrt: Abfahrt ab 05:00 lokal = 03:00Z im Sommer; Rückfahrt: Ankunft bis 23:00 lokal = 21:00Z
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T03:00:00Z', ankunftBis: false, anzahl: 12 })
    expect(planen.mock.calls[1][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', zeit: '2026-09-12T21:00:00Z', ankunftBis: true })
  })

  it('fragt die Hinfahrt im Winter ab 04:00Z ab (05:00 CET)', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    await verbindungErmitteln({ startort, haltestelle, datum: '2026-01-10', rueckfahrtDatum: '2026-01-10', mindestFensterMin: 360, tickets }, { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2026-01-10T04:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-01-10T22:00:00Z', ankunftBis: true })
  })

  it('fragt Rückfahrt am Folgetag ab und setzt kein Tagesziel-Urteil', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-13', mindestFensterMin: 360, tickets }, { planen })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T21:00:00Z' })
    expect(a.rueckfahrt?.ab).toBe('2026-09-13T16:14:00Z')
    expect(a.rueckfahrtDatum).toBe('2026-09-13')
    expect(a.naechte).toBe(1)
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
  })

  it('rechnet zwei Nächte von Freitag bis Sonntag', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : hin.map((h) => ({ ...h, startTime: h.startTime.replace('12T', '11T'), endTime: h.endTime.replace('12T', '11T') }))))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-11', rueckfahrtDatum: '2026-09-13', mindestFensterMin: 360, tickets }, { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2026-09-11T03:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T21:00:00Z', ankunftBis: true })
    expect(a.datum).toBe('2026-09-11')
    expect(a.rueckfahrtDatum).toBe('2026-09-13')
    expect(a.naechte).toBe(2)
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
  })

  it('fällt auf den Richtwert zurück, wenn Transitous fehlschlägt', async () => {
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('richtwert')
    expect(a.naechte).toBe(0)
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinfahrt).toBeUndefined()
    expect(a.ticket.ticket).toBe('halbtax')
  })

  it('nimmt im Fallback das Ticket aus dem Richtwert', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE', richtwerte: { offenburg: { ...haltestelle.richtwerte.offenburg, ticket: 'keins' } } }
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('richtwert')
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })

  it('nutzt im Fallback ohne Richtwert die Tabelle', async () => {
    const ohne: Haltestelle = { ...haltestelle, richtwerte: {} }
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle: ohne, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.richtwert).toBeUndefined()
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })

  it('liefert die Hinfahrt live, wenn nur die Rückfahrt-Abfrage fehlschlägt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return hin
    })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt).toBeUndefined()
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
    expect(a.fehler).toMatch(/503/)
  })

  it('liefert die Rückfahrt live, wenn nur die Hinfahrt-Abfrage fehlschlägt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (!p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return rueck
    })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt).toBeUndefined()
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.fehler).toMatch(/503/)
  })

  it('Fernverkehr in DE ergibt Ticket keins, wenn es keine Nahverkehrsalternative gibt', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin.filter(hatFernverkehr)))
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })

  it('in DE wird die Nahverkehrsverbindung bevorzugt und das Deutschlandticket empfohlen', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:12:00Z')
    expect(a.hinfahrt?.fernverkehr).toBe(false)
    expect(a.ticket).toEqual({ ticket: 'deutschlandticket', hinweis: 'DE' })
  })

  it('in CH bleibt die schnellste Verbindung trotz Nahverkehrsalternative', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
  })
})
