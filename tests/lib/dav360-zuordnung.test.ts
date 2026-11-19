import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import { ladeInhalt } from '@/lib/content/laden'
import { parseVeranstaltungen, type Sektionstour } from '@/lib/dav360'
import { baueZuordnungsIndex, normalisiere, ordneZu, zugangAm } from '@/lib/dav360-zuordnung'

const inhalt = ladeInhalt()
const index = baueZuordnungsIndex(inhalt)
const touren = parseVeranstaltungen(JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/dav360/veranstaltungen.json'), 'utf8')))
const tour = (id: number): Sektionstour => touren.find((t) => t.id === id)!

describe('normalisiere', () => {
  it('Umlaute, Umschreibung und ohne Punkte fallen zusammen', () => {
    expect(normalisiere('Lämmerenhütte')).toBe(normalisiere('Laemmerenhuette'))
    expect(normalisiere('Lämmerenhütte')).toBe(normalisiere('Lammerenhutte'))
  })
  it('getrennte Hütte wird ein Wort', () => {
    expect(normalisiere('Wiwanni-Hütte')).toBe('wiwannihutte')
    expect(normalisiere('Corno Gries Hütte')).toBe('corno grieshutte')
  })
})

describe('ordneZu mit Touren aus dem Sektionsprogramm', () => {
  it('Skitouren am Sustenpass → Grimsel/Susten, Zugang Steingletscher', () => {
    const z = ordneZu(tour(134930), index)
    expect(z).toMatchObject({ gebietId: 'grimsel-haslital', haltestelleId: 'steingletscher', sicherheit: 'hoch' })
    expect(z?.huetteId).toBeUndefined()
  })
  it('Durch das Gasteretal zur neuen Mutthornhütte → Kandersteg', () => {
    expect(ordneZu(tour(136775), index)).toMatchObject({ gebietId: 'kandersteg', haltestelleId: 'kandersteg', sicherheit: 'hoch' })
  })
  it('Granitklettereien rund um die Gelmerhütte → Hütte mit Zugang Handegg', () => {
    const z = ordneZu(tour(136827), index)
    expect(z).toMatchObject({ gebietId: 'grimsel-haslital', huetteId: 'gelmerhuette', haltestelleId: 'handegg', sicherheit: 'hoch' })
    expect(z?.grund).toBe('Hütte „Gelmerhütte“ im Titel')
  })
  it('Haslacher Panoramaweg → Kinzigtal, obwohl der Treffpunkt in Nordrach liegt', () => {
    expect(ordneZu(tour(62366), index)).toMatchObject({ gebietId: 'kinzigtal', sicherheit: 'hoch' })
  })
  it('Oberkircher Brennersteig → Renchtal, auch mit Treffpunkt Nordrach', () => {
    expect(ordneZu(tour(60454), index)).toMatchObject({ gebietId: 'renchtal-kniebis', sicherheit: 'hoch' })
    expect(ordneZu(tour(101579), index)).toMatchObject({ gebietId: 'renchtal-kniebis', sicherheit: 'hoch' })
  })
  it('Lämmerhütte (Schreibvariante) → Lämmerenhütte', () => {
    expect(ordneZu(tour(134937), index)).toMatchObject({ gebietId: 'kandersteg', huetteId: 'laemmerenhuette' })
  })
  it('ohne Ortsnamen keine Zuordnung', () => {
    expect(ordneZu(tour(134932), index)).toBeUndefined()
    expect(ordneZu(tour(134935), index)).toBeUndefined()
  })
  it('ein Gebietsname nur im Treffpunkt reicht nicht', () => {
    expect(ordneZu({ titel: 'Rund um den Hausberg', treffpunkt: '9 Uhr Nordrach Hansjakobhalle' }, index)).toBeUndefined()
  })
  it('ganze Wörter: "Zug" und "Wald" führen nirgendwohin', () => {
    expect(ordneZu({ titel: 'Mit dem Zug in den Wald' }, index)).toBeUndefined()
  })
  it('Gelmerhütte ist nicht die Geltenhütte', () => {
    expect(ordneZu({ titel: 'Skitouren rund um die Geltenhütte' }, index)).toBeUndefined()
  })
  it('Feldberggebiet zählt als Feldberg', () => {
    expect(ordneZu({ titel: 'Schwarzwaldskikurs Stollenbach Feldberggebiet' }, index)).toMatchObject({ gebietId: 'feldberg', sicherheit: 'hoch' })
  })
  it('Gebietsname nur in der Beschreibung ist mittel sicher', () => {
    expect(ordneZu({ titel: 'Frühlingstour', beschreibung: 'Wir wandern im Kaiserstuhl.' }, index)).toMatchObject({ gebietId: 'kaiserstuhl', sicherheit: 'mittel' })
  })
})

describe('zugangAm', () => {
  it('nimmt im Winter eine bediente Haltestelle statt des Saisonbusses am Pass', () => {
    const z = ordneZu(tour(134930), index)!
    const steingletscher = inhalt.haltestellen.find((h) => h.id === 'steingletscher')!
    const winter = zugangAm(inhalt, z, '2026-01-17')!
    if (steingletscher.bedient) expect(winter.id).not.toBe('steingletscher')
    expect(zugangAm(inhalt, z, '2026-08-01')!.id).toBe('steingletscher')
  })
})
