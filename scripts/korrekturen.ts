/**
 * Spielt die belegten Korrekturvorschläge aus docs/audit/2026-11/g*-korrekturen.yaml ein.
 *
 * Nur Einträge mit `sicher: true` und einfachem Feldpfad (z. B. `zustiege[0].gehzeitMin`, `betreiber.sektion`)
 * werden gesetzt. Vor dem Setzen wird geprüft, ob der aktuelle Wert `alt` entspricht; sonst ist es ein Konflikt.
 * Texte dürfen mit „…“ abgekürzt sein: Dann werden die Textstücke zwischen den Auslassungszeichen im aktuellen
 * Wert gesucht und durch die entsprechenden Stücke aus `neu` ersetzt (oder, wenn `neu` vollständig ist und `alt`
 * nur den Anfang nennt, ganz ersetzt). Formatierung und Kommentare bleiben erhalten (parseDocument + setIn).
 *
 * Aufruf: npx tsx scripts/korrekturen.ts [--trocken]
 * Ergebnis: docs/audit/2026-11/eingespielt.md. Alles ab der Zeile `<!-- von Hand -->` bleibt beim Neuschreiben erhalten.
 */
import fs from 'node:fs'
import path from 'node:path'
import { parse, parseDocument, isMap, isSeq, type Document } from 'yaml'

const WURZEL = process.cwd()
const AUDIT = path.join(WURZEL, 'docs/audit/2026-11')
const PROTOKOLL = path.join(AUDIT, 'eingespielt.md')
const MARKE = '<!-- von Hand -->'
const trocken = process.argv.includes('--trocken')

type Vorschlag = { datei: string; feld: string; alt: unknown; neu: unknown; quelle?: string; sicher?: boolean }
type Ergebnis = 'eingespielt' | 'konflikt' | 'von Hand' | 'übersprungen'
type Zeile = { ref: string; v: Vorschlag; ergebnis: Ergebnis; grund: string }

const ELLIPSE = '…'
const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const stuecke = (s: string) => s.split(ELLIPSE).map(norm).filter(Boolean)

/** "zustiege[0].gehzeitMin" → ["zustiege", 0, "gehzeitMin"]; null, wenn kein einfacher Pfad. */
function pfad(feld: string): (string | number)[] | null {
  if (!/^[A-Za-z]+(\[\d+\])?(\.[A-Za-z]+(\[\d+\])?)*$/.test(feld)) return null
  const teile: (string | number)[] = []
  for (const t of feld.split('.')) {
    const m = /^([A-Za-z]+)(?:\[(\d+)\])?$/.exec(t)!
    teile.push(m[1])
    if (m[2] !== undefined) teile.push(Number(m[2]))
  }
  return teile
}

/** Neuer Text für einen abgekürzten Textvorschlag, oder ein Grund, warum es nicht passt. */
function textErsetzen(aktuell: string, alt: string, neu: string): { wert: string } | { konflikt: string } {
  const a = norm(aktuell)
  if (!alt.includes(ELLIPSE)) {
    if (a === norm(alt)) return { wert: norm(neu) }
    // `alt` als Teilstück des Textes (z. B. ein Satz der Gebietsbeschreibung): nur ersetzen, wenn es genau einmal vorkommt.
    const teil = norm(alt)
    const pos = a.indexOf(teil)
    if (pos >= 0 && a.indexOf(teil, pos + 1) < 0) return { wert: a.slice(0, pos) + norm(neu) + a.slice(pos + teil.length) }
    return { konflikt: 'aktueller Text weicht von `alt` ab' }
  }
  const altStuecke = stuecke(alt)
  const nurAnfang = !alt.trimStart().startsWith(ELLIPSE) && altStuecke.length === 1
  if (!neu.includes(ELLIPSE)) {
    // `neu` ist vollständig: `alt` muss den Anfang des aktuellen Textes nennen.
    if (nurAnfang && a.startsWith(altStuecke[0])) return { wert: norm(neu) }
    return { konflikt: '`alt` ist abgekürzt, `neu` vollständig, aber der Anfang passt nicht' }
  }
  const neuStuecke = stuecke(neu)
  if (neuStuecke.length !== altStuecke.length) return { konflikt: 'Textstücke in `alt` und `neu` passen nicht zusammen' }
  let ergebnis = a
  for (let i = 0; i < altStuecke.length; i++) {
    const pos = ergebnis.indexOf(altStuecke[i])
    if (pos < 0) return { konflikt: `Textstück „${altStuecke[i].slice(0, 60)}“ nicht gefunden` }
    ergebnis = ergebnis.slice(0, pos) + neuStuecke[i] + ergebnis.slice(pos + altStuecke[i].length)
  }
  return { wert: ergebnis }
}

/** Ist der Vorschlag im aktuellen Wert schon enthalten? */
function schonGesetzt(aktuell: unknown, neu: unknown): boolean {
  if (neu === null) return aktuell === undefined || aktuell === null
  if (typeof neu === 'string' && typeof aktuell === 'string') {
    if (!neu.includes(ELLIPSE)) return norm(aktuell) === norm(neu)
    return stuecke(neu).every((s) => norm(aktuell).includes(s))
  }
  return aktuell === neu
}

/** Mit flowCollectionPadding schreibt yaml auch Listen als „[ a, b ]“; die meisten Dateien nutzen „[a, b]“. */
function alsText(doc: Document, original: string): string {
  const s = doc.toString({ lineWidth: 0 })
  return /\[ [^\]\n]* \]/.test(original) ? s : s.replace(/\[ ([^[\]\n]*) \]/g, '[$1]').replace(/\[ \]/g, '[]')
}

function bearbeite(v: Vorschlag, docs: Map<string, { doc: Document; original: string }>): { ergebnis: Ergebnis; grund: string } {
  if (v.sicher !== true) return { ergebnis: 'übersprungen', grund: 'nicht belegt (`sicher: false`), geht an den Arbeitskreis' }
  const p = pfad(v.feld)
  if (!p) return { ergebnis: 'von Hand', grund: `struktureller Vorschlag (${v.feld})` }
  const datei = path.join(WURZEL, v.datei)
  if (!fs.existsSync(datei)) return { ergebnis: 'von Hand', grund: 'Datei existiert noch nicht' }
  if (!docs.has(datei)) {
    const original = fs.readFileSync(datei, 'utf8')
    docs.set(datei, { doc: parseDocument(original), original })
  }
  const { doc } = docs.get(datei)!
  const knoten = doc.getIn(p, true)
  if (isMap(knoten) || isSeq(knoten)) return { ergebnis: 'von Hand', grund: 'Feld ist eine Liste oder Tabelle, kein Einzelwert' }
  const aktuell = doc.getIn(p)

  if (schonGesetzt(aktuell, v.neu)) return { ergebnis: 'eingespielt', grund: 'Wert war schon gesetzt' }
  if (v.alt !== null && v.alt !== undefined && v.neu !== null && typeof v.alt !== typeof v.neu) {
    return { ergebnis: 'von Hand', grund: 'Vorschlag ist kein Wert desselben Typs (z. B. „neu berechnen“)' }
  }

  let wert: unknown
  if (v.alt === null || v.alt === undefined) {
    if (aktuell !== undefined && aktuell !== null) return { ergebnis: 'konflikt', grund: 'Feld sollte leer sein, ist aber gesetzt' }
    wert = v.neu
  } else if (typeof v.alt === 'number' || typeof v.alt === 'boolean') {
    // Fehlende Wahrheitswerte gelten laut Schema als false (z. B. `bergbahn`).
    const ist = aktuell === undefined && v.alt === false ? false : aktuell
    if (ist !== v.alt) return { ergebnis: 'konflikt', grund: `aktuell ${JSON.stringify(aktuell)}, erwartet ${JSON.stringify(v.alt)}` }
    wert = v.neu
  } else if (typeof v.alt === 'string') {
    if (typeof aktuell !== 'string') return { ergebnis: 'konflikt', grund: `aktuell ${JSON.stringify(aktuell)}, erwartet Text` }
    if (typeof v.neu === 'string') {
      const r = textErsetzen(aktuell, v.alt, v.neu)
      if ('konflikt' in r) return { ergebnis: 'konflikt', grund: r.konflikt }
      wert = r.wert
    } else {
      if (norm(aktuell) !== norm(v.alt)) return { ergebnis: 'konflikt', grund: 'aktueller Text weicht von `alt` ab' }
      wert = v.neu
    }
  } else {
    return { ergebnis: 'von Hand', grund: 'Typ von `alt` nicht unterstützt' }
  }
  if (wert === null) doc.deleteIn(p)
  else doc.setIn(p, wert)
  return { ergebnis: 'eingespielt', grund: wert === null ? 'Feld entfernt' : 'gesetzt' }
}

function kurz(x: unknown, n = 90): string {
  const s = x === undefined || x === null ? '–' : typeof x === 'string' ? x : JSON.stringify(x)
  const t = s.length > n ? s.slice(0, n - 1) + '…' : s
  return t.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function main() {
  const gruppen = fs.readdirSync(AUDIT).filter((f) => /^g\d+-korrekturen\.yaml$/.test(f)).sort()
  const docs = new Map<string, { doc: Document; original: string }>()
  const zeilen: Zeile[] = []
  for (const g of gruppen) {
    const liste = parse(fs.readFileSync(path.join(AUDIT, g), 'utf8')) as Vorschlag[]
    liste.forEach((v, i) => {
      const r = bearbeite(v, docs)
      zeilen.push({ ref: `${g.replace('-korrekturen.yaml', '')}#${i}`, v, ...r })
    })
  }

  let geschrieben = 0
  if (!trocken) {
    for (const [datei, { doc, original }] of docs) {
      const neu = alsText(doc, original)
      if (neu !== original) {
        fs.writeFileSync(datei, neu)
        geschrieben++
      }
    }
  }

  const zaehler = (e: Ergebnis) => zeilen.filter((z) => z.ergebnis === e).length
  const abschnitt = (e: Ergebnis, titel: string, erklaerung: string) => {
    const z = zeilen.filter((x) => x.ergebnis === e)
    if (z.length === 0) return []
    return [
      `## ${titel} (${z.length})`, '', erklaerung, '',
      '| Nr. | Datei | Feld | alt | neu | Grund |', '|---|---|---|---|---|---|',
      ...z.map((x) => `| ${x.ref} | ${x.v.datei.replace(/^content\//, '')} | ${x.v.feld} | ${kurz(x.v.alt)} | ${kurz(x.v.neu)} | ${x.grund} |`),
      '',
    ]
  }

  const kopf = [
    '# Eingespielte Korrekturen aus dem Qualitätscheck November 2026',
    '',
    `Erzeugt mit \`npx tsx scripts/korrekturen.ts\` am ${new Date().toISOString().slice(0, 10)}. Grundlage: \`g1-korrekturen.yaml\` bis \`g4-korrekturen.yaml\` (${zeilen.length} Vorschläge).`,
    '',
    '| Ergebnis | Anzahl |', '|---|---|',
    `| eingespielt (automatisch) | ${zaehler('eingespielt')} |`,
    `| Konflikt (alter Wert passt nicht, nicht gesetzt) | ${zaehler('konflikt')} |`,
    `| von Hand (struktureller Vorschlag) | ${zaehler('von Hand')} |`,
    `| übersprungen (nicht belegt, Arbeitskreis) | ${zaehler('übersprungen')} |`,
    '',
    ...abschnitt('eingespielt', 'Eingespielt', 'Wert geprüft und gesetzt.'),
    ...abschnitt('konflikt', 'Konflikt', 'Der aktuelle Wert entsprach nicht `alt`. Nichts gesetzt, von Hand prüfen.'),
    ...abschnitt('von Hand', 'Von Hand', 'Strukturelle Vorschläge, die das Skript nicht setzt. Was daraus wurde, steht im Abschnitt „Von Hand erledigt“.'),
    ...abschnitt('übersprungen', 'Übersprungen', 'Ohne belastbare Quelle; diese Vorschläge stehen in `docs/pruefliste-arbeitskreis.md`.'),
  ]
  const bisher = fs.existsSync(PROTOKOLL) ? fs.readFileSync(PROTOKOLL, 'utf8') : ''
  const handTeil = bisher.includes(MARKE) ? bisher.slice(bisher.indexOf(MARKE)) : `${MARKE}\n`
  if (!trocken) fs.writeFileSync(PROTOKOLL, kopf.join('\n') + '\n' + handTeil)

  console.log(`eingespielt ${zaehler('eingespielt')}, Konflikt ${zaehler('konflikt')}, von Hand ${zaehler('von Hand')}, übersprungen ${zaehler('übersprungen')}`)
  for (const z of zeilen.filter((x) => x.ergebnis === 'konflikt')) console.log(`Konflikt ${z.ref} ${z.v.datei} ${z.v.feld}: ${z.grund}`)
  console.log(trocken ? 'Trockenlauf, nichts geschrieben.' : `${geschrieben} Dateien geändert, Protokoll in ${path.relative(WURZEL, PROTOKOLL)}`)
}

main()
