import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ladeMusterfahrplan, musterfahrplanCacheLeeren } from '@/lib/musterfahrplan/laden'

const FIXTURE = path.join(process.cwd(), 'tests', 'fixtures', 'musterfahrplan.json')

describe('ladeMusterfahrplan', () => {
  it('lädt eine gültige Datei', () => {
    const m = ladeMusterfahrplan(FIXTURE)!
    expect(m.startortId).toBe('offenburg')
    expect(m.orte.kandersteg.plaene.sa?.hin[0].ab).toBe('06:12')
    expect(m.orte.kandersteg.strecke).toHaveLength(1)
  })

  it('liefert undefined, wenn die Datei fehlt', () => {
    expect(ladeMusterfahrplan(path.join(os.tmpdir(), 'gibt-es-nicht-musterfahrplan.json'))).toBeUndefined()
  })

  it('weist Uhrzeiten ohne führende Null mit Dateinamen ab', () => {
    const roh = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'))
    roh.orte.kandersteg.plaene.sa.hin[0].ab = '6:12'
    const verz = fs.mkdtempSync(path.join(os.tmpdir(), 'muster-'))
    const datei = path.join(verz, 'kaputt.json')
    fs.writeFileSync(datei, JSON.stringify(roh))
    expect(() => ladeMusterfahrplan(datei)).toThrow(/kaputt\.json.*ab/)
  })

  it('weist ungültiges JSON mit Dateinamen ab', () => {
    const verz = fs.mkdtempSync(path.join(os.tmpdir(), 'muster-'))
    const datei = path.join(verz, 'kein.json')
    fs.writeFileSync(datei, '{')
    expect(() => ladeMusterfahrplan(datei)).toThrow(/kein\.json/)
  })
})

describe('ladeMusterfahrplan mit Standardpfad', () => {
  /** Arbeitsverzeichnis mit content/musterfahrplan.json aus der Fixture; die echte Datei bleibt unberührt. */
  function arbeitsverzeichnis() {
    const verz = fs.mkdtempSync(path.join(os.tmpdir(), 'muster-cwd-'))
    fs.mkdirSync(path.join(verz, 'content'))
    const datei = path.join(verz, 'content', 'musterfahrplan.json')
    fs.copyFileSync(FIXTURE, datei)
    vi.spyOn(process, 'cwd').mockReturnValue(verz)
    musterfahrplanCacheLeeren()
    return datei
  }
  afterEach(() => { vi.restoreAllMocks(); musterfahrplanCacheLeeren() })

  it('liest und prüft die Datei nur einmal je Prozess', () => {
    arbeitsverzeichnis()
    const lesen = vi.spyOn(fs, 'readFileSync')
    const a = ladeMusterfahrplan()
    const b = ladeMusterfahrplan()
    expect(a?.startortId).toBe('offenburg')
    expect(b).toBe(a)
    expect(lesen).toHaveBeenCalledTimes(1)
  })

  it('liest neu, wenn sich die Datei ändert (neuer Lauf von npm run musterfahrplan im Entwicklungsserver)', () => {
    const datei = arbeitsverzeichnis()
    const a = ladeMusterfahrplan()!
    const roh = JSON.parse(fs.readFileSync(datei, 'utf8'))
    roh.berechnetAm = '2026-11-20'
    fs.writeFileSync(datei, JSON.stringify(roh))
    const spaeter = new Date(Date.now() + 5000)
    fs.utimesSync(datei, spaeter, spaeter)
    const b = ladeMusterfahrplan()!
    expect(b).not.toBe(a)
    expect(b.berechnetAm).toBe('2026-11-20')
  })

  it('ein ausdrücklicher Pfad umgeht den Speicher', () => {
    expect(ladeMusterfahrplan(FIXTURE)).not.toBe(ladeMusterfahrplan(FIXTURE))
  })
})
