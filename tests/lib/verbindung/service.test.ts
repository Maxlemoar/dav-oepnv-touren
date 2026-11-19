import { describe, it, expect, vi } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { verbindungErmitteln, type VerbindungAnfrage } from '@/lib/verbindung/service'
import { TransitousFehler, type Itinerary, type PlanParameter } from '@/lib/verbindung/transitous'
import { hatFernverkehr } from '@/lib/verbindung/auswerten'
import type { Startort, Haltestelle, TicketTabelle } from '@/lib/content/schema'
import type { Musterfahrplan, Tagesplan } from '@/lib/musterfahrplan/typen'
import { STANDARD_ZEITFENSTER, type Zeitfenster } from '@/lib/zeitfenster'

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
  { startTime: '2026-09-12T14:14:00Z', endTime: '2026-09-12T17:56:00Z', duration: 1, transfers: 2, legs: [] }, // 16:14 → 19:56 lokal
  { startTime: '2026-09-12T16:14:00Z', endTime: '2026-09-12T20:38:00Z', duration: 1, transfers: 2, legs: [] }, // 18:14 → 22:38 lokal
]
const amTag = (its: Itinerary[], tag: string) =>
  its.map((i) => ({ ...i, startTime: i.startTime.replace('2026-09-12', tag), endTime: i.endTime.replace('2026-09-12', tag) }))

const fenster = (datum: string, rueckDatum = datum, zeiten: Partial<Zeitfenster> = {}): Zeitfenster =>
  ({ datum, rueck: rueckDatum, ...STANDARD_ZEITFENSTER, ...zeiten })
/** Anfrage mit dem Standard-Zeitfenster (los ab 6:00, zurück bis 21:00, mindestens 4 h vor Ort). */
const anfrage = (datum: string, rueckDatum = datum, extra: Partial<VerbindungAnfrage> & { zeiten?: Partial<Zeitfenster> } = {}): VerbindungAnfrage => {
  const { zeiten, ...rest } = extra
  return { startort, haltestelle, z: fenster(datum, rueckDatum, zeiten), tickets, ...zeit, ...rest }
}

const plan = (hinAb: string, hinAn: string, rueckAb: string, rueckAn: string): Tagesplan => ({
  hin: [{ ab: hinAb, an: hinAn, umstiege: 2, via: [], fern: true }],
  rueck: [{ ab: rueckAb, an: rueckAn, umstiege: 2, via: [], fern: true }],
})
const muster: Musterfahrplan = {
  startortId: 'offenburg', berechnetAm: '2026-11-19', liveBis: '2026-12-12', referenzTage: {},
  orte: { kandersteg: { plaene: { sa: plan('06:12', '09:41', '16:20', '20:02'), so: plan('08:12', '11:41', '13:20', '17:02') } } },
}
const mitMuster = (m: Musterfahrplan = muster) => () => m
const ohneMuster = () => undefined
const scheitert = vi.fn(async () => { throw new TransitousFehler('Transitous HTTP 503', 503) })

describe('verbindungErmitteln', () => {
  it('liefert live Hinfahrt, Rückfahrt und die Passung zum Zeitfenster', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z') // 06:30 lokal, an 10:40
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T14:14:00Z') // die spätere kommt erst nach 21:00 an
    expect(a.passung).toMatchObject({ passt: true, vorOrtMin: 334, naechte: 0 }) // 10:40 bis 16:14
    expect(a.naechte).toBe(0)
    expect(a.rueckfahrtDatum).toBe('2026-09-12')
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
    // Hinfahrt: Abfahrt ab 06:00 lokal = 04:00Z im Sommer; Rückfahrt: Ankunft bis 21:00 lokal = 19:00Z
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T04:00:00Z', ankunftBis: false, anzahl: 12 })
    expect(planen.mock.calls[1][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', zeit: '2026-09-12T19:00:00Z', ankunftBis: true })
    // Koordinaten als Ausweg, falls Transitous eine Kennung nicht mehr kennt
    expect(planen.mock.calls[0][0]).toMatchObject({ vonKoord: { lat: 48.4, lon: 7.9 }, nachKoord: { lat: 46.4, lon: 7.6 } })
    expect(planen.mock.calls[1][0]).toMatchObject({ vonKoord: { lat: 46.4, lon: 7.6 }, nachKoord: { lat: 48.4, lon: 7.9 } })
    expect(a.fehlerArt).toBeUndefined()
    expect(a).not.toHaveProperty('tagesziel')
    expect(a).not.toHaveProperty('tourenfensterMin')
  })

  it('bei ab 07:00 keine Hinfahrt vor 07:00, Abfrage ab 07:00', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { zeiten: { abMin: 420 } }), { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2026-09-12T05:00:00Z', ankunftBis: false })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T05:12:00Z') // 07:12 lokal
    expect(a.hinfahrtSpaeter).toBeUndefined()
  })

  it('bei ab 07:00 und nur früheren Abfahrten: keine Verbindung statt einer Fahrt vor 07:00', async () => {
    const frueh = hin.filter((i) => Date.parse(i.startTime) < Date.parse('2026-09-12T05:00:00Z'))
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : frueh))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { zeiten: { abMin: 420 } }), { planen })
    expect(a.hinfahrt).toBeUndefined()
    expect(a.fehlerArt).toBe('keine_verbindung')
    expect(a.passung).toEqual({ passt: false, grund: 'keine Hinfahrt ab 7:00', naechte: 0 })
  })

  it('fragt die Rückfahrt mit Ankunft bis "zurück bis" ab und wählt nur Ankünfte bis dahin', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { zeiten: { bisMin: 1380 } }), { planen })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-12T21:00:00Z', ankunftBis: true })
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.passung).toMatchObject({ passt: true, vorOrtMin: 454 }) // 10:40 bis 18:14
  })

  it('nennt den Grund, wenn die Zeit vor Ort nicht reicht', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { zeiten: { vorOrtMin: 360 } }), { planen })
    expect(a.passung).toEqual({ passt: false, grund: 'nur 5:34 h vor Ort', naechte: 0 })
  })

  it('fragt die Hinfahrt im Winter ab 05:00Z ab (06:00 MEZ)', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    await verbindungErmitteln(anfrage('2027-01-09', '2027-01-09', { heute: '2027-01-01', fahrplan: { liveBis: '2027-12-12', hinweis: 'x' } }), { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2027-01-09T05:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2027-01-09T20:00:00Z', ankunftBis: true })
  })

  it('fragt Rückfahrt am Folgetag ab, Passung mit einer Nacht', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? amTag(rueck, '2026-09-13') : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-13'), { planen })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T19:00:00Z' })
    expect(a.rueckfahrt?.ab).toBe('2026-09-13T14:14:00Z')
    expect(a.rueckfahrtDatum).toBe('2026-09-13')
    expect(a.naechte).toBe(1)
    expect(a.passung).toMatchObject({ passt: true, naechte: 1 })
  })

  it('rechnet zwei Nächte von Freitag bis Sonntag', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? amTag(rueck, '2026-09-13') : amTag(hin, '2026-09-11')))
    const a = await verbindungErmitteln(anfrage('2026-09-11', '2026-09-13'), { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ zeit: '2026-09-11T04:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T19:00:00Z', ankunftBis: true })
    expect(a.datum).toBe('2026-09-11')
    expect(a.rueckfahrtDatum).toBe('2026-09-13')
    expect(a.naechte).toBe(2)
    expect(a.passung).toMatchObject({ passt: true, naechte: 2 })
  })

  it('fällt auf den Richtwert zurück, wenn Transitous fehlschlägt', async () => {
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen: scheitert, muster: ohneMuster })
    expect(a.quelle).toBe('richtwert')
    expect(a.naechte).toBe(0)
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinfahrt).toBeUndefined()
    expect(a.ticket.ticket).toBe('halbtax')
    expect(a.passung).toBeUndefined()
  })

  it('nimmt im Fallback das Ticket aus dem Richtwert', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE', richtwerte: { offenburg: { ...haltestelle.richtwerte.offenburg, ticket: 'keins' } } }
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { haltestelle: de }), { planen: scheitert, muster: mitMuster() })
    expect(a.quelle).toBe('richtwert')
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })

  it('nutzt im Fallback ohne Richtwert die Tabelle', async () => {
    const ohne: Haltestelle = { ...haltestelle, richtwerte: {} }
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { haltestelle: ohne }), { planen: scheitert, muster: mitMuster() })
    expect(a.richtwert).toBeUndefined()
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })

  it('liefert die Hinfahrt live, wenn nur die Rückfahrt-Abfrage fehlschlägt; ohne Rückfahrt keine Passung', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return hin
    })
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt).toBeUndefined()
    expect(a.passung).toBeUndefined()
    expect(a.fehler).toMatch(/503/)
  })

  it('live ohne Rückfahrt bis "zurück bis": Passung nennt die Rückfahrt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? [] : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.passung).toEqual({ passt: false, grund: 'keine Rückfahrt bis 21:00', naechte: 0 })
  })

  it('liefert die Rückfahrt live, wenn nur die Hinfahrt-Abfrage fehlschlägt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (!p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return rueck
    })
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt).toBeUndefined()
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T14:14:00Z')
    expect(a.passung).toBeUndefined()
    expect(a.fehler).toMatch(/503/)
  })

  it('Fernverkehr in DE ergibt Ticket keins, wenn es keine Nahverkehrsalternative gibt', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin.filter(hatFernverkehr)))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { haltestelle: de }), { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })

  it('in DE wird die Nahverkehrsverbindung bevorzugt und das Deutschlandticket empfohlen', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { haltestelle: de }), { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:12:00Z')
    expect(a.hinfahrt?.fernverkehr).toBe(false)
    expect(a.ticket).toEqual({ ticket: 'deutschlandticket', hinweis: 'DE' })
  })

  it('in CH bleibt die schnellste Verbindung trotz Nahverkehrsalternative', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
  })
})

describe('verbindungErmitteln: Fehlerarten', () => {
  const deps = (planen: (p: PlanParameter) => Promise<Itinerary[]> = vi.fn(async () => hin)) => ({ planen, muster: mitMuster() })

  it('vergangenes Datum: keine Anfrage, datum_vergangen', async () => {
    const planen = vi.fn(async () => hin)
    const a = await verbindungErmitteln(anfrage('2026-09-05'), deps(planen))
    expect(planen).not.toHaveBeenCalled()
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'datum_vergangen' })
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.passung).toBeUndefined()
  })

  it('heute gilt nicht als vergangen', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-06'), deps(planen))
    expect(planen).toHaveBeenCalled()
    expect(a.fehlerArt).not.toBe('datum_vergangen')
  })

  it('Datum nach liveBis: keine Anfrage, Richtwert mit Hinweis und Passung aus dem Musterfahrplan', async () => {
    const planen = vi.fn(async () => hin)
    const a = await verbindungErmitteln(anfrage('2026-12-19'), deps(planen)) // Samstag
    expect(planen).not.toHaveBeenCalled()
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'fahrplan_noch_nicht_verfuegbar', hinweis: 'Fahrplan ab 13.12. fehlt noch.' })
    expect(a.passung).toMatchObject({ passt: true, vorOrtMin: 399, naechte: 0 }) // 09:41 bis 16:20
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.ticket.ticket).toBe('halbtax')
    expect(a.fehler).toBeUndefined()
  })

  it('Musterfahrplan nach Tagesklasse: Sonntag mit zu wenig Zeit vor Ort', async () => {
    const a = await verbindungErmitteln(anfrage('2026-12-20'), deps())
    expect(a.passung).toEqual({ passt: false, grund: 'nur 1:39 h vor Ort', naechte: 0 })
  })

  it('Hinfahrt aus der Klasse des Hin-, Rückfahrt aus der des Rückdatums', async () => {
    const a = await verbindungErmitteln(anfrage('2026-12-19', '2026-12-20'), deps())
    expect(a.passung).toMatchObject({ passt: true, naechte: 1, hin: { ab: '06:12' }, rueck: { ab: '13:20' } })
  })

  it('ohne Plan für die Tagesklasse keine Passung', async () => {
    const a = await verbindungErmitteln(anfrage('2026-12-18'), deps()) // Freitag
    expect(a.fehlerArt).toBe('fahrplan_noch_nicht_verfuegbar')
    expect(a.passung).toBeUndefined()
  })

  it('ohne Eintrag im Musterfahrplan oder für einen anderen Startort keine Passung', async () => {
    const ohne = await verbindungErmitteln(anfrage('2026-12-19'), { planen: vi.fn(async () => hin), muster: mitMuster({ ...muster, orte: {} }) })
    expect(ohne.passung).toBeUndefined()
    const fremd = await verbindungErmitteln(anfrage('2026-12-19'), { planen: vi.fn(async () => hin), muster: mitMuster({ ...muster, startortId: 'kehl' }) })
    expect(fremd.passung).toBeUndefined()
  })

  it('Dienst nicht erreichbar: Passung aus dem Musterfahrplan, einmal geladen', async () => {
    const laden = vi.fn(() => muster)
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen: scheitert, muster: laden })
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'dienst_nicht_erreichbar' })
    expect(a.passung).toMatchObject({ passt: true, vorOrtMin: 399 })
    expect(laden).toHaveBeenCalledTimes(1)
  })

  it('live braucht den Musterfahrplan nicht', async () => {
    const laden = vi.fn(() => muster)
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    await verbindungErmitteln(anfrage('2026-09-12'), { planen, muster: laden })
    expect(laden).not.toHaveBeenCalled()
  })

  it('nur das Rückdatum nach liveBis reicht schon', async () => {
    const planen = vi.fn(async () => hin)
    const a = await verbindungErmitteln(anfrage('2026-12-12', '2026-12-13'), deps(planen))
    expect(planen).not.toHaveBeenCalled()
    expect(a).toMatchObject({ fehlerArt: 'fahrplan_noch_nicht_verfuegbar', naechte: 1 })
    expect(a.passung).toMatchObject({ passt: true, naechte: 1 })
  })

  it('nach liveBis und außerhalb der Bedienzeit: keine_verbindung, fährt am Datum nicht', async () => {
    const saison: Haltestelle = { ...haltestelle, bedient: [{ von: '06-15', bis: '10-15' }], bedientHinweis: 'Postauto nur im Sommer' }
    const a = await verbindungErmitteln(anfrage('2026-12-19', '2026-12-19', { haltestelle: saison }), { planen: vi.fn(async () => hin), muster: ohneMuster })
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'keine_verbindung', hinweis: 'Postauto nur im Sommer' })
    expect(a.passung).toEqual({ passt: false, grund: 'fährt am Datum nicht', naechte: 0 })
  })

  it('live ohne Hinfahrt im Zeitfenster: keine_verbindung, Richtwert bleibt dabei', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : []))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), deps(planen))
    expect(a).toMatchObject({ quelle: 'live', fehlerArt: 'keine_verbindung' })
    expect(a.passung).toEqual({ passt: false, grund: 'keine Hinfahrt ab 6:00', naechte: 0 })
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinweis).toBeUndefined()
  })

  it('live ohne Hinfahrt außerhalb der Bedienzeit nennt den Saisonbetrieb', async () => {
    const saison: Haltestelle = { ...haltestelle, bedient: [{ von: '06-15', bis: '09-01' }] }
    const planen = vi.fn(async () => [] as Itinerary[])
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { haltestelle: saison }), deps(planen))
    expect(a).toMatchObject({ fehlerArt: 'keine_verbindung', hinweis: 'Am Datum keine Busverbindung (Saisonbetrieb)' })
    expect(a.passung).toEqual({ passt: false, grund: 'fährt am Datum nicht', naechte: 0 })
  })

  it('live gefunden, aber am Datum nicht bedient: passt nie', async () => {
    const saison: Haltestelle = { ...haltestelle, bedient: [{ von: '06-15', bis: '09-01' }] }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-12', { haltestelle: saison }), deps(planen))
    expect(a.hinfahrt).toBeDefined()
    expect(a.passung).toEqual({ passt: false, grund: 'fährt am Datum nicht', naechte: 0 })
  })

  it('am Rückdatum nicht bedient: fährt am Datum nicht', async () => {
    const saison: Haltestelle = { ...haltestelle, bedient: [{ von: '06-15', bis: '09-12' }] }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? amTag(rueck, '2026-09-13') : hin))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-13', { haltestelle: saison }), deps(planen))
    expect(a.passung).toEqual({ passt: false, grund: 'fährt am Datum nicht', naechte: 1 })
  })

  it('Überlast oder Serverfehler: dienst_nicht_erreichbar', async () => {
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { ...deps(), planen: vi.fn(async () => { throw new TransitousFehler('Transitous HTTP 429', 429) }) })
    expect(a).toMatchObject({ quelle: 'richtwert', fehlerArt: 'dienst_nicht_erreichbar' })
    expect(a.fehler).toMatch(/429/)
    const b = await verbindungErmitteln(anfrage('2026-09-12'), { ...deps(), planen: vi.fn(async () => { throw new TransitousFehler('weg', undefined, true) }) })
    expect(b.fehlerArt).toBe('dienst_nicht_erreichbar')
  })

  it('nur die Hinfahrt scheitert am Dienst: dienst_nicht_erreichbar trotz Rückfahrt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => {
      if (!p.ankunftBis) throw new TransitousFehler('Transitous HTTP 503', 503)
      return rueck
    })
    const a = await verbindungErmitteln(anfrage('2026-09-12'), deps(planen))
    expect(a).toMatchObject({ quelle: 'live', fehlerArt: 'dienst_nicht_erreichbar' })
  })

  it('anderer Fehler (z. B. 404 auch nach Koordinaten): keine Fehlerart, aber Fehlertext', async () => {
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { ...deps(), planen: vi.fn(async () => { throw new TransitousFehler('Transitous HTTP 404', 404) }) })
    expect(a.quelle).toBe('richtwert')
    expect(a.fehlerArt).toBeUndefined()
    expect(a.fehler).toMatch(/404/)
  })
})

describe('spätere Hinfahrten statt "keine Verbindung"', () => {
  const nur = (abUtc: string, anUtc: string): Itinerary[] => [{ startTime: abUtc, endTime: anUtc, duration: 1, transfers: 1, legs: [] }]
  it('nimmt eine Abfahrt in der vierten Stunde nach "los ab" als Hinfahrt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : nur('2026-09-12T07:10:00Z', '2026-09-12T10:20:00Z')))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T07:10:00Z') // 09:10 lokal
    expect(a.hinfahrtSpaeter).toBeUndefined()
    expect(a.fehlerArt).toBeUndefined()
    expect(a.passung).toEqual({ passt: false, grund: 'nur 3:54 h vor Ort', naechte: 0 }) // 12:20 bis 16:14
  })
  it('nimmt bei Hüttentouren auch eine Abfahrt am Vormittag', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? amTag(rueck, '2026-09-13') : nur('2026-09-12T09:30:00Z', '2026-09-12T13:40:00Z')))
    const a = await verbindungErmitteln(anfrage('2026-09-12', '2026-09-13'), { planen })
    expect(a.hinfahrt?.ab).toBe('2026-09-12T09:30:00Z') // 11:30 lokal
    expect(a.fehlerArt).toBeUndefined()
    expect(a.passung).toMatchObject({ passt: true, naechte: 1 })
  })
  it('meldet keine Verbindung erst, wenn vor 14 Uhr gar nichts fährt', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : nur('2026-09-12T13:30:00Z', '2026-09-12T17:40:00Z')))
    const a = await verbindungErmitteln(anfrage('2026-09-12'), { planen })
    expect(a.hinfahrt).toBeUndefined()
    expect(a.fehlerArt).toBe('keine_verbindung')
  })
})

describe('Musterfahrplan außerhalb der Saison', () => {
  const saisonal: Haltestelle = { ...haltestelle, bedient: [{ von: '06-01', bis: '10-20' }] }
  const leer: Musterfahrplan = { ...muster, orte: { kandersteg: { plaene: { sa: { hin: [], rueck: [] } } } } }
  it('gibt im Sommer kein Urteil aus einem im Winter berechneten leeren Plan', async () => {
    const a = await verbindungErmitteln(
      anfrage('2027-07-03', '2027-07-03', { heute: '2027-07-01', fahrplan: { liveBis: '2026-12-12', hinweis: 'x' }, haltestelle: saisonal }),
      { planen: scheitert, muster: mitMuster(leer) },
    )
    expect(a.fehlerArt).toBe('fahrplan_noch_nicht_verfuegbar')
    expect(a.passung).toBeUndefined()
  })
})
