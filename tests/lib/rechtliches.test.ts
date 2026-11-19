import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { ladeRechtliches, pruefeRechtliches } from '@/lib/rechtliches'

const verein = {
  art: 'verein',
  name: 'Beispielverein e. V.',
  anschrift: ['Weg 1', '00000 Ort'],
  email: 'kontakt@example.org',
  vertretungsberechtigt: ['A B (Vorsitz)'],
  registergericht: 'Amtsgericht Ort',
  registernummer: 'VR 1',
}

describe('rechtliches', () => {
  it('liest die echte Datei', () => {
    const r = ladeRechtliches()
    expect(r.projekt).toBe('Ein Projekt des Arbeitskreises Klimaschutz der DAV Sektion Offenburg')
  })
  it('leere Felder in YAML werden zu undefined', () => {
    const r = pruefeRechtliches(parse('verantwortlich:\nprojekt: P\nkontaktEmail:\n'))
    expect(r.verantwortlich).toBeUndefined()
    expect(r.kontaktEmail).toBeUndefined()
    expect(pruefeRechtliches({ verantwortlich: '', projekt: 'P', kontaktEmail: '' }).kontaktEmail).toBeUndefined()
  })
  it('nimmt vollständige Angaben eines Vereins an', () => {
    const r = pruefeRechtliches({ verantwortlich: verein, projekt: 'P', kontaktEmail: 'ak@example.org' })
    expect(r.verantwortlich?.name).toBe('Beispielverein e. V.')
    expect(r.kontaktEmail).toBe('ak@example.org')
  })
  it('lehnt halbe Angaben ab', () => {
    expect(() => pruefeRechtliches({ verantwortlich: { ...verein, anschrift: [] }, projekt: 'P' })).toThrow(/anschrift/)
    expect(() => pruefeRechtliches({ verantwortlich: { ...verein, vertretungsberechtigt: undefined }, projekt: 'P' })).toThrow(/vertretungsberechtigt/)
    expect(() => pruefeRechtliches({ verantwortlich: { ...verein, registernummer: undefined }, projekt: 'P' })).toThrow(/Registergericht/)
    expect(() => pruefeRechtliches({ verantwortlich: { ...verein, email: 'keine' }, projekt: 'P' })).toThrow(/email/)
    expect(() => pruefeRechtliches({ verantwortlich: { name: 'Nur Name' }, projekt: 'P' })).toThrow()
  })
  it('eine Person braucht keine Vertretung', () => {
    const person = { art: 'person', name: 'A B', anschrift: ['Weg 1', '00000 Ort'], email: 'a@example.org' }
    expect(pruefeRechtliches({ verantwortlich: person, projekt: 'P' }).verantwortlich?.art).toBe('person')
  })
})
