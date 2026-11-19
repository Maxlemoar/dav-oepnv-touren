import { describe, it, expect } from 'vitest'
import { einladungsText, einladungsUrl, gruppenHinweisFuer } from '@/lib/teilen'

const basis = {
  startort: 'Offenburg',
  ziel: 'Kandersteg',
  datum: '2026-11-28',
  ab: '2026-11-28T05:30:00Z', // 06:30 lokal
  an: '2026-11-28T09:40:00Z', // 10:40 lokal
  url: 'https://example.org/gebiet/kandersteg?datum=2026-11-28',
}

describe('einladungsText', () => {
  it('nennt Hinfahrt, Rückfahrt am Folgetag und den Link', () => {
    const text = einladungsText({ ...basis, rueckDatum: '2026-11-29', rueckAb: '2026-11-29T17:14:00Z' })
    expect(text).toBe(
      'Ich fahre Sa 28.11. um 06:30 ab Offenburg nach Kandersteg (an 10:40), zurück So 29.11. um 18:14. Kommst du mit?\n'
      + 'https://example.org/gebiet/kandersteg?datum=2026-11-28',
    )
  })
  it('lässt bei Tagestouren das Datum der Rückfahrt weg', () => {
    const text = einladungsText({ ...basis, rueckDatum: '2026-11-28', rueckAb: '2026-11-28T17:14:00Z' })
    expect(text).toContain('(an 10:40), zurück um 18:14. Kommst du mit?')
  })
  it('kommt ohne Rückfahrt aus', () => {
    expect(einladungsText(basis)).toContain('(an 10:40). Kommst du mit?')
  })
  it('nennt die Hütte als eigentliches Ziel', () => {
    const text = einladungsText({ ...basis, huette: 'Doldenhornhütte' })
    expect(text).toContain('nach Kandersteg (an 10:40) und weiter zur Doldenhornhütte.')
  })
  it('hängt den Gruppenhinweis vor dem Link an', () => {
    const text = einladungsText({ ...basis, gruppenHinweis: 'Ab 6 Personen gibt es Gruppenpreise.' })
    expect(text).toBe(
      'Ich fahre Sa 28.11. um 06:30 ab Offenburg nach Kandersteg (an 10:40). Kommst du mit?\n'
      + 'Zu mehreren: Ab 6 Personen gibt es Gruppenpreise.\n'
      + 'https://example.org/gebiet/kandersteg?datum=2026-11-28',
    )
  })
})

describe('einladungsUrl', () => {
  it('trägt das Datum immer und die Rückfahrt nur, wenn sie abweicht', () => {
    expect(einladungsUrl('https://example.org', '/gebiet/kandersteg', '2026-11-28', '2026-11-28'))
      .toBe('https://example.org/gebiet/kandersteg?datum=2026-11-28')
    expect(einladungsUrl('https://example.org', '/huette/doldenhornhuette', '2026-11-28', '2026-11-29'))
      .toBe('https://example.org/huette/doldenhornhuette?datum=2026-11-28&rueck=2026-11-29')
  })
})

describe('gruppenHinweisFuer', () => {
  const tabelle = {
    fernverkehrHinweis: 'x',
    regeln: [
      { land: 'CH' as const, ticket: 'halbtax' as const, hinweis: 'h', gruppenHinweis: 'Ab 10 Personen 30 %.', gruppenQuelle: 'https://www.sbb.ch/' },
      { land: 'FR' as const, ticket: 'europass' as const, hinweis: 'h' },
    ],
  }
  it('liefert Hinweis und Quelle des Landes', () => {
    expect(gruppenHinweisFuer(tabelle, 'CH')).toEqual({ hinweis: 'Ab 10 Personen 30 %.', quelle: 'https://www.sbb.ch/' })
  })
  it('liefert nichts ohne Gruppenhinweis oder Regel', () => {
    expect(gruppenHinweisFuer(tabelle, 'FR')).toBeUndefined()
    expect(gruppenHinweisFuer(tabelle, 'AT')).toBeUndefined()
  })
})
