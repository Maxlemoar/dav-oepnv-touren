import { describe, it, expect } from 'vitest'
import { naechteText, zeitraumQuery, mitZeitraum } from '@/lib/zeitraum'

describe('naechteText', () => {
  it('Singular und Plural', () => {
    expect(naechteText(1)).toBe('1 Nacht')
    expect(naechteText(2)).toBe('2 Nächte')
  })
})

describe('zeitraumQuery', () => {
  it('nimmt das ganze Zeitfenster mit (datum, rueck, ab, bis, vorort), das alte fenster nicht', () => {
    expect(zeitraumQuery(new URLSearchParams('q=feld&datum=2026-11-28&rueck=2026-11-29&ab=07:00&bis=20:30&vorort=180&fenster=240&ansicht=karte')))
      .toBe('?datum=2026-11-28&rueck=2026-11-29&ab=07%3A00&bis=20%3A30&vorort=180')
  })
  it('ist leer ohne Zeitraum', () => {
    expect(zeitraumQuery(new URLSearchParams('q=feld'))).toBe('')
    expect(zeitraumQuery(new URLSearchParams(''))).toBe('')
  })
  it('lässt leere Werte weg', () => {
    expect(zeitraumQuery(new URLSearchParams('datum=&rueck=2026-11-29'))).toBe('?rueck=2026-11-29')
  })
  it('gibt das verwendete Hin-Datum ausdrücklich mit, wenn nur rueck gesetzt ist', () => {
    expect(zeitraumQuery(new URLSearchParams('rueck=2026-11-29'), '2026-11-28')).toBe('?datum=2026-11-28&rueck=2026-11-29')
    expect(zeitraumQuery(new URLSearchParams('datum=&rueck=2026-11-29&ab=07:00'), '2026-11-28'))
      .toBe('?datum=2026-11-28&rueck=2026-11-29&ab=07%3A00')
  })
  it('lässt ein gesetztes Datum stehen und ergänzt ohne rueck nichts', () => {
    expect(zeitraumQuery(new URLSearchParams('datum=2026-12-05&rueck=2026-12-06'), '2026-11-28')).toBe('?datum=2026-12-05&rueck=2026-12-06')
    expect(zeitraumQuery(new URLSearchParams('vorort=180'), '2026-11-28')).toBe('?vorort=180')
    expect(zeitraumQuery(new URLSearchParams('fenster=240'), '2026-11-28')).toBe('')
  })
})

describe('mitZeitraum', () => {
  it('hängt den Zeitraum an den Pfad', () => {
    expect(mitZeitraum('/gebiet/kandersteg', '?datum=2026-11-28')).toBe('/gebiet/kandersteg?datum=2026-11-28')
    expect(mitZeitraum('/huette/x', '')).toBe('/huette/x')
  })
})
