import { describe, it, expect } from 'vitest'
import { lawinendienstFuer, lawinendienste, lawinenRelevant, lawinenSaison, LAWINENDIENSTE } from '@/lib/lawinen'

describe('lawinendienstFuer', () => {
  it('ordnet die Schweiz dem SLF zu', () => {
    expect(lawinendienstFuer({ land: 'CH', region: 'Berner Oberland' })).toBe(LAWINENDIENSTE.slf)
    expect(lawinendienstFuer({ land: 'CH', region: 'Tessin / Bedretto' })?.id).toBe('slf')
  })
  it('unterscheidet in Österreich Vorarlberg und Tirol', () => {
    expect(lawinendienstFuer({ land: 'AT', region: 'Vorarlberg' })?.id).toBe('vorarlberg')
    expect(lawinendienstFuer({ land: 'AT', region: 'Kleinwalsertal (Allgäu)' })?.id).toBe('vorarlberg')
    expect(lawinendienstFuer({ land: 'AT', region: 'Arlberg (Tirol)' })?.id).toBe('tirol')
  })
  it('ordnet das Allgäu Bayern zu', () => {
    expect(lawinendienstFuer({ land: 'DE', region: 'Allgäu' })?.id).toBe('bayern')
  })
  it('kennt für Schwarzwald und Vogesen keinen Dienst', () => {
    expect(lawinendienstFuer({ land: 'DE', region: 'Hochschwarzwald' })).toBeUndefined()
    expect(lawinendienstFuer({ land: 'DE', region: 'Schwäbische Alb' })).toBeUndefined()
    expect(lawinendienstFuer({ land: 'FR', region: 'Vogesen' })).toBeUndefined()
  })
})

describe('lawinendienste', () => {
  it('liefert jeden Dienst nur einmal, in der Reihenfolge der Haltestellen', () => {
    const hs = [
      { land: 'AT' as const, region: 'Kleinwalsertal (Allgäu)' },
      { land: 'DE' as const, region: 'Allgäu' },
      { land: 'AT' as const, region: 'Vorarlberg' },
      { land: 'DE' as const, region: 'Südschwarzwald' },
    ]
    expect(lawinendienste(hs).map((d) => d.id)).toEqual(['vorarlberg', 'bayern'])
  })
})

describe('lawinenRelevant', () => {
  it('gilt für Gebiete mit Skitour oder Schneeschuh', () => {
    expect(lawinenRelevant({ sportarten: ['wandern', 'skitour'] })).toBe(true)
    expect(lawinenRelevant({ sportarten: ['schneeschuh'] })).toBe(true)
    expect(lawinenRelevant({ sportarten: ['wandern', 'klettern'] })).toBe(false)
  })
  it('gilt für Hütten über 1500 m', () => {
    expect(lawinenRelevant({ sportarten: ['wandern'], hoehe: 1915 })).toBe(true)
    expect(lawinenRelevant({ hoehe: 1500 })).toBe(false)
  })
})

describe('lawinenSaison', () => {
  it('reicht vom 1. Dezember bis 30. April', () => {
    expect(lawinenSaison('2026-12-01')).toBe(true)
    expect(lawinenSaison('2027-02-14')).toBe(true)
    expect(lawinenSaison('2027-04-30')).toBe(true)
    expect(lawinenSaison('2027-05-01')).toBe(false)
    expect(lawinenSaison('2026-11-28')).toBe(false)
  })
})
