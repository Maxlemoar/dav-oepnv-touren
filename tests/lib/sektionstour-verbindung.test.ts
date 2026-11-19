import { describe, it, expect } from 'vitest'
import { machbar, sektionstourAnfrage } from '@/lib/sektionstour-verbindung'
import type { VerbindungAntwort } from '@/lib/verbindung/service'

const kurz = { ab: '2026-12-12T06:00:00Z', an: '2026-12-12T10:00:00Z', dauerMin: 240, umstiege: 1, fernverkehr: false, abschnitte: [] }
const basis: VerbindungAntwort = { quelle: 'live', datum: '2026-12-12', rueckfahrtDatum: '2026-12-13', naechte: 1, ticket: { ticket: 'halbtax', hinweis: 'CH' } }
const fahrt = { ab: '07:00', an: '11:00', umstiege: 1, via: [], fern: false }
const richtwert = { fahrzeitMin: 250, umstiege: 1, takt: 'stuendlich' as const, ticket: 'halbtax' as const, berechnetAm: '2026-09-07' }

describe('sektionstourAnfrage', () => {
  it('fragt ohne Angabe in der Seiten-URL von 5:00 bis 23:00 an', () => {
    const q = new URLSearchParams(sektionstourAnfrage('offenburg', 'kandersteg', '2026-12-12', '2026-12-13', new URLSearchParams()))
    expect(Object.fromEntries(q)).toEqual({ von: 'offenburg', nach: 'kandersteg', datum: '2026-12-12', rueck: '2026-12-13', ab: '05:00', bis: '23:00' })
  })
  it('übernimmt ab, bis und vorort aus der Seiten-URL', () => {
    const q = new URLSearchParams(sektionstourAnfrage('offenburg', 'kandersteg', '2026-12-12', '2026-12-12', new URLSearchParams('ab=07:00&vorort=300&datum=2027-01-01')))
    expect(q.get('ab')).toBe('07:00')
    expect(q.get('bis')).toBe('23:00')
    expect(q.get('vorort')).toBe('300')
    expect(q.get('datum')).toBe('2026-12-12')
  })
})

describe('machbar', () => {
  it('ohne Antwort nicht machbar', () => {
    expect(machbar(undefined)).toBe(false)
  })
  it('folgt der Passung, auch gegen gefundene Fahrten', () => {
    expect(machbar({ ...basis, hinfahrt: kurz, rueckfahrt: kurz, passung: { passt: true, hin: fahrt, rueck: fahrt, vorOrtMin: 1500, naechte: 1 } })).toBe(true)
    expect(machbar({ ...basis, hinfahrt: kurz, rueckfahrt: kurz, passung: { passt: false, grund: 'fährt am Datum nicht', naechte: 1 } })).toBe(false)
    expect(machbar({ ...basis, quelle: 'richtwert', richtwert, fehlerArt: 'fahrplan_noch_nicht_verfuegbar', passung: { passt: false, grund: 'keine Rückfahrt bis 23:00', naechte: 1 } })).toBe(false)
  })
  it('ohne Passung: live mit Hin- und Rückfahrt, sonst Richtwert nach liveBis', () => {
    expect(machbar({ ...basis, hinfahrt: kurz, rueckfahrt: kurz })).toBe(true)
    expect(machbar({ ...basis, hinfahrt: kurz })).toBe(false)
    expect(machbar({ ...basis, quelle: 'richtwert', richtwert, fehlerArt: 'fahrplan_noch_nicht_verfuegbar' })).toBe(true)
    expect(machbar({ ...basis, quelle: 'richtwert', richtwert, fehlerArt: 'dienst_nicht_erreichbar' })).toBe(false)
  })
})
