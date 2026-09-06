import type { Land } from '@/lib/content/schema'

export function fahrplanLink(land: Land, von: string, nach: string, datum: string): string {
  if (land === 'CH') {
    const q = new URLSearchParams({ von, nach, datum, zeit: '06:00' })
    return `https://www.sbb.ch/de?${q.toString()}`
  }
  const q = new URLSearchParams({ sts: 'true', so: von, zo: nach, hd: `${datum}T06:00:00` })
  return `https://www.bahn.de/buchung/fahrplan/suche#${q.toString().replace(/\+/g, '%20')}`
}

export function fehlerMeldenLink(seitentitel: string, adresse: string | undefined): string {
  const betreff = `Fehler: ${seitentitel}`
  if (adresse) return `mailto:${adresse}?subject=${encodeURIComponent(betreff)}`
  return `https://github.com/Maxlemoar/dav-oepnv-touren/issues/new?title=${encodeURIComponent(betreff)}`
}
