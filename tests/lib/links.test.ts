import { describe, it, expect } from 'vitest'
import { fahrplanLink, fehlerMeldenLink } from '@/lib/links'

describe('fahrplanLink', () => {
  it('CH-Ziel führt zur SBB', () => {
    expect(fahrplanLink('CH', 'Offenburg', 'Kandersteg', '2026-09-12'))
      .toBe('https://www.sbb.ch/de?von=Offenburg&nach=Kandersteg&datum=2026-09-12&zeit=06%3A00')
  })
  it('DE/FR/AT-Ziel führt zu bahn.de', () => {
    expect(fahrplanLink('DE', 'Offenburg', 'Feldberg-Bärental Bahnhof', '2026-09-12'))
      .toBe('https://www.bahn.de/buchung/fahrplan/suche#sts=true&so=Offenburg&zo=Feldberg-B%C3%A4rental%20Bahnhof&hd=2026-09-12T06%3A00%3A00')
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
