import { describe, it, expect } from 'vitest'
import { co2ErsparnisKg } from '@/lib/co2'

const faktoren = { pkwGrammProFahrzeugKm: 230, personenProPkw: 2.5, bahnGrammProPersonenKm: 45 }

describe('co2ErsparnisKg', () => {
  it('rechnet Hin- und Rückfahrt pro Person und rundet auf 5 kg', () => {
    // Auto: 280 km * 2 * 230 g / 2.5 = 51.52 kg; Bahn: 300 km * 2 * 45 g = 27 kg; Differenz 24.52 -> 25
    expect(co2ErsparnisKg({ strassenKm: 280, bahnKm: 300 }, faktoren)).toBe(25)
  })
  it('liefert undefined ohne Straßendistanz', () => {
    expect(co2ErsparnisKg({ bahnKm: 300 }, faktoren)).toBeUndefined()
  })
  it('nimmt Bahndistanz = Straßendistanz an, wenn sie fehlt', () => {
    // 280*2*230/2.5 = 51.52; 280*2*45 = 25.2; Differenz 26.32 -> 25
    expect(co2ErsparnisKg({ strassenKm: 280 }, faktoren)).toBe(25)
  })
  it('nie negativ', () => {
    expect(co2ErsparnisKg({ strassenKm: 10, bahnKm: 400 }, faktoren)).toBe(0)
  })
})
