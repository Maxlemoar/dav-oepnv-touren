import { describe, it, expect } from 'vitest'
import { imZeitraum, bedientAm, huetteZustandAm, tagesklasse, gebietPasstZurJahreszeit } from '@/lib/saison'
import type { Haltestelle, Huette, Gebiet } from '@/lib/content/schema'

const huette = (extra: Partial<Huette> = {}): Huette => ({
  id: 'h', name: 'H', betreiber: { typ: 'sac' }, hoehe: 2000, lat: 46, lon: 8, gebietId: 'g', saison: 'sommer',
  zustiege: [{ haltestelleId: 'x', gehzeitMin: 60, hoehenmeter: 300, bergbahn: false }], quelle: 'https://a.b',
  geschaetzt: false, status: 'offen', ...extra,
})
const halt = (extra: Partial<Haltestelle> = {}): Haltestelle => ({
  id: 'x', name: 'X', haltestelleId: 'x', lat: 46, lon: 8, land: 'CH', region: 'R', richtwerte: {}, ...extra,
})

describe('imZeitraum', () => {
  it('innerhalb eines Jahres', () => {
    expect(imZeitraum('2026-07-01', { von: '06-15', bis: '10-15' })).toBe(true)
    expect(imZeitraum('2026-06-15', { von: '06-15', bis: '10-15' })).toBe(true)
    expect(imZeitraum('2026-10-15', { von: '06-15', bis: '10-15' })).toBe(true)
    expect(imZeitraum('2026-11-21', { von: '06-15', bis: '10-15' })).toBe(false)
  })
  it('über den Jahreswechsel', () => {
    expect(imZeitraum('2026-12-26', { von: '12-20', bis: '04-15' })).toBe(true)
    expect(imZeitraum('2027-02-01', { von: '12-20', bis: '04-15' })).toBe(true)
    expect(imZeitraum('2026-07-01', { von: '12-20', bis: '04-15' })).toBe(false)
  })
})

describe('bedientAm', () => {
  it('ohne Angabe ganzjährig', () => {
    expect(bedientAm(halt(), '2026-11-21')).toBe(true)
  })
  it('Saisonbus nur im Sommer', () => {
    const h = halt({ bedient: [{ von: '06-01', bis: '10-20' }] })
    expect(bedientAm(h, '2026-07-04')).toBe(true)
    expect(bedientAm(h, '2026-11-21')).toBe(false)
  })
})

describe('huetteZustandAm', () => {
  it('geschlossen überstimmt alles bis statusBis', () => {
    const h = huette({ status: 'umbau', statusHinweis: 'Neubau', statusBis: '2027-06-01', bewirtschaftet: [{ von: '06-15', bis: '10-15' }] })
    expect(huetteZustandAm(h, '2026-07-01')).toEqual({ zustand: 'geschlossen', hinweis: 'Neubau', sicher: true })
    expect(huetteZustandAm(h, '2027-07-01').zustand).toBe('offen')
  })
  it('geschlossen ohne Enddatum bleibt geschlossen', () => {
    expect(huetteZustandAm(huette({ status: 'geschlossen' }), '2030-07-01').zustand).toBe('geschlossen')
  })
  it('belegte Bewirtschaftungszeiten mit und ohne Winterraum', () => {
    const h = huette({ bewirtschaftet: [{ von: '06-15', bis: '10-15' }] })
    expect(huetteZustandAm(h, '2026-08-01')).toEqual({ zustand: 'offen', sicher: true })
    expect(huetteZustandAm(h, '2026-11-21')).toEqual({ zustand: 'geschlossen', sicher: true })
    expect(huetteZustandAm({ ...h, winterraum: true }, '2026-11-21')).toEqual({ zustand: 'winterraum', sicher: true })
  })
  it('ohne Zeiten aus der Saison geschätzt', () => {
    expect(huetteZustandAm(huette({ saison: 'sommer' }), '2026-08-01')).toEqual({ zustand: 'offen', sicher: false })
    expect(huetteZustandAm(huette({ saison: 'sommer' }), '2026-11-21')).toEqual({ zustand: 'geschlossen', sicher: false })
    expect(huetteZustandAm(huette({ saison: 'ganzjaehrig' }), '2026-11-21')).toEqual({ zustand: 'offen', sicher: false })
  })
})

describe('tagesklasse', () => {
  it('Samstag, Sonntag, Werktag', () => {
    expect(tagesklasse('2026-11-21')).toBe('sa')
    expect(tagesklasse('2026-11-22')).toBe('so')
    expect(tagesklasse('2026-11-20')).toBe('werktag')
  })
  it('bundesweite Feiertage wie Sonntag', () => {
    expect(tagesklasse('2026-12-25')).toBe('so')
    expect(tagesklasse('2027-05-06')).toBe('so') // Christi Himmelfahrt (Ostern 28.3.2027)
  })
})

describe('gebietPasstZurJahreszeit', () => {
  const g = (saison: Gebiet['saison']) => ({ saison }) as Gebiet
  it('Sommergebiet im Winter nicht', () => {
    expect(gebietPasstZurJahreszeit(g('sommer'), '2026-11-21')).toBe(false)
    expect(gebietPasstZurJahreszeit(g('sommer'), '2026-07-04')).toBe(true)
  })
  it('Wintergebiet im Sommer nicht, ganzjährig immer', () => {
    expect(gebietPasstZurJahreszeit(g('winter'), '2026-07-04')).toBe(false)
    expect(gebietPasstZurJahreszeit(g('ganzjaehrig'), '2026-11-21')).toBe(true)
  })
})
