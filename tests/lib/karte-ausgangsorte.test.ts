import { describe, it, expect } from 'vitest'
import { escapeHtml, hoverHtml, karteDaten } from '@/lib/karte-ausgangsorte'
import type { Bewertung } from '@/lib/bewertung'
import type { Ausgangsort, Fahrt, Linie } from '@/lib/musterfahrplan/typen'

const f = (ab: string, an: string): Fahrt => ({ ab, an, umstiege: 1, via: [], fern: false })
const ort = (id: string, o: Partial<Ausgangsort> = {}): Ausgangsort => ({
  id, haltestelleId: `h-${id}`, name: id, gebiet: id, region: 'Berner Oberland', land: 'CH', lat: 46.5, lon: 7.7, ...o,
})
const orte = [ort('kandersteg', { name: 'Kandersteg', fahrzeitMin: 200 }), ort('bad-urach', { name: 'Bad Urach' })]
const linie: Linie = [[7.946, 48.476], [7.68, 46.49]]
const strecken: Record<string, Linie[]> = { 'h-kandersteg': [linie], 'h-bad-urach': [linie] }
const passt: Bewertung = { passt: true, hin: f('06:12', '09:41'), rueck: f('17:18', '20:46'), vorOrtMin: 457, naechte: 0 }
const passtNicht: Bewertung = { passt: false, grund: 'keine Rückfahrt bis 21:00', naechte: 0 }

describe('karteDaten', () => {
  it('ohne Bewertungen keine Punkte und keine Linien', () => {
    const d = karteDaten(orte, strecken, null, false)
    expect(d.punkte.features).toHaveLength(0)
    expect(d.linien.features).toHaveLength(0)
  })

  it('passender Ort: Stufe nach Zeit vor Ort, Rang in Minuten, eine Linie', () => {
    const d = karteDaten(orte, strecken, { kandersteg: passt }, false)
    expect(d.punkte.features).toHaveLength(1)
    const p = d.punkte.features[0]
    expect(p.geometry).toEqual({ type: 'Point', coordinates: [7.7, 46.5] })
    // vorOrtStufe(457) = 3 (≥ 360 min)
    expect(p.properties).toEqual({
      id: 'kandersteg', name: 'Kandersteg', passt: true, stufe: 3, rang: 457,
      zeile: '6:12 → 9:41 · 17:18 → 20:46 · 7:37 h vor Ort',
    })
    expect(d.linien.features).toHaveLength(1)
    expect(d.linien.features[0].geometry).toEqual({ type: 'MultiLineString', coordinates: [linie] })
    expect(d.linien.features[0].properties).toEqual({ id: 'kandersteg', stufe: 3, rang: 457 })
  })

  it('Stufe 4 ab 4 h vor Ort', () => {
    const b: Bewertung = { ...passt, vorOrtMin: 300 }
    expect(karteDaten(orte, strecken, { kandersteg: b }, false).punkte.features[0].properties).toMatchObject({ stufe: 4, rang: 300 })
  })

  it('nicht passender Ort: grauer Punkt mit Grund, keine Linie', () => {
    const d = karteDaten(orte, strecken, { 'bad-urach': passtNicht }, false)
    expect(d.punkte.features).toHaveLength(1)
    expect(d.punkte.features[0].properties).toMatchObject({ id: 'bad-urach', passt: false, zeile: 'keine Rückfahrt bis 21:00' })
    expect(d.linien.features).toHaveLength(0)
  })

  it('passender Ort ohne Strecke: Punkt, aber keine Linie', () => {
    const d = karteDaten(orte, {}, { kandersteg: passt }, false)
    expect(d.punkte.features).toHaveLength(1)
    expect(d.linien.features).toHaveLength(0)
  })

  it('mehrere Tage: Stufe nach Fahrzeit, Nächte statt Zeit vor Ort', () => {
    const b: Bewertung = { ...passt, vorOrtMin: 1440 + 457, naechte: 1 }
    const p = karteDaten(orte, strecken, { kandersteg: b }, true).punkte.features[0].properties
    // reisezeitStufe(200) = 4
    expect(p).toMatchObject({ stufe: 4, rang: 1897, zeile: '6:12 → 9:41 · 17:18 → 20:46 · 1 Nacht' })
  })
})

describe('hoverHtml', () => {
  it('Name fett, darunter die Zeile, alles escaped', () => {
    const html = hoverHtml({ name: 'A<b>', zeile: 'x < y & "z"' })
    expect(html).toContain('<strong')
    expect(html).toContain('A&lt;b&gt;')
    expect(html).toContain('x &lt; y &amp; &quot;z&quot;')
    expect(html).not.toContain('<b>')
  })
})

describe('escapeHtml', () => {
  it('ersetzt die fünf Sonderzeichen', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
  })
})
