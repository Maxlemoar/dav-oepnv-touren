# Zeitfenster zuerst, Karte vorne: Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Startseite fragt zuerst nach dem Zeitfenster (Datum, los ab, zurück bis, Tages- oder Mehrtagestour), zeigt die 84 Ausgangsorte auf einer Karte mit eingefärbten Strecken und öffnet einen Ort neben der Karte mit wählbaren Live-Verbindungen.

**Architecture:** Ein neues Skript berechnet einmal je Fahrplanperiode den typischen Tagesfahrplan (alle Hin- und Rückfahrten je Hauptzugang und Tagesklasse) plus Streckenverlauf und legt ihn als JSON unter `content/` ab; der Build macht daraus kleine Dateien unter `public/`. Der Browser bewertet damit jedes Zeitfenster sofort und ohne Anfrage an Transitous. Nur die Ortsseite fragt Transitous live (`/api/fahrten`, höchstens zwei Anfragen je Aufruf). Startseite und Ortsseite liegen in einer Routengruppe `(karte)`, deren Layout die MapLibre-Karte über Seitenwechsel hinweg hält.

**Tech Stack:** Next.js 16 (App Router, vorher `node_modules/next/dist/docs/` lesen), React 19, TypeScript, Tailwind 4, MapLibre GL 6, zod 4 (nur Server), Vitest, tsx-Skripte.

**Spec:** `docs/superpowers/specs/2026-11-19-zeitfenster-karte-design.md`

## Global Constraints

- Unterzeile wörtlich: "Ausgangsorte für Touren ab Offenburg mit Bahn und Bus."
- Ausgangsort = Hauptzugang `gebiet.haltestellen[0]` jedes Gebiets (84 Orte), Startort = erster sichtbarer Startort (Offenburg).
- Vorgaben: los ab 06:00, zurück bis 21:00, mindestens 4 h vor Ort. Zeitband 4:00 bis 24:00 in 30-Minuten-Schritten. Mindestens vor Ort 0 bis 10 h, 0 = egal, nur bei Tagestour.
- Transitous: höchstens 720 `/plan`-Anfragen am Tag insgesamt (Skripte plus Seite). Live nur für einen gewählten Ort; Ortsseite höchstens zwei Anfragen je Aufruf, "Weitere Abfahrten" eine Anfrage je Klick. Antworten einen Tag cachen (`s-maxage=86400`), Fehlschläge 300 s.
- Ein voller Musterfahrplan-Lauf (etwa 504 Anfragen) nur an einem Tag ohne anderen Transitous-Lauf (Tagesfenster, Audit, Richtwerte); Teilläufe mit `--klasse` und `--nur`.
- Hinweistext für Daten nach `liveBis`: "nach dem Fahrplan bis <liveBis>; Verbindung am Datum auf der Ortsseite prüfen".
- Ortsseite: Hinfahrt eine Fahrt vor "los ab" und bis zu drei danach; Rückfahrt bis zu drei mit Ankunft bis "zurück bis" und eine danach.
- Abweichungshinweis ab 30 Minuten: "Am <Datum> rund <Dauer> länger als üblich".
- Kein Urteil "Tagesziel"/"Besser mit Übernachtung" mehr; Gründe statt Verbote: "Ankunft erst 11:40", "keine Rückfahrt bis 21:00", "nur 2:10 h vor Ort", "fährt am Datum nicht".
- Texte deutsch, kurz, ohne Bevormundung. Gestaltung nach `docs/design-system.md` (Klassen `karte-card`, `chip`, `pill`, `knopf-sekundaer`, `warnhinweis`, Farben `STUFE_FARBE`).
- Alte Links mit `fenster` dürfen nicht brechen: der Parameter wird ignoriert.
- Arbeitsort: Worktree `/Users/maximilianmarowsky/Code/dav-oepnv-touren-zeitfenster`, Zweig `zeitfenster-karte`, Basis `0abadf9` (enthält das letzte Paket der anderen Session: Rückfahrt-Rechner, Wetter, Teilen, Lawinen, Kosten, Tagesfenster für alle 84 Hauptzugänge). Nie im Ordner `/Users/maximilianmarowsky/Code/dav-oepnv-touren` arbeiten. Die andere Session merged `qualitaet-2026-11` gerade nach `main`; Task 7 holt das nach.
- Kein Commit von `AGENTS.md`-Änderungen, die `next dev` erzeugt, außer sie sind schon da (siehe AGENTS.md).

## Review Focus

1. **Ort ohne Fahrplandaten für die Tagesklasse** (Lauf fehlgeschlagen oder Teillauf): muss "keine Fahrplandaten" zeigen, nie "passt". Test in Task 3.
2. **Mehrere Tage mit Rückfahrt am Hin-Datum oder davor, Saisonbus am Rückfahrtdatum nicht bedient:** Rückdatum wird mindestens Hin-Datum + 1; ein am Rückfahrtdatum nicht bedienter Ort passt nicht. Tests in Task 2 und Task 3.
3. **Unsinnige oder alte URL-Werte** (`ab=25:00`, `bis` vor `ab`, `vorort=-5`, `datum` in der Vergangenheit, nur `fenster=360`): fallen auf Vorgaben zurück, die Seite rendert. Test in Task 2.
4. **Zeitfenster bis 24:00 und Rückfahrten nach Mitternacht:** Ankunft nach 24:00 zählt nicht als Rückfahrt am Tag; `bis=24:00` ist erlaubt. Tests in Task 1 und Task 3.
5. **Ortsseite direkt aufgerufen** (geteilter Link ohne Parameter, Suchmaschine): zeigt Verbindungen für den kommenden Samstag mit Vorgaben und bleibt statisch erzeugbar. Test in Task 6 (Route ohne Parameter) und Prüfung in Task 13.

---

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `src/lib/musterfahrplan/typen.ts` (neu) | zod-freie Typen `Fahrt`, `Tagesplan`, `Linie`, `MusterOrt`, `Musterfahrplan`, `Ausgangsort` |
| `src/lib/musterfahrplan/erzeugen.ts` (neu) | Itineraries → `Fahrt[]`, Via-Orte, Polyline dekodieren und vereinfachen, Strecke wählen |
| `src/lib/musterfahrplan/laden.ts` (neu) | zod-Schema und Laden von `content/musterfahrplan.json` (nur Server und Skripte) |
| `scripts/musterfahrplan.ts` (neu) | Anfragen an Transitous, schreibt `content/musterfahrplan.json` |
| `src/lib/zeitfenster.ts` (neu) | Zeitfenster aus und in die URL, Vorgaben, Uhrzeit-Hilfen |
| `src/lib/bewertung.ts` (neu) | passt ein Ort ins Zeitfenster, Grund, Sortierung, Farbstufe |
| `src/lib/ausgangsorte.ts` (neu) | Ausgangsorte aus Inhalten, Dateien für `public/` |
| `scripts/karte.ts` (ändern) | schreibt zusätzlich `public/ausgangsorte.json`, `public/tagesplaene/*.json` |
| `src/lib/verbindung/fahrten.ts`, `src/app/api/fahrten/route.ts` (neu) | Live-Fahrten der Ortsseite mit Rückfall auf den Musterfahrplan |
| `src/app/(karte)/layout.tsx`, `src/components/karte/KartenRahmen.tsx` (neu) | gemeinsamer Rahmen: linkes Feld plus Karte, mobil umschaltbar |
| `src/components/karte/AusgangsortKarte.tsx` (neu, ersetzt `Karte.tsx`) | MapLibre: Punkte, Strecken, Auswahl |
| `src/components/karte/useBewertungen.ts` (neu) | lädt Daten einmal, bewertet alle Orte für das Zeitfenster |
| `src/components/zeitfenster/ZeitfensterWahl.tsx`, `Zeitband.tsx` (neu) | Datum, Tagestour/Mehrere Tage, Zeitband, vor Ort |
| `src/components/karte/AusgangsortListe.tsx` (neu) | Liste passender und nicht passender Orte |
| `src/components/ort/Fahrtenwahl.tsx`, `FahrtZeile.tsx` (neu) | Hin- und Rückfahrten wählen, vor Ort rechnen, weitere Abfahrten |
| `src/app/(karte)/page.tsx`, `src/app/(karte)/gebiet/[id]/page.tsx` (verschoben, neu aufgebaut) | Startseite, Ortsseite |
| `src/app/(seiten)/layout.tsx` (neu) | bisherige Seitenbreite für alle übrigen Seiten |

---

### Task 1: Musterfahrplan aus Transitous-Antworten ableiten

**Files:**
- Create: `src/lib/musterfahrplan/typen.ts`, `src/lib/musterfahrplan/erzeugen.ts`
- Modify: `src/lib/verbindung/transitous.ts` (Typ `Leg` um `legGeometry?: { points: string; precision: number }` erweitern)
- Test: `tests/lib/musterfahrplan/erzeugen.test.ts`

**Interfaces:**
- Produces (`typen.ts`, ohne zod, browsertauglich):
  ```ts
  /** Uhrzeiten lokal "HH:MM" (Europe/Berlin). */
  export type Fahrt = { ab: string; an: string; umstiege: number; via: string[]; fern: boolean }
  export type Tagesplan = { hin: Fahrt[]; rueck: Fahrt[] }
  /** Folge von [lon, lat], 5 Nachkommastellen. */
  export type Linie = [number, number][]
  export type MusterOrt = { plaene: Partial<Record<Tagesklasse, Tagesplan>>; strecke?: Linie[] }
  export type Musterfahrplan = {
    startortId: string; berechnetAm: string; liveBis: string
    referenzTage: Partial<Record<Tagesklasse, string>>
    /** Schlüssel: Haltestellen-id des Hauptzugangs */
    orte: Record<string, MusterOrt>
  }
  export type Ausgangsort = {
    /** Gebiets-id, zugleich Pfad /gebiet/<id> */ id: string
    haltestelleId: string; name: string; gebiet: string; region: string; land: Land
    lat: number; lon: number; ticket?: Ticket; fahrzeitMin?: number; bedient?: ZeitraumImJahr[]
  }
  ```
- Produces (`erzeugen.ts`):
  - `fahrtAus(it: Itinerary): Fahrt`
  - `viaAus(it: Itinerary): string[]` – `to.name` aller Nicht-Fußweg-Abschnitte außer dem letzten, ohne direkte Wiederholungen
  - `hinfahrtenAus(its: Itinerary[], datum: string): Fahrt[]` – Abfahrt am Datum, nach Abfahrt sortiert, gleiche (ab, an) nur einmal (weniger Umstiege gewinnt)
  - `rueckfahrtenAus(its: Itinerary[], datum: string): Fahrt[]` – Ankunft am Datum (nicht nach Mitternacht), sonst wie oben
  - `dekodierePolyline(kodiert: string, praezision: number): Linie`
  - `vereinfache(linie: Linie, toleranzGrad?: number): Linie` – Douglas-Peucker, Standard 0.002, Punkte auf 5 Stellen gerundet
  - `streckeAus(its: Itinerary[]): Linie[] | undefined` – schnellste Hinfahrt mit Abfahrt ab 06:00 (bei Gleichstand weniger Umstiege), je Nicht-Fußweg-Abschnitt eine vereinfachte Linie

- [ ] **Step 0:** Im Worktree `npm install` (der Worktree hat noch keine `node_modules`), dann `npm test` → grün als Ausgangslage.
- [ ] **Step 1: Failing tests schreiben** in `tests/lib/musterfahrplan/erzeugen.test.ts`:
  - `dekodierePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5)` ergibt `[[-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252]]`.
  - `vereinfache` einer Geraden mit 50 Zwischenpunkten liefert genau Anfang und Ende.
  - `fahrtAus` auf `tests/fixtures/itineraries-kandersteg.json[0]` ergibt `ab`/`an` als lokale "HH:MM" und `umstiege` = `transfers`.
  - `viaAus` mit Abschnitten Offenburg→Basel (Zug), Basel→Basel (WALK), Basel→Bern (Zug), Bern→Kandersteg (Zug) ergibt `['Basel', 'Bern']`.
  - `rueckfahrtenAus` verwirft eine Fahrt mit Ankunft `2026-11-29T23:20:00Z` (00:20 lokal am Folgetag) für Datum `2026-11-28`.
  - `hinfahrtenAus` mit zwei Fahrten gleicher (ab, an), Umstiege 2 und 1, behält die mit 1.
- [ ] **Step 2:** `npx vitest run tests/lib/musterfahrplan/erzeugen.test.ts` → FAIL (Modul fehlt).
- [ ] **Step 3:** Typen und Funktionen wie oben implementieren. Zeitumrechnung mit `lokaleUhrzeit`/`lokalesDatum` aus `src/lib/datum.ts`; Fernverkehr mit `hatFernverkehr` aus `auswerten.ts`.
- [ ] **Step 4:** Test erneut → PASS. `npm test` → alle grün.
- [ ] **Step 5: Commit** `feat: Musterfahrplan aus Transitous-Verbindungen ableiten`

### Task 2: Zeitfenster in der URL

**Files:**
- Create: `src/lib/zeitfenster.ts`
- Test: `tests/lib/zeitfenster.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Zeitfenster = { datum: string; rueck: string; abMin: number; bisMin: number; vorOrtMin: number }
  export const STANDARD_ZEITFENSTER = { abMin: 360, bisMin: 1260, vorOrtMin: 240 } as const
  export const ZEITBAND = { vonMin: 240, bisMin: 1440, schrittMin: 30 } as const
  export const VOR_ORT_MAX_MIN = 600
  /** Wandern in internen Links mit. */
  export const ZEITFENSTER_PARAMETER = ['datum', 'rueck', 'ab', 'bis', 'vorort'] as const
  export function zeitfensterAusUrl(sp: URLSearchParams, opts?: { mindestNaechte?: number; heute?: string }): Zeitfenster & { gewaehlt: boolean }
  export function zeitfensterSchreiben(sp: URLSearchParams, z: Zeitfenster): URLSearchParams
  export function naechte(z: Pick<Zeitfenster, 'datum' | 'rueck'>): number
  export function alsMin(hhmm: string): number | undefined     // "06:30" → 390, "24:00" → 1440, sonst undefined
  export function alsUhrzeit(min: number): string              // 390 → "6:30", 1440 → "24:00"
  ```
- URL-Format: `datum`/`rueck` JJJJ-MM-TT, `ab`/`bis` "HH:MM", `vorort` Minuten. `zeitfensterSchreiben` lässt Vorgaben weg, setzt `rueck` nur wenn ≠ `datum` und löscht `fenster`.

- [ ] **Step 1: Failing tests:**
  - Leere URL, `heute: '2026-11-19'` → `{ datum: '2026-11-21', rueck: '2026-11-21', abMin: 360, bisMin: 1260, vorOrtMin: 240, gewaehlt: false }`.
  - `datum=2026-11-28&ab=07:00&bis=20:30&vorort=180` → Werte übernommen, `gewaehlt: true`.
  - Review Focus 3: `ab=25:00&bis=05:00&vorort=-5&fenster=360` → Vorgaben 360/1260/240; `datum=2026-01-01` (vergangen) → `gewaehlt: false`; `ab=20:00&bis=19:00` am selben Tag → `bisMin` wird auf `abMin + 30` angehoben (`1230`).
  - Review Focus 2: `datum=2026-11-28&rueck=2026-11-27` mit `mindestNaechte: 1` → `rueck = '2026-11-29'`.
  - `bis=24:00` → `bisMin: 1440`. Schritte werden auf 30 Minuten gerundet (`ab=06:10` → 360).
  - `zeitfensterSchreiben` mit Vorgaben und `fenster=360` in `sp` → Ergebnis ohne `ab`, `bis`, `vorort`, `fenster`.
- [ ] **Step 2:** `npx vitest run tests/lib/zeitfenster.test.ts` → FAIL.
- [ ] **Step 3:** Implementieren; Vorgabedatum mit `naechsterSamstag`, Anheben mit `rueckAnheben` (beide vorhanden). Keine zod-Abhängigkeit (läuft im Browser).
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5: Commit** `feat: Zeitfenster (los ab, zurück bis, vor Ort) in der URL`

### Task 3: Bewertung je Ort

**Files:**
- Create: `src/lib/bewertung.ts`
- Test: `tests/lib/bewertung.test.ts`

**Interfaces:**
- Consumes: `Fahrt`, `Tagesplan`, `Ausgangsort` (Task 1); `Zeitfenster`, `naechte`, `alsMin`, `alsUhrzeit` (Task 2); `bedientAm` (`src/lib/saison.ts`); `minutenAlsDauer` (`src/lib/datum.ts`); `Stufe` (`src/lib/stufe.ts`).
- Produces:
  ```ts
  export type Bewertung =
    | { passt: true; hin: Fahrt; rueck: Fahrt; vorOrtMin: number; naechte: number }
    | { passt: false; grund: string; naechte: number }
  export function bewerte(ort: Pick<Ausgangsort, 'bedient'>, hinPlan: Tagesplan | undefined, rueckPlan: Tagesplan | undefined, z: Zeitfenster): Bewertung
  export function passungPaar(hin: Fahrt | undefined, rueck: Fahrt | undefined, z: Zeitfenster): Bewertung
  export function sortiere<T extends { ort: Ausgangsort; bewertung: Bewertung }>(eintraege: T[], mehrtaegig: boolean): T[]
  export function vorOrtStufe(min: number): Stufe   // ≥ 480 → 2, ≥ 360 → 3, ≥ 240 → 4, sonst 5
  ```
- Regeln (`bewerte`), in dieser Reihenfolge:
  1. `bedientAm(ort, datum)` oder `bedientAm(ort, rueck)` falsch → `grund: 'fährt am Datum nicht'`.
  2. `hinPlan` bzw. `rueckPlan` fehlt → `'keine Fahrplandaten'`.
  3. Keine Hinfahrt mit `ab ≥ abMin` → `` `keine Hinfahrt ab ${alsUhrzeit(abMin)}` ``.
  4. Keine Rückfahrt mit `an ≤ bisMin` → `` `keine Rückfahrt bis ${alsUhrzeit(bisMin)}` ``.
  5. Tagestour: Paar mit `rueck.ab ≥ hin.an`, das `rueck.ab − hin.an` maximiert, bei Gleichstand weniger Umstiege in Summe. Kein solches Paar → `` `Ankunft erst ${früheste an}` `` (Format "11:40"). Bestes Paar unter `vorOrtMin` → `` `nur ${minutenAlsDauer(x)} vor Ort` ``.
  6. Mehrere Tage: früheste Ankunft mit `ab ≥ abMin` am ersten Tag, späteste Abfahrt mit `an ≤ bisMin` am letzten Tag; `vorOrtMin = naechte·1440 + rueck.ab − hin.an`; Mindestzeit gilt nicht.
- `sortiere`: passende vor nicht passenden; Tagestour nach `vorOrtMin` absteigend, mehrere Tage nach `ort.fahrzeitMin` aufsteigend (fehlend zuletzt); nicht passende nach `fahrzeitMin`.

- [ ] **Step 1: Failing tests** mit kleinen handgeschriebenen Plänen:
  - Hin `06:12→09:41`, `07:12→10:41`; Rück `17:18→20:46`, `18:18→21:46`; Fenster 06:00–21:00, 4 h → passt, `hin.ab = '06:12'`, `rueck.ab = '17:18'`, `vorOrtMin = 457`.
  - Gleicher Plan, `vorOrtMin: 480` → `grund: 'nur 7:37 h vor Ort'` (Format von `minutenAlsDauer` prüfen und Erwartung daran anpassen).
  - Hin nur `09:00→11:40`, Rück nur `10:00→12:30` → `'Ankunft erst 11:40'`.
  - Review Focus 1: `hinPlan` undefined → `'keine Fahrplandaten'`, `passt: false`.
  - Review Focus 2: `bedient: [{ von: '06-15', bis: '10-15' }]`, `datum` 2026-10-10, `rueck` 2026-10-17 → `'fährt am Datum nicht'`.
  - Review Focus 4: `bisMin: 1440`, Rück `22:30→23:58` passt; Fenster bis 21:00 → `'keine Rückfahrt bis 21:00'`.
  - Mehrere Tage (`rueck` = `datum` + 2) → `naechte: 2`, passt ohne Mindestzeit.
  - `sortiere` mit drei Einträgen (7 h, 9 h, passt nicht) → Reihenfolge 9 h, 7 h, passt nicht.
- [ ] **Step 2:** `npx vitest run tests/lib/bewertung.test.ts` → FAIL.
- [ ] **Step 3:** Implementieren (rein, ohne zod).
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5: Commit** `feat: Ausgangsorte nach Zeitfenster bewerten`

### Task 4: Skript für den Musterfahrplan und Teillauf

**Files:**
- Create: `src/lib/musterfahrplan/laden.ts`, `scripts/musterfahrplan.ts`, `content/musterfahrplan.json` (vom Skript)
- Modify: `package.json` (Skript `"musterfahrplan": "tsx scripts/musterfahrplan.ts"`), `src/lib/richtwerte.ts` (nur `referenzTage` nutzen, nichts ändern)
- Test: `tests/lib/musterfahrplan/laden.test.ts`

**Interfaces:**
- Consumes: Task 1; `planenGeduldig` (`src/lib/verbindung/transitous-geduldig.ts`), `referenzTage`, `TAGESKLASSEN`, `tagesfensterZiele` (`src/lib/richtwerte.ts`), `ladeFahrplan`, `ladeInhalt`, `zuUtcIso`.
- Produces: `MusterfahrplanSchema` (zod) und `ladeMusterfahrplan(datei?: string): Musterfahrplan | undefined` (fehlt die Datei → `undefined`, ungültig → Fehler mit Dateiname wie in `content/laden.ts`).
- Anfragen je Ort und Tagesklasse: Hin `zeit = zuUtcIso(tag, 240)`, `ankunftBis: false`, `anzahl: 20`; Rück `zeit = zuUtcIso(tag, 1440)`, `ankunftBis: true`, `anzahl: 20`. Zwei parallel wie `scripts/richtwerte.ts`. Optionen: `--klasse werktag|sa|so` (mehrfach), `--nur <haltestelle-id>`, `--sa/--so/--werktag JJJJ-MM-TT`. Vorhandene Einträge anderer Orte und Klassen bleiben erhalten (zusammenführen, nicht überschreiben). Die Strecke kommt aus der Hinfahrt-Antwort der ersten berechneten Klasse in der Reihenfolge `sa`, `so`, `werktag`. Am Ende Ausgabe: Zahl der Anfragen und Orte, deren letzte Hinfahrt vor 14:00 oder deren früheste Rückfahrt nach 14:00 liegt (Abdeckung prüfen).

- [ ] **Step 1: Failing test** für `ladeMusterfahrplan`: eine Fixture-Datei in `tests/fixtures/musterfahrplan.json` mit einem Ort lädt; fehlende Datei → `undefined`; `ab: '6:12'` (ohne führende Null) → Fehler mit Dateiname.
- [ ] **Step 2:** `npx vitest run tests/lib/musterfahrplan/laden.test.ts` → FAIL.
- [ ] **Step 3:** Schema, Laden und Skript implementieren. Kopfkommentar mit Aufrufen und dem Budget-Hinweis (Global Constraints).
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5: Teillauf (etwa 60 Anfragen, heute erlaubt):** `npm run musterfahrplan -- --nur kandersteg`, dann je ein Lauf für `feldberg-baerental`, `bad-urach`, `grindelwald`, `oberstdorf`, `triberg`, `zermatt`, `baden-baden`, `sonthofen`, `brienz`.
  Expected: je Ort drei Klassen, jede mit mindestens 8 Hinfahrten und 6 Rückfahrten; die Abdeckungswarnung erscheint bei Orten mit Stundentakt nicht. Erscheint sie, je Richtung eine Folgeanfrage ab der letzten gefundenen Zeit einbauen (Anfragebudget im Kopfkommentar anpassen) und den Teillauf wiederholen.
- [ ] **Step 6: Commit** `feat: Skript für den typischen Tagesfahrplan der Ausgangsorte` (Skript, Loader, Test, Fixture, `content/musterfahrplan.json` mit den Teildaten)

### Task 5: Ausgangsorte und Dateien für den Browser

**Files:**
- Create: `src/lib/ausgangsorte.ts`
- Modify: `scripts/karte.ts`, `.gitignore` (falls `public/karte.json` dort steht: `public/ausgangsorte.json` und `public/tagesplaene/` ebenso)
- Test: `tests/lib/ausgangsorte.test.ts`

**Interfaces:**
- Consumes: `Inhalt`, `Musterfahrplan`, `Ausgangsort`, `Linie`, `Tagesplan`, `Tagesklasse`.
- Produces:
  ```ts
  export function ausgangsorte(i: Inhalt, startortId: string): Ausgangsort[]
  export type AusgangsortDatei = { liveBis: string; berechnetAm?: string; orte: Ausgangsort[]; strecken: Record<string, Linie[]> }
  export function ausgangsortDatei(orte: Ausgangsort[], m: Musterfahrplan | undefined, liveBis: string): AusgangsortDatei
  export function tagesplanDatei(m: Musterfahrplan | undefined, klasse: Tagesklasse): Record<string, Tagesplan>
  ```
  `name` = Haltestellenname, `gebiet` = Gebietsname, `region`/`land`/`bedient` von der Haltestelle, `ticket`/`fahrzeitMin` aus `richtwerte[startortId]`, Koordinaten der Haltestelle.
- `scripts/karte.ts` schreibt zusätzlich `public/ausgangsorte.json` und `public/tagesplaene/{werktag,sa,so}.json`.

- [ ] **Step 1: Failing tests** mit `tests/fixtures/content` (vorhandene Test-Inhalte) und der Fixture aus Task 4: je Gebiet genau ein Ort mit `id` = Gebiets-id und `haltestelleId` = erste Haltestelle; `tagesplanDatei(undefined, 'sa')` → `{}`; Strecken nur für Orte mit Daten.
- [ ] **Step 2:** `npx vitest run tests/lib/ausgangsorte.test.ts` → FAIL.
- [ ] **Step 3:** Implementieren, `scripts/karte.ts` erweitern.
- [ ] **Step 4:** Test → PASS; `npx tsx scripts/karte.ts` → Ausgabe nennt drei Tagesplan-Dateien; `du -h public/tagesplaene/*` zeigt mit Teildaten wenige KB, Hochrechnung auf 84 Orte unter 100 KB je Klasse.
- [ ] **Step 5: Commit** `feat: Ausgangsorte und Tagespläne für die Karte erzeugen`

### Task 6: Live-Fahrten für die Ortsseite (`/api/fahrten`)

**Files:**
- Create: `src/lib/verbindung/fahrten.ts`, `src/app/api/fahrten/route.ts`
- Modify: `src/lib/verbindung/parameter.ts` (Schema `FahrtenSchema`, `parseFahrtenParameter`)
- Test: `tests/lib/verbindung/fahrten.test.ts`, `tests/app/api/fahrten.test.ts`

**Interfaces:**
- Consumes: `planen`, `Itinerary` (transitous.ts); `kurzfassung`, `VerbindungKurz`, `hatFernverkehr` (auswerten.ts); `ticketFuer`, `TicketHinweis` (regeln.ts); `FehlerArt` (service.ts, nur Typ); `viaAus` (Task 1); `Zeitfenster` (Task 2); `ladeMusterfahrplan` (Task 4); `ladeFahrplan`, `nachLiveBis`; `tagesklasse`.
- Produces:
  ```ts
  export type Lage = 'frueher' | 'passend' | 'spaeter'
  export type FahrtLive = VerbindungKurz & { via: string[]; lage: Lage }
  export type FahrtenAntwort = {
    quelle: 'live' | 'typisch'; datum: string; rueck: string
    hin: FahrtLive[]; rueckfahrten: FahrtLive[]; ticket: TicketHinweis
    abweichungMin?: number; fehlerArt?: FehlerArt; hinweis?: string
  }
  export async function fahrtenErmitteln(a: { startort: Startort; haltestelle: Haltestelle; z: Zeitfenster; tickets: TicketTabelle; muster?: { hin?: Tagesplan; rueck?: Tagesplan }; heute?: string; fahrplan?: Fahrplan }, deps?: { planen: typeof planen }): Promise<FahrtenAntwort>
  export async function weitereFahrten(a: { startort: Startort; haltestelle: Haltestelle; richtung: 'hin' | 'rueck'; zeitIso: string }, deps?: { planen: typeof planen }): Promise<FahrtLive[]>
  ```
- Route `GET /api/fahrten?von=<startort>&nach=<haltestelle>&datum&rueck&ab&bis` → `FahrtenAntwort`; mit `weiter=hin|rueck&zeit=<ISO>` → `{ fahrten: FahrtLive[] }`. Cache wie `/api/verbindung` (`s-maxage=86400`, bei `quelle: 'typisch'` oder Fehler 300 s).
- Abfragen: Hin `zeit = zuUtcIso(datum, abMin − 90)`, `anzahl: 8`; daraus die letzte mit Abfahrt vor `abMin` (`frueher`) und bis zu drei ab `abMin` (`passend`). Rück am `rueck`-Datum `ankunftBis: true`, `zeit = zuUtcIso(rueck, bisMin + 90)`, `anzahl: 8`; bis zu drei mit Ankunft ≤ `bisMin` (späteste zuerst gewählt, aufsteigend angezeigt, `passend`) und die erste danach (`spaeter`). `weitereFahrten`: eine Anfrage, `anzahl: 4`, Abfahrt (hin) bzw. Ankunft (rück) nach `zeitIso`.
- Ohne Live (Datum vergangen, nach `liveBis`, beide Anfragen fehlgeschlagen): `quelle: 'typisch'` aus `muster`, Uhrzeiten mit `zuUtcIso` auf das Datum gesetzt, `abschnitte: []`, `fehlerArt` wie in `service.ts`, nach `liveBis` `hinweis` = Global-Constraints-Text.
- `abweichungMin`: kürzeste `dauerMin` der passenden Live-Hinfahrten minus kürzeste Dauer der Muster-Hinfahrten mit `ab ≥ abMin`; nur gesetzt, wenn ≥ 30.

- [ ] **Step 1: Failing tests** (`planen` gemockt wie in `tests/lib/verbindung/service.test.ts`):
  - Hin-Antwort mit Abfahrten 05:12, 06:12, 07:12, 08:12, 09:12 und `ab` 06:00 → `lage` `['frueher','passend','passend','passend']`, 09:12 fehlt.
  - Rück-Antwort mit Ankunft 18:46, 19:46, 20:46, 21:46 und `bis` 21:00 → drei `passend` (18:46, 19:46, 20:46) und 21:46 `spaeter`.
  - Genau zwei `planen`-Aufrufe je `fahrtenErmitteln`.
  - `datum` nach `liveBis` → kein `planen`-Aufruf, `quelle: 'typisch'`, `hinweis` enthält "Verbindung am Datum auf der Ortsseite prüfen".
  - Live-Hinfahrt 4:30 h, Muster 3:29 h → `abweichungMin: 61`; 3:40 h → kein `abweichungMin`.
  - Route: Review Focus 5, Aufruf nur mit `von` und `nach` → 200 mit Vorgaben (kommender Samstag, 06:00–21:00); `ab=xx` → Vorgabe statt 400; unbekannte Haltestelle → 404.
- [ ] **Step 2:** Tests → FAIL.
- [ ] **Step 3:** Implementieren. `muster` lädt die Route über `ladeMusterfahrplan()` und `tagesklasse(datum)` bzw. `tagesklasse(rueck)`.
- [ ] **Step 4:** Tests → PASS; `npm test` grün.
- [ ] **Step 5: Commit** `feat: Live-Fahrten mit früherer und späteren Verbindungen für die Ortsseite`

### Task 7: Stand von `main` übernehmen

Die andere Session prüft und merged `qualitaet-2026-11` nach `main`; dabei können noch Korrekturen dazukommen. Vor dem Umbau der Seiten (Tasks 8 bis 12) diesen Stand holen.

- [ ] **Step 1:** `git log --oneline zeitfenster-karte..main` zeigt neue Commits? Dann `git merge main` im Worktree. Konflikte auflösen: Inhalte (`content/`) von `main`, eigene neue Dateien behalten. Keine neuen Commits → Task überspringen.
- [ ] **Step 2:** `npm test && npm run lint && npx tsc --noEmit` → grün.
- [ ] **Step 3: Commit** (Merge-Commit).

### Task 8: Routengruppen, gemeinsamer Kartenrahmen

**Files:**
- Create: `src/app/(karte)/layout.tsx`, `src/app/(seiten)/layout.tsx`, `src/components/karte/KartenRahmen.tsx`, `src/components/karte/useBewertungen.ts`
- Move (`git mv`): `src/app/page.tsx` → `src/app/(karte)/page.tsx`; `src/app/gebiet` → `src/app/(karte)/gebiet`; `src/app/{ueber,datenschutz,impressum,sektionstouren,huette}` → `src/app/(seiten)/…`
- Modify: `src/app/layout.tsx` (`<main>` ohne Breitenbegrenzung), `src/app/not-found.tsx` (eigene Breite wie `(seiten)`)
- Modify: `src/lib/bewertung.ts` (`bewerteAlle`)
- Test: `tests/lib/bewertung.test.ts` (Ergänzung für `bewerteAlle`)

**Interfaces:**
- Consumes: Tasks 2, 3, 5.
- Produces:
  - `useBewertungen(z: Zeitfenster & { gewaehlt: boolean }): { orte: Ausgangsort[]; strecken: Record<string, Linie[]>; liveBis?: string; bewertungen: Record<string, Bewertung> | null; laedt: boolean }` – lädt `/ausgangsorte.json` und `/tagesplaene/<klasse>.json` je einmal pro Sitzung (Modul-Cache von Promises), `bewertungen` ist `null`, solange `gewaehlt` falsch ist.
  - `bewerteAlle(orte: Ausgangsort[], plaene: Partial<Record<Tagesklasse, Record<string, Tagesplan>>>, z: Zeitfenster): Record<string, Bewertung>` in `src/lib/bewertung.ts` (rein; Schlüssel ist die Gebiets-id `ort.id`, die Pläne werden über `ort.haltestelleId` gefunden).
  - `KartenRahmen({ children })`: ab `lg` zweispaltig (links Feld mit eigenem Scroll, Breite etwa 28rem; rechts Karte, `sticky` unter dem Header über die volle Höhe); unter `lg` auf `/` Umschalter Liste | Karte (Parameter `ansicht` wie heute, `src/lib/steuerleiste.ts` `ansichtAus`), auf `/gebiet/<id>` Kartenstreifen von etwa 10rem über dem Feld, Antippen setzt `ansicht=karte`. Die gewählte Gebiets-id kommt aus `usePathname()`.
- Die Karte selbst kommt in Task 10; bis dahin rendert `KartenRahmen` an ihrer Stelle `KartePlatzhalter` aus `Karte.tsx`.

- [ ] **Step 1: Failing test** für `bewerteAlle`: zwei Orte, Pläne nur für einen → einer `passt`/Grund aus Task 3, der andere `'keine Fahrplandaten'`; Mehrtägig nutzt `tagesklasse(datum)` für Hin und `tagesklasse(rueck)` für Rück.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Verschieben, Layouts, Rahmen und Hook implementieren. `useSearchParams` nur unter einer `Suspense`-Grenze (Next 16, siehe Docs); Gebietsseiten bleiben über `generateStaticParams` statisch.
- [ ] **Step 4:** Test → PASS; `npm run build` → erfolgreich, `/gebiet/[id]` weiterhin als statisch erzeugt gemeldet; `npm run dev`, `/ueber` und `/huette/<id>` sehen aus wie vorher.
- [ ] **Step 5: Commit** `refactor: Routengruppen (karte) und (seiten), gemeinsamer Kartenrahmen`

### Task 9: Startseite: Zeitfenster wählen und Liste

**Files:**
- Create: `src/components/zeitfenster/ZeitfensterWahl.tsx`, `src/components/zeitfenster/Zeitband.tsx`, `src/components/karte/AusgangsortListe.tsx`
- Modify: `src/app/(karte)/page.tsx` (Titel, Unterzeile, `ZeitfensterWahl`, `AusgangsortListe`; keine `Startseite`, keine Suche, kein Filter)
- Test: `tests/lib/zeitfenster.test.ts` (Ergänzung: `schnellwahl`)

**Interfaces:**
- Consumes: Tasks 2, 3, 8; `naechsterSamstag`, `datumKurz`, `minutenAlsDauer`; `TicketBadge` (`Badges.tsx`); `Sheet`.
- Produces:
  - `schnellwahl(heute: string): { label: string; datum: string }[]` in `src/lib/zeitfenster.ts` – kommender Samstag und Sonntag, Label wie "Sa 22.11."
  - `ZeitfensterWahl({ mindestNaechte?: 0 | 1 })`: Datum (Schnellwahl-Chips und `<input type="date">`), Segment Tagestour | Mehrere Tage (Mehrere Tage zeigt Rückfahrtdatum, mindestens `datum + 1`), `Zeitband`, Schieber "Mindestens vor Ort" (0 bis 10 h, Schritt 30 min, 0 zeigt "egal", nur Tagestour). Schreibt per `zeitfensterSchreiben` und `history.replaceState` in die URL (wie heute in `Zeitraum.tsx`).
  - `Zeitband({ abMin, bisMin, onChange })`: zwei `<input type="range">` mit gemeinsamer Spur, 240 bis 1440, Schritt 30, Beschriftung "los ab 6:00" und "zurück bis 21:00"; per Tastatur bedienbar, je ein `aria-label`. Wenn zwei Griffe auf einer Spur auf dem Handy hakeln: zwei getrennte Schieber.
  - `AusgangsortListe()`: ohne gewähltes Datum der Satz "Wähle ein Datum, dann zeigt die Karte, wohin du hin und zurück kommst."; sonst Überschrift "<n> Ausgangsorte passen", Einträge nach `sortiere` mit Name, "Gebiet <Gebiet> · <Region>", Hinfahrt "6:12 → 9:41", Rückfahrt "17:18 → 20:46", "7:37 h vor Ort" (Tagestour) bzw. "<n> Nächte", Ticket; Eintrag ist `ZeitraumLink` auf `/gebiet/<id>`. Darunter `<details>` "<m> passen nicht" mit Name und Grund. Bei `datum > liveBis` unter der Überschrift der Hinweis aus den Global Constraints; sonst "Zeiten nach typischem Fahrplan. Die Verbindung am Datum steht auf der Ortsseite."
  - `ZEITRAUM_PARAMETER` in `src/lib/zeitraum.ts` wird zu `ZEITFENSTER_PARAMETER`, damit `ZeitraumLink` das ganze Zeitfenster mitnimmt.

- [ ] **Step 1: Failing test** `schnellwahl('2026-11-19')` → `[{ label: 'Sa 21.11.', datum: '2026-11-21' }, { label: 'So 22.11.', datum: '2026-11-22' }]`; an einem Samstag beginnt sie mit heute.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Komponenten und Seite bauen. Titel "In die Berge, ohne Auto." bleibt.
- [ ] **Step 4:** Test → PASS. `npm run dev`: erster Aufruf zeigt keine Orte; Klick auf "Sa" füllt die Liste mit den Orten aus dem Teillauf; Ziehen am Zeitband ändert Liste und URL ohne Netzwerkanfrage (Netzwerk-Tab: nach dem ersten Laden keine weiteren Anfragen).
- [ ] **Step 5: Commit** `feat: Startseite fragt zuerst nach dem Zeitfenster`

### Task 10: Karte mit Ausgangsorten und Strecken

**Files:**
- Create: `src/components/karte/AusgangsortKarte.tsx`, `src/lib/karte-ausgangsorte.ts`
- Modify: `src/components/karte/KartenRahmen.tsx` (Karte statt Platzhalter)
- Test: `tests/lib/karte-ausgangsorte.test.ts`

**Interfaces:**
- Consumes: Tasks 3, 5, 8; `STUFE_FARBE`, `reisezeitStufe`; `escapeHtml` (`src/lib/karte.ts`); Kartenstil, Worker und `OFFENBURG` wie in `Karte.tsx`.
- Produces:
  - `karteDaten(orte: Ausgangsort[], strecken: Record<string, Linie[]>, bewertungen: Record<string, Bewertung> | null, mehrtaegig: boolean): { punkte: FeatureCollection; linien: FeatureCollection }` – Punkt-Eigenschaften `id`, `name`, `passt`, `stufe` (`vorOrtStufe` bzw. `reisezeitStufe(fahrzeitMin)`), `rang` (vor Ort in Minuten, für Zeichenreihenfolge), `zeile` (z. B. "6:12 → 9:41 · 17:18 → 20:46 · 7:37 h vor Ort" oder der Grund); Linien nur für passende Orte, mit `id`, `stufe`, `rang`. Ohne Bewertungen: keine Punkte.
  - `hoverHtml(p): string` (Name fett, darunter `zeile`, alles escaped).
  - `AusgangsortKarte({ daten, auswahl?: string, onWahl: (id: string) => void })`: Ebenen Linien (`line-sort-key` = `rang`, Farbe nach `stufe`, Breite 3), Punkte (passend in Stufenfarbe, nicht passend grau `#7a8078`, kleiner), Namen ab Zoom 7, Offenburg. Überfahren zeigt `hoverHtml` als Popup; Klick ruft `onWahl`. Mit `auswahl`: deren Linie Breite 5, andere Linien und Punkte Deckkraft 0.2, `fitBounds` auf Linie plus Offenburg. Legende unten links mit den vier Stufen ("8 h und mehr", "6 h", "4 h", "weniger") bzw. Fahrzeit bei mehreren Tagen.
  - `KartenRahmen` ruft bei `onWahl` `router.push` auf `/gebiet/<id>` mit `zeitfensterSchreiben`-Query.

- [ ] **Step 1: Failing tests** für `karteDaten`: ohne Bewertungen 0 Punkte; ein passender Ort mit 457 min → `stufe: 4`, `rang: 457`, eine Linie; ein nicht passender Ort → Punkt mit `passt: false` und Grund in `zeile`, keine Linie; `hoverHtml` escaped `<`.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Implementieren; `Karte.tsx` und `src/lib/karte.ts` bleiben bis Task 12 unangetastet.
- [ ] **Step 4:** Test → PASS. `npm run dev`, Datum wählen: Punkte und Strecken erscheinen eingefärbt, Strecken folgen den Gleisen, Klick öffnet `/gebiet/<id>` und die Karte lädt dabei nicht neu (keine erneute Anfrage nach Kacheln/`ausgangsorte.json`).
- [ ] **Step 5: Commit** `feat: Karte mit Ausgangsorten und Strecken, eingefärbt nach Zeit vor Ort`

### Task 11: Ortsseite neben der Karte

**Files:**
- Create: `src/components/ort/Fahrtenwahl.tsx`, `src/components/ort/FahrtZeile.tsx`, `src/lib/fahrtenwahl.ts`
- Modify: `src/app/(karte)/gebiet/[id]/page.tsx`
- Test: `tests/lib/fahrtenwahl.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 3, 6, 8, 10; `VerbindungDetail`, `VerbindungZeile` (Stand nach Task 7), `HuetteKarte`, `HuettenZustand`, `TourKarte`, `TourEmbed`, `Co2Zeile`, `fahrplanLink`, `rueckfahrtLink`, `datumKurz`, `minutenAlsDauer`, `naechteText`.
- Produces:
  - `vorauswahl(a: FahrtenAntwort, z: Zeitfenster): { hin?: number; rueck?: number }` – Indizes des Paars aus passenden Fahrten mit größter Zeit vor Ort (bei mehreren Tagen: früheste passende Hinfahrt, späteste passende Rückfahrt).
  - `vorOrtText(hin?: FahrtLive, rueck?: FahrtLive, naechte: number): string` – "7:37 h vor Ort (9:41 bis 17:18)", bei Rückfahrt vor Ankunft "Rückfahrt vor der Ankunft", bei mehreren Tagen `naechteText(n)`.
  - `Fahrtenwahl({ von, nach })` (Client): lädt `/api/fahrten`, zeigt Abschnitte "Hinfahrt <Datum> ab Offenburg" und "Rückfahrt <Datum> nach Offenburg" mit `FahrtZeile`, wählbar per Klick (`aria-pressed`), Zeile darunter mit `vorOrtText`, Knöpfe "Weitere Abfahrten" je Richtung (`/api/fahrten?weiter=…`), Abweichungshinweis als `warnhinweis`, bei `quelle: 'typisch'` Kennzeichnung "typischer Fahrplan" plus `hinweis` und Portallinks, Ticket-Hinweis.
  - `FahrtZeile({ f, gewaehlt, onWahl, link })`: "06:12 → 09:41 · 3:29 h · via Basel SBB, Bern", `frueher` mit Zusatz "früher als gewünscht", `spaeter` mit "später als gewünscht" (beide gedämpft), aufklappbar mit `VerbindungDetail` und Link "bei SBB"/"bei bahn.de".
- Seitenaufbau: Pfeil "← Zurück zur Karte (<Datum>, 6:00–21:00)" als `ZeitraumLink` auf `/`; Überschrift = Name des Hauptzugangs; Unterzeile "Gebiet <Gebiet> · <Region> · <Land>" plus Ticket; `ZeitfensterWahl` eingeklappt hinter einer Pill (wie heute die Zeitraum-Pill); `Fahrtenwahl`; CO₂-Zeile; "Weitere Haltestellen im Gebiet" (je `<details>`, `VerbindungZeile` erst beim Öffnen gerendert); "Von hier erreichbar": bei mehreren Tagen zuerst Hütten, sonst zuerst Touren und Links, dann Hütten. Die Ergänzungen der anderen Session (`WetterZeile`, `EinladenKnopf`, `KostenZeile`, `LawinenHinweis`) bleiben erhalten und stehen unter "Von hier erreichbar"; der Rückfahrt-Rechner (`src/lib/rueckfahrt.ts` und seine Anzeige auf der Gebietsseite) entfällt dort zugunsten der Fahrtenwahl. Auf Hüttenseiten bleibt er, sofern er dort genutzt wird. Metadaten, JSON-LD, `generateStaticParams` bleiben.

- [ ] **Step 1: Failing tests** für `vorauswahl` und `vorOrtText`: Antwort mit Hin 06:12/07:12 (passend) und 05:12 (früher), Rück 16:18/17:18 (passend) und 18:18 (später), Fenster 06:00–21:00 → `{ hin: <Index 06:12>, rueck: <Index 17:18> }`; `vorOrtText` → "7:37 h vor Ort (9:41 bis 17:18)"; Rückfahrt 09:00 bei Ankunft 09:41 → "Rückfahrt vor der Ankunft".
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** Test → PASS. `npm run dev`: `/gebiet/kandersteg?datum=<nächster Sa>` zeigt Live-Fahrten (Netzwerk: genau ein `/api/fahrten`), Auswahl ändert "vor Ort", "Weitere Abfahrten" lädt nach; direkt `/gebiet/kandersteg` ohne Parameter zeigt den kommenden Samstag; Handy-Breite (375 px) zeigt den Kartenstreifen mit der Strecke.
- [ ] **Step 5: Commit** `feat: Ortsseite neben der Karte mit wählbaren Hin- und Rückfahrten`

### Task 12: Zeitfenster statt Tagesziel auf allen Seiten, Altes entfernen

**Files:**
- Modify: `src/lib/verbindung/service.ts`, `src/lib/verbindung/auswerten.ts`, `src/lib/verbindung/parameter.ts`, `src/lib/verbindung/url.ts`, `src/lib/verbindung/regeln.ts`, `src/app/api/verbindung/route.ts`, `src/components/VerbindungZeile.tsx`, `src/components/SektionstourVerbindung.tsx`, `src/components/Zeitraum.tsx`, `src/components/Badges.tsx`, `src/app/(seiten)/huette/[id]/page.tsx`, `src/app/(seiten)/sektionstouren/page.tsx`, `src/app/(seiten)/ueber/page.tsx`, `src/lib/richtwerte.ts`, `src/lib/content/schema.ts`, `scripts/richtwerte.ts`, `scripts/rauchtest.ts`, `README.md`
- Delete: `src/components/{Startseite,Filter,Suche,GebietKarte,Ergebnisstreifen,DatumWahl,Karte}.tsx`, `src/lib/{filter,karte}.ts` (sofern nichts mehr importiert), `src/lib/verbindung/uebersicht.ts`, `src/app/api/uebersicht/route.ts` und die zugehörigen Tests
- Test: `tests/lib/verbindung/service.test.ts`, `tests/lib/verbindung/auswerten.test.ts`, `tests/app/api/verbindung.test.ts` anpassen

**Interfaces:**
- Consumes: Tasks 2, 3.
- Produces:
  - `VerbindungAnfrage`: `mindestFensterMin` ersetzt durch `z: Zeitfenster`. `VerbindungAntwort`: `tagesziel`, `tageszielGrund`, `tourenfensterMin` ersetzt durch `passung?: Bewertung` (aus `passungPaar` mit den gewählten Fahrten).
  - `waehleHinfahrt(its, opts: HinfahrtOptionen & { abMin?: number })`: `hinfahrt` = beste mit Abfahrt in `[abMin, abMin + 180)`, `hinfahrtSpaeter` in `[abMin + 180, abMin + 240)`; Vorgabe `abMin = 300` (gleiches Verhalten wie bisher für `richtwertAus`). `waehleRueckfahrt(its, datum, bisMin = 1380)`.
  - `/api/verbindung` liest `ab`, `bis`, `vorort` (wie Task 2, `fenster` wird ignoriert); Hin-Abfrage ab `abMin`, Rück-Abfrage mit Ankunft bis `bisMin`.
  - `VerbindungZeile` zeigt statt `TageszielBadge` "passt, 7:37 h vor Ort" oder den Grund; `ZeitraumPill` öffnet `ZeitfensterWahl` im Sheet statt `DatumWahl`; `useZeitraum` liefert `zeitfensterAusUrl`.
  - Tagesfenster entfällt: `TagesfensterSchema` und `richtwerte.*.tagesfenster` aus dem Schema, `tagesfensterAus`, `tagesfensterSchreiben`, `--nur-tagesfenster`; `tagesfensterZiele` heißt `hauptzugaenge` (Task 4 entsprechend umstellen). Vorhandene `tagesfenster`-Einträge in `content/haltestellen/*.yaml` mit einem einmaligen `tsx`-Aufruf über `yaml` `deleteIn` entfernen (nicht von Hand). Die andere Session hat `content/haltestellen` und `scripts/richtwerte.ts` freigegeben; vor dem Commit kurz Bescheid geben, dass ihre Tagesfenster-Daten wegfallen.
  - `/ueber`: Absatz und Glossar zu "Tagesziel" durch eine Erklärung des Zeitfensters und des typischen Fahrplans ersetzen.
  - README: Abschnitt "Musterfahrplan" (Aufrufe, Budget, Neuberechnung nach Anheben von `liveBis`), Tagesfenster-Aufrufe entfernen.

- [ ] **Step 1: Tests anpassen (failing):** `service.test.ts` erwartet `passung` statt `tagesziel` und bei `z.abMin = 420` keine Hinfahrt vor 07:00; `auswerten.test.ts` prüft `waehleHinfahrt` mit `abMin: 420` und unverändertes Verhalten ohne `abMin`; `verbindung.test.ts` prüft, dass `fenster=360` ignoriert wird und `ab=07:00` ankommt.
- [ ] **Step 2:** `npm test` → die angepassten Tests FAIL.
- [ ] **Step 3:** Umbauen und löschen. Danach `grep -rn "tagesziel\|Tagesziel\|tagesfenster\|uebersicht\|mindestFensterMin" src scripts tests` → keine Treffer außer bewusst erklärten.
- [ ] **Step 4:** `npm test && npm run lint && npx tsc --noEmit && npm run build` → grün.
- [ ] **Step 5: Commit** `refactor: Zeitfenster ersetzt Tagesziel, alte Startseite entfernt`

### Task 13: Voller Datenlauf und Abnahme

- [ ] **Step 1: Voller Lauf an einem freien Tag** (kein anderer Transitous-Lauf an diesem Tag; mit der anderen Session abstimmen): `npm run musterfahrplan -- --klasse sa --klasse so` (etwa 336 Anfragen), am folgenden Tag `npm run musterfahrplan -- --klasse werktag` (etwa 168). Expected: Ausgabe ohne Fehler für mindestens 80 der 84 Orte; Abdeckungswarnungen einzeln prüfen.
- [ ] **Step 2:** `npx tsx scripts/karte.ts && du -h public/tagesplaene/*.json public/ausgangsorte.json` → jede Tagesplan-Datei unter 100 KB.
- [ ] **Step 3: Abnahme im Browser** (`npm run dev`), Desktop und 375 px:
  - Erster Aufruf: nur Formular, Karte zeigt nur Offenburg.
  - Sa mit 06:00–21:00, 4 h: Karte färbt Orte und Strecken; Schwarzwald und Rheintal grün, Wallis eher gelb oder grau; Liste passt zur Karte.
  - Zeitband auf 08:00–18:00: sofortige Änderung ohne Netzwerkanfrage.
  - Mehrere Tage Sa–So: Sortierung nach Fahrzeit, Nächte statt vor Ort.
  - Datum nach dem 12.12.: Hinweis aus den Global Constraints.
  - Klick auf Kandersteg: Ortsseite neben der Karte, Strecke hervorgehoben, Live-Fahrten, Auswahl ändert vor Ort, zurück zur Karte behält das Zeitfenster.
  - Hüttenseite und `/sektionstouren` zeigen Fahrten im Zeitfenster und kein Tagesziel-Badge.
  - Alter Link `/?fenster=360&datum=<Sa>` funktioniert.
- [ ] **Step 4: Commit** `chore: Musterfahrplan für alle Ausgangsorte`
