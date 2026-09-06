import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { ladeInhalt } from '@/lib/content/laden'
import { karteGeoJson } from '@/lib/karte'

const FIX = path.resolve(__dirname, '../fixtures/content')

describe('karteGeoJson', () => {
  it('erzeugt Gebiets- und Hüttenpunkte mit Stufe', () => {
    const fc = karteGeoJson(ladeInhalt(FIX), 'offenburg')
    expect(fc.type).toBe('FeatureCollection')
    const gebiet = fc.features.find((f) => f.properties.typ === 'gebiet')!
    expect(gebiet.geometry).toEqual({ type: 'Point', coordinates: [7.671, 46.495] })
    expect(gebiet.properties).toMatchObject({ id: 'kandersteg', name: 'Kandersteg', fahrzeitMin: 250, stufe: 5, huetten: 1 })
    const huette = fc.features.find((f) => f.properties.typ === 'huette')!
    expect(huette.properties).toMatchObject({ id: 'doldenhornhuette', betreiber: 'sac', gebietId: 'kandersteg' })
  })

  it('ohne Richtwert bleiben Fahrzeit und Stufe null', () => {
    const fc = karteGeoJson(ladeInhalt(FIX), 'unbekannt')
    const gebiet = fc.features.find((f) => f.properties.typ === 'gebiet')!
    expect(gebiet.properties).toMatchObject({ fahrzeitMin: null, stufe: null })
  })
})
