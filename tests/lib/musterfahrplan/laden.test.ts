import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ladeMusterfahrplan } from '@/lib/musterfahrplan/laden'

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
