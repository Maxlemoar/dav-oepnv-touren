import { describe, it, expect } from 'vitest'
import { abstiegMin, pufferMin, spaetestensLos, spaetestensZurueck } from '@/lib/rueckfahrt'

// 18:00 in Europe/Berlin am 29.11.2026 (Winterzeit, UTC+1)
const ACHTZEHN = '2026-11-29T17:00:00Z'

describe('abstiegMin', () => {
  it('schätzt den Abstieg auf 70 % der Aufstiegs-Gehzeit', () => {
    expect(abstiegMin(150)).toBe(105)
    expect(abstiegMin(120)).toBe(84)
  })
  it('bleibt bei 0 ohne Gehzeit', () => {
    expect(abstiegMin(0)).toBe(0)
  })
})

describe('pufferMin', () => {
  it('hat mindestens 15 Minuten', () => {
    expect(pufferMin(0)).toBe(15)
    expect(pufferMin(105)).toBe(15)
  })
  it('wächst bei langen Abstiegen auf 10 % des Abstiegs', () => {
    expect(pufferMin(240)).toBe(24)
  })
})

describe('spaetestensLos', () => {
  it('rechnet von der Abfahrt an der Haltestelle rückwärts und rundet auf 5 Minuten ab', () => {
    // 2:30 h Aufstieg → 1:45 h Abstieg + 15 min Puffer = 2 h vor 18:00
    expect(spaetestensLos(ACHTZEHN, { gehzeitMin: 150 })).toEqual({
      haltestelleUm: '18:00', losUm: '16:00', abstiegMin: 105, pufferMin: 15, bergbahnPruefen: false,
    })
  })
  it('rundet krumme Zeiten ab, nie auf', () => {
    // 2 h Aufstieg → 84 min + 15 min = 99 min vor 18:00 = 16:21 → 16:20
    expect(spaetestensLos(ACHTZEHN, { gehzeitMin: 120 }).losUm).toBe('16:20')
  })
  it('weist bei Bergbahn-Zustiegen auf die letzte Talfahrt hin', () => {
    expect(spaetestensLos(ACHTZEHN, { gehzeitMin: 60, bergbahn: true }).bergbahnPruefen).toBe(true)
  })
  it('kommt mit Abfahrten mit Minuten zurecht', () => {
    // 18:14 lokal, 1 h Aufstieg → 42 + 15 = 57 min → 17:17 → 17:15
    expect(spaetestensLos('2026-11-29T17:14:00Z', { gehzeitMin: 60 })).toMatchObject({ haltestelleUm: '18:14', losUm: '17:15' })
  })
  it('rechnet in der Sommerzeit mit UTC+2', () => {
    expect(spaetestensLos('2026-07-12T16:00:00Z', { gehzeitMin: 150 })).toMatchObject({ haltestelleUm: '18:00', losUm: '16:00' })
  })
})

describe('spaetestensZurueck', () => {
  it('nennt die lokale Abfahrtszeit der letzten Rückfahrt', () => {
    expect(spaetestensZurueck('2026-11-28T17:14:00Z')).toBe('18:14')
  })
})
