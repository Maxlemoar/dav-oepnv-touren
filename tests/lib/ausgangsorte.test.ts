import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import { ladeInhalt } from '@/lib/content/laden'
import { ausgangsorte, ausgangsortDatei, tagesplanDatei } from '@/lib/ausgangsorte'
import type { Musterfahrplan } from '@/lib/musterfahrplan/typen'

const FIX = path.resolve(__dirname, '../fixtures/content')
const MUSTER = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../fixtures/musterfahrplan.json'), 'utf8')) as Musterfahrplan
const i = ladeInhalt(FIX)

describe('ausgangsorte', () => {
  it('liefert je Gebiet genau einen Ort mit erster Haltestelle', () => {
    const orte = ausgangsorte(i, 'offenburg')
    expect(orte).toHaveLength(i.gebiete.length)
    expect(orte[0]).toMatchObject({
      id: 'kandersteg', haltestelleId: 'kandersteg', name: 'Kandersteg', gebiet: 'Kandersteg',
      region: 'Berner Oberland', land: 'CH', lat: 46.495, lon: 7.671, ticket: 'halbtax', fahrzeitMin: 250,
    })
  })

  it('lässt ticket und fahrzeitMin ohne Richtwert weg', () => {
    const o = ausgangsorte(i, 'unbekannt')[0]
    expect('ticket' in o).toBe(false)
    expect('fahrzeitMin' in o).toBe(false)
  })

  it('überspringt Gebiete, deren erste Haltestelle fehlt', () => {
    const j = { ...i, gebiete: [{ ...i.gebiete[0], haltestellen: ['gibtsnicht'] }] }
    expect(ausgangsorte(j, 'offenburg')).toEqual([])
  })
})

describe('ausgangsortDatei', () => {
  it('enthält liveBis, Orte und Strecken nur für Orte mit Daten', () => {
    const orte = ausgangsorte(i, 'offenburg')
    const d = ausgangsortDatei(orte, MUSTER, '2026-12-12')
    expect(d.liveBis).toBe('2026-12-12')
    expect(d.berechnetAm).toBe('2026-11-19')
    expect(d.orte).toBe(orte)
    expect(Object.keys(d.strecken)).toEqual(['kandersteg'])
  })

  it('ohne Musterfahrplan: keine Strecken, kein berechnetAm', () => {
    const d = ausgangsortDatei(ausgangsorte(i, 'offenburg'), undefined, '2026-12-12')
    expect(d.strecken).toEqual({})
    expect(d.berechnetAm).toBeUndefined()
  })
})

describe('tagesplanDatei', () => {
  it('ohne Musterfahrplan leer', () => {
    expect(tagesplanDatei(undefined, 'sa')).toEqual({})
  })

  it('nur Orte mit Plan der Klasse', () => {
    expect(Object.keys(tagesplanDatei(MUSTER, 'sa'))).toEqual(['kandersteg'])
    expect(tagesplanDatei(MUSTER, 'so')).toEqual({})
  })

  it('schreibt via immer leer', () => {
    const p = tagesplanDatei(MUSTER, 'sa').kandersteg
    expect(p.hin[0]).toMatchObject({ ab: '06:12', an: '09:41', umstiege: 3, fern: true })
    for (const f of [...p.hin, ...p.rueck]) expect(f.via).toEqual([])
  })
})
