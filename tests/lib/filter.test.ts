import { describe, it, expect } from 'vitest'
import { filtereGebiete, leseFilter, schreibeFilter, type GebietEintrag } from '@/lib/filter'

const g = (id: string, extra: Partial<GebietEintrag> = {}): GebietEintrag => ({
  id, name: id, beschreibung: '', sportarten: ['wandern'], saison: 'sommer', fahrzeitMin: 200, anzahlHuetten: 1,
  lat: 0, lon: 0, hauptHaltestelleId: id, ...extra,
})

describe('leseFilter', () => {
  it('Standardwerte', () => {
    expect(leseFilter(new URLSearchParams(''))).toEqual({ sport: [], art: 'alle', maxStd: 5, suche: '' })
  })
  it('liest Werte', () => {
    expect(leseFilter(new URLSearchParams('sport=wandern,skitour&art=tag&max=3&q=feld')))
      .toEqual({ sport: ['wandern', 'skitour'], art: 'tag', maxStd: 3, suche: 'feld' })
  })
  it('verwirft unbekannte Sportarten und ungültige Werte', () => {
    expect(leseFilter(new URLSearchParams('sport=wandern,rodeln,&art=x&max=7')))
      .toEqual({ sport: ['wandern'], art: 'alle', maxStd: 5, suche: '' })
  })
})

describe('schreibeFilter', () => {
  it('lässt Standardwerte weg', () => {
    const sp = new URLSearchParams('datum=2026-09-12')
    expect(schreibeFilter(sp, { sport: [], art: 'alle', maxStd: 5, suche: '' }).toString()).toBe('datum=2026-09-12')
    expect(schreibeFilter(sp, { sport: ['wandern'], art: 'nacht', maxStd: 4, suche: 'x' }).toString()).toBe('datum=2026-09-12&sport=wandern&art=nacht&max=4&q=x')
  })
})

describe('filtereGebiete', () => {
  const gebiete = [
    g('a', { fahrzeitMin: 100, sportarten: ['wandern'] }),
    g('b', { fahrzeitMin: 250, sportarten: ['skitour'] }),
    g('c', { fahrzeitMin: 290, sportarten: ['wandern', 'hochtour'], anzahlHuetten: 0 }),
  ]
  it('nach Fahrzeit und Sportart, sortiert nach Fahrzeit', () => {
    expect(filtereGebiete(gebiete, { sport: ['wandern'], art: 'alle', maxStd: 4, suche: '' }, {}).map((x) => x.id)).toEqual(['a'])
    expect(filtereGebiete(gebiete, { sport: [], art: 'alle', maxStd: 5, suche: '' }, {}).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('Tagesziel nutzt die Übersicht, unbekannte bleiben drin', () => {
    const uebersicht = { a: true, b: false }
    expect(filtereGebiete(gebiete, { sport: [], art: 'tag', maxStd: 5, suche: '' }, uebersicht).map((x) => x.id)).toEqual(['a', 'c'])
  })
  it('Übernachtung braucht Hütten', () => {
    expect(filtereGebiete(gebiete, { sport: [], art: 'nacht', maxStd: 5, suche: '' }, {}).map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('Suche im Namen, ohne Groß/Klein', () => {
    expect(filtereGebiete(gebiete, { sport: [], art: 'alle', maxStd: 5, suche: 'B' }, {}).map((x) => x.id)).toEqual(['b'])
  })
})

describe('maxStd 99', () => {
  it('liest max=99 als "alle" und schreibt es in die URL', () => {
    expect(leseFilter(new URLSearchParams('max=99')).maxStd).toBe(99)
    expect(schreibeFilter(new URLSearchParams(''), { sport: [], art: 'alle', maxStd: 99, suche: '' }).toString()).toBe('max=99')
  })
  it('zeigt mit 99 auch Ziele über 5 h', () => {
    const weit = { ...g('z', { fahrzeitMin: 330 }) }
    expect(filtereGebiete([weit], { sport: [], art: 'alle', maxStd: 5, suche: '' }, {})).toHaveLength(0)
    expect(filtereGebiete([weit], { sport: [], art: 'alle', maxStd: 99, suche: '' }, {})).toHaveLength(1)
  })
})
