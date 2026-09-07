import { describe, it, expect } from 'vitest'
import { anzahlAktiverFilter, zeitraumKurz, zeitraumText, STANDARD_FENSTER } from '@/lib/steuerleiste'
import { STANDARD_FILTER } from '@/lib/filter'

describe('anzahlAktiverFilter', () => {
  it('ist 0 im Standardzustand', () => {
    expect(anzahlAktiverFilter(STANDARD_FILTER, STANDARD_FENSTER)).toBe(0)
  })
  it('zählt jede Sportart, Art, Fahrzeit und Fenster', () => {
    expect(anzahlAktiverFilter({ ...STANDARD_FILTER, sport: ['wandern', 'skitour'] }, STANDARD_FENSTER)).toBe(2)
    expect(anzahlAktiverFilter({ ...STANDARD_FILTER, art: 'tag' }, STANDARD_FENSTER)).toBe(1)
    expect(anzahlAktiverFilter({ ...STANDARD_FILTER, maxStd: 3 }, STANDARD_FENSTER)).toBe(1)
    expect(anzahlAktiverFilter(STANDARD_FILTER, 240)).toBe(1)
    expect(anzahlAktiverFilter({ sport: ['wandern'], art: 'nacht', maxStd: 99, suche: '' }, 480)).toBe(4)
  })
  it('zählt die Suche nicht mit', () => {
    expect(anzahlAktiverFilter({ ...STANDARD_FILTER, suche: 'Schwarzwald' }, STANDARD_FENSTER)).toBe(0)
  })
})

describe('zeitraumText', () => {
  it('ein Tag: nur das Hin-Datum', () => {
    expect(zeitraumText('2026-09-12', '2026-09-12')).toBe('Sa 12.9.')
  })
  it('mehrere Tage: Hin – Zurück', () => {
    expect(zeitraumText('2026-09-12', '2026-09-13')).toBe('Sa 12.9. – So 13.9.')
    expect(zeitraumText('2026-09-11', '2026-09-13')).toBe('Fr 11.9. – So 13.9.')
  })
})

describe('zeitraumKurz', () => {
  it('ein Tag', () => {
    expect(zeitraumKurz('2026-09-12', '2026-09-12')).toBe('12.9.')
  })
  it('Bereich im selben Monat', () => {
    expect(zeitraumKurz('2026-09-12', '2026-09-13')).toBe('12.–13.9.')
    expect(zeitraumKurz('2026-09-11', '2026-09-13')).toBe('11.–13.9.')
  })
  it('Bereich über den Monatswechsel', () => {
    expect(zeitraumKurz('2026-10-31', '2026-11-01')).toBe('31.10.–1.11.')
  })
})
