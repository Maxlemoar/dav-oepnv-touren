# Design System

Ziel: Auf dem Handy am Samstagmorgen in 30 Sekunden zur Antwort. Ruhig, lesbar, ohne Outdoor-Kitsch.
Eine Farbe trägt Bedeutung, sonst Grau- und Papiertöne.

## Grundsätze

1. **Mobile first.** Alles wird für 360 px Breite entworfen und wächst ab 640 px (sm) und 1024 px (lg).
   Auf dem Handy ist die Liste der Normalfall, die Karte ein Segment in der Steuerleiste. Ab lg stehen Liste und Karte nebeneinander.
2. **Eine Spalte, klare Reihenfolge.** Versprechen, Suche, Steuerleiste (Zeitraum, Filter, Ansicht), Ergebnisse. Keine Sidebar auf dem Handy.
   Details zu Zeitraum und Filter liegen in Sheets, nicht auf der Seite.
3. **Berührbar.** Jedes Bedienelement mindestens 44 px hoch. Chips 36 px mit 8 px Abstand. Keine Hover-only-Funktionen.
4. **Farbe heißt etwas.** Grün bis Orange ist Reisezeit. Signalfarbe nur für Handlungen und das Tagesziel-Urteil.
   Betreiberfarben (DAV, SAC) nur als kleines Symbol, nie als Fläche.
5. **Zahlen zuerst.** Fahrzeit, Umstiege, Tourenfenster stehen fett am Anfang der Zeile. Prosa danach.
6. **Wartezustände sind ehrlich.** Skeleton beim Laden, klarer Hinweis beim Richtwert-Fallback, nie leere Fläche.
7. **Ergebnisse über der Falz.** Auf 390 px Breite ist die erste Ergebniskarte ohne Scrollen sichtbar: Kopf inkl. Suchfeld
   höchstens ca. 190 px (Titel eine Zeile, Untertitel eine Zeile, Suchfeld 44 px), darunter die 57 px hohe Steuerleiste,
   dann sofort die Ergebnisse. Die Seite lädt zum Stöbern ein, nicht zum Formularausfüllen.

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
| signal | #c4471a | Tagesziel-Badge, wichtiger Hinweis |
| signal-tint | #fbe9e0 | Hintergrund Warnhinweis |
| stufe-2 … stufe-5 | #2f6b52, #7fa85a, #d9a441, #b85a22 | Reisezeit bis 2/3/4/5 h, Karte und Badge. Text auf stufe-3 und stufe-4 in tinte, sonst weiß |
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
- **Badge**: 24 px hoch, Radius 999. Varianten: stufe (Reisezeit), tagesziel (signal), ticket (nebel), betreiber (Symbol + Text).
- **Verbindungszeile**: eine Zeile fett mit Zahlen, darunter Meta. Aufklappbar zu Abschnitten.
- **Steuerleiste**: eine Zeile, sticky unter dem Header (`sticky top-14`), bg-papier/95 mit backdrop-blur und Trennlinie unten, 56 px + 1 px hoch, horizontal scrollbar. Links die Pills Zeitraum und Filter, rechts das Segment Liste | Karte (nur unter lg). Muss direktes Kind des Ergebnis-Containers sein, sonst trägt sticky nicht.
- **Pill**: 40 px hoch, Radius 999, Rahmen linie auf Karte-Weiß, Symbol + Text, `aria-haspopup="dialog"`. Zeitraum-Pill zeigt "Sa 12.9." oder "Sa 12.9. – So 13.9." (`zeitraumText`) und heißt für Screenreader "Zeitraum ändern: Sa 12.9.", Filter-Pill trägt einen tanne-Zähler (`anzahlAktiverFilter`: Sportarten + Art + Fahrzeit ≠ 5 h + Fenster ≠ 6 h) als kleines Badge.
- **Sheet**: natives `<dialog>` mit `showModal()`. Auf dem Handy von unten (rounded-t-2xl, max-h 85dvh, Griff-Linie), ab sm zentriert (max-w-md, rounded-2xl). Backdrop tinte/50, Klick darauf und Esc schließen, Body-Scroll gesperrt, Fokus auf dem ersten Bedienelement. Kopf mit Titel, Body scrollbar, unten "Fertig" (knopf, volle Breite) und optional ein sekundärer Knopf. Auswahl wirkt sofort im Hintergrund, "Fertig" schließt nur.
- **Sheet "Wann?"**: 2×2-Raster großer Chips Sa / So / Wochenende / Fr–So (44 px, Datum klein als zweite Zeile), darunter aufklappbar "Anderes Datum" mit den Feldern Hin und Zurück ("Zurück" liegt nie vor "Hin"), darunter "Mindestens am Berg" als Chip-Reihe 3 / 4 / 5 / 6 / 8 h, nur bei gleichem Tag aktiv, sonst ausgegraut mit Hinweis.
- **Sheet "Was?"**: Schalter "Nur was am Datum geht" mit Erklärzeile und ggf. "x Ziele wegen Saison ausgeblendet · Einblenden",
  Art-Segment (Alle / Tagestour / Mit Hütte), Sportart-Chips, Fahrzeit-Chips, unten "Zurücksetzen" (sekundär) neben "Fertig".
- **Unter der Liste**: Erklärzeile über der Liste "ca. = typische Fahrzeit ab Offenburg an einem Samstag, Stand …".
  Am Ende Textknöpfe "n weitere Ziele über 5 h anzeigen" (setzt die Fahrzeit auf "alle") und ggf. der Saison-Knopf.
  Ohne Treffer bietet die Liste passende Hütten als Links an.
- **Badge "Haus der Sektion Offenburg"**: tanne-tint mit tanne-Text auf Gebieten, in denen ein Haus der eigenen Sektion steht
  (Sektionsname immer ausgeschrieben, `EIGENE_SEKTION`); auf der Karte ein dunkler Ring um den Punkt, im Popup als Zeile.
  Keine Dauerleiste über den Ergebnissen.
- **Saison-Badge** (`SaisonBadge`): signal-tint mit signal-Text und feinem signal-Rahmen, Texte "Saisonziel" (Gebiet außerhalb
  seiner Saison) oder "am Datum kein Bus" (Hauptzugang laut `bedient` nicht bedient). Erscheint auf Gebietskarte und
  Ergebnisstreifen nur, wenn der Schalter "Nur was am Datum geht" aus ist; sonst sind diese Ziele ausgeblendet und unter der
  Liste steht "x Ziele wegen Saison ausgeblendet, einblenden".
- **Zustands-Badge** (`ZustandBadge`): Zustand einer Hütte am Anreisetag, "Sa 14.11.: offen" (tanne-tint), "nur Winterraum"
  (nebel), "geschlossen" (signal-tint, signal-Text). Ist der Zustand nur aus der Saison geschätzt, steht "vermutlich" davor.
  Auf der Hüttenseite wird "geschlossen" zum Warnhinweis mit `statusHinweis`, der Winterraum zu einem ruhigen nebel-Kasten.
- **Warnhinweis** (`.warnhinweis`): Kasten mit Radius knopf, signal-tint-Fläche, feiner signal-Rahmen, Text tinte 14 px.
  Für Dinge, die eine Tour verhindern: geschlossene Hütte, gesperrter Weg (`tour.hinweis`), kein Bus am Datum,
  Datum in der Vergangenheit, "keine Verbindung gefunden, vermutlich Saisonbetrieb". Sparsam, höchstens einer je Karte.
- **Tagesziel-Badge mit Grund**: "Besser mit Übernachtung" (nebel) mit der Begründung klein in tinte-3 daneben,
  z. B. "· Ankunft erst 10:40" (`tageszielGrund` bzw. `grund` der Übersicht).
- **Zeitraum auf Detailseiten**: Gebiets- und Hüttenseite haben unter dem Kopf "Verbindung für" plus dieselbe Zeitraum-Pill
  wie die Startseite (`ZeitraumPill`), die das Sheet "Wann?" öffnet. Auf Hüttenseiten nur Zeiträume mit Übernachtung und
  kein Tourenfenster. Alle internen Links auf Gebiete und Hütten tragen `datum`, `rueck`, `fenster` weiter (`ZeitraumLink`,
  `zeitraumQuery`). Bis zur Hydration steht "Kommender Samstag" statt eines Datums.
  Ist nur `rueck` gesetzt, nehmen die Links das verwendete Hin-Datum ausdrücklich mit, damit Hin- und Rückdatum zusammenbleiben.
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
- **Kartenlegende**: unten links in der Karte, über dem Ergebnisstreifen (Abstand = Streifenhöhe + 8 px), karte-Weiß 90 %,
  11 px. Vier Punkte in den Stufenfarben "bis 2 h / 3 h / 4 h / über 4 h", darunter ein Punkt mit dunklem Ring
  "Haus der Sektion Offenburg". Nicht klickbar.
- **Karten-Platzhalter**: nebel-Fläche mit "Karte wird geladen … Die Liste zeigt dieselben Ziele.", bis Kacheln und Punkte
  da sind. Die Kartenregion nennt Screenreadern "Alle Ziele auch in der Liste".
- **Schalter** (`role="switch"`): 44 px hohe Zeile, Beschriftung links, 40 × 24 px Schiene rechts (an: tanne, aus: linie).
  Bisher nur "Nur was am Datum geht" im Sheet "Was?", Standard an.
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

- **Karte ist der Standard.** Sie zeigt Lage und Reisezeit auf einen Blick und lädt zum Stöbern ein.
  Das Segment in der Steuerleiste schaltet auf die Liste um; die Wahl steht in der URL und wird im
  Browser gemerkt. Server und erste Darstellung liefern die Liste, damit die Ziele auch ohne
  JavaScript und für Suchmaschinen im HTML stehen.
- **Kartenansicht füllt den Bildschirm:** eine Spalte über die volle Höhe unter dem Header, Titel ausgeblendet,
  kein Scrollen nötig. Über dem Suchfeld bleibt das Nutzenversprechen als eine Zeile (14 px, tinte-2, abgeschnitten).
- **Ergebnisstreifen** über dem unteren Kartenrand: waagerecht wischbare Karten mit Einrasten, je Karte
  Name, Reisezeit, Region und Zahl der Hütten und Touren. Die Karte fliegt zum eingerasteten Ziel.
  Unterer Rand lässt die Kartenlizenz frei. Ab lg entfällt der Streifen, dort steht die Liste daneben.

## Verhalten

- Zustand (Zeitraum, Filter, Suche) lebt in der URL. Zurück-Taste und Teilen funktionieren.
- Live-Daten laden nach dem Rendern. Die Seite ist ohne JavaScript lesbar, nur ohne Uhrzeiten.
- Fokus sichtbar (2 px tanne-Ring). Kontraste mindestens 4.5:1 für Text.
