import { describe, it, expect, vi } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { verbindungErmitteln } from '@/lib/verbindung/service'
import { TransitousFehler, type Itinerary } from '@/lib/verbindung/transitous'
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
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.tourenfensterMin).toBe(454) // 10:40 bis 18:14
    expect(a.tagesziel).toBe(false) // Ankunft 10:40 ist nach 10:00
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
    // Hinfahrt: Abfahrt ab 03:00Z; Rückfahrt: Ankunft bis 23:00 lokal = 21:00Z
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T03:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', zeit: '2026-09-12T21:00:00Z', ankunftBis: true })
  })

  it('fragt Rückfahrt am Folgetag ab und setzt kein Tagesziel-Urteil', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrt: 'folgetag', mindestFensterMin: 360, tickets }, { planen })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T21:00:00Z' })
    expect(a.rueckfahrt?.ab).toBe('2026-09-13T16:14:00Z')
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
  })

  it('fällt auf den Richtwert zurück, wenn Transitous fehlschlägt', async () => {
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('richtwert')
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinfahrt).toBeUndefined()
    expect(a.ticket.ticket).toBe('halbtax')
  })

  it('Fernverkehr in DE ergibt Ticket keins', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets }, { planen })
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })
})
