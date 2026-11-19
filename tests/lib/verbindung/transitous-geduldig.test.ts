import { describe, it, expect, vi } from 'vitest'
import { planenGeduldig, curlAusgabeLesen, type Abruf } from '@/lib/verbindung/transitous-geduldig'
import { TransitousFehler } from '@/lib/verbindung/transitous'

const it1 = { startTime: '2026-11-21T05:00:00Z', endTime: '2026-11-21T08:00:00Z', duration: 1, transfers: 0, legs: [] }
const ok = { status: 200, body: JSON.stringify({ itineraries: [it1] }) }
const p = {
  von: 'de:og', nach: 'ch-alt', zeit: '2026-11-21T04:00:00Z',
  vonKoord: { lat: 48.47, lon: 7.94 }, nachKoord: { lat: 46.49, lon: 7.67 },
}

function abrufFolge(...antworten: ({ status: number; body: string } | Error)[]) {
  let n = 0
  return vi.fn<Abruf>(async () => {
    const a = antworten[Math.min(n++, antworten.length - 1)]
    if (a instanceof Error) throw a
    return a
  })
}
const schlaf = vi.fn(async () => {})

describe('curlAusgabeLesen', () => {
  it('trennt Antwort und Statuscode', () => {
    expect(curlAusgabeLesen('{"a":1}\n__STATUS__200')).toEqual({ status: 200, body: '{"a":1}' })
    expect(curlAusgabeLesen('\n__STATUS__000')).toEqual({ status: 0, body: '' })
    expect(curlAusgabeLesen('kaputt')).toEqual({ status: 0, body: 'kaputt' })
  })
})

describe('planenGeduldig', () => {
  it('liefert die Verbindungen beim ersten Versuch', async () => {
    const abruf = abrufFolge(ok)
    await expect(planenGeduldig(p, { abruf, schlaf })).resolves.toEqual([it1])
    expect(abruf).toHaveBeenCalledTimes(1)
    expect(abruf.mock.calls[0][0]).toContain('fromPlace=de%3Aog')
  })
  it('wiederholt bei 429 und Zeitüberschreitung bis zu dreimal', async () => {
    const abruf = abrufFolge({ status: 429, body: '' }, new Error('curl: (28) timeout'), { status: 0, body: '' }, ok)
    await expect(planenGeduldig(p, { abruf, schlaf })).resolves.toHaveLength(1)
    expect(abruf).toHaveBeenCalledTimes(4)
    expect(schlaf).toHaveBeenCalled()
  })
  it('gibt nach drei Wiederholungen auf', async () => {
    const abruf = abrufFolge({ status: 503, body: '' })
    const e = await planenGeduldig(p, { abruf, schlaf }).catch((x) => x)
    expect(e).toBeInstanceOf(TransitousFehler)
    expect(e.status).toBe(503)
    expect(abruf).toHaveBeenCalledTimes(4)
  })
  it('wiederholt andere Fehler nicht', async () => {
    const abruf = abrufFolge({ status: 400, body: '{"error":"bad time"}' }, ok)
    await expect(planenGeduldig(p, { abruf, schlaf })).rejects.toBeInstanceOf(TransitousFehler)
    expect(abruf).toHaveBeenCalledTimes(1)
  })
  it('weicht bei unbekanntem Ort einmal auf Koordinaten aus', async () => {
    const abruf = abrufFolge({ status: 404, body: '' }, ok)
    await expect(planenGeduldig(p, { abruf, schlaf })).resolves.toHaveLength(1)
    const zweite = new URL(abruf.mock.calls[1][0])
    expect(zweite.searchParams.get('fromPlace')).toBe('48.47,7.94')
    expect(zweite.searchParams.get('toPlace')).toBe('46.49,7.67')
  })
  it('Koordinaten-Ausweg und Wiederholung bei Überlast lassen sich kombinieren', async () => {
    const abruf = abrufFolge({ status: 404, body: '' }, { status: 429, body: '' }, ok)
    await expect(planenGeduldig(p, { abruf, schlaf })).resolves.toHaveLength(1)
    expect(new URL(abruf.mock.calls[2][0]).searchParams.get('toPlace')).toBe('46.49,7.67')
  })
  it('liefert leere Liste, wenn Transitous keine Verbindung findet', async () => {
    const abruf = abrufFolge({ status: 200, body: JSON.stringify({ itineraries: [] }) })
    await expect(planenGeduldig(p, { abruf, schlaf })).resolves.toEqual([])
  })
  it('wirft bei unlesbarer Antwort', async () => {
    const abruf = abrufFolge({ status: 200, body: '<html>' })
    await expect(planenGeduldig(p, { abruf, schlaf })).rejects.toBeInstanceOf(TransitousFehler)
  })
})
