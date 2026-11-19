import type { MetadataRoute } from 'next'
import { inhalt } from '@/lib/content/laden'
import { sitemapEintraege } from '@/lib/metadaten'

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEintraege(inhalt())
}
