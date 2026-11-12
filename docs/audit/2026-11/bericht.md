# Qualitätscheck „Ohne Auto in die Berge“, November 2026

Stand 12.11.2026. Grundlage: maschinelle Prüfung aller Inhalte (`npm run audit`), vier Regionalprüfungen mit Quellen, ein Produkt-Review mit frischem Blick und eine Recherche zu Vergleichsangeboten und Fördermöglichkeiten. Alle Einzelbefunde liegen im selben Ordner, die Recherche unter `docs/research/naechstes-level.md`.

## Kurzfazit

Die Idee trägt, und der Kern funktioniert: Wer auf ein Gebiet tippt, bekommt eine echte Verbindung für sein Datum, eine Rückfahrt und einen Buchungslink, der direkt die richtige Suche öffnet. So etwas gibt es für Baden sonst nirgends, auch Zuugle und der DAV-Werkzeugkasten decken die Region nicht ab.

Verlässlich ist der Dienst im Moment aber nicht. Drei Dinge wiegen schwer:

1. **Die Startseite kann ihr wichtigstes Urteil nicht fällen.** Für „Tagesziel ja oder nein“ stellt sie pro Datum 168 Anfragen auf einmal an Transitous. Die meisten werden wegen Überlast abgelehnt, und das leere Ergebnis bleibt 24 Stunden gespeichert.
2. **Die Seite kennt keine Jahreszeit.** Im November zeigt sie Hochtouren, Sommerhütten und Ziele mit Sommerbussen genauso wie im Juli, ohne Warnung.
3. **Rund die Hälfte der Hütteneinträge braucht eine Korrektur.** Meist sind die Zustiege zu kurz, weil ein Bus oder eine Bergbahn stillschweigend vorausgesetzt wird. Drei Hütten sind geschlossen, sieben stehen an der falschen Stelle, darunter das eigene Haus Rämsenberg.

Dazu kommen zwei Fristen: Am 13.12. ist Fahrplanwechsel, danach drohen die Kennungen von rund 100 Haltestellen auszufallen. Und der Seite fehlen Impressum und Datenschutzerklärung.

## Was gut ist

- **Einzigartiges Angebot.** Kein anderer Dienst plant Bergziele ab Offenburg mit Bahn und Bus. Zuugle hat inzwischen Echtzeit und Wetter, startet in Deutschland aber nur in Bayern.
- **Echte Verbindungen statt Faustregeln.** Hinfahrt, Rückfahrt, Zeit am Berg, Ticket-Hinweis und Links zu bahn.de und SBB, die die passende Suche öffnen.
- **Große Auswahl.** 84 Gebiete von 19 Minuten (Bühlertal) bis gut fünf Stunden, 132 Hütten, 221 Touren.
- **Saubere Touren-Daten.** 220 von 221 Tourenlinks funktionieren. Bei 219 von 220 stimmen Dauer, Höhenmeter und Länge mit der Quelle überein.
- **Solide Haltestellen.** 145 von 157 sind richtig, die übrigen meist nur falsch beschrieben.
- **Schnell und offen gebaut.** Detailseiten laden in gut einer halben Sekunde, die Liste steht auch ohne JavaScript im HTML, 178 Tests laufen grün, Code und Inhalte sind offen lizenziert.

## Was schlecht ist

### Kritisch

| Problem | Folge | Abhilfe |
|---|---|---|
| Übersicht flutet Transitous mit 168 Anfragen und speichert Fehlschläge 24 h | Keine Tagesziel-Urteile, Filter „Tagestour“ wirkungslos, niemand erfährt warum. Transitous bittet ab etwa 720 Anfragen pro Tag um Kontakt. | Urteile nachts für die nächsten Wochenenden vorberechnen, Fehlschläge nicht speichern, Transitous anschreiben |
| Haltestellen-Kennungen enthalten das Fahrplanjahr (89 Schweizer, 11 österreichische) | Nach dem Fahrplanwechsel fallen Live-Verbindungen für diese Ziele aus. Bei der Bielerhöhe und am Col de la Schlucht ist das schon passiert. | Verbindungen über Koordinaten abfragen, das ist im Test verlässlich und unabhängig vom Fahrplanjahr |
| Kein Impressum, keine Datenschutzerklärung | Pflichtangaben für eine öffentliche Vereinsseite fehlen, die Karte lädt Daten von Fremdservern | Beide Seiten anlegen, mit dem Vorstand abstimmen |
| Daten nach dem 13.12. fehlen bei Transitous, die Seite zeigt trotzdem „live“ | Für Wochenenden ab dem 19.12. erscheinen Umwege über Straßburg oder gar keine Verbindung | Datumswahl bis zum Eintreffen der Daten begrenzen oder kennzeichnen, Anfang Dezember erneut prüfen |
| Gewählter Zeitraum geht beim Klick auf ein Ziel verloren | Wer Fr–So plant, sieht auf der Hüttenseite wieder Sa–So. Detailseiten haben keine Datumswahl. | Zeitraum in allen Links mitgeben, Zeitraumwahl auch auf Detailseiten |

### Hoch

- **Keine Jahreszeit.** Das Feld Saison wird nicht zum Filtern genutzt. Fährt am gewählten Tag kein Bus, zeigt die Seite trotzdem „ca. 5:13 h, stündlich“. 14 Sommergebiete führen Ski- oder Schneeschuhtouren.
- **Zustiege zu kurz.** Bei vielen Hütten wird die Gehzeit ab einer Bushaltestelle oder Bergstation angegeben, der Zustieg aber ab dem Bahnhof modelliert. Beispiele: Naturfreundehaus Kniebis „10 min ab Freudenstadt Hbf“ bei 9,6 km Luftlinie, Hohwaldhütte „30 min ab Barr“ bei 13 km.
- **Datum vom Build im HTML.** Die Startseite enthält noch „Sa 12.9.“ und wirft dadurch bei jedem Aufruf einen Fehler im Browser.
- **Irreführende Fehlermeldung.** Ein vergangenes Datum ergibt „Live-Fahrplan gerade nicht erreichbar“.
- **Erster Eindruck am Handy.** In der Kartenansicht fehlen Einzeiler und Legende, die Karte bleibt beim Laden einige Sekunden leer. Die Kartenansicht als Standard bleibt richtig, braucht aber diese zwei Ergänzungen.

## Datenprüfung im Einzelnen

### Hütten (132)

| Urteil | Anzahl |
|---|---|
| richtig | 57 |
| korrigieren | 61 |
| fraglich | 11 |
| geschlossen | 3 |

**Geschlossen:** Anenhütte (seit dem Bergsturz von Blatten, Wiedereröffnung frühestens 2028), Cavardirashütte (Neubau, 2027 und 2028 zu, im Winter 2026/27 nur Schutzraum), Schwarzwasserhütte (Umbau, Wiedereröffnung Winter 2026/27 oder Sommer 2027).

**Falscher Standort:** Rämsenberg liegt 3 km zu weit südlich, tatsächlich 150 m neben der Bergstation Biel, Fußweg 2 statt 30 Minuten. Ebenfalls versetzt: Doldenhornhütte (1,6 km), Rugghubelhütte (1,4 km), Blüemlisalphütte (1,1 km), Les Jonquilles (3 km), Hohwaldhütte und La Chaume des Veaux. Beim Naturfreundehaus Großer Wald stimmt die Höhe nicht (235 statt 500 m).

**Gesperrter oder geänderter Weg:** Der Normalweg zur Fründenhütte ist wegen Felssturzgefahr gesperrt, die Ersatzroute ist T4 und eine Stunde länger. Die Triftbahn zur Windegghütte fuhr 2026 gar nicht. Die Silvretta-Hochalpenstraße bleibt ab Montafon bis voraussichtlich 2030 gesperrt.

**Zu kurze Zustiege mit Quelle**, unter anderem: Rappensee 240 statt 180 min, Darmstädter 270 statt 210, Mannheimer 270 statt 180, Kröntenhütte 285 statt 210, Schwarzenberghütte 150 statt 60 ohne Sommerbus, Saarbrücker 150 statt 90. Bei sieben SAC-Hütten sind die Höhenmeter zu niedrig, etwa Lauteraarhütte 950 statt 450.

**Kleinere Fehler:** falsche Sektion (Grialetschhütte gehört der Sektion Davos), fehlende Hinweise (Sandkästle nur für Mitglieder, Selbstversorger, 17 Plätze; Chalet Schnepfenried nur am Wochenende und in Ferien), fehlende Hütte (Mutthornhütte, Neubau fertig seit 11/2025).

### Haltestellen (157)

| Urteil | Anzahl |
|---|---|
| richtig | 145 |
| korrigieren | 6 |
| fraglich | 6 |

Mindestens elf Haltestellen werden nur im Sommer bedient, etwa Griesalp, Iffigenalp, Grimsel Hospiz, Steingletscher, Lünerseebahn, Zugertal und Spielmannsau. Das ist kein Datenfehler, die Seite sagt es aber niemandem. Einen Bus von Linthal nach Tierfehd gibt es nicht, betroffen sind Fridolins- und Muttseehütte. Die Strecke Sonceboz–Moutier ist bis September 2027 gesperrt.

### Verbindungen (157 Haltestellen, Samstag 21.11. hin, Sonntag 22.11. zurück)

| Befund | Anzahl |
|---|---|
| Hinfahrt zwischen 5 und 8 Uhr und Rückfahrt am Sonntag möglich | 137 |
| im Winter gar nicht erreichbar (Sommerbus oder Sommerbahn) | 17 |
| nur abends erreichbar (Dürrboden) | 1 |
| Hinfahrt ja, aber keine Rückfahrt am Sonntag (Gersbach) | 1 |
| Kennung von Transitous nicht mehr gefunden (Bielerhöhe, Col de la Schlucht) | 2 |

**Richtwerte halten:** Die Fahrzeiten vom September weichen im Winterfahrplan im Mittel nicht ab, bei 91 von 137 Haltestellen um höchstens 15 Minuten. Keine Haltestelle ist deutlich langsamer geworden.

**Nach dem Fahrplanwechsel noch nicht prüfbar:** Transitous kennt den DB-Fahrplan ab 13.12. noch nicht. Für den 19.12. findet es deshalb für 26 von 84 Hauptzugängen keine Hinfahrt und schickt die übrigen über Straßburg. Das hat eine Folge schon heute: Wer auf der Seite ein Datum nach dem 13.12. wählt, bekommt diese falschen Verbindungen als „live“ angezeigt, etwa Singen in 4:25 statt 1:54 Stunden oder Oberstdorf in fast zehn Stunden. Bis die Daten da sind, sollte die Datumswahl auf den laufenden Fahrplan begrenzt oder klar gekennzeichnet sein.

### Gebiete (84)

| Urteil | Anzahl |
|---|---|
| richtig | 52 |
| korrigieren | 26 |
| fraglich | 6 |

Die Fehler stecken fast alle in den Beschreibungstexten: veraltete Hüttenzahlen (Kandersteg nennt drei statt fünf), nicht existierende Busse („Linienbus auf die Bielerhöhe“), falsche Fahrzeiten (Blaubeuren 3,5 statt 3 Stunden) und eine geschlossene Hütte im Text (Lötschental nennt die Anenhütte).

### Touren (221)

| Befund | Anzahl |
|---|---|
| Link funktioniert | 220 |
| Kennzahlen stimmen mit der Quelle | 219 von 220 |
| falsche Region | 2 |
| Start an einem Parkplatz | 5 |
| Start an einer Bergbahn-Bergstation | 25 |
| Start an einem Bahnhof oder Bus, der nicht im Datensatz ist | etwa 22 |
| betrifft geschlossene Hütte oder gesperrten Weg | 4 |

**Falsch zugeordnet:** Die „Klettersteigrunde Hanselsteig“ liegt in Niederösterreich, nicht im Dahner Felsenland. Die „Schwarzsee-Runde“ führt um den Schwarzsee bei Kitzbühel, nicht im Kanton Freiburg. Beide müssen raus.

**Realismus:** 56 Touren beginnen nicht an einer unserer Haltestellen. Die meisten sind trotzdem ohne Auto machbar, weil sie an einer Bergbahn oder einem anderen Bahnhof starten. Die Seite erklärt diesen letzten Schritt aber nicht. Fünf Touren beginnen an einem Parkplatz und passen nicht zum Anspruch der Seite.

## Was ausbaufähig ist

- **Auffindbarkeit:** keine Sitemap, für alle 216 Detailseiten dieselbe Beschreibung, keine Vorschaubilder beim Teilen, englische Fehlerseite, Adresse noch auf vercel.app.
- **Begriffe erklären:** „ca. 4:10 h“ ist ein Richtwert vom September, die Reisezeitfarben haben keine Legende, „Besser mit Übernachtung“ erscheint ohne Begründung, auch bei 7,5 Stunden am Berg.
- **Buchung:** Keine der 132 Hütten hat einen Buchungslink.
- **Suche:** Wer „doldenhorn“ sucht, findet die Hütte nur im Vorschlagsmenü, die Liste meldet „Nichts gefunden“.
- **Technik:** Sicherheitsupdates offen (Next 16.4.6), ein Drittel des Startseiten-JavaScripts ist eine Prüfbibliothek, die im Browser nicht gebraucht wird.
- **Rückmeldung:** „Fehler melden“ führt zu GitHub, eine Mailadresse fehlt. Nutzungszahlen gibt es keine.
- **Elf Ziele über fünf Stunden** sind ohne Hinweis ausgeblendet.

## Nächstes Level

Drei Schritte würden den Dienst von einer guten Übersicht zu einem Werkzeug machen, auf das man sich verlässt und das Autofahrten tatsächlich ersetzt.

### 1. Verlässlichkeit als Markenkern

Wer das Auto stehen lässt, braucht Gewissheit, dass er hin- und zurückkommt und die Hütte offen ist. Das kann bisher kein anderes Angebot.

- **Rückfahrt-Rechner „Spätestens los um …“:** rechnet aus letzter Rückfahrt, Zustieg und Betriebsende der Bergbahn rückwärts und zeigt einen Plan B.
- **Saison-Ampel:** Hütte bewirtschaftet, Winterraum oder geschlossen am gewählten Datum; Saisonbus fährt oder fährt nicht. hut-reservation.org liefert Status und freie Betten für DAV-, ÖAV- und SAC-Hütten, die Nutzung müsste aber mit dem DAV abgestimmt werden.
- **Letzter Kilometer sichtbar:** Bus und Bergbahn bis zum Tourenstart als Teil der Verbindung.
- **Wetter am Datum** über Open-Meteo, frei und ohne Schlüssel.

### 2. Ins Sektionsleben einbauen

74 % der Emissionen von DAV-Veranstaltungen entstehen durch die Anreise, davon 72 % im eigenen Auto. Der größte Hebel liegt also im Tourenprogramm der Sektion.

- **Sektionstouren mit Anreise:** Das Programm ist über DAV360 offen abrufbar. Die Seite zeigt zu jeder Tour die Verbindung und liefert einen fertigen Anreisetext für die Tourenleitung.
- **Öffi-Symbol und Öffi-Pauschale:** München & Oberland hat damit den Anteil der Öffi-Touren von 23 % (2021) auf 36 % (2025) gesteigert.
- **Zug-Treff:** „Ich fahre Samstag mit dem 6:12“ zum Teilen, mit Hinweis auf Gruppenpreise. Eine Mitfahrbörse für die Bahn gibt es nirgends.

### 3. Gemeinsam und gefördert

- **Nachbarsektionen:** Lahr und Kehl sind technisch fertig, Freiburg und Karlsruhe ließen sich ergänzen. Dann wäre es der ÖV-Planer für den ganzen Oberrhein.
- **Geld:** Der DAV-Klimafonds fördert 50 % eines Projekts bis 50.000 €. Ab 2027 haben Sektionen ein Klimaschutzbudget von 8 % ihres Haushalts und dürfen es für gemeinsame Maßnahmen bündeln.
- **Transitous:** Absprache über die Nutzung, das ist ohnehin nötig.

### Weitere Ideen

Kostenvergleich Bahn gegen Auto, Überschreitungen von A nach B (mit dem Auto nicht möglich), Lawinenlage für Schweizer Ziele (SLF, frei nutzbar), „Ich bin so gefahren“-Rückmeldung pro Tour, QR-Codes in der Kletterhalle und im Programmheft.

## Empfohlene Reihenfolge

| Wann | Was |
|---|---|
| Diese Woche | Datumswahl auf den laufenden Fahrplan begrenzen. Impressum und Datenschutz. Zwei falsche Touren und den toten Link entfernen. Geschlossene Hütten kennzeichnen. Rämsenberg und die übrigen versetzten Hütten korrigieren. Übersicht entschärfen. Verbindungen auf Koordinaten umstellen. |
| Bis 13.12. | Die 138 belegten Korrekturen einspielen. Jahreszeit beim Filtern und Anzeigen berücksichtigen. Zeitraum auf Detailseiten. Datumsfehler beheben. Transitous anschreiben. |
| Nach dem Fahrplanwechsel | Sobald Transitous den DB-Fahrplan 2027 hat: Richtwerte neu berechnen, `npm run audit` wiederholen. |
| Winter | Arbeitskreis prüft die 72 unsicheren Vorschläge. Sektionsprogramm einbinden. Klimafonds-Antrag. Gespräch mit Nachbarsektionen. |
| Vor dem Sommer 2027 | Saison-Ampel, Rückfahrt-Rechner, Zug-Treff. |

## Was es dafür braucht

- **Freigabe**, die belegten Korrekturen einzuspielen. Die unsicheren gehen an den Arbeitskreis.
- **Angaben fürs Impressum:** Wer ist verantwortlich, die Sektion oder eine Person?
- **Eine Kontaktperson** für Transitous und gegebenenfalls den DAV wegen der Hüttendaten.
- **Prioritäten** für das nächste Level.

## Dateien

- `automatisch.md`, `verbindungen.json`, `huetten.json`, `touren.json`, `links.json`: maschinelle Prüfung
- `g1-pruefung.md` bis `g4-pruefung.md`: Regionalprüfungen mit Quellen
- `g1-korrekturen.yaml` bis `g4-korrekturen.yaml`: 210 Korrekturvorschläge, 138 mit belastbarer Quelle
- `produkt-review.md`: Produkt-Review mit Messwerten
- `../../research/naechstes-level.md`: Recherche zu Vergleichsangeboten, DAV-Klimaschutz und Datenquellen
