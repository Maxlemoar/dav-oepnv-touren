import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fahrplanLink, fehlerMeldenLink, rueckfahrtLink } from '@/lib/links'

const offenburg = { name: 'Offenburg', bahn: { extId: '8000290', name: 'Offenburg', x: 7946725, y: 48476479 } }
const baerental = { name: 'Feldberg-Bärental Bahnhof', bahn: { extId: '8001971', name: 'Feldberg-Bärental', x: 8098292, y: 47871442 } }

describe('fahrplanLink', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(1_788_378_915_000)) })
  afterEach(() => vi.useRealTimers())

  it('CH-Ziel führt zur SBB', () => {
    expect(fahrplanLink({ land: 'CH', von: offenburg, nach: { name: 'Kandersteg' }, datum: '2026-09-12' }))
      .toBe('https://www.sbb.ch/de?von=Offenburg&nach=Kandersteg&datum=2026-09-12&zeit=06%3A00')
  })
  it('bahn.de mit Bahnhofs-IDs, wenn beide Orte eine haben', () => {
    const url = fahrplanLink({ land: 'DE', von: offenburg, nach: baerental, datum: '2026-09-12' })
    expect(url.startsWith('https://www.bahn.de/buchung/fahrplan/suche#sts=true&so=Offenburg&zo=Feldberg-B%C3%A4rental&kl=2&')).toBe(true)
    expect(url).toContain('&soid=A%3D1%40O%3DOffenburg%40X%3D7946725%40Y%3D48476479%40U%3D80%40L%3D8000290%40B%3D1%40p%3D1788378915%40&')
    expect(url).toContain('&zoid=A%3D1%40O%3DFeldberg-B%C3%A4rental%40X%3D8098292%40Y%3D47871442%40U%3D80%40L%3D8001971%40B%3D1%40p%3D1788378915%40&')
    expect(url).toContain('&sot=ST&zot=ST&soei=8000290&zoei=8001971&hd=2026-09-12T06%3A00%3A00&')
    expect(url.endsWith('&hz=%5B%5D&fm=false&bp=false')).toBe(true)
  })
  it('übernimmt die lokale Abfahrtszeit', () => {
    expect(fahrplanLink({ land: 'DE', von: offenburg, nach: baerental, datum: '2026-09-12', zeitLokal: '07:41' }))
      .toContain('&hd=2026-09-12T07%3A41%3A00&')
  })
  it('Fallback mit Namen, wenn eine bahn-ID fehlt', () => {
    expect(fahrplanLink({ land: 'DE', von: { name: 'Offenburg' }, nach: baerental, datum: '2026-09-12' }))
      .toBe('https://www.bahn.de/buchung/fahrplan/suche#sts=true&so=Offenburg&zo=Feldberg-B%C3%A4rental%20Bahnhof&hd=2026-09-12T06%3A00%3A00')
  })
})

describe('rueckfahrtLink', () => {
  it('vertauscht die Orte und nimmt 15:00 als Standard', () => {
    const url = rueckfahrtLink({ land: 'DE', von: offenburg, nach: baerental, datum: '2026-09-13' })
    expect(url).toContain('#sts=true&so=Feldberg-B%C3%A4rental&zo=Offenburg&')
    expect(url).toContain('&soei=8001971&zoei=8000290&hd=2026-09-13T15%3A00%3A00&')
  })
  it('CH-Ziel: SBB in Gegenrichtung', () => {
    expect(rueckfahrtLink({ land: 'CH', von: offenburg, nach: { name: 'Kandersteg' }, datum: '2026-09-13', zeitLokal: '16:04' }))
      .toBe('https://www.sbb.ch/de?von=Kandersteg&nach=Offenburg&datum=2026-09-13&zeit=16%3A04')
  })
})

describe('fehlerMeldenLink', () => {
  it('mailto mit Betreff, wenn Adresse gesetzt', () => {
    expect(fehlerMeldenLink('Doldenhornhütte', 'ak@example.org')).toBe('mailto:ak@example.org?subject=Fehler%3A%20Doldenhornh%C3%BCtte')
  })
  it('GitHub-Issue ohne Adresse', () => {
    expect(fehlerMeldenLink('Doldenhornhütte', undefined)).toBe('https://github.com/Maxlemoar/dav-oepnv-touren/issues/new?title=Fehler%3A%20Doldenhornh%C3%BCtte')
  })
})
