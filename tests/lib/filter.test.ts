import { describe, it, expect } from 'vitest'
import { ausgeblendet, filtereGebiete, leseFilter, passtZurSuche, saisonProblem, schreibeFilter, STANDARD_FILTER, sucheTreffer, type GebietEintrag } from '@/lib/filter'

const g = (id: string, extra: Partial<GebietEintrag> = {}): GebietEintrag => ({
  id, name: id, region: '', beschreibung: '', sportarten: ['wandern'], saison: 'sommer', fahrzeitMin: 200, anzahlHuetten: 1, anzahlTouren: 0, sektionshaus: false,
  huettenNamen: [], tourenTitel: [],
  lat: 0, lon: 0, hauptHaltestelleId: id, ...extra,
})

describe('leseFilter', () => {
  it('Standardwerte', () => {
    expect(leseFilter(new URLSearchParams(''))).toEqual({ nurPassend: true, sport: [], art: 'alle', maxStd: 5, suche: '' })
  })
  it('liest Werte', () => {
    expect(leseFilter(new URLSearchParams('sport=wandern,skitour&art=tag&max=3&q=feld')))
      .toEqual({ nurPassend: true, sport: ['wandern', 'skitour'], art: 'tag', maxStd: 3, suche: 'feld' })
  })
  it('verwirft unbekannte Sportarten und ungültige Werte', () => {
    expect(leseFilter(new URLSearchParams('sport=wandern,rodeln,&art=x&max=7')))
      .toEqual({ nurPassend: true, sport: ['wandern'], art: 'alle', maxStd: 5, suche: '' })
  })
})

describe('schreibeFilter', () => {
  it('lässt Standardwerte weg', () => {
    const sp = new URLSearchParams('datum=2026-09-12')
    expect(schreibeFilter(sp, { nurPassend: true, sport: [], art: 'alle', maxStd: 5, suche: '' }).toString()).toBe('datum=2026-09-12')
    expect(schreibeFilter(sp, { nurPassend: true, sport: ['wandern'], art: 'nacht', maxStd: 4, suche: 'x' }).toString()).toBe('datum=2026-09-12&sport=wandern&art=nacht&max=4&q=x')
  })
})

describe('filtereGebiete', () => {
  const gebiete = [
    g('a', { fahrzeitMin: 100, sportarten: ['wandern'] }),
    g('b', { fahrzeitMin: 250, sportarten: ['skitour'] }),
    g('c', { fahrzeitMin: 290, sportarten: ['wandern', 'hochtour'], anzahlHuetten: 0 }),
  ]
  it('nach Fahrzeit und Sportart, sortiert nach Fahrzeit', () => {
    expect(filtereGebiete(gebiete, { nurPassend: true, sport: ['wandern'], art: 'alle', maxStd: 4, suche: '' }, {}).map((x) => x.id)).toEqual(['a'])
    expect(filtereGebiete(gebiete, { nurPassend: true, sport: [], art: 'alle', maxStd: 5, suche: '' }, {}).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('Tagesziel nutzt die Übersicht, unbekannte bleiben drin', () => {
    const uebersicht = { a: true, b: false }
    expect(filtereGebiete(gebiete, { nurPassend: true, sport: [], art: 'tag', maxStd: 5, suche: '' }, uebersicht).map((x) => x.id)).toEqual(['a', 'c'])
  })
  it('Übernachtung braucht Hütten', () => {
    expect(filtereGebiete(gebiete, { nurPassend: true, sport: [], art: 'nacht', maxStd: 5, suche: '' }, {}).map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('Suche im Namen, ohne Groß/Klein', () => {
    expect(filtereGebiete(gebiete, { nurPassend: true, sport: [], art: 'alle', maxStd: 5, suche: 'B' }, {}).map((x) => x.id)).toEqual(['b'])
  })
  describe('Suche in Region und Beschreibung', () => {
    const suche = (q: string, liste: GebietEintrag[]) => filtereGebiete(liste, { nurPassend: true, sport: [], art: 'alle', maxStd: 5, suche: q }, {}).map((x) => x.id)
    const schwarzwald = [
      g('kinzigtal', { name: 'Kinzigtal', region: 'Mittlerer Schwarzwald', beschreibung: 'Sanfte Höhen im mittleren Schwarzwald.' }),
      g('feldberg', { name: 'Feldberg-Gebiet', region: 'Südschwarzwald', beschreibung: 'Rund um den höchsten Gipfel des Schwarzwalds.' }),
      g('hochstrasse', { name: 'Schwarzwaldhochstraße', region: 'Nordschwarzwald', beschreibung: '' }),
      g('alpstein', { name: 'Alpstein', region: 'Alpstein', beschreibung: 'Säntis und Seealpsee.' }),
      g('grindelwald', { name: 'Grindelwald', region: 'Berner Oberland', beschreibung: 'Eiger-Nordwand vor der Tür.' }),
    ]
    it('trifft die Region', () => {
      expect(suche('schwarzwald', schwarzwald)).toEqual(['kinzigtal', 'feldberg', 'hochstrasse'])
    })
    it('trifft die Beschreibung', () => {
      expect(suche('höchsten gipfel', schwarzwald)).toEqual(['feldberg'])
    })
    it('mehrere Suchwörter müssen alle treffen', () => {
      expect(suche('berner oberland', schwarzwald)).toEqual(['grindelwald'])
      expect(suche('berner schwarzwald', schwarzwald)).toEqual([])
    })
    it('Name ohne Groß/Klein', () => {
      expect(suche('alpstein', schwarzwald)).toEqual(['alpstein'])
    })
    it('diakritik-tolerant', () => {
      expect(suche('sudschwarzwald', schwarzwald)).toEqual(['feldberg'])
      expect(suche('Südschwarzwald', schwarzwald)).toEqual(['feldberg'])
    })
  })
})

describe('maxStd 99', () => {
  it('liest max=99 als "alle" und schreibt es in die URL', () => {
    expect(leseFilter(new URLSearchParams('max=99')).maxStd).toBe(99)
    expect(schreibeFilter(new URLSearchParams(''), { nurPassend: true, sport: [], art: 'alle', maxStd: 99, suche: '' }).toString()).toBe('max=99')
  })
  it('zeigt mit 99 auch Ziele über 5 h', () => {
    const weit = { ...g('z', { fahrzeitMin: 330 }) }
    expect(filtereGebiete([weit], { nurPassend: true, sport: [], art: 'alle', maxStd: 5, suche: '' }, {})).toHaveLength(0)
    expect(filtereGebiete([weit], { nurPassend: true, sport: [], art: 'alle', maxStd: 99, suche: '' }, {})).toHaveLength(1)
  })
})

describe('passtZurSuche', () => {
  it('leere Suche passt immer', () => {
    expect(passtZurSuche('irgendwas', '')).toBe(true)
    expect(passtZurSuche('irgendwas', '   ')).toBe(true)
  })
  it('ohne Groß/Klein und Diakritik, alle Wörter', () => {
    expect(passtZurSuche('Lötschental', 'lotschen')).toBe(true)
    expect(passtZurSuche('Feldberg · Südschwarzwald', 'feldberg schwarz')).toBe(true)
    expect(passtZurSuche('Feldberg · Südschwarzwald', 'feldberg wallis')).toBe(false)
  })
})

describe('Jahreszeit', () => {
  const sommer = g('grimsel', { saison: 'sommer', fahrzeitMin: 200 })
  const ganz = g('feldberg', { saison: 'ganzjaehrig', fahrzeitMin: 100 })
  const bus = g('griesalp', { saison: 'ganzjaehrig', fahrzeitMin: 150, bedient: [{ von: '06-01', bis: '10-15' }] })
  const liste = [ganz, bus, sommer]

  it('saisonProblem nennt Sommerziele außerhalb der Saison und Haltestellen ohne Bus', () => {
    expect(saisonProblem(sommer, '2026-11-14')).toBe('saisonziel')
    expect(saisonProblem(sommer, '2026-07-11')).toBeUndefined()
    expect(saisonProblem(bus, '2026-11-14')).toBe('kein_bus')
    expect(saisonProblem(bus, '2026-07-11')).toBeUndefined()
    expect(saisonProblem(ganz, '2026-11-14')).toBeUndefined()
  })
  it('kein Bus wiegt schwerer als Saisonziel', () => {
    expect(saisonProblem({ ...sommer, bedient: [{ von: '06-01', bis: '10-15' }] }, '2026-11-14')).toBe('kein_bus')
  })
  it('filtert nur mit Datum und eingeschaltetem Schalter', () => {
    expect(filtereGebiete(liste, STANDARD_FILTER, {}, '2026-11-14').map((x) => x.id)).toEqual(['feldberg'])
    expect(filtereGebiete(liste, STANDARD_FILTER, {}).map((x) => x.id)).toEqual(['feldberg', 'griesalp', 'grimsel'])
    expect(filtereGebiete(liste, { ...STANDARD_FILTER, nurPassend: false }, {}, '2026-11-14')).toHaveLength(3)
    expect(filtereGebiete(liste, STANDARD_FILTER, {}, '2026-07-11')).toHaveLength(3)
  })
  it('Schalter steht als saison=alle in der URL, Standard ist an', () => {
    expect(leseFilter(new URLSearchParams('')).nurPassend).toBe(true)
    expect(leseFilter(new URLSearchParams('saison=alle')).nurPassend).toBe(false)
    expect(schreibeFilter(new URLSearchParams(''), { ...STANDARD_FILTER, nurPassend: false }).toString()).toBe('saison=alle')
    expect(schreibeFilter(new URLSearchParams('saison=alle'), STANDARD_FILTER).toString()).toBe('')
  })
})

describe('ausgeblendet', () => {
  const liste = [
    g('nah', { fahrzeitMin: 100, saison: 'ganzjaehrig' }),
    g('sommer', { fahrzeitMin: 200, saison: 'sommer' }),
    g('weit', { fahrzeitMin: 330, saison: 'ganzjaehrig' }),
    g('weit-sommer', { fahrzeitMin: 340, saison: 'sommer' }),
  ]
  it('zählt Ziele, die nur wegen Saison oder Fahrzeit fehlen', () => {
    expect(ausgeblendet(liste, STANDARD_FILTER, {}, '2026-11-14')).toEqual({ saison: 1, fahrzeit: 1 })
  })
  it('ohne Grenze und ohne Saisonfilter ist nichts ausgeblendet', () => {
    expect(ausgeblendet(liste, { ...STANDARD_FILTER, maxStd: 99, nurPassend: false }, {}, '2026-11-14')).toEqual({ saison: 0, fahrzeit: 0 })
  })
  it('im Sommer zählt nur die Fahrzeit', () => {
    expect(ausgeblendet(liste, STANDARD_FILTER, {}, '2026-07-11')).toEqual({ saison: 0, fahrzeit: 2 })
  })
})

describe('Suche in Hütten und Touren', () => {
  const liste = [
    g('kandersteg', { name: 'Kandersteg', huettenNamen: ['Doldenhornhütte'], tourenTitel: ['Oeschinensee-Runde'] }),
    g('feldberg', { name: 'Feldberg' }),
  ]
  const suche = (q: string) => filtereGebiete(liste, { ...STANDARD_FILTER, suche: q }, {}).map((x) => x.id)
  it('findet Gebiete über den Namen einer Hütte', () => {
    expect(suche('doldenhorn')).toEqual(['kandersteg'])
  })
  it('findet Gebiete über den Titel einer Tour', () => {
    expect(suche('oeschinensee')).toEqual(['kandersteg'])
  })
})

describe('sucheTreffer', () => {
  const eintraege = [
    { name: 'Doldenhornhütte', suchtext: 'Kandersteg' },
    { name: 'Blüemlisalphütte', suchtext: 'Kandersteg' },
    { name: 'Feldberg' },
  ]
  it('filtert nach Name und Suchtext, höchstens n', () => {
    expect(sucheTreffer(eintraege, 'kandersteg', 8).map((e) => e.name)).toEqual(['Doldenhornhütte', 'Blüemlisalphütte'])
    expect(sucheTreffer(eintraege, 'kandersteg', 1)).toHaveLength(1)
    expect(sucheTreffer(eintraege, 'dolden', 8).map((e) => e.name)).toEqual(['Doldenhornhütte'])
  })
  it('leere Suche liefert nichts', () => {
    expect(sucheTreffer(eintraege, '  ', 8)).toEqual([])
  })
})
