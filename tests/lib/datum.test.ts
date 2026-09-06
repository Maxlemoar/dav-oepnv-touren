import { describe, it, expect } from 'vitest'
import { lokaleMinuten, lokaleUhrzeit, lokalesDatum, naechsterSamstag, folgetag, zuUtcIso, wochentagKurz, minutenAlsDauer } from '@/lib/datum'

describe('lokaleMinuten', () => {
  it('rechnet Sommerzeit um (UTC+2)', () => {
    expect(lokaleMinuten('2026-09-12T04:30:00Z')).toBe(6 * 60 + 30)
  })
  it('rechnet Winterzeit um (UTC+1)', () => {
    expect(lokaleMinuten('2026-01-10T05:12:00Z')).toBe(6 * 60 + 12)
  })
})

describe('lokaleUhrzeit / lokalesDatum', () => {
  it('formatiert', () => {
    expect(lokaleUhrzeit('2026-09-12T04:30:00Z')).toBe('06:30')
    expect(lokalesDatum('2026-09-12T22:30:00Z')).toBe('2026-09-13')
  })
})

describe('naechsterSamstag', () => {
  it('liefert den kommenden Samstag', () => {
    expect(naechsterSamstag(new Date('2026-09-09T10:00:00Z'))).toBe('2026-09-12') // Mittwoch
  })
  it('liefert heute, wenn heute Samstag ist', () => {
    expect(naechsterSamstag(new Date('2026-09-12T10:00:00Z'))).toBe('2026-09-12')
  })
  it('liefert nächste Woche, wenn heute Sonntag ist', () => {
    expect(naechsterSamstag(new Date('2026-09-13T10:00:00Z'))).toBe('2026-09-19')
  })
})

describe('folgetag', () => {
  it('über Monatsgrenze', () => {
    expect(folgetag('2026-09-30')).toBe('2026-10-01')
  })
})

describe('zuUtcIso', () => {
  it('23:00 lokal im Sommer ist 21:00Z', () => {
    expect(zuUtcIso('2026-09-12', 23 * 60)).toBe('2026-09-12T21:00:00Z')
  })
  it('05:00 lokal im Winter ist 04:00Z', () => {
    expect(zuUtcIso('2026-01-10', 5 * 60)).toBe('2026-01-10T04:00:00Z')
  })
  it('01:00 am Tag der Umstellung auf Sommerzeit ist noch Winterzeit (00:00Z)', () => {
    expect(zuUtcIso('2026-03-29', 60)).toBe('2026-03-29T00:00:00Z')
  })
  it('01:00 am Tag der Umstellung auf Winterzeit ist noch Sommerzeit (23:00Z Vortag)', () => {
    expect(zuUtcIso('2026-10-25', 60)).toBe('2026-10-24T23:00:00Z')
  })
})

describe('wochentagKurz', () => {
  it('Sa für Samstag', () => {
    expect(wochentagKurz('2026-09-12')).toBe('Sa')
  })
})

describe('minutenAlsDauer', () => {
  it('formatiert h:mm', () => {
    expect(minutenAlsDauer(250)).toBe('4:10 h')
    expect(minutenAlsDauer(45)).toBe('0:45 h')
  })
  it('negative Werte mit Vorzeichen', () => {
    expect(minutenAlsDauer(-30)).toBe('-0:30 h')
    expect(minutenAlsDauer(-90)).toBe('-1:30 h')
  })
})
