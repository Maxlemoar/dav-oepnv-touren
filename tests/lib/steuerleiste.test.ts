import { describe, it, expect } from 'vitest'
import { ansichtAus, STANDARD_ANSICHT } from '@/lib/steuerleiste'

describe('ansichtAus', () => {
  it('nimmt ohne Angabe die Liste: dort steht das Zeitfenster (zuerst "wann")', () => {
    expect(ansichtAus(null, null)).toBe('liste')
    expect(STANDARD_ANSICHT).toBe('liste')
  })
  it('bevorzugt die URL vor der gemerkten Wahl', () => {
    expect(ansichtAus('liste', 'karte')).toBe('liste')
    expect(ansichtAus('karte', 'liste')).toBe('karte')
  })
  it('nutzt die gemerkte Wahl, wenn die URL nichts sagt', () => {
    expect(ansichtAus(null, 'liste')).toBe('liste')
    expect(ansichtAus(null, 'karte')).toBe('karte')
  })
  it('ignoriert unbekannte Werte', () => {
    expect(ansichtAus('galerie', 'unsinn')).toBe('liste')
    expect(ansichtAus('galerie', 'karte')).toBe('karte')
  })
  it('zeigt ohne gewähltes Datum die Liste mit dem Zeitfenster, auch wenn die Karte gemerkt ist', () => {
    expect(ansichtAus(null, 'karte', { datumGewaehlt: false })).toBe('liste')
    expect(ansichtAus('unsinn', 'karte', { datumGewaehlt: false })).toBe('liste')
    expect(ansichtAus(null, 'karte', { datumGewaehlt: true })).toBe('karte')
  })
  it('folgt ohne Datum einem ausdrücklichen Antippen von "Karte" (ansicht=karte in der URL)', () => {
    expect(ansichtAus('karte', null, { datumGewaehlt: false })).toBe('karte')
  })
})
