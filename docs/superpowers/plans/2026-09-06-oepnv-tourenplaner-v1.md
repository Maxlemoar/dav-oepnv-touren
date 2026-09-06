# ÖV-Tourenplaner ab Offenburg, Version 1: Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine statische Next.js-Seite, auf der jemand von Offenburg aus Hütten und Tourengebiete findet, die mit Bahn und Bus erreichbar sind, mit Live-Verbindung fürs gewählte Datum.

**Architecture:** Inhalte (Startorte, Haltestellen, Gebiete, Hütten) liegen als YAML unter `content/` und werden beim Build mit Zod validiert. Seiten werden statisch erzeugt. Live-Verbindungen holt eine Server-Route von der offenen Transitous-API (MOTIS) mit 24-Stunden-Fetch-Cache; fällt sie aus, liefert die Route den Richtwert aus der YAML. Die Karte ist MapLibre mit freien Kacheln und einer beim Build erzeugten GeoJSON-Datei.

**Tech Stack:** Next.js 16 (App Router, TypeScript, Tailwind 4), Zod 4, yaml 2, Vitest 5, maplibre-gl 6, tsx für Skripte. Hosting Vercel. Keine Datenbank.

**Spec:** `docs/superpowers/specs/2026-09-06-oepnv-tourenplaner-design.md`

**Sprache im Code:** Bezeichner auf Deutsch (wie im Datenmodell der Spec), Kommentare knapp. Tests unter `tests/` spiegeln `src/`.

**Umfang dieses Plans:** Software plus ein Startdatensatz mit 3 Startorten, 7 Haltestellen, 7 Gebieten und 8 Hütten. Das Auffüllen auf 40 Gebiete und 100 Hütten aus `docs/research/` ist ein eigener Folgeplan (Datenerfassung), weil es keine Softwarearbeit ist.

---

## Dateistruktur

```
content/
  startorte/offenburg.yaml, lahr.yaml, kehl.yaml
  haltestellen/<id>.yaml          Zielhaltestellen mit Richtwerten
  gebiete/<id>.yaml
  huetten/<id>.yaml
  tickets.yaml                    Ticket-Regel je Land
  emissionen.yaml                 CO2-Faktoren mit Quelle
src/
  lib/content/schema.ts           Zod-Schemas und Typen
  lib/content/laden.ts            YAML lesen, validieren, Querverweise prüfen
  lib/datum.ts                    Zeitzone Europe/Berlin, nächster Samstag, Formatierung
  lib/verbindung/transitous.ts    HTTP-Client für Transitous (plan)
  lib/verbindung/auswerten.ts     Aus Itineraries Hinfahrt/Rückfahrt wählen, Abschnitte
  lib/verbindung/regeln.ts        Tagesziel, Tourenfenster, Ticket
  lib/verbindung/service.ts       Orchestrierung, Fallback auf Richtwert
  lib/co2.ts                      CO2-Ersparnis
  lib/karte.ts                    GeoJSON aus Inhalten
  app/layout.tsx, page.tsx, globals.css
  app/gebiet/[id]/page.tsx
  app/huette/[id]/page.tsx
  app/ueber/page.tsx
  app/api/verbindung/route.ts     Eine Verbindung
  app/api/uebersicht/route.ts     Hauptzugang aller Gebiete für ein Datum
  components/Startseite.tsx       Client: Suche, Filter, Datum, Liste/Karte
  components/Suche.tsx
  components/Filter.tsx
  components/DatumWahl.tsx
  components/GebietKarte.tsx      Karte im Sinne von "Card"
  components/HuetteKarte.tsx
  components/VerbindungZeile.tsx  Client: lädt /api/verbindung, kompakte Zeile + Detail
  components/VerbindungDetail.tsx
  components/Co2Zeile.tsx
  components/Karte.tsx            Client: MapLibre
  components/FehlerMelden.tsx
scripts/
  richtwerte.ts                   Richtwerte je Startort×Haltestelle berechnen, YAML schreiben
  karte.ts                        public/karte.json erzeugen (prebuild)
  rauchtest.ts                    5 Live-Abfragen, warnt nur
tests/
  lib/content/schema.test.ts, laden.test.ts
  lib/datum.test.ts
  lib/verbindung/*.test.ts
  lib/co2.test.ts
  lib/karte.test.ts
  app/api/verbindung.test.ts
  fixtures/content/...            Mini-Inhalte für Loader-Tests
  fixtures/itineraries-kandersteg.json
```

---

### Task 1: Projektgerüst

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `src/app/*` (von create-next-app), `.gitignore` (ergänzen)

- [ ] **Step 1: Next.js in ein Nachbarverzeichnis scaffolden und herüberkopieren**

create-next-app verweigert ein Verzeichnis mit `docs/`. Deshalb daneben erzeugen:

```bash
cd /Users/maximilianmarowsky/Code
npx create-next-app@16 dav-oepnv-touren-scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
rsync -a --exclude .git --exclude node_modules dav-oepnv-touren-scaffold/ dav-oepnv-touren/
rm -rf dav-oepnv-touren-scaffold
cd dav-oepnv-touren
npm install
```

Erwartet: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts`, `tsconfig.json`, `package.json` vorhanden.

- [ ] **Step 2: Abhängigkeiten installieren**

```bash
npm install zod yaml maplibre-gl
npm install --save-dev vitest tsx @types/node
```

- [ ] **Step 3: Vitest konfigurieren**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

In `package.json` unter `scripts` ergänzen:

```json
"test": "vitest run",
"test:watch": "vitest",
"richtwerte": "tsx scripts/richtwerte.ts",
"karte": "tsx scripts/karte.ts",
"rauchtest": "tsx scripts/rauchtest.ts",
"prebuild": "tsx scripts/karte.ts"
```

Der `prebuild`-Eintrag schlägt fehl, solange `scripts/karte.ts` fehlt. Deshalb jetzt einen Platzhalter anlegen, der in Task 13 ersetzt wird:

```bash
mkdir -p scripts && printf 'console.log("karte: noch nicht implementiert")\n' > scripts/karte.ts
```

- [ ] **Step 4: Rauchtest des Gerüsts**

```bash
npx vitest run
```
Erwartet: "No test files found", Exit-Code 0 oder 1 ist hier egal.

```bash
npm run build
```
Erwartet: Build erfolgreich, Ausgabe enthält `○ /`.

- [ ] **Step 5: .gitignore prüfen und committen**

`.gitignore` muss `node_modules/`, `.next/`, `.env*`, `.DS_Store`, `public/karte.json` enthalten (letzteres wird beim Build erzeugt).

```bash
printf 'public/karte.json\n' >> .gitignore
git add -A
git commit -m "chore: Next.js-Gerüst mit Vitest, Zod, yaml, MapLibre"
```

---

### Task 2: Content-Schema

**Files:**
- Create: `src/lib/content/schema.ts`
- Test: `tests/lib/content/schema.test.ts`

- [ ] **Step 1: Failing Test schreiben**

`tests/lib/content/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { HuetteSchema, HaltestelleSchema, GebietSchema, StartortSchema } from '@/lib/content/schema'

describe('StartortSchema', () => {
  it('akzeptiert Offenburg', () => {
    const r = StartortSchema.safeParse({
      id: 'offenburg', name: 'Offenburg', haltestelleId: 'de-DELFI_de:08317:14506_G',
      lat: 48.476, lon: 7.946, sichtbar: true,
    })
    expect(r.success).toBe(true)
  })
  it('lehnt Großbuchstaben in der id ab', () => {
    const r = StartortSchema.safeParse({
      id: 'Offenburg', name: 'Offenburg', haltestelleId: 'x', lat: 1, lon: 1, sichtbar: true,
    })
    expect(r.success).toBe(false)
  })
})

describe('HaltestelleSchema', () => {
  it('richtwerte ist optional und wird zu leerem Objekt', () => {
    const r = HaltestelleSchema.parse({
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch-x', lat: 46.49, lon: 7.67,
      land: 'CH', region: 'Berner Oberland',
    })
    expect(r.richtwerte).toEqual({})
  })
  it('validiert einen Richtwert', () => {
    const r = HaltestelleSchema.safeParse({
      id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch-x', lat: 46.49, lon: 7.67,
      land: 'CH', region: 'Berner Oberland',
      richtwerte: { offenburg: { fahrzeitMin: 250, umstiege: 2, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' } },
    })
    expect(r.success).toBe(true)
  })
})

describe('GebietSchema', () => {
  it('braucht mindestens eine Haltestelle und eine Sportart', () => {
    const r = GebietSchema.safeParse({
      id: 'kandersteg', name: 'Kandersteg', beschreibung: 'x', haltestellen: [], sportarten: ['wandern'],
      saison: 'sommer', lat: 1, lon: 1,
    })
    expect(r.success).toBe(false)
  })
})

describe('HuetteSchema', () => {
  it('akzeptiert eine vollständige Hütte', () => {
    const r = HuetteSchema.safeParse({
      id: 'doldenhornhuette', name: 'Doldenhornhütte',
      betreiber: { typ: 'sac', sektion: 'Emmental' },
      hoehe: 1915, lat: 46.47, lon: 7.69, gebietId: 'kandersteg', saison: 'sommer',
      zustiege: [{ haltestelleId: 'kandersteg', gehzeitMin: 150, hoehenmeter: 750 }],
      quelle: 'https://de.wikipedia.org/wiki/Doldenhornh%C3%BCtte',
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.geschaetzt).toBe(false)
      expect(r.data.zustiege[0].bergbahn).toBe(false)
    }
  })
  it('lehnt unbekannten Betreibertyp ab', () => {
    const r = HuetteSchema.safeParse({
      id: 'x', name: 'x', betreiber: { typ: 'alpenclub' }, hoehe: 1, lat: 1, lon: 1, gebietId: 'g',
      saison: 'sommer', zustiege: [{ haltestelleId: 'h', gehzeitMin: 1, hoehenmeter: 1 }], quelle: 'https://a.b',
    })
    expect(r.success).toBe(false)
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/content/schema.test.ts
```
Erwartet: FAIL, "Cannot find module '@/lib/content/schema'".

- [ ] **Step 3: Schema implementieren**

`src/lib/content/schema.ts`:

```ts
import { z } from 'zod'

const Id = z.string().regex(/^[a-z0-9-]+$/, 'id: nur a-z, 0-9 und Bindestrich')
const Koordinate = { lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }

export const SportartSchema = z.enum(['wandern', 'hochtour', 'skitour', 'klettern', 'klettersteig', 'schneeschuh'])
export const SaisonSchema = z.enum(['sommer', 'winter', 'ganzjaehrig'])
export const LandSchema = z.enum(['DE', 'FR', 'CH', 'AT'])
export const TicketSchema = z.enum(['deutschlandticket', 'halbtax', 'europass', 'keins'])
export const TaktSchema = z.enum(['stuendlich', 'zweistuendlich', 'unregelmaessig'])
export const BetreiberTypSchema = z.enum(['dav', 'sac', 'oeav', 'naturfreunde', 'privat'])

export const StartortSchema = z.object({
  id: Id,
  name: z.string().min(1),
  haltestelleId: z.string().min(1),
  ...Koordinate,
  sichtbar: z.boolean(),
})

export const RichtwertSchema = z.object({
  fahrzeitMin: z.number().int().positive(),
  umstiege: z.number().int().min(0),
  takt: TaktSchema,
  ticket: TicketSchema,
  strassenKm: z.number().positive().optional(),
  bahnKm: z.number().positive().optional(),
  berechnetAm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const HaltestelleSchema = z.object({
  id: Id,
  name: z.string().min(1),
  haltestelleId: z.string().min(1),
  ...Koordinate,
  land: LandSchema,
  region: z.string().min(1),
  richtwerte: z.record(z.string(), RichtwertSchema).default({}),
})

export const GebietSchema = z.object({
  id: Id,
  name: z.string().min(1),
  beschreibung: z.string().min(1),
  haltestellen: z.array(Id).min(1),
  sportarten: z.array(SportartSchema).min(1),
  saison: SaisonSchema,
  links: z.array(z.object({ titel: z.string().min(1), url: z.string().url() })).default([]),
  ...Koordinate,
})

export const ZustiegSchema = z.object({
  haltestelleId: Id,
  gehzeitMin: z.number().int().min(0),
  hoehenmeter: z.number().int(),
  bergbahn: z.boolean().default(false),
  hinweis: z.string().optional(),
})

export const HuetteSchema = z.object({
  id: Id,
  name: z.string().min(1),
  betreiber: z.object({ typ: BetreiberTypSchema, sektion: z.string().optional() }),
  hoehe: z.number().int(),
  ...Koordinate,
  gebietId: Id,
  saison: SaisonSchema,
  buchungUrl: z.string().url().optional(),
  webUrl: z.string().url().optional(),
  zustiege: z.array(ZustiegSchema).min(1),
  quelle: z.string().url(),
  geschaetzt: z.boolean().default(false),
})

export const TicketRegelSchema = z.object({
  land: LandSchema,
  ticket: TicketSchema,
  hinweis: z.string().min(1),
})
export const TicketTabelleSchema = z.object({
  regeln: z.array(TicketRegelSchema).min(1),
  fernverkehrHinweis: z.string().min(1),
})

export const EmissionenSchema = z.object({
  quelle: z.string().min(1),
  quelleUrl: z.string().url(),
  stand: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pkwGrammProFahrzeugKm: z.number().positive(),
  personenProPkw: z.number().positive(),
  bahnGrammProPersonenKm: z.number().positive(),
})

export type Sportart = z.infer<typeof SportartSchema>
export type Saison = z.infer<typeof SaisonSchema>
export type Land = z.infer<typeof LandSchema>
export type Ticket = z.infer<typeof TicketSchema>
export type Takt = z.infer<typeof TaktSchema>
export type BetreiberTyp = z.infer<typeof BetreiberTypSchema>
export type Startort = z.infer<typeof StartortSchema>
export type Richtwert = z.infer<typeof RichtwertSchema>
export type Haltestelle = z.infer<typeof HaltestelleSchema>
export type Gebiet = z.infer<typeof GebietSchema>
export type Zustieg = z.infer<typeof ZustiegSchema>
export type Huette = z.infer<typeof HuetteSchema>
export type TicketTabelle = z.infer<typeof TicketTabelleSchema>
export type Emissionen = z.infer<typeof EmissionenSchema>

export const SPORTART_LABEL: Record<Sportart, string> = {
  wandern: 'Wandern', hochtour: 'Hochtour', skitour: 'Skitour',
  klettern: 'Klettern', klettersteig: 'Klettersteig', schneeschuh: 'Schneeschuh',
}
export const BETREIBER_LABEL: Record<BetreiberTyp, string> = {
  dav: 'DAV', sac: 'SAC', oeav: 'ÖAV', naturfreunde: 'Naturfreunde', privat: 'privat',
}
export const TICKET_LABEL: Record<Ticket, string> = {
  deutschlandticket: 'Deutschlandticket', halbtax: 'Halbtax', europass: 'Europass', keins: 'Einzelticket',
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/lib/content/schema.test.ts
```
Erwartet: PASS, 7 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/schema.ts tests/lib/content/schema.test.ts
git commit -m "feat: Zod-Schemas für Startort, Haltestelle, Gebiet, Hütte, Tickets, Emissionen"
```

---

### Task 3: Content-Loader und Startdaten

**Files:**
- Create: `src/lib/content/laden.ts`
- Create: `content/startorte/*.yaml`, `content/haltestellen/*.yaml`, `content/gebiete/*.yaml`, `content/huetten/*.yaml`, `content/tickets.yaml`, `content/emissionen.yaml`
- Create: `tests/fixtures/content/**` (Mini-Inhalte)
- Test: `tests/lib/content/laden.test.ts`

- [ ] **Step 1: Fixture-Inhalte anlegen**

```bash
mkdir -p tests/fixtures/content/{startorte,haltestellen,gebiete,huetten}
```

`tests/fixtures/content/startorte/offenburg.yaml`:
```yaml
id: offenburg
name: Offenburg
haltestelleId: de-DELFI_de:08317:14506_G
lat: 48.476
lon: 7.946
sichtbar: true
```

`tests/fixtures/content/haltestellen/kandersteg.yaml`:
```yaml
id: kandersteg
name: Kandersteg
haltestelleId: ch-opentransportdataswiss26_Parentch:1:sloid:7475
lat: 46.495
lon: 7.671
land: CH
region: Berner Oberland
richtwerte:
  offenburg:
    fahrzeitMin: 250
    umstiege: 2
    takt: stuendlich
    ticket: halbtax
    strassenKm: 280
    bahnKm: 300
    berechnetAm: "2026-09-06"
```

`tests/fixtures/content/gebiete/kandersteg.yaml`:
```yaml
id: kandersteg
name: Kandersteg
beschreibung: Oeschinensee, Gemmi und drei SAC-Hütten direkt ab Bahnhof.
haltestellen: [kandersteg]
sportarten: [wandern, hochtour]
saison: sommer
lat: 46.495
lon: 7.671
```

`tests/fixtures/content/huetten/doldenhornhuette.yaml`:
```yaml
id: doldenhornhuette
name: Doldenhornhütte
betreiber: { typ: sac, sektion: Emmental }
hoehe: 1915
lat: 46.473
lon: 7.690
gebietId: kandersteg
saison: sommer
zustiege:
  - haltestelleId: kandersteg
    gehzeitMin: 150
    hoehenmeter: 750
quelle: https://de.wikipedia.org/wiki/Doldenhornh%C3%BCtte
```

`tests/fixtures/content/tickets.yaml`:
```yaml
regeln:
  - { land: DE, ticket: deutschlandticket, hinweis: "Nahverkehr" }
  - { land: CH, ticket: halbtax, hinweis: "Ab Basel" }
  - { land: FR, ticket: europass, hinweis: "Ab Kehl" }
  - { land: AT, ticket: keins, hinweis: "Sparpreis" }
fernverkehrHinweis: "Fernverkehr, Deutschlandticket gilt nicht."
```

`tests/fixtures/content/emissionen.yaml`:
```yaml
quelle: Test
quelleUrl: https://example.org
stand: "2026-09-06"
pkwGrammProFahrzeugKm: 230
personenProPkw: 2.5
bahnGrammProPersonenKm: 45
```

- [ ] **Step 2: Failing Test schreiben**

`tests/lib/content/laden.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { ladeInhalt, pruefeQuerverweise } from '@/lib/content/laden'

const FIX = path.resolve(__dirname, '../../fixtures/content')

describe('ladeInhalt', () => {
  it('liest alle Sammlungen aus dem Verzeichnis', () => {
    const inhalt = ladeInhalt(FIX)
    expect(inhalt.startorte.map((s) => s.id)).toEqual(['offenburg'])
    expect(inhalt.haltestellen[0].richtwerte.offenburg.fahrzeitMin).toBe(250)
    expect(inhalt.gebiete[0].id).toBe('kandersteg')
    expect(inhalt.huetten[0].zustiege[0].bergbahn).toBe(false)
    expect(inhalt.tickets.regeln).toHaveLength(4)
    expect(inhalt.emissionen.personenProPkw).toBe(2.5)
  })

  it('wirft bei ungültiger YAML mit Dateiname', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inhalt-'))
    fs.cpSync(FIX, tmp, { recursive: true })
    fs.writeFileSync(path.join(tmp, 'huetten/kaputt.yaml'), 'id: Kaputt\nname: x\n')
    expect(() => ladeInhalt(tmp)).toThrow(/huetten\/kaputt\.yaml/)
  })
})

describe('pruefeQuerverweise', () => {
  it('meldet unbekannte Verweise', () => {
    const inhalt = ladeInhalt(FIX)
    const fehler = pruefeQuerverweise({
      ...inhalt,
      huetten: [{ ...inhalt.huetten[0], gebietId: 'nirgends', zustiege: [{ ...inhalt.huetten[0].zustiege[0], haltestelleId: 'niemand' }] }],
    })
    expect(fehler).toEqual([
      'huette doldenhornhuette: gebietId "nirgends" unbekannt',
      'huette doldenhornhuette: zustieg haltestelleId "niemand" unbekannt',
    ])
  })
  it('ist leer bei gültigen Daten', () => {
    expect(pruefeQuerverweise(ladeInhalt(FIX))).toEqual([])
  })
  it('meldet Gebiet ohne Hütte nicht, aber Haltestelle ohne Gebiet', () => {
    const inhalt = ladeInhalt(FIX)
    const fehler = pruefeQuerverweise({
      ...inhalt,
      haltestellen: [...inhalt.haltestellen, { ...inhalt.haltestellen[0], id: 'einsam' }],
    })
    expect(fehler).toEqual(['haltestelle einsam: gehört zu keinem Gebiet'])
  })
})
```

- [ ] **Step 3: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/content/laden.test.ts
```
Erwartet: FAIL, Modul nicht gefunden.

- [ ] **Step 4: Loader implementieren**

`src/lib/content/laden.ts`:

```ts
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { ZodType } from 'zod'
import {
  StartortSchema, HaltestelleSchema, GebietSchema, HuetteSchema,
  TicketTabelleSchema, EmissionenSchema,
  type Startort, type Haltestelle, type Gebiet, type Huette, type TicketTabelle, type Emissionen,
} from './schema'

export type Inhalt = {
  startorte: Startort[]
  haltestellen: Haltestelle[]
  gebiete: Gebiet[]
  huetten: Huette[]
  tickets: TicketTabelle
  emissionen: Emissionen
}

const STANDARD_VERZEICHNIS = path.join(process.cwd(), 'content')

function leseDatei<T>(datei: string, schema: ZodType<T>, wurzel: string): T {
  const roh = parse(fs.readFileSync(datei, 'utf8'))
  const ergebnis = schema.safeParse(roh)
  if (!ergebnis.success) {
    const rel = path.relative(wurzel, datei)
    const gruende = ergebnis.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    throw new Error(`Ungültiger Inhalt in ${rel}: ${gruende}`)
  }
  return ergebnis.data
}

function leseSammlung<T extends { id: string }>(verzeichnis: string, schema: ZodType<T>, wurzel: string): T[] {
  if (!fs.existsSync(verzeichnis)) return []
  const dateien = fs.readdirSync(verzeichnis).filter((f) => f.endsWith('.yaml')).sort()
  const eintraege = dateien.map((f) => leseDatei(path.join(verzeichnis, f), schema, wurzel))
  const ids = new Set<string>()
  for (const e of eintraege) {
    if (ids.has(e.id)) throw new Error(`Doppelte id "${e.id}" in ${path.relative(wurzel, verzeichnis)}`)
    ids.add(e.id)
  }
  return eintraege
}

export function ladeInhalt(wurzel: string = STANDARD_VERZEICHNIS): Inhalt {
  return {
    startorte: leseSammlung(path.join(wurzel, 'startorte'), StartortSchema, wurzel),
    haltestellen: leseSammlung(path.join(wurzel, 'haltestellen'), HaltestelleSchema, wurzel),
    gebiete: leseSammlung(path.join(wurzel, 'gebiete'), GebietSchema, wurzel),
    huetten: leseSammlung(path.join(wurzel, 'huetten'), HuetteSchema, wurzel),
    tickets: leseDatei(path.join(wurzel, 'tickets.yaml'), TicketTabelleSchema, wurzel),
    emissionen: leseDatei(path.join(wurzel, 'emissionen.yaml'), EmissionenSchema, wurzel),
  }
}

export function pruefeQuerverweise(inhalt: Inhalt): string[] {
  const fehler: string[] = []
  const haltestellenIds = new Set(inhalt.haltestellen.map((h) => h.id))
  const gebietIds = new Set(inhalt.gebiete.map((g) => g.id))
  const benutzteHaltestellen = new Set<string>()

  for (const g of inhalt.gebiete) {
    for (const h of g.haltestellen) {
      if (!haltestellenIds.has(h)) fehler.push(`gebiet ${g.id}: haltestelle "${h}" unbekannt`)
      benutzteHaltestellen.add(h)
    }
  }
  for (const h of inhalt.huetten) {
    if (!gebietIds.has(h.gebietId)) fehler.push(`huette ${h.id}: gebietId "${h.gebietId}" unbekannt`)
    for (const z of h.zustiege) {
      if (!haltestellenIds.has(z.haltestelleId)) fehler.push(`huette ${h.id}: zustieg haltestelleId "${z.haltestelleId}" unbekannt`)
    }
  }
  for (const h of inhalt.haltestellen) {
    if (!benutzteHaltestellen.has(h.id)) fehler.push(`haltestelle ${h.id}: gehört zu keinem Gebiet`)
  }
  return fehler
}

let zwischenspeicher: Inhalt | undefined

/** Geprüfter Inhalt für Seiten und Routen. Wirft, wenn Querverweise kaputt sind. */
export function inhalt(): Inhalt {
  if (zwischenspeicher) return zwischenspeicher
  const geladen = ladeInhalt()
  const fehler = pruefeQuerverweise(geladen)
  if (fehler.length) throw new Error(`Inhalt fehlerhaft:\n${fehler.join('\n')}`)
  zwischenspeicher = geladen
  return geladen
}

export function findeStartort(i: Inhalt, id: string): Startort | undefined { return i.startorte.find((s) => s.id === id) }
export function findeHaltestelle(i: Inhalt, id: string): Haltestelle | undefined { return i.haltestellen.find((h) => h.id === id) }
export function findeGebiet(i: Inhalt, id: string): Gebiet | undefined { return i.gebiete.find((g) => g.id === id) }
export function findeHuette(i: Inhalt, id: string): Huette | undefined { return i.huetten.find((h) => h.id === id) }
export function huettenImGebiet(i: Inhalt, gebietId: string): Huette[] { return i.huetten.filter((h) => h.gebietId === gebietId) }
export function sichtbareStartorte(i: Inhalt): Startort[] { return i.startorte.filter((s) => s.sichtbar) }
```

- [ ] **Step 5: Test laufen lassen**

```bash
npx vitest run tests/lib/content/laden.test.ts
```
Erwartet: PASS, 5 Tests.

- [ ] **Step 6: Startdaten anlegen**

Stop-IDs stammen aus `https://api.transitous.org/api/v1/geocode?text=…&type=STOP` (geprüft am 2026-09-06). Gehzeiten aus `docs/research/huetten.md`, Schätzungen mit `geschaetzt: true`.

`content/startorte/offenburg.yaml`:
```yaml
id: offenburg
name: Offenburg
haltestelleId: de-DELFI_de:08317:14506_G
lat: 48.476475
lon: 7.946723
sichtbar: true
```

`content/startorte/lahr.yaml`:
```yaml
id: lahr
name: Lahr (Schwarzwald)
haltestelleId: de-amarillo-bw_de:08317:12103
lat: 48.34057
lon: 7.83571
sichtbar: false
```

`content/startorte/kehl.yaml`:
```yaml
id: kehl
name: Kehl
haltestelleId: de-DELFI_de:08317:15011
lat: 48.57666
lon: 7.80656
sichtbar: false
```

`content/haltestellen/kandersteg.yaml`:
```yaml
id: kandersteg
name: Kandersteg
haltestelleId: ch-opentransportdataswiss26_Parentch:1:sloid:7475
lat: 46.495396
lon: 7.671415
land: CH
region: Berner Oberland
```

`content/haltestellen/feldberg-baerental.yaml`:
```yaml
id: feldberg-baerental
name: Feldberg-Bärental Bahnhof
haltestelleId: de-DELFI_de:08315:6539
lat: 47.87144
lon: 8.09829
land: DE
region: Südschwarzwald
```

`content/haltestellen/wasserauen.yaml`:
```yaml
id: wasserauen
name: Wasserauen
haltestelleId: ch-opentransportdataswiss26_Parentch:1:sloid:6289
lat: 47.28556
lon: 9.42862
land: CH
region: Alpstein
```

`content/haltestellen/engelberg.yaml`:
```yaml
id: engelberg
name: Engelberg
haltestelleId: ch-opentransportdataswiss26_Parentch:1:sloid:8399
lat: 46.81952
lon: 8.40251
land: CH
region: Zentralschweiz
```

`content/haltestellen/metzeral.yaml`:
```yaml
id: metzeral
name: Metzeral
haltestelleId: "fr-horaires-sncf_FR::LMU:96f41450-cb0a-11e8-8bfa-f784c1c7c611:"
lat: 48.01333
lon: 7.07334
land: FR
region: Vogesen
```

`content/haltestellen/sand-kapelle.yaml`:
```yaml
id: sand-kapelle
name: Sand Kapelle (Schwarzwaldhochstraße)
haltestelleId: de-KVV_de:08216:33500:0:1
lat: 48.65713
lon: 8.23728
land: DE
region: Nordschwarzwald
```

`content/haltestellen/bruegg-buerglen.yaml`:
```yaml
id: bruegg-buerglen
name: Brügg (Bürglen UR), Seilbahn Biel-Kinzig
haltestelleId: ch-opentransportdataswiss26_Parentch:1:sloid:30421
lat: 46.87721
lon: 8.68206
land: CH
region: Uri
```

`content/gebiete/kandersteg.yaml`:
```yaml
id: kandersteg
name: Kandersteg
beschreibung: Oeschinensee, Gemmipass und drei SAC-Hütten, alle direkt ab Bahnhof. Der Klassiker unter den ÖV-Zielen im Berner Oberland.
haltestellen: [kandersteg]
sportarten: [wandern, hochtour, klettern]
saison: sommer
links:
  - { titel: SAC-Tourenportal Kandersteg, url: "https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/" }
lat: 46.495
lon: 7.671
```

`content/gebiete/feldberg.yaml`:
```yaml
id: feldberg
name: Feldberg
beschreibung: Höchster Schwarzwaldgipfel, ab Bahnhof Bärental über den Seebuck. Im Winter Skitouren und Schneeschuh.
haltestellen: [feldberg-baerental]
sportarten: [wandern, skitour, schneeschuh]
saison: ganzjaehrig
links:
  - { titel: Alpenvereinaktiv Feldberg, url: "https://www.alpenvereinaktiv.com/de/touren/#area=Feldberg" }
lat: 47.874
lon: 8.004
```

`content/gebiete/alpstein.yaml`:
```yaml
id: alpstein
name: Alpstein
beschreibung: Säntis, Ebenalp und Seealpsee ab Wasserauen. Als Tagestour knapp, mit Übernachtung ein perfektes Wochenende.
haltestellen: [wasserauen]
sportarten: [wandern, klettern]
saison: sommer
lat: 47.27
lon: 9.40
```

`content/gebiete/engelberg.yaml`:
```yaml
id: engelberg
name: Engelberg
beschreibung: Titlis, Brunni und Rugghubel. Bergbahnen ab Dorf, SAC-Hütten in zwei bis vier Stunden.
haltestellen: [engelberg]
sportarten: [wandern, hochtour, skitour, klettern]
saison: ganzjaehrig
lat: 46.82
lon: 8.40
```

`content/gebiete/munstertal.yaml`:
```yaml
id: munstertal
name: Munstertal (Vogesen)
beschreibung: Hohneck und Petit Ballon ab Metzeral, mit dem TER in gut zwei Stunden. Naturfreundehäuser statt Alpenvereinshütten.
haltestellen: [metzeral]
sportarten: [wandern, schneeschuh]
saison: ganzjaehrig
lat: 48.03
lon: 7.05
```

`content/gebiete/schwarzwaldhochstrasse.yaml`:
```yaml
id: schwarzwaldhochstrasse
name: Schwarzwaldhochstraße
beschreibung: Hornisgrinde, Mummelsee und das Sandkästle der Sektion. Bus ab Bühl bis Sand.
haltestellen: [sand-kapelle]
sportarten: [wandern, schneeschuh]
saison: ganzjaehrig
lat: 48.63
lon: 8.21
```

`content/gebiete/schaechental.yaml`:
```yaml
id: schaechental
name: Schächental (Uri)
beschreibung: Klausenpass-Seite mit dem Gruppenhaus Rämsenberg der Sektion. Bus ab Altdorf, Seilbahn Biel-Kinzig.
haltestellen: [bruegg-buerglen]
sportarten: [wandern, skitour]
saison: ganzjaehrig
lat: 46.87
lon: 8.70
```

`content/huetten/raemsenberg.yaml`:
```yaml
id: raemsenberg
name: Gruppenhaus Rämsenberg
betreiber: { typ: dav, sektion: Offenburg }
hoehe: 1634
lat: 46.868
lon: 8.712
gebietId: schaechental
saison: ganzjaehrig
webUrl: https://www.dav-offenburg.de/Sektion/H%C3%BCtten/R%C3%A4msenberg
zustiege:
  - haltestelleId: bruegg-buerglen
    gehzeitMin: 30
    hoehenmeter: 100
    bergbahn: true
    hinweis: Luftseilbahn Biel-Kinzig bis Bergstation Biel, dann Fußweg.
quelle: https://www.dav-offenburg.de/Sektion/H%C3%BCtten/R%C3%A4msenberg
geschaetzt: true
```

`content/huetten/sandkaestle.yaml`:
```yaml
id: sandkaestle
name: Sandkästle
betreiber: { typ: dav, sektion: Offenburg }
hoehe: 830
lat: 48.657
lon: 8.236
gebietId: schwarzwaldhochstrasse
saison: ganzjaehrig
webUrl: https://www.dav-offenburg.de/Sektion/H%C3%BCtten/Sandk%C3%A4stle
zustiege:
  - haltestelleId: sand-kapelle
    gehzeitMin: 5
    hoehenmeter: 0
quelle: https://www.dav-offenburg.de/Sektion/H%C3%BCtten/Sandk%C3%A4stle
geschaetzt: true
```

`content/huetten/doldenhornhuette.yaml`:
```yaml
id: doldenhornhuette
name: Doldenhornhütte
betreiber: { typ: sac, sektion: Emmental }
hoehe: 1915
lat: 46.4735
lon: 7.6895
gebietId: kandersteg
saison: sommer
webUrl: https://www.doldenhornhuette.ch
zustiege:
  - haltestelleId: kandersteg
    gehzeitMin: 150
    hoehenmeter: 740
quelle: https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs
```

`content/huetten/fruendenhuette.yaml`:
```yaml
id: fruendenhuette
name: Fründenhütte
betreiber: { typ: sac, sektion: Altels }
hoehe: 2562
lat: 46.484
lon: 7.740
gebietId: kandersteg
saison: sommer
webUrl: https://www.fruendenhuette.ch
zustiege:
  - haltestelleId: kandersteg
    gehzeitMin: 165
    hoehenmeter: 1000
    bergbahn: true
    hinweis: Gondel oder Bus zum Oeschinensee, ab dort 2:45 h (T3).
quelle: https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs
```

`content/huetten/bluemlisalphuette.yaml`:
```yaml
id: bluemlisalphuette
name: Blüemlisalphütte
betreiber: { typ: sac, sektion: Blümlisalp }
hoehe: 2840
lat: 46.500
lon: 7.770
gebietId: kandersteg
saison: sommer
webUrl: https://www.bluemlisalphuette.ch
zustiege:
  - haltestelleId: kandersteg
    gehzeitMin: 240
    hoehenmeter: 1300
    bergbahn: true
    hinweis: Über Oeschinensee und Hohtürli.
quelle: https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs
```

`content/huetten/rugghubelhuette.yaml`:
```yaml
id: rugghubelhuette
name: Rugghubelhütte
betreiber: { typ: sac, sektion: Titlis }
hoehe: 2294
lat: 46.842
lon: 8.445
gebietId: engelberg
saison: sommer
webUrl: https://www.rugghubel.ch
zustiege:
  - haltestelleId: engelberg
    gehzeitMin: 135
    hoehenmeter: 700
    bergbahn: true
    hinweis: Brunni-Bahn bis Ristis, ab dort 2 bis 2:30 h.
  - haltestelleId: engelberg
    gehzeitMin: 240
    hoehenmeter: 1290
    hinweis: Ganz zu Fuß ab Bahnhof.
quelle: https://www.rugghubel.ch/zugang
```

`content/huetten/naturfreundehaus-feldberg.yaml`:
```yaml
id: naturfreundehaus-feldberg
name: Naturfreundehaus Feldberg
betreiber: { typ: naturfreunde }
hoehe: 1350
lat: 47.862
lon: 8.030
gebietId: feldberg
saison: ganzjaehrig
webUrl: https://www.naturfreunde.de/haus/naturfreundehaus-feldberg
zustiege:
  - haltestelleId: feldberg-baerental
    gehzeitMin: 15
    hoehenmeter: 50
    hinweis: Bus 7300 bis Feldberger Hof, dann 15 Minuten.
quelle: https://www.naturfreunde.de/haus/naturfreundehaus-feldberg
geschaetzt: true
```

`content/huetten/les-jonquilles.yaml`:
```yaml
id: les-jonquilles
name: Les Jonquilles
betreiber: { typ: naturfreunde, sektion: Amis de la Nature Metzeral }
hoehe: 900
lat: 48.005
lon: 7.060
gebietId: munstertal
saison: ganzjaehrig
webUrl: https://amis-nature.org/article236.html
zustiege:
  - haltestelleId: metzeral
    gehzeitMin: 60
    hoehenmeter: 300
quelle: https://amis-nature.org/article236.html
geschaetzt: true
```

`content/tickets.yaml`:
```yaml
regeln:
  - land: DE
    ticket: deutschlandticket
    hinweis: Deutschlandticket gilt in allen Nahverkehrszügen und Bussen dieser Verbindung.
  - land: CH
    ticket: halbtax
    hinweis: Bis Basel Bad Bf gilt das Deutschlandticket, ab dort SBB-Tarif. Halbtax lohnt sich ab der zweiten Fahrt, Schnupper-Halbtax für einen Monat.
  - land: FR
    ticket: europass
    hinweis: Europass 24 h ab Kehl gilt für Bahn und Bus im Elsass. Bis Kehl Deutschlandticket.
  - land: AT
    ticket: keins
    hinweis: Sparpreis Europa der DB oder Sparschiene der ÖBB, früh buchen.
fernverkehrHinweis: Diese Verbindung nutzt Fernverkehr (ICE/EC). Dort gilt das Deutschlandticket nicht, Alternative über den Nahverkehr dauert länger.
```

`content/emissionen.yaml`:
```yaml
quelle: Umweltbundesamt, Vergleich der durchschnittlichen Emissionen einzelner Verkehrsmittel im Personenverkehr, Bezugsjahr 2023
quelleUrl: https://www.umweltbundesamt.de/themen/verkehr/emissionsdaten
stand: "2026-09-06"
pkwGrammProFahrzeugKm: 230
personenProPkw: 2.5
bahnGrammProPersonenKm: 45
```

- [ ] **Step 7: Startdaten gegen Loader prüfen**

```bash
npx tsx -e "import { inhalt } from './src/lib/content/laden'; const i = inhalt(); console.log(i.startorte.length, i.haltestellen.length, i.gebiete.length, i.huetten.length)"
```
Erwartet: `3 7 7 8`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/laden.ts tests/lib/content tests/fixtures content
git commit -m "feat: Content-Loader mit Querverweisprüfung und Startdaten"
```

---

### Task 4: Datum- und Zeitzonen-Helfer

**Files:**
- Create: `src/lib/datum.ts`
- Test: `tests/lib/datum.test.ts`

Transitous liefert Zeiten in UTC. Alle Regeln rechnen in Europe/Berlin.

- [ ] **Step 1: Failing Test schreiben**

`tests/lib/datum.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { lokaleMinuten, lokaleUhrzeit, lokalesDatum, naechsterSamstag, folgetag, zuUtcIso, wochentagKurz, minutenAlsDauer } from '@/lib/datum'

describe('lokaleMinuten', () => {
  it('rechnet Sommerzeit um (UTC+2)', () => {
    expect(lokaleMinuten('2026-09-12T04:30:00Z')).toBe(6 * 60 + 30)
  })
  it('rechnet Winterzeit um (UTC+1)', () => {
    expect(lokaleMinuten('2026-01-10T05:12:00Z')).toBe(6 * 60 + 12)
  })
})

describe('lokaleUhrzeit / lokalesDatum', () => {
  it('formatiert', () => {
    expect(lokaleUhrzeit('2026-09-12T04:30:00Z')).toBe('06:30')
    expect(lokalesDatum('2026-09-12T22:30:00Z')).toBe('2026-09-13')
  })
})

describe('naechsterSamstag', () => {
  it('liefert den kommenden Samstag', () => {
    expect(naechsterSamstag(new Date('2026-09-09T10:00:00Z'))).toBe('2026-09-12') // Mittwoch
  })
  it('liefert heute, wenn heute Samstag ist', () => {
    expect(naechsterSamstag(new Date('2026-09-12T10:00:00Z'))).toBe('2026-09-12')
  })
  it('liefert nächste Woche, wenn heute Sonntag ist', () => {
    expect(naechsterSamstag(new Date('2026-09-13T10:00:00Z'))).toBe('2026-09-19')
  })
})

describe('folgetag', () => {
  it('über Monatsgrenze', () => {
    expect(folgetag('2026-09-30')).toBe('2026-10-01')
  })
})

describe('zuUtcIso', () => {
  it('23:00 lokal im Sommer ist 21:00Z', () => {
    expect(zuUtcIso('2026-09-12', 23 * 60)).toBe('2026-09-12T21:00:00Z')
  })
  it('05:00 lokal im Winter ist 04:00Z', () => {
    expect(zuUtcIso('2026-01-10', 5 * 60)).toBe('2026-01-10T04:00:00Z')
  })
})

describe('wochentagKurz', () => {
  it('Sa für Samstag', () => {
    expect(wochentagKurz('2026-09-12')).toBe('Sa')
  })
})

describe('minutenAlsDauer', () => {
  it('formatiert h:mm', () => {
    expect(minutenAlsDauer(250)).toBe('4:10 h')
    expect(minutenAlsDauer(45)).toBe('0:45 h')
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/datum.test.ts
```
Erwartet: FAIL, Modul nicht gefunden.

- [ ] **Step 3: Implementieren**

`src/lib/datum.ts`:

```ts
const ZONE = 'Europe/Berlin'

const teileFormat = new Intl.DateTimeFormat('de-DE', {
  timeZone: ZONE, hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short',
})

function lokaleTeile(d: Date) {
  const t: Record<string, string> = {}
  for (const p of teileFormat.formatToParts(d)) t[p.type] = p.value
  return {
    jahr: t.year, monat: t.month, tag: t.day,
    stunde: Number(t.hour), minute: Number(t.minute), wochentag: t.weekday,
  }
}

/** Minuten seit lokaler Mitternacht (Europe/Berlin). */
export function lokaleMinuten(iso: string): number {
  const t = lokaleTeile(new Date(iso))
  return t.stunde * 60 + t.minute
}

export function lokaleUhrzeit(iso: string): string {
  const t = lokaleTeile(new Date(iso))
  return `${String(t.stunde).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

/** YYYY-MM-DD in Europe/Berlin. */
export function lokalesDatum(iso: string | Date): string {
  const t = lokaleTeile(typeof iso === 'string' ? new Date(iso) : iso)
  return `${t.jahr}-${t.monat}-${t.tag}`
}

function tageAddieren(datum: string, tage: number): string {
  const d = new Date(`${datum}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + tage)
  return d.toISOString().slice(0, 10)
}

export function folgetag(datum: string): string {
  return tageAddieren(datum, 1)
}

/** Kommender Samstag (heute, falls Samstag) als YYYY-MM-DD. */
export function naechsterSamstag(heute: Date = new Date()): string {
  const datum = lokalesDatum(heute)
  const wochentag = new Date(`${datum}T00:00:00Z`).getUTCDay() // 0 So … 6 Sa
  return tageAddieren(datum, (6 - wochentag + 7) % 7)
}

/** Lokale Uhrzeit (Minuten seit Mitternacht) an einem Datum als UTC-ISO. */
export function zuUtcIso(datum: string, minuten: number): string {
  const mittagUtc = Date.parse(`${datum}T12:00:00Z`)
  const versatz = lokaleMinuten(new Date(mittagUtc).toISOString()) - 12 * 60 // 60 oder 120
  const ms = Date.parse(`${datum}T00:00:00Z`) + (minuten - versatz) * 60_000
  return new Date(ms).toISOString().replace('.000Z', 'Z')
}

export function wochentagKurz(datum: string): string {
  const t = lokaleTeile(new Date(`${datum}T12:00:00Z`))
  return t.wochentag.replace('.', '')
}

export function minutenAlsDauer(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')} h`
}

export function datumLesbar(datum: string): string {
  const [j, m, t] = datum.split('-')
  return `${wochentagKurz(datum)} ${Number(t)}.${Number(m)}.${j}`
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/lib/datum.test.ts
```
Erwartet: PASS, 11 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/datum.ts tests/lib/datum.test.ts
git commit -m "feat: Datum- und Zeitzonen-Helfer für Europe/Berlin"
```

---

### Task 5: Regeln (Tagesziel, Tourenfenster, Ticket)

**Files:**
- Create: `src/lib/verbindung/regeln.ts`
- Test: `tests/lib/verbindung/regeln.test.ts`

- [ ] **Step 1: Failing Test schreiben**

`tests/lib/verbindung/regeln.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { tourenfensterMin, istTagesziel, ticketFuer, TAGESZIEL } from '@/lib/verbindung/regeln'
import type { TicketTabelle } from '@/lib/content/schema'

const tabelle: TicketTabelle = {
  regeln: [
    { land: 'DE', ticket: 'deutschlandticket', hinweis: 'Nah' },
    { land: 'CH', ticket: 'halbtax', hinweis: 'CH' },
    { land: 'FR', ticket: 'europass', hinweis: 'FR' },
    { land: 'AT', ticket: 'keins', hinweis: 'AT' },
  ],
  fernverkehrHinweis: 'Fern',
}

describe('tourenfensterMin', () => {
  it('Rückfahrt-Abfahrt minus Hinfahrt-Ankunft', () => {
    expect(tourenfensterMin('2026-09-12T08:40:00Z', '2026-09-12T16:14:00Z')).toBe(454)
  })
})

describe('istTagesziel', () => {
  it('ja bei Ankunft 9:30, Rückfahrt 17:00, 7,5 h Fenster', () => {
    expect(istTagesziel({ ankunftMin: 570, rueckfahrtMin: 1020, tourenfensterMin: 450 })).toBe(true)
  })
  it('nein bei Ankunft nach 10:00', () => {
    expect(istTagesziel({ ankunftMin: 601, rueckfahrtMin: 1020, tourenfensterMin: 419 })).toBe(false)
  })
  it('nein bei Rückfahrt vor 16:30', () => {
    expect(istTagesziel({ ankunftMin: 540, rueckfahrtMin: 989, tourenfensterMin: 449 })).toBe(false)
  })
  it('nein bei zu kleinem Fenster, ja mit kleinerem Regler', () => {
    const w = { ankunftMin: 590, rueckfahrtMin: 1000, tourenfensterMin: 410 }
    expect(istTagesziel(w)).toBe(true)
    expect(istTagesziel({ ...w, tourenfensterMin: 300 })).toBe(false)
    expect(istTagesziel({ ...w, tourenfensterMin: 300 }, 240)).toBe(true)
  })
  it('Grenzwerte sind exportiert', () => {
    expect(TAGESZIEL).toEqual({ ankunftBisMin: 600, rueckfahrtAbMin: 990, mindestFensterMin: 360 })
  })
})

describe('ticketFuer', () => {
  it('DE ohne Fernverkehr: Deutschlandticket', () => {
    expect(ticketFuer('DE', false, tabelle)).toEqual({ ticket: 'deutschlandticket', hinweis: 'Nah' })
  })
  it('DE mit Fernverkehr: keins mit Fernverkehrshinweis', () => {
    expect(ticketFuer('DE', true, tabelle)).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })
  it('CH mit Fernverkehr bleibt Halbtax', () => {
    expect(ticketFuer('CH', true, tabelle)).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/verbindung/regeln.test.ts
```
Erwartet: FAIL.

- [ ] **Step 3: Implementieren**

`src/lib/verbindung/regeln.ts`:

```ts
import type { Land, Ticket, TicketTabelle } from '@/lib/content/schema'

export const TAGESZIEL = {
  ankunftBisMin: 10 * 60,
  rueckfahrtAbMin: 16 * 60 + 30,
  mindestFensterMin: 6 * 60,
} as const

export function tourenfensterMin(ankunftIso: string, rueckfahrtAbfahrtIso: string): number {
  return Math.round((Date.parse(rueckfahrtAbfahrtIso) - Date.parse(ankunftIso)) / 60_000)
}

export function istTagesziel(
  w: { ankunftMin: number; rueckfahrtMin: number; tourenfensterMin: number },
  mindestFensterMin: number = TAGESZIEL.mindestFensterMin,
): boolean {
  return (
    w.ankunftMin <= TAGESZIEL.ankunftBisMin &&
    w.rueckfahrtMin >= TAGESZIEL.rueckfahrtAbMin &&
    w.tourenfensterMin >= mindestFensterMin
  )
}

export type TicketHinweis = { ticket: Ticket; hinweis: string }

export function ticketFuer(land: Land, hatFernverkehr: boolean, tabelle: TicketTabelle): TicketHinweis {
  const regel = tabelle.regeln.find((r) => r.land === land)
  if (!regel) return { ticket: 'keins', hinweis: 'Kein Ticket-Hinweis für dieses Land.' }
  if (land === 'DE' && hatFernverkehr) return { ticket: 'keins', hinweis: tabelle.fernverkehrHinweis }
  return { ticket: regel.ticket, hinweis: regel.hinweis }
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/lib/verbindung/regeln.test.ts
```
Erwartet: PASS, 9 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/verbindung/regeln.ts tests/lib/verbindung/regeln.test.ts
git commit -m "feat: Regeln für Tagesziel, Tourenfenster und Ticket"
```

---

### Task 6: Transitous-Client

**Files:**
- Create: `src/lib/verbindung/transitous.ts`
- Test: `tests/lib/verbindung/transitous.test.ts`

Transitous: `GET https://api.transitous.org/api/v1/plan?fromPlace=&toPlace=&time=<UTC-ISO>&arriveBy=&numItineraries=&language=de`. Antwort: `{ itineraries: [{ startTime, endTime, duration (s), transfers, legs: [{ mode, from:{name}, to:{name}, startTime, endTime, routeShortName?, agencyName? }] }] }`. Zeiten in UTC. Nutzungsregel: User-Agent mit Projekt und Kontakt.

- [ ] **Step 1: Failing Test schreiben**

`tests/lib/verbindung/transitous.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { planen, TransitousFehler } from '@/lib/verbindung/transitous'

const antwort = {
  itineraries: [{
    startTime: '2026-09-12T04:30:00Z', endTime: '2026-09-12T08:40:00Z', duration: 15000, transfers: 1,
    legs: [
      { mode: 'HIGHSPEED_RAIL', from: { name: 'Offenburg' }, to: { name: 'Bern' }, startTime: '2026-09-12T04:30:00Z', endTime: '2026-09-12T06:56:00Z', routeShortName: 'ICE 271', agencyName: 'DB Fernverkehr AG' },
      { mode: 'WALK', from: { name: 'Bern' }, to: { name: 'Bern' }, startTime: '2026-09-12T06:56:00Z', endTime: '2026-09-12T06:58:00Z' },
      { mode: 'REGIONAL_RAIL', from: { name: 'Bern' }, to: { name: 'Kandersteg' }, startTime: '2026-09-12T07:39:00Z', endTime: '2026-09-12T08:40:00Z', routeShortName: 'RE1', agencyName: 'BLS AG' },
    ],
  }],
}

function fetchMock(status: number, body: unknown) {
  return vi.fn(async (url: string, init?: RequestInit) => ({
    ok: status >= 200 && status < 300, status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    _url: url, _init: init,
  })) as unknown as typeof fetch
}

describe('planen', () => {
  it('baut die URL und setzt User-Agent und Cache', async () => {
    const f = fetchMock(200, antwort)
    const its = await planen({ von: 'a:1', nach: 'b:2', zeit: '2026-09-12T03:00:00Z', ankunftBis: false, anzahl: 5 }, f)
    expect(its).toHaveLength(1)
    expect(its[0].transfers).toBe(1)
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit & { next?: { revalidate: number } }][] } }).mock.calls[0]
    expect(url).toBe('https://api.transitous.org/api/v1/plan?fromPlace=a%3A1&toPlace=b%3A2&time=2026-09-12T03%3A00%3A00Z&arriveBy=false&numItineraries=5&language=de')
    expect((init.headers as Record<string, string>)['User-Agent']).toMatch(/dav-oepnv-touren/)
    expect(init.next?.revalidate).toBe(86400)
  })
  it('wirft TransitousFehler bei HTTP-Fehler', async () => {
    await expect(planen({ von: 'a', nach: 'b', zeit: '2026-09-12T03:00:00Z' }, fetchMock(503, { error: 'x' })))
      .rejects.toBeInstanceOf(TransitousFehler)
  })
  it('wirft TransitousFehler bei fehlendem itineraries-Feld', async () => {
    await expect(planen({ von: 'a', nach: 'b', zeit: '2026-09-12T03:00:00Z' }, fetchMock(200, { error: 'unknown feed id' })))
      .rejects.toBeInstanceOf(TransitousFehler)
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/verbindung/transitous.test.ts
```
Erwartet: FAIL.

- [ ] **Step 3: Implementieren**

`src/lib/verbindung/transitous.ts`:

```ts
export type Leg = {
  mode: string
  from: { name: string }
  to: { name: string }
  startTime: string
  endTime: string
  routeShortName?: string
  agencyName?: string
}

export type Itinerary = {
  startTime: string
  endTime: string
  duration: number
  transfers: number
  legs: Leg[]
}

export class TransitousFehler extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'TransitousFehler'
  }
}

const BASIS = process.env.TRANSITOUS_BASIS ?? 'https://api.transitous.org'
const USER_AGENT = process.env.TRANSITOUS_USER_AGENT ?? 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)'
const TIMEOUT_MS = 8000
const CACHE_SEKUNDEN = 86400

export type PlanParameter = {
  von: string
  nach: string
  /** UTC-ISO, z.B. 2026-09-12T03:00:00Z */
  zeit: string
  /** true: Ankunft spätestens `zeit`; false: Abfahrt frühestens `zeit` */
  ankunftBis?: boolean
  anzahl?: number
}

export async function planen(p: PlanParameter, fetchImpl: typeof fetch = fetch): Promise<Itinerary[]> {
  const q = new URLSearchParams({
    fromPlace: p.von,
    toPlace: p.nach,
    time: p.zeit,
    arriveBy: String(p.ankunftBis ?? false),
    numItineraries: String(p.anzahl ?? 10),
    language: 'de',
  })
  const url = `${BASIS}/api/v1/plan?${q.toString()}`
  let antwort: Response
  try {
    antwort = await fetchImpl(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: CACHE_SEKUNDEN },
    } as RequestInit)
  } catch (e) {
    throw new TransitousFehler(`Transitous nicht erreichbar: ${(e as Error).message}`)
  }
  if (!antwort.ok) throw new TransitousFehler(`Transitous HTTP ${antwort.status}`, antwort.status)
  const daten = (await antwort.json()) as { itineraries?: Itinerary[]; error?: string }
  if (!Array.isArray(daten.itineraries)) throw new TransitousFehler(`Transitous: ${daten.error ?? 'keine itineraries'}`)
  return daten.itineraries
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/lib/verbindung/transitous.test.ts
```
Erwartet: PASS, 3 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/verbindung/transitous.ts tests/lib/verbindung/transitous.test.ts
git commit -m "feat: Transitous-Client mit User-Agent, Timeout und Fetch-Cache"
```

---

### Task 7: Itineraries auswerten

**Files:**
- Create: `src/lib/verbindung/auswerten.ts`
- Create: `tests/fixtures/itineraries-kandersteg.json`
- Test: `tests/lib/verbindung/auswerten.test.ts`

- [ ] **Step 1: Fixture anlegen**

`tests/fixtures/itineraries-kandersteg.json` (Hinfahrten Sa 12.09.2026, Zeiten UTC, Sommerzeit +2):

```json
[
  { "startTime": "2026-09-12T02:40:00Z", "endTime": "2026-09-12T07:10:00Z", "duration": 16200, "transfers": 3,
    "legs": [
      { "mode": "REGIONAL_RAIL", "from": { "name": "Offenburg" }, "to": { "name": "Basel Bad Bf" }, "startTime": "2026-09-12T02:40:00Z", "endTime": "2026-09-12T04:05:00Z", "routeShortName": "RE7" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Basel SBB" }, "to": { "name": "Bern" }, "startTime": "2026-09-12T04:34:00Z", "endTime": "2026-09-12T05:30:00Z", "routeShortName": "IC61" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Bern" }, "to": { "name": "Kandersteg" }, "startTime": "2026-09-12T06:09:00Z", "endTime": "2026-09-12T07:10:00Z", "routeShortName": "RE1" }
    ] },
  { "startTime": "2026-09-12T04:30:00Z", "endTime": "2026-09-12T08:40:00Z", "duration": 15000, "transfers": 1,
    "legs": [
      { "mode": "HIGHSPEED_RAIL", "from": { "name": "Offenburg" }, "to": { "name": "Bern" }, "startTime": "2026-09-12T04:30:00Z", "endTime": "2026-09-12T06:56:00Z", "routeShortName": "ICE 271", "agencyName": "DB Fernverkehr AG" },
      { "mode": "WALK", "from": { "name": "Bern" }, "to": { "name": "Bern" }, "startTime": "2026-09-12T06:56:00Z", "endTime": "2026-09-12T06:58:00Z" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Bern" }, "to": { "name": "Kandersteg" }, "startTime": "2026-09-12T07:39:00Z", "endTime": "2026-09-12T08:40:00Z", "routeShortName": "RE1", "agencyName": "BLS AG" }
    ] },
  { "startTime": "2026-09-12T05:12:00Z", "endTime": "2026-09-12T09:10:00Z", "duration": 14280, "transfers": 2,
    "legs": [
      { "mode": "REGIONAL_RAIL", "from": { "name": "Offenburg" }, "to": { "name": "Basel Bad Bf" }, "startTime": "2026-09-12T05:12:00Z", "endTime": "2026-09-12T06:35:00Z", "routeShortName": "RE7" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Basel SBB" }, "to": { "name": "Bern" }, "startTime": "2026-09-12T07:04:00Z", "endTime": "2026-09-12T08:00:00Z", "routeShortName": "IC61" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Bern" }, "to": { "name": "Kandersteg" }, "startTime": "2026-09-12T08:09:00Z", "endTime": "2026-09-12T09:10:00Z", "routeShortName": "RE1" }
    ] },
  { "startTime": "2026-09-12T06:30:00Z", "endTime": "2026-09-12T10:40:00Z", "duration": 15000, "transfers": 1,
    "legs": [
      { "mode": "HIGHSPEED_RAIL", "from": { "name": "Offenburg" }, "to": { "name": "Bern" }, "startTime": "2026-09-12T06:30:00Z", "endTime": "2026-09-12T08:56:00Z", "routeShortName": "ICE 273" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Bern" }, "to": { "name": "Kandersteg" }, "startTime": "2026-09-12T09:39:00Z", "endTime": "2026-09-12T10:40:00Z", "routeShortName": "RE1" }
    ] },
  { "startTime": "2026-09-12T07:30:00Z", "endTime": "2026-09-12T11:40:00Z", "duration": 15000, "transfers": 1,
    "legs": [
      { "mode": "HIGHSPEED_RAIL", "from": { "name": "Offenburg" }, "to": { "name": "Bern" }, "startTime": "2026-09-12T07:30:00Z", "endTime": "2026-09-12T09:56:00Z", "routeShortName": "ICE 275" },
      { "mode": "REGIONAL_RAIL", "from": { "name": "Bern" }, "to": { "name": "Kandersteg" }, "startTime": "2026-09-12T10:39:00Z", "endTime": "2026-09-12T11:40:00Z", "routeShortName": "RE1" }
    ] }
]
```

Lokal: Abfahrten 04:40, 06:30, 07:12, 08:30, 09:30. Ankünfte 09:10, 10:40, 11:10, 12:40, 13:40.

- [ ] **Step 2: Failing Test schreiben**

`tests/lib/verbindung/auswerten.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { waehleHinfahrt, waehleRueckfahrt, hatFernverkehr, abschnitte, kurzfassung } from '@/lib/verbindung/auswerten'
import type { Itinerary } from '@/lib/verbindung/transitous'

const its = fixture as Itinerary[]

describe('waehleHinfahrt', () => {
  it('früheste Ankunft mit Abfahrt zwischen 5:00 und 8:00, plus spätere Alternative 8:00 bis 9:00', () => {
    const w = waehleHinfahrt(its)
    expect(w.hinfahrt?.startTime).toBe('2026-09-12T04:30:00Z') // 06:30 lokal
    expect(w.hinfahrtSpaeter?.startTime).toBe('2026-09-12T06:30:00Z') // 08:30 lokal
  })
  it('ignoriert Abfahrten vor 5:00', () => {
    const w = waehleHinfahrt(its)
    expect(w.hinfahrt?.startTime).not.toBe('2026-09-12T02:40:00Z')
  })
  it('bevorzugt bei gleicher Ankunft weniger Umstiege', () => {
    const a = { ...its[1], transfers: 3 }
    const b = { ...its[1], transfers: 0 }
    expect(waehleHinfahrt([a, b]).hinfahrt).toBe(b)
  })
  it('liefert undefined, wenn nichts im Fenster liegt', () => {
    expect(waehleHinfahrt([its[0]]).hinfahrt).toBeUndefined()
  })
})

describe('waehleRueckfahrt', () => {
  const rueck: Itinerary[] = [
    { startTime: '2026-09-13T14:14:00Z', endTime: '2026-09-13T17:56:00Z', duration: 1, transfers: 2, legs: [] },
    { startTime: '2026-09-13T16:14:00Z', endTime: '2026-09-13T20:38:00Z', duration: 1, transfers: 2, legs: [] },
    { startTime: '2026-09-13T17:14:00Z', endTime: '2026-09-13T22:10:00Z', duration: 1, transfers: 2, legs: [] }, // 00:10 Folgetag lokal
  ]
  it('späteste Abfahrt mit Ankunft am selben lokalen Tag bis 23:00', () => {
    expect(waehleRueckfahrt(rueck, '2026-09-13')?.startTime).toBe('2026-09-13T16:14:00Z')
  })
  it('undefined ohne passende', () => {
    expect(waehleRueckfahrt([rueck[2]], '2026-09-13')).toBeUndefined()
  })
})

describe('hatFernverkehr', () => {
  it('erkennt HIGHSPEED_RAIL', () => {
    expect(hatFernverkehr(its[1])).toBe(true)
    expect(hatFernverkehr(its[0])).toBe(false)
  })
})

describe('abschnitte', () => {
  it('lässt kurze Fußwege weg und formatiert lokal', () => {
    const a = abschnitte(its[1])
    expect(a).toEqual([
      { modus: 'zug', linie: 'ICE 271', von: 'Offenburg', nach: 'Bern', ab: '06:30', an: '08:56' },
      { modus: 'zug', linie: 'RE1', von: 'Bern', nach: 'Kandersteg', ab: '09:39', an: '10:40' },
    ])
  })
})

describe('kurzfassung', () => {
  it('fasst Zeiten, Dauer, Umstiege und Abschnitte zusammen', () => {
    const k = kurzfassung(its[1])
    expect(k).toMatchObject({ ab: '2026-09-12T04:30:00Z', an: '2026-09-12T08:40:00Z', dauerMin: 250, umstiege: 1 })
    expect(k.abschnitte).toHaveLength(2)
  })
})
```

- [ ] **Step 3: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/verbindung/auswerten.test.ts
```
Erwartet: FAIL.

- [ ] **Step 4: Implementieren**

`src/lib/verbindung/auswerten.ts`:

```ts
import { lokaleMinuten, lokaleUhrzeit, lokalesDatum } from '@/lib/datum'
import type { Itinerary, Leg } from './transitous'

export const HINFAHRT_FENSTER = { fruehVon: 5 * 60, fruehBis: 8 * 60, spaetBis: 9 * 60 } as const
export const RUECKFAHRT_ANKUNFT_BIS = 23 * 60

const FERNVERKEHR = new Set(['HIGHSPEED_RAIL', 'LONG_DISTANCE'])
const MIN_FUSSWEG_SEKUNDEN = 300

export type Modus = 'zug' | 'bus' | 'seilbahn' | 'schiff' | 'fuss' | 'sonstig'

export type Abschnitt = { modus: Modus; linie: string; von: string; nach: string; ab: string; an: string }

export type VerbindungKurz = {
  ab: string
  an: string
  dauerMin: number
  umstiege: number
  fernverkehr: boolean
  abschnitte: Abschnitt[]
}

function fruehesteAnkunft(kandidaten: Itinerary[]): Itinerary | undefined {
  return [...kandidaten].sort((a, b) =>
    Date.parse(a.endTime) - Date.parse(b.endTime) || a.transfers - b.transfers,
  )[0]
}

export function waehleHinfahrt(its: Itinerary[]): { hinfahrt?: Itinerary; hinfahrtSpaeter?: Itinerary } {
  const { fruehVon, fruehBis, spaetBis } = HINFAHRT_FENSTER
  const frueh = its.filter((i) => { const m = lokaleMinuten(i.startTime); return m >= fruehVon && m < fruehBis })
  const spaet = its.filter((i) => { const m = lokaleMinuten(i.startTime); return m >= fruehBis && m < spaetBis })
  return { hinfahrt: fruehesteAnkunft(frueh), hinfahrtSpaeter: fruehesteAnkunft(spaet) }
}

/** Späteste Abfahrt, deren Ankunft am gegebenen lokalen Tag vor 23:00 liegt. */
export function waehleRueckfahrt(its: Itinerary[], datum: string): Itinerary | undefined {
  const passend = its.filter((i) => lokalesDatum(i.endTime) === datum && lokaleMinuten(i.endTime) <= RUECKFAHRT_ANKUNFT_BIS)
  return [...passend].sort((a, b) =>
    Date.parse(b.startTime) - Date.parse(a.startTime) || a.transfers - b.transfers,
  )[0]
}

export function hatFernverkehr(it: Itinerary): boolean {
  return it.legs.some((l) => FERNVERKEHR.has(l.mode))
}

function modusFuer(mode: string): Modus {
  if (mode === 'WALK') return 'fuss'
  if (mode === 'BUS' || mode === 'COACH') return 'bus'
  if (mode === 'FERRY') return 'schiff'
  if (mode === 'GONDOLA' || mode === 'FUNICULAR' || mode === 'AERIAL_LIFT' || mode === 'CABLE_CAR') return 'seilbahn'
  if (mode.includes('RAIL') || mode === 'TRAM' || mode === 'SUBWAY' || mode === 'METRO') return 'zug'
  return 'sonstig'
}

function dauerSekunden(l: Leg): number {
  return (Date.parse(l.endTime) - Date.parse(l.startTime)) / 1000
}

export function abschnitte(it: Itinerary): Abschnitt[] {
  return it.legs
    .filter((l) => l.mode !== 'WALK' || dauerSekunden(l) >= MIN_FUSSWEG_SEKUNDEN)
    .map((l) => ({
      modus: modusFuer(l.mode),
      linie: l.routeShortName ?? (l.mode === 'WALK' ? 'Fußweg' : l.mode),
      von: l.from.name,
      nach: l.to.name,
      ab: lokaleUhrzeit(l.startTime),
      an: lokaleUhrzeit(l.endTime),
    }))
}

export function kurzfassung(it: Itinerary): VerbindungKurz {
  return {
    ab: it.startTime,
    an: it.endTime,
    dauerMin: Math.round((Date.parse(it.endTime) - Date.parse(it.startTime)) / 60_000),
    umstiege: it.transfers,
    fernverkehr: hatFernverkehr(it),
    abschnitte: abschnitte(it),
  }
}
```

- [ ] **Step 5: Test laufen lassen**

```bash
npx vitest run tests/lib/verbindung/auswerten.test.ts
```
Erwartet: PASS, 9 Tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/verbindung/auswerten.ts tests/lib/verbindung/auswerten.test.ts tests/fixtures/itineraries-kandersteg.json
git commit -m "feat: Hinfahrt/Rückfahrt aus Itineraries wählen, Abschnitte formatieren"
```

---

### Task 8: Verbindungsdienst mit Fallback

**Files:**
- Create: `src/lib/verbindung/service.ts`
- Test: `tests/lib/verbindung/service.test.ts`

- [ ] **Step 1: Failing Test schreiben**

`tests/lib/verbindung/service.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import fixture from '../../fixtures/itineraries-kandersteg.json'
import { verbindungErmitteln } from '@/lib/verbindung/service'
import { TransitousFehler, type Itinerary } from '@/lib/verbindung/transitous'
import type { Startort, Haltestelle, TicketTabelle } from '@/lib/content/schema'

const startort: Startort = { id: 'offenburg', name: 'Offenburg', haltestelleId: 'de:og', lat: 48.4, lon: 7.9, sichtbar: true }
const haltestelle: Haltestelle = {
  id: 'kandersteg', name: 'Kandersteg', haltestelleId: 'ch:ka', lat: 46.4, lon: 7.6, land: 'CH', region: 'BO',
  richtwerte: { offenburg: { fahrzeitMin: 250, umstiege: 2, takt: 'stuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' } },
}
const tickets: TicketTabelle = {
  regeln: [{ land: 'CH', ticket: 'halbtax', hinweis: 'CH' }, { land: 'DE', ticket: 'deutschlandticket', hinweis: 'DE' }],
  fernverkehrHinweis: 'Fern',
}
const hin = fixture as Itinerary[]
const rueck: Itinerary[] = [
  { startTime: '2026-09-12T14:14:00Z', endTime: '2026-09-12T17:56:00Z', duration: 1, transfers: 2, legs: [] },
  { startTime: '2026-09-12T16:14:00Z', endTime: '2026-09-12T20:38:00Z', duration: 1, transfers: 2, legs: [] },
]

describe('verbindungErmitteln', () => {
  it('liefert live Hinfahrt, Rückfahrt, Tourenfenster und Tagesziel', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('live')
    expect(a.hinfahrt?.ab).toBe('2026-09-12T04:30:00Z')
    expect(a.rueckfahrt?.ab).toBe('2026-09-12T16:14:00Z')
    expect(a.tourenfensterMin).toBe(454) // 10:40 bis 18:14
    expect(a.tagesziel).toBe(false) // Ankunft 10:40 ist nach 10:00
    expect(a.ticket).toEqual({ ticket: 'halbtax', hinweis: 'CH' })
    // Hinfahrt: Abfahrt ab 03:00Z; Rückfahrt: Ankunft bis 23:00 lokal = 21:00Z
    expect(planen.mock.calls[0][0]).toMatchObject({ von: 'de:og', nach: 'ch:ka', zeit: '2026-09-12T03:00:00Z', ankunftBis: false })
    expect(planen.mock.calls[1][0]).toMatchObject({ von: 'ch:ka', nach: 'de:og', zeit: '2026-09-12T21:00:00Z', ankunftBis: true })
  })

  it('fragt Rückfahrt am Folgetag ab und setzt kein Tagesziel-Urteil', async () => {
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck.map((r) => ({ ...r, startTime: r.startTime.replace('12T', '13T'), endTime: r.endTime.replace('12T', '13T') })) : hin))
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrt: 'folgetag', mindestFensterMin: 360, tickets }, { planen })
    expect(planen.mock.calls[1][0]).toMatchObject({ zeit: '2026-09-13T21:00:00Z' })
    expect(a.rueckfahrt?.ab).toBe('2026-09-13T16:14:00Z')
    expect(a.tagesziel).toBeUndefined()
    expect(a.tourenfensterMin).toBeUndefined()
  })

  it('fällt auf den Richtwert zurück, wenn Transitous fehlschlägt', async () => {
    const planen = vi.fn(async () => { throw new TransitousFehler('503', 503) })
    const a = await verbindungErmitteln({ startort, haltestelle, datum: '2026-09-12', rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets }, { planen })
    expect(a.quelle).toBe('richtwert')
    expect(a.richtwert?.fahrzeitMin).toBe(250)
    expect(a.hinfahrt).toBeUndefined()
    expect(a.ticket.ticket).toBe('halbtax')
  })

  it('Fernverkehr in DE ergibt Ticket keins', async () => {
    const de: Haltestelle = { ...haltestelle, land: 'DE' }
    const planen = vi.fn(async (p: { ankunftBis?: boolean }) => (p.ankunftBis ? rueck : hin))
    const a = await verbindungErmitteln({ startort, haltestelle: de, datum: '2026-09-12', rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets }, { planen })
    expect(a.ticket).toEqual({ ticket: 'keins', hinweis: 'Fern' })
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/verbindung/service.test.ts
```
Erwartet: FAIL.

- [ ] **Step 3: Implementieren**

`src/lib/verbindung/service.ts`:

```ts
import type { Startort, Haltestelle, TicketTabelle, Richtwert } from '@/lib/content/schema'
import { folgetag, lokaleMinuten, zuUtcIso } from '@/lib/datum'
import { planen as planenStandard, type Itinerary, type PlanParameter } from './transitous'
import { waehleHinfahrt, waehleRueckfahrt, kurzfassung, RUECKFAHRT_ANKUNFT_BIS, type VerbindungKurz } from './auswerten'
import { istTagesziel, ticketFuer, tourenfensterMin, type TicketHinweis } from './regeln'

export type Rueckfahrtart = 'gleicher-tag' | 'folgetag'

export type VerbindungAntwort = {
  quelle: 'live' | 'richtwert'
  datum: string
  rueckfahrtDatum: string
  hinfahrt?: VerbindungKurz
  hinfahrtSpaeter?: VerbindungKurz
  rueckfahrt?: VerbindungKurz
  tourenfensterMin?: number
  tagesziel?: boolean
  ticket: TicketHinweis
  richtwert?: Richtwert
  fehler?: string
}

export type VerbindungAnfrage = {
  startort: Startort
  haltestelle: Haltestelle
  datum: string
  rueckfahrt: Rueckfahrtart
  mindestFensterMin: number
  tickets: TicketTabelle
}

type Abhaengigkeiten = { planen: (p: PlanParameter) => Promise<Itinerary[]> }

const HINFAHRT_START_UTC = '03:00' // 05:00 CEST bzw. 04:00 CET, Fenster wird lokal gefiltert

export async function verbindungErmitteln(
  a: VerbindungAnfrage,
  deps: Abhaengigkeiten = { planen: planenStandard },
): Promise<VerbindungAntwort> {
  const rueckfahrtDatum = a.rueckfahrt === 'folgetag' ? folgetag(a.datum) : a.datum
  const richtwert = a.haltestelle.richtwerte[a.startort.id]
  const basis = { datum: a.datum, rueckfahrtDatum, richtwert }

  let hinIts: Itinerary[]
  let rueckIts: Itinerary[]
  try {
    ;[hinIts, rueckIts] = await Promise.all([
      deps.planen({ von: a.startort.haltestelleId, nach: a.haltestelle.haltestelleId, zeit: `${a.datum}T${HINFAHRT_START_UTC}:00Z`, ankunftBis: false, anzahl: 10 }),
      deps.planen({ von: a.haltestelle.haltestelleId, nach: a.startort.haltestelleId, zeit: zuUtcIso(rueckfahrtDatum, RUECKFAHRT_ANKUNFT_BIS), ankunftBis: true, anzahl: 6 }),
    ])
  } catch (e) {
    return {
      ...basis,
      quelle: 'richtwert',
      ticket: ticketFuer(a.haltestelle.land, false, a.tickets),
      fehler: (e as Error).message,
    }
  }

  const { hinfahrt, hinfahrtSpaeter } = waehleHinfahrt(hinIts)
  const rueckfahrt = waehleRueckfahrt(rueckIts, rueckfahrtDatum)
  const antwort: VerbindungAntwort = {
    ...basis,
    quelle: 'live',
    hinfahrt: hinfahrt && kurzfassung(hinfahrt),
    hinfahrtSpaeter: hinfahrtSpaeter && kurzfassung(hinfahrtSpaeter),
    rueckfahrt: rueckfahrt && kurzfassung(rueckfahrt),
    ticket: ticketFuer(a.haltestelle.land, hinfahrt ? antwortFernverkehr(hinfahrt) : false, a.tickets),
  }

  if (a.rueckfahrt === 'gleicher-tag' && hinfahrt && rueckfahrt) {
    const fenster = tourenfensterMin(hinfahrt.endTime, rueckfahrt.startTime)
    antwort.tourenfensterMin = fenster
    antwort.tagesziel = istTagesziel(
      { ankunftMin: lokaleMinuten(hinfahrt.endTime), rueckfahrtMin: lokaleMinuten(rueckfahrt.startTime), tourenfensterMin: fenster },
      a.mindestFensterMin,
    )
  }
  return antwort
}

function antwortFernverkehr(it: Itinerary): boolean {
  return kurzfassung(it).fernverkehr
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/lib/verbindung/service.test.ts
```
Erwartet: PASS, 4 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/verbindung/service.ts tests/lib/verbindung/service.test.ts
git commit -m "feat: Verbindungsdienst mit Hin-/Rückfahrt, Tagesziel und Richtwert-Fallback"
```

---

### Task 9: API-Routen

**Files:**
- Create: `src/app/api/verbindung/route.ts`
- Create: `src/app/api/uebersicht/route.ts`
- Create: `src/lib/verbindung/parameter.ts`
- Test: `tests/app/api/verbindung.test.ts`

- [ ] **Step 1: Failing Test schreiben**

`tests/app/api/verbindung.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'

describe('parseVerbindungParameter', () => {
  it('liest gültige Parameter mit Standardwerten', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12'))
    expect(p).toEqual({ ok: true, wert: { von: 'offenburg', nach: 'kandersteg', datum: '2026-09-12', rueckfahrt: 'gleicher-tag', fenster: 360 } })
  })
  it('akzeptiert folgetag und fenster', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&rueckfahrt=folgetag&fenster=240'))
    expect(p.ok && p.wert.rueckfahrt).toBe('folgetag')
    expect(p.ok && p.wert.fenster).toBe(240)
  })
  it('lehnt falsches Datum ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=12.09.2026'))
    expect(p.ok).toBe(false)
  })
  it('lehnt Fenster außerhalb 60 bis 720 ab', () => {
    const p = parseVerbindungParameter(new URLSearchParams('von=offenburg&nach=kandersteg&datum=2026-09-12&fenster=10'))
    expect(p.ok).toBe(false)
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/app/api/verbindung.test.ts
```
Erwartet: FAIL.

- [ ] **Step 3: Parameter-Parser implementieren**

`src/lib/verbindung/parameter.ts`:

```ts
import { z } from 'zod'

const Schema = z.object({
  von: z.string().regex(/^[a-z0-9-]+$/),
  nach: z.string().regex(/^[a-z0-9-]+$/),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rueckfahrt: z.enum(['gleicher-tag', 'folgetag']).default('gleicher-tag'),
  fenster: z.coerce.number().int().min(60).max(720).default(360),
})

export type VerbindungParameter = z.infer<typeof Schema>

export function parseVerbindungParameter(q: URLSearchParams):
  { ok: true; wert: VerbindungParameter } | { ok: false; fehler: string } {
  const roh: Record<string, string> = {}
  for (const k of ['von', 'nach', 'datum', 'rueckfahrt', 'fenster']) {
    const v = q.get(k)
    if (v !== null) roh[k] = v
  }
  const r = Schema.safeParse(roh)
  if (!r.success) return { ok: false, fehler: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
  return { ok: true, wert: r.data }
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/app/api/verbindung.test.ts
```
Erwartet: PASS, 4 Tests.

- [ ] **Step 5: Routen implementieren**

`src/app/api/verbindung/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln } from '@/lib/verbindung/service'

export async function GET(req: Request) {
  const p = parseVerbindungParameter(new URL(req.url).searchParams)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  const haltestelle = findeHaltestelle(i, p.wert.nach)
  if (!startort || !haltestelle) return NextResponse.json({ fehler: 'Startort oder Haltestelle unbekannt' }, { status: 404 })
  const antwort = await verbindungErmitteln({
    startort, haltestelle, datum: p.wert.datum, rueckfahrt: p.wert.rueckfahrt,
    mindestFensterMin: p.wert.fenster, tickets: i.tickets,
  })
  return NextResponse.json(antwort, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
```

`src/app/api/uebersicht/route.ts` (Hauptzugang aller Gebiete, für Startseite und Filter "Tagesziel"):

```ts
import { NextResponse } from 'next/server'
import { inhalt, findeStartort, findeHaltestelle } from '@/lib/content/laden'
import { parseVerbindungParameter } from '@/lib/verbindung/parameter'
import { verbindungErmitteln, type VerbindungAntwort } from '@/lib/verbindung/service'

const PARALLEL = 4

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  q.set('nach', 'alle')
  const p = parseVerbindungParameter(q)
  if (!p.ok) return NextResponse.json({ fehler: p.fehler }, { status: 400 })
  const i = inhalt()
  const startort = findeStartort(i, p.wert.von)
  if (!startort) return NextResponse.json({ fehler: 'Startort unbekannt' }, { status: 404 })

  const ergebnis: Record<string, VerbindungAntwort> = {}
  const warteschlange = [...i.gebiete]
  async function arbeiter() {
    for (let g = warteschlange.shift(); g; g = warteschlange.shift()) {
      const haltestelle = findeHaltestelle(i, g.haltestellen[0])
      if (!haltestelle) continue
      ergebnis[g.id] = await verbindungErmitteln({
        startort, haltestelle, datum: p.wert.datum, rueckfahrt: 'gleicher-tag',
        mindestFensterMin: p.wert.fenster, tickets: i.tickets,
      })
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, arbeiter))
  return NextResponse.json(ergebnis, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
```

- [ ] **Step 6: Manuell gegen die echte API prüfen**

```bash
npm run dev &
sleep 5
curl -s "http://localhost:3000/api/verbindung?von=offenburg&nach=kandersteg&datum=$(date -v+sat +%F 2>/dev/null || date -d 'next saturday' +%F)" | head -c 600; echo
curl -s "http://localhost:3000/api/verbindung?von=offenburg&nach=x&datum=2026-09-12"; echo
kill %1
```
Erwartet: erste Antwort mit `"quelle":"live"` und `hinfahrt`; zweite `{"fehler":"Startort oder Haltestelle unbekannt"}`.

- [ ] **Step 7: Commit**

```bash
git add src/app/api src/lib/verbindung/parameter.ts tests/app
git commit -m "feat: API-Routen /api/verbindung und /api/uebersicht"
```

---

### Task 10: CO2-Rechnung

**Files:**
- Create: `src/lib/co2.ts`
- Test: `tests/lib/co2.test.ts`

- [ ] **Step 1: Failing Test schreiben**

`tests/lib/co2.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { co2ErsparnisKg } from '@/lib/co2'

const faktoren = { pkwGrammProFahrzeugKm: 230, personenProPkw: 2.5, bahnGrammProPersonenKm: 45 }

describe('co2ErsparnisKg', () => {
  it('rechnet Hin- und Rückfahrt pro Person und rundet auf 5 kg', () => {
    // Auto: 280 km * 2 * 230 g / 2.5 = 51.52 kg; Bahn: 300 km * 2 * 45 g = 27 kg; Differenz 24.52 -> 25
    expect(co2ErsparnisKg({ strassenKm: 280, bahnKm: 300 }, faktoren)).toBe(25)
  })
  it('liefert undefined ohne Straßendistanz', () => {
    expect(co2ErsparnisKg({ bahnKm: 300 }, faktoren)).toBeUndefined()
  })
  it('nimmt Bahndistanz = Straßendistanz an, wenn sie fehlt', () => {
    // 280*2*230/2.5 = 51.52; 280*2*45 = 25.2; Differenz 26.32 -> 25
    expect(co2ErsparnisKg({ strassenKm: 280 }, faktoren)).toBe(25)
  })
  it('nie negativ', () => {
    expect(co2ErsparnisKg({ strassenKm: 10, bahnKm: 400 }, faktoren)).toBe(0)
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehler erwarten**

```bash
npx vitest run tests/lib/co2.test.ts
```

- [ ] **Step 3: Implementieren**

`src/lib/co2.ts`:

```ts
export type Co2Faktoren = { pkwGrammProFahrzeugKm: number; personenProPkw: number; bahnGrammProPersonenKm: number }

/** Ersparnis Bahn gegenüber Auto, Hin- und Rückfahrt, pro Person, in kg, auf 5 kg gerundet. */
export function co2ErsparnisKg(d: { strassenKm?: number; bahnKm?: number }, f: Co2Faktoren): number | undefined {
  if (!d.strassenKm) return undefined
  const bahnKm = d.bahnKm ?? d.strassenKm
  const autoGramm = (d.strassenKm * 2 * f.pkwGrammProFahrzeugKm) / f.personenProPkw
  const bahnGramm = bahnKm * 2 * f.bahnGrammProPersonenKm
  const kg = Math.max(0, (autoGramm - bahnGramm) / 1000)
  return Math.round(kg / 5) * 5
}
```

- [ ] **Step 4: Test laufen lassen**

```bash
npx vitest run tests/lib/co2.test.ts
```
Erwartet: PASS, 4 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/co2.ts tests/lib/co2.test.ts
git commit -m "feat: CO2-Ersparnis pro Person"
```

---

### Task 11: Design System (mobile first)

**Files:**
- Create: `docs/design-system.md`
- Modify: `src/app/globals.css` (ersetzen)

Kein Test, aber Build muss durchlaufen.

- [ ] **Step 1: Design-System-Dokument schreiben**

`docs/design-system.md`:

```markdown
# Design System

Ziel: Auf dem Handy am Samstagmorgen in 30 Sekunden zur Antwort. Ruhig, lesbar, ohne Outdoor-Kitsch.
Eine Farbe trägt Bedeutung, sonst Grau- und Papiertöne.

## Grundsätze

1. **Mobile first.** Alles wird für 360 px Breite entworfen und wächst ab 640 px (sm) und 1024 px (lg).
   Auf dem Handy ist die Liste der Normalfall, die Karte ein Knopf. Ab lg stehen Liste und Karte nebeneinander.
2. **Eine Spalte, klare Reihenfolge.** Versprechen, Suche, Datum, Filter, Ergebnisse. Keine Sidebar auf dem Handy.
3. **Berührbar.** Jedes Bedienelement mindestens 44 px hoch. Chips 36 px mit 8 px Abstand. Keine Hover-only-Funktionen.
4. **Farbe heißt etwas.** Grün bis Orange ist Reisezeit. Signalfarbe nur für Handlungen und das Tagesziel-Urteil.
   Betreiberfarben (DAV, SAC) nur als kleines Symbol, nie als Fläche.
5. **Zahlen zuerst.** Fahrzeit, Umstiege, Tourenfenster stehen fett am Anfang der Zeile. Prosa danach.
6. **Wartezustände sind ehrlich.** Skeleton beim Laden, klarer Hinweis beim Richtwert-Fallback, nie leere Fläche.

## Farben (Tokens in globals.css)

| Token | Wert | Verwendung |
|---|---|---|
| papier | #f7f6f2 | Seitenhintergrund |
| karte | #ffffff | Karten (Cards), Eingaben |
| nebel | #e8e6df | Skeleton, Trennflächen |
| linie | #d5d2c8 | Rahmen, Trennlinien |
| tinte | #1b1f1c | Text |
| tinte-2 | #4a5049 | Sekundärtext |
| tinte-3 | #7a8078 | Hinweise, Meta |
| tanne | #1f4d3a | Primärfarbe, Buttons, Links |
| tanne-hell | #2f6b52 | Hover, aktive Chips |
| tanne-tint | #e3efe8 | Hintergrund aktiver Chips, Erfolg |
| signal | #d9531e | Tagesziel-Badge, wichtiger Hinweis |
| signal-tint | #fbe9e0 | Hintergrund Warnhinweis |
| stufe-2 … stufe-5 | #2f6b52, #7fa85a, #d9a441, #c86b2f | Reisezeit bis 2/3/4/5 h, Karte und Badge |
| dav / sac | #2f6b52 / #c8102e | Betreiber-Symbol |

## Typografie

Geist Sans (self-hosted über next/font), Fallback system-ui. Basis 16 px, Zeilenhöhe 1.5.

| Stil | Größe | Gewicht | Verwendung |
|---|---|---|---|
| titel | 28 px / lg 36 px | 600 | Seitentitel |
| h2 | 22 px | 600 | Abschnitte |
| h3 | 18 px | 600 | Kartentitel |
| text | 16 px | 400 | Fließtext |
| meta | 14 px | 400 | Hinweise, Badges |
| zahl | 18 px | 600, tabular-nums | Fahrzeit, Uhrzeiten |

## Abstände und Formen

4-px-Raster. Seitenrand 16 px, ab sm 24 px. Kartenabstand 12 px. Karten-Radius 14 px, Buttons und Chips 10 px.
Schatten nur eine Stufe: `0 1px 2px rgb(0 0 0 / 0.06)`.

## Bausteine

- **Chip**: 36 px hoch, Rahmen linie, aktiv tanne-tint mit tanne-Text. Mehrfachwahl bei Sportart, Einfachwahl bei Art und Fahrzeit.
- **Segment**: Zweier- oder Dreier-Umschalter (Tagestour / Übernachtung / alle), volle Breite auf dem Handy.
- **Karte (Card)**: weiß, Radius 14, 16 px Innenabstand, Titel + Meta-Zeile + Verbindungszeile. Ganze Karte ist Link.
- **Badge**: 24 px hoch, Radius 999. Varianten: stufe (Reisezeit), tagesziel (signal), ticket (nebel), betreiber (Symbol + Text).
- **Verbindungszeile**: eine Zeile fett mit Zahlen, darunter Meta. Aufklappbar zu Abschnitten.
- **Datum**: natives `input type=date` in Karte-Weiß, daneben Chips "Sa" und "So" für das kommende Wochenende.
- **Kartenknopf**: auf dem Handy fest unten mittig (`fixed bottom-4`), 48 px hoch, tanne mit weißem Text.
- **Skeleton**: nebel-Fläche mit `animate-pulse`, gleiche Höhe wie die spätere Zeile.

## Verhalten

- Zustand (Datum, Filter, Suche) lebt in der URL. Zurück-Taste und Teilen funktionieren.
- Live-Daten laden nach dem Rendern. Die Seite ist ohne JavaScript lesbar, nur ohne Uhrzeiten.
- Fokus sichtbar (2 px tanne-Ring). Kontraste mindestens 4.5:1 für Text.
```

- [ ] **Step 2: Tokens in globals.css**

`src/app/globals.css` (komplett ersetzen):

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;

  --color-papier: #f7f6f2;
  --color-karte: #ffffff;
  --color-nebel: #e8e6df;
  --color-linie: #d5d2c8;
  --color-tinte: #1b1f1c;
  --color-tinte-2: #4a5049;
  --color-tinte-3: #7a8078;
  --color-tanne: #1f4d3a;
  --color-tanne-hell: #2f6b52;
  --color-tanne-tint: #e3efe8;
  --color-signal: #d9531e;
  --color-signal-tint: #fbe9e0;
  --color-stufe-2: #2f6b52;
  --color-stufe-3: #7fa85a;
  --color-stufe-4: #d9a441;
  --color-stufe-5: #c86b2f;
  --color-dav: #2f6b52;
  --color-sac: #c8102e;

  --radius-karte: 14px;
  --radius-knopf: 10px;
  --shadow-karte: 0 1px 2px rgb(0 0 0 / 0.06);
}

@layer base {
  html { color-scheme: light; }
  body { @apply bg-papier text-tinte antialiased; }
  a { @apply underline-offset-2; }
  :focus-visible { @apply outline-none ring-2 ring-tanne ring-offset-2 ring-offset-papier; }
  input[type="date"] { @apply min-h-11; }
}

@layer components {
  .chip {
    @apply inline-flex h-9 items-center gap-1 rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-sm text-tinte-2 transition-colors;
  }
  .chip-aktiv { @apply border-tanne bg-tanne-tint text-tanne font-medium; }
  .karte-card { @apply block rounded-[var(--radius-karte)] bg-karte p-4 shadow-[var(--shadow-karte)]; }
  .badge { @apply inline-flex h-6 items-center rounded-full px-2 text-xs font-medium; }
  .knopf { @apply inline-flex min-h-11 items-center justify-center rounded-[var(--radius-knopf)] bg-tanne px-4 font-medium text-white hover:bg-tanne-hell; }
  .knopf-sekundaer { @apply inline-flex min-h-11 items-center justify-center rounded-[var(--radius-knopf)] border border-linie bg-karte px-4 font-medium text-tinte hover:border-tanne; }
  .zahl { @apply font-semibold tabular-nums; }
  .skeleton { @apply animate-pulse rounded bg-nebel; }
}
```

- [ ] **Step 3: Build prüfen und committen**

```bash
npm run build
git add docs/design-system.md src/app/globals.css
git commit -m "feat: Design System mit Tokens, mobile first"
```

---

### Task 12: Layout, Seiten und Verbindungszeile

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/page.tsx` (vorläufig), Delete: `src/app/page.module.css` falls vorhanden
- Create: `src/app/gebiet/[id]/page.tsx`, `src/app/huette/[id]/page.tsx`, `src/app/ueber/page.tsx`
- Create: `src/components/FehlerMelden.tsx`, `src/components/VerbindungZeile.tsx`, `src/components/VerbindungDetail.tsx`, `src/components/HuetteKarte.tsx`, `src/components/Badges.tsx`, `src/components/Co2Zeile.tsx`
- Create: `src/lib/links.ts`
- Test: `tests/lib/links.test.ts`

- [ ] **Step 1: Failing Test für Fahrplan-Links**

`tests/lib/links.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { fahrplanLink, fehlerMeldenLink } from '@/lib/links'

describe('fahrplanLink', () => {
  it('CH-Ziel führt zur SBB', () => {
    expect(fahrplanLink('CH', 'Offenburg', 'Kandersteg', '2026-09-12'))
      .toBe('https://www.sbb.ch/de?von=Offenburg&nach=Kandersteg&datum=2026-09-12&zeit=06%3A00')
  })
  it('DE/FR/AT-Ziel führt zu bahn.de', () => {
    expect(fahrplanLink('DE', 'Offenburg', 'Feldberg-Bärental Bahnhof', '2026-09-12'))
      .toBe('https://www.bahn.de/buchung/fahrplan/suche#sts=true&so=Offenburg&zo=Feldberg-B%C3%A4rental%20Bahnhof&hd=2026-09-12T06%3A00%3A00')
  })
})

describe('fehlerMeldenLink', () => {
  it('mailto mit Betreff, wenn Adresse gesetzt', () => {
    expect(fehlerMeldenLink('Doldenhornhütte', 'ak@example.org')).toBe('mailto:ak@example.org?subject=Fehler%3A%20Doldenhornh%C3%BCtte')
  })
  it('GitHub-Issue ohne Adresse', () => {
    expect(fehlerMeldenLink('Doldenhornhütte', undefined)).toBe('https://github.com/Maxlemoar/dav-oepnv-touren/issues/new?title=Fehler%3A%20Doldenhornh%C3%BCtte')
  })
})
```

- [ ] **Step 2: links.ts implementieren**

`src/lib/links.ts`:

```ts
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
```

Hinweis: `URLSearchParams` kodiert Leerzeichen als `+`; für den bahn.de-Hash wird auf `%20` umgestellt, bei SBB bleibt `+` (wird dort korrekt gelesen). Für den Test oben: `Feldberg-Bärental Bahnhof` ergibt `Feldberg-B%C3%A4rental%20Bahnhof`.

```bash
npx vitest run tests/lib/links.test.ts
```
Erwartet: PASS, 4 Tests.

- [ ] **Step 3: Badges und FehlerMelden**

`src/components/Badges.tsx`:

```tsx
import { BETREIBER_LABEL, TICKET_LABEL, type BetreiberTyp, type Ticket } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'

export function reisezeitStufe(fahrzeitMin: number): 2 | 3 | 4 | 5 {
  if (fahrzeitMin <= 120) return 2
  if (fahrzeitMin <= 180) return 3
  if (fahrzeitMin <= 240) return 4
  return 5
}

const STUFE_KLASSE = { 2: 'bg-stufe-2', 3: 'bg-stufe-3', 4: 'bg-stufe-4', 5: 'bg-stufe-5' } as const

export function ReisezeitBadge({ fahrzeitMin, ca }: { fahrzeitMin: number; ca?: boolean }) {
  const s = reisezeitStufe(fahrzeitMin)
  return (
    <span className={`badge text-white ${STUFE_KLASSE[s]}`}>
      {ca ? 'ca. ' : ''}{minutenAlsDauer(fahrzeitMin)}
    </span>
  )
}

export function TageszielBadge({ tagesziel }: { tagesziel: boolean | undefined }) {
  if (tagesziel === undefined) return null
  return tagesziel
    ? <span className="badge bg-signal text-white">Tagesziel</span>
    : <span className="badge bg-nebel text-tinte-2">Besser mit Übernachtung</span>
}

export function TicketBadge({ ticket }: { ticket: Ticket }) {
  return <span className="badge bg-nebel text-tinte-2">{TICKET_LABEL[ticket]}</span>
}

const BETREIBER_PUNKT: Record<BetreiberTyp, string> = {
  dav: 'bg-dav', sac: 'bg-sac', oeav: 'bg-tinte-2', naturfreunde: 'bg-stufe-3', privat: 'bg-tinte-3',
}

export function BetreiberBadge({ typ, sektion }: { typ: BetreiberTyp; sektion?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-tinte-2">
      <span className={`inline-block size-2.5 rounded-full ${BETREIBER_PUNKT[typ]}`} aria-hidden />
      {BETREIBER_LABEL[typ]}{sektion ? ` ${sektion}` : ''}
    </span>
  )
}
```

`src/components/FehlerMelden.tsx`:

```tsx
'use client'
import { fehlerMeldenLink } from '@/lib/links'

export function FehlerMelden({ titel }: { titel: string }) {
  const href = fehlerMeldenLink(titel, process.env.NEXT_PUBLIC_FEHLER_MAIL)
  return (
    <a href={href} className="text-sm text-tinte-3 underline hover:text-tinte" target="_blank" rel="noreferrer">
      Fehler melden
    </a>
  )
}
```

- [ ] **Step 4: Layout**

`src/app/layout.tsx` (komplett ersetzen):

```tsx
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: { default: 'Ohne Auto in die Berge', template: '%s · Ohne Auto in die Berge' },
  description: 'Hütten und Tourengebiete, die von Offenburg aus mit Bahn und Bus erreichbar sind. Mit Live-Verbindung für dein Datum.',
}
export const viewport: Viewport = { themeColor: '#f7f6f2' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-dvh font-sans">
        <header className="sticky top-0 z-20 border-b border-linie bg-papier/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="font-semibold tracking-tight no-underline">Ohne Auto in die Berge</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/ueber" className="text-tinte-2 hover:text-tinte">Über</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-4 sm:px-6">{children}</main>
        <footer className="border-t border-linie px-4 py-8 text-center text-sm text-tinte-3">
          Arbeitskreis Klimaschutz · DAV Sektion Offenburg · <Link href="/ueber" className="underline">Datenquellen</Link>
        </footer>
      </body>
    </html>
  )
}
```

Falls `src/app/page.module.css` oder Bilder aus dem Scaffold existieren: löschen.

- [ ] **Step 5: VerbindungZeile und VerbindungDetail**

`src/components/VerbindungDetail.tsx`:

```tsx
import type { VerbindungKurz, Abschnitt } from '@/lib/verbindung/auswerten'

const MODUS_SYMBOL: Record<Abschnitt['modus'], string> = { zug: '🚆', bus: '🚌', seilbahn: '🚠', schiff: '⛴', fuss: '🚶', sonstig: '•' }

export function VerbindungDetail({ titel, v }: { titel: string; v: VerbindungKurz }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{titel}</div>
      <ol className="space-y-1 text-sm">
        {v.abschnitte.map((a, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr] gap-x-2">
            <span aria-hidden>{MODUS_SYMBOL[a.modus]}</span>
            <span>
              <span className="zahl">{a.ab}</span> {a.von} → <span className="zahl">{a.an}</span> {a.nach}
              <span className="text-tinte-3"> · {a.linie}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

`src/components/VerbindungZeile.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import type { Land } from '@/lib/content/schema'
import { datumLesbar, lokaleUhrzeit, minutenAlsDauer, naechsterSamstag, wochentagKurz } from '@/lib/datum'
import { fahrplanLink } from '@/lib/links'
import { TageszielBadge, TicketBadge } from './Badges'
import { VerbindungDetail } from './VerbindungDetail'

type Props = {
  von: { id: string; name: string }
  nach: { id: string; name: string; land: Land }
  rueckfahrt: 'gleicher-tag' | 'folgetag'
  /** Gehzeit bis zur Hütte, für "an der Hütte gegen …" */
  zustiegMin?: number
}

export function verbindungParameter(sp: URLSearchParams) {
  return {
    datum: sp.get('datum') ?? naechsterSamstag(),
    fenster: Number(sp.get('fenster') ?? 360),
  }
}

export function VerbindungZeile({ von, nach, rueckfahrt, zustiegMin }: Props) {
  const sp = useSearchParams()
  const { datum, fenster } = verbindungParameter(sp)
  const [antwort, setAntwort] = useState<VerbindungAntwort | null>(null)
  const [offen, setOffen] = useState(false)

  useEffect(() => {
    let aktiv = true
    setAntwort(null)
    const q = new URLSearchParams({ von: von.id, nach: nach.id, datum, rueckfahrt, fenster: String(fenster) })
    fetch(`/api/verbindung?${q}`)
      .then((r) => r.json())
      .then((a: VerbindungAntwort) => { if (aktiv) setAntwort(a) })
      .catch(() => { if (aktiv) setAntwort({ quelle: 'richtwert', datum, rueckfahrtDatum: datum, ticket: { ticket: 'keins', hinweis: '' } }) })
    return () => { aktiv = false }
  }, [von.id, nach.id, datum, rueckfahrt, fenster])

  const link = fahrplanLink(nach.land, von.name, nach.name, datum)

  if (!antwort) {
    return (
      <div className="space-y-2" aria-busy>
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    )
  }

  if (antwort.quelle === 'richtwert' || !antwort.hinfahrt) {
    const r = antwort.richtwert
    return (
      <div className="space-y-1">
        <div>
          {r ? <><span className="zahl text-lg">ca. {minutenAlsDauer(r.fahrzeitMin)}</span> <span className="text-tinte-2">· {r.umstiege} Umstiege · {taktText(r.takt)}</span></>
             : <span className="text-tinte-2">Keine Verbindung im Zeitfenster gefunden.</span>}
        </div>
        <div className="text-sm text-tinte-3">
          {antwort.quelle === 'richtwert' ? 'Live-Fahrplan gerade nicht erreichbar. ' : ''}
          <a href={link} target="_blank" rel="noreferrer" className="underline">Fahrplan bei {nach.land === 'CH' ? 'SBB' : 'bahn.de'} öffnen</a>
        </div>
      </div>
    )
  }

  const h = antwort.hinfahrt
  const ankunftHuette = zustiegMin ? new Date(Date.parse(h.an) + zustiegMin * 60_000).toISOString() : undefined

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="zahl text-lg">{wochentagKurz(datum)} {lokaleUhrzeit(h.ab)}</span>
        <span className="text-tinte-2">ab {von.name} ·</span>
        <span className="zahl text-lg">{lokaleUhrzeit(h.an)}</span>
        <span className="text-tinte-2">in {nach.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-tinte-2">
        <span>{minutenAlsDauer(h.dauerMin)}, {h.umstiege === 0 ? 'direkt' : `${h.umstiege} ${h.umstiege === 1 ? 'Umstieg' : 'Umstiege'}`}</span>
        {ankunftHuette && <span>· an der Hütte gegen <span className="zahl">{lokaleUhrzeit(ankunftHuette)}</span></span>}
        <TageszielBadge tagesziel={antwort.tagesziel} />
        <TicketBadge ticket={antwort.ticket.ticket} />
      </div>
      {antwort.rueckfahrt && (
        <div className="text-sm text-tinte-2">
          Rückfahrt {datumLesbar(antwort.rueckfahrtDatum)}: <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.ab)}</span> ab {nach.name},{' '}
          <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.an)}</span> in {von.name}
          {antwort.tourenfensterMin !== undefined && <> · <span className="zahl">{minutenAlsDauer(antwort.tourenfensterMin)}</span> am Berg</>}
        </div>
      )}
      <button type="button" onClick={() => setOffen((o) => !o)} className="min-h-11 text-sm text-tanne underline" aria-expanded={offen}>
        {offen ? 'Details ausblenden' : 'Umstiege und Ticket'}
      </button>
      {offen && (
        <div className="space-y-3 rounded-[var(--radius-knopf)] bg-papier p-3">
          <VerbindungDetail titel="Hinfahrt" v={h} />
          {antwort.hinfahrtSpaeter && <VerbindungDetail titel="Später los" v={antwort.hinfahrtSpaeter} />}
          {antwort.rueckfahrt && <VerbindungDetail titel="Rückfahrt" v={antwort.rueckfahrt} />}
          <p className="text-sm text-tinte-2">{antwort.ticket.hinweis}</p>
          <a href={link} target="_blank" rel="noreferrer" className="knopf-sekundaer w-full sm:w-auto">
            Bei {nach.land === 'CH' ? 'SBB' : 'bahn.de'} buchen
          </a>
        </div>
      )}
    </div>
  )
}

function taktText(t: string) {
  return t === 'stuendlich' ? 'stündlich' : t === 'zweistuendlich' ? 'zweistündlich' : 'unregelmäßig'
}
```

`src/components/Co2Zeile.tsx`:

```tsx
export function Co2Zeile({ kg }: { kg: number | undefined }) {
  if (kg === undefined) return null
  return <p className="text-sm text-tinte-2">🌱 Bahn statt Auto spart etwa <span className="zahl">{kg} kg</span> CO₂ pro Person.</p>
}
```

- [ ] **Step 6: HuetteKarte**

`src/components/HuetteKarte.tsx`:

```tsx
import Link from 'next/link'
import type { Huette, Haltestelle } from '@/lib/content/schema'
import { minutenAlsDauer } from '@/lib/datum'
import { BetreiberBadge } from './Badges'

export function HuetteKarte({ huette, haltestellen }: { huette: Huette; haltestellen: Haltestelle[] }) {
  const z = huette.zustiege[0]
  const h = haltestellen.find((x) => x.id === z.haltestelleId)
  return (
    <Link href={`/huette/${huette.id}`} className="karte-card no-underline hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{huette.name}</h3>
        <span className="zahl text-sm text-tinte-2">{huette.hoehe} m</span>
      </div>
      <div className="mt-1"><BetreiberBadge typ={huette.betreiber.typ} sektion={huette.betreiber.sektion} /></div>
      <p className="mt-2 text-sm text-tinte-2">
        {minutenAlsDauer(z.gehzeitMin)} Zustieg{z.bergbahn ? ' mit Bergbahn' : ''} ab {h?.name ?? z.haltestelleId}
        {z.hoehenmeter ? ` · ${z.hoehenmeter} hm` : ''}
      </p>
    </Link>
  )
}
```

- [ ] **Step 7: Hüttenseite**

`src/app/huette/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { inhalt, findeHuette, findeGebiet, findeHaltestelle, sichtbareStartorte } from '@/lib/content/laden'
import { co2ErsparnisKg } from '@/lib/co2'
import { minutenAlsDauer } from '@/lib/datum'
import { BetreiberBadge } from '@/components/Badges'
import { Co2Zeile } from '@/components/Co2Zeile'
import { FehlerMelden } from '@/components/FehlerMelden'
import { VerbindungZeile } from '@/components/VerbindungZeile'

export function generateStaticParams() {
  return inhalt().huetten.map((h) => ({ id: h.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const h = findeHuette(inhalt(), id)
  return { title: h?.name ?? 'Hütte' }
}

const SAISON = { sommer: 'Sommer', winter: 'Winter', ganzjaehrig: 'ganzjährig' } as const

export default async function HuetteSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const huette = findeHuette(i, id)
  if (!huette) notFound()
  const gebiet = findeGebiet(i, huette.gebietId)!
  const startort = sichtbareStartorte(i)[0]

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href={`/gebiet/${gebiet.id}`} className="text-sm text-tanne">← {gebiet.name}</Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{huette.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-tinte-2">
          <BetreiberBadge typ={huette.betreiber.typ} sektion={huette.betreiber.sektion} />
          <span className="zahl">{huette.hoehe} m</span>
          <span>{SAISON[huette.saison]}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {huette.buchungUrl && <a href={huette.buchungUrl} target="_blank" rel="noreferrer" className="knopf">Buchen</a>}
          {huette.webUrl && <a href={huette.webUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer">Hüttenseite</a>}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Anreise ab {startort.name}</h2>
        {huette.zustiege.map((z, n) => {
          const h = findeHaltestelle(i, z.haltestelleId)!
          const r = h.richtwerte[startort.id]
          return (
            <div key={n} className="karte-card space-y-3">
              <div>
                <div className="font-medium">Bis {h.name}</div>
                <p className="text-sm text-tinte-2">
                  Zustieg {minutenAlsDauer(z.gehzeitMin)}{z.bergbahn ? ' mit Bergbahn' : ''}{z.hoehenmeter ? `, ${z.hoehenmeter} hm` : ''}
                  {z.hinweis ? ` · ${z.hinweis}` : ''}
                </p>
              </div>
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={{ id: startort.id, name: startort.name }} nach={{ id: h.id, name: h.name, land: h.land }} rueckfahrt="folgetag" zustiegMin={z.gehzeitMin} />
              </Suspense>
              {r && <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />}
            </div>
          )
        })}
        {huette.geschaetzt && <p className="text-sm text-tinte-3">Zustiegszeiten sind geschätzt. <FehlerMelden titel={huette.name} /></p>}
      </section>

      <footer className="text-sm text-tinte-3">
        Quelle: <a href={huette.quelle} target="_blank" rel="noreferrer" className="underline">{new URL(huette.quelle).hostname}</a> · <FehlerMelden titel={huette.name} />
      </footer>
    </article>
  )
}
```

- [ ] **Step 8: Gebietsseite**

`src/app/gebiet/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { inhalt, findeGebiet, findeHaltestelle, huettenImGebiet, sichtbareStartorte } from '@/lib/content/laden'
import { SPORTART_LABEL } from '@/lib/content/schema'
import { co2ErsparnisKg } from '@/lib/co2'
import { Co2Zeile } from '@/components/Co2Zeile'
import { FehlerMelden } from '@/components/FehlerMelden'
import { HuetteKarte } from '@/components/HuetteKarte'
import { VerbindungZeile } from '@/components/VerbindungZeile'

export function generateStaticParams() {
  return inhalt().gebiete.map((g) => ({ id: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: findeGebiet(inhalt(), id)?.name ?? 'Gebiet' }
}

const SAISON = { sommer: 'Sommer', winter: 'Winter', ganzjaehrig: 'ganzjährig' } as const

export default async function GebietSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const i = inhalt()
  const gebiet = findeGebiet(i, id)
  if (!gebiet) notFound()
  const startort = sichtbareStartorte(i)[0]
  const huetten = huettenImGebiet(i, gebiet.id)

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href="/" className="text-sm text-tanne">← Alle Ziele</Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{gebiet.name}</h1>
        <p className="mt-2 text-tinte-2">{gebiet.beschreibung}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-tinte-2">
          {gebiet.sportarten.map((s) => <span key={s} className="badge bg-nebel">{SPORTART_LABEL[s]}</span>)}
          <span className="badge bg-nebel">{SAISON[gebiet.saison]}</span>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Anreise ab {startort.name}</h2>
        {gebiet.haltestellen.map((hid) => {
          const h = findeHaltestelle(i, hid)!
          const r = h.richtwerte[startort.id]
          return (
            <div key={hid} className="karte-card space-y-3">
              <div className="font-medium">Bis {h.name}</div>
              <Suspense fallback={<div className="skeleton h-6 w-3/4" />}>
                <VerbindungZeile von={{ id: startort.id, name: startort.name }} nach={{ id: h.id, name: h.name, land: h.land }} rueckfahrt="gleicher-tag" />
              </Suspense>
              {r && <Co2Zeile kg={co2ErsparnisKg({ strassenKm: r.strassenKm, bahnKm: r.bahnKm }, i.emissionen)} />}
            </div>
          )
        })}
      </section>

      {huetten.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Hütten</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {huetten.map((h) => <HuetteKarte key={h.id} huette={h} haltestellen={i.haltestellen} />)}
          </div>
        </section>
      )}

      {gebiet.links.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Touren</h2>
          <ul className="space-y-1">
            {gebiet.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer" className="text-tanne underline">{l.titel}</a></li>)}
          </ul>
        </section>
      )}

      <footer className="text-sm text-tinte-3"><FehlerMelden titel={gebiet.name} /></footer>
    </article>
  )
}
```

- [ ] **Step 9: Über-Seite**

`src/app/ueber/page.tsx`:

```tsx
import { inhalt } from '@/lib/content/laden'

export const metadata = { title: 'Über' }

export default function UeberSeite() {
  const i = inhalt()
  return (
    <article className="prose mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Über diese Seite</h1>
      <p>
        Der Arbeitskreis Klimaschutz der DAV Sektion Offenburg möchte, dass mehr Bergtouren ohne Auto beginnen.
        Diese Seite zeigt Hütten und Tourengebiete, die von Offenburg aus mit Bahn und Bus gut erreichbar sind,
        mit echter Verbindung für dein Datum.
      </p>
      <h2 className="text-xl font-semibold">So rechnen wir</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Hinfahrt: früheste Ankunft bei Abfahrt zwischen 5 und 8 Uhr. Rückfahrt: letzte Verbindung mit Ankunft vor 23 Uhr.</li>
        <li>Tagesziel: Ankunft bis 10 Uhr, Rückfahrt ab 16:30, dazwischen mindestens 6 Stunden (einstellbar).</li>
        <li>CO₂: {i.emissionen.pkwGrammProFahrzeugKm} g/km pro Pkw bei {i.emissionen.personenProPkw} Personen gegen {i.emissionen.bahnGrammProPersonenKm} g pro Personenkilometer Bahn.
          Quelle: <a href={i.emissionen.quelleUrl} className="underline">{i.emissionen.quelle}</a>, Stand {i.emissionen.stand}.</li>
      </ul>
      <h2 className="text-xl font-semibold">Datenquellen</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Fahrplan: <a href="https://transitous.org" className="underline">Transitous</a> (offene Routing-API auf Basis von DELFI, opentransportdata.swiss, SNCF, ÖBB).</li>
        <li>Hütten: Wikipedia-Liste der SAC-Hütten, Wikidata, Hüttenseiten der Sektionen. Zustiegszeiten teils geschätzt und so gekennzeichnet.</li>
        <li>Karte: <a href="https://openfreemap.org" className="underline">OpenFreeMap</a>, Daten © OpenStreetMap-Mitwirkende.</li>
      </ul>
      <h2 className="text-xl font-semibold">Mitmachen</h2>
      <p>
        Der Code ist offen: <a href="https://github.com/Maxlemoar/dav-oepnv-touren" className="underline">github.com/Maxlemoar/dav-oepnv-touren</a>.
        Fehler und Ergänzungen bitte über den Link "Fehler melden" auf jeder Seite.
      </p>
    </article>
  )
}
```

- [ ] **Step 10: Vorläufige Startseite und Build**

`src/app/page.tsx` (wird in Task 13 ersetzt):

```tsx
import Link from 'next/link'
import { inhalt } from '@/lib/content/laden'

export default function Start() {
  const i = inhalt()
  return (
    <ul className="space-y-2">
      {i.gebiete.map((g) => <li key={g.id}><Link href={`/gebiet/${g.id}`} className="text-tanne underline">{g.name}</Link></li>)}
    </ul>
  )
}
```

```bash
npm run build
```
Erwartet: Build erfolgreich, Routen `/gebiet/[id]` und `/huette/[id]` als SSG mit je 7 bzw. 8 Pfaden.

- [ ] **Step 11: Im Browser prüfen**

```bash
npm run dev
```
`http://localhost:3000/huette/doldenhornhuette` öffnen: Verbindungszeile zeigt nach kurzem Skeleton "Sa 06:30 ab Offenburg · 10:40 in Kandersteg" (Zeiten je nach Fahrplan), "an der Hütte gegen …", Rückfahrt am Folgetag, Details aufklappbar. Handy-Breite (375 px) prüfen: keine horizontale Scrollleiste.

- [ ] **Step 12: Commit**

```bash
git add src tests/lib/links.test.ts
git commit -m "feat: Layout, Hütten- und Gebietsseite, Verbindungszeile, Über"
```

---

### Task 13: Startseite mit Suche, Filter, Datum

**Files:**
- Create: `src/components/Startseite.tsx`, `src/components/Suche.tsx`, `src/components/Filter.tsx`, `src/components/DatumWahl.tsx`, `src/components/GebietKarte.tsx`
- Create: `src/lib/filter.ts`
- Modify: `src/app/page.tsx`
- Test: `tests/lib/filter.test.ts`

- [ ] **Step 1: Failing Test für die Filterlogik**

`tests/lib/filter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { filtereGebiete, leseFilter, schreibeFilter, type GebietEintrag } from '@/lib/filter'

const g = (id: string, extra: Partial<GebietEintrag> = {}): GebietEintrag => ({
  id, name: id, beschreibung: '', sportarten: ['wandern'], saison: 'sommer', fahrzeitMin: 200, anzahlHuetten: 1,
  lat: 0, lon: 0, hauptHaltestelleId: id, ...extra,
})

describe('leseFilter', () => {
  it('Standardwerte', () => {
    expect(leseFilter(new URLSearchParams(''))).toEqual({ sport: [], art: 'alle', maxStd: 5, suche: '' })
  })
  it('liest Werte', () => {
    expect(leseFilter(new URLSearchParams('sport=wandern,skitour&art=tag&max=3&q=feld')))
      .toEqual({ sport: ['wandern', 'skitour'], art: 'tag', maxStd: 3, suche: 'feld' })
  })
})

describe('schreibeFilter', () => {
  it('lässt Standardwerte weg', () => {
    const sp = new URLSearchParams('datum=2026-09-12')
    expect(schreibeFilter(sp, { sport: [], art: 'alle', maxStd: 5, suche: '' }).toString()).toBe('datum=2026-09-12')
    expect(schreibeFilter(sp, { sport: ['wandern'], art: 'nacht', maxStd: 4, suche: 'x' }).toString()).toBe('datum=2026-09-12&sport=wandern&art=nacht&max=4&q=x')
  })
})

describe('filtereGebiete', () => {
  const gebiete = [
    g('a', { fahrzeitMin: 100, sportarten: ['wandern'] }),
    g('b', { fahrzeitMin: 250, sportarten: ['skitour'] }),
    g('c', { fahrzeitMin: 290, sportarten: ['wandern', 'hochtour'], anzahlHuetten: 0 }),
  ]
  it('nach Fahrzeit und Sportart, sortiert nach Fahrzeit', () => {
    expect(filtereGebiete(gebiete, { sport: ['wandern'], art: 'alle', maxStd: 4, suche: '' }, {}).map((x) => x.id)).toEqual(['a'])
    expect(filtereGebiete(gebiete, { sport: [], art: 'alle', maxStd: 5, suche: '' }, {}).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('Tagesziel nutzt die Übersicht, unbekannte bleiben drin', () => {
    const uebersicht = { a: true, b: false }
    expect(filtereGebiete(gebiete, { sport: [], art: 'tag', maxStd: 5, suche: '' }, uebersicht).map((x) => x.id)).toEqual(['a', 'c'])
  })
  it('Übernachtung braucht Hütten', () => {
    expect(filtereGebiete(gebiete, { sport: [], art: 'nacht', maxStd: 5, suche: '' }, {}).map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('Suche im Namen, ohne Groß/Klein', () => {
    expect(filtereGebiete(gebiete, { sport: [], art: 'alle', maxStd: 5, suche: 'B' }, {}).map((x) => x.id)).toEqual(['b'])
  })
})
```

- [ ] **Step 2: filter.ts implementieren**

`src/lib/filter.ts`:

```ts
import type { Sportart, Saison, Takt, Ticket } from '@/lib/content/schema'

export type GebietEintrag = {
  id: string
  name: string
  beschreibung: string
  sportarten: Sportart[]
  saison: Saison
  fahrzeitMin?: number
  umstiege?: number
  takt?: Takt
  ticket?: Ticket
  anzahlHuetten: number
  lat: number
  lon: number
  hauptHaltestelleId: string
}

export type Art = 'alle' | 'tag' | 'nacht'
export type FilterZustand = { sport: Sportart[]; art: Art; maxStd: number; suche: string }

export const STANDARD_FILTER: FilterZustand = { sport: [], art: 'alle', maxStd: 5, suche: '' }

export function leseFilter(sp: URLSearchParams): FilterZustand {
  const sport = (sp.get('sport') ?? '').split(',').filter(Boolean) as Sportart[]
  const art = (sp.get('art') ?? 'alle') as Art
  const maxStd = Number(sp.get('max') ?? 5)
  return { sport, art: ['alle', 'tag', 'nacht'].includes(art) ? art : 'alle', maxStd: [2, 3, 4, 5].includes(maxStd) ? maxStd : 5, suche: sp.get('q') ?? '' }
}

export function schreibeFilter(sp: URLSearchParams, f: FilterZustand): URLSearchParams {
  const neu = new URLSearchParams(sp)
  for (const k of ['sport', 'art', 'max', 'q']) neu.delete(k)
  if (f.sport.length) neu.set('sport', f.sport.join(','))
  if (f.art !== 'alle') neu.set('art', f.art)
  if (f.maxStd !== 5) neu.set('max', String(f.maxStd))
  if (f.suche) neu.set('q', f.suche)
  return neu
}

/** uebersicht: gebietId -> tagesziel (true/false), fehlt = noch nicht geladen */
export function filtereGebiete(gebiete: GebietEintrag[], f: FilterZustand, uebersicht: Record<string, boolean | undefined>): GebietEintrag[] {
  const q = f.suche.trim().toLowerCase()
  return gebiete
    .filter((g) => (g.fahrzeitMin ?? 0) <= f.maxStd * 60)
    .filter((g) => f.sport.length === 0 || f.sport.some((s) => g.sportarten.includes(s)))
    .filter((g) => f.art !== 'tag' || uebersicht[g.id] !== false)
    .filter((g) => f.art !== 'nacht' || g.anzahlHuetten > 0)
    .filter((g) => !q || g.name.toLowerCase().includes(q))
    .sort((a, b) => (a.fahrzeitMin ?? 9999) - (b.fahrzeitMin ?? 9999))
}
```

```bash
npx vitest run tests/lib/filter.test.ts
```
Erwartet: PASS, 7 Tests.

- [ ] **Step 3: DatumWahl, Filter, Suche**

`src/components/DatumWahl.tsx`:

```tsx
'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { folgetag, naechsterSamstag } from '@/lib/datum'

export function DatumWahl() {
  const sp = useSearchParams()
  const router = useRouter()
  const pfad = usePathname()
  const samstag = naechsterSamstag()
  const sonntag = folgetag(samstag)
  const datum = sp.get('datum') ?? samstag
  const fenster = Number(sp.get('fenster') ?? 360)

  function setze(k: string, v: string, standard: string) {
    const neu = new URLSearchParams(sp)
    if (v === standard) neu.delete(k); else neu.set(k, v)
    router.replace(`${pfad}?${neu.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-sm">
        <span className="sr-only">Datum</span>
        <input type="date" value={datum} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setze('datum', e.target.value, samstag)}
          className="rounded-[var(--radius-knopf)] border border-linie bg-karte px-3 text-base" />
      </label>
      <button type="button" className={`chip ${datum === samstag ? 'chip-aktiv' : ''}`} onClick={() => setze('datum', samstag, samstag)}>Sa</button>
      <button type="button" className={`chip ${datum === sonntag ? 'chip-aktiv' : ''}`} onClick={() => setze('datum', sonntag, samstag)}>So</button>
      <label className="ml-auto flex items-center gap-2 text-sm text-tinte-2">
        Mindestens am Berg
        <select value={fenster} onChange={(e) => setze('fenster', e.target.value, '360')} className="min-h-11 rounded-[var(--radius-knopf)] border border-linie bg-karte px-2 text-base text-tinte">
          {[180, 240, 300, 360, 420, 480].map((m) => <option key={m} value={m}>{m / 60} h</option>)}
        </select>
      </label>
    </div>
  )
}
```

`src/components/Filter.tsx`:

```tsx
'use client'
import { SPORTART_LABEL, SportartSchema, type Sportart } from '@/lib/content/schema'
import type { Art, FilterZustand } from '@/lib/filter'

const ARTEN: { wert: Art; label: string }[] = [
  { wert: 'alle', label: 'Alle' }, { wert: 'tag', label: 'Tagestour' }, { wert: 'nacht', label: 'Mit Hütte' },
]

export function Filter({ wert, onChange }: { wert: FilterZustand; onChange: (f: FilterZustand) => void }) {
  function toggleSport(s: Sportart) {
    const sport = wert.sport.includes(s) ? wert.sport.filter((x) => x !== s) : [...wert.sport, s]
    onChange({ ...wert, sport })
  }
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Art" className="grid grid-cols-3 overflow-hidden rounded-[var(--radius-knopf)] border border-linie bg-karte">
        {ARTEN.map((a) => (
          <button key={a.wert} type="button" onClick={() => onChange({ ...wert, art: a.wert })} aria-pressed={wert.art === a.wert}
            className={`min-h-11 text-sm ${wert.art === a.wert ? 'bg-tanne text-white' : 'text-tinte-2'}`}>{a.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sportart">
        {SportartSchema.options.map((s) => (
          <button key={s} type="button" onClick={() => toggleSport(s)} aria-pressed={wert.sport.includes(s)}
            className={`chip ${wert.sport.includes(s) ? 'chip-aktiv' : ''}`}>{SPORTART_LABEL[s]}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Maximale Fahrzeit">
        <span className="text-sm text-tinte-2">Fahrzeit bis</span>
        {[2, 3, 4, 5].map((h) => (
          <button key={h} type="button" onClick={() => onChange({ ...wert, maxStd: h })} aria-pressed={wert.maxStd === h}
            className={`chip ${wert.maxStd === h ? 'chip-aktiv' : ''}`}>{h} h</button>
        ))}
      </div>
    </div>
  )
}
```

`src/components/Suche.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'

export type SuchEintrag = { id: string; name: string; typ: 'gebiet' | 'huette'; meta: string }

export function Suche({ eintraege, wert, onChange }: { eintraege: SuchEintrag[]; wert: string; onChange: (v: string) => void }) {
  const [fokus, setFokus] = useState(false)
  const q = wert.trim().toLowerCase()
  const treffer = q ? eintraege.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8) : []
  return (
    <div className="relative">
      <input type="search" value={wert} onChange={(e) => onChange(e.target.value)} onFocus={() => setFokus(true)} onBlur={() => setTimeout(() => setFokus(false), 150)}
        placeholder="Wohin willst du? Hütte oder Gebiet" aria-label="Ziel suchen" autoComplete="off"
        className="min-h-12 w-full rounded-[var(--radius-karte)] border border-linie bg-karte px-4 text-base shadow-[var(--shadow-karte)]" />
      {fokus && treffer.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-karte shadow-md">
          {treffer.map((t) => (
            <li key={`${t.typ}-${t.id}`}>
              <Link href={`/${t.typ}/${t.id}`} className="flex min-h-11 items-center justify-between px-4 no-underline hover:bg-papier">
                <span>{t.name}</span><span className="text-sm text-tinte-3">{t.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: GebietKarte (Card) und Startseite**

`src/components/GebietKarte.tsx`:

```tsx
import Link from 'next/link'
import { SPORTART_LABEL } from '@/lib/content/schema'
import type { GebietEintrag } from '@/lib/filter'
import { ReisezeitBadge, TageszielBadge, TicketBadge } from './Badges'

export function GebietKarte({ g, tagesziel, laedt }: { g: GebietEintrag; tagesziel: boolean | undefined; laedt: boolean }) {
  return (
    <Link href={`/gebiet/${g.id}`} className="karte-card no-underline hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{g.name}</h3>
        {g.fahrzeitMin !== undefined ? <ReisezeitBadge fahrzeitMin={g.fahrzeitMin} ca /> : <span className="badge bg-nebel">Fahrzeit offen</span>}
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-tinte-2">{g.beschreibung}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-tinte-3">
        {g.umstiege !== undefined && <span>{g.umstiege} Umstiege</span>}
        {g.anzahlHuetten > 0 && <span>· {g.anzahlHuetten} {g.anzahlHuetten === 1 ? 'Hütte' : 'Hütten'}</span>}
        <span>· {g.sportarten.map((s) => SPORTART_LABEL[s]).join(', ')}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {laedt ? <span className="skeleton h-6 w-24" /> : <TageszielBadge tagesziel={tagesziel} />}
        {g.ticket && <TicketBadge ticket={g.ticket} />}
      </div>
    </Link>
  )
}
```

`src/components/Startseite.tsx`:

```tsx
'use client'
import { useEffect, useMemo, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { filtereGebiete, leseFilter, schreibeFilter, type GebietEintrag } from '@/lib/filter'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import { verbindungParameter } from './VerbindungZeile'
import { DatumWahl } from './DatumWahl'
import { Filter } from './Filter'
import { Suche, type SuchEintrag } from './Suche'
import { GebietKarte } from './GebietKarte'

const Karte = dynamic(() => import('./Karte').then((m) => m.Karte), { ssr: false, loading: () => <div className="skeleton h-full w-full" /> })

type Props = {
  startort: { id: string; name: string }
  gebiete: GebietEintrag[]
  suchEintraege: SuchEintrag[]
  empfehlungen: { id: string; name: string; meta: string }[]
}

export function Startseite(props: Props) {
  return <Suspense fallback={<div className="skeleton h-40 w-full" />}><StartseiteInnen {...props} /></Suspense>
}

function StartseiteInnen({ startort, gebiete, suchEintraege, empfehlungen }: Props) {
  const sp = useSearchParams()
  const router = useRouter()
  const pfad = usePathname()
  const filter = useMemo(() => leseFilter(sp), [sp])
  const { datum, fenster } = verbindungParameter(sp)
  const [uebersicht, setUebersicht] = useState<Record<string, boolean | undefined>>({})
  const [laedt, setLaedt] = useState(true)
  const [karteOffen, setKarteOffen] = useState(false)

  useEffect(() => {
    let aktiv = true
    setLaedt(true)
    fetch(`/api/uebersicht?von=${startort.id}&datum=${datum}&fenster=${fenster}`)
      .then((r) => r.json())
      .then((d: Record<string, VerbindungAntwort>) => {
        if (!aktiv) return
        const u: Record<string, boolean | undefined> = {}
        for (const [id, a] of Object.entries(d)) u[id] = a.tagesziel
        setUebersicht(u)
      })
      .catch(() => {})
      .finally(() => { if (aktiv) setLaedt(false) })
    return () => { aktiv = false }
  }, [startort.id, datum, fenster])

  function setzeFilter(f: typeof filter) {
    router.replace(`${pfad}?${schreibeFilter(sp, f).toString()}`, { scroll: false })
  }

  const sichtbar = filtereGebiete(gebiete, filter, uebersicht)

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">In die Berge, ohne Auto.</h1>
        <p className="text-tinte-2">Hütten und Tourengebiete, die du von {startort.name} aus mit Bahn und Bus erreichst. Mit echter Verbindung für dein Datum.</p>
        <Suche eintraege={suchEintraege} wert={filter.suche} onChange={(suche) => setzeFilter({ ...filter, suche })} />
      </section>

      <section className="space-y-3">
        <DatumWahl />
        <Filter wert={filter} onChange={setzeFilter} />
      </section>

      {empfehlungen.length > 0 && !filter.suche && (
        <section className="rounded-[var(--radius-karte)] bg-tanne-tint p-4">
          <h2 className="text-sm font-semibold text-tanne">Häuser der Sektion Offenburg</h2>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {empfehlungen.map((e) => <li key={e.id}><a href={`/huette/${e.id}`} className="text-tanne underline">{e.name}</a> <span className="text-tinte-2">{e.meta}</span></li>)}
          </ul>
        </section>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-6">
        <section className={`space-y-3 ${karteOffen ? 'hidden lg:block' : ''}`}>
          <h2 className="text-sm text-tinte-3">{sichtbar.length} {sichtbar.length === 1 ? 'Ziel' : 'Ziele'}, nach Fahrzeit sortiert</h2>
          {sichtbar.map((g) => <GebietKarte key={g.id} g={g} tagesziel={uebersicht[g.id]} laedt={laedt} />)}
          {sichtbar.length === 0 && <p className="text-tinte-2">Nichts gefunden. Filter lockern oder Fahrzeit erhöhen.</p>}
        </section>
        <section className={`${karteOffen ? 'block' : 'hidden'} h-[70dvh] overflow-hidden rounded-[var(--radius-karte)] border border-linie lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-6rem)]`}>
          <Karte gebietIds={sichtbar.map((g) => g.id)} uebersicht={uebersicht} />
        </section>
      </div>

      <button type="button" onClick={() => setKarteOffen((o) => !o)}
        className="knopf fixed bottom-4 left-1/2 z-30 -translate-x-1/2 shadow-lg lg:hidden">
        {karteOffen ? 'Liste' : 'Karte'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Startseite als Server-Komponente**

`src/app/page.tsx` (ersetzen):

```tsx
import { inhalt, findeHaltestelle, sichtbareStartorte, huettenImGebiet } from '@/lib/content/laden'
import { minutenAlsDauer } from '@/lib/datum'
import type { GebietEintrag } from '@/lib/filter'
import { Startseite } from '@/components/Startseite'
import type { SuchEintrag } from '@/components/Suche'

export default function Start() {
  const i = inhalt()
  const startort = sichtbareStartorte(i)[0]

  const gebiete: GebietEintrag[] = i.gebiete.map((g) => {
    const h = findeHaltestelle(i, g.haltestellen[0])!
    const r = h.richtwerte[startort.id]
    return {
      id: g.id, name: g.name, beschreibung: g.beschreibung, sportarten: g.sportarten, saison: g.saison,
      fahrzeitMin: r?.fahrzeitMin, umstiege: r?.umstiege, takt: r?.takt, ticket: r?.ticket,
      anzahlHuetten: huettenImGebiet(i, g.id).length, lat: g.lat, lon: g.lon, hauptHaltestelleId: h.id,
    }
  })

  const suchEintraege: SuchEintrag[] = [
    ...i.gebiete.map((g) => ({ id: g.id, name: g.name, typ: 'gebiet' as const, meta: 'Gebiet' })),
    ...i.huetten.map((h) => ({ id: h.id, name: h.name, typ: 'huette' as const, meta: `${h.hoehe} m` })),
  ]

  const empfehlungen = i.huetten
    .filter((h) => h.betreiber.typ === 'dav' && h.betreiber.sektion === 'Offenburg')
    .map((h) => {
      const st = findeHaltestelle(i, h.zustiege[0].haltestelleId)
      const r = st?.richtwerte[startort.id]
      return { id: h.id, name: h.name, meta: r ? `ca. ${minutenAlsDauer(r.fahrzeitMin)}` : '' }
    })

  return <Startseite startort={{ id: startort.id, name: startort.name }} gebiete={gebiete} suchEintraege={suchEintraege} empfehlungen={empfehlungen} />
}
```

Die Komponente `Karte` fehlt noch (Task 14). Damit der Build durchläuft, jetzt einen Platzhalter anlegen, der in Task 14 ersetzt wird:

`src/components/Karte.tsx`:
```tsx
'use client'
export function Karte(_: { gebietIds: string[]; uebersicht: Record<string, boolean | undefined> }) {
  return <div className="flex h-full items-center justify-center text-tinte-3">Karte folgt</div>
}
```

- [ ] **Step 6: Build und Browser**

```bash
npm run build && npm run dev
```
`http://localhost:3000` bei 375 px: Titel, Suche, Datum-Zeile, Segment "Alle / Tagestour / Mit Hütte", Sportart-Chips, Fahrzeit-Chips, Empfehlungskasten, Gebietskarten (Fahrzeit-Badges erscheinen erst nach Task 15, vorher "Fahrzeit offen"), fester Knopf "Karte" unten. Tippen auf "Tagestour": Karten mit `tagesziel=false` verschwinden, nachdem `/api/uebersicht` geantwortet hat. Suche "dold" zeigt Doldenhornhütte, Klick führt zur Hüttenseite.

- [ ] **Step 7: Commit**

```bash
git add src tests/lib/filter.test.ts
git commit -m "feat: Startseite mit Suche, Datum, Filter und Gebietsliste"
```

---

### Task 14: Karte

**Files:**
- Create: `src/lib/karte.ts`, `scripts/karte.ts` (ersetzt Platzhalter), `src/components/Karte.tsx` (ersetzt Platzhalter)
- Test: `tests/lib/karte.test.ts`

- [ ] **Step 1: Failing Test**

`tests/lib/karte.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { ladeInhalt } from '@/lib/content/laden'
import { karteGeoJson } from '@/lib/karte'

const FIX = path.resolve(__dirname, '../fixtures/content')

describe('karteGeoJson', () => {
  it('erzeugt Gebiets- und Hüttenpunkte mit Stufe', () => {
    const fc = karteGeoJson(ladeInhalt(FIX), 'offenburg')
    expect(fc.type).toBe('FeatureCollection')
    const gebiet = fc.features.find((f) => f.properties.typ === 'gebiet')!
    expect(gebiet.geometry).toEqual({ type: 'Point', coordinates: [7.671, 46.495] })
    expect(gebiet.properties).toMatchObject({ id: 'kandersteg', name: 'Kandersteg', fahrzeitMin: 250, stufe: 5, huetten: 1 })
    const huette = fc.features.find((f) => f.properties.typ === 'huette')!
    expect(huette.properties).toMatchObject({ id: 'doldenhornhuette', betreiber: 'sac', gebietId: 'kandersteg' })
  })
})
```

- [ ] **Step 2: lib/karte.ts**

`src/lib/karte.ts`:

```ts
import type { Inhalt } from './content/laden'
import { reisezeitStufe } from '@/components/Badges'

export type KarteFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties:
    | { typ: 'gebiet'; id: string; name: string; fahrzeitMin: number | null; stufe: 2 | 3 | 4 | 5 | null; sportarten: string; huetten: number }
    | { typ: 'huette'; id: string; name: string; betreiber: string; gebietId: string; hoehe: number }
}
export type KarteGeoJson = { type: 'FeatureCollection'; features: KarteFeature[] }

export function karteGeoJson(i: Inhalt, startortId: string): KarteGeoJson {
  const gebiete: KarteFeature[] = i.gebiete.map((g) => {
    const h = i.haltestellen.find((x) => x.id === g.haltestellen[0])
    const r = h?.richtwerte[startortId]
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [g.lon, g.lat] },
      properties: {
        typ: 'gebiet', id: g.id, name: g.name,
        fahrzeitMin: r?.fahrzeitMin ?? null, stufe: r ? reisezeitStufe(r.fahrzeitMin) : null,
        sportarten: g.sportarten.join(','), huetten: i.huetten.filter((x) => x.gebietId === g.id).length,
      },
    }
  })
  const huetten: KarteFeature[] = i.huetten.map((h) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [h.lon, h.lat] },
    properties: { typ: 'huette', id: h.id, name: h.name, betreiber: h.betreiber.typ, gebietId: h.gebietId, hoehe: h.hoehe },
  }))
  return { type: 'FeatureCollection', features: [...gebiete, ...huetten] }
}
```

`reisezeitStufe` liegt in `Badges.tsx` (Task 12). Damit `lib/karte.ts` keine React-Datei importiert, die Funktion nach `src/lib/stufe.ts` verschieben und in `Badges.tsx` von dort importieren:

`src/lib/stufe.ts`:
```ts
export function reisezeitStufe(fahrzeitMin: number): 2 | 3 | 4 | 5 {
  if (fahrzeitMin <= 120) return 2
  if (fahrzeitMin <= 180) return 3
  if (fahrzeitMin <= 240) return 4
  return 5
}
export const STUFE_FARBE = { 2: '#2f6b52', 3: '#7fa85a', 4: '#d9a441', 5: '#c86b2f' } as const
```
In `Badges.tsx` die lokale Definition löschen und `import { reisezeitStufe } from '@/lib/stufe'` einfügen; `export { reisezeitStufe }` dort beibehalten, damit bestehende Importe weiter funktionieren. In `lib/karte.ts` `from '@/lib/stufe'` importieren.

```bash
npx vitest run tests/lib/karte.test.ts
```
Erwartet: PASS.

- [ ] **Step 3: Build-Skript**

`scripts/karte.ts` (Platzhalter ersetzen):

```ts
import fs from 'node:fs'
import path from 'node:path'
import { inhalt, sichtbareStartorte } from '../src/lib/content/laden'
import { karteGeoJson } from '../src/lib/karte'

const i = inhalt()
const startort = sichtbareStartorte(i)[0]
const ziel = path.join(process.cwd(), 'public', 'karte.json')
fs.mkdirSync(path.dirname(ziel), { recursive: true })
fs.writeFileSync(ziel, JSON.stringify(karteGeoJson(i, startort.id)))
console.log(`karte: ${ziel} geschrieben (${i.gebiete.length} Gebiete, ${i.huetten.length} Hütten, ab ${startort.name})`)
```

Damit `tsx` die `@/`-Aliase auflöst, in `tsconfig.json` sicherstellen, dass `"paths": { "@/*": ["./src/*"] }` gesetzt ist (create-next-app tut das). `tsx` liest tsconfig-paths ab Version 4 selbst.

```bash
npm run karte
```
Erwartet: `karte: …/public/karte.json geschrieben (7 Gebiete, 8 Hütten, ab Offenburg)`.

- [ ] **Step 4: Karten-Komponente**

`src/components/Karte.tsx` (Platzhalter ersetzen):

```tsx
'use client'
import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MlMap, type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { STUFE_FARBE } from '@/lib/stufe'
import type { KarteGeoJson } from '@/lib/karte'

const STIL = 'https://tiles.openfreemap.org/styles/liberty'
const OFFENBURG: [number, number] = [7.946, 48.476]

type Props = { gebietIds: string[]; uebersicht: Record<string, boolean | undefined> }

export function Karte({ gebietIds, uebersicht }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const karte = useRef<MlMap | null>(null)
  const daten = useRef<KarteGeoJson | null>(null)

  useEffect(() => {
    if (!container.current || karte.current) return
    const m = new maplibregl.Map({ container: container.current, style: STIL, center: [8.2, 47.4], zoom: 6.3, attributionControl: { compact: true } })
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    karte.current = m

    m.on('load', async () => {
      const fc = (await fetch('/karte.json').then((r) => r.json())) as KarteGeoJson
      daten.current = fc
      m.addSource('ziele', { type: 'geojson', data: fc })
      m.addSource('start', { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: OFFENBURG }, properties: {} }] } })
      m.addLayer({ id: 'start', type: 'circle', source: 'start', paint: { 'circle-radius': 7, 'circle-color': '#1b1f1c', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } })
      m.addLayer({
        id: 'gebiete', type: 'circle', source: 'ziele', filter: ['==', ['get', 'typ'], 'gebiet'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 9, 10, 16],
          'circle-color': ['match', ['get', 'stufe'], 2, STUFE_FARBE[2], 3, STUFE_FARBE[3], 4, STUFE_FARBE[4], 5, STUFE_FARBE[5], '#7a8078'],
          'circle-stroke-color': '#fff', 'circle-stroke-width': 2, 'circle-opacity': 0.9,
        },
      })
      m.addLayer({
        id: 'gebiete-label', type: 'symbol', source: 'ziele', filter: ['==', ['get', 'typ'], 'gebiet'],
        layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.4], 'text-anchor': 'top', 'text-font': ['Noto Sans Regular'] },
        paint: { 'text-color': '#1b1f1c', 'text-halo-color': '#f7f6f2', 'text-halo-width': 1.5 },
      })
      m.addLayer({
        id: 'huetten', type: 'circle', source: 'ziele', minzoom: 9, filter: ['==', ['get', 'typ'], 'huette'],
        paint: { 'circle-radius': 6, 'circle-color': ['match', ['get', 'betreiber'], 'dav', '#2f6b52', 'sac', '#c8102e', '#7a8078'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 },
      })
      for (const ebene of ['gebiete', 'huetten']) {
        m.on('click', ebene, (e) => {
          const f = e.features?.[0]
          if (!f) return
          const p = f.properties as Record<string, string | number | null>
          const pfad = p.typ === 'gebiet' ? `/gebiet/${p.id}` : `/huette/${p.id}`
          const meta = p.typ === 'gebiet'
            ? (p.fahrzeitMin ? `ca. ${Math.floor(Number(p.fahrzeitMin) / 60)}:${String(Number(p.fahrzeitMin) % 60).padStart(2, '0')} h` : '')
            : `${p.hoehe} m`
          new maplibregl.Popup({ offset: 12, closeButton: false })
            .setLngLat((f.geometry as { coordinates: [number, number] }).coordinates)
            .setHTML(`<a href="${pfad}" style="font-weight:600;color:#1f4d3a">${p.name}</a><div style="font-size:12px;color:#4a5049">${meta}</div>`)
            .addTo(m)
        })
        m.on('mouseenter', ebene, () => { m.getCanvas().style.cursor = 'pointer' })
        m.on('mouseleave', ebene, () => { m.getCanvas().style.cursor = '' })
      }
      wendeFilterAn(m, gebietIds)
    })
    return () => { m.remove(); karte.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = karte.current
    if (m && m.getLayer('gebiete')) wendeFilterAn(m, gebietIds)
  }, [gebietIds, uebersicht])

  useEffect(() => {
    const m = karte.current
    const beobachter = new ResizeObserver(() => m?.resize())
    if (container.current) beobachter.observe(container.current)
    return () => beobachter.disconnect()
  }, [])

  return <div ref={container} className="h-full w-full" role="region" aria-label="Karte der Ziele" />
}

function wendeFilterAn(m: MlMap, gebietIds: string[]) {
  const ids = gebietIds.length ? gebietIds : ['__keine__']
  m.setFilter('gebiete', ['all', ['==', ['get', 'typ'], 'gebiet'], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('gebiete-label', ['all', ['==', ['get', 'typ'], 'gebiet'], ['in', ['get', 'id'], ['literal', ids]]])
  m.setFilter('huetten', ['all', ['==', ['get', 'typ'], 'huette'], ['in', ['get', 'gebietId'], ['literal', ids]]])
  const src = m.getSource('ziele') as GeoJSONSource | undefined
  void src
}
```

Hinweis zur Schrift: Der Liberty-Stil von OpenFreeMap liefert Glyphen für `Noto Sans Regular`. Falls Labels fehlen, `text-font` weglassen, dann nimmt MapLibre den Stil-Standard.

- [ ] **Step 5: Build und Browser**

```bash
npm run build && npm run dev
```
Startseite bei 375 px: Knopf "Karte" unten öffnet die Karte in 70 % Höhe, Punkte in Reisezeitfarben, Offenburg schwarz. Tippen auf einen Punkt zeigt Popup mit Link. Filter "Fahrzeit bis 3 h" blendet Punkte aus. Bei 1280 px: Liste links, Karte rechts sticky.

- [ ] **Step 6: Commit**

```bash
git add src scripts/karte.ts tests/lib/karte.test.ts
git commit -m "feat: Karte mit MapLibre, Reisezeitstufen und Build-GeoJSON"
```

---

### Task 15: Richtwerte-Skript

**Files:**
- Create: `scripts/richtwerte.ts`, `src/lib/richtwerte.ts`
- Test: `tests/lib/richtwerte.test.ts`

- [ ] **Step 1: Failing Test für die reine Logik**

`tests/lib/richtwerte.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import fixture from '../fixtures/itineraries-kandersteg.json'
import { taktAus, richtwertAus, haversineKm } from '@/lib/richtwerte'
import type { Itinerary } from '@/lib/verbindung/transitous'

const its = fixture as Itinerary[]

describe('taktAus', () => {
  it('zählt Abfahrten 6 bis 12 Uhr lokal', () => {
    // Fixture: 06:30, 07:12, 08:30, 09:30 lokal -> 4 -> zweistuendlich
    expect(taktAus(its)).toBe('zweistuendlich')
    expect(taktAus([...its, { ...its[4], startTime: '2026-09-12T08:30:00Z' }])).toBe('stuendlich')
    expect(taktAus(its.slice(0, 2))).toBe('unregelmaessig')
  })
})

describe('richtwertAus', () => {
  it('nimmt die gewählte Hinfahrt', () => {
    const r = richtwertAus(its, 'CH', { regeln: [{ land: 'CH', ticket: 'halbtax', hinweis: '' }], fernverkehrHinweis: '' }, '2026-09-06')
    expect(r).toMatchObject({ fahrzeitMin: 250, umstiege: 1, takt: 'zweistuendlich', ticket: 'halbtax', berechnetAm: '2026-09-06' })
  })
  it('undefined ohne Hinfahrt im Fenster', () => {
    expect(richtwertAus([its[0]], 'CH', { regeln: [], fernverkehrHinweis: '' }, '2026-09-06')).toBeUndefined()
  })
})

describe('haversineKm', () => {
  it('Offenburg–Kandersteg etwa 222 km Luftlinie', () => {
    expect(Math.round(haversineKm(48.476, 7.946, 46.495, 7.671))).toBe(222)
  })
})
```

- [ ] **Step 2: lib/richtwerte.ts**

`src/lib/richtwerte.ts`:

```ts
import type { Land, Richtwert, Takt, TicketTabelle } from './content/schema'
import { lokaleMinuten } from './datum'
import type { Itinerary } from './verbindung/transitous'
import { waehleHinfahrt, kurzfassung } from './verbindung/auswerten'
import { ticketFuer } from './verbindung/regeln'

export function taktAus(its: Itinerary[]): Takt {
  const abfahrten = new Set(
    its.map((i) => lokaleMinuten(i.startTime)).filter((m) => m >= 6 * 60 && m < 12 * 60),
  )
  if (abfahrten.size >= 5) return 'stuendlich'
  if (abfahrten.size >= 3) return 'zweistuendlich'
  return 'unregelmaessig'
}

export function richtwertAus(its: Itinerary[], land: Land, tickets: TicketTabelle, heute: string): Richtwert | undefined {
  const { hinfahrt } = waehleHinfahrt(its)
  if (!hinfahrt) return undefined
  const k = kurzfassung(hinfahrt)
  return {
    fahrzeitMin: k.dauerMin,
    umstiege: k.umstiege,
    takt: taktAus(its),
    ticket: ticketFuer(land, k.fernverkehr, tickets).ticket,
    berechnetAm: heute,
  }
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(a))
}
```

```bash
npx vitest run tests/lib/richtwerte.test.ts
```
Erwartet: PASS, 5 Tests.

- [ ] **Step 3: Skript**

`scripts/richtwerte.ts`:

```ts
/**
 * Berechnet Richtwerte (Fahrzeit, Umstiege, Takt, Ticket, Distanzen) für jeden Startort × Haltestelle
 * an einem Referenz-Samstag und schreibt sie in content/haltestellen/*.yaml.
 *
 *   npm run richtwerte                       nächster Samstag in mindestens 7 Tagen
 *   npm run richtwerte -- --datum 2026-09-19
 *   npm run richtwerte -- --nur kandersteg
 */
import fs from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'
import { ladeInhalt } from '../src/lib/content/laden'
import { naechsterSamstag, lokalesDatum } from '../src/lib/datum'
import { planen } from '../src/lib/verbindung/transitous'
import { richtwertAus, haversineKm } from '../src/lib/richtwerte'

const args = process.argv.slice(2)
const arg = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const inEinerWoche = new Date(Date.now() + 7 * 86400_000)
const datum = arg('--datum') ?? naechsterSamstag(inEinerWoche)
const nur = arg('--nur')
const heute = lokalesDatum(new Date())
const wurzel = path.join(process.cwd(), 'content')

const schlaf = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function strassenKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): Promise<number | undefined> {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)' }, signal: AbortSignal.timeout(10_000) })
    const d = (await r.json()) as { routes?: { distance: number }[] }
    const m = d.routes?.[0]?.distance
    return m ? Math.round(m / 1000) : undefined
  } catch {
    return undefined
  }
}

async function main() {
  const i = ladeInhalt(wurzel)
  const haltestellen = nur ? i.haltestellen.filter((h) => h.id === nur) : i.haltestellen
  console.log(`Richtwerte für ${datum}, ${haltestellen.length} Haltestellen × ${i.startorte.length} Startorte`)

  for (const h of haltestellen) {
    const datei = path.join(wurzel, 'haltestellen', `${h.id}.yaml`)
    const dok = parse(fs.readFileSync(datei, 'utf8')) as Record<string, unknown> & { richtwerte?: Record<string, unknown> }
    dok.richtwerte = dok.richtwerte ?? {}

    for (const s of i.startorte) {
      try {
        const its = await planen({ von: s.haltestelleId, nach: h.haltestelleId, zeit: `${datum}T03:00:00Z`, ankunftBis: false, anzahl: 15 })
        const r = richtwertAus(its, h.land, i.tickets, heute)
        if (!r) { console.warn(`  ${s.id} → ${h.id}: keine Hinfahrt im Fenster (${its.length} Itineraries)`); continue }
        const strasse = await strassenKm(s, h)
        const bahn = Math.round(haversineKm(s.lat, s.lon, h.lat, h.lon) * 1.25)
        dok.richtwerte[s.id] = { ...r, ...(strasse ? { strassenKm: strasse } : {}), bahnKm: bahn }
        console.log(`  ${s.id} → ${h.id}: ${r.fahrzeitMin} min, ${r.umstiege} Umstiege, ${r.takt}, ${r.ticket}, Straße ${strasse ?? '?'} km`)
      } catch (e) {
        console.warn(`  ${s.id} → ${h.id}: FEHLER ${(e as Error).message}`)
      }
      await schlaf(500)
    }
    fs.writeFileSync(datei, stringify(dok, { lineWidth: 0 }))
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 4: Laufen lassen und prüfen**

```bash
npm run richtwerte
git diff --stat content/haltestellen
npx vitest run
npm run build
```
Erwartet: jede Haltestellen-Datei hat `richtwerte.offenburg`, `.lahr`, `.kehl` mit plausiblen Zahlen (Kandersteg ~250 min ab Offenburg). Alle Tests grün, Build läuft, Startseite zeigt jetzt Fahrzeit-Badges.

- [ ] **Step 5: Commit**

```bash
git add scripts/richtwerte.ts src/lib/richtwerte.ts tests/lib/richtwerte.test.ts content/haltestellen
git commit -m "feat: Richtwerte-Skript und erste berechnete Richtwerte"
```

---

### Task 16: Rauchtest, Prüfliste, README

**Files:**
- Create: `scripts/rauchtest.ts`, `scripts/pruefliste.ts`, `README.md`, `docs/pruefliste.md` (erzeugt)
- Modify: `package.json` (Script `pruefliste`)

- [ ] **Step 1: Rauchtest**

`scripts/rauchtest.ts`:

```ts
/** Fünf Live-Abfragen gegen Transitous. Warnt nur, Exit-Code immer 0. */
import { ladeInhalt, findeHaltestelle, findeStartort } from '../src/lib/content/laden'
import { naechsterSamstag } from '../src/lib/datum'
import { verbindungErmitteln } from '../src/lib/verbindung/service'
import { lokaleUhrzeit } from '../src/lib/datum'

const ZIELE = ['feldberg-baerental', 'kandersteg', 'engelberg', 'wasserauen', 'metzeral']

async function main() {
  const i = ladeInhalt()
  const startort = findeStartort(i, 'offenburg')!
  const datum = naechsterSamstag()
  let warnungen = 0
  for (const id of ZIELE) {
    const h = findeHaltestelle(i, id)
    if (!h) { console.warn(`WARN ${id}: Haltestelle fehlt im Inhalt`); warnungen++; continue }
    const a = await verbindungErmitteln({ startort, haltestelle: h, datum, rueckfahrt: 'gleicher-tag', mindestFensterMin: 360, tickets: i.tickets })
    if (a.quelle !== 'live' || !a.hinfahrt) { console.warn(`WARN ${id}: ${a.fehler ?? 'keine Hinfahrt'}`); warnungen++; continue }
    console.log(`OK   ${id}: ab ${lokaleUhrzeit(a.hinfahrt.ab)}, an ${lokaleUhrzeit(a.hinfahrt.an)}, ${a.hinfahrt.umstiege} Umstiege, Tagesziel ${a.tagesziel}, ${a.ticket.ticket}`)
  }
  console.log(warnungen ? `${warnungen} Warnungen` : 'Alle Ziele erreichbar')
}

main().catch((e) => { console.warn('WARN Rauchtest abgebrochen:', (e as Error).message) })
```

```bash
npm run rauchtest
```
Erwartet: fünf Zeilen mit `OK` (oder `WARN` bei Störung), Exit-Code 0.

- [ ] **Step 2: Prüfliste für den Arbeitskreis**

`scripts/pruefliste.ts`:

```ts
/** Erzeugt docs/pruefliste.md: alle Hütten und Haltestellen mit Vorschlag, Quelle und Unsicherheit. */
import fs from 'node:fs'
import path from 'node:path'
import { ladeInhalt } from '../src/lib/content/laden'
import { minutenAlsDauer } from '../src/lib/datum'

const i = ladeInhalt()
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
    zeilen.push(`| ${h.name} (${h.hoehe} m) | ${h.betreiber.typ.toUpperCase()}${h.betreiber.sektion ? ' ' + h.betreiber.sektion : ''} | ${hs?.name ?? z.haltestelleId} | ${minutenAlsDauer(z.gehzeitMin)}${z.bergbahn ? ' + Bergbahn' : ''}, ${z.hoehenmeter} hm | ${z.hinweis ?? ''} | [Quelle](${h.quelle}) | ${h.geschaetzt ? '**ja**' : 'nein'} |`)
  }
}
zeilen.push('', '## Haltestellen und Richtwerte ab Offenburg', '', '| Haltestelle | Region | Fahrzeit | Umstiege | Takt | Ticket | Berechnet am |', '|---|---|---|---|---|---|---|')
for (const h of i.haltestellen) {
  const r = h.richtwerte.offenburg
  zeilen.push(`| ${h.name} | ${h.region} | ${r ? minutenAlsDauer(r.fahrzeitMin) : 'offen'} | ${r?.umstiege ?? ''} | ${r?.takt ?? ''} | ${r?.ticket ?? ''} | ${r?.berechnetAm ?? ''} |`)
}
zeilen.push('', '## Gebiete', '', '| Gebiet | Haltestellen | Sportarten | Saison | Hütten |', '|---|---|---|---|---|')
for (const g of i.gebiete) {
  zeilen.push(`| ${g.name} | ${g.haltestellen.join(', ')} | ${g.sportarten.join(', ')} | ${g.saison} | ${i.huetten.filter((x) => x.gebietId === g.id).length} |`)
}
const ziel = path.join(process.cwd(), 'docs', 'pruefliste.md')
fs.writeFileSync(ziel, zeilen.join('\n') + '\n')
console.log(`pruefliste: ${ziel}`)
```

In `package.json` unter `scripts`: `"pruefliste": "tsx scripts/pruefliste.ts"`.

```bash
npm run pruefliste && head -20 docs/pruefliste.md
```

- [ ] **Step 3: README**

`README.md`:

```markdown
# Ohne Auto in die Berge, ab Offenburg

Hütten und Tourengebiete, die von Offenburg aus mit Bahn und Bus erreichbar sind, mit Live-Verbindung fürs gewählte Datum.
Ein Projekt des Arbeitskreises Klimaschutz der DAV Sektion Offenburg.

## Entwickeln

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest
npm run build        # erzeugt public/karte.json und baut die Seite
```

## Inhalte pflegen

Alle Inhalte liegen als YAML unter `content/`:

- `startorte/` Bahnhöfe, von denen aus gerechnet wird (nur `sichtbar: true` erscheint)
- `haltestellen/` Zielbahnhöfe und Bushaltestellen mit Richtwerten (werden per Skript berechnet)
- `gebiete/` Tourengebiete mit Haltestellen, Sportarten, Links
- `huetten/` Hütten mit Zustiegen ab Haltestelle
- `tickets.yaml`, `emissionen.yaml` Regeln und Faktoren mit Quelle

Stop-IDs kommen von Transitous: `https://api.transitous.org/api/v1/geocode?text=<Name>&type=STOP&language=de`.

```bash
npm run richtwerte                 # Fahrzeit, Umstiege, Takt, Ticket, Distanzen je Startort×Haltestelle
npm run richtwerte -- --nur kandersteg
npm run pruefliste                 # docs/pruefliste.md für den Arbeitskreis
npm run rauchtest                  # 5 Live-Abfragen, warnt nur
```

Ungültige Inhalte brechen den Build mit Dateiname und Feld.

## Wie es funktioniert

- Seiten sind statisch (Next.js App Router). Live-Verbindungen holt `/api/verbindung` von [Transitous](https://transitous.org) mit 24-h-Cache; fällt die API aus, zeigt die Seite den Richtwert.
- Tagesziel: Ankunft bis 10:00, Rückfahrt ab 16:30, mindestens 6 h dazwischen (einstellbar).
- Karte: MapLibre mit OpenFreeMap-Kacheln, Punkte aus `public/karte.json`.

Details: `docs/superpowers/specs/2026-09-06-oepnv-tourenplaner-design.md`, Design: `docs/design-system.md`.

## Umgebungsvariablen (optional)

- `NEXT_PUBLIC_FEHLER_MAIL` Adresse für "Fehler melden" (sonst GitHub-Issue)
- `TRANSITOUS_USER_AGENT` eigener User-Agent für Transitous

## Lizenz

Code MIT, Inhalte CC BY 4.0.
```

`LICENSE` mit MIT-Text anlegen (Copyright 2026 Maximilian Marowsky).

- [ ] **Step 4: Commit**

```bash
git add scripts/rauchtest.ts scripts/pruefliste.ts README.md LICENSE docs/pruefliste.md package.json
git commit -m "docs: README, Prüfliste, Rauchtest, Lizenz"
```

---

### Task 17: Abschluss

- [ ] **Step 1: Alles grün**

```bash
npx vitest run
npm run lint
npm run build
```
Erwartet: alle Tests PASS, Lint ohne Fehler, Build ohne Fehler.

- [ ] **Step 2: Handy-Check im Browser**

Bei 375 px und 1280 px: Startseite, Gebietsseite Kandersteg, Hüttenseite Doldenhornhütte, Über. Keine horizontale Scrollleiste, alle Knöpfe mindestens 44 px, Verbindungszeilen laden.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Deployment auf Vercel**

Erst nach Freigabe durch Maximilian (öffentliche URL). Dann: Vercel-Projekt aus dem GitHub-Repo anlegen, Framework Next.js, keine Umgebungsvariablen nötig. Nach dem ersten Deploy `/api/verbindung?von=offenburg&nach=kandersteg&datum=<Samstag>` aufrufen und `quelle: live` prüfen.

---

## Self-Review

**Spec-Abdeckung:**
- Datenmodell → Task 2, 3. Startorte Lahr/Kehl unsichtbar → Task 3.
- Seiten (Start, Gebiet, Hütte, Verbindungsdetail, Über) → Task 12, 13. Fehler melden → Task 12.
- Verbindungsdienst, Fenster, Tagesziel, Ticket-Regel, Cache, Fallback → Task 5 bis 9.
- Karte mit Stufen, Gebiets- und Hüttenebene, Filter → Task 14.
- CO2 → Task 10, Anzeige Task 12.
- Richtwerte-Skript inkl. Distanzen → Task 15.
- Pflege: Prüfliste → Task 16. Datenprüfung beim Build → Task 3 (`inhalt()` wirft), Rauchtest → Task 16.
- Nicht abgedeckt, bewusst: Auffüllen auf 40 Gebiete / 100 Hütten (Folgeplan Datenerfassung).

**Typkonsistenz:** `VerbindungKurz` (auswerten) wird in `VerbindungAntwort` (service) und `VerbindungZeile` benutzt. `reisezeitStufe` wandert in Task 14 nach `lib/stufe.ts`; Task 12 definiert sie zuerst in `Badges.tsx`, Task 14 ersetzt das. `verbindungParameter` exportiert aus `VerbindungZeile.tsx`, benutzt in `Startseite.tsx`. `GebietEintrag` in `lib/filter.ts`, benutzt in `page.tsx`, `GebietKarte.tsx`, `Startseite.tsx`.

**Platzhalter:** `scripts/karte.ts` und `components/Karte.tsx` sind bewusst benannte Zwischenstände, die in Task 14 ersetzt werden, damit jeder Build davor durchläuft.
