import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import { zeitraumAusUrl, verbindungParameter } from '@/lib/verbindung/url'
import * as parameter from '@/lib/verbindung/parameter'

const HEUTE = '2026-11-19' // Donnerstag

describe('zeitraumAusUrl (url.ts)', () => {
  it('lässt ein künftiges Datum stehen', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-11-28&rueck=2026-11-29'), 0, HEUTE))
      .toEqual({ datum: '2026-11-28', rueck: '2026-11-29', fenster: 360 })
  })
  it('lässt heute stehen', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-11-19'), 0, HEUTE).datum).toBe('2026-11-19')
  })
  it('biegt ein vergangenes Datum auf den kommenden Samstag um', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12&rueck=2026-09-13'), 0, HEUTE))
      .toEqual({ datum: '2026-11-21', rueck: '2026-11-21', fenster: 360 })
  })
  it('behält dabei die Mindestnächte ein', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-09-12'), 1, HEUTE).rueck).toBe('2026-11-22')
  })
  it('nimmt am Samstag den Samstag selbst', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=2026-11-20'), 0, '2026-11-21').datum).toBe('2026-11-21')
  })
  it('ersetzt ein unbrauchbares Datum durch den kommenden Samstag', () => {
    expect(zeitraumAusUrl(new URLSearchParams('datum=morgen'), 0, HEUTE).datum).toBe('2026-11-21')
  })
  it('ohne datum der kommende Samstag ab heute', () => {
    expect(zeitraumAusUrl(new URLSearchParams(''), 0, HEUTE)).toEqual({ datum: '2026-11-21', rueck: '2026-11-21', fenster: 360 })
  })
  it('verbindungParameter reicht heute durch', () => {
    expect(verbindungParameter(new URLSearchParams('datum=2026-11-01'), HEUTE).datum).toBe('2026-11-21')
  })
  it('parameter.ts exportiert dieselben Funktionen weiter', () => {
    expect(parameter.zeitraumAusUrl).toBe(zeitraumAusUrl)
    expect(parameter.verbindungParameter).toBe(verbindungParameter)
  })
})

describe('url.ts bleibt ohne zod', () => {
  const src = path.resolve(__dirname, '../../../src')
  /** Folgt allen @/-Importen ab url.ts und sammelt die Paketimporte. */
  function pakete(datei: string, gesehen = new Set<string>()): Set<string> {
    const ergebnis = new Set<string>()
    if (gesehen.has(datei)) return ergebnis
    gesehen.add(datei)
    const text = fs.readFileSync(datei, 'utf8')
    for (const m of text.matchAll(/^(?:import|export)\s+(type\s+)?[^'"]*from\s+'([^']+)'/gm)) {
      if (m[1]) continue // reine Typimporte landen nicht im Bundle
      const ziel = m[2]
      if (ziel.startsWith('@/')) pakete(path.join(src, `${ziel.slice(2)}.ts`), gesehen).forEach((p) => ergebnis.add(p))
      else if (ziel.startsWith('.')) pakete(path.resolve(path.dirname(datei), `${ziel}.ts`), gesehen).forEach((p) => ergebnis.add(p))
      else ergebnis.add(ziel)
    }
    return ergebnis
  }
  it('zieht zod weder direkt noch über Hilfsmodule nach', () => {
    expect([...pakete(path.join(src, 'lib/verbindung/url.ts'))]).not.toContain('zod')
  })
})
