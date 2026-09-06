import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { ladeInhalt, pruefeQuerverweise } from '@/lib/content/laden'

const FIX = path.resolve(__dirname, '../../fixtures/content')

describe('ladeInhalt', () => {
  it('liest alle Sammlungen aus dem Verzeichnis', () => {
    const inhalt = ladeInhalt(FIX)
    expect(inhalt.startorte.map((s) => s.id)).toEqual(['offenburg'])
    expect(inhalt.haltestellen[0].richtwerte.offenburg.fahrzeitMin).toBe(250)
    expect(inhalt.gebiete[0].id).toBe('kandersteg')
    expect(inhalt.huetten[0].zustiege[0].bergbahn).toBe(false)
    expect(inhalt.tickets.regeln).toHaveLength(4)
    expect(inhalt.emissionen.personenProPkw).toBe(2.5)
  })

  it('wirft bei ungültiger YAML mit Dateiname', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inhalt-'))
    fs.cpSync(FIX, tmp, { recursive: true })
    fs.writeFileSync(path.join(tmp, 'huetten/kaputt.yaml'), 'id: Kaputt\nname: x\n')
    expect(() => ladeInhalt(tmp)).toThrow(/huetten\/kaputt\.yaml/)
  })
})

describe('pruefeQuerverweise', () => {
  it('meldet unbekannte Verweise', () => {
    const inhalt = ladeInhalt(FIX)
    const fehler = pruefeQuerverweise({
      ...inhalt,
      huetten: [{ ...inhalt.huetten[0], gebietId: 'nirgends', zustiege: [{ ...inhalt.huetten[0].zustiege[0], haltestelleId: 'niemand' }] }],
    })
    expect(fehler).toEqual([
      'huette doldenhornhuette: gebietId "nirgends" unbekannt',
      'huette doldenhornhuette: zustieg haltestelleId "niemand" unbekannt',
    ])
  })
  it('ist leer bei gültigen Daten', () => {
    expect(pruefeQuerverweise(ladeInhalt(FIX))).toEqual([])
  })
  it('meldet Gebiet ohne Hütte nicht, aber Haltestelle ohne Gebiet', () => {
    const inhalt = ladeInhalt(FIX)
    const fehler = pruefeQuerverweise({
      ...inhalt,
      haltestellen: [...inhalt.haltestellen, { ...inhalt.haltestellen[0], id: 'einsam' }],
    })
    expect(fehler).toEqual(['haltestelle einsam: gehört zu keinem Gebiet'])
  })
})
