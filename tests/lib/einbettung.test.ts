import { describe, it, expect } from 'vitest'
import { tourEmbedUrl, sammlungEmbedUrl } from '@/lib/einbettung'

describe('tourEmbedUrl', () => {
  it('baut die Alpenvereinaktiv-URL mit slug', () => {
    expect(tourEmbedUrl({ anbieter: 'alpenvereinaktiv', id: '50994062', slug: 'kandersteg-ryharts-allmenalp' }))
      .toBe('https://www.alpenvereinaktiv.com/de/tour/kandersteg-ryharts-allmenalp/50994062/embed.html?flexView=false')
  })
  it('fällt ohne slug auf "tour" zurück', () => {
    expect(tourEmbedUrl({ anbieter: 'alpenvereinaktiv', id: '50994062' }))
      .toBe('https://www.alpenvereinaktiv.com/de/tour/tour/50994062/embed.html?flexView=false')
  })
  it('baut die komoot-URL', () => {
    expect(tourEmbedUrl({ anbieter: 'komoot', id: '384495679' })).toBe('https://www.komoot.com/de-de/tour/384495679/embed?profile=1')
  })
})

describe('sammlungEmbedUrl', () => {
  it('baut die Sammlungs-URL', () => {
    expect(sammlungEmbedUrl({ id: '202105012', slug: 'nur-mit-oeffis' }))
      .toBe('https://www.alpenvereinaktiv.com/de/liste/nur-mit-oeffis/202105012/embed.html?flexView=false')
  })
})
