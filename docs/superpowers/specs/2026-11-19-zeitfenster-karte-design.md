# Zeitfenster zuerst: Ausgangsorte auf der Karte, Verbindungen im Vordergrund

Stand 19.11.2026, Zweig `zeitfenster-karte` (abgezweigt von `qualitaet-2026-11` bei e52c33e).

## Warum

Stefan Martin (AK Klima, Sektion Offenburg) will die Seite dem Vorstand vorstellen. Er hat mit Tourenleitern (30 bis 60 Jahre)
gesprochen: Von rund 100 Sektionstouren fahren etwa 10 % mit Bahn und Bus an. Die Hürden sind oft grundlegend, etwa keine DB-Navigator-App,
weil man selbst nie Bahn fährt. Die Tourenleiter kennen die Berge und planen ihre Touren selbst. Sie wollen wissen:
**Wohin komme ich in meinem Zeitfenster ab Offenburg hin und wieder zurück, und mit welcher Verbindung?**

Rückmeldung zur heutigen Seite:

- Beim Betreten keine Hütten und Touren zeigen und nicht "Wohin willst du? Hütte oder Gebiet" fragen, sondern zuerst nach Zeitraum
  und Dauer: Tages- oder Mehrtagestour, wann los, wann spätestens zurück in Offenburg (wie Hin- und Rückfahrt im DB Navigator).
- Danach die passenden **Ausgangsorte** (Talorte, Bahnhöfe) zeigen, keine Berge oder Wanderungen.
- Auf der Seite eines Ausgangsorts stehen die Verbindungen im Vordergrund, mit einer früheren und einigen späteren als Inspiration.
- Filter wie Sportarten fallen weg; sie wirken bevormundend.
- Unterzeile: "Ausgangsorte für Touren ab Offenburg mit Bahn und Bus."

Vorbild für die Darstellung ist Chronotrains (Karte, die sich beim Ziehen am Schieber sofort ändert), aber für Hin **und** Rückfahrt in
einem Zeitfenster statt für eine einfache Reisezeit.

## Ziele

- Wer die Seite öffnet, beantwortet zuerst "wann", dann sieht er "wohin".
- Die Karte ist die Hauptansicht: Ausgangsorte als Punkte und die Bahnstrecken dorthin, eingefärbt nach Zeit vor Ort.
- Jede Änderung am Zeitfenster wirkt sofort, ohne Anfrage an den Fahrplandienst.
- Die Ortsseite zeigt echte Verbindungen für das gewählte Datum, eine frühere und mehrere spätere, Hin- und Rückfahrt wählbar.

## Nicht-Ziele

- Keine Tourenvorschläge auf der Startseite, keine Sportart-, Art- oder Fahrzeitfilter, keine Suche auf der Startseite.
- Keine Live-Prüfung der ganzen Liste.
- Keine Preise, keine Buchung in der Seite (Links zu bahn.de und SBB bleiben).
- Keine weiteren Startorte in der Oberfläche (nur Offenburg ist sichtbar, wie heute).

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Die Karte sagt "passt", die Ortsseite zeigt dann keine passende Verbindung. Vertrauen ist das Wichtigste.
- Die Seite überschreitet das Anfragebudget von Transitous.
- Die Seite bevormundet: Sie schreibt vor, was man tun soll, statt die Fahrten zu zeigen.

## Randbedingungen

- **Transitous** (einzige Live-Quelle): nichtkommerziell; ab etwa 720 Anfragen `/plan` am Tag bitten die Betreiber um Kontakt im
  Matrix-Kanal (transitous.org/api). Live-Abfragen nur für einen gewählten Ort, nie für die Liste. Antworten einen Tag cachen.
  Maximilian meldet das Projekt vor der Vorstellung im Matrix-Kanal an (keine Bauaufgabe).
- **Fahrplangrenze:** `content/fahrplan.yaml` `liveBis` (derzeit 2026-12-12). Danach kennt Transitous den Fahrplan nicht vollständig.
- **Keine offizielle freie Bahn-API zur Verbindungssuche** (DB API Marketplace hat nur Abfahrtstafeln). Reserve für Schweizer Ziele:
  Open Journey Planner 2.0 (opendata.swiss); nicht Teil dieser Arbeit.
- **Parallele Arbeit** auf `qualitaet-2026-11` (andere Session): Tagesfenster-Skript schreibt gerade `content/haltestellen/*.yaml`,
  ein Paket ändert noch Gebiets- und Hüttenseite (Rückfahrt-Rechner, Wetter, Teilen, Kostenvergleich, Lawinenlage) und
  `VerbindungZeile`. `scripts/richtwerte.ts` und `content/haltestellen` erst anfassen, wenn die andere Session das freigibt. Deren
  Änderungen vor dem Zusammenführen nachziehen. Startseite, Filter, `src/app/page.tsx`, `src/lib/filter.ts` gehören zu dieser Arbeit.
- Next.js 16 mit geänderten Konventionen: vor dem Schreiben die Guides in `node_modules/next/dist/docs/` lesen (AGENTS.md).
  Gestaltung nach `docs/design-system.md`. Tests mit Vitest.

## Ansätze (entschieden)

Wie die Startseite entscheidet, welcher Ort ins Zeitfenster passt:

- **A, gewählt: typischen Tagesfahrplan vorab berechnen.** Je Ausgangsort und Tagesklasse (Werktag, Samstag, Sonntag) alle Hin- und
  Rückfahrten speichern. Die Prüfung ist exakt für einen typischen Tag und läuft im Browser. Kostet etwa so viele Anfragen wie die
  heutige Tagesfenster-Rechnung (rund 500 pro Lauf), nur beim Fahrplanwechsel oder nach Inhaltsänderungen.
  Grenze: Ausfälle und Baustellen am konkreten Datum zeigt erst die Ortsseite (live).
- **B, verworfen: vorhandene Tagesfenster plus Fahrzeit schätzen.** Bei Stundentakt bis zu einer Stunde daneben; verletzt das
  Anti-Ziel "Karte sagt passt, Ortsseite nicht".
- **Live für die ganze Liste, verworfen:** 168 und mehr Anfragen pro Datum, an der Transitous-Grenze gescheitert (fast alles HTTP 429).

Darstellung:

- **Karte vorne, gewählt** (Stefan und Maximilian), Liste daneben bzw. auf dem Handy umschaltbar.
- **Ortsseite neben der Karte, gewählt** (wie Chronotrains), statt einer eigenen Seite ohne Karte.
- **Eingefärbte Fläche wie bei Chronotrains, verworfen:** Bei uns zählen nur die Ausgangsorte, die Wanderung findet dort statt; eine
  Fläche würde Erreichbarkeit dazwischen vortäuschen. Stattdessen Punkte und die Strecken dorthin.

Granularität:

- **Ein Ausgangsort je Gebiet, gewählt:** der Hauptzugang (`gebiet.haltestellen[0]`), 84 Orte. Weitere Haltestellen eines Gebiets
  stehen auf der Ortsseite. (Jede Haltestelle, rund 150, hätte etwa 900 Anfragen pro Lauf gebraucht.)

## Entwurf

### Daten: typischer Tagesfahrplan

Neue vorberechnete Daten je Hauptzugang, ab Startort Offenburg, je Tagesklasse `werktag`, `sa`, `so` (wie `tagesklasse()` in
`src/lib/saison.ts`, Referenztage wie beim Tagesfenster):

- **Hinfahrten** ab Offenburg mit Abfahrt ab 4:00 bis in den Nachmittag: je Fahrt Abfahrt, Ankunft (lokal "HH:MM"), Umstiege,
  Fernverkehr ja/nein. Mehrtägige Touren brauchen auch Hinfahrten am Nachmittag und Abend.
- **Rückfahrten** nach Offenburg mit Ankunft ab etwa Mittag bis 24:00 (Ankunft am selben Tag): Abfahrt, Ankunft, Umstiege, Fernverkehr.
- **Strecke** für die Karte: Linienverlauf einer typischen Hinfahrt (die mit den wenigsten Umstiegen unter den schnellen), aus
  `legGeometry` von Transitous (Polyline, Präzision 7, sehr fein: Offenburg–Bern über 3.000 Punkte), vereinfacht auf etwa 50 bis 100
  Punkte je Abschnitt. Fußwege weglassen.

Gewinnung mit `planenGeduldig` in einem **neuen Skript** (etwa `scripts/musterfahrplan.ts`, npm-Befehl dazu), das in eigene generierte
Dateien schreibt, nicht in `content/haltestellen/*.yaml`. So hängt die Arbeit nicht an `scripts/richtwerte.ts`, das die andere Session
gerade nutzt. Das bisherige Tagesfenster (`richtwerte.*.tagesfenster`, `--nur-tagesfenster`) wird nach diesem Umbau nicht mehr
gebraucht (siehe "Urteil nach Zeitfenster"); nach dem Zusammenführen samt Feldern, Schema und Skriptteil entfernen.

Anfragebudget: Ein voller Lauf sind etwa 504 Anfragen (84 Orte × 3 Tagesklassen × 2 Richtungen). Zusammen mit dem Live-Betrieb nicht
über 720 am Tag; das Skript bietet Teilläufe (`--klasse`, `--nur <id>`), ein voller Lauf nur an einem Tag, an dem kein anderer
Transitous-Lauf (Tagesfenster, Audit) stattfindet. Abgeleitete Dateien sind generiert, versioniert und werden nicht von Hand bearbeitet.

Saisonbetrieb: Wird der Hauptzugang am gewählten Datum nicht bedient (`bedientAm`), passt der Ort nicht, unabhängig vom typischen
Fahrplan.

Gültigkeit: Die Referenztage liegen immer vor `liveBis`. Für spätere Daten (ab dem Fahrplanwechsel am 13.12.) und für Daten in einer
anderen Jahreszeit bleibt die Startseite benutzbar, zeigt aber den Hinweis "nach dem Fahrplan bis <liveBis>; Verbindung am Datum auf der
Ortsseite prüfen". Wird `liveBis` angehoben, rechnet Maximilian die Daten neu (Ablauf im README beschreiben, neben dem bestehenden
Abschnitt zu `liveBis`).

### Startseite

```
In die Berge, ohne Auto.
Ausgangsorte für Touren ab Offenburg mit Bahn und Bus.

[Sa 22.11.] [So 23.11.] [Datum wählen]        [ Tagestour | Mehrere Tage ]
Los ab 06:00 ●━━━━━━━━━━━━━━━━━━━━━━● zurück in Offenburg bis 21:00
Mindestens vor Ort ━━━━●━━━━ 4 h            (nur Tagestour)

┌─────────────── Karte ────────────────┐  23 Ausgangsorte passen
│  Offenburg ●                          │  Feldberg-Bärental   9:10 h vor Ort
│     ┃╲   Strecken in Ortsfarbe        │  Kandersteg          7:37 h
│     ┃ ╲━━● Feldberg-Bärental          │  …
│     ┗━━━━━━━● Kandersteg              │
└───────────────────────────────────────┘
```

- **Erster Aufruf:** Noch kein Datum gewählt. Die Karte zeigt nur Offenburg, die Liste bittet um ein Datum. Uhrzeiten sind vorbelegt
  (los ab 06:00, zurück bis 21:00, mindestens 4 h vor Ort).
- **Datum:** Schnellwahl kommendes Wochenende (Sa, So) und ein Datumsfeld. Bei "Mehrere Tage" zusätzlich ein Rückfahrtdatum.
- **Zeitband:** ein Schieber mit zwei Griffen, 4:00 bis 24:00, Schritte von 30 Minuten (oder zwei gekoppelte Schieber, wenn ein
  Doppelschieber auf dem Handy schlecht bedienbar ist). Bei "Mehrere Tage" gilt "los ab" für den ersten und "zurück bis" für den
  letzten Tag.
- **Mindestens vor Ort:** Schieber 0 bis 10 h, 0 = egal. Nur bei Tagestour.
- Alle Werte stehen in der URL (teilbar, Zurück-Taste); interne Links tragen sie weiter (heute `ZeitraumLink`/`useZeitraum` in
  `src/components/Zeitraum.tsx` für `datum`, `rueck`, `fenster`; um Abfahrt und Rückkehrzeit erweitern).
- **Berechnung im Browser** je Ort mit dem typischen Fahrplan der Tagesklasse des Datums (bei mehreren Tagen: Tagesklasse des ersten
  bzw. letzten Tags):
  - Tagestour: Paar aus Hinfahrt (Abfahrt ≥ los ab) und Rückfahrt (Ankunft ≤ zurück bis), das die Zeit vor Ort
    (Rückfahrt-Abfahrt minus Hinfahrt-Ankunft) maximiert; bei Gleichstand weniger Umstiege. Passt, wenn Zeit vor Ort ≥ Minimum.
  - Mehrere Tage: Es gibt am ersten Tag eine Hinfahrt ab "los ab" und am letzten Tag eine Rückfahrt mit Ankunft bis "zurück bis".
- **Karte:** Punkte je Ausgangsort, gefärbt in Stufen nach Zeit vor Ort (Tagestour) bzw. nach Fahrzeit (mehrere Tage); nicht passende
  Orte grau und klein. Strecken passender Orte in deren Farbe, Orte mit mehr Zeit vor Ort oben. Überfahren zeigt Name, Hin- und
  Rückfahrtzeiten und Zeit vor Ort; Klick auf einen Punkt oder Listeneintrag öffnet die Ortsseite neben der Karte. Grundlage ist die vorhandene MapLibre-Karte (`src/components/Karte.tsx`,
  `public/karte.json` aus `scripts/karte.ts`); Hüttenpunkte entfallen auf der Startseite.
- **Liste** (ab lg rechts neben der Karte, auf dem Handy über den Umschalter Liste | Karte wie heute): Name des Hauptzugangs, Gebiet
  und Region, typische Hin- und Rückfahrt, Zeit vor Ort, Ticket. Sortiert nach Zeit vor Ort (Tagestour) bzw. Fahrzeit (mehrere Tage).
  Darunter einklappbar die nicht passenden Orte mit Grund ("Ankunft erst 11:40", "fährt am Datum nicht").
- Hinweis unter der Liste: Zeiten nach typischem Fahrplan; die Verbindung am Datum steht auf der Ortsseite.
- **Entfällt:** Suche, Filter-Sheet (Art, Sportart, Fahrzeit, Schalter "Nur was am Datum geht"), Tagesziel-Badges, `GebietKarte`-Kacheln.

### Ortsseite (`/gebiet/[id]`, Pfad bleibt), neben der Karte

Wie bei Chronotrains geht der Ort **neben der Karte** auf: Die Karte bleibt stehen (ab lg rechts), das linke Feld wechselt von der Liste
zum Ort, die Strecke Offenburg → Ort wird hervorgehoben, die anderen Orte treten zurück. Der Pfeil zurück führt zur Liste mit demselben
Zeitfenster. Die Adresse ist `/gebiet/<id>?…` mit dem Zeitfenster, also teilbar und direkt aufrufbar. Startseite und Ortsseite teilen
einen Rahmen (Layout), in dem die Karte beim Wechsel nicht neu lädt. Auf dem Handy steht über der Ortsseite ein schmaler Kartenstreifen
mit der Strecke; antippen öffnet die Karte groß. Metadaten, JSON-LD und statische Erzeugung der Gebietsseiten bleiben erhalten.

```
← Zurück zur Karte (Sa 29.11., 06:00–21:00)

Kandersteg
Gebiet Kandersteg · Berner Oberland · Schweiz · Halbtax gilt

Hinfahrt Sa 29.11. ab Offenburg
  05:12 → 08:51   3:39 h · 2 Umstiege       früher als gewünscht
● 06:12 → 09:41   3:29 h · 1 Umstieg        ▸ Umstiege · bei SBB
  07:12 → 10:41   …
  08:12 → 11:41   …
Rückfahrt Sa 29.11. nach Offenburg
  15:18 → 18:46
  16:18 → 19:46
● 17:18 → 20:46                             ▸ Umstiege · bei SBB
  18:18 → 21:46                             später als gewünscht
  → 7:37 h vor Ort (09:41 bis 17:18)
```

- Überschrift ist der Name des Hauptzugangs, darunter Gebietsname, Region, Land, Ticket.
- **Live-Verbindungen** über eine neue Route (etwa `/api/verbindungen`): Hinfahrt eine vor "los ab" und bis zu drei danach,
  Rückfahrt bis zu drei mit Ankunft bis "zurück bis" und eine danach. Höchstens zwei Anfragen an Transitous je Aufruf, Antwort einen Tag
  cachen (wie `/api/verbindung`).
- Vorausgewählt ist das Paar, das am besten ins Fenster passt. Antippen einer anderen Fahrt wählt sie, "vor Ort" rechnet neu.
- Jede Zeile nennt die Umstiegsorte ("via Basel SBB, Bern"), nicht nur deren Anzahl; das hilft Leuten ohne Bahnroutine.
- Jede Fahrt aufklappbar mit Abschnitten (vorhandenes `VerbindungDetail`) und Link zu bahn.de oder SBB mit Datum und Uhrzeit.
- Knopf "Weitere Abfahrten" je Richtung lädt die nächsten Fahrten nach (eine Anfrage, nur auf Klick).
- Dauert die beste Fahrt am Datum deutlich länger als die typische (etwa 30 Minuten oder mehr), steht ein Hinweis da:
  "Am 29.11. rund 1 h länger als üblich". Chronotrains zeigt hier ohne Hinweis eine 15-Stunden-Verbindung neben "4 Std. 28".
- **Mehrere Tage:** Hinfahrt am ersten, Rückfahrt am letzten Tag; Zeile "n Nächte" statt "vor Ort".
- **Nach `liveBis`, Datum in der Vergangenheit oder Transitous nicht erreichbar:** die Fahrten des typischen Fahrplans, klar als
  "typischer Fahrplan" gekennzeichnet, mit Hinweis aus `content/fahrplan.yaml` und Links zu bahn.de oder SBB. Fehlerarten wie in
  `VerbindungAntwort.fehlerArt`.
- Ticket-Hinweis und CO₂-Ersparnis wie heute.
- Darunter **Weitere Haltestellen im Gebiet**: je Zeile eingeklappt, Live-Verbindung erst beim Aufklappen (Anfragebudget).
- Darunter **Von hier erreichbar**: Hütten mit Zustieg und Zustand am Datum (vorhanden: `HuetteKarte`, `HuettenZustand`), Berge und
  Wandergebiete, Touren und Links. Bei mehreren Tagen stehen die Hütten zuerst.
- Die Ergänzungen der anderen Session (Rückfahrt-Rechner, Wetter, Teilen, Kostenvergleich, Lawinenlage) beim Zusammenführen einfügen;
  überschneidet sich der Rückfahrt-Rechner mit der Fahrtwahl oben, gilt die Fahrtwahl oben und der Rechner entfällt.

### Urteil nach Zeitfenster statt "Tagesziel"

Das feste Urteil "Tagesziel" / "Besser mit Übernachtung" (Ankunft bis 10:00, Rückfahrt ab 16:30, mindestens `fenster` = 6 h am Berg,
`TAGESZIEL` in `src/lib/verbindung/regeln.ts`) entfällt überall. Es gilt nur noch das Zeitfenster aus der URL: los ab, zurück bis,
mindestens vor Ort. Sonst könnte die Karte "passt" sagen und eine Hüttenseite "Besser mit Übernachtung".

- URL-Parameter: `datum`, `rueck`, dazu neu die Abfahrt ab, die Rückkehr bis und die Mindestzeit vor Ort (Namen dem Builder überlassen).
  `fenster` mit seiner alten Bedeutung entfällt; alte Links mit `fenster` dürfen nicht brechen (ignorieren oder umdeuten).
- `/api/verbindung` (Hüttenseiten, weitere Haltestellen, `/sektionstouren`) wählt Hin- und Rückfahrt innerhalb des Zeitfensters statt
  in den festen Fenstern `HINFAHRT_FENSTER` (5 bis 9 Uhr) und `RUECKFAHRT_ANKUNFT_BIS` (23 Uhr). Ohne Zeitfenster in der URL gelten die
  Vorgaben der Startseite (06:00, 21:00, 4 h).
- Statt des Badges: "passt, 7:37 h vor Ort" oder der Grund ("Ankunft erst 11:40", "letzte Rückfahrt 15:10", "fährt am Datum nicht").
- `/api/uebersicht`, `uebersichtBerechnen`, die Tagesziel-Badges und die Erklärung auf `/ueber` entsprechend entfernen bzw. anpassen.
- Die andere Session ändert gerade `VerbindungZeile` und die Gebietsseite. Diese Änderungen erst nachziehen (Merge von
  `qualitaet-2026-11`), dann umbauen.

### Sonstiges

- Hüttenseiten und `/sektionstouren` bleiben eigene Seiten und übernehmen das Zeitfenster aus der URL (siehe oben).
- Es gibt keinen festen Vorführtermin: alles auf einem Zweig fertig bauen, keine Zwischenstufe.
- Texte deutsch, kurz, ohne Bevormundung ("passt", "Ankunft erst 11:40", nicht "nicht empfohlen").

## Dem Builder überlassen

- Dateiformat und Ablage der generierten Fahrplan- und Streckendaten; Aufteilung auf Dateien, die der Browser lädt (Größe im Blick:
  eine Tagesklasse für 84 Orte sollte deutlich unter 100 KB bleiben).
- Anfrageparameter, damit ein Tag mit möglichst einer Anfrage je Richtung abgedeckt ist (`numItineraries`, sonst `nextPageCursor`);
  vorher an zwei, drei Orten prüfen.
- Toleranz der Linienvereinfachung, Farbstufen, Schieber-Bauweise, Zoom und Ausschnitt der Karte.
- Wie nicht passende Orte in der Liste gruppiert werden.
