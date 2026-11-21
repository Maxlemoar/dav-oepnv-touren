import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { VerbindungOhneLive } from '@/components/VerbindungZeile'
import type { VerbindungAntwort } from '@/lib/verbindung/service'

const basis: VerbindungAntwort = {
  quelle: 'richtwert', datum: '2026-11-21', rueckfahrtDatum: '2026-11-22', naechte: 1, ticket: { ticket: 'halbtax', hinweis: 'CH' },
}
const richtwert = { fahrzeitMin: 250, umstiege: 1, takt: 'stuendlich' as const, ticket: 'halbtax' as const, berechnetAm: '2026-09-07' }
const nichtBedient = { passt: false as const, grund: 'fährt am Datum nicht', naechte: 1 }
const html = (a: VerbindungAntwort) => renderToStaticMarkup(createElement(VerbindungOhneLive, { antwort: a, vonName: 'Offenburg', links: 'LINKS' }))

describe('VerbindungOhneLive', () => {
  it('keine_verbindung nennt den Grund der Passung', () => {
    const t = html({ ...basis, quelle: 'live', fehlerArt: 'keine_verbindung', hinweis: 'Am Datum keine Busverbindung (Saisonbetrieb)', passung: nichtBedient })
    expect(t).toContain('vermutlich Saisonbetrieb')
    expect(t).toContain('fährt am Datum nicht')
    expect(t).toContain('LINKS')
  })
  it('ohne Richtwert steht die Passung neben "Keine typische Verbindung bekannt"', () => {
    const t = html({ ...basis, fehlerArt: 'dienst_nicht_erreichbar', passung: nichtBedient })
    expect(t).toContain('Keine typische Verbindung bekannt.')
    expect(t).toContain('fährt am Datum nicht')
  })
  it('mit Richtwert: ca.-Zeile mit Passung', () => {
    const t = html({ ...basis, richtwert, fehlerArt: 'fahrplan_noch_nicht_verfuegbar', passung: { passt: true, hin: { ab: '06:12', an: '09:41', umstiege: 2, via: [], fern: true }, rueck: { ab: '13:20', an: '17:02', umstiege: 2, via: [], fern: true }, vorOrtMin: 2340, naechte: 1 } })
    expect(t).toContain('ca. 4:10 h')
    expect(t).toContain('passt · 1 Nacht')
  })
  it('ohne Passung kein Badge, bei vergangenem Datum nur der Hinweis', () => {
    expect(html({ ...basis, fehlerArt: 'keine_verbindung' })).not.toContain('badge')
    expect(html({ ...basis, fehlerArt: 'datum_vergangen', passung: nichtBedient })).not.toContain('fährt am Datum nicht')
  })
})
