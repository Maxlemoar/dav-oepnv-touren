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
- `gebiete/` Tourengebiete mit Haltestellen, Sportarten, Touren (`touren`), optional einer eingebetteten Sammlung (`sammlungEmbed`) und Links
- `huetten/` Hütten mit Zustiegen ab Haltestelle
- `tickets.yaml`, `emissionen.yaml` Regeln und Faktoren mit Quelle

Stop-IDs kommen von Transitous: `https://api.transitous.org/api/v1/geocode?text=<Name>&type=STOP&language=de`.

```bash
npm run richtwerte                 # Fahrzeit, Umstiege, Takt, Ticket, Distanzen je Startort×Haltestelle
                                   # Takt = Verbindungen ab Startort 6–12 Uhr am Referenz-Samstag, nicht Bedienung am Ziel
npm run richtwerte -- --nur kandersteg
npm run richtwerte -- --datum 2026-09-19
npm run karte                      # public/karte.json neu erzeugen
npm run bahn-ids                   # bahn.de-Bahnhofsdaten (Feld `bahn`) für Startorte und Haltestellen ohne dieses Feld
npm run bahn-ids -- --alle         # … für alle neu; --nur <id> für einen Eintrag. Ohne `bahn` fällt der Buchungslink auf eine Namenssuche zurück
npm run pruefliste                 # docs/pruefliste.md für den Arbeitskreis
npm run rauchtest                  # 5 Live-Abfragen, warnt nur
```

Ungültige Inhalte brechen den Build mit Dateiname und Feld.

### Touren eines Gebiets

Jedes Gebiet kann unter `touren` echte Tourenvorschläge tragen, die an der Haltestelle des Gebiets starten. Pflicht sind `titel`, `url`
und `anbieter` (`alpenvereinaktiv`, `sac`, `komoot`, `sonstig`); alles andere nur eintragen, wenn es so auf der verlinkten Seite steht:

```yaml
touren:
  - titel: Oeschinensee Rundwanderung
    url: "https://www.alpenvereinaktiv.com/de/tour/oeschinensee-rundwanderung/808431897/"
    anbieter: alpenvereinaktiv
    sportart: wandern          # wandern, hochtour, skitour, klettern, klettersteig, schneeschuh
    dauerMin: 355              # Minuten
    hoehenmeter: 820           # Aufstieg in m
    laengeKm: 14.8
    schwierigkeit: mittel      # Freitext, z. B. "T3", "WS", "mittel"
    oeffiTauglich: true        # Standard true; false, wenn Start oder Ziel nur mit Auto erreichbar ist
```

**Karte und Höhenprofil einbetten (`embed`):** Alpenvereinaktiv erlaubt das Einbetten einzelner Touren und Sammlungen per iframe,
offiziell aber nur für Pro+-Konten (5 €/Monat bzw. 59,99 €/Jahr; Details in `docs/research/touren-einbettung.md`). Solange der
Arbeitskreis das nicht entschieden hat, bleibt `embed` weg und die Tour ist nur verlinkt. Nach Freischaltung: ID und Slug aus der
Tour-URL (`…/de/tour/<slug>/<id>/`) eintragen, der Slug ist optional:

```yaml
    embed: { anbieter: alpenvereinaktiv, id: "50994062", slug: "kandersteg-ryharts-allmenalp" }
```

komoot-Touren (nur eigene, dauerhaft öffentliche): `embed: { anbieter: komoot, id: "384495679" }`. Die Seite lädt das iframe erst
nach Klick auf "Karte und Höhenprofil laden", vorher geht kein Request an den Anbieter.

**Sammlung für das ganze Gebiet (`sammlungEmbed`):** Eine Alpenvereinaktiv-Liste (z. B. eine selbst gepflegte Sammlung "Kandersteg
mit ÖV") erscheint mit Karte über den Tour-Cards. ID und Slug aus der Listen-URL (`…/de/liste/<slug>/<id>/`), gleiche Pro+-Bedingung:

```yaml
sammlungEmbed: { id: "202105012", slug: "nur-mit-oeffis" }
```

`links` bleibt für Portalsuchen ohne konkrete Tour ("Mehr Touren: Alpenvereinaktiv · SAC-Tourenportal").

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

Code MIT (siehe `LICENSE`), Inhalte unter `content/` CC BY 4.0 (siehe `LICENSE-CONTENT.md`).
