import { describe, it, expect } from 'vitest'
import { abweichungText, fahrtenAnfrage, fahrtenStatus, fahrtSchluessel, merkenswert, neueFahrten, umstiegKnopfText, verbindungAnfrage, vorauswahl, vorOrtText, zeitfensterKurz } from '@/lib/fahrtenwahl'
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

describe('fahrtenStatus', () => {
  const leer = { ...antwort, hin: [], rueckfahrten: [] }

  it('nennt "keine Verbindung" bei fehlerArt keine_verbindung, mit dem Hinweis der API', () => {
    expect(fahrtenStatus({ ...leer, fehlerArt: 'keine_verbindung' }))
      .toEqual({ art: 'keine_verbindung', text: 'Am gewählten Datum keine passende Verbindung gefunden.' })
    expect(fahrtenStatus({ ...leer, quelle: 'typisch', fehlerArt: 'keine_verbindung', hinweis: 'Bus nur im Sommer' }))
      .toEqual({ art: 'keine_verbindung', text: 'Bus nur im Sommer' })
  })

  it('nennt "keine Verbindung", wenn live ohne Fehler nichts kommt', () => {
    expect(fahrtenStatus(leer)).toEqual({ art: 'keine_verbindung', text: 'Am gewählten Datum keine passende Verbindung gefunden.' })
  })

  it('meldet einen Ausfall statt "keine Verbindung", wenn der Live-Fahrplan fehlt', () => {
    expect(fahrtenStatus({ ...leer, quelle: 'typisch', fehlerArt: 'dienst_nicht_erreichbar' }))
      .toEqual({ art: 'typisch', text: 'Live-Fahrplan gerade nicht erreichbar.', leer: true })
    expect(fahrtenStatus({ ...leer, quelle: 'typisch' }))
      .toEqual({ art: 'typisch', text: 'Live-Fahrplan gerade nicht erreichbar.', leer: true })
  })

  it('zeigt nach liveBis den Hinweis der API', () => {
    expect(fahrtenStatus({ ...antwort, quelle: 'typisch', fehlerArt: 'fahrplan_noch_nicht_verfuegbar', hinweis: 'Ab 13.12. noch offen.' }))
      .toEqual({ art: 'typisch', text: 'Ab 13.12. noch offen.', leer: false })
  })

  it('reicht bei Live-Fahrten einen Teilhinweis durch', () => {
    expect(fahrtenStatus(antwort)).toEqual({ art: 'live' })
    expect(fahrtenStatus({ ...antwort, hinweis: 'Rückfahrt nach typischem Fahrplan' }))
      .toEqual({ art: 'live', hinweis: 'Rückfahrt nach typischem Fahrplan' })
  })
})

describe('merkenswert', () => {
  it('merkt nur vollständige Live-Antworten', () => {
    expect(merkenswert(antwort)).toBe(true)
    expect(merkenswert({ ...antwort, quelle: 'typisch' })).toBe(false)
    expect(merkenswert({ ...antwort, fehlerArt: 'keine_verbindung' })).toBe(false)
    expect(merkenswert({ ...antwort, hinweis: 'Hinfahrt nach typischem Fahrplan' })).toBe(false)
  })
})

describe('verbindungAnfrage', () => {
  const zf = (o: Partial<Zeitfenster> = {}): Zeitfenster => ({ datum: DATUM, rueck: DATUM, abMin: 360, bisMin: 1260, vorOrtMin: 240, ...o })
  it('hängt nicht von "mindestens vor Ort" ab: der Schieber löst keine neue Live-Anfrage aus', () => {
    const a = verbindungAnfrage('offenburg', 'kandersteg', zf({ vorOrtMin: 240 }), 0)
    expect(verbindungAnfrage('offenburg', 'kandersteg', zf({ vorOrtMin: 480 }), 0)).toBe(a)
    expect(verbindungAnfrage('offenburg', 'kandersteg', zf({ vorOrtMin: 0 }), 0)).toBe(a)
    // vorort=0: der Server beurteilt ohne Mindestzeit, der Browser wendet sie an (mitMindestVorOrt).
    expect(new URLSearchParams(a).get('vorort')).toBe('0')
  })
  it('trägt Orte, Datum, rueck und abweichende Zeiten, bei Hütten mindestnaechte', () => {
    const q = new URLSearchParams(verbindungAnfrage('offenburg', 'h', zf({ rueck: '2026-11-22', abMin: 420 }), 1))
    expect(Object.fromEntries(q)).toEqual({ von: 'offenburg', nach: 'h', datum: DATUM, rueck: '2026-11-22', ab: '07:00', vorort: '0', mindestnaechte: '1' })
    expect(new URLSearchParams(verbindungAnfrage('offenburg', 'h', zf(), 0)).get('rueck')).toBe(DATUM)
  })
})

describe('umstiegKnopfText', () => {
  it('nennt bei Direktfahrten Details statt Umstiege', () => {
    expect(umstiegKnopfText(0, false)).toBe('Details')
    expect(umstiegKnopfText(1, false)).toBe('Umstiege')
    expect(umstiegKnopfText(2, false)).toBe('Umstiege')
    expect(umstiegKnopfText(0, true)).toBe('Weniger')
    expect(umstiegKnopfText(2, true)).toBe('Weniger')
  })
})
