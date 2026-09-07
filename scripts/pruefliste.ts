/** Erzeugt docs/pruefliste.md: alle Hütten, Haltestellen und Gebiete mit Vorschlag, Quelle und Unsicherheit. */
import fs from 'node:fs'
import path from 'node:path'
import { inhalt } from '../src/lib/content/laden'
import { minutenAlsDauer } from '../src/lib/datum'
import { TOUR_ANBIETER_LABEL } from '../src/lib/content/schema'
import { tourMeta } from '../src/lib/touren'

const i = inhalt()
const zeilen: string[] = [
  '# Prüfliste für den Arbeitskreis',
  '',
  `Stand: ${new Date().toISOString().slice(0, 10)}. Bitte pro Zeile: stimmt / stimmt nicht, weil … Korrekturen an Maximilian.`,
  '',
  '## Hütten',
  '',
  '| Hütte | Betreiber | Talhaltestelle | Zustieg | Hinweis | Quelle | Geschätzt |',
  '|---|---|---|---|---|---|---|',
]
for (const h of i.huetten) {
  for (const z of h.zustiege) {
    const hs = i.haltestellen.find((x) => x.id === z.haltestelleId)
    const betreiber = `${h.betreiber.typ.toUpperCase()}${h.betreiber.sektion ? ' ' + h.betreiber.sektion : ''}`
    const zustieg = `${minutenAlsDauer(z.gehzeitMin)}${z.bergbahn ? ' + Bergbahn' : ''}, ${z.hoehenmeter} hm`
    zeilen.push(`| ${h.name} (${h.hoehe} m) | ${betreiber} | ${hs?.name ?? z.haltestelleId} | ${zustieg} | ${z.hinweis ?? ''} | [Quelle](${h.quelle}) | ${h.geschaetzt ? '**ja**' : 'nein'} |`)
  }
}
zeilen.push('', '## Haltestellen und Richtwerte ab Offenburg', '',
  'Takt = Verbindungen ab Startort zwischen 6 und 12 Uhr am Referenz-Samstag (stündlich: mindestens 5 Abfahrten, zweistündlich: mindestens 3), nicht die Bedienung am Ziel.', '',
  '| Haltestelle | Region | Fahrzeit | Umstiege | Takt | Ticket | Berechnet am |', '|---|---|---|---|---|---|---|')
for (const h of i.haltestellen) {
  const r = h.richtwerte.offenburg
  zeilen.push(`| ${h.name} | ${h.region} | ${r ? minutenAlsDauer(r.fahrzeitMin) : 'offen'} | ${r?.umstiege ?? ''} | ${r?.takt ?? ''} | ${r?.ticket ?? ''} | ${r?.berechnetAm ?? ''} |`)
}
zeilen.push('', '## Gebiete', '', '| Gebiet | Haltestellen | Sportarten | Saison | Hütten |', '|---|---|---|---|---|')
for (const g of i.gebiete) {
  zeilen.push(`| ${g.name} | ${g.haltestellen.join(', ')} | ${g.sportarten.join(', ')} | ${g.saison} | ${i.huetten.filter((x) => x.gebietId === g.id).length} |`)
}
zeilen.push('', '## Touren', '',
  'Daten belegt = Dauer, Höhenmeter, Länge und Schwierigkeit stehen so auf der verlinkten Seite; fehlt ein Wert, ist er dort nicht ersichtlich. Bitte prüfen, ob die Tour wirklich an der Haltestelle startet.', '',
  '| Gebiet | Tour | Anbieter | Daten belegt? |', '|---|---|---|---|')
for (const g of i.gebiete) {
  for (const t of g.touren) {
    const felder = [t.dauerMin, t.hoehenmeter, t.laengeKm, t.schwierigkeit].filter((x) => x !== undefined).length
    const belegt = felder === 4 ? 'vollständig' : felder === 0 ? '**keine Zahlen**' : `**teilweise** (${tourMeta(t).join(', ') || '–'})`
    zeilen.push(`| ${g.name} | [${t.titel}](${t.url})${t.embed ? ' (Embed)' : ''} | ${TOUR_ANBIETER_LABEL[t.anbieter]} | ${belegt} |`)
  }
}
const anzahlTouren = i.gebiete.reduce((n, g) => n + g.touren.length, 0)
const ziel = path.join(process.cwd(), 'docs', 'pruefliste.md')
fs.writeFileSync(ziel, zeilen.join('\n') + '\n')
console.log(`pruefliste: ${path.relative(process.cwd(), ziel)} (${i.huetten.length} Hütten, ${i.haltestellen.length} Haltestellen, ${i.gebiete.length} Gebiete, ${anzahlTouren} Touren)`)
