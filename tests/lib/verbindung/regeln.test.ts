import { describe, it, expect } from 'vitest'
import { tourenfensterMin, istTagesziel, ticketFuer, TAGESZIEL } from '@/lib/verbindung/regeln'
import type { TicketTabelle } from '@/lib/content/schema'

const tabelle: TicketTabelle = {
  regeln: [
    { land: 'DE', ticket: 'deutschlandticket', hinweis: 'Nah' },
    { land: 'CH', ticket: 'halbtax', hinweis: 'CH' },
    { land: 'FR', ticket: 'europass', hinweis: 'FR' },
    { land: 'AT', ticket: 'keins', hinweis: 'AT' },
  ],
  fernverkehrHinweis: 'Fern',
}

describe('tourenfensterMin', () => {
  it('Rückfahrt-Abfahrt minus Hinfahrt-Ankunft', () => {
    expect(tourenfensterMin('2026-09-12T08:40:00Z', '2026-09-12T16:14:00Z')).toBe(454)
  })
})

describe('istTagesziel', () => {
  it('ja bei Ankunft 9:30, Rückfahrt 17:00, 7,5 h Fenster', () => {
    expect(istTagesziel({ ankunftMin: 570, rueckfahrtMin: 1020, tourenfensterMin: 450 })).toBe(true)
  })
  it('nein bei Ankunft nach 10:00', () => {
    expect(istTagesziel({ ankunftMin: 601, rueckfahrtMin: 1020, tourenfensterMin: 419 })).toBe(false)
  })
  it('nein bei Rückfahrt vor 16:30', () => {
    expect(istTagesziel({ ankunftMin: 540, rueckfahrtMin: 989, tourenfensterMin: 449 })).toBe(false)
  })
  it('nein bei zu kleinem Fenster, ja mit kleinerem Regler', () => {
    const w = { ankunftMin: 590, rueckfahrtMin: 1000, tourenfensterMin: 410 }
    expect(istTagesziel(w)).toBe(true)
    expect(istTagesziel({ ...w, tourenfensterMin: 300 })).toBe(false)
    expect(istTagesziel({ ...w, tourenfensterMin: 300 }, 240)).toBe(true)
  })
  it('Grenzwerte sind exportiert', () => {
    expect(TAGESZIEL).toEqual({ ankunftBisMin: 600, rueckfahrtAbMin: 990, mindestFensterMin: 360 })
  })
})

describe('ticketFuer', () => {
  it('DE ohne Fernverkehr: Deutschlandticket', () => {
    expect(ticketFuer('DE', false, tabelle)).toEqual({ ticket: 'deutschlandticket', hinweis: 'Nah' })
  })
  it('DE mit Fernverkehr: keins mit Fernverkehrshinweis', () => {
    expect(ticketFuer('DE', true, tabelle)).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })
  it('CH mit Fernverkehr bleibt Halbtax', () => {
    expect(ticketFuer('CH', true, tabelle)).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })
})
