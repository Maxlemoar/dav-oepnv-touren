# Ohne Auto in die Berge, ab Offenburg: Design Version 1

Stand: 2026-09-06. Absender: Arbeitskreis Klimaschutz, DAV Sektion Offenburg.

## Zweck

Ein Planungswerkzeug für Einzelne, die von Offenburg aus eine Bergtour mit Bahn und Bus
planen wollen. Es beantwortet drei Fragen: Wohin komme ich in bis zu fünf Stunden? Welche
Hütte ist dort erreichbar? Wie sieht die Verbindung an meinem Datum aus?

Zwei Einstiege, gleichwertig: ein Suchfeld für konkrete Ziele (Hütte, Gebiet) und eine
Karte zur Inspiration. Beide führen auf dieselben Zielseiten.

Zielgruppe in Version 1: Mitglieder der Sektion Offenburg, die ein Wochenende oder einen
Tag planen. Tourenleiter werden nicht eingebunden; sie können das Werkzeug später für ihre
eigenen Ausschreibungen nutzen.

Nicht in Version 1: Kopplung ans Sektionsprogramm, Mitfahrgesuche, Nutzerkonten, weitere
Startorte sichtbar, Wetter, eigene Routen mit GPX, Englisch.

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Zielgruppe | Mitglieder planen selbst; Tourenleiter als spätere Nutzer |
| Tourenquelle | Verzeichnis aus Bahnhöfen, Gebieten und Hütten; Routen extern verlinkt |
| Zieleinheit | Hütte (Übernachtung) und Gebiet (Tagestour) |
| Startort | Offenburg fest; Lahr und Kehl als Daten vorbereitet, nicht sichtbar |
| Verbindungen | Live pro Datum über Transitous; Richtwerte als Fallback und für die Karte |
| Bauweise | Statische Next.js-Seite, Inhalte als Dateien im Repo, keine Datenbank |
| Pflege | Claude erstellt Daten und Prüfliste, Arbeitskreis korrigiert |

## Datenmodell

Alle Inhalte liegen als YAML unter `content/`, mit Schema-Prüfung beim Build.

**Startort** (`content/startorte/*.yaml`)
- `id`, `name`, `haltestelleId` (Transitous-Stop-ID), `lat`, `lon`, `sichtbar` (bool)
- Version 1: Offenburg sichtbar; Lahr (Schwarzw), Kehl angelegt mit `sichtbar: false`

**Haltestelle** (`content/haltestellen/*.yaml`)
- `id`, `name`, `haltestelleId`, `lat`, `lon`, `land` (DE, FR, CH, AT), `region`
- `richtwerte[startortId]`: `fahrzeitMin`, `umstiege`, `takt` (stündlich, zweistündlich,
  unregelmäßig), `ticket` (deutschlandticket, halbtax, europass, keins), `berechnetAm`
- Richtwerte werden per Skript berechnet, nie von Hand gepflegt.

**Gebiet** (`content/gebiete/*.yaml`)
- `id`, `name`, `beschreibung` (bis drei Sätze), `haltestellen[]` (IDs, erste ist Hauptzugang)
- `sportarten[]` aus: wandern, hochtour, skitour, klettern, klettersteig, schneeschuh
- `saison` (sommer, winter, ganzjährig), `links[]` (Titel, URL; Alpenvereinaktiv, SAC-Tourenportal)
- `lat`, `lon` für den Marker

**Hütte** (`content/huetten/*.yaml`)
- `id`, `name`, `betreiber` (Typ: dav, sac, oeav, naturfreunde, privat; plus `sektion`)
- `hoehe`, `lat`, `lon`, `gebietId`, `saison`, `buchungUrl`, `webUrl`
- `zustiege[]`: `haltestelleId`, `gehzeitMin`, `hoehenmeter`, `bergbahn` (bool), `hinweis`
- `quelle` (URL), `geschaetzt` (bool)

Die Tagestour-Eigenschaft wird nicht gespeichert, sondern zur Laufzeit berechnet.

Erster Datenstand: etwa 40 Gebiete und 100 Hütten aus `docs/research/`, ergänzt aus
Wikidata und der Wikipedia-Liste der SAC-Hütten. Die beiden Sektionshäuser Sandkästle und
Rämsenberg sind Pflicht und werden auf der Startseite empfohlen.

## Seiten

**Startseite** (`/`)
- Ein Satz Versprechen, darunter Suchfeld mit Vorschlägen aus Hütten und Gebieten.
- Datum wählbar, Standard ist der kommende Samstag.
- Filter: Sportart, Tagesziel oder Übernachtung, maximale Fahrzeit (2 bis 5 h), Regler
  Mindest-Tourenfenster (Standard 6 h).
- Karte mit Reisezeit-Stufen, Gebiets-Markern, ab Zoomstufe Hütten. Auf dem Handy ist die
  Liste nach Fahrzeit sortiert der Standard, Karte auf Knopfdruck.
- Empfehlung der zwei Sektionshäuser.

**Gebietsseite** (`/gebiet/[id]`)
- Beschreibung, Sportarten, Saison.
- Pro Haltestelle: Live-Verbindung fürs Datum (Hinfahrt, Ankunft, letzte Rückfahrt,
  Tourenfenster) und Tagesziel-Urteil.
- Hütten des Gebiets als Karten, Routen-Links extern.

**Hüttenseite** (`/huette/[id]`)
- Betreiber, Höhe, Saison, Buchungslink.
- Zustiege mit Gehzeit je Haltestelle.
- Live-Verbindung ab Offenburg zur Talhaltestelle, Rückfahrt am Folgetag.
- Kompakte Zeile: "Sa 6:12 ab Offenburg, 10:20 in Kandersteg, 2:30 h Zustieg, an der
  Hütte gegen 13:30."

**Verbindungsdetail** (ausklappbar auf Gebiets- und Hüttenseite)
- Alle Umstiege, Ticket-Hinweis, Link zu bahn.de bzw. SBB mit vorausgefüllter Suche.
- Kein Ticketverkauf.

**Über** (`/ueber`)
- Absender, Datenquellen mit Lizenzen, Emissionsfaktoren, "Fehler melden" (Mailto).

Jede Seite hat einen Link "Fehler melden", der eine Mail an den Arbeitskreis vorbereitet,
mit Seitentitel im Betreff.

Sprache Deutsch. Bedienung auf dem Handy ist der Normalfall.

## Verbindungsdienst

Server-Route `GET /api/verbindung?von=<startortId>&nach=<haltestelleId>&datum=YYYY-MM-DD&rueckfahrt=gleicher-tag|folgetag`

Antwort:
- `hinfahrt`: früheste Verbindung mit Abfahrt 5:00 bis 8:00; `hinfahrtSpaeter`: Alternative
  mit Abfahrt 8:00 bis 9:00. Jeweils Abfahrt, Ankunft, Umstiege, Abschnitte.
- `rueckfahrt`: letzte Verbindung ab Ziel mit Ankunft in Offenburg vor 23:00, am
  gewählten Tag.
- `tourenfensterMin`: Rückfahrt-Abfahrt minus Hinfahrt-Ankunft.
- `tagesziel`: true, wenn Ankunft bis 10:00, Rückfahrt ab 16:30 und Tourenfenster
  mindestens dem übergebenen Regler (Standard 360 Minuten) entspricht. Nur bei
  `rueckfahrt=gleicher-tag` gesetzt.
- `ticket`: Regel siehe unten.
- `quelle`: `live` oder `richtwert`.

Datenquelle: Transitous (MOTIS, https://api.transitous.org), ohne Schlüssel. Requests
tragen einen User-Agent mit Projektname und Kontaktadresse. Keine Massenabfragen.

Zwischenspeicher: pro (von, nach, datum, rueckfahrt) 24 Stunden, im Vercel Data Cache
bzw. `unstable_cache`. Die Startseite löst so pro Datum höchstens eine Anfrage je Gebiet
aus.

Fallback: Antwortet Transitous nicht innerhalb von 8 Sekunden oder mit Fehler, liefert
die Route den Richtwert aus der Haltestellen-Datei mit `quelle: richtwert`. Die Seite
zeigt "ca. 4:10 h, stündlich" plus Hinweis und Link zu bahn.de.

Ticket-Regel (Tabelle in `content/tickets.yaml`):
- Ziel in DE, keine Fernverkehrsabschnitte: deutschlandticket
- Ziel in CH: halbtax, Hinweis auf Grenzbahnhof Basel Bad Bf / Basel SBB
- Ziel im Elsass: europass (24 h ab Kehl)
- Ziel in AT: keins, Hinweis auf Sparpreis
- Fernverkehr in DE (ICE Offenburg–Basel): Hinweis, dass D-Ticket dort nicht gilt

Richtwerte-Skript (`scripts/richtwerte.ts`): berechnet für jeden Startort und jede
Haltestelle die Hinfahrt an einem Referenz-Samstag (nächster Samstag ohne bekannte
Sperrung), schreibt `fahrzeitMin`, `umstiege`, `takt` und `berechnetAm` in die YAML.
Läuft manuell, etwa monatlich und nach Fahrplanwechsel.

## Karte

MapLibre GL mit freien Kacheln (OpenFreeMap). Drei Ebenen:
- Reisezeit-Stufen: Haltestellen nach Richtwert eingefärbt (bis 2, 3, 4, 5 h), Farbe auf
  den Gebiets-Marker übertragen. Keine Straßen-Isochronen.
- Gebiets-Marker mit Name und Fahrzeit; Klick öffnet Vorschau mit Sportarten und
  Tagesziel-Urteil fürs Datum.
- Hütten ab Zoomstufe 9, mit Betreiber-Symbol.

Filter wirken auf alle Ebenen. Kartendaten werden beim Build als GeoJSON unter
`public/karte.json` erzeugt.

## CO2

Pro Ziel eine Zeile: "Bahn statt Auto spart etwa X kg CO2 pro Person."
Berechnung: Straßendistanz Offenburg bis Talhaltestelle (einmalig per OSRM-Abfrage im
Richtwerte-Skript, gespeichert in der Haltestellen-Datei) mal Pkw-Faktor, geteilt durch
2,5 Personen, minus Bahnfaktor mal Bahndistanz. Faktoren nach Umweltbundesamt in
`content/emissionen.yaml` mit Quelle und Datum. Hin- und Rückfahrt zusammen.
Kein Zähler über alle Nutzer.

## Technik

- Next.js (App Router), TypeScript, Tailwind, auf Vercel.
- Inhalte als YAML, Validierung mit Zod beim Build. Fehlerhafte Inhalte brechen den Build.
- Fahrplan über eine Server-Route mit Cache, Client nie direkt gegen Transitous.
- Repo öffentlich auf GitHub (Maxlemoar), Lizenz MIT für Code, Inhalte CC BY 4.0, damit
  andere Sektionen es nachbauen können.
- Domain später mit dem Arbeitskreis klären.

## Pflege

- Claude erstellt den ersten Datenstand und eine Prüfliste (`docs/pruefliste.md`) mit
  Vorschlag, Quelle und Unsicherheit je Hütte und Haltestelle.
- Der Arbeitskreis korrigiert per Kommentar oder Mail; Claude pflegt ein.
- "Fehler melden" auf jeder Seite.

## Tests

- Datenprüfung (Build): jede Hütte hat Gebiet, mindestens einen Zustieg und Koordinaten;
  jedes Gebiet hat mindestens eine Haltestelle; jede Haltestellen-ID wird beim
  Richtwerte-Lauf gegen Transitous verifiziert.
- Verbindungslogik (Unit): Tagesziel-Regel, Tourenfenster, Ticket-Regel und
  CO2-Rechnung mit festen Beispieldaten, ohne Netz.
- Rauchtest (manuell/CI, nicht blockierend): Live-Abfrage für fünf Ziele
  (Feldberg-Bärental, Kandersteg, Engelberg, Wasserauen, Munster), warnt bei Fehler.

## Offene Punkte für später

- Weitere Startorte sichtbar schalten (Lahr, Kehl, Achern).
- Sektionsprogramm einbinden: DAV360-API ist offen, Felder `isPublicTransportAvailable`
  und `arrivalHints` existieren, siehe `docs/research/dav360-api.md`.
- Offenburg als Startort bei Zuugle (Verein Bahn zum Berg) anbieten.
- Kooperation mit DAV Freiburg (ÖV-Zuschuss 50 %).
