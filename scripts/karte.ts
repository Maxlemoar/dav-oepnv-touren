/** Erzeugt public/karte.json (GeoJSON aller Gebiete und Hütten) für die MapLibre-Karte. Läuft als prebuild. */
import fs from 'node:fs'
import path from 'node:path'
import { inhalt, sichtbareStartorte } from '../src/lib/content/laden'
import { karteGeoJson } from '../src/lib/karte'

const i = inhalt()
const startort = sichtbareStartorte(i)[0]
if (!startort) throw new Error('Kein sichtbarer Startort in content/startorte')
const ziel = path.join(process.cwd(), 'public', 'karte.json')
fs.mkdirSync(path.dirname(ziel), { recursive: true })
fs.writeFileSync(ziel, JSON.stringify(karteGeoJson(i, startort.id)))
console.log(`karte: ${path.relative(process.cwd(), ziel)} geschrieben (${i.gebiete.length} Gebiete, ${i.huetten.length} Hütten, ab ${startort.name})`)
