import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, vi } from 'vitest'
import { anreise, anreisetext, htmlZuText, kommendeTouren, ladeSektionstouren, parseVeranstaltung, parseVeranstaltungen, ticketKurz } from '@/lib/dav360'

const roh: unknown[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/dav360/veranstaltungen.json'), 'utf8'))
const touren = parseVeranstaltungen(roh)
const tour = (id: number) => touren.find((t) => t.id === id)!

describe('htmlZuText', () => {
  it('entfernt Tags und löst Entitäten auf', () => {
    expect(htmlZuText('<p>Theorie &amp; Praxis<br />\nSchlauch&nbsp;wechseln &#8211; fertig</p>\n')).toBe('Theorie & Praxis Schlauch wechseln – fertig')
  })
  it('kein Text bei null', () => expect(htmlZuText(null)).toBe(''))
})

describe('parseVeranstaltung', () => {
  it('liest die benötigten Felder', () => {
    const t = tour(134930)
    expect(t).toMatchObject({
      titel: 'Skitouren am Sustenpass', kategorie: 'Skitour', art: 'Führungstour',
      start: '2026-04-17', ende: '2026-04-19', anreisehinweis: 'Anfahrt im Kleinbus (Mietfahrzeug)',
      oeffiMoeglich: false, ohneOrt: false,
    })
    expect(t.link).toMatch(/^https:\/\/www\.dav-offenburg\.de\/events\/tour\//)
    expect(t.leitung.length).toBeGreaterThan(0)
    expect(t.startZeit).toBeUndefined()
  })
  it('fehlendes Ende gilt als Starttag', () => {
    expect(tour(60454)).toMatchObject({ start: '2024-06-23', ende: '2024-06-23' })
  })
  it('Uhrzeit nur, wenn gepflegt', () => {
    expect(parseVeranstaltung({ id: 1, title: 'X', dates: [{ dateTimeStart: '2027-01-02 07:30:00', dateTimeEnd: '' }] })?.startZeit).toBe('07:30')
  })
  it('verwirft Einträge ohne Titel oder Datum und Unsinn', () => {
    expect(parseVeranstaltung({ id: 1, title: 'Ohne Datum', dates: [] })).toBeUndefined()
    expect(parseVeranstaltung({ id: 2, title: '', dates: [{ dateTimeStart: '2027-01-01 00:00:00' }] })).toBeUndefined()
    expect(parseVeranstaltungen({ fehler: true })).toEqual([])
    expect(parseVeranstaltungen([null, 3, 'x'])).toEqual([])
  })
  it('Werkstatt-Abend ist ein Termin ohne Ort', () => {
    expect(tour(60352).ohneOrt).toBe(true)
  })
})

describe('kommendeTouren', () => {
  it('ab heute, nach Datum sortiert', () => {
    const k = kommendeTouren(touren, '2026-11-19')
    expect(k.map((t) => t.start)).toEqual([...k.map((t) => t.start)].sort())
    expect(k.every((t) => t.start >= '2026-11-19')).toBe(true)
    expect(k.map((t) => t.id)).toContain(134937)
    expect(k.map((t) => t.id)).not.toContain(134930)
  })
})

describe('anreise', () => {
  it('ÖPNV im Anreisehinweis', () => expect(anreise(tour(136775))).toEqual({ art: 'oeffi' }))
  it('Feld "ÖV möglich"', () => expect(anreise({ oeffiMoeglich: true })).toEqual({ art: 'oeffi' }))
  it('Kleinbus', () => {
    expect(anreise(tour(134930))).toEqual({ art: 'andere', kurz: 'Kleinbus' })
    expect(anreise(tour(134935))).toEqual({ art: 'andere', kurz: 'Kleinbus' })
  })
  it('Anfahrt-Satz in der Beschreibung', () => {
    expect(anreise({ oeffiMoeglich: false, beschreibung: 'Übernachtung im Gasthaus. Anfahrt im Mietfahrzeug, Abfahrt 6 Uhr' })).toEqual({ art: 'andere', kurz: 'Kleinbus' })
  })
  it('ohne Angabe unbekannt', () => expect(anreise(tour(134932))).toEqual({ art: 'unbekannt' }))
})

describe('ladeSektionstouren', () => {
  it('liefert kommende Touren', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify(roh), { status: 200 }))
    const r = await ladeSektionstouren({ fetch: f as unknown as typeof fetch, heute: '2026-11-19' })
    expect(r.fehler).toBe(false)
    expect(r.touren.length).toBe(3)
  })
  it('Fehlerflag bei HTTP-Fehler, Netzfehler und falscher Form', async () => {
    const r500 = await ladeSektionstouren({ fetch: (async () => new Response('x', { status: 500 })) as unknown as typeof fetch })
    const netz = await ladeSektionstouren({ fetch: (async () => { throw new Error('offline') }) as unknown as typeof fetch })
    const form = await ladeSektionstouren({ fetch: (async () => new Response('{"a":1}')) as unknown as typeof fetch })
    for (const r of [r500, netz, form]) expect(r).toEqual({ touren: [], fehler: true })
  })
})

describe('anreisetext', () => {
  const link = 'https://example.org/gebiet/kandersteg?datum=2026-09-12&rueck=2026-09-13'
  it('mit Hin- und Rückfahrt', () => {
    expect(anreisetext({
      startName: 'Offenburg', zielName: 'Kandersteg',
      hinfahrt: { ab: '2026-09-12T04:30:00Z', an: '2026-09-12T08:40:00Z', umstiege: 1 },
      rueckfahrt: { ab: '2026-09-13T16:14:00Z', an: '2026-09-13T20:38:00Z', umstiege: 2 },
      ticket: ticketKurz('halbtax', 'CH'), link,
    })).toBe(
      'Anreise mit Bahn und Bus möglich: Sa 06:30 ab Offenburg, 10:40 an Kandersteg (1 Umstieg). '
      + 'Rückfahrt So 18:14 ab Kandersteg, 22:38 an Offenburg (2 Umstiege). '
      + `Ticket: Deutschlandticket bis Basel, ab dort Halbtax. Verbindung prüfen: ${link}`,
    )
  })
  it('mit Richtwert, wenn keine Live-Verbindung vorliegt', () => {
    expect(anreisetext({ startName: 'Offenburg', zielName: 'Kandersteg', richtwert: { fahrzeitMin: 267, umstiege: 0 }, link }))
      .toBe(`Anreise mit Bahn und Bus bis Kandersteg möglich, ab Offenburg ca. 4:27 h (direkt). Verbindung prüfen: ${link}`)
  })
  it('nur mit Link', () => {
    expect(anreisetext({ startName: 'Offenburg', zielName: 'Hausach', link })).toBe(`Anreise mit Bahn und Bus bis Hausach möglich. Verbindung prüfen: ${link}`)
  })
})

describe('ticketKurz', () => {
  it('je Ticket und Land', () => {
    expect(ticketKurz('deutschlandticket', 'DE')).toBe('Deutschlandticket')
    expect(ticketKurz('keins', 'AT')).toMatch(/Sparpreis/)
    expect(ticketKurz('keins', 'DE')).toMatch(/Fernverkehr/)
  })
})
