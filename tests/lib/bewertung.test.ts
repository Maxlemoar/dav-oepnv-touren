import { describe, it, expect } from 'vitest'
import { bewerte, bewerteAlle, mitMindestVorOrt, passungPaar, sortiere, vorOrtStufe, type Bewertung } from '@/lib/bewertung'
import type { Fahrt, Tagesplan, Ausgangsort } from '@/lib/musterfahrplan/typen'
import type { Zeitfenster } from '@/lib/zeitfenster'

const f = (ab: string, an: string, umstiege = 1): Fahrt => ({ ab, an, umstiege, via: [], fern: false })
const plan: Tagesplan = {
  hin: [f('06:12', '09:41'), f('07:12', '10:41')],
  rueck: [f('17:18', '20:46'), f('18:18', '21:46')],
}
const z = (o: Partial<Zeitfenster> = {}): Zeitfenster => ({
  datum: '2026-10-10', rueck: '2026-10-10', abMin: 360, bisMin: 1260, vorOrtMin: 240, ...o,
})

describe('bewerte', () => {
  it('passt mit längster Zeit vor Ort', () => {
    const b = bewerte({}, plan, plan, z())
    expect(b).toMatchObject({ passt: true, vorOrtMin: 457, naechte: 0 })
    if (b.passt) {
      expect(b.hin.ab).toBe('06:12')
      expect(b.rueck.ab).toBe('17:18')
    }
  })
  it('verfehlt die Mindestzeit', () => {
    expect(bewerte({}, plan, plan, z({ vorOrtMin: 480 }))).toEqual({ passt: false, grund: 'nur 7:37 h vor Ort', naechte: 0 })
  })
  it('Ankunft zu spät für jede Rückfahrt', () => {
    const p: Tagesplan = { hin: [f('09:00', '11:40')], rueck: [f('10:00', '12:30')] }
    expect(bewerte({}, p, p, z())).toMatchObject({ passt: false, grund: 'Ankunft erst 11:40' })
  })
  it('ohne Fahrplandaten', () => {
    expect(bewerte({}, undefined, plan, z())).toMatchObject({ passt: false, grund: 'keine Fahrplandaten' })
    expect(bewerte({}, plan, undefined, z())).toMatchObject({ passt: false, grund: 'keine Fahrplandaten' })
  })
  it('Saison am Rückreisetag', () => {
    const o = { bedient: [{ von: '06-15', bis: '10-15' }] }
    const b = bewerte(o, plan, plan, z({ datum: '2026-10-10', rueck: '2026-10-17' }))
    expect(b).toMatchObject({ passt: false, grund: 'fährt am Datum nicht' })
    expect(bewerte(o, plan, plan, z({ datum: '2026-10-20', rueck: '2026-10-20' }))).toMatchObject({ grund: 'fährt am Datum nicht' })
  })
  it('Saisonhaltestelle mit leerem Plan (Nebensaison berechnet): keine Fahrplandaten statt "keine Hinfahrt"', () => {
    const o = { bedient: [{ von: '06-15', bis: '10-15' }] }
    const leer: Tagesplan = { hin: [], rueck: [] }
    const nurHin: Tagesplan = { hin: plan.hin, rueck: [] }
    expect(bewerte(o, leer, plan, z())).toMatchObject({ passt: false, grund: 'keine Fahrplandaten' })
    expect(bewerte(o, plan, nurHin, z())).toMatchObject({ passt: false, grund: 'keine Fahrplandaten' })
    // Ohne Saisonbetrieb sagt ein leerer Plan etwas aus: es fährt nichts.
    expect(bewerte({}, leer, plan, z())).toMatchObject({ passt: false, grund: 'keine Hinfahrt ab 6:00' })
    // Außerhalb der Saison bleibt es beim Saisongrund.
    expect(bewerte(o, leer, leer, z({ datum: '2026-11-21', rueck: '2026-11-21' }))).toMatchObject({ grund: 'fährt am Datum nicht' })
  })
  it('keine Hinfahrt nach abMin', () => {
    expect(bewerte({}, plan, plan, z({ abMin: 480 }))).toMatchObject({ passt: false, grund: 'keine Hinfahrt ab 8:00' })
    expect(bewerte({}, plan, plan, z({ abMin: 900 }))).toMatchObject({ grund: 'keine Hinfahrt ab 15:00' })
  })
  it('Rückfahrt bis 24:00 und Fenster bis 21:00', () => {
    const p: Tagesplan = { hin: [f('06:12', '09:41')], rueck: [f('22:30', '23:58')] }
    expect(bewerte({}, p, p, z({ bisMin: 1440 }))).toMatchObject({ passt: true })
    expect(bewerte({}, p, p, z({ bisMin: 1260 }))).toMatchObject({ passt: false, grund: 'keine Rückfahrt bis 21:00' })
  })
  it('mehrere Tage ohne Mindestzeit', () => {
    const b = bewerte({}, plan, plan, z({ rueck: '2026-10-12', vorOrtMin: 600 }))
    expect(b.naechte).toBe(2)
    expect(b).toMatchObject({ passt: true, vorOrtMin: 2 * 1440 + (17 * 60 + 18) - (9 * 60 + 41) })
    if (b.passt) {
      // erste Ankunft, letzte Abfahrt
      expect(b.hin.an).toBe('09:41')
      expect(b.rueck.ab).toBe('17:18') // 18:18 kommt erst 21:46, nach bis 21:00
    }
  })
  it('Gleichstand: weniger Umstiege, dann früherer Hin', () => {
    const p: Tagesplan = {
      hin: [f('06:00', '09:00', 2), f('06:30', '09:00', 0)],
      rueck: [f('17:00', '20:00', 1)],
    }
    const b = bewerte({}, p, p, z())
    expect(b.passt && b.hin.ab).toBe('06:30')
    const q: Tagesplan = { hin: [f('06:00', '09:00', 1), f('06:30', '09:00', 1)], rueck: [f('17:00', '20:00', 1)] }
    const c = bewerte({}, q, q, z())
    expect(c.passt && c.hin.ab).toBe('06:00')
  })
})

describe('Fahrten über Mitternacht', () => {
  it('Rückfahrt 23:40 → 00:15 zählt nicht', () => {
    const p: Tagesplan = { hin: [f('06:12', '09:41')], rueck: [f('23:40', '00:15')] }
    expect(bewerte({}, p, p, z({ bisMin: 1440 }))).toMatchObject({ passt: false, grund: 'keine Rückfahrt bis 24:00' })
  })
  it('Hinfahrt 23:00 → 01:10 wird ignoriert', () => {
    const p: Tagesplan = { hin: [f('23:00', '01:10')], rueck: [f('23:50', '23:58')] }
    expect(bewerte({}, p, p, z({ bisMin: 1440 }))).toMatchObject({ passt: false, grund: 'keine Hinfahrt ab 6:00' })
    const q: Tagesplan = { hin: [f('23:00', '01:10'), f('06:12', '09:41')], rueck: [f('17:18', '20:46')] }
    expect(bewerte({}, q, q, z())).toMatchObject({ passt: true })
  })
})

describe('passungPaar', () => {
  it('fehlende Fahrt', () => {
    expect(passungPaar(undefined, f('17:00', '20:00'), z())).toMatchObject({ passt: false, grund: 'keine Hinfahrt ab 6:00' })
    expect(passungPaar(f('06:00', '09:00'), undefined, z())).toMatchObject({ passt: false, grund: 'keine Rückfahrt bis 21:00' })
  })
  it('Rückfahrt vor Ankunft', () => {
    expect(passungPaar(f('09:00', '11:40'), f('10:00', '12:30'), z())).toMatchObject({ grund: 'Ankunft erst 11:40' })
  })
})

describe('vorOrtStufe', () => {
  it('Schwellen', () => {
    expect([480, 479, 360, 359, 240, 239].map(vorOrtStufe)).toEqual([2, 3, 3, 4, 4, 5])
  })
})

describe('sortiere', () => {
  const ort = (id: string, fahrzeitMin?: number) => ({ id, fahrzeitMin }) as Ausgangsort
  const passt = (vorOrtMin: number): Bewertung => ({ passt: true, hin: f('06:00', '09:00'), rueck: f('17:00', '20:00'), vorOrtMin, naechte: 0 })
  const nein: Bewertung = { passt: false, grund: 'x', naechte: 0 }
  it('Tagestour nach Zeit vor Ort', () => {
    const e = [
      { ort: ort('a', 100), bewertung: passt(420) },
      { ort: ort('b', 200), bewertung: nein },
      { ort: ort('c', 300), bewertung: passt(540) },
    ]
    expect(sortiere(e, false).map((x) => x.ort.id)).toEqual(['c', 'a', 'b'])
  })
  it('mehrere Tage nach Fahrzeit, fehlend zuletzt', () => {
    const e = [
      { ort: ort('a'), bewertung: passt(3000) },
      { ort: ort('b', 200), bewertung: passt(2000) },
      { ort: ort('c', 100), bewertung: passt(1000) },
      { ort: ort('d', 50), bewertung: nein },
    ]
    expect(sortiere(e, true).map((x) => x.ort.id)).toEqual(['c', 'b', 'a', 'd'])
  })
})

describe('bewerteAlle', () => {
  const ausgangsort = (id: string, haltestelleId: string): Ausgangsort => ({
    id, haltestelleId, name: id, gebiet: id, region: 'R', land: 'CH', lat: 46, lon: 7,
  })
  const orte = [ausgangsort('kandersteg', 'h-kandersteg'), ausgangsort('ohne', 'h-ohne')]

  it('Schlüssel ist die Gebiets-id, Pläne über die Haltestelle; ohne Plan "keine Fahrplandaten"', () => {
    // 2026-10-10 ist ein Samstag
    const b = bewerteAlle(orte, { sa: { 'h-kandersteg': plan } }, z())
    expect(Object.keys(b).sort()).toEqual(['kandersteg', 'ohne'])
    expect(b.kandersteg).toMatchObject({ passt: true, vorOrtMin: 457 })
    expect(b.ohne).toEqual({ passt: false, grund: 'keine Fahrplandaten', naechte: 0 })
  })
  it('Grund aus bewerte', () => {
    const b = bewerteAlle(orte, { sa: { 'h-kandersteg': plan } }, z({ abMin: 900 }))
    expect(b.kandersteg).toMatchObject({ passt: false, grund: 'keine Hinfahrt ab 15:00' })
  })
  it('falsche Tagesklasse zählt nicht', () => {
    expect(bewerteAlle(orte, { werktag: { 'h-kandersteg': plan } }, z()).kandersteg).toMatchObject({ grund: 'keine Fahrplandaten' })
  })
  it('mehrere Tage: Hin aus der Klasse von datum, Rück aus der Klasse von rueck', () => {
    // Sa 10.10. bis Mo 12.10.: Hinfahrten nur im Samstagsplan, Rückfahrten nur im Werktagsplan
    const plaene = {
      sa: { 'h-kandersteg': { hin: [f('06:12', '09:41')], rueck: [] } },
      werktag: { 'h-kandersteg': { hin: [], rueck: [f('17:18', '20:46')] } },
    }
    const b = bewerteAlle(orte, plaene, z({ rueck: '2026-10-12' }))
    expect(b.kandersteg).toMatchObject({ passt: true, naechte: 2 })
    // vertauscht passt nichts
    const vertauscht = { sa: plaene.werktag, werktag: plaene.sa }
    expect(bewerteAlle(orte, vertauscht, z({ rueck: '2026-10-12' })).kandersteg).toMatchObject({ passt: false })
    // Rückreise fehlt in der Werktagsklasse
    expect(bewerteAlle(orte, { sa: plaene.sa }, z({ rueck: '2026-10-12' })).kandersteg).toMatchObject({ grund: 'keine Fahrplandaten' })
  })
})

describe('mitMindestVorOrt', () => {
  it('wendet die Mindestzeit im Browser an, wie bewerte mit derselben Mindestzeit', () => {
    const ohne = bewerte({}, plan, plan, z({ vorOrtMin: 0 }))
    expect(mitMindestVorOrt(ohne, 480)).toEqual(bewerte({}, plan, plan, z({ vorOrtMin: 480 })))
    expect(mitMindestVorOrt(ohne, 240)).toEqual(bewerte({}, plan, plan, z({ vorOrtMin: 240 })))
    expect(mitMindestVorOrt(ohne, 0)).toBe(ohne)
  })
  it('lässt Gründe und mehrere Tage unverändert', () => {
    const nein: Bewertung = { passt: false, grund: 'keine Rückfahrt bis 21:00', naechte: 0 }
    expect(mitMindestVorOrt(nein, 600)).toBe(nein)
    const mehr = bewerte({}, plan, plan, z({ rueck: '2026-10-11', vorOrtMin: 0 }))
    expect(mitMindestVorOrt(mehr, 600)).toBe(mehr)
  })
})
