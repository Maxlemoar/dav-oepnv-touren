import { describe, it, expect } from 'vitest'
import { uebersichtBerechnen } from '@/lib/verbindung/uebersicht'
import type { Gebiet, Haltestelle, Startort } from '@/lib/content/schema'

const startort: Startort = { id: 'offenburg', name: 'Offenburg', haltestelleId: 'de:og', lat: 48.4, lon: 7.9, sichtbar: true }
const richtwert = { fahrzeitMin: 120, umstiege: 1, takt: 'stuendlich' as const, ticket: 'halbtax' as const, berechnetAm: '2026-11-20' }
const halt = (id: string, extra: Partial<Haltestelle> = {}): Haltestelle => ({
  id, name: id, haltestelleId: `x:${id}`, lat: 46, lon: 8, land: 'CH', region: 'R', richtwerte: {}, ...extra,
})
const gebiet = (id: string, haltestellen: string[]): Gebiet => ({
  id, name: id, beschreibung: 'b', haltestellen, sportarten: ['wandern'], saison: 'ganzjaehrig', touren: [], links: [], lat: 46, lon: 8,
})

const haltestellen = [
  halt('frueh', { richtwerte: { offenburg: { ...richtwert, tagesfenster: { sa: { ankunft: '08:40', letzteRueckfahrt: '17:14' }, so: { ankunft: '10:40', letzteRueckfahrt: '17:14' } } } } }),
  halt('neben', { richtwerte: { offenburg: { ...richtwert, tagesfenster: { sa: { ankunft: '12:00', letzteRueckfahrt: '13:00' } } } } }),
  halt('ohne', { richtwerte: { offenburg: richtwert } }),
  halt('sommerbus', { bedient: [{ von: '06-15', bis: '10-15' }], richtwerte: { offenburg: { ...richtwert, tagesfenster: { sa: { ankunft: '08:00', letzteRueckfahrt: '17:00' } } } } }),
]
const gebiete = [gebiet('a', ['frueh', 'neben']), gebiet('b', ['ohne']), gebiet('c', ['sommerbus']), gebiet('d', ['fehlt'])]
const inhalt = { gebiete, haltestellen }

describe('uebersichtBerechnen', () => {
  it('urteilt am Samstag aus dem Tagesfenster des Hauptzugangs', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-11-21', rueck: '2026-11-21', fenster: 360 })
    expect(u.a).toEqual({ tagesziel: true, naechte: 0, quelle: 'tagesfenster' })
  })
  it('nimmt am Sonntag das Sonntagsfenster und nennt den Grund', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-11-22', rueck: '2026-11-22', fenster: 360 })
    expect(u.a).toEqual({ tagesziel: false, grund: 'Ankunft erst 10:40', naechte: 0, quelle: 'tagesfenster' })
  })
  it('Feiertage zählen wie Sonntag', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-12-25', rueck: '2026-12-25', fenster: 360 })
    expect(u.a.tagesziel).toBe(false)
  })
  it('berücksichtigt das gewählte Mindestfenster', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-11-21', rueck: '2026-11-21', fenster: 540 })
    expect(u.a).toMatchObject({ tagesziel: false, grund: 'Nur 8:34 h am Berg' })
  })
  it('ohne Tagesfenster kein Urteil', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-11-21', rueck: '2026-11-21', fenster: 360 })
    expect(u.b).toEqual({ naechte: 0, quelle: 'tagesfenster' })
    // Werktag ist für "a" nicht berechnet
    expect(uebersichtBerechnen(inhalt, startort, { datum: '2026-11-20', rueck: '2026-11-20', fenster: 360 }).a.tagesziel).toBeUndefined()
  })
  it('fährt der Hauptzugang am Datum nicht, ist es kein Tagesziel', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-11-21', rueck: '2026-11-21', fenster: 360 })
    expect(u.c).toEqual({ tagesziel: false, grund: 'Am Datum keine Busverbindung (Saisonbetrieb)', naechte: 0, quelle: 'tagesfenster' })
    expect(uebersichtBerechnen(inhalt, startort, { datum: '2026-07-04', rueck: '2026-07-04', fenster: 360 }).c.tagesziel).toBe(true)
  })
  it('mehrtägig kein Urteil, Saisonbetrieb nur als Grund', () => {
    const u = uebersichtBerechnen(inhalt, startort, { datum: '2026-11-21', rueck: '2026-11-22', fenster: 360 })
    expect(u.a).toEqual({ naechte: 1, quelle: 'tagesfenster' })
    expect(u.c).toEqual({ grund: 'Am Datum keine Busverbindung (Saisonbetrieb)', naechte: 1, quelle: 'tagesfenster' })
  })
  it('lässt Gebiete mit unbekanntem Hauptzugang aus', () => {
    expect(uebersichtBerechnen(inhalt, startort, { datum: '2026-11-21', rueck: '2026-11-21', fenster: 360 }).d).toBeUndefined()
  })
})
