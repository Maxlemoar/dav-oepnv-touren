import { describe, it, expect } from 'vitest'
import {
  basisUrl, absoluteUrl, ersterSatz, gebietBeschreibung, huetteBeschreibung, seitenMetadaten,
  gebietBeschreibungFuer, huetteBeschreibungFuer,
  gebietJsonLd, huetteJsonLd, jsonLdText, juengsterRichtwert, datumTTMMJJJJ, sitemapEintraege,
  STANDARD_BASIS_URL, OG_BILD,
} from '@/lib/metadaten'
import { ladeInhalt } from '@/lib/content/laden'

describe('basisUrl', () => {
  it('fällt ohne Wert auf den Standard zurück', () => {
    expect(basisUrl(undefined)).toBe(STANDARD_BASIS_URL)
    expect(basisUrl('  ')).toBe(STANDARD_BASIS_URL)
    expect(basisUrl('kein url')).toBe(STANDARD_BASIS_URL)
  })
  it('entfernt den abschließenden Schrägstrich', () => {
    expect(basisUrl('https://touren.example.org/')).toBe('https://touren.example.org')
  })
  it('baut absolute URLs', () => {
    expect(absoluteUrl('/gebiet/x', 'https://a.example')).toBe('https://a.example/gebiet/x')
    expect(absoluteUrl('ueber', 'https://a.example')).toBe('https://a.example/ueber')
  })
})

describe('ersterSatz', () => {
  it('nimmt den ersten Satz', () => {
    expect(ersterSatz('Oeschinensee und Gemmipass. Der Klassiker im Berner Oberland.')).toBe('Oeschinensee und Gemmipass.')
  })
  it('übergeht Abkürzungen und Ordnungszahlen', () => {
    expect(ersterSatz('St. Anton ist ca. 4 h entfernt, z. B. über Zürich. Danach Bus.')).toBe('St. Anton ist ca. 4 h entfernt, z. B. über Zürich.')
    expect(ersterSatz('Ab dem 1. Mai fährt der Bus. Sonst nicht.')).toBe('Ab dem 1. Mai fährt der Bus.')
  })
  it('endet nach Klammer und gibt Text ohne Satzende ganz zurück', () => {
    expect(ersterSatz('Ins Verwall (Ulmer Hütte). Im Sommer Bus.')).toBe('Ins Verwall (Ulmer Hütte).')
    expect(ersterSatz('  Nur ein Satz  ohne Punkt ')).toBe('Nur ein Satz ohne Punkt')
  })
})

describe('Beschreibungen', () => {
  it('Gebiet: erster Satz plus Anreise mit Richtwert', () => {
    expect(gebietBeschreibung({ beschreibung: 'Drei SAC-Hütten ab Bahnhof. Der Klassiker.' }, 'Offenburg', 250))
      .toBe('Drei SAC-Hütten ab Bahnhof. Ab Offenburg mit Bahn und Bus, ca. 4:10 h.')
  })
  it('Gebiet ohne Richtwert und ohne Satzzeichen', () => {
    expect(gebietBeschreibung({ beschreibung: 'Feldberg' }, 'Offenburg')).toBe('Feldberg. Ab Offenburg mit Bahn und Bus.')
  })
  it('Hütte mit Betreiber, Zustieg und Anreise', () => {
    const h = { name: 'Doldenhornhütte', hoehe: 1915, betreiber: { typ: 'sac' as const, sektion: 'Emmental' }, geschaetzt: true }
    expect(huetteBeschreibung(h, { haltestelle: 'Kandersteg', gehzeitMin: 150 }, 'Offenburg'))
      .toBe('Doldenhornhütte (1915 m), SAC Emmental, Zustieg ca. 2:30 h ab Kandersteg, ab Offenburg mit Bahn und Bus.')
    expect(huetteBeschreibung({ ...h, geschaetzt: false, betreiber: { typ: 'privat' } }, { haltestelle: 'Wasserauen', gehzeitMin: 20, bergbahn: true }, 'Offenburg'))
      .toBe('Doldenhornhütte (1915 m), privat, Zustieg 0:20 h mit Bergbahn ab Wasserauen, ab Offenburg mit Bahn und Bus.')
  })
})

describe('seitenMetadaten', () => {
  it('setzt Canonical, Open Graph, Twitter und das Vorschaubild', () => {
    const m = seitenMetadaten({ titel: 'Kandersteg', beschreibung: 'B', pfad: '/gebiet/kandersteg' })
    expect(m.alternates?.canonical).toBe('/gebiet/kandersteg')
    expect(m.description).toBe('B')
    expect(m.openGraph).toMatchObject({ title: 'Kandersteg', description: 'B', url: '/gebiet/kandersteg', locale: 'de_DE', images: [OG_BILD] })
    expect(m.twitter).toMatchObject({ card: 'summary_large_image', images: [OG_BILD] })
  })
})

describe('JSON-LD', () => {
  it('Gebiet als TouristDestination mit Koordinaten', () => {
    const j = gebietJsonLd({ id: 'kandersteg', name: 'Kandersteg', lat: 46.49, lon: 7.67 }, 'B', 'https://a.example')
    expect(j).toMatchObject({
      '@type': 'TouristDestination', name: 'Kandersteg', description: 'B', url: 'https://a.example/gebiet/kandersteg',
      geo: { '@type': 'GeoCoordinates', latitude: 46.49, longitude: 7.67 },
    })
  })
  it('Hütte als LodgingBusiness mit Höhe und eigener Webseite', () => {
    const basis = { id: 'x', name: 'X-Hütte', lat: 46, lon: 7, hoehe: 1915 }
    const mitWeb = huetteJsonLd({ ...basis, webUrl: 'https://huette.example' }, 'B', 'https://a.example')
    expect(mitWeb).toMatchObject({ '@type': 'LodgingBusiness', url: 'https://huette.example', mainEntityOfPage: 'https://a.example/huette/x' })
    expect(mitWeb.additionalProperty).toEqual([{ '@type': 'PropertyValue', name: 'Höhe', value: 1915, unitCode: 'MTR', unitText: 'm' }])
    expect(huetteJsonLd(basis, 'B', 'https://a.example').url).toBe('https://a.example/huette/x')
  })
  it('maskiert spitze Klammern', () => {
    expect(jsonLdText({ name: '</script><b>' })).toBe('{"name":"\\u003c/script>\\u003cb>"}')
  })
})

describe('Datenstand', () => {
  it('findet das jüngste berechnetAm', () => {
    const r = (berechnetAm: string) => ({ fahrzeitMin: 1, umstiege: 0, takt: 'stuendlich' as const, ticket: 'keins' as const, berechnetAm })
    expect(juengsterRichtwert([{ richtwerte: { a: r('2026-09-07') } }, { richtwerte: { a: r('2026-10-01'), b: r('2026-08-01') } }, { richtwerte: {} }])).toBe('2026-10-01')
    expect(juengsterRichtwert([])).toBeUndefined()
  })
  it('formatiert TT.MM.JJJJ', () => {
    expect(datumTTMMJJJJ('2026-09-07')).toBe('07.09.2026')
  })
})

describe('sitemapEintraege', () => {
  it('enthält feste Seiten, alle Gebiete und Hütten', () => {
    const e = sitemapEintraege({ gebiete: [{ id: 'g' }], huetten: [{ id: 'h' }] }, 'https://a.example')
    expect(e.map((x) => x.url)).toEqual([
      'https://a.example/', 'https://a.example/sektionstouren', 'https://a.example/ueber',
      'https://a.example/impressum', 'https://a.example/datenschutz',
      'https://a.example/gebiet/g', 'https://a.example/huette/h',
    ])
  })
  it('deckt den echten Inhalt ohne doppelte URLs ab', () => {
    const i = ladeInhalt()
    const urls = sitemapEintraege(i).map((x) => x.url)
    expect(urls).toHaveLength(5 + i.gebiete.length + i.huetten.length)
    expect(new Set(urls).size).toBe(urls.length)
  })
  it('jede Gebietsbeschreibung endet mit der Anreise und bleibt kurz genug', () => {
    for (const g of ladeInhalt().gebiete) {
      const b = gebietBeschreibung(g, 'Offenburg', 250)
      expect(b.endsWith('Ab Offenburg mit Bahn und Bus, ca. 4:10 h.')).toBe(true)
      expect(b.length).toBeLessThan(400)
    }
  })
})

describe('Beschreibungen aus dem Inhalt', () => {
  const i = {
    startorte: [
      { id: 'kehl', name: 'Kehl', haltestelleId: 'x', lat: 0, lon: 0, sichtbar: false },
      { id: 'offenburg', name: 'Offenburg', haltestelleId: 'x', lat: 0, lon: 0, sichtbar: true },
    ],
    haltestellen: [{
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'x', lat: 0, lon: 0, land: 'CH' as const, region: 'R',
      richtwerte: {
        kehl: { fahrzeitMin: 300, umstiege: 2, takt: 'stuendlich' as const, ticket: 'keins' as const, berechnetAm: '2026-09-07' },
        offenburg: { fahrzeitMin: 250, umstiege: 1, takt: 'stuendlich' as const, ticket: 'keins' as const, berechnetAm: '2026-09-07' },
      },
    }],
  }
  it('Gebiet nimmt den sichtbaren Startort und die erste Haltestelle', () => {
    expect(gebietBeschreibungFuer(i, { beschreibung: 'Drei Hütten. Mehr.', haltestellen: ['kandersteg'] }))
      .toBe('Drei Hütten. Ab Offenburg mit Bahn und Bus, ca. 4:10 h.')
    expect(gebietBeschreibungFuer(i, { beschreibung: 'Ohne Richtwert.', haltestellen: ['unbekannt'] }))
      .toBe('Ohne Richtwert. Ab Offenburg mit Bahn und Bus.')
  })
  it('Hütte nimmt den ersten Zustieg', () => {
    const h = { name: 'Doldenhornhütte', hoehe: 1915, betreiber: { typ: 'sac' as const }, geschaetzt: false,
      zustiege: [{ haltestelleId: 'kandersteg', gehzeitMin: 150, hoehenmeter: 700, bergbahn: false }] }
    expect(huetteBeschreibungFuer(i, h)).toBe('Doldenhornhütte (1915 m), SAC, Zustieg 2:30 h ab Kandersteg, ab Offenburg mit Bahn und Bus.')
  })
})
