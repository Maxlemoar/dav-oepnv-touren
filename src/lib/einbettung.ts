import type { SammlungEmbed, TourEmbed } from './content/schema'

const ALPENVEREINAKTIV = 'https://www.alpenvereinaktiv.com/de'

/**
 * iframe-URL für eine einzelne Tour. Alpenvereinaktiv liefert `embed.html` ohne X-Frame-Options
 * (siehe docs/research/touren-einbettung.md); ohne slug leitet der Server auf den richtigen Pfad um.
 */
export function tourEmbedUrl(embed: TourEmbed): string {
  if (embed.anbieter === 'komoot') return `https://www.komoot.com/de-de/tour/${embed.id}/embed?profile=1`
  return `${ALPENVEREINAKTIV}/tour/${embed.slug ?? 'tour'}/${embed.id}/embed.html?flexView=false`
}

/** iframe-URL für eine Alpenvereinaktiv-Sammlung (Liste mit Karte). */
export function sammlungEmbedUrl(s: SammlungEmbed): string {
  return `${ALPENVEREINAKTIV}/liste/${s.slug}/${s.id}/embed.html?flexView=false`
}

/** Link zur normalen (nicht eingebetteten) Seite, für "Bei Alpenvereinaktiv öffnen". */
export function embedSeitenUrl(embed: TourEmbed): string {
  if (embed.anbieter === 'komoot') return `https://www.komoot.com/de-de/tour/${embed.id}`
  return `${ALPENVEREINAKTIV}/tour/${embed.slug ?? 'tour'}/${embed.id}/`
}

export function sammlungSeitenUrl(s: SammlungEmbed): string {
  return `${ALPENVEREINAKTIV}/liste/${s.slug}/${s.id}/`
}

export const EMBED_ANBIETER_LABEL = { alpenvereinaktiv: 'Alpenvereinaktiv', komoot: 'komoot' } as const
