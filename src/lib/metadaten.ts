import type { Metadata, MetadataRoute } from 'next'
import { BETREIBER_LABEL, type Gebiet, type Haltestelle, type Huette } from './content/schema'
import type { Inhalt } from './content/laden'
import { minutenAlsDauer } from './datum'

export const STANDARD_BASIS_URL = 'https://dav-oepnv-touren.vercel.app'
export const SEITENNAME = 'Ohne Auto in die Berge'
export const SEITENBESCHREIBUNG =
  'Ausgangsorte für Touren ab Offenburg mit Bahn und Bus, passend zu deinem Zeitfenster. Mit Live-Verbindung für dein Datum.'

/** Basis-URL ohne abschließenden Schrägstrich; leere oder ungültige Werte fallen auf den Standard zurück. */
export function basisUrl(wert: string | undefined): string {
  const roh = wert?.trim()
  if (!roh) return STANDARD_BASIS_URL
  try {
    const u = new URL(roh)
    return `${u.origin}${u.pathname}`.replace(/\/+$/, '')
  } catch {
    return STANDARD_BASIS_URL
  }
}

export const BASIS_URL = basisUrl(process.env.NEXT_PUBLIC_BASIS_URL)

export function absoluteUrl(pfad: string, basis: string = BASIS_URL): string {
  return `${basis}${pfad.startsWith('/') ? pfad : `/${pfad}`}`
}

/** Seitenweites Vorschaubild aus `app/opengraph-image.tsx`; Seiten mit eigenem `openGraph` müssen es selbst angeben. */
export const OG_BILD = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'In die Berge, ohne Auto. Ausgangsorte für Touren ab Offenburg mit Bahn und Bus',
} as const

const ABKUERZUNGEN = new Set(['ca', 'bzw', 'z', 'b', 'u', 'a', 'v', 'st', 'nr', 'inkl', 'evtl', 'ggf', 'std', 'min', 'max', 'mind', 'bspw', 'usw', 'etc', 'hl', 'dt', 'ev'])

/** Erster Satz eines Textes; Abkürzungen wie "St." oder "ca." und Ordnungszahlen beenden keinen Satz. */
export function ersterSatz(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ')
  const muster = /[.!?](?=\s+["„(]?[A-ZÄÖÜ0-9])/g
  for (const m of t.matchAll(muster)) {
    const vorher = t.slice(0, m.index)
    const wort = /([\p{L}\d]+)$/u.exec(vorher)?.[1] ?? ''
    if (m[0] === '.' && (ABKUERZUNGEN.has(wort.toLowerCase()) || wort.length === 1 || /^\d+$/.test(wort))) continue
    return t.slice(0, m.index + 1)
  }
  return t
}

function mitPunkt(s: string): string {
  return /[.!?]$/.test(s) ? s : `${s}.`
}

/** "Erster Satz. Ab Offenburg mit Bahn und Bus, ca. 4:10 h." */
export function gebietBeschreibung(gebiet: Pick<Gebiet, 'beschreibung'>, startortName: string, fahrzeitMin?: number): string {
  const anreise = `Ab ${startortName} mit Bahn und Bus${fahrzeitMin ? `, ca. ${minutenAlsDauer(fahrzeitMin)}` : ''}.`
  return `${mitPunkt(ersterSatz(gebiet.beschreibung))} ${anreise}`
}

export function betreiberText(b: Huette['betreiber']): string {
  return `${BETREIBER_LABEL[b.typ]}${b.sektion ? ` ${b.sektion}` : ''}`
}

/** "Doldenhornhütte (1915 m), SAC Emmental, Zustieg ca. 2:30 h ab Kandersteg, ab Offenburg mit Bahn und Bus." */
export function huetteBeschreibung(
  huette: Pick<Huette, 'name' | 'hoehe' | 'betreiber' | 'geschaetzt'>,
  zustieg: { haltestelle: string; gehzeitMin: number; bergbahn?: boolean } | undefined,
  startortName: string,
): string {
  const teile = [`${huette.name} (${huette.hoehe} m)`, betreiberText(huette.betreiber)]
  if (zustieg) {
    const dauer = `${huette.geschaetzt ? 'ca. ' : ''}${minutenAlsDauer(zustieg.gehzeitMin)}`
    teile.push(`Zustieg ${dauer}${zustieg.bergbahn ? ' mit Bergbahn' : ''} ab ${zustieg.haltestelle}`)
  }
  teile.push(`ab ${startortName} mit Bahn und Bus`)
  return `${teile.join(', ')}.`
}

function startort(i: Pick<Inhalt, 'startorte'>) {
  return i.startorte.find((s) => s.sichtbar) ?? i.startorte[0]
}

/** Beschreibung eines Gebiets aus dem Inhalt; Fahrzeit wie auf der Karte aus dem Richtwert der ersten Haltestelle. */
export function gebietBeschreibungFuer(i: Pick<Inhalt, 'startorte' | 'haltestellen'>, gebiet: Pick<Gebiet, 'beschreibung' | 'haltestellen'>): string {
  const s = startort(i)
  const h = i.haltestellen.find((x) => x.id === gebiet.haltestellen[0])
  return gebietBeschreibung(gebiet, s?.name ?? 'Offenburg', s ? h?.richtwerte[s.id]?.fahrzeitMin : undefined)
}

/** Beschreibung einer Hütte aus dem Inhalt; Zustieg ist der erste eingetragene. */
export function huetteBeschreibungFuer(
  i: Pick<Inhalt, 'startorte' | 'haltestellen'>,
  huette: Pick<Huette, 'name' | 'hoehe' | 'betreiber' | 'geschaetzt' | 'zustiege'>,
): string {
  const z = huette.zustiege[0]
  const h = z && i.haltestellen.find((x) => x.id === z.haltestelleId)
  const zustieg = z && h ? { haltestelle: h.name, gehzeitMin: z.gehzeitMin, bergbahn: z.bergbahn } : undefined
  return huetteBeschreibung(huette, zustieg, startort(i)?.name ?? 'Offenburg')
}

/** Metadaten einer Unterseite mit Beschreibung, Canonical, Open Graph und Twitter. */
export function seitenMetadaten({ titel, beschreibung, pfad }: { titel: string; beschreibung: string; pfad: string }): Metadata {
  return {
    title: titel,
    description: beschreibung,
    alternates: { canonical: pfad },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      siteName: SEITENNAME,
      title: titel,
      description: beschreibung,
      url: pfad,
      images: [OG_BILD],
    },
    twitter: { card: 'summary_large_image', title: titel, description: beschreibung, images: [OG_BILD] },
  }
}

type JsonLd = Record<string, unknown>

export function gebietJsonLd(gebiet: Pick<Gebiet, 'id' | 'name' | 'lat' | 'lon'>, beschreibung: string, basis: string = BASIS_URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: gebiet.name,
    description: beschreibung,
    url: absoluteUrl(`/gebiet/${gebiet.id}`, basis),
    geo: { '@type': 'GeoCoordinates', latitude: gebiet.lat, longitude: gebiet.lon },
  }
}

export function huetteJsonLd(
  huette: Pick<Huette, 'id' | 'name' | 'lat' | 'lon' | 'hoehe' | 'webUrl'>,
  beschreibung: string,
  basis: string = BASIS_URL,
): JsonLd {
  const seite = absoluteUrl(`/huette/${huette.id}`, basis)
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: huette.name,
    description: beschreibung,
    url: huette.webUrl ?? seite,
    mainEntityOfPage: seite,
    geo: { '@type': 'GeoCoordinates', latitude: huette.lat, longitude: huette.lon, elevation: huette.hoehe },
    additionalProperty: [{ '@type': 'PropertyValue', name: 'Höhe', value: huette.hoehe, unitCode: 'MTR', unitText: 'm' }],
  }
}

/** JSON für `<script type="application/ld+json">`; "<" wird maskiert, damit kein Text das Skript beenden kann. */
export function jsonLdText(daten: JsonLd): string {
  return JSON.stringify(daten).replace(/</g, '\\u003c')
}

/** Jüngstes `berechnetAm` aller Richtwerte (JJJJ-MM-TT) oder undefined, wenn es keine gibt. */
export function juengsterRichtwert(haltestellen: Pick<Haltestelle, 'richtwerte'>[]): string | undefined {
  let juengster: string | undefined
  for (const h of haltestellen) {
    for (const r of Object.values(h.richtwerte)) {
      if (!juengster || r.berechnetAm > juengster) juengster = r.berechnetAm
    }
  }
  return juengster
}

/** "2026-09-07" → "07.09.2026" */
export function datumTTMMJJJJ(datum: string): string {
  const [j, m, t] = datum.split('-')
  return `${t}.${m}.${j}`
}

/** Feste Seiten plus alle Gebiete und Hütten. */
export function sitemapEintraege(
  inhalt: { gebiete: Pick<Gebiet, 'id'>[]; huetten: Pick<Huette, 'id'>[] },
  basis: string = BASIS_URL,
): MetadataRoute.Sitemap {
  const fest: { pfad: string; prioritaet: number }[] = [
    { pfad: '/', prioritaet: 1 },
    { pfad: '/sektionstouren', prioritaet: 0.6 },
    { pfad: '/ueber', prioritaet: 0.4 },
    { pfad: '/impressum', prioritaet: 0.1 },
    { pfad: '/datenschutz', prioritaet: 0.1 },
  ]
  return [
    ...fest.map(({ pfad, prioritaet }) => ({ url: absoluteUrl(pfad, basis), priority: prioritaet })),
    ...inhalt.gebiete.map((g) => ({ url: absoluteUrl(`/gebiet/${g.id}`, basis), priority: 0.8 })),
    ...inhalt.huetten.map((h) => ({ url: absoluteUrl(`/huette/${h.id}`, basis), priority: 0.7 })),
  ]
}
