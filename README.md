# Ohne Auto in die Berge, ab Offenburg

Hütten und Tourengebiete, die von Offenburg aus mit Bahn und Bus erreichbar sind, mit Live-Verbindung fürs gewählte Datum.
Ein Projekt des Arbeitskreises Klimaschutz der DAV Sektion Offenburg.

## Entwickeln

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest
npm run lint         # ESLint
npm run build        # erzeugt public/karte.json (prebuild) und baut die Seite
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
npm run richtwerte -- --datum 2026-09-19
npm run karte                      # public/karte.json neu erzeugen
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
- `TRANSITOUS_BASIS` andere MOTIS-Instanz (Standard `https://api.transitous.org`)

## Lizenz

Code MIT (siehe `LICENSE`), Inhalte CC BY 4.0.
