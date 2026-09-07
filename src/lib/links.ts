import type { BahnOrt, Land } from '@/lib/content/schema'

export type FahrplanOrt = { name: string; bahn?: BahnOrt }

export type FahrplanAnfrage = {
  /** Land des Ziels: CH → SBB, sonst bahn.de. */
  land: Land
  von: FahrplanOrt
  nach: FahrplanOrt
  /** YYYY-MM-DD */
  datum: string
  /** HH:MM, lokale Zeit; Standard 06:00 */
  zeitLokal?: string
}

/** Orts-ID im Format der bahn.de-Buchungsstrecke (wird als Parameter `soid`/`zoid` erwartet). */
function bahnOrtId(o: BahnOrt): string {
  const p = Math.floor(Date.now() / 1000)
  return `A=1@O=${o.name}@X=${o.x}@Y=${o.y}@U=80@L=${o.extId}@B=1@p=${p}@`
}

function fragment(paare: [string, string][]): string {
  return paare.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
}

export function fahrplanLink({ land, von, nach, datum, zeitLokal = '06:00' }: FahrplanAnfrage): string {
  if (land === 'CH') {
    const q = new URLSearchParams({ von: von.name, nach: nach.name, datum, zeit: zeitLokal })
    return `https://www.sbb.ch/de?${q.toString()}`
  }
  const hd = `${datum}T${zeitLokal}:00`
  if (von.bahn && nach.bahn) {
    // Ohne soid/zoid meldet bahn.de "Reise nicht gefunden"; die übrigen Parameter entsprechen einer manuellen Suche.
    const q = fragment([
      ['sts', 'true'], ['so', von.bahn.name], ['zo', nach.bahn.name], ['kl', '2'], ['r', '13:16:KLASSENLOS:1'],
      ['soid', bahnOrtId(von.bahn)], ['zoid', bahnOrtId(nach.bahn)], ['sot', 'ST'], ['zot', 'ST'],
      ['soei', von.bahn.extId], ['zoei', nach.bahn.extId], ['hd', hd], ['hza', 'D'], ['ar', 'false'],
      ['s', 'true'], ['d', 'false'], ['hz', '[]'], ['fm', 'false'], ['bp', 'false'],
    ])
    return `https://www.bahn.de/buchung/fahrplan/suche#${q}`
  }
  return `https://www.bahn.de/buchung/fahrplan/suche#${fragment([['sts', 'true'], ['so', von.name], ['zo', nach.name], ['hd', hd]])}`
}

/** Gleiche Suche in Gegenrichtung; Standardzeit 15:00 am Rückfahrtdatum. */
export function rueckfahrtLink({ land, von, nach, datum, zeitLokal = '15:00' }: FahrplanAnfrage): string {
  return fahrplanLink({ land, von: nach, nach: von, datum, zeitLokal })
}

export function fehlerMeldenLink(seitentitel: string, adresse: string | undefined): string {
  const betreff = `Fehler: ${seitentitel}`
  if (adresse) return `mailto:${adresse}?subject=${encodeURIComponent(betreff)}`
  return `https://github.com/Maxlemoar/dav-oepnv-touren/issues/new?title=${encodeURIComponent(betreff)}`
}
