# Umsetzung Qualitätscheck November 2026

Grundlage: `docs/audit/2026-11/bericht.md`. Freigabe von Maximilian am 19.11.2026: alle belegten Korrekturen einspielen, alle Empfehlungen umsetzen. Arbeitszweig `qualitaet-2026-11`, Abnahme auf der Vercel-Vorschau, dann Merge nach `main`.

Bereits erledigt (Commit d6ced5b): Datenmodell um `bedient` (Haltestelle), `status`, `statusHinweis`, `statusBis`, `bewirtschaftet`, `winterraum`, `nurMitglieder`, `selbstversorger`, `plaetze` (Hütte), `startHinweis`, `hinweis` (Tour) und `tagesfenster` (Richtwert) erweitert; Hilfsfunktionen in `src/lib/saison.ts`.

## Pakete und Dateihoheit

Parallel laufende Pakete fassen nur ihre eigenen Dateien an. Commits nur mit expliziten Pfaden.

| Paket | Phase | Inhalt | Dateien |
|---|---|---|---|
| P1 Daten | B | 141 belegte Korrekturen einspielen, falsche Touren und toten Link entfernen, geschlossene Hütten, Saisonhaltestellen, Bewirtschaftungszeiten, Kennungen, Gebietstexte; Liste der unsicheren Vorschläge für den Arbeitskreis | `content/**`, `scripts/korrekturen.ts`, `docs/audit/2026-11/eingespielt.md`, `docs/pruefliste-arbeitskreis.md` |
| P3 Verbindungen | B | Übersicht ohne Live-Abfragen (Tagesfenster), Koordinaten-Ausweg bei unbekannter Kennung, kurze Speicherzeit für Fehlschläge, Fehlerarten (Datum vergangen, Fahrplan noch nicht verfügbar, keine Verbindung), Tagesfenster im Richtwerte-Skript, zod-freie URL-Hilfen | `src/lib/verbindung/**`, `src/app/api/**`, `src/lib/richtwerte.ts`, `scripts/richtwerte.ts`, `content/fahrplan.yaml`, `tests/lib/verbindung/**`, `tests/app/**`, `tests/lib/richtwerte.test.ts` |
| P5 Recht und Auffindbarkeit | B | Impressum, Datenschutz, Fußzeile mit Transitous-Hinweis und Datenstand, Sitemap, robots, deutsche 404, Metadaten und strukturierte Daten je Seite, Vorschaubild | `src/app/impressum/**`, `src/app/datenschutz/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`, `src/app/opengraph-image.tsx`, `src/app/layout.tsx`, `src/lib/metadaten.ts`, `content/rechtliches.yaml`, `generateMetadata` in `src/app/gebiet/[id]/page.tsx` und `src/app/huette/[id]/page.tsx` |
| P6b Sektionstouren | B | Seite mit dem Tourenprogramm der Sektion (DAV360), passendes Gebiet, ÖV-Anreise, Anreisetext zum Kopieren | `src/lib/dav360.ts`, `src/app/sektionstouren/**`, `src/components/Sektionstour*.tsx`, `tests/lib/dav360.test.ts` |
| P7 Entwürfe | B | Anfrage an Transitous, Anfrage an DAV wegen Hüttendaten, Nachricht an Nachbarsektionen, Skizze Klimafonds-Antrag | `docs/entwuerfe/**` |
| P4 Oberfläche | C | Zeitraum in allen Links und auf Detailseiten, Jahreszeit in Liste, Karte und Detailseiten, Fehlerarten anzeigen, Legende und Einzeiler auf der Karte, Begriffe erklären, Suche über Hütten und Touren, Hinweis auf ausgeblendete Ziele, Build-Datum aus dem HTML, zod aus dem Browser | `src/components/**` (außer Sektionstour*), `src/app/page.tsx`, Seiteninhalt von `src/app/gebiet/[id]/page.tsx` und `src/app/huette/[id]/page.tsx`, `src/lib/filter.ts`, `src/lib/steuerleiste.ts`, `src/lib/zeitraum.ts`, `src/app/globals.css`, `docs/design-system.md` |
| P8 Buchungslinks | C | Buchungslinks für Hütten recherchieren und eintragen | `content/huetten/**` (nur `buchungUrl`) |
| P6a Funktionen | D | Rückfahrt-Rechner, Mitfahrende einladen, Wetter am Datum, Lawinenlage, Kostenvergleich Auto, Hinweise für Gruppen | neue Komponenten, Detailseiten, `src/app/api/wetter/**`, `content/tickets.yaml` |
| Abschluss | E | Abhängigkeiten aktualisieren, Tagesfenster berechnen, Review, Vorschau prüfen, Merge, Prüfung wiederholen | alle |

## Nicht umsetzbar ohne Entscheidung oder Zugang

- Angaben fürs Impressum und Verantwortlicher im Datenschutz (wer betreibt die Seite?)
- Mailadresse für „Fehler melden“
- Versand der Anfragen an Transitous, DAV und Nachbarsektionen; Klimafonds-Antrag
- Freie Betten über hut-reservation.org (Erlaubnis des DAV nötig)
- Startorte Lahr und Kehl sichtbar schalten (Absprache mit den Sektionen)
- Einbettung der Touren (Pro+-Konto)
- Neue Richtwerte nach dem Fahrplanwechsel, sobald Transitous den DB-Fahrplan 2027 hat
