import { describe, it, expect, vi } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { verbindungErmitteln } from '@/lib/verbindung/service'
import { TransitousFehler, type Itinerary } from '@/lib/verbindung/transitous'
import { hatFernverkehr } from '@/lib/verbindung/auswerten'
import type { Startort, Haltestelle, TicketTabelle } from '@/lib/content/schema'

const startort: Startort = { id: 'offenburg', name: 'Offenburg', haltestelleId: 'de:og', lat: 48.4, lon: 7.9, sichtbar: true }
const haltestelle: Haltestelle = {
  id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch:ka', lat: 46.4, lon: 7.6, land: 'CH', region: 'BO',
  richtwerte: { offenburg: { fahrzeitMin: 250, umstiege: 2, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' } },
}
const tickets: TicketTabelle = {
  regeln: [{ land: 'CH', ticket: 'halbtax', hinweis: 'CH' }, { land: 'DE', ticket: 'deutschlandticket', hinweis: 'DE' }],
  fernverkehrHinweis: 'Fern',
}
/** Bezugstag vor den Testdaten und Fahrplangrenze danach. */
const zeit = { heute: '2026-09-06', fahrplan: { liveBis: '2026-12-12', hinweis: 'Fahrplan ab 13.12. fehlt noch.' } }
const hin = fixture as Itinerary[]
const rueck: Itinerary[] = [
  { startTime: '2026-09-12T14:14:00Z', endTime: '2026-09-12T17:56:00Z', duration: 1, transfers: 2, legs: [] },
  { startTime: '2026-09-12T16:14:00Z', endTime: '2026-09-12T20:38:00Z', duration: 1, transfers: 2, legs: [] },
]

describe('verbindungErmitteln', () => {
  it('liefert live Hinfahrt, Rückfahrt, Tourenfenster und Tagesziel', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.tourenfensterMin).toBe(454) // 10:40 bis 18:14
    expect(a.tagesziel).toBe(false) // Ankunft 10:40 ist nach 10:00
    expect(a.naechte).toBe(0)
    expect(a.rueckfahrtDatum).toBe('2026-09-12')
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
    // Hinfahrt: Abfahrt ab 05:00 lokal = 03:00Z im Sommer; Rückfahrt: Ankunft bis 23:00 lokal = 21:00Z
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T03:00:00Z', ankunftBis: false, anzahl: 12 })
    expect(planen.mock.calls[1][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', zeit: '2026-09-12T21:00:00Z', ankunftBis: true })
    // Koordinaten als Ausweg, falls Transitous eine Kennung nicht mehr kennt
    expect(planen.mock.calls[0][0]).toMatchObject({ vonKoord: { lat: 48.4, lon: 7.9 }, nachKoord: { lat: 46.4, lon: 7.6 } })
    expect(planen.mock.calls[1][0]).toMatchObject({ vonKoord: { lat: 46.4, lon: 7.6 }, nachKoord: { lat: 48.4, lon: 7.9 } })
    expect(a.tageszielGrund).toBe('Ankunft erst 10:40')
    expect(a.fehlerArt).toBeUndefined()
  })

  it('fragt die Hinfahrt im Winter ab 04:00Z ab (05:00 CET)', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    await verbindungErmitteln({ startort, haltestelle, datum: '2027-01-09', rueckfahrtDatum: '2027-01-09', mindestFensterMin: 360, tickets, heute: '2027-01-01', fahrplan: { liveBis: '2027-12-12', hinweis: 'x' } }, { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2027-01-09T04:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2027-01-09T22:00:00Z', ankunftBis: true })
  })

  it('fragt Rückfahrt am Folgetag ab und setzt kein Tagesziel-Urteil', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-13', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T21:00:00Z' })
    expect(a.rueckfahrt?.ab).toBe('2026-09-13T16:14:00Z')
    expect(a.rueckfahrtDatum).toBe('2026-09-13')
    expect(a.naechte).toBe(1)
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
  })

  it('rechnet zwei Nächte von Freitag bis Sonntag', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : hin.map((h) => ({ ...h, startTime: h.startTime.replace('12T', '11T'), endTime: h.endTime.replace('12T', '11T') }))))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-11', rueckfahrtDatum: '2026-09-13', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2026-09-11T03:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T21:00:00Z', ankunftBis: true })
    expect(a.datum).toBe('2026-09-11')
    expect(a.rueckfahrtDatum).toBe('2026-09-13')
    expect(a.naechte).toBe(2)
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
  })

  it('fällt auf den Richtwert zurück, wenn Transitous fehlschlägt', async () => {
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('richtwert')
    expect(a.naechte).toBe(0)
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinfahrt).toBeUndefined()
    expect(a.ticket.ticket).toBe('halbtax')
  })

  it('nimmt im Fallback das Ticket aus dem Richtwert', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE', richtwerte: { offenburg: { ...haltestelle.richtwerte.offenburg, ticket: 'keins' } } }
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('richtwert')
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })

  it('nutzt im Fallback ohne Richtwert die Tabelle', async () => {
    const ohne: Haltestelle = { ...haltestelle, richtwerte: {} }
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle: ohne, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.richtwert).toBeUndefined()
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })

  it('liefert die Hinfahrt live, wenn nur die Rückfahrt-Abfrage fehlschlägt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return hin
    })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt).toBeUndefined()
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
    expect(a.fehler).toMatch(/503/)
  })

  it('liefert die Rückfahrt live, wenn nur die Hinfahrt-Abfrage fehlschlägt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (!p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return rueck
    })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt).toBeUndefined()
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.fehler).toMatch(/503/)
  })

  it('Fernverkehr in DE ergibt Ticket keins, wenn es keine Nahverkehrsalternative gibt', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin.filter(hatFernverkehr)))
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })

  it('in DE wird die Nahverkehrsverbindung bevorzugt und das Deutschlandticket empfohlen', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:12:00Z')
    expect(a.hinfahrt?.fernverkehr).toBe(false)
    expect(a.ticket).toEqual({ ticket: 'deutschlandticket', hinweis: 'DE' })
  })

  it('in CH bleibt die schnellste Verbindung trotz Nahverkehrsalternative', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
  })
})

describe('verbindungErmitteln: Fehlerarten', () => {
  const mitFenster: Haltestelle = {
    ...haltestelle,
    richtwerte: { offenburg: { ...haltestelle.richtwerte.offenburg, tagesfenster: { sa: { ankunft: '09:10', letzteRueckfahrt: '17:20' }, so: { ankunft: '10:40', letzteRueckfahrt: '17:20' } } } },
  }
  const anfrage = (datum: string, rueckfahrtDatum = datum, h: Haltestelle = mitFenster) =>
    ({ startort, haltestelle: h, datum, rueckfahrtDatum, mindestFensterMin: 360, tickets, ...zeit })

  it('vergangenes Datum: keine Anfrage, datum_vergangen', async () => {
    const planen = vi.fn(async () => hin)
    const a = await verbindungErmitteln(anfrage('2026-09-05'), { planen })
    expect(planen).not.toHaveBeenCalled()
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'datum_vergangen' })
    expect(a.richtwert?.fahrzeitMin).toBe(250)
  })

  it('heute gilt nicht als vergangen', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-06'), { planen })
    expect(planen).toHaveBeenCalled()
    expect(a.fehlerArt).not.toBe('datum_vergangen')
  })

  it('Datum nach liveBis: keine Anfrage, Richtwert mit Hinweis und Urteil aus dem Tagesfenster', async () => {
    const planen = vi.fn(async () => hin)
    const a = await verbindungErmitteln(anfrage('2026-12-19'), { planen }) // Samstag
    expect(planen).not.toHaveBeenCalled()
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'fahrplan_noch_nicht_verfuegbar', hinweis: 'Fahrplan ab 13.12. fehlt noch.', tagesziel: true })
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.ticket.ticket).toBe('halbtax')
    expect(a.fehler).toBeUndefined()
  })

  it('Tagesfenster nach Tagesklasse: Sonntag mit später Ankunft', async () => {
    const a = await verbindungErmitteln(anfrage('2026-12-20'), { planen: vi.fn(async () => hin) })
    expect(a).toMatchObject({ tagesziel: false, tageszielGrund: 'Ankunft erst 10:40' })
  })

  it('ohne Tagesfenster für die Tagesklasse kein Urteil', async () => {
    const a = await verbindungErmitteln(anfrage('2026-12-18'), { planen: vi.fn(async () => hin) }) // Freitag
    expect(a.tagesziel).toBeUndefined()
  })

  it('nur das Rückdatum nach liveBis reicht schon', async () => {
    const planen = vi.fn(async () => hin)
    const a = await verbindungErmitteln(anfrage('2026-12-12', '2026-12-13'), { planen })
    expect(planen).not.toHaveBeenCalled()
    expect(a).toMatchObject({ fehlerArt: 'fahrplan_noch_nicht_verfuegbar', naechte: 1 })
    expect(a.tagesziel).toBeUndefined()
  })

  it('nach liveBis und außerhalb der Bedienzeit: keine_verbindung mit Saisonhinweis', async () => {
    const saison: Haltestelle = { ...mitFenster, bedient: [{ von: '06-15', bis: '10-15' }], bedientHinweis: 'Postauto nur im Sommer' }
    const a = await verbindungErmitteln(anfrage('2026-12-19', '2026-12-19', saison), { planen: vi.fn(async () => hin) })
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'keine_verbindung', hinweis: 'Postauto nur im Sommer', tagesziel: false })
  })

  it('live ohne Hinfahrt im Zeitfenster: keine_verbindung, Richtwert bleibt dabei', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : []))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a).toMatchObject({ quelle: 'live', fehlerArt: 'keine_verbindung', tagesziel: false })
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinweis).toBeUndefined()
  })

  it('live ohne Hinfahrt außerhalb der Bedienzeit nennt den Saisonbetrieb', async () => {
    const saison: Haltestelle = { ...mitFenster, bedient: [{ von: '06-15', bis: '09-01' }] }
    const planen = vi.fn(async () => [] as Itinerary[])
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', saison), { planen })
    expect(a).toMatchObject({ fehlerArt: 'keine_verbindung', hinweis: 'Am Datum keine Busverbindung (Saisonbetrieb)' })
  })

  it('Überlast oder Serverfehler: dienst_nicht_erreichbar', async () => {
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen: vi.fn(async () => { throw new TransitousFehler('Transitous HTTP 429', 429) }) })
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'dienst_nicht_erreichbar' })
    expect(a.fehler).toMatch(/429/)
    const b = await verbindungErmitteln(anfrage('2026-09-12'), { planen: vi.fn(async () => { throw new TransitousFehler('weg', undefined, true) }) })
    expect(b.fehlerArt).toBe('dienst_nicht_erreichbar')
  })

  it('nur die Hinfahrt scheitert am Dienst: dienst_nicht_erreichbar trotz Rückfahrt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (!p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return rueck
    })
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a).toMatchObject({ quelle: 'live', fehlerArt: 'dienst_nicht_erreichbar' })
  })

  it('anderer Fehler (z. B. 404 auch nach Koordinaten): keine Fehlerart, aber Fehlertext', async () => {
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen: vi.fn(async () => { throw new TransitousFehler('Transitous HTTP 404', 404) }) })
    expect(a.quelle).toBe('richtwert')
    expect(a.fehlerArt).toBeUndefined()
    expect(a.fehler).toMatch(/404/)
  })
})

describe('spätere Hinfahrten statt "keine Verbindung"', () => {
  const nur = (abUtc: string, anUtc: string): Itinerary[] => [{ startTime: abUtc, endTime: anUtc, duration: 1, transfers: 1, legs: [] }]
  it('nimmt eine Abfahrt zwischen 8 und 9 Uhr als Hinfahrt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : nur('2026-09-12T06:10:00Z', '2026-09-12T10:20:00Z')))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T06:10:00Z') // 08:10 lokal
    expect(a.fehlerArt).toBeUndefined()
    expect(a.tageszielGrund).toBe('Ankunft erst 12:20')
  })
  it('nimmt bei Hüttentouren auch eine Abfahrt am Vormittag', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : nur('2026-09-12T09:30:00Z', '2026-09-12T13:40:00Z')))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-13', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T09:30:00Z') // 11:30 lokal
    expect(a.fehlerArt).toBeUndefined()
  })
  it('meldet keine Verbindung erst, wenn vor 14 Uhr gar nichts fährt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : nur('2026-09-12T13:30:00Z', '2026-09-12T17:40:00Z')))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrtDatum: '2026-09-12', mindestFensterMin: 360, tickets, ...zeit }, { planen })
    expect(a.hinfahrt).toBeUndefined()
    expect(a.fehlerArt).toBe('keine_verbindung')
  })
})

describe('Tagesfenster außerhalb der Saison', () => {
  const saisonal: Haltestelle = {
    ...haltestelle, bedient: [{ von: '06-01', bis: '10-20' }],
    richtwerte: { offenburg: { ...haltestelle.richtwerte.offenburg, tagesfenster: { sa: {}, so: {}, werktag: {} } } },
  }
  it('gibt im Sommer kein Urteil aus einem im Winter berechneten leeren Fenster', async () => {
    const planen = vi.fn(async () => { throw new TransitousFehler('nicht erreichbar', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle: saisonal, datum: '2027-07-03', rueckfahrtDatum: '2027-07-03', mindestFensterMin: 360, tickets, heute: '2027-07-01', fahrplan: { liveBis: '2026-12-12', hinweis: 'x' } }, { planen })
    expect(a.fehlerArt).toBe('fahrplan_noch_nicht_verfuegbar')
    expect(a.tagesziel).toBeUndefined()
  })
})
