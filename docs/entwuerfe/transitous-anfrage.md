# Entwurf: Anfrage an Transitous

Stand 19.11.2026. **Entwurf, nicht versendet.** Absender: Maximilian Marowsky für den Arbeitskreis Klimaschutz der DAV Sektion Offenburg.

## Kontaktweg

Transitous nennt **keine E-Mail-Adresse**. Für Fragen zum Anfragevolumen verweist die Nutzungsrichtlinie ausdrücklich auf den Matrix-Raum:

- **Matrix:** `#transitous:matrix.spline.de` (im Browser: https://matrix.to/#/%23transitous:matrix.spline.de). Das ist der empfohlene Weg.
- Ausweichweg: ein GitHub-Issue unter https://github.com/public-transport/transitous/issues. Fehler in einzelnen Feeds oder Haltestellen gehören eher dorthin.
- Mastodon (`@transitous@en.osm.town`) nur für Neuigkeiten, nicht für die Abstimmung.

Den Text unten als eine Nachricht in den Matrix-Raum stellen. Die Liste der Fragen kann für Matrix gekürzt werden. Für ein GitHub-Issue passt der Text so wie er ist.

## Vor dem Versand prüfen

- [ ] Die Fußzeile mit dem Link auf **https://transitous.org/sources/** ist online (Paket P5). Laut Richtlinie ist dieser Link Pflicht. Bisher verlinkt nur die Über-Seite auf `transitous.org`.
- [ ] Der Umbau ist live (P3): keine Live-Abfragen mehr auf der Übersicht, Fehlschläge werden nicht 24 h gespeichert.
- [ ] Die Zahlen stimmen mit dem Stand nach dem Umbau überein: Vorab-Lauf etwa 500, Prüflauf etwa 400 Anfragen, beide an verschiedenen Tagen.
- [ ] Die Schätzung der Live-Anfragen ist angepasst (siehe Annahme unten). Nutzungszahlen gibt es bisher keine.
- [ ] Der User-Agent ist angepasst, falls Transitous eine E-Mail darin möchte. Dann `<Absender-E-Mail>` eintragen.

---

**Subject / first line:** Usage check: small non-profit trip planner (DAV Offenburg), ~1,000 /plan requests per month

Hi Transitous team,

I'm Maximilian, a volunteer in the climate working group of the German Alpine Club's Offenburg section (DAV Sektion Offenburg e.V., a registered non-profit association). We run "Ohne Auto in die Berge, ab Offenburg" (https://dav-oepnv-touren.vercel.app). It's a free planner that shows which mountain areas and huts in the Black Forest, the Vosges and the Swiss and Austrian Alps you can reach from Offenburg by train and bus, with a live connection for the date you pick. It is non-commercial, has no ads or accounts, and the code is open source (MIT, content CC BY 4.0): https://github.com/Maxlemoar/dav-oepnv-touren

Thank you for Transitous. Without it this would not exist.

**How we use it.** Only `/api/v1/plan`, server-side, never from the browser. An early version of our overview page sent far too many requests at once (168 per date). We're sorry about that. We have reworked it:

- **Live requests** only happen when someone opens an area or hut page: 2 `/plan` requests (outbound and return) per stop and date, cached for 24 h per origin, stop and date. We have no usage statistics yet. Our rough worst case is under 400 requests per day, and probably far fewer.
- **Monthly precomputation** of day-trip windows for the coming weekends: about 500 `/plan` requests, spread over one hour (one roughly every 7 seconds).
- **Monthly data check** of all 157 stops: about 400 `/plan` requests, run on a different day from the precomputation.

**Attribution:** every page links to https://transitous.org/sources/ in the footer.
**User-Agent:** `dav-oepnv-touren/0.1 (https://github.com/Maxlemoar/dav-oepnv-touren)`

Our questions:

1. Is this volume OK for you, or should we change anything, for example the timing, the spacing, or a different endpoint (such as `one-to-many`) for the precomputation?
2. Do you prefer a particular User-Agent format? Should we add an e-mail address?
3. For the two monthly batch runs, would you rather we self-host MOTIS with your dataset? If so, do you have a recommended setup?
4. When do you expect the German DELFI timetable for 2027 (valid from 13 Dec 2026) to be loaded? Right now, queries after 13 Dec either find nothing or route via Strasbourg, so we will limit our date picker until then.
5. Some of our stop IDs include the timetable year in the feed prefix (`ch-opentransportdataswiss26_…`, `at-Railway-Current-Reference-Data-2026_…`). Two of our IDs have already stopped resolving: Bielerhöhe (`at-Fahrplandaten-Verkehrsverbund-Tirol-Flex-2026_…`) and Col de la Schlucht (`fr-offre-de-transport-du-reseau-fluo-grand-est-vosges-88_141735`). We plan to query by coordinates instead. Is that the right approach, or is there a stable ID we should use?

In return: our monthly check covers 157 stops in DE, FR, CH and AT. If it would help, we'll report stop IDs that disappear or look wrong after the timetable change. Just tell us where you would like those reports (GitHub issue or here).

Thanks a lot,
Maximilian Marowsky
Arbeitskreis Klimaschutz, DAV Sektion Offenburg
<Absender-E-Mail>

---

## Annahmen und offene Fragen

- **Live-Anfragen pro Tag:** Die Grenze von unter 400 ist eine Annahme. Sie geht von höchstens 100 Detailseiten-Aufrufen am Tag zu verschiedenen Zielen aus, mit im Mittel etwa zwei Haltestellen je Gebiet und je zwei Anfragen. Gemessen ist das nicht, die Seite zählt keine Aufrufe. Transitous bittet ab etwa 720 Anfragen in 24 Stunden um Abstimmung. Am Tag des Vorab-Laufs kommen 500 Anfragen plus die Live-Anfragen zusammen. Deshalb fragen wir überhaupt.
- **Anfragen je Seite:** Laut `src/lib/verbindung/service.ts` sind es 2 `/plan`-Anfragen je Verbindung (Hinfahrt mit `anzahl: 12`, Rückfahrt mit `anzahl: 6`).
- **Weitere Startorte** (Lahr, Kehl, Freiburg, Karlsruhe) vervielfachen den Vorab-Lauf und den Prüflauf. Werden sie freigeschaltet, braucht es eine neue Absprache oder eigenes Hosting.
- **Schweizer Feed 2027:** Transitous führt schon jetzt einen zweiten Feed `Opentransportdataswiss27` neben `Opentransportdataswiss26` (Quellenseite, abgerufen 19.11.2026). Das bestätigt, dass sich die Präfixe zum Fahrplanjahr ändern.
- **„Vibecoded“:** Transitous nimmt laut Richtlinie keine „vibecoded apps“ in die Liste der vorgestellten Anwendungen auf. Der Planer ist mit viel KI-Unterstützung entstanden. Deshalb bitten wir nicht um Aufnahme in diese Liste. Die API-Nutzung selbst schließt die Richtlinie dafür nicht aus.
- **Spende:** Die Richtlinie bittet darum, eine Spende zu erwägen. Soll der Arbeitskreis einen kleinen Betrag spenden oder einen Spendenlink auf der Über-Seite setzen? Das ist in der Klimafonds-Skizze als Posten vorgesehen.
- **Absender:** Die Nachricht kommt von Maximilian als Mitglied, nicht vom Vorstand. Zu klären ist, ob „non-profit association“ ohne Rücksprache mit dem Vorstand so stehen bleiben darf.

## Quellen

- Transitous, API und Nutzungsrichtlinie (Matrix-Raum, User-Agent, Link auf /sources/ Pflicht, ab etwa 720 Anfragen pro 24 h Abstimmung, nur nicht-kommerziell, keine „vibecoded apps“ in der Vorstellungsliste), abgerufen 19.11.2026: https://transitous.org/api/
- Transitous-Startseite (Kontaktwege Matrix, GitHub und Mastodon, keine E-Mail), abgerufen 19.11.2026: https://transitous.org/
- Transitous-Quellen (DELFI zuletzt am 15.11.2026 aktualisiert, Feeds `Opentransportdataswiss26` und `…27`), abgerufen 19.11.2026: https://transitous.org/sources/
- Transitous-Feedkonfiguration für Deutschland (DELFI-Sollfahrplan von opendata-oepnv.de), abgerufen 19.11.2026: https://github.com/public-transport/transitous/blob/main/feeds/de.json
- Datensatz zum Herunterladen statt Scraping: https://github.com/public-transport/transitous/wiki/Using-Transitous-data
- Eigene Befunde: `docs/audit/2026-11/bericht.md` (168 Anfragen pro Datum, Fahrplanwechsel 13.12., Kennungen mit Fahrplanjahr, Bielerhöhe und Col de la Schlucht), `docs/research/naechstes-level.md` Abschnitt 3, `src/lib/verbindung/transitous.ts` (User-Agent)
- Zum DELFI-Fahrplan 2027 bei Transitous wurde kein Termin gefunden: Suche in den GitHub-Issues am 19.11.2026 ohne Treffer. Das ist offene Frage 4.
