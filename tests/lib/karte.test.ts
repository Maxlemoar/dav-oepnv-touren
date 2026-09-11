import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { ladeInhalt } from '@/lib/content/laden'
import { karteGeoJson, popupHtml } from '@/lib/karte'

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

describe('popupHtml', () => {
  const gebiet = { typ: 'gebiet', id: 'kandersteg', name: 'Kandersteg', fahrzeitMin: 250, sportarten: 'wandern,hochtour,unbekannt' }

  it('Gebiet: Link, Fahrzeit, Sportarten-Labels und Tagesziel', () => {
    const html = popupHtml('/gebiet/kandersteg', gebiet, true)
    expect(html).toContain('<a href="/gebiet/kandersteg"')
    expect(html).toContain('>Kandersteg</a>')
    expect(html).toContain('ca. 4:10 h')
    expect(html).toContain('Wandern, Hochtour')
    expect(html).not.toContain('unbekannt')
    expect(html).toContain('Tagesziel')
  })

  it('kein Tagesziel wird als Übernachtungsempfehlung gezeigt, unbekannt lässt die Zeile weg', () => {
    expect(popupHtml('/gebiet/kandersteg', gebiet, false)).toContain('Besser mit Übernachtung')
    const ohne = popupHtml('/gebiet/kandersteg', gebiet, undefined)
    expect(ohne).not.toContain('Tagesziel')
    expect(ohne).not.toContain('Übernachtung')
  })

  it('Hütte: nur Höhe, Name wird escaped', () => {
    const html = popupHtml('/huette/x', { typ: 'huette', id: 'x', name: 'Hütte <A&B>', hoehe: 1915 }, undefined)
    expect(html).toContain('Hütte &lt;A&amp;B&gt;')
    expect(html).toContain('1915 m')
    expect(html).not.toContain('Tagesziel')
  })
})

describe('Häuser der eigenen Sektion', () => {
  it('markiert Gebiete mit einem Haus der Sektion Offenburg', () => {
    const i = ladeInhalt(FIX)
    const ohne = karteGeoJson(i, 'offenburg').features.find((f) => f.properties.typ === 'gebiet')!
    expect(ohne.properties).toMatchObject({ sektionshaus: false })

    const mit = karteGeoJson(
      { ...i, huetten: [{ ...i.huetten[0], betreiber: { typ: 'dav', sektion: 'Offenburg' } }] },
      'offenburg',
    ).features.find((f) => f.properties.typ === 'gebiet')!
    expect(mit.properties).toMatchObject({ sektionshaus: true })
  })
  it('nennt das Haus der Sektion im Popup', () => {
    expect(popupHtml('/gebiet/x', { typ: 'gebiet', name: 'X', sektionshaus: true }, undefined)).toContain('Haus der Sektion')
    expect(popupHtml('/gebiet/x', { typ: 'gebiet', name: 'X', sektionshaus: false }, undefined)).not.toContain('Haus der Sektion')
  })
})
