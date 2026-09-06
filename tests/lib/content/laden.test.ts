import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { ladeInhalt, pruefeQuerverweise } from '@/lib/content/laden'

const FIX = path.resolve(__dirname, '../../fixtures/content')

function kopie(): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inhalt-'))
  fs.cpSync(FIX, tmp, { recursive: true })
  return tmp
}

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
    const tmp = kopie()
    fs.writeFileSync(path.join(tmp, 'huetten/kaputt.yaml'), 'id: kaputt\nname: x\n')
    expect(() => ladeInhalt(tmp)).toThrow(/huetten\/kaputt\.yaml/)
  })

  it('wirft bei YAML-Syntaxfehler mit Dateiname', () => {
    const tmp = kopie()
    fs.writeFileSync(path.join(tmp, 'huetten/syntax.yaml'), 'id: [\n')
    expect(() => ladeInhalt(tmp)).toThrow(/Ungültige YAML in huetten\/syntax\.yaml/)
  })

  it('wirft, wenn Dateiname und id nicht übereinstimmen', () => {
    const tmp = kopie()
    fs.renameSync(path.join(tmp, 'startorte/offenburg.yaml'), path.join(tmp, 'startorte/kehl.yaml'))
    expect(() => ladeInhalt(tmp)).toThrow(/startorte\/kehl\.yaml.*id "offenburg"/)
  })

  it('wirft, wenn ein Sammlungsverzeichnis fehlt', () => {
    const tmp = kopie()
    fs.rmSync(path.join(tmp, 'gebiete'), { recursive: true })
    expect(() => ladeInhalt(tmp)).toThrow(/Verzeichnis gebiete fehlt/)
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
  it('meldet Richtwerte für unbekannte Startorte', () => {
    const inhalt = ladeInhalt(FIX)
    const h = inhalt.haltestellen[0]
    const fehler = pruefeQuerverweise({
      ...inhalt,
      haltestellen: [{ ...h, richtwerte: { ...h.richtwerte, nirgendwo: h.richtwerte.offenburg } }],
    })
    expect(fehler).toEqual(['haltestelle kandersteg: richtwert für unbekannten startort "nirgendwo"'])
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
