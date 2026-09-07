import { describe, it, expect } from 'vitest'
import { zeitraumAusUrl, verbindungParameter } from '@/lib/verbindung/parameter'

describe('zeitraumAusUrl', () => {
  it('liest datum, rueck und fenster', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12&rueck=2026-09-13&fenster=240'), 0))
      .toEqual({ datum: '2026-09-12', rueck: '2026-09-13', fenster: 240 })
  })
  it('setzt rueck ohne Parameter auf das Datum, Fenster auf 360', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12'), 0))
      .toEqual({ datum: '2026-09-12', rueck: '2026-09-12', fenster: 360 })
  })
  it('hebt rueck vor dem Datum auf das Datum an', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12&rueck=2026-09-10'), 0).rueck).toBe('2026-09-12')
  })
  it('hält für Hüttenseiten mindestens eine Nacht ein', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12'), 1).rueck).toBe('2026-09-13')
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12&rueck=2026-09-12'), 1).rueck).toBe('2026-09-13')
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-11&rueck=2026-09-13'), 1).rueck).toBe('2026-09-13')
  })
  it('ignoriert ein unbrauchbares rueck', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12&rueck=morgen'), 0).rueck).toBe('2026-09-12')
  })
  it('nimmt ohne datum den kommenden Samstag', () => {
    const z = zeitraumAusUrl(new URLSearchParams(''), 0)
    expect(z.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(z.rueck).toBe(z.datum)
  })
})

describe('verbindungParameter', () => {
  it('entspricht zeitraumAusUrl ohne Mindestnächte', () => {
    expect(verbindungParameter(new URLSearchParams('datum=2026-09-12&rueck=2026-09-14')))
      .toEqual({ datum: '2026-09-12', rueck: '2026-09-14', fenster: 360 })
  })
})
