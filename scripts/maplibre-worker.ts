/**
 * Kopiert den MapLibre-Worker (und sein Shared-Modul) nach public/maplibre/.
 * Grund: Turbopack löst `new URL('./maplibre-gl-worker.mjs', import.meta.url)` in maplibre-gl 6 falsch auf,
 * der Worker bekommt eine 404-HTML-Seite und startet nie; dann laden keine Vektorkacheln und keine GeoJSON-Ebenen.
 * Die Karte setzt deshalb `setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')`.
 */
import fs from 'node:fs'
import path from 'node:path'

const quelle = path.join(process.cwd(), 'node_modules', 'maplibre-gl', 'dist')
const ziel = path.join(process.cwd(), 'public', 'maplibre')
fs.mkdirSync(ziel, { recursive: true })
for (const datei of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  fs.copyFileSync(path.join(quelle, datei), path.join(ziel, datei))
}
console.log(`maplibre-worker: ${ziel} (worker + shared)`)
