import { describe, it, expect, vi } from 'vitest'
import { fahrtenErmitteln, weitereFahrten } from '@/lib/verbindung/fahrten'
import { TransitousFehler, type Itinerary, type PlanParameter } from '@/lib/verbindung/transitous'
import type { Startort, Haltestelle, TicketTabelle } from '@/lib/content/schema'
import type { Zeitfenster } from '@/lib/zeitfenster'
import type { Tagesplan } from '@/lib/musterfahrplan/typen'

const startort: Startort = { id: 'offenburg', name: 'Offenburg', haltestelleId: 'de:og', lat: 48.4, lon: 7.9, sichtbar: true }
const haltestelle: Haltestelle = {
  id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch:ka', lat: 46.4, lon: 7.6, land: 'CH', region: 'BO',
  richtwerte: { offenburg: { fahrzeitMin: 250, umstiege: 2, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' } },
}
const tickets: TicketTabelle = {
  regeln: [{ land: 'CH', ticket: 'halbtax', hinweis: 'CH' }, { land: 'DE', ticket: 'deutschlandticket', hinweis: 'DE' }],
  fernverkehrHinweis: 'Fern',
}
const zeit = { heute: '2026-09-06', fahrplan: { liveBis: '2026-12-12', hinweis: 'x' } }
const z: Zeitfenster = { datum: '2026-09-12', rueck: '2026-09-12', abMin: 360, bisMin: 1260, vorOrtMin: 240 }

/** Sommerzeit: lokal = UTC + 2 */
const itn = (ab: string, an: string, dauerH = 3): Itinerary => ({
  startTime: `2026-09-12T${ab}:00Z`, endTime: `2026-09-12T${an}:00Z`, duration: dauerH * 3600, transfers: 1, legs: [],
})
// lokal 07:12 … 11:12 (UTC 05:12 …)
const hinAntwort = [itn('03:12', '07:00'), itn('04:12', '08:00'), itn('05:12', '09:00'), itn('06:12', '10:00'), itn('07:12', '11:00')]
// lokal 05:12 06:12 07:12 08:12 09:12 → ab 06:00 => frueher 05:12, passend 06:12 07:12 08:12
const rueckAntwort = [itn('13:00', '16:46'), itn('14:00', '17:46'), itn('15:00', '18:46'), itn('16:00', '19:46')]
// lokal Ankunft 18:46 19:46 20:46 21:46 → bis 21:00

const planenMit = (hin: Itinerary[], rueck: Itinerary[]) =>
  vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))

describe('fahrtenErmitteln', () => {
  it('wählt eine frühere und bis zu drei passende Hinfahrten', async () => {
    const planen = planenMit(hinAntwort, rueckAntwort)
    const a = await fahrtenErmitteln({ startort, haltestelle, z, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hin.map((f) => f.lage)).toEqual(['frueher', 'passend', 'passend', 'passend'])
    expect(a.hin.map((f) => f.ab)).toEqual(hinAntwort.slice(0, 4).map((i) => i.startTime))
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T02:30:00Z', ankunftBis: false, anzahl: 8 })
  })

  it('wählt drei passende Rückfahrten und die erste spätere', async () => {
    const planen = planenMit(hinAntwort, [...rueckAntwort, itn('17:00', '19:46')].slice(0, 4).map((r, i) => ({ ...r, endTime: `2026-09-12T${['16:46', '17:46', '18:46', '19:46'][i]}:00Z` })))
    const a = await fahrtenErmitteln({ startort, haltestelle, z: { ...z, bisMin: 1260 }, tickets, ...zeit }, { planen })
    expect(a.rueckfahrten.map((f) => f.lage)).toEqual(['passend', 'passend', 'passend', 'spaeter'])
    expect(a.rueckfahrten.map((f) => f.an)).toEqual(['2026-09-12T16:46:00Z', '2026-09-12T17:46:00Z', '2026-09-12T18:46:00Z', '2026-09-12T19:46:00Z'])
    expect(planen.mock.calls[1][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', zeit: '2026-09-12T20:30:00Z', ankunftBis: true, anzahl: 8 })
  })

  it('braucht genau zwei planen-Aufrufe', async () => {
    const planen = planenMit(hinAntwort, rueckAntwort)
    await fahrtenErmitteln({ startort, haltestelle, z, tickets, ...zeit }, { planen })
    expect(planen).toHaveBeenCalledTimes(2)
  })

  it('verwirft Rückfahrten, die nicht am Rückfahrtag ankommen', async () => {
    const nachMitternacht = { ...itn('20:00', '23:00'), endTime: '2026-09-12T22:30:00Z' } // lokal 00:30 am 13.
    const planen = planenMit(hinAntwort, [itn('13:00', '16:46'), nachMitternacht])
    const a = await fahrtenErmitteln({ startort, haltestelle, z: { ...z, bisMin: 1440 }, tickets, ...zeit }, { planen })
    expect(a.rueckfahrten).toHaveLength(1)
  })

  it('fragt bei Datum nach liveBis nichts ab und nutzt den Musterfahrplan', async () => {
    const planen = vi.fn()
    const muster: { hin: Tagesplan['hin']; rueck: Tagesplan['rueck'] } = {
      hin: [{ ab: '06:12', an: '09:41', umstiege: 1, via: ['Basel'], fern: false }],
      rueck: [{ ab: '17:00', an: '20:30', umstiege: 1, via: [], fern: false }],
    }
    const a = await fahrtenErmitteln({ startort, haltestelle, z: { ...z, datum: '2027-01-09', rueck: '2027-01-09' }, tickets, muster, heute: '2026-09-06', fahrplan: { liveBis: '2026-12-12', hinweis: 'Fahrplan ab 13.12. fehlt noch.' } }, { planen })
    expect(planen).not.toHaveBeenCalled()
    expect(a.quelle).toBe('typisch')
    expect(a.hinweis).toBe('Fahrplan ab 13.12. fehlt noch.')
    expect(a.hin).toHaveLength(1)
    expect(a.hin[0]).toMatchObject({ ab: '2027-01-09T05:12:00Z', an: '2027-01-09T08:41:00Z', dauerMin: 209, abschnitte: [], via: ['Basel'], lage: 'passend' })
    expect(a.rueckfahrten[0].lage).toBe('passend')
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })

  it('liefert typisch mit leeren Listen, wenn kein Musterfahrplan vorliegt', async () => {
    const a = await fahrtenErmitteln({ startort, haltestelle, z: { ...z, datum: '2020-01-01', rueck: '2020-01-01' }, tickets, ...zeit }, { planen: vi.fn() })
    expect(a).toMatchObject({ quelle: 'typisch', hin: [], rueckfahrten: [], fehlerArt: 'datum_vergangen' })
  })

  it('setzt abweichungMin ab 30 Minuten über dem Muster', async () => {
    const muster = { hin: [{ ab: '06:12', an: '09:41', umstiege: 1, via: [], fern: false }], rueck: [] } // 3:29 h
    const lang = (dauerMin: number): Itinerary[] => [{ ...itn('04:12', '08:00'), endTime: new Date(Date.parse('2026-09-12T04:12:00Z') + dauerMin * 60_000).toISOString() }]
    const a = await fahrtenErmitteln({ startort, haltestelle, z, tickets, muster, ...zeit }, { planen: planenMit(lang(270), []) })
    expect(a.abweichungMin).toBe(61)
    const b = await fahrtenErmitteln({ startort, haltestelle, z, tickets, muster, ...zeit }, { planen: planenMit(lang(220), []) })
    expect(b.abweichungMin).toBeUndefined()
  })

  it('vergleicht nur mit typischen Hinfahrten im selben Abfahrtsbereich (los ab bis letzte passende Abfahrt)', async () => {
    // Live: passend 06:12, 07:12, 08:12 (lokal), je 4:30 h. Typisch: 06:12 auch 4:30 h, aber nachmittags ein schneller Zug.
    const live: Itinerary[] = ['04:12', '05:12', '06:12'].map((ab) => {
      const start = `2026-09-12T${ab}:00Z`
      return { ...itn(ab, ab), startTime: start, endTime: new Date(Date.parse(start) + 270 * 60_000).toISOString() }
    })
    const muster = {
      hin: [
        { ab: '06:12', an: '10:42', umstiege: 1, via: [], fern: false }, // 4:30 h
        { ab: '14:00', an: '17:00', umstiege: 0, via: [], fern: true }, // 3:00 h, nach der letzten passenden Abfahrt
        { ab: '05:00', an: '07:30', umstiege: 0, via: [], fern: true }, // 2:30 h, vor "los ab"
      ],
      rueck: [],
    }
    const a = await fahrtenErmitteln({ startort, haltestelle, z, tickets, muster, ...zeit }, { planen: planenMit(live, []) })
    expect(a.abweichungMin).toBeUndefined()
    // Liegt die schnelle typische Fahrt im Bereich, zählt sie: 4:30 h gegen 3:00 h.
    const imBereich = { ...muster, hin: [...muster.hin, { ab: '08:00', an: '11:00', umstiege: 0, via: [], fern: true }] }
    const b = await fahrtenErmitteln({ startort, haltestelle, z, tickets, muster: imBereich, ...zeit }, { planen: planenMit(live, []) })
    expect(b.abweichungMin).toBe(90)
  })

  it('ohne typische Hinfahrt im Bereich kein Hinweis', async () => {
    const live: Itinerary[] = [{ ...itn('04:12', '04:12'), endTime: '2026-09-12T09:12:00Z' }] // lokal 06:12, 5 h
    const muster = { hin: [{ ab: '12:00', an: '14:00', umstiege: 0, via: [], fern: false }], rueck: [] }
    const a = await fahrtenErmitteln({ startort, haltestelle, z, tickets, muster, ...zeit }, { planen: planenMit(live, []) })
    expect(a.abweichungMin).toBeUndefined()
  })

  it('füllt bei einer fehlgeschlagenen Richtung aus dem Musterfahrplan', async () => {
    const muster = { hin: [], rueck: [{ ab: '17:00', an: '20:30', umstiege: 1, via: [], fern: false }] }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => { if (p.ankunftBis) throw new TransitousFehler('503', 503); return hinAntwort })
    const a = await fahrtenErmitteln({ startort, haltestelle, z, tickets, muster, ...zeit }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinweis).toBe('Rückfahrt nach typischem Fahrplan')
    expect(a.hin).toHaveLength(4)
    expect(a.rueckfahrten).toHaveLength(1)
  })

  it('fällt bei zwei Fehlern auf typisch mit dienst_nicht_erreichbar zurück', async () => {
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await fahrtenErmitteln({ startort, haltestelle, z, tickets, ...zeit }, { planen })
    expect(a.quelle).toBe('typisch')
    expect(a.fehlerArt).toBe('dienst_nicht_erreichbar')
  })
})

describe('weitereFahrten', () => {
  it('fragt Abfahrten nach zeitIso ab und behält nur spätere', async () => {
    const planen = vi.fn(async (_p: PlanParameter) => [itn('05:12', '09:00'), itn('06:12', '10:00'), itn('07:12', '11:00')])
    const f = await weitereFahrten({ startort, haltestelle, richtung: 'hin', zeitIso: '2026-09-12T05:12:00Z', z }, { planen })
    expect(planen).toHaveBeenCalledTimes(1)
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T05:13:00Z', ankunftBis: false, anzahl: 4 })
    expect(f.map((x) => x.ab)).toEqual(['2026-09-12T06:12:00Z', '2026-09-12T07:12:00Z'])
    expect(f.every((x) => x.lage === 'passend')).toBe(true)
  })

  it('Rückrichtung: spaeter nach bisMin, verwirft Ankunft nach dem Rückfahrtag', async () => {
    const planen = vi.fn(async (_p: PlanParameter) => [
      { ...itn('16:00', '18:00') }, // lokal 20:00
      { ...itn('17:00', '19:30') }, // lokal 21:30 → spaeter
      { ...itn('20:00', '22:30') }, // lokal 00:30 am 13. → verworfen
    ])
    const f = await weitereFahrten({ startort, haltestelle, richtung: 'rueck', zeitIso: '2026-09-12T13:00:00Z', z }, { planen })
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', ankunftBis: false })
    expect(f.map((x) => x.lage)).toEqual(['passend', 'spaeter'])
  })
})
