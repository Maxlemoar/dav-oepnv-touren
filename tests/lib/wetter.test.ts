import { describe, it, expect } from 'vitest'
import { openMeteoUrl, wetterAusOpenMeteo, wetterCode, wetterDaten, wetterKurz } from '@/lib/wetter'

describe('wetterCode', () => {
  it('übersetzt WMO-Wettercodes', () => {
    expect(wetterCode(0)).toEqual({ symbol: '☀️', text: 'sonnig' })
    expect(wetterCode(3)).toEqual({ symbol: '☁️', text: 'bedeckt' })
    expect(wetterCode(45).text).toBe('Nebel')
    expect(wetterCode(63).text).toBe('Regen')
    expect(wetterCode(73).text).toBe('Schneefall')
    expect(wetterCode(85).text).toBe('Schneeschauer')
    expect(wetterCode(95).text).toBe('Gewitter')
    expect(wetterCode(99).text).toBe('Gewitter mit Hagel')
  })
  it('liefert für unbekannte Codes einen neutralen Text', () => {
    expect(wetterCode(42)).toEqual({ symbol: '·', text: 'keine Angabe' })
  })
})

describe('wetterDaten', () => {
  const heute = '2026-11-19'
  it('liefert Hin- und Rückdatum, wenn beide höchstens 14 Tage voraus liegen', () => {
    expect(wetterDaten('2026-11-28', '2026-11-29', heute)).toEqual(['2026-11-28', '2026-11-29'])
  })
  it('nennt ein Datum bei Tagestouren nur einmal', () => {
    expect(wetterDaten('2026-11-28', '2026-11-28', heute)).toEqual(['2026-11-28'])
  })
  it('lässt Daten über 14 Tage voraus und vergangene Daten weg', () => {
    expect(wetterDaten('2026-12-03', '2026-12-04', heute)).toEqual(['2026-12-03'])
    expect(wetterDaten('2026-12-05', '2026-12-06', heute)).toEqual([])
    expect(wetterDaten('2026-11-18', '2026-11-18', heute)).toEqual([])
  })
  it('lehnt ungültige Daten ab', () => {
    expect(wetterDaten('morgen', '2026-11-28', heute)).toEqual(['2026-11-28'])
  })
})

describe('openMeteoUrl', () => {
  it('fragt Tageswerte für Koordinaten, Höhe und Zeitraum ab', () => {
    const url = new URL(openMeteoUrl({ lat: 46.49, lon: 7.67, hoehe: 1915, von: '2026-11-28', bis: '2026-11-29' }))
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast')
    expect(url.searchParams.get('latitude')).toBe('46.49')
    expect(url.searchParams.get('longitude')).toBe('7.67')
    expect(url.searchParams.get('elevation')).toBe('1915')
    expect(url.searchParams.get('daily')).toBe('temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max')
    expect(url.searchParams.get('timezone')).toBe('Europe/Berlin')
    expect(url.searchParams.get('start_date')).toBe('2026-11-28')
    expect(url.searchParams.get('end_date')).toBe('2026-11-29')
  })
  it('lässt die Höhe weg, wenn sie fehlt', () => {
    expect(new URL(openMeteoUrl({ lat: 1, lon: 2, von: '2026-11-28', bis: '2026-11-28' })).searchParams.has('elevation')).toBe(false)
  })
})

describe('wetterAusOpenMeteo', () => {
  const antwort = {
    elevation: 1915,
    daily: {
      time: ['2026-11-28', '2026-11-29'],
      temperature_2m_max: [0.6, -4.1],
      temperature_2m_min: [-11.9, -12.3],
      precipitation_sum: [6.6, 0],
      weather_code: [85, 0],
      wind_speed_10m_max: [5.0, 31.4],
    },
  }
  it('macht aus den Spalten Tage und filtert auf die gewünschten Daten', () => {
    expect(wetterAusOpenMeteo(antwort, ['2026-11-29'])).toEqual([
      { datum: '2026-11-29', tMax: -4.1, tMin: -12.3, niederschlagMm: 0, code: 0, windKmh: 31.4 },
    ])
  })
  it('übergeht Tage mit fehlenden Werten und kaputte Antworten', () => {
    expect(wetterAusOpenMeteo({ daily: { ...antwort.daily, weather_code: [null, 0] } }, ['2026-11-28', '2026-11-29']).map((t) => t.datum))
      .toEqual(['2026-11-29'])
    expect(wetterAusOpenMeteo({ fehler: true }, ['2026-11-28'])).toEqual([])
    expect(wetterAusOpenMeteo(null, ['2026-11-28'])).toEqual([])
  })
})

describe('wetterKurz', () => {
  it('rundet Temperaturen und nennt Niederschlag und Wind', () => {
    expect(wetterKurz({ datum: '2026-11-28', tMax: 0.6, tMin: -11.9, niederschlagMm: 6.6, code: 85, windKmh: 5 }))
      .toBe('−12 bis 1 °C · 6,6 mm · Wind bis 5 km/h')
  })
  it('schreibt "trocken" ohne Niederschlag', () => {
    expect(wetterKurz({ datum: '2026-11-28', tMax: 8.4, tMin: 2.2, niederschlagMm: 0, code: 0, windKmh: 12.6 }))
      .toBe('2 bis 8 °C · trocken · Wind bis 13 km/h')
  })
})
