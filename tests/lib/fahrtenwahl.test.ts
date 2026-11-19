import { describe, it, expect } from 'vitest'
import { abweichungText, fahrtenAnfrage, fahrtSchluessel, neueFahrten, vorauswahl, vorOrtText, zeitfensterKurz } from '@/lib/fahrtenwahl'
import { zuUtcIso } from '@/lib/datum'
import type { FahrtenAntwort, FahrtLive, Lage } from '@/lib/verbindung/fahrten'
import type { Zeitfenster } from '@/lib/zeitfenster'

const DATUM = '2026-11-21'
const min = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3))

/** Fahrt mit lokalen Zeiten (Europe/Berlin) am Datum. */
function fahrt(ab: string, an: string, lage: Lage = 'passend', umstiege = 1, datum = DATUM): FahrtLive {
  return {
    ab: zuUtcIso(datum, min(ab)), an: zuUtcIso(datum, min(an)), dauerMin: min(an) - min(ab), umstiege,
    fernverkehr: true, abschnitte: [], via: ['Basel SBB'], lage,
  }
}

const z: Zeitfenster = { datum: DATUM, rueck: DATUM, abMin: 360, bisMin: 1260, vorOrtMin: 240 }

const antwort: FahrtenAntwort = {
  quelle: 'live', datum: DATUM, rueck: DATUM,
  hin: [fahrt('05:12', '08:51', 'frueher'), fahrt('06:12', '09:41'), fahrt('07:12', '10:41')],
  rueckfahrten: [fahrt('16:18', '19:46'), fahrt('17:18', '20:46'), fahrt('18:18', '21:46', 'spaeter')],
  ticket: { ticket: 'halbtax', hinweis: 'Halbtax' },
}

describe('vorauswahl', () => {
  it('wählt das passende Paar mit der größten Zeit vor Ort', () => {
    expect(vorauswahl(antwort, z)).toEqual({ hin: 1, rueck: 1 })
  })

  it('nimmt bei gleicher Zeit vor Ort das Paar mit weniger Umstiegen', () => {
    const a = { ...antwort, hin: [fahrt('06:12', '09:41', 'passend', 2), fahrt('06:42', '09:41', 'passend', 0)] }
    expect(vorauswahl(a, z)).toEqual({ hin: 1, rueck: 1 })
  })

  it('wählt bei mehreren Tagen die früheste passende Hinfahrt und die späteste passende Rückfahrt', () => {
    const rueck = '2026-11-22'
    const a: FahrtenAntwort = {
      ...antwort, rueck,
      rueckfahrten: [fahrt('15:18', '18:46', 'passend', 1, rueck), fahrt('16:18', '19:46', 'passend', 1, rueck), fahrt('18:18', '21:46', 'spaeter', 1, rueck)],
    }
    expect(vorauswahl(a, { ...z, rueck })).toEqual({ hin: 1, rueck: 1 })
  })

  it('lässt eine Richtung ohne passende Fahrt leer', () => {
    const a = { ...antwort, rueckfahrten: [fahrt('18:18', '21:46', 'spaeter')] }
    expect(vorauswahl(a, z)).toEqual({ hin: 1 })
    expect(vorauswahl({ ...antwort, hin: [], rueckfahrten: [] }, z)).toEqual({})
  })
})

describe('vorOrtText', () => {
  it('nennt Zeit vor Ort mit Ankunft und Abfahrt', () => {
    expect(vorOrtText(fahrt('06:12', '09:41'), fahrt('17:18', '20:46'), 0)).toBe('7:37 h vor Ort (9:41 bis 17:18)')
  })

  it('erkennt eine Rückfahrt vor der Ankunft', () => {
    expect(vorOrtText(fahrt('06:12', '09:41'), fahrt('09:00', '12:30'), 0)).toBe('Rückfahrt vor der Ankunft')
  })

  it('nennt bei mehreren Tagen die Nächte', () => {
    expect(vorOrtText(fahrt('06:12', '09:41'), fahrt('17:18', '20:46', 'passend', 1, '2026-11-22'), 1)).toBe('1 Nacht')
    expect(vorOrtText(undefined, undefined, 2)).toBe('2 Nächte')
  })

  it('fordert ohne Auswahl zur Wahl auf', () => {
    expect(vorOrtText(fahrt('06:12', '09:41'), undefined, 0)).toBe('Hin- und Rückfahrt wählen')
  })
})

describe('zeitfensterKurz', () => {
  it('nennt Datum und Zeitfenster', () => {
    expect(zeitfensterKurz(z)).toBe('Sa 21.11., 6:00–21:00')
    expect(zeitfensterKurz({ ...z, rueck: '2026-11-22', abMin: 450 })).toBe('Sa 21.11. – So 22.11., 7:30–21:00')
  })
})

describe('abweichungText', () => {
  it('rundet auf Viertelstunden', () => {
    expect(abweichungText(DATUM, 47)).toBe('Am Sa 21.11. rund 0:45 h länger als üblich')
    expect(abweichungText(DATUM, 60)).toBe('Am Sa 21.11. rund 1:00 h länger als üblich')
  })
})

describe('fahrtSchluessel', () => {
  it('besteht aus Abfahrt und Ankunft', () => {
    expect(fahrtSchluessel(fahrt('06:12', '09:41'))).toBe('2026-11-21T05:12:00Z|2026-11-21T08:41:00Z')
  })
})

describe('fahrtenAnfrage', () => {
  it('trägt Orte, Datum und abweichende Zeiten, aber nicht vorort', () => {
    expect(fahrtenAnfrage('offenburg', 'kandersteg', z)).toBe('von=offenburg&nach=kandersteg&datum=2026-11-21')
    expect(fahrtenAnfrage('offenburg', 'kandersteg', { ...z, rueck: '2026-11-22', abMin: 450, vorOrtMin: 300 }))
      .toBe('von=offenburg&nach=kandersteg&datum=2026-11-21&rueck=2026-11-22&ab=07%3A30')
  })
})

describe('neueFahrten', () => {
  it('lässt bekannte und doppelte Fahrten weg', () => {
    const bekannt = [fahrt('06:12', '09:41'), fahrt('07:12', '10:41')]
    const geladen = [fahrt('07:12', '10:41'), fahrt('08:12', '11:41'), fahrt('08:12', '11:41'), fahrt('09:12', '12:41')]
    expect(neueFahrten(bekannt, geladen).map((f) => f.ab)).toEqual([geladen[1].ab, geladen[3].ab])
  })
})
