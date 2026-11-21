import { describe, it, expect } from 'vitest'
import {
  zeitfensterAusUrl, zeitfensterSchreiben, naechte, alsMin, alsUhrzeit, schnellwahl, rueckAnheben, datumAusEingabe, rueckFuerArt,
  STANDARD_ZEITFENSTER, ZEITBAND, VOR_ORT_MAX_MIN, ZEITFENSTER_PARAMETER,
} from '@/lib/zeitfenster'

const HEUTE = '2026-11-19'
const lese = (q: string, opts: { mindestNaechte?: number } = {}) =>
  zeitfensterAusUrl(new URLSearchParams(q), { heute: HEUTE, ...opts })

describe('Konstanten', () => {
  it('trägt die Vorgaben', () => {
    expect(STANDARD_ZEITFENSTER).toEqual({ abMin: 360, bisMin: 1260, vorOrtMin: 240 })
    expect(ZEITBAND).toEqual({ vonMin: 240, bisMin: 1440, schrittMin: 30 })
    expect(VOR_ORT_MAX_MIN).toBe(600)
    expect(ZEITFENSTER_PARAMETER).toEqual(['datum', 'rueck', 'ab', 'bis', 'vorort'])
  })
})

describe('zeitfensterAusUrl', () => {
  it('leere URL: kommender Samstag und Vorgaben', () => {
    expect(lese('')).toEqual({
      datum: '2026-11-21', rueck: '2026-11-21', abMin: 360, bisMin: 1260, vorOrtMin: 240, gewaehlt: false,
    })
  })

  it('übernimmt gültige Werte', () => {
    expect(lese('datum=2026-11-28&ab=07:00&bis=20:30&vorort=180')).toEqual({
      datum: '2026-11-28', rueck: '2026-11-28', abMin: 420, bisMin: 1230, vorOrtMin: 180, gewaehlt: true,
    })
  })

  it('ungültige Werte und altes fenster fallen auf die Vorgaben zurück', () => {
    const z = lese('ab=25:00&bis=05:00&vorort=-5&fenster=360')
    expect([z.abMin, z.bisMin, z.vorOrtMin]).toEqual([360, 1260, 240])
    expect(z.gewaehlt).toBe(false)
  })

  it('Werte außerhalb des Zeitbands sind ungültig', () => {
    const z = lese('ab=03:00&bis=24:30&vorort=601')
    expect([z.abMin, z.bisMin, z.vorOrtMin]).toEqual([360, 1260, 240])
  })

  it('vergangenes Datum: kommender Samstag, nicht gewählt', () => {
    const z = lese('datum=2026-01-01')
    expect(z.datum).toBe('2026-11-21')
    expect(z.gewaehlt).toBe(false)
  })

  it('hebt bis am selben Tag auf ab + 30 an', () => {
    expect(lese('datum=2026-11-28&ab=20:00&bis=19:00').bisMin).toBe(1230)
  })

  it('hebt bis nicht an, wenn die Rückfahrt an einem anderen Tag liegt', () => {
    const z = lese('datum=2026-11-28&rueck=2026-11-29&ab=20:00&bis=19:00')
    expect([z.abMin, z.bisMin]).toEqual([1200, 1140])
  })

  it('hebt rueck auf datum + mindestNaechte an', () => {
    expect(lese('datum=2026-11-28&rueck=2026-11-27', { mindestNaechte: 1 }).rueck).toBe('2026-11-29')
  })

  it('übernimmt eine spätere Rückfahrt', () => {
    expect(lese('datum=2026-11-28&rueck=2026-11-30').rueck).toBe('2026-11-30')
  })

  it('bis=24:00 gilt', () => {
    expect(lese('bis=24:00').bisMin).toBe(1440)
  })

  it('rundet auf 30-Minuten-Schritte', () => {
    expect(lese('ab=06:10').abMin).toBe(360)
    expect(lese('ab=06:20').abMin).toBe(390)
    expect(lese('vorort=100').vorOrtMin).toBe(90)
    expect(lese('vorort=110').vorOrtMin).toBe(120)
  })

  it('vorort 0 und 600 gelten, Nicht-Ganzzahlen nicht', () => {
    expect(lese('vorort=0').vorOrtMin).toBe(0)
    expect(lese('vorort=600').vorOrtMin).toBe(600)
    expect(lese('vorort=abc').vorOrtMin).toBe(240)
    expect(lese('vorort=90.5').vorOrtMin).toBe(240)
  })

  it('heute fehlt: nutzt das aktuelle Datum', () => {
    expect(zeitfensterAusUrl(new URLSearchParams('')).datum).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('zeitfensterSchreiben', () => {
  const z = { datum: '2026-11-28', rueck: '2026-11-28', ...STANDARD_ZEITFENSTER }

  it('lässt Vorgaben weg und löscht fenster', () => {
    const sp = new URLSearchParams('ab=07:00&bis=20:00&vorort=180&fenster=360&x=1')
    const aus = zeitfensterSchreiben(sp, { ...z, abMin: 360, bisMin: 1260, vorOrtMin: 240, rueck: '2026-11-28' })
    expect(aus.get('datum')).toBe('2026-11-28')
    for (const k of ['rueck', 'ab', 'bis', 'vorort', 'fenster']) expect(aus.has(k)).toBe(false)
    expect(aus.get('x')).toBe('1')
  })

  it('schreibt abweichende Werte, rueck nur wenn ≠ datum', () => {
    const aus = zeitfensterSchreiben(new URLSearchParams(), { datum: '2026-11-27', rueck: '2026-11-29', abMin: 420, bisMin: 1440, vorOrtMin: 180 })
    expect(aus.toString()).toBe('datum=2026-11-27&rueck=2026-11-29&ab=07%3A00&bis=24%3A00&vorort=180')
  })

  it('verändert die Eingabe nicht', () => {
    const sp = new URLSearchParams('fenster=360')
    zeitfensterSchreiben(sp, z)
    expect(sp.toString()).toBe('fenster=360')
  })

  it('Rundreise', () => {
    const w = { datum: '2026-11-27', rueck: '2026-11-29', abMin: 450, bisMin: 1380, vorOrtMin: 300 }
    expect(lese(zeitfensterSchreiben(new URLSearchParams(), w).toString())).toEqual({ ...w, gewaehlt: true })
  })
})

describe('naechte', () => {
  it('zählt Tage zwischen datum und rueck', () => {
    expect(naechte({ datum: '2026-11-28', rueck: '2026-11-28' })).toBe(0)
    expect(naechte({ datum: '2026-11-27', rueck: '2026-11-29' })).toBe(2)
  })
})

describe('alsMin / alsUhrzeit', () => {
  it('parst HH:MM', () => {
    expect(alsMin('06:30')).toBe(390)
    expect(alsMin('24:00')).toBe(1440)
    expect(alsMin('6:30')).toBe(390)
  })
  it('lehnt Ungültiges ab', () => {
    for (const s of ['25:00', '24:01', '12:60', 'abc', '', '12', '-1:00']) expect(alsMin(s)).toBeUndefined()
  })
  it('formatiert ohne führende Null', () => {
    expect(alsUhrzeit(390)).toBe('6:30')
    expect(alsUhrzeit(1260)).toBe('21:00')
    expect(alsUhrzeit(1440)).toBe('24:00')
  })
})

describe('bis ohne gewähltes ab', () => {
  it('bis vor dem vorgegebenen ab fällt auf die Vorgabe', () => {
    expect(lese('bis=05:00').bisMin).toBe(1260)
  })
})

describe('ab nach dem vorgegebenen bis', () => {
  it('hebt bis an', () => {
    expect(lese('ab=23:30').bisMin).toBe(1440)
  })
})

describe('Kalenderprüfung und gewaehlt', () => {
  it('Kalenderungültiges datum wirft nicht und gilt als fehlend', () => {
    let z!: ReturnType<typeof lese>
    expect(() => { z = lese('datum=2026-13-45') }).not.toThrow()
    expect(z.datum).toBe('2026-11-21')
    expect(z.gewaehlt).toBe(false)
    expect(lese('datum=2026-02-30').gewaehlt).toBe(false)
  })
  it('Kalenderungültiges rueck fällt auf datum zurück', () => {
    const z = lese('datum=2026-12-01&rueck=2026-99-99')
    expect(z.rueck).toBe('2026-12-01')
    expect(naechte(z)).toBe(0)
  })
  it('gewaehlt nur mit gültigem, nicht vergangenem datum', () => {
    const a = lese('ab=07:00')
    expect(a.abMin).toBe(420)
    expect(a.gewaehlt).toBe(false)
    expect(lese('datum=2026-01-01&rueck=2026-11-22').gewaehlt).toBe(false)
    expect(lese('rueck=2026-11-22').gewaehlt).toBe(false)
    expect(lese('datum=2026-11-19').gewaehlt).toBe(true)
  })
  it('zeitfensterSchreiben ohneDatum lässt datum und rueck weg', () => {
    const sp = new URLSearchParams('datum=2026-11-28&rueck=2026-11-29&x=1')
    const aus = zeitfensterSchreiben(sp, { datum: '2026-11-21', rueck: '2026-11-22', abMin: 420, bisMin: 1260, vorOrtMin: 240 }, { ohneDatum: true })
    expect(aus.toString()).toBe('x=1&ab=07%3A00')
  })
})

describe('schnellwahl', () => {
  it('kommender Samstag und Sonntag mit kurzem Label', () => {
    expect(schnellwahl('2026-11-19')).toEqual([
      { label: 'Sa 21.11.', datum: '2026-11-21' },
      { label: 'So 22.11.', datum: '2026-11-22' },
    ])
  })
  it('beginnt an einem Samstag mit heute', () => {
    expect(schnellwahl('2026-11-21')).toEqual([
      { label: 'Sa 21.11.', datum: '2026-11-21' },
      { label: 'So 22.11.', datum: '2026-11-22' },
    ])
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

describe('datumAusEingabe', () => {
  it('übernimmt nur gültige Daten ab dem frühesten Tag', () => {
    expect(datumAusEingabe('2026-12-05', HEUTE)).toBe('2026-12-05')
    expect(datumAusEingabe(HEUTE, HEUTE)).toBe(HEUTE)
  })
  it('verwirft Zwischenstände beim Tippen, Vergangenes und Unsinn', () => {
    // Chrome meldet beim Tippen der Jahreszahl 0002-12-05, 0020-12-05, 0202-12-05 …
    expect(datumAusEingabe('0002-12-05', HEUTE)).toBeUndefined()
    expect(datumAusEingabe('0202-12-05', HEUTE)).toBeUndefined()
    expect(datumAusEingabe('', HEUTE)).toBeUndefined()
    expect(datumAusEingabe('2026-11-18', HEUTE)).toBeUndefined()
    expect(datumAusEingabe('2026-02-30', '2026-01-01')).toBeUndefined()
  })
})

describe('rueckFuerArt', () => {
  const tag = { datum: '2026-11-21', rueck: '2026-11-21' }
  const mehr = { datum: '2026-11-21', rueck: '2026-11-24' }
  it('wechselt die Art: Mehrere Tage ab dem Folgetag, Tagestour am selben Tag', () => {
    expect(rueckFuerArt(tag, true)).toBe('2026-11-22')
    expect(rueckFuerArt(mehr, false)).toBe('2026-11-21')
  })
  it('lässt die Rückfahrt stehen, wenn die Art schon gilt', () => {
    expect(rueckFuerArt(mehr, true)).toBeUndefined()
    expect(rueckFuerArt(tag, false)).toBeUndefined()
  })
})
