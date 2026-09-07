import { describe, it, expect } from 'vitest'
import { zeitraumVorschlaege, rueckAnheben, naechteText } from '@/lib/zeitraum'

describe('zeitraumVorschlaege', () => {
  it('liefert Sa, So, Wochenende und Fr–So rund um den Samstag', () => {
    expect(zeitraumVorschlaege('2026-09-12')).toEqual([
      { label: 'Sa', datum: '2026-09-12', rueck: '2026-09-12' },
      { label: 'So', datum: '2026-09-13', rueck: '2026-09-13' },
      { label: 'Wochenende', datum: '2026-09-12', rueck: '2026-09-13' },
      { label: 'Fr–So', datum: '2026-09-11', rueck: '2026-09-13' },
    ])
  })
  it('rechnet über die Monatsgrenze', () => {
    const v = zeitraumVorschlaege('2026-10-31')
    expect(v[2]).toEqual({ label: 'Wochenende', datum: '2026-10-31', rueck: '2026-11-01' })
    expect(v[3].datum).toBe('2026-10-30')
  })
})

describe('rueckAnheben', () => {
  it('behält eine spätere Rückfahrt', () => {
    expect(rueckAnheben('2026-09-12', '2026-09-13')).toBe('2026-09-13')
  })
  it('hebt eine fehlende oder frühere Rückfahrt auf das Hin-Datum', () => {
    expect(rueckAnheben('2026-09-12', undefined)).toBe('2026-09-12')
    expect(rueckAnheben('2026-09-12', '2026-09-11')).toBe('2026-09-12')
  })
  it('hält bei Hütten mindestens eine Nacht ein', () => {
    expect(rueckAnheben('2026-09-12', '2026-09-12', 1)).toBe('2026-09-13')
    expect(rueckAnheben('2026-09-12', undefined, 1)).toBe('2026-09-13')
    expect(rueckAnheben('2026-09-12', '2026-09-15', 1)).toBe('2026-09-15')
  })
})

describe('naechteText', () => {
  it('Singular und Plural', () => {
    expect(naechteText(1)).toBe('1 Nacht')
    expect(naechteText(2)).toBe('2 Nächte')
  })
})
