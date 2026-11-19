/** Erzeugt public/karte.json (GeoJSON aller Gebiete und Hütten) für die MapLibre-Karte. Läuft als prebuild. */
import fs from 'node:fs'
import path from 'node:path'
import { inhalt, sichtbareStartorte } from '../src/lib/content/laden'
import { karteGeoJson } from '../src/lib/karte'
import { ausgangsorte, ausgangsortDatei, tagesplanDatei } from '../src/lib/ausgangsorte'
import { ladeMusterfahrplan } from '../src/lib/musterfahrplan/laden'
import { ladeFahrplan } from '../src/lib/verbindung/fahrplan'
import type { Tagesklasse } from '../src/lib/saison'

const i = inhalt()
const startort = sichtbareStartorte(i)[0]
if (!startort) throw new Error('Kein sichtbarer Startort in content/startorte')
const ziel = path.join(process.cwd(), 'public', 'karte.json')
fs.mkdirSync(path.dirname(ziel), { recursive: true })
fs.writeFileSync(ziel, JSON.stringify(karteGeoJson(i, startort.id)))
console.log(`karte: ${path.relative(process.cwd(), ziel)} geschrieben (${i.gebiete.length} Gebiete, ${i.huetten.length} Hütten, ab ${startort.name})`)

const muster = ladeMusterfahrplan()
const orte = ausgangsorte(i, startort.id)
const orteZiel = path.join(process.cwd(), 'public', 'ausgangsorte.json')
fs.writeFileSync(orteZiel, JSON.stringify(ausgangsortDatei(orte, muster, ladeFahrplan().liveBis)))
console.log(`karte: ${path.relative(process.cwd(), orteZiel)} geschrieben (${orte.length} Ausgangsorte)`)
const planDir = path.join(process.cwd(), 'public', 'tagesplaene')
fs.mkdirSync(planDir, { recursive: true })
for (const klasse of ['werktag', 'sa', 'so'] as Tagesklasse[]) {
  const datei = path.join(planDir, `${klasse}.json`)
  const plaene = tagesplanDatei(muster, klasse)
  fs.writeFileSync(datei, JSON.stringify(plaene))
  console.log(`karte: ${path.relative(process.cwd(), datei)} geschrieben (${Object.keys(plaene).length} Orte)`)
}
