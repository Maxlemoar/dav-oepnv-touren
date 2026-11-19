import { describe, it, expect } from 'vitest'
import { autoKostenEuro, bahnTicketKurz, FAHRTKOSTEN_REGEL } from '@/lib/kosten'

describe('autoKostenEuro', () => {
  it('rechnet die Fahrtkostenregel der Sektion für Hin- und Rückfahrt und rundet auf 5 €', () => {
    // 312 km * 2 * 0,30 € = 187,20 € → 185 €
    expect(autoKostenEuro(312)).toBe(185)
    // 48 km * 2 * 0,30 € = 28,80 € → 30 €
    expect(autoKostenEuro(48)).toBe(30)
  })
  it('nimmt mindestens 5 € an, damit nie 0 € dasteht', () => {
    expect(autoKostenEuro(3)).toBe(5)
  })
  it('liefert nichts ohne Straßendistanz', () => {
    expect(autoKostenEuro(undefined)).toBeUndefined()
  })
  it('nutzt 0,30 € pro Person und km', () => {
    expect(FAHRTKOSTEN_REGEL.euroProPersonUndKm).toBe(0.3)
    expect(FAHRTKOSTEN_REGEL.quelle).toBe('https://www.dav-offenburg.de/programm/touren/Hinweise')
  })
})

describe('bahnTicketKurz', () => {
  it('nennt das passende Ticket ohne Preise', () => {
    expect(bahnTicketKurz('deutschlandticket')).toBe('Mit dem Deutschlandticket ohne Zusatzkosten.')
    expect(bahnTicketKurz('halbtax')).toContain('Halbtax')
    expect(bahnTicketKurz('europass')).toContain('Europass')
    expect(bahnTicketKurz('keins')).toContain('Sparpreis')
    for (const t of ['deutschlandticket', 'halbtax', 'europass', 'keins'] as const) expect(bahnTicketKurz(t)).not.toMatch(/\d+ ?€/)
  })
})
