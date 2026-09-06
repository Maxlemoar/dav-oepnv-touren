import { describe, it, expect } from 'vitest'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'

describe('parseVerbindungParameter', () => {
  it('liest gültige Parameter mit Standardwerten', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(p).toEqual({ ok: true, wert: { von: 'offenburg', nach: 'kandersteg', datum: '2026-09-12', rueckfahrt: 'gleicher-tag', fenster: 360 } })
  })
  it('akzeptiert folgetag und fenster', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&rueckfahrt=folgetag&fenster=240'))
    expect(p.ok && p.wert.rueckfahrt).toBe('folgetag')
    expect(p.ok && p.wert.fenster).toBe(240)
  })
  it('lehnt falsches Datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=12.09.2026'))
    expect(p.ok).toBe(false)
  })
  it('lehnt Fenster außerhalb 60 bis 720 ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&fenster=10'))
    expect(p.ok).toBe(false)
  })
})
