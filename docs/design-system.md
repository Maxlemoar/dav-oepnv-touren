# Design System

Ziel: Auf dem Handy am Samstagmorgen in 30 Sekunden zur Antwort. Ruhig, lesbar, ohne Outdoor-Kitsch.
Eine Farbe trägt Bedeutung, sonst Grau- und Papiertöne.

## Grundsätze

1. **Mobile first.** Alles wird für 360 px Breite entworfen und wächst ab 640 px (sm) und 1024 px (lg).
   Auf dem Handy schaltet ein Segment Liste | Karte um. Ab lg stehen Feld (Liste bzw. Ortsseite) und Karte nebeneinander (`KartenRahmen`).
2. **Eine Spalte, klare Reihenfolge.** Erst das Zeitfenster (`ZeitfensterWahl`), dann die Ausgangsorte. Keine Sidebar auf dem Handy.
   Auf Orts- und Hüttenseiten liegt das Zeitfenster in einem Sheet hinter der `ZeitfensterPill`.
3. **Berührbar.** Jedes Bedienelement mindestens 44 px hoch. Chips 36 px mit 8 px Abstand. Keine Hover-only-Funktionen.
4. **Farbe heißt etwas.** Grün bis Orange ist Zeit vor Ort (Tagestour) bzw. Fahrzeit (mehrere Tage), grau passt nicht. Signalfarbe nur für Handlungen und Warnungen.
   Betreiberfarben (DAV, SAC) nur als kleines Symbol, nie als Fläche.
5. **Zahlen zuerst.** Uhrzeiten, Fahrzeit, Zeit vor Ort stehen fett am Anfang der Zeile. Prosa danach.
6. **Wartezustände sind ehrlich.** Skeleton beim Laden, klarer Hinweis beim Richtwert-Fallback, nie leere Fläche.
7. **Zuerst fragen, dann zeigen.** Ohne gewähltes Datum bittet die Startseite um ein Datum; die Schnellwahl (kommender Sa, So)
   macht das mit einem Tipp. Danach stehen die passenden Ausgangsorte direkt unter dem Zeitfenster.

## Farben (Tokens in globals.css)

| Token | Wert | Verwendung |
|---|---|---|
| papier | #f7f6f2 | Seitenhintergrund |
| karte | #ffffff | Karten (Cards), Eingaben |
| nebel | #e8e6df | Skeleton, Trennflächen |
| linie | #d5d2c8 | Rahmen, Trennlinien |
| tinte | #1b1f1c | Text |
| tinte-2 | #4a5049 | Sekundärtext |
| tinte-3 | #666b64 | Hinweise, Meta |
| tanne | #1f4d3a | Primärfarbe, Buttons, Links |
| tanne-hell | #2f6b52 | Hover, aktive Chips |
| tanne-tint | #e3efe8 | Hintergrund aktiver Chips, Erfolg |
| signal | #c4471a | Warnhinweis, wichtiger Hinweis |
| signal-tint | #fbe9e0 | Hintergrund Warnhinweis |
| stufe-2 … stufe-5 | #2f6b52, #7fa85a, #d9a441, #b85a22 | Karte: Zeit vor Ort 8/6/4/weniger h bzw. Fahrzeit bis 2/3/4/über 4 h. Text auf stufe-3 und stufe-4 in tinte, sonst weiß |
| dav / sac | #2f6b52 / #c8102e | Betreiber-Symbol |

## Typografie

Geist Sans (self-hosted über next/font), Fallback system-ui. Basis 16 px, Zeilenhöhe 1.5.

| Stil | Größe | Gewicht | Verwendung |
|---|---|---|---|
| titel | 24 px / sm 36 px | 600 | Seitentitel |
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
- **Badge**: 24 px hoch, Radius 999. Varianten: passung (`PassungBadge`), ticket (nebel), zustand, betreiber (Symbol + Text).
- **Verbindungszeile**: eine Zeile fett mit Zahlen, darunter Meta. Aufklappbar zu Abschnitten.
- **Pill**: 40 px hoch, Radius 999, Rahmen linie auf Karte-Weiß, Symbol + Text, `aria-haspopup="dialog"`. Die `ZeitfensterPill`
  der Orts- und Hüttenseite zeigt "Sa 21.11., 6:00–21:00" (`zeitfensterKurz`), heißt für Screenreader "Zeitfenster ändern: …"
  und öffnet das Sheet "Wann?". Bis zur Hydration steht "Kommender Samstag".
- **Sheet**: natives `<dialog>` mit `showModal()`. Auf dem Handy von unten (rounded-t-2xl, max-h 85dvh, Griff-Linie), ab sm zentriert (max-w-md, rounded-2xl). Backdrop tinte/50, Klick darauf und Esc schließen, Body-Scroll gesperrt, Fokus auf dem ersten Bedienelement. Kopf mit Titel, Body scrollbar, unten "Fertig" (knopf, volle Breite) und optional ein sekundärer Knopf. Auswahl wirkt sofort im Hintergrund, "Fertig" schließt nur.
- **Zeitfenster** (`ZeitfensterWahl`, auf der Startseite offen, sonst im Sheet "Wann?"): je eine Zeile
  "Hinfahrt" (Datumsfeld, "ab" Uhrzeit) und "Rückfahrt" (Datumsfeld, "bis" Uhrzeit; Uhrzeiten als Auswahl 4:00 bis 24:00 in
  30-min-Stufen), darunter Chips "Sa 21.11." / "So 22.11." / "Wochenende" und bei gleichem Hin- und Rücktag "Mindestens vor
  Ort" (0 bis 10 h). Kein Umschalter: Ob es eine Tagestour ist, ergibt sich aus den Daten; das Rückdatum folgt dem Hindatum
  mit gleicher Zahl an Nächten. Alles steht in der URL
  (`datum`, `rueck`, `ab`, `bis`, `vorort`; Vorgaben fallen weg). Schieber schreiben gedrosselt, Datum und Uhrzeiten sofort.
  Hüttenseiten (`mindestNaechte` 1): Rückfahrt frühestens am Folgetag, Schnellwahl nur "Wochenende".
- **Liste der Ausgangsorte** (`AusgangsortListe`): Überschrift "n Ausgangsorte passen", eine Zeile zur Quelle (typischer
  Fahrplan bzw. Stand nach `liveBis`), dann je passendem Ort eine Card: Name, rechts tanne "7:37 h vor Ort" (mehrere Tage
  "1 Nacht"), Gebiet · Region, "hin 6:12 → 9:41 · zurück 16:20 → 20:02" und Ticket-Badge. Die übrigen eingeklappt unter
  "n passen nicht", je Zeile Name und Grund ("keine Rückfahrt bis 21:00", "fährt am Datum nicht").
- **Passungs-Badge** (`PassungBadge`): in Verbindungszeilen "passt, 7:37 h vor Ort" bzw. "passt · 1 Nacht" (tanne-tint,
  tanne-Text), sonst der Grund (nebel). Fehlt, wenn sich das ohne Live-Daten und Musterfahrplan nicht sagen lässt.
- **Fahrtenwahl** (`Fahrtenwahl`, Ortsseite): je eine Liste Hin- und Rückfahrten am Datum, jede Zeile ein Knopf "06:12 → 09:41 ·
  3:29 h · via Basel SBB, Bern" (`FahrtZeile`, gewählt mit tanne-Rahmen und -Fläche). Fahrten außerhalb des Fensters gedämpft
  ("früher/später als gewünscht"), "Weitere Abfahrten" lädt je Richtung nach. Darunter fett die Zeit vor Ort des gewählten Paars.
  Weitere Haltestellen des Gebiets klappen auf (`AufklappHaltestelle`) und zeigen dort erst die Verbindungszeile.
- **Zustands-Badge** (`ZustandBadge`): Zustand einer Hütte am Anreisetag, "Sa 14.11.: offen" (tanne-tint), "nur Winterraum"
  (nebel), "geschlossen" (signal-tint, signal-Text). Ist der Zustand nur aus der Saison geschätzt, steht "vermutlich" davor.
  Auf der Hüttenseite wird "geschlossen" zum Warnhinweis mit `statusHinweis`, der Winterraum zu einem ruhigen nebel-Kasten.
- **Warnhinweis** (`.warnhinweis`): Kasten mit Radius knopf, signal-tint-Fläche, feiner signal-Rahmen, Text tinte 14 px.
  Für Dinge, die eine Tour verhindern: geschlossene Hütte, gesperrter Weg (`tour.hinweis`), kein Bus am Datum,
  Datum in der Vergangenheit, "keine Verbindung gefunden, vermutlich Saisonbetrieb". Sparsam, höchstens einer je Karte.
- **Zeitfenster auf Detailseiten**: Orts- und Hüttenseite haben unter dem Kopf "Fahrten für" plus die `ZeitfensterPill`.
  Alle internen Links tragen `datum`, `rueck`, `ab`, `bis`, `vorort` weiter (`ZeitraumLink`, `zeitraumQuery`); das alte
  `fenster` wandert nicht mehr mit. Ist nur `rueck` gesetzt, nehmen die Links das verwendete Hin-Datum ausdrücklich mit.
- **Wetterzeile** (`WetterZeile`): unter der Zeitraum-Pill je Hin- und ggf. Rückdatum eine Zeile 14 px tinte-2,
  "🌨️ Sa 28.11. Schneeschauer · −12 bis 1 °C · 6,6 mm · Wind bis 5 km/h", darunter "Vorhersage für 1915 m von Open-Meteo"
  (tinte-3, Pflicht-Nennung). Nur bis 14 Tage voraus (`wetterDaten`), sonst und bei Fehlern nichts; beim Laden Skeleton.
- **Lawinenhinweis** (`LawinenHinweis`): ruhiger nebel-Kasten (Radius knopf, 14 px) "Lawinenlage vor der Tour prüfen:"
  mit Link auf den zuständigen Dienst (SLF, Vorarlberg, Lawinen.report Tirol, Bayern). Nur für Winterziele
  (Skitour/Schneeschuh im Gebiet oder Hütte über 1500 m) und Daten vom 1.12. bis 30.4.; Schwarzwald und Vogesen ohne.
  Bewusst kein Warnhinweis in signal, weil er keine Tour verhindert.
- **Rückfahrt-Rechner**: nur mit Live-Rückfahrt, eine Zeile 14 px tinte unter der Rückfahrt mit ⏱. Gebiet:
  "Spätestens um 18:14 zurück an der Haltestelle …". Hütte: "Spätestens um 18:00 an der Haltestelle sein → an der Hütte
  spätestens ca. 16:00 losgehen (Abstieg ca. 1:45 h + 15 min Puffer)"; Abstieg 70 % der Aufstiegs-Gehzeit, Puffer
  mindestens 15 min, auf 5 min abgerundet (`spaetestensLos`). Bei Bergbahn: "Letzte Talfahrt der Bahn prüfen".
- **Mitfahrende einladen**: Textknopf neben "Umstiege und Ticket" (44 px). Teilt über die Web Share API, sonst in die
  Zwischenablage mit Rückmeldung "Einladung kopiert"; geht beides nicht, steht der Text zum Markieren da. Text aus
  `einladungsText` mit Link auf die Seite samt Datum und dem Gruppenhinweis des Landes.
- **Gruppenhinweis**: im aufgeklappten Verbindungsdetail unter dem Ticket-Hinweis "Zu mehreren: …" mit Link "Mehr dazu"
  (`gruppenHinweis`/`gruppenQuelle` in `content/tickets.yaml`).
- **Kostenzeile** (`KostenZeile`): unter der CO2-Zeile, 14 px tinte-2, "🚗 Mit dem Auto nach der Fahrtkostenregel der Sektion
  (0,30 € pro Person und km): ca. 185 € hin und zurück." plus kurzer Ticket-Hinweis ohne Preise (`bahnTicketKurz`).
- **Kartenlegende**: unten links in der Karte, karte-Weiß 90 %, 11 px. Vier Punkte in den Stufenfarben, bei Tagestour
  "8 h und mehr / 6 h / 4 h / weniger" (Zeit vor Ort), bei mehreren Tagen "bis 2 h / 3 h / 4 h / über 4 h" (Fahrzeit), dazu grau
  "passt nicht". Entfällt im schmalen Kartenstreifen. Nicht klickbar.
- **Karten-Platzhalter**: nebel-Fläche mit "Karte wird geladen … Die Liste zeigt dieselben Ziele.", bis Kacheln und Punkte
  da sind. Die Kartenregion nennt Screenreadern "Alle Ziele auch in der Liste".
- **Skeleton**: nebel-Fläche mit `animate-pulse`, gleiche Höhe wie die spätere Zeile.
- **Tour-Card**: Card ohne Ganzflächen-Link; der Titel ist der Link zum Portal (neuer Tab). Darunter eine Meta-Zeile mit
  Punkt-Trennern in fester Reihenfolge (Sportart · Dauer h:mm · Höhenmeter · Länge · Schwierigkeit), nur belegte Werte.
  Dritte Zeile: Anbieter-Badge (nebel: "Alpenvereinaktiv", "SAC-Tourenportal", "komoot") und Badge "ÖV-tauglich" (tanne-tint).
  Raster wie Hütten (sm: 2 Spalten). Reihenfolge auf der Gebietsseite: Kopf, Anreise, Touren, Hütten.
- **Einbettung (Platzhalter bis Klick)**: Fremdinhalte (Karte, Höhenprofil eines Tourenportals) laden nie von selbst.
  Platzhalter in Kartenhöhe (520 px, sm 600 px), Rahmen linie, Radius karte, nebel-Fläche, ein Satz zum Datenabfluss und ein
  `knopf` "Karte und Höhenprofil laden (Anbieter)". Erst nach Klick ersetzt das iframe (`loading="lazy"`, `allow="geolocation"`,
  volle Breite, gleiche Höhe) den Platzhalter. Darunter immer der Textlink "Bei Anbieter öffnen" (44 px hoch).
  Auf der Gebietsseite liegt der Tour-Embed hinter `details`/`summary` "Karte anzeigen" über beide Spalten; ein Sammlungs-Embed
  steht offen über den Tour-Cards.

## Ansichten auf dem Handy

- **Startseite:** Segment Liste | Karte; die Wahl steht in der URL (`ansicht`) und wird im Browser gemerkt. Die Karte zeigt
  die Ausgangsorte in den Farben ihrer Passung und die Strecke des gewählten Orts.
- **Ortsseite:** ein Kartenstreifen über dem Feld; Antippen öffnet die Karte groß.

## Verhalten

- Zustand (Zeitfenster, Ansicht) lebt in der URL. Zurück-Taste und Teilen funktionieren.
- Live-Daten laden nach dem Rendern. Ohne JavaScript bleiben Orts-, Hütten- und Textseiten lesbar (ohne Uhrzeiten);
  Startseite, Karte und Zeitfenster brauchen JavaScript.
- Fokus sichtbar (2 px tanne-Ring). Kontraste mindestens 4.5:1 für Text.
