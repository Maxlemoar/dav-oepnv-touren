import { describe, expect, it } from 'vitest'
import { abdeckungsWarnungen, bereinigeOrt, fehlschlagZusammenfassung, tagesplanBerechnen, type Planen } from '@/lib/musterfahrplan/berechnen'
import type { Itinerary } from '@/lib/verbindung/transitous'

const TAG = '2026-11-20'
const A = { haltestelleId: 'a', lat: 1, lon: 1 }
const Z = { haltestelleId: 'z', lat: 2, lon: 2 }

/** Abfahrt lokal HH (Winterzeit = UTC+1), Fahrzeit 1 h. */
const fahrt = (stunde: number, minute = 0): Itinerary => {
  const ab = new Date(Date.UTC(2026, 10, 20, stunde - 1, minute))
  return { startTime: ab.toISOString(), endTime: new Date(ab.getTime() + 3_600_000).toISOString(), duration: 0, transfers: 0, legs: [] }
}

function mock(hinAntworten: Itinerary[][]) {
  const anfragen: { von: string; zeit: string; ankunftBis?: boolean }[] = []
  let hin = 0
  const planen: Planen = async (p) => {
    anfragen.push({ von: p.von, zeit: p.zeit, ankunftBis: p.ankunftBis })
    return p.ankunftBis ? [fahrt(15)] : (hinAntworten[hin++] ?? [])
  }
  return { planen, anfragen }
}

describe('tagesplanBerechnen', () => {
  it('fragt weiter ab letzter Abfahrt + 1 Minute, bis die Hinfahrten den Abend erreichen', async () => {
    const m = mock([[fahrt(5), fahrt(12, 30)], [fahrt(13), fahrt(17)], [fahrt(18), fahrt(21)]])
    const { plan } = await tagesplanBerechnen(m.planen, A, Z, TAG)
    const hinAnfragen = m.anfragen.filter((a) => !a.ankunftBis)
    expect(hinAnfragen).toHaveLength(3)
    expect(hinAnfragen[1].zeit).toBe('2026-11-20T11:31:00Z') // 12:31 lokal
    expect(hinAnfragen[2].zeit).toBe('2026-11-20T16:01:00Z') // 17:01 lokal
    expect(plan.hin.map((f) => f.ab)).toEqual(['05:00', '12:30', '13:00', '17:00', '18:00', '21:00'])
    expect(m.anfragen).toHaveLength(4) // 3 Hin + 1 Rück
  })

  it('macht höchstens zwei Folgeanfragen', async () => {
    const m = mock([[fahrt(5)], [fahrt(6)], [fahrt(7)], [fahrt(8)]])
    await tagesplanBerechnen(m.planen, A, Z, TAG)
    expect(m.anfragen.filter((a) => !a.ankunftBis)).toHaveLength(3)
  })

  it('macht keine Folgeanfrage, wenn die erste Antwort bis 20:00 reicht', async () => {
    const m = mock([[fahrt(5), fahrt(20)]])
    await tagesplanBerechnen(m.planen, A, Z, TAG)
    expect(m.anfragen).toHaveLength(2)
  })

  it('bricht ab, wenn die Folgeanfrage nichts Neues bringt, und führt Doppelte nicht doppelt', async () => {
    const m = mock([[fahrt(5), fahrt(10)], [fahrt(10)]])
    const { plan } = await tagesplanBerechnen(m.planen, A, Z, TAG)
    expect(m.anfragen.filter((a) => !a.ankunftBis)).toHaveLength(2)
    expect(plan.hin.map((f) => f.ab)).toEqual(['05:00', '10:00'])
  })
})

describe('abdeckungsWarnungen', () => {
  const f = (ab: string) => ({ ab, an: '23:00', umstiege: 0, via: [], fern: false })
  it('warnt bei letzter Hinfahrt vor 20:00 und früher Rückfahrt nach 14:00', () => {
    expect(abdeckungsWarnungen({ hin: [f('19:59')], rueck: [f('14:01')] })).toHaveLength(2)
    expect(abdeckungsWarnungen({ hin: [f('20:00')], rueck: [f('14:00')] })).toEqual([])
  })
})

describe('bereinigeOrt', () => {
  const f = (ab: string, an: string) => ({ ab, an, umstiege: 1, via: [], fern: false })
  it('entfernt Fahrten mit Ankunft vor Abfahrt, behält Strecke und andere Fahrten, ändert die Eingabe nicht', () => {
    const ort = {
      plaene: { sa: { hin: [f('17:58', '00:45'), f('07:22', '07:18'), f('08:00', '08:00'), f('09:00', '12:00')], rueck: [f('23:22', '09:56'), f('15:00', '19:00')] } },
      strecke: [[[8, 48] as [number, number], [9, 49] as [number, number]]],
    }
    const r = bereinigeOrt(ort)
    expect(r.plaene.sa!.hin.map((x) => x.ab)).toEqual(['08:00', '09:00'])
    expect(r.plaene.sa!.rueck.map((x) => x.ab)).toEqual(['15:00'])
    expect(r.strecke).toEqual(ort.strecke)
    expect(r.plaene.so).toBeUndefined()
    expect(ort.plaene.sa.hin).toHaveLength(4)
  })
})

describe('fehlschlagZusammenfassung', () => {
  it('ist leer ohne Fehlschläge', () => {
    expect(fehlschlagZusammenfassung([])).toEqual([])
  })
  it('listet je Fehlschlag den Befehl zum Nachholen und die verbrauchten Anfragen', () => {
    const z = fehlschlagZusammenfassung([
      { ortId: 'oberstdorf', klasse: 'sa', anfragen: 3, meldung: 'Transitous HTTP 500' },
      { ortId: 'kandersteg', klasse: 'so', anfragen: 1, meldung: 'Timeout' },
    ])
    expect(z[0]).toContain('2 Fehlschläge')
    expect(z[0]).toContain('4 Anfragen')
    expect(z[1]).toContain('npm run musterfahrplan -- --nur oberstdorf --klasse sa')
    expect(z[1]).toContain('3 Anfragen')
    expect(z[2]).toContain('--nur kandersteg --klasse so')
  })
})
