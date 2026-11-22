# Zeitfenster-UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Datumswahl als Hin- und Rückzeile ohne Tagestour-Schalter, Kopfzeile über die volle Breite ohne doppelten Titel, klarer Zurück-Knopf auf der Ortsseite.

**Architecture:** Neue reine Helfer in `src/lib/zeitfenster.ts` (getestet), darauf baut die neu gegliederte `ZeitfensterWahl`. Kopfzeile, Startseiten-Titel und Zurück-Knopf sind reine Markup-Änderungen. URL-Format und Bewertung bleiben unverändert.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-22-zeitfenster-ux-design.md`

## Global Constraints

- Vor Code an Next-spezifischen Dateien die passende Anleitung in `node_modules/next/dist/docs/` lesen (AGENTS.md).
- URL-Parameter unverändert: `datum`, `rueck`, `ab`, `bis` (HH:MM), `vorort` (min); geteilte Links gelten weiter.
- Keine neue Abhängigkeit. Alle Texte deutsch, Anrede „du“.
- Tippflächen mindestens 44 px (`min-h-11`). Gestaltung nach `docs/design-system.md` und den Klassen in `src/app/globals.css` (`chip`, `chip-aktiv`, `pill`, `knopf-sekundaer`).
- Uhrzeiten in 30-Minuten-Stufen von 4:00 bis 24:00 (`ZEITBAND`), Anzeige über `alsUhrzeit`.
- Hüttenseite (`mindestNaechte = 1`): Rückdatum frühestens Hindatum + 1, kein „mindestens vor Ort“.

## Review Focus

1. Mehrtägig gewählt (Sa→Mo), dann Hindatum auf Fr verschoben: Rückdatum wird So (Nächte bleiben 2), nie vor dem Hindatum.
2. Gleicher Tag, „ab“ auf eine Zeit nach „bis“ gestellt: „bis“ rückt eine Stufe hinter „ab“; umgekehrt rückt „ab“ vor „bis“.
3. Mehrere Tage: „bis“ darf vor „ab“ liegen (anderer Tag), nichts weicht aus.
4. Hüttenseite: Schnellwahl zeigt nur „Wochenende“, Rückdatum lässt sich nicht auf den Hintag setzen.
5. Ohne gewähltes Datum: Uhrzeit ändern schreibt nur Uhrzeiten in die URL, kein `datum` (bestehende Regel R6).

---

### Task 1: Helfer für Datumsfolge, Schnellwahl und Ausweichen

**Files:**
- Modify: `src/lib/zeitfenster.ts`
- Test: `tests/lib/zeitfenster.test.ts`

**Interfaces:**
- Produces:
  - `rueckNachHinwechsel(alt: Pick<Zeitfenster,'datum'|'rueck'>, neuesDatum: string, mindestNaechte = 0): string` — Zahl der Nächte bleibt, mindestens `mindestNaechte`.
  - `schnellwahl(heute: string, mindestNaechte = 0): { label: string; datum: string; rueck: string }[]` — Sa, So (je Tagestour), „Wochenende“ (Sa→So); Einträge mit weniger Nächten als `mindestNaechte` fallen weg.
  - `zeitenAusweichen(alt: {abMin:number;bisMin:number}, neu: {abMin:number;bisMin:number}, gleicherTag: boolean): {abMin:number;bisMin:number}` — Logik aus `band()` in `ZeitfensterWahl` (die bewegte Seite gewinnt, die andere weicht um eine Stufe aus; Grenzen `ZEITBAND`); bei `gleicherTag=false` unverändert `neu`.
- Entfernt: `rueckFuerArt` samt Test.

- [ ] **Step 1: Failing tests schreiben**

```ts
describe('rueckNachHinwechsel', () => {
  it('Tagestour bleibt Tagestour', () => {
    expect(rueckNachHinwechsel({ datum: '2026-11-28', rueck: '2026-11-28' }, '2026-12-05')).toBe('2026-12-05')
  })
  it('behält die Nächte', () => {
    expect(rueckNachHinwechsel({ datum: '2026-11-28', rueck: '2026-11-30' }, '2026-11-27')).toBe('2026-11-29')
  })
  it('hält bei Hütten mindestens eine Nacht', () => {
    expect(rueckNachHinwechsel({ datum: '2026-11-28', rueck: '2026-11-28' }, '2026-12-05', 1)).toBe('2026-12-06')
  })
})
describe('schnellwahl', () => {
  it('Samstag, Sonntag und Wochenende', () => {
    expect(schnellwahl('2026-11-19')).toEqual([
      { label: 'Sa 21.11.', datum: '2026-11-21', rueck: '2026-11-21' },
      { label: 'So 22.11.', datum: '2026-11-22', rueck: '2026-11-22' },
      { label: 'Wochenende', datum: '2026-11-21', rueck: '2026-11-22' },
    ])
  })
  it('Hütten: nur Einträge mit Übernachtung', () => {
    expect(schnellwahl('2026-11-19', 1)).toEqual([{ label: 'Wochenende', datum: '2026-11-21', rueck: '2026-11-22' }])
  })
})
describe('zeitenAusweichen', () => {
  const alt = { abMin: 360, bisMin: 1260 }
  it('ab hinter bis schiebt bis eine Stufe nach', () => {
    expect(zeitenAusweichen(alt, { abMin: 1320, bisMin: 1260 }, true)).toEqual({ abMin: 1320, bisMin: 1350 })
  })
  it('bis vor ab schiebt ab eine Stufe vor', () => {
    expect(zeitenAusweichen(alt, { abMin: 360, bisMin: 300 }, true)).toEqual({ abMin: 270, bisMin: 300 })
  })
  it('ab ganz am Ende bleibt eine Stufe vor 24:00', () => {
    expect(zeitenAusweichen(alt, { abMin: 1440, bisMin: 1260 }, true)).toEqual({ abMin: 1410, bisMin: 1440 })
  })
  it('mehrere Tage: nichts weicht aus', () => {
    expect(zeitenAusweichen(alt, { abMin: 1320, bisMin: 600 }, false)).toEqual({ abMin: 1320, bisMin: 600 })
  })
})
```
Die bisherigen `schnellwahl`-Tests auf das neue Format umstellen (Samstag-heute-Fall behalten), `rueckFuerArt`-Tests löschen.

- [ ] **Step 2:** `npx vitest run tests/lib/zeitfenster.test.ts` — Erwartet: FAIL (Funktionen fehlen / Format abweichend).
- [ ] **Step 3:** Helfer implementieren, `rueckFuerArt` entfernen.
- [ ] **Step 4:** `npx vitest run tests/lib/zeitfenster.test.ts` — Erwartet: PASS. (`npx tsc --noEmit` meldet bis Task 2 Fehler in `ZeitfensterWahl.tsx`; das ist erwartet.)
- [ ] **Step 5: Commit** `feat: Helfer für Hin- und Rückzeile`

### Task 2: ZeitfensterWahl als Hin- und Rückzeile

**Files:**
- Modify: `src/components/zeitfenster/ZeitfensterWahl.tsx`
- Delete: `src/components/zeitfenster/Zeitband.tsx`

**Interfaces:**
- Consumes: `rueckNachHinwechsel`, `schnellwahl(heute, mindestNaechte)`, `zeitenAusweichen`, `rueckAnheben`, `ZEITBAND`, `alsUhrzeit` aus Task 1 bzw. bestehend.
- Produces: unveränderte Props `{ mindestNaechte?: 0 | 1 }` (genutzt von Startseite und `ZeitfensterPill`).

- [ ] **Step 1: Aufbau** (Spec Abschnitt 1):
  - Zeile „Hinfahrt“: `DatumFeld` (frühestens heute) + Label „ab“ + `select` mit allen Stufen von `ZEITBAND.vonMin` bis `ZEITBAND.bisMin`.
  - Zeile „Rückfahrt“: `DatumFeld` (frühestens `tageAddieren(datum, mindestNaechte)`, gesperrt ohne gewähltes Datum, Hinweis „Zuerst das Datum der Hinfahrt wählen.“) + „bis“ + `select`.
  - Darunter die Schnellwahl-Chips; aktiv, wenn `z.gewaehlt && datum und rueck` passen.
  - „Mindestens vor Ort“-Schieber nur bei `mindestNaechte === 0 && z.rueck === z.datum` (bestehendes Markup).
  - Auf schmalen Bildschirmen dürfen Datum und Uhrzeit einer Zeile umbrechen; die Zeilenbeschriftung steht dann darüber.
- [ ] **Step 2: Verhalten:**
  - Hindatum gewählt → `setzeDatum({...z, datum, rueck: rueckNachHinwechsel(z, datum, mindestNaechte)})` (ohne gewähltes Datum gilt `z.rueck === z.datum`, also 0 Nächte bzw. `mindestNaechte`).
  - Rückdatum gewählt → `setzeDatum({...z, rueck})`.
  - Chip → `setzeDatum({...z, datum: s.datum, rueck: s.rueck})`.
  - Uhrzeit-`select` → `zeitenAusweichen(z, neu, z.rueck === z.datum)`, dann sofort schreiben (keine Drossel nötig, aber der bestehende `schiebe`/`loslassen`-Weg darf bleiben); ohne gewähltes Datum nur Uhrzeiten (R6).
  - Entfernen: Art-Umschalter, `mehrVorgemerkt`, `waehleArt`, `band`, Hinweis „Los ab gilt für …“, Import `Zeitband`; `Zeitband.tsx` löschen.
  - Doku-Kommentar der Komponente an den neuen Aufbau anpassen.
- [ ] **Step 3:** `npx tsc --noEmit` und `npm test` — Erwartet: sauber / alle grün.
- [ ] **Step 4: Commit** `feat: Datumswahl als Hin- und Rückzeile ohne Tagestour-Schalter`

### Task 3: Kopfzeile, Startseiten-Titel, Zurück-Knopf

**Files:**
- Modify: `src/app/layout.tsx` (Header), `src/app/(karte)/page.tsx` (Titel), `src/app/(karte)/gebiet/[id]/page.tsx` (Zurück), `src/components/ort/ZeitfensterPill.tsx` (`ZeitfensterInKlammern` entfernen, falls danach unbenutzt)

- [ ] **Step 1: Header:** inneres `div` ohne `mx-auto max-w-5xl`, Innenabstand `px-4 sm:px-6`; `nav` mit `gap-6`, Links `inline-flex min-h-11 items-center`.
- [ ] **Step 2: Startseite:** `h1` „In die Berge, ohne Auto.“ und das `p` darunter ersetzen durch ein `h1` mit „Ausgangsorte für Touren ab Offenburg mit Bahn und Bus.“ (`text-xl font-semibold tracking-tight sm:text-2xl`).
- [ ] **Step 3: Zurück-Knopf Ortsseite:** `ZeitraumLink href="/"` mit Text „← Zurück“ und Klasse `pill` (bzw. `min-h-11`-Variante), eingebettet in eine sticky Leiste: `sticky z-10 bg-papier` mit `max-lg:top-14 lg:top-0`, Abstand so, dass Inhalt beim Scrollen nicht durchscheint (negative Ränder gleich dem Feld-Innenabstand `px-4 sm:px-6`, `pt-4` aus `KartenRahmen`). `ZeitfensterInKlammern` aus dem Import und, wenn sonst unbenutzt, aus `ZeitfensterPill.tsx` entfernen.
- [ ] **Step 4:** `npx tsc --noEmit`, `npm test`, `npm run build` — Erwartet: sauber, grün, `/gebiet/[id]` weiter ● SSG.
- [ ] **Step 5: Commit** `fix: Kopfzeile volle Breite, ein Titel, Zurück-Knopf auf der Ortsseite`

### Task 4: Prüfung im Browser

- [ ] Dev-Server starten, Startseite bei 1440 px und 375 px: Kopfzeile bündig, ein Titel, Hin-/Rückzeile; Review-Focus 1–5 durchklicken; Ortsseite: Zurück-Knopf bleibt beim Scrollen sichtbar und führt mit Zeitfenster zur Karte; Hüttenseite: Schnellwahl nur „Wochenende“.
- [ ] Bildschirmfotos für den Nutzer.
