import { describe, it, expect } from 'vitest'
import { tourenfensterMin, istTagesziel, ticketFuer, tageszielAusFenster, TAGESZIEL } from '@/lib/verbindung/regeln'
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

describe('tageszielAusFenster', () => {
  it('ohne Tagesfenster kein Urteil', () => {
    expect(tageszielAusFenster(undefined, 360)).toEqual({})
  })
  it('ja bei Ankunft 8:40, Rückfahrt 17:14', () => {
    expect(tageszielAusFenster({ ankunft: '08:40', letzteRueckfahrt: '17:14' }, 360)).toEqual({ tagesziel: true })
  })
  it('Grenzen: Ankunft genau 10:00, Rückfahrt genau 16:30, Fenster genau Mindestwert', () => {
    expect(tageszielAusFenster({ ankunft: '10:00', letzteRueckfahrt: '16:30' }, 390)).toEqual({ tagesziel: true })
  })
  it('nein bei später Ankunft', () => {
    expect(tageszielAusFenster({ ankunft: '10:40', letzteRueckfahrt: '18:14' }, 360)).toEqual({ tagesziel: false, grund: 'Ankunft erst 10:40' })
  })
  it('nein bei früher letzter Rückfahrt', () => {
    expect(tageszielAusFenster({ ankunft: '08:10', letzteRueckfahrt: '15:12' }, 360)).toEqual({ tagesziel: false, grund: 'Letzte Rückfahrt schon 15:12' })
  })
  it('nein bei zu kurzem Fenster', () => {
    expect(tageszielAusFenster({ ankunft: '09:30', letzteRueckfahrt: '17:00' }, 480)).toEqual({ tagesziel: false, grund: 'Nur 7:30 h am Berg' })
    expect(tageszielAusFenster({ ankunft: '09:45', letzteRueckfahrt: '16:30' }, 360)).toEqual({ tagesziel: true })
    expect(tageszielAusFenster({ ankunft: '09:45', letzteRueckfahrt: '16:30' }, 420)).toEqual({ tagesziel: false, grund: 'Nur 6:45 h am Berg' })
  })
  it('Standard-Mindestfenster aus TAGESZIEL', () => {
    expect(tageszielAusFenster({ ankunft: '10:00', letzteRueckfahrt: '16:30' })).toEqual({ tagesziel: true })
  })
  it('nein ohne Hinfahrt oder ohne Rückfahrt', () => {
    expect(tageszielAusFenster({}, 360)).toEqual({ tagesziel: false, grund: 'Keine Hinfahrt an diesem Tag' })
    expect(tageszielAusFenster({ ankunft: '08:00' }, 360)).toEqual({ tagesziel: false, grund: 'Keine Rückfahrt am selben Tag' })
  })
})
