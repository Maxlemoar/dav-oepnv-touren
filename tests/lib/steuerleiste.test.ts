import { describe, it, expect } from 'vitest'
import { ansichtAus, STANDARD_ANSICHT } from '@/lib/steuerleiste'

describe('ansichtAus', () => {
  it('nimmt ohne Angabe die Karte', () => {
    expect(ansichtAus(null, null)).toBe('karte')
    expect(STANDARD_ANSICHT).toBe('karte')
  })
  it('bevorzugt die URL vor der gemerkten Wahl', () => {
    expect(ansichtAus('liste', 'karte')).toBe('liste')
    expect(ansichtAus('karte', 'liste')).toBe('karte')
  })
  it('nutzt die gemerkte Wahl, wenn die URL nichts sagt', () => {
    expect(ansichtAus(null, 'liste')).toBe('liste')
  })
  it('ignoriert unbekannte Werte', () => {
    expect(ansichtAus('galerie', 'unsinn')).toBe('karte')
    expect(ansichtAus('galerie', 'liste')).toBe('liste')
  })
})
