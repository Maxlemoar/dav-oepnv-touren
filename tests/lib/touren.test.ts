import { describe, it, expect } from 'vitest'
import { tourMeta } from '@/lib/touren'

const basis = { titel: 'x', url: 'https://a.b/', anbieter: 'alpenvereinaktiv' as const, oeffiTauglich: true }

describe('tourMeta', () => {
  it('formatiert alle Werte in fester Reihenfolge', () => {
    expect(tourMeta({ ...basis, sportart: 'wandern', dauerMin: 135, hoehenmeter: 604, laengeKm: 3.978, schwierigkeit: 'T2' }))
      .toEqual(['Wandern', '2:15 h', '604 hm', '4 km', 'T2'])
  })
  it('lässt fehlende Werte weg und hält eine Nachkommastelle', () => {
    expect(tourMeta({ ...basis, laengeKm: 14.77 })).toEqual(['14,8 km'])
    expect(tourMeta(basis)).toEqual([])
  })
})
