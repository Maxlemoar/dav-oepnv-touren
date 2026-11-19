/**
 * Ordnet eine Sektionstour einem Gebiet aus unseren Inhalten zu, über Namen in Titel, Untertitel,
 * Beschreibung und Treffpunkt. Rein und ohne Datei- oder Netzzugriff.
 *
 * Gewichtung: Hüttenname > Gebietsname und markante Begriffe > Haltestellenname > Region,
 * jeweils mal Feld: Titel > Untertitel > Beschreibung > Treffpunkt (Treffpunkte sind oft Parkplätze).
 */
import type { Gebiet, Haltestelle, Huette } from '@/lib/content/schema'
import { bedientAm } from '@/lib/saison'

export type ZuordnungsInhalt = { gebiete: Gebiet[]; huetten: Huette[]; haltestellen: Haltestelle[] }

export type TourText = { titel: string; untertitel?: string; beschreibung?: string; treffpunkt?: string }

export type Zuordnung = {
  gebietId: string
  huetteId?: string
  /** Haltestelle, über die die Tour sinnvoll beginnt (Hauptzugang). */
  haltestelleId: string
  grund: string
  sicherheit: 'hoch' | 'mittel'
}

type Typ = 'huette' | 'gebiet' | 'begriff' | 'haltestelle' | 'region'
type Feld = 'titel' | 'untertitel' | 'beschreibung' | 'treffpunkt'

const TYP_GEWICHT: Record<Typ, number> = { huette: 10, gebiet: 6, begriff: 6, haltestelle: 4, region: 2 }
const FELD_GEWICHT: Record<Feld, number> = { titel: 1, untertitel: 0.8, beschreibung: 0.6, treffpunkt: 0.4 }
const FELD_TEXT: Record<Feld, string> = { titel: 'im Titel', untertitel: 'im Untertitel', beschreibung: 'in der Beschreibung', treffpunkt: 'im Treffpunkt' }
const TYP_TEXT: Record<Typ, string> = { huette: 'Hütte', gebiet: 'Gebiet', begriff: 'Ort', haltestelle: 'Haltestelle', region: 'Region' }
/** Unter dieser Punktzahl keine Zuordnung; ein Gebietsname nur im Treffpunkt (oft ein Parkplatz) reicht nicht. */
const MINDESTPUNKTE = 2.5

/**
 * Orte, Gipfel und Täler, die in unseren Namen nicht vorkommen, aber eindeutig zu einem Gebiet gehören.
 * Schreibvarianten aus dem Sektionsprogramm stehen mit drin.
 */
export const MARKANTE_BEGRIFFE: { begriff: string; gebietId: string; huetteId?: string; haltestelleId?: string }[] = [
  { begriff: 'Susten', gebietId: 'grimsel-haslital', haltestelleId: 'steingletscher' },
  { begriff: 'Sustenhorn', gebietId: 'grimsel-haslital', haltestelleId: 'steingletscher' },
  { begriff: 'Fünffingerstock', gebietId: 'grimsel-haslital', haltestelleId: 'steingletscher' },
  { begriff: 'Pfriendler', gebietId: 'grimsel-haslital', haltestelleId: 'steingletscher' },
  { begriff: 'Gelmersee', gebietId: 'grimsel-haslital', haltestelleId: 'handegg' },
  { begriff: 'Oberaar', gebietId: 'grimsel-haslital', haltestelleId: 'grimsel-hospiz' },
  { begriff: 'Gasterntal', gebietId: 'kandersteg' },
  { begriff: 'Gasteretal', gebietId: 'kandersteg' },
  { begriff: 'Mutthornhütte', gebietId: 'kandersteg' },
  { begriff: 'Oeschinensee', gebietId: 'kandersteg' },
  { begriff: 'Haslach', gebietId: 'kinzigtal', haltestelleId: 'hausach' },
  { begriff: 'Wolfach', gebietId: 'kinzigtal', haltestelleId: 'hausach' },
  { begriff: 'Gutach', gebietId: 'kinzigtal', haltestelleId: 'hausach' },
  { begriff: 'Schiltach', gebietId: 'kinzigtal', haltestelleId: 'hausach' },
  { begriff: 'Oberkirch', gebietId: 'renchtal-kniebis', haltestelleId: 'bad-griesbach' },
  { begriff: 'Oppenau', gebietId: 'renchtal-kniebis', haltestelleId: 'bad-griesbach' },
  { begriff: 'Bad Peterstal', gebietId: 'renchtal-kniebis', haltestelleId: 'bad-griesbach' },
  { begriff: 'Renchtal', gebietId: 'renchtal-kniebis', haltestelleId: 'bad-griesbach' },
  { begriff: 'Mummelsee', gebietId: 'schwarzwaldhochstrasse' },
  { begriff: 'Ruhestein', gebietId: 'schwarzwaldhochstrasse' },
  { begriff: 'Hornisgrinde', gebietId: 'schwarzwaldhochstrasse' },
  { begriff: 'Schliffkopf', gebietId: 'schwarzwaldhochstrasse' },
  { begriff: 'Harmersbach', gebietId: 'nordrach' },
  { begriff: 'Unterharmersbach', gebietId: 'nordrach' },
  { begriff: 'Clariden', gebietId: 'linthal' },
  { begriff: 'Bifertenstock', gebietId: 'linthal' },
  { begriff: 'Galenstock', gebietId: 'andermatt-furka', haltestelleId: 'tiefenbach' },
  { begriff: 'Gemsstock', gebietId: 'andermatt-furka', haltestelleId: 'andermatt' },
  { begriff: 'Spannort', gebietId: 'engelberg' },
  { begriff: 'Engstligenalp', gebietId: 'adelboden' },
  { begriff: 'Almagell', gebietId: 'saastal', haltestelleId: 'saas-almagell' },
  { begriff: 'Weissmies', gebietId: 'saastal' },
  { begriff: 'Weismies', gebietId: 'saastal' },
  { begriff: 'Allalinhorn', gebietId: 'saastal', haltestelleId: 'saas-fee' },
  { begriff: 'Gspaltenhorn', gebietId: 'kiental-griesalp' },
  { begriff: 'Hockenhorn', gebietId: 'loetschental' },
  { begriff: 'Wildhorn', gebietId: 'lenk', huetteId: 'wildhornhuette' },
  { begriff: 'Piz Buin', gebietId: 'silvretta' },
  { begriff: 'Aletschhorn', gebietId: 'aletsch-goms' },
]

/** Wörter, die allein nichts über das Ziel sagen; aus Namen werden sie nicht als Begriff übernommen. */
const ALLGEMEIN = new Set([
  'und', 'oder', 'am', 'im', 'ab', 'bei', 'an', 'auf', 'der', 'die', 'das', 'den', 'dem', 'des', 'zum', 'zur', 'von', 'vom', 'ob',
  'le', 'la', 'les', 'du', 'de', 'des', 'grand', 'haut', 'noir', 'hohe', 'hoher', 'bad', 'st', 'sankt',
  'zug', 'van', 'wald', 'tal', 'see', 'alpen', 'oberland', 'jura', 'schwarzwald', 'vogesen', 'nordvogesen', 'sudvogesen',
  'pfalzerwald', 'allgau', 'uri', 'wallis', 'tessin', 'graubunden', 'glarus', 'zentralschweiz', 'vorarlberg', 'tirol',
  'baden', 'bern', 'luzern', 'schwyz', 'neuenburger', 'baselbieter', 'solothurner', 'berner', 'freiburger', 'glarner',
  'offenburg', 'ortenau', 'kletterhalle', 'hutte', 'haus', 'zell', 'freiburg',
])

const BLEIBENDER_VORSATZ = new Set(['st', 'sankt', 'bad'])

/** Teile von Haltestellennamen, die keinen Ort benennen. */
const HALTESTELLEN_ZUSATZ = new Set([
  'bahnhof', 'hauptbahnhof', 'hbf', 'busbahnhof', 'busterminal', 'post', 'dorf', 'dorfplatz', 'zentrum', 'talstation',
  'bergstation', 'seilbahn', 'bus', 'hotel', 'kurhaus', 'village', 'ort', 'schule', 'abzw',
])

/** Vorsätze von Hüttennamen, ohne die der Name noch eindeutig ist (Capanna Corno Gries → Corno Gries). */
const HUETTEN_VORSATZ = new Set(['berggasthaus', 'capanna', 'cabane', 'refuge', 'chalet', 'gruppenhaus', 'wanderheim', 'clubhaus'])

/** Endungen, mit denen ein Name in einem Wort weiterlebt: Sustenpass, Feldberggebiet, Haslacher. */
const ENDUNGEN = ['', 'er', 'ern', 'ers', 's', 'pass', 'gebiet', 'tal', 'massiv', 'region', 'gipfel', 'grat', 'hutte', 'steig', 'weg', 'horn', 'gletscher', 'runde']

/** Kleinbuchstaben ohne Akzente; Umlaute und ihre Umschreibung fallen zusammen (Lämmeren = Laemmeren = Lammeren). */
export function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    // "Wiwanni-Hütte", "Corno Gries Hütte" → ein Wort wie "Gelmerhütte"
    .replace(/[\s-]+hutte\b/g, 'hutte')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const woerter = (s: string): string[] => normalisiere(s).split(' ').filter(Boolean)

type Begriff = {
  woerter: string[]
  typ: Typ
  anzeige: string
  gebietId: string
  huetteId?: string
  haltestelleId?: string
  /** Nur gleiche Schreibweise bis auf zwei ausgelassene Buchstaben (Lämmerhütte → Lämmerenhütte). */
  unscharf?: boolean
}

export type ZuordnungsIndex = { begriffe: Begriff[]; inhalt: ZuordnungsInhalt }

/** Zerlegt "Grimsel, Trift und Susten" oder "Kandel ab Waldkirch" in einzelne Namen. */
function namensteile(name: string): string[] {
  return name.split(/\s*(?:[,/():;]|\s-\s|\bund\b|\bbei\b|\bab\b|\bim\b|\bam\b)\s*/).map((s) => s.trim()).filter(Boolean)
}

/** Wörter eines Namensteils ohne Zusätze; leer, wenn nur Allgemeines übrig bleibt. */
function bereinigt(teil: string, zusatz?: Set<string>): string[] {
  let w = woerter(teil).filter((x) => !zusatz?.has(x))
  // "St. Anton" und "Bad Urach" behalten ihren Vorsatz, Artikel fallen weg.
  while (w.length && !(w.length > 1 && BLEIBENDER_VORSATZ.has(w[0])) && (w[0].length <= 2 || ALLGEMEIN.has(w[0]))) w = w.slice(1)
  while (w.length && (w[w.length - 1].length <= 2 || ALLGEMEIN.has(w[w.length - 1]))) w = w.slice(0, -1)
  if (!w.length || w.every((x) => ALLGEMEIN.has(x))) return []
  if (w.length === 1 && w[0].length < 3) return []
  return w
}

export function baueZuordnungsIndex(inhalt: ZuordnungsInhalt): ZuordnungsIndex {
  const begriffe: Begriff[] = []
  const gebietIds = new Set(inhalt.gebiete.map((g) => g.id))
  const add = (b: Begriff) => {
    if (b.woerter.length && gebietIds.has(b.gebietId)) begriffe.push(b)
  }

  for (const h of inhalt.huetten) {
    const voll = woerter(h.name.replace(/\(.*?\)/g, ''))
    add({ woerter: voll, typ: 'huette', anzeige: h.name, gebietId: h.gebietId, huetteId: h.id, unscharf: voll.length === 1 && voll[0].endsWith('hutte') })
    const ohneVorsatz = bereinigt(h.name.replace(/\(.*?\)/g, ''), HUETTEN_VORSATZ)
    if (ohneVorsatz.length && ohneVorsatz.join(' ') !== voll.join(' ') && ohneVorsatz.join('').length >= 5) {
      add({ woerter: ohneVorsatz, typ: 'huette', anzeige: h.name, gebietId: h.gebietId, huetteId: h.id })
    }
    for (const [, klammer] of h.name.matchAll(/\(([^)]+)\)/g)) {
      const w = bereinigt(klammer, HUETTEN_VORSATZ)
      if (w.length) add({ woerter: w, typ: 'huette', anzeige: h.name, gebietId: h.gebietId, huetteId: h.id })
    }
  }

  for (const g of inhalt.gebiete) {
    for (const teil of namensteile(g.name)) {
      const w = bereinigt(teil)
      if (w.length) add({ woerter: w, typ: 'gebiet', anzeige: teil, gebietId: g.id })
    }
  }

  for (const b of MARKANTE_BEGRIFFE) {
    add({ woerter: woerter(b.begriff), typ: b.huetteId ? 'huette' : 'begriff', anzeige: b.begriff, gebietId: b.gebietId, huetteId: b.huetteId, haltestelleId: b.haltestelleId })
  }

  // Haltestellen gehören zu den Gebieten, die sie nennen.
  const gebieteJeHaltestelle = new Map<string, string[]>()
  for (const g of inhalt.gebiete) for (const h of g.haltestellen) gebieteJeHaltestelle.set(h, [...(gebieteJeHaltestelle.get(h) ?? []), g.id])
  for (const h of inhalt.haltestellen) {
    for (const gebietId of gebieteJeHaltestelle.get(h.id) ?? []) {
      for (const teil of namensteile(h.name)) {
        const w = bereinigt(teil, HALTESTELLEN_ZUSATZ)
        if (w.length) add({ woerter: w, typ: 'haltestelle', anzeige: teil.replace(/\s*(Bahnhof|Hauptbahnhof|Busbahnhof|Busterminal)$/, ''), gebietId, haltestelleId: h.id })
      }
    }
  }

  // Regionen zählen nur, wenn sie genau ein Gebiet meinen.
  const gebieteJeRegion = new Map<string, { anzeige: string; gebiete: Set<string> }>()
  for (const h of inhalt.haltestellen) {
    for (const teil of namensteile(h.region)) {
      const w = bereinigt(teil)
      if (!w.length) continue
      const key = w.join(' ')
      const e = gebieteJeRegion.get(key) ?? { anzeige: teil, gebiete: new Set<string>() }
      for (const g of gebieteJeHaltestelle.get(h.id) ?? []) e.gebiete.add(g)
      gebieteJeRegion.set(key, e)
    }
  }
  for (const [key, e] of gebieteJeRegion) {
    if (e.gebiete.size === 1) add({ woerter: key.split(' '), typ: 'region', anzeige: e.anzeige, gebietId: [...e.gebiete][0] })
  }

  return { begriffe, inhalt }
}

function wortPasst(textwort: string, begriffwort: string, letztes: boolean): boolean {
  if (textwort === begriffwort) return true
  if (!letztes || begriffwort.length < 4 || !textwort.startsWith(begriffwort)) return false
  return ENDUNGEN.includes(textwort.slice(begriffwort.length))
}

/** Kürzeres Wort ist im längeren enthalten, nur mit ausgelassenen Buchstaben (höchstens zwei). */
function fastGleich(a: string, b: string): boolean {
  const [k, l] = a.length <= b.length ? [a, b] : [b, a]
  if (k.length < 10 || l.length - k.length > 2 || k === l) return false
  let i = 0
  for (const c of l) if (c === k[i]) i++
  return i === k.length
}

function findet(text: string[], b: Begriff): 'genau' | 'unscharf' | undefined {
  const n = b.woerter.length
  for (let i = 0; i + n <= text.length; i++) {
    let ok = true
    for (let j = 0; j < n && ok; j++) ok = wortPasst(text[i + j], b.woerter[j], j === n - 1)
    if (ok) return 'genau'
  }
  if (b.unscharf && text.some((w) => fastGleich(w, b.woerter[0]))) return 'unscharf'
  return undefined
}

type Treffer = { b: Begriff; feld: Feld; punkte: number }

/** Passendes Gebiet zur Tour oder undefined, wenn nichts sicher genug passt. */
export function ordneZu(tour: TourText, index: ZuordnungsIndex): Zuordnung | undefined {
  const felder: [Feld, string[]][] = (['titel', 'untertitel', 'beschreibung', 'treffpunkt'] as const)
    .map((f): [Feld, string[]] => [f, woerter(tour[f] ?? '')])
    .filter(([, w]) => w.length > 0)

  // Je Begriff zählt das stärkste Feld; ein unscharfer Hüttentreffer wiegt etwas weniger.
  const treffer = new Map<Begriff, Treffer>()
  for (const b of index.begriffe) {
    for (const [feld, text] of felder) {
      const art = findet(text, b)
      if (!art) continue
      const punkte = TYP_GEWICHT[b.typ] * FELD_GEWICHT[feld] * (art === 'unscharf' ? 0.8 : 1)
      const bisher = treffer.get(b)
      if (!bisher || punkte > bisher.punkte) treffer.set(b, { b, feld, punkte })
    }
  }
  if (!treffer.size) return undefined

  // Gleiche Namen aus verschiedenen Quellen (Hütte als Gebietsname, Begriff und Haltestelle) zählen je Gebiet einmal.
  const jeGebiet = new Map<string, Map<string, Treffer>>()
  for (const t of treffer.values()) {
    const m = jeGebiet.get(t.b.gebietId) ?? new Map<string, Treffer>()
    const key = t.b.woerter.join(' ')
    const bisher = m.get(key)
    if (!bisher || t.punkte > bisher.punkte) m.set(key, t)
    jeGebiet.set(t.b.gebietId, m)
  }
  const rangliste = [...jeGebiet.entries()]
    .map(([gebietId, m]) => {
      const liste = [...m.values()].sort((a, b) => b.punkte - a.punkte)
      return { gebietId, liste, punkte: liste.reduce((s, t) => s + t.punkte, 0) }
    })
    .sort((a, b) => b.punkte - a.punkte)

  const [erster, zweiter] = rangliste
  if (erster.punkte < MINDESTPUNKTE) return undefined
  const staerkster = erster.liste[0]
  const huette = erster.liste.find((t) => t.b.huetteId)
  const sicherImKopf = erster.liste.some((t) => ['huette', 'gebiet', 'begriff'].includes(t.b.typ) && (t.feld === 'titel' || t.feld === 'untertitel'))
  const deutlich = !zweiter || zweiter.punkte < erster.punkte * 0.6

  return {
    gebietId: erster.gebietId,
    ...(huette ? { huetteId: huette.b.huetteId } : {}),
    haltestelleId: hauptzugang(index.inhalt, erster.gebietId, erster.liste, huette?.b.huetteId),
    grund: `${TYP_TEXT[staerkster.b.typ]} „${staerkster.b.anzeige}“ ${FELD_TEXT[staerkster.feld]}`,
    sicherheit: sicherImKopf && deutlich ? 'hoch' : 'mittel',
  }
}

function hauptzugang(i: ZuordnungsInhalt, gebietId: string, liste: Treffer[], huetteId?: string): string {
  const genannt = liste.find((t) => t.b.haltestelleId)?.b.haltestelleId
  if (genannt) return genannt
  const huette = huetteId ? i.huetten.find((h) => h.id === huetteId) : undefined
  if (huette) return [...huette.zustiege].sort((a, b) => a.gehzeitMin - b.gehzeitMin)[0].haltestelleId
  return i.gebiete.find((g) => g.id === gebietId)!.haltestellen[0]
}

/**
 * Haltestelle für die Verbindung am Tourdatum: der Hauptzugang, wenn er dann bedient wird,
 * sonst die erste bediente Haltestelle des Gebiets (Saisonbus am Pass im Winter).
 */
export function zugangAm(i: ZuordnungsInhalt, z: Zuordnung, datum: string): Haltestelle | undefined {
  const finde = (id: string) => i.haltestellen.find((h) => h.id === id)
  const haupt = finde(z.haltestelleId)
  if (haupt && bedientAm(haupt, datum)) return haupt
  const gebiet = i.gebiete.find((g) => g.id === z.gebietId)
  for (const id of gebiet?.haltestellen ?? []) {
    const h = finde(id)
    if (h && bedientAm(h, datum)) return h
  }
  return haupt
}
