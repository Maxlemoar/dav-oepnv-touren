import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import { ladeFahrplan, nachLiveBis } from '@/lib/verbindung/fahrplan'

function datei(inhalt: string): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fahrplan-'))
  const f = path.join(d, 'fahrplan.yaml')
  fs.writeFileSync(f, inhalt)
  return f
}

describe('ladeFahrplan', () => {
  it('liest die echte content/fahrplan.yaml', () => {
    const f = ladeFahrplan()
    expect(f.liveBis).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(f.hinweis.length).toBeGreaterThan(10)
  })
  it('liest liveBis und hinweis', () => {
    expect(ladeFahrplan(datei('liveBis: "2026-12-12"\nhinweis: Noch nicht da.\n'))).toEqual({ liveBis: '2026-12-12', hinweis: 'Noch nicht da.' })
  })
  it('wirft bei ungültigem Datum oder fehlendem Hinweis', () => {
    expect(() => ladeFahrplan(datei('liveBis: "12.12.2026"\nhinweis: x\n'))).toThrow(/fahrplan\.yaml/)
    expect(() => ladeFahrplan(datei('liveBis: "2026-12-12"\n'))).toThrow(/hinweis/)
  })
})

describe('nachLiveBis', () => {
  const f = { liveBis: '2026-12-12', hinweis: 'x' }
  it('bis einschließlich liveBis live', () => {
    expect(nachLiveBis('2026-12-12', f)).toBe(false)
    expect(nachLiveBis('2026-11-21', f)).toBe(false)
  })
  it('danach nicht mehr', () => {
    expect(nachLiveBis('2026-12-13', f)).toBe(true)
  })
})
