import { describe, it, expect } from 'vitest'
import { ticketFuer } from '@/lib/verbindung/regeln'
import type { TicketTabelle } from '@/lib/content/schema'

const tabelle: TicketTabelle = {
  regeln: [
    { land: 'DE', ticket: 'deutschlandticket', hinweis: 'Nah' },
    { land: 'CH', ticket: 'halbtax', hinweis: 'CH' },
    { land: 'FR', ticket: 'europass', hinweis: 'FR' },
    { land: 'AT', ticket: 'keins', hinweis: 'AT' },
  ],
  fernverkehrHinweis: 'Fern',
}

describe('ticketFuer', () => {
  it('DE ohne Fernverkehr: Deutschlandticket', () => {
    expect(ticketFuer('DE', false, tabelle)).toEqual({ ticket: 'deutschlandticket', hinweis: 'Nah' })
  })
  it('DE mit Fernverkehr: keins mit Fernverkehrshinweis', () => {
    expect(ticketFuer('DE', true, tabelle)).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })
  it('CH mit Fernverkehr bleibt Halbtax', () => {
    expect(ticketFuer('CH', true, tabelle)).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })
})
