/** Erzeugt public/ausgangsorte.json und public/tagesplaene/*.json für die Karte der Startseite. Läuft als prebuild und predev. */
import fs from 'node:fs'
import path from 'node:path'
import { inhalt, sichtbareStartorte } from '../src/lib/content/laden'
import { ausgangsorte, ausgangsortDatei, tagesplanDatei } from '../src/lib/ausgangsorte'
import { ladeMusterfahrplan } from '../src/lib/musterfahrplan/laden'
import { ladeFahrplan } from '../src/lib/verbindung/fahrplan'
import type { Tagesklasse } from '../src/lib/saison'

const i = inhalt()
const startort = sichtbareStartorte(i)[0]
if (!startort) throw new Error('Kein sichtbarer Startort in content/startorte')
const muster = ladeMusterfahrplan()
const orte = ausgangsorte(i, startort.id)
const orteZiel = path.join(process.cwd(), 'public', 'ausgangsorte.json')
fs.mkdirSync(path.dirname(orteZiel), { recursive: true })
fs.writeFileSync(orteZiel, JSON.stringify(ausgangsortDatei(orte, muster, ladeFahrplan().liveBis)))
console.log(`karte: ${path.relative(process.cwd(), orteZiel)} geschrieben (${orte.length} Ausgangsorte ab ${startort.name})`)
const planDir = path.join(process.cwd(), 'public', 'tagesplaene')
fs.mkdirSync(planDir, { recursive: true })
for (const klasse of ['werktag', 'sa', 'so'] as Tagesklasse[]) {
  const datei = path.join(planDir, `${klasse}.json`)
  const plaene = tagesplanDatei(muster, klasse)
  fs.writeFileSync(datei, JSON.stringify(plaene))
  console.log(`karte: ${path.relative(process.cwd(), datei)} geschrieben (${Object.keys(plaene).length} Orte)`)
}
