# Das nächste Level für "Ohne Auto in die Berge, ab Offenburg"

Stand: 12. November 2026. Recherche für den ÖV-Tourenplaner des Arbeitskreises Klimaschutz der
DAV Sektion Offenburg (https://dav-oepnv-touren.vercel.app). Ausgangslage: Design-Spec vom
2026-09-06, `bahnverbindungen.md` (Abschnitt 2, bestehende Angebote), `dav360-api.md`.
Datenstand im Repo: 84 Gebiete, 132 Hütten (68 SAC, 28 DAV, 4 ÖAV, 19 Naturfreunde, 11 privat, 2 CAF).

Methode: Websuche, Abruf der Quellseiten (WebFetch), PDF-Auswertung mit `pdftotext`, eigene
`curl`-Abfragen gegen offene Schnittstellen (hut-reservation.org, Transitous, SLF, avalanche.report,
Zuugle-API, GitHub-API, DAV360). Alle Seiten abgerufen am 12.11.2026; das Datum in Klammern ist das
Veröffentlichungs- oder Änderungsdatum der Quelle, soweit angegeben. Was nicht selbst geprüft oder
wörtlich in einer Quelle steht, ist als **(nicht belegt)** markiert.

---

## 1. DAV und Klimaschutz

### 1.1 Ziel und Zahlen

| Befund | Quelle (Datum) |
|---|---|
| Hauptversammlung 2021: Klimaneutralität bis 2030 für Bundesverband **und Sektionen**, 87 % Zustimmung. Prinzip "Vermeiden vor Reduzieren vor Kompensieren"; kompensiert wird ab 2030 nur der Rest. | https://www.alpenverein.de/verband/presse/pressemeldungen/dav-hauptversammlung-beschliesst-klimaneutralitat-bis-2030 |
| Emissionsbilanz 2024: 50.696 t CO2e, 161 Sektionen beteiligt. **Mobilität = 74 % der veranstaltungsbezogenen Emissionen**, davon rund 72 % private Verbrenner-Pkw, Bus und Bahn rund 9 %. | https://www.alpenverein.de/artikel/dav-veroeffentlicht-neue-emissionsbilanz_6b731309-291f-4cfb-a039-04dc2cc1fb85 |
| Emissionsbilanz 2025 (vierte Bilanz): 50.375 t CO2e, 143 Sektionen (52 % der Mitglieder), 30,7 kg CO2e pro Mitglied (−12 % ggü. 2022). Pkw = 13 % der Gesamtemissionen, Veranstaltungen 25 % (2024: 30 %). | https://www.alpenverein.de/artikel/emissionen-des-dav-gehen-zurueck_6bad0465-66a2-43bf-a0a8-90094f7311b7 (ohne Datum) |
| Emissionsbilanz 2023: Mobilität = 51 % der an den Geschäftsstellen gebuchten Emissionen, Pkw 74 % davon. | https://www.alpenverein.de/verband/natur-und-klima/wir-fuers-klima/emissionsbilanzen/emissionsbilanz-2023 |
| Positionspapier Mobilität: rund 540 kg CO2 pro Mitglied und Jahr durch Anreise; Umstieg Pkw auf ÖV spart pro Person rund 70 %. | https://magazin.alpenverein.de/files/dav-positionen-und-forderungen_nachhaltige-mobilitat-im-bergsport_stand-2024.pdf (Stand 2024; Zahlen aus Suchzusammenfassung, PDF nicht selbst ausgewertet) |
| Projektskizze "Unterwegs im grünen Bereich": "Rund drei Viertel greifen dabei nach wie vor auf den PKW zurück." | https://alpenverein.de/files/241113_mob_eva-kursstandorte.pdf (erstellt 14.11.2024) |

Konsequenz für uns: Die Anreise ist der größte beeinflussbare Posten jeder Sektion. Ein Werkzeug, das
Pkw-Anreisen zu Sektionstouren ersetzt, wirkt direkt auf die Emissionsbilanz der Sektion Offenburg.

### 1.2 Geld: Klimaschutzbudget, CO2-Preis, Klimafonds

| Instrument | Inhalt | Quelle |
|---|---|---|
| **DAV-interner CO2-Preis** | 90 €/t für 2023/24, **140 €/t für 2025, 2026, 2027**. Daraus berechnet sich das Klimaschutzbudget jeder Sektion. Sektionen ohne Bilanz planen pauschal 5 %, **ab Haushaltsjahr 2027 8 % des Haushalts**. Mittel sind zweckgebunden, bleiben in der Sektion, Sektionen entscheiden selbst über Maßnahmen und dürfen **gemeinsame Maßnahmen mit anderen Sektionen bündeln**. | Klimaschutzkonzept, https://www.alpenverein.de/files/natur/2025_klimaschutzkonzept.pdf (Datei geändert 04.12.2025), S. 2–3 |
| **Klimafonds** (1 € pro Vollmitglied seit 2021) | Rund 400.000 €/Jahr. Förderung 50 % der Projektsumme, **max. 50.000 €**, vorrangig Pilotprojekte mit Vorbildcharakter. Richtlinien in DAVintern; Kontakt klimaschutz@alpenverein.de. | https://www.alpenverein.de/verband/natur-und-klima/partnersektion-gesucht ; https://alpenverein.de/files/241113_mob_eva-kursstandorte.pdf |
| Passende Projektideen des Bundesverbands | **"Unterwegs im grünen Bereich"**: öffentliche Anreise zu Sektions- und Kursstandorten verbessern (Kooperation mit Verkehrsbetrieben, Radleihe, Mitfahrmöglichkeiten). **"DAV Basislager"**: Mobilitätsstationen für die letzte Meile. Partnersektionen werden gesucht. | wie oben |
| Klimaschutzkonzept, Maßnahmen Mobilität | Ausdrücklich genannt: ÖV-Anreise priorisieren, sektionsspezifische Vorgaben "Verhältnis Anreisestrecke/Aufenthaltsdauer", **Anreize für ÖPNV-Touren bei Tourenleitenden und Mitgliedern**, Reisekostenerstattung abhängig vom Verkehrsmittel, "Bereitstellung von Informationen (z. B. zu Optionen der ÖPV-Anreise)". | Klimaschutzkonzept, S. 9 |

Was Offenburg nutzen kann: Der Tourenplaner ist genau die im Konzept genannte "Bereitstellung von
Informationen". Das Klimaschutzbudget der Sektion (bei 140 €/t bzw. pauschal 8 % ab 2027) kann
Zuschüsse für ÖV-Touren und den Betrieb des Werkzeugs tragen. Ein gemeinsamer Antrag mit
Nachbarsektionen beim Klimafonds (50 %, bis 50.000 €) passt zu "Unterwegs im grünen Bereich",
besonders wenn das Werkzeug als übertragbares Muster für andere Startorte gebaut wird.

### 1.3 Anreiseregeln und Zuschüsse in Sektionen

| Sektion | Regel | Quelle (Datum) |
|---|---|---|
| **Freiburg** | ÖV-Touren: bis 50 % der tatsächlichen Fahrtkosten, **max. 35 € pro Tour und Teilnehmendem** (die ältere Angabe 25 € in `bahnverbindungen.md` ist überholt). Fahrkarten der Fachübungsleiter werden voll übernommen. Gruppen ab 6 Personen und internationale Tickets über Reisebüro Gleisnost; Abrechnung geführter Touren direkt mit der Geschäftsstelle. | https://www.dav-freiburg.de/de/sektion/Natur-Umweltschutz/mobilitaet.php (ohne Datum) |
| **München & Oberland** | Keine Pflicht, aber **erhöhte "Öffi-Pauschale" für Leitungen**, Öffi-Icon im Programm mit Filter, Fragebogen zur Anreiseart (2025 erstmals flächendeckend). Anteil Öffi-Touren **23 % (2021) auf 36 % (2025)**; bei Öffi-Touren reisen über 70 % tatsächlich öffentlich an. Tagestouren im Umkreis 150 km, Wochenenden 250 km; Ortler wegen langer Anreise gestrichen. Reisekostenordnung: Pkw nur, wenn keine ÖV-Verbindung besteht. | https://www.alpenverein-muenchen-oberland.de/alpinwelt/archiv/2026/alpinwelt-2-2026-bergmagazin-alpenverein-muenchen-oberland/das-verhaeltnis-von-fahrzeit-und-gebirgszeitmuss-passen-schwerpunkt-mobilitaet (alpinwelt 2/2026); https://alpenverein-muenchen-oberland.de/uploads/images/tISvaVHfatV4b4cNfocamA/2024_reisekosten-und-verguetungsordnung.pdf |
| **Gay Outdoor Club (München)** | Seit 2019 mindestens eine Tour pro Monat, bei der die Sektion die Bahnfahrt zahlt; fast 70 % des Angebots sind Öffi-Touren. | https://www.alpenverein.de/verband/natur-und-klima/wir-fuers-klima/taten-fuers-klima/bahn-frei-fur-den-goc |
| **Landshut, Schweinfurt** | Landshut: eigene Ansprechperson für klimafreundliche Anreise seit 2020, berät Mitglieder und Leitungen. Schweinfurt: Touren mit max. 2,5 h Anreise, D-Ticket. | https://www.alpenverein.de/artikel/oeffentliche-anreise-engagement_d4447ee0-f311-4f72-9aa7-025809dcea55 (Panorama 2/2026, 06.05.2026) |
| **Augsburg (Senioren)** | Eigenes ÖPNV-Programmheft; Touren ab 7 Teilnehmenden; mit D-Ticket keine Fahrtkosten. | https://dav360redaktion.alpenverein.de/019%20-%20Sektion%20Augsburg/Events/Veranstaltungen/Abteilungen/Senioren/Heftle_2024%20%C3%96PNV.pdf |
| **Altdorf (bei Nürnberg)** | Klimateam baute eine **"Starthütten-Karte"**: über 600 Hütten, die von Süddeutschland am Anreisetag öffentlich erreichbar sind (uMap), plus Leitfaden mit 15 Touren. | https://www.alpenverein.de/verband/natur-und-klima/wir-fuers-klima/taten-fuers-klima/horizonte-erweitern-mit-den-oeffis ; Karte: https://umap.openstreetmap.de/de/map/starthutten-alpine-hutten-die-am-anreisetag-erreic_33823 |

Weitere Zuschussmodelle mit festen Prozentsätzen (wie Freiburg) wurden für Stuttgart, Tübingen,
Konstanz und Karlsruhe nicht gefunden **(nicht belegt, ob es sie gibt)**. Die Modelle reichen von
Prozent-Zuschuss (Freiburg) über Ticket-Übernahme einmal im Monat (GOC) bis zur Leitungs-Pauschale
(München & Oberland).

### 1.4 Kampagnen und Angebote des Verbands

| Angebot | Inhalt | Quelle (Datum) |
|---|---|---|
| **Freie Nacht fürs Klima** | DAV + Globetrotter Naturbonus. 2026: zwei Gratis-Nächte im Lager pro Mitglied (Mai–Okt.), Bedingung **mindestens 90 % der Strecke ab Wohnort öffentlich** (D-Ticket gilt als Nachweis), Reservierung selbst nötig. 75 Hütten. **Budget 2026 ausgeschöpft, Buchung geschlossen.** Fortsetzung 2027 **(nicht belegt)**. 10 Hütten aus unserem Datenbestand waren dabei: Staufner Haus, Lindauer, Ravensburger, Konstanzer, Darmstädter Hütte, Rappenseehütte, Waltenbergerhaus, Prinz-Luitpold-Haus, Edmund-Probst-Haus, Schwarzenberghütte. | https://www.alpenverein.de/verband/presse/pressemeldungen/freie-nacht-fuers-klima-geht-in-die-naechste-runde-jetzt-mit-zwei-uebernachtungen-pro-mitglied (07.04.2026); https://www.alpenverein.de/artikel/freie-nacht-furs-klima-gutschein-fuer-huettenuebernachtung_fbf68d9a-5896-4edf-8506-6e30751d612a (16.09.2026) |
| **"Mit den Öffis in den Bergsommer"** | Jahresartikel mit **Netzplan Sommer 2026** (Michael Vitzthum; DE, AT, CH), Bergsafari-Prinzip (Start und Ziel an verschiedenen Haltestellen), Bergbusse. Netzplan für Sektionsnutzung über dav-panorama@alpenverein.de. | https://www.alpenverein.de/artikel/mit-den-oeffentlichen-in-die-berge_d9b5a63e-799d-4642-9688-40e4dead2978 (06.05.2026) |
| **Werkzeugkasten Öffi-Tour** | DAV-Liste der Planungshilfen: alpenvereinaktiv (ÖPNV-Filter, Öffi-Layer, Sammlungen "Mit Öffis zum Berg"), Netzpläne, Starthütten-Karte, Fahrplan-Apps, Moobly, Bedarfsverkehr.at. **Ein Werkzeug für Baden-Württemberg oder den Oberrhein fehlt in der Liste.** | https://www.alpenverein.de/artikel/dein-werkzeugkasten-fuer-die-naechste-tour-mit-den-oeffis_91ebe5fa-e564-44c2-997c-5eadb977f7e1 (26.10.2026) |
| **Bergsteigerdörfer** | 43 Orte. In Reichweite ab Offenburg: St. Antönien (schon im Datenbestand), Großes Walsertal (Vorarlberg), Lauenen (Berner Oberland), Lavin/Guarda/Ardez (Engadin, vermutlich über 5 h). Kein eigenes Mobilitätskriterium auf der Startseite. | https://www.bergsteigerdoerfer.org/ |
| **Mitfahrbankerl, ZugBusBerg** | München & Oberland: rund 30 Mitfahrbänke an Wanderparkplätzen (seit 07/2025, gefördert u. a. aus dem Klimafonds); Gruppe "ZugBusBerg" erarbeitet ÖV-Analysen und Positionspapiere (2025). | https://www.alpenverein-muenchen-oberland.de/presse/medieninfos-2025/start-der-dav-mitfahrbankerl ; https://www.alpenverein-muenchen-oberland.de/zugbusberg |

---

## 2. Vergleichbare Angebote, Stand November 2026

| Angebot | Was es kann (neu seit 09/2026 fett) | Was uns davon fehlt | Quelle |
|---|---|---|---|
| **Zuugle / Bahn zum Berg** | Touren aus fremden Portalen, nur mit funktionierender Hin- und Rückfahrt; Verbindung ab eigener Adresse; Filter nach Fahrzeit. Laut GitHub im Oktober/November 2026: **Echtzeit (Verspätungen, Ausfälle, Gleiswechsel, Störungsmeldungen, Bedarfsverkehr-Regeln) über die "Diana"-API**, **Wetter auf der Tourseite**, **Einbett-Widget für Partnerseiten** (`/public/embed/`), Adresse in anderem Land schaltet Domain um, Mehrtagestouren. Startorte zuugle.de weiter nur Bayern (8); **zuugle.ch hat Basel**. Partner: DAV, ÖAV, ÖBB, VVT, klimaaktiv. Open Source (AGPL). | Wetter am Ziel, Echtzeit, Widget zum Einbetten in andere Seiten, Mehrtagestouren als Kategorie. | https://www.bahn-zum-berg.at/ ; `https://www.zuugle.de/api/cities?domain=www.zuugle.de` (eigene Abfrage); https://github.com/bahnzumberg/zuugle-suchseite/pulls?q=is%3Aclosed (PRs vom 17.10.–07.11.2026) |
| **alpenvereinaktiv / Outdooractive** | Filter "mit Bahn und Bus erreichbar" (manuell gesetztes Siegel, Startpunkt max. 15 min ab Endhaltestelle), Öffi-Layer, Sammlungen "Mit Öffis zum Berg", **"Gemeinsame Tour"** zum Planen mit anderen und für Mitfahrgelegenheiten. Keine Fahrplanberechnung. | Gemeinsam planen; große Tourenbasis. | https://www.alpenverein.de/artikel/tourenplanung-alpenvereinaktiv-oeffentliche-anreise_a21d0d03-eb49-467d-b6b7-2d0bc7663124 (geändert 01.09.2026); https://corporate.outdooractive.com/oa-blog/oepnv-freundliche-touren |
| **ÖAV Bettencheck** | Karte mit freien Betten mehrerer Hütten an einem Datum, Mehrtagestouren mit automatisch fortgeschriebenem Datum; Daten aus "Hut Reservation". | **Hüttenverfügbarkeit fürs Datum.** | https://www.alpenverein.de/artikel/huettentouren-planung-bettencheck_ab9568eb-135a-4bfb-a0ce-297c34b9186a (09.07.2025) |
| **SchweizMobil / SBB** | 25.000 ÖV-Haltestellen mit nächsten Abfahrten und Link zur SBB-App; Tourenplanung mit Fahrplan nur in "Plus" (Abo). SBB/RailAway: Ausflugsangebote mit bis 50 % Rabatt. Keine Neuerungen 2026 gefunden. | Rabattierte Kombiangebote (Bahn + Bergbahn). | https://www.pctipp.ch/praxis/apps/schweizmobil-tour-planen-so-gehts-2838525.html ; https://www.sbb.ch/de/freizeit-ferien/ausfluege-schweiz/touren-schweiz.html |
| **SAC-Tourenportal** | Startpunkte mit SBB-Fahrplan verknüpft, Haltestellen-Layer (Abo). | – | siehe `bahnverbindungen.md` |
| **ÖBB / Österreich** | Kein eigenes Tourenportal. Regionale Bahnwander-Programme: Kärnten "Rail & Trail" (100+ Touren ab Bahnhof, Gästekarte = gratis S-Bahn), Steiermark-Filter "Wandern mit Bahn und Bus". | – | https://www.kaernten.at/wandern/railandtrail/ ; https://www.steiermark.com/de/Steiermark/Aktiv-in-der-Natur/Wandern/Wandertouren/Wandertouren-Oeffis |
| **komoot** | Touren ab einem gewählten Startpunkt (z. B. Bahnhof) entdecken; ein ÖV-Filter ist nur in einer Quelle erwähnt **(nicht belegt)**. Keine Fahrplananbindung. | – | https://newsroom.komoot.com/226392-komoot-stellt-neue-funktionen-zum-entdecken-von-touren-vor-massgeschneiderte-touren-zu-finden-ist-jetzt-so-einfach-wie-nie/ |
| **Fahrtziel Natur** (DB, BUND, NABU, VCD) | 25 Jahre (2026), Naturpark Nagelfluhkette als 24. Partner aufgenommen (27.04.2026), Award 2026 an Allgäuer Hochalpen. Reine Anreise-Infos, keine Touren. | – | https://www.oberstaufen.de/files/26-04-27-presseinformation-feierliche-aufnahme-naturpark-nagelfluhkette-fahrtziel-natur_69f34fe9c3063eb0af0e7c23_1777553385_web_de-DE.pdf ; https://www.deutschebahn.com/de/presse/pressestart_zentrales_uebersicht/Fahrtziel-Natur-25-Jahre-Partnerschaft-fuer-umweltfreundliche-Mobilitaet-in-Schutzgebieten-13808424 |
| **bergfex** | Keine ÖV-Funktion gefunden **(nicht belegt)**. | – | Suche ohne Treffer |
| **Starthütten-Karte (Altdorf)**, **Netzplan (Vitzthum)** | Statische Karten: 600+ Hütten am Anreisetag erreichbar; schematischer Netzplan Sommer/Winter. Beide ab Süddeutschland/München. | **Ein Netzplan als Druckprodukt.** | siehe 1.3, 1.4 |
| **Chronotrains / Direkt Bahn Guru** | Isochronen 1–8 h und Direktverbindungen ab jedem Bahnhof, nur Fernverkehr, keine Berge. | – | https://www.travelbook.de/reisen/zugreisen/interaktive-karte-chronotrains-zugverbindungen |
| **bwegt Freizeitexpresse** | Saisonale Freizeitzüge in BW, u. a. "Schwarzwald-Hochrhein" (Flyer 29.04.2026). | Hinweis auf saisonale Züge. | https://www.bwegt.de/fileadmin/media/PDF/Flyer/Freizeitexpresse/2026/bwegt_Flyer_Freizeitexpress_Schwarzwald-Hochrhein_29-04-2026_barrierefrei.pdf |

**Was keiner gut macht** (Lücken, in denen der Offenburger Planer führen kann):

1. **Rückfahrt als Planungsgröße.** Zuugle prüft, dass eine Rückfahrt existiert; niemand rechnet aus,
   wann man spätestens an der Hütte oder am Gipfel aufbrechen muss, um den letzten Zug zu erreichen.
2. **Grenzüberschreitende Ticketlogik** (D-Ticket bis Basel Bad Bf, Europass ab Kehl, Halbtax,
   Gruppen-Sparpreis Schweiz). Alle Portale verweisen nur auf die Fahrplan-Apps.
3. **Sektionsprogramm.** Kein Portal verknüpft das Tourenprogramm einer Sektion mit Verbindungen.
   DAV360 hat die Felder `isPublicTransportAvailable` und `arrivalHints`; im Offenburger Programm
   sind sie bei 22 bzw. 37 von 321 Events gesetzt (eigene Abfrage 12.11.2026, unverändert seit 09/2026).
4. **Gemeinsam fahren mit der Bahn.** Mitfahrbörsen (Moobly, "Gemeinsame Tour") sind Auto-Börsen.
   Eine "Zugbörse" (wer fährt am Samstag mit dem 6:12er nach Basel) gibt es nirgends.
5. **Startregion Oberrhein.** Weder Zuugle (DE nur Bayern) noch DAV-Netzplan noch Starthütten-Karte
   decken Baden ab; der DAV-Werkzeugkasten (10/2026) nennt kein Werkzeug für BW.
6. **Hüttenstatus und Verbindung in einer Ansicht.** Bettencheck (ÖAV) kennt Betten, nicht die Bahn;
   Zuugle kennt die Bahn, nicht die Betten.

---

## 3. Daten und Schnittstellen für Zusatzfunktionen

| Quelle | Was | Lizenz | Kosten / Schlüssel | Zuverlässigkeit, Haken | Beleg |
|---|---|---|---|---|---|
| **hut-reservation.org** (Hut Reservation der Alpenvereine DAV, ÖAV, AVS, SAC; Nachfolger von alpsonline seit Ende 2024) | `GET /api/v1/reservation/hutInfo/{id}` (Name, Betreiber-Tenant DAV/OEAV/SAC, Koordinaten, Betten, Website). `GET /api/v1/reservation/getHutAvailability?hutId={id}&step=WIZARD` liefert **pro Tag für 2 Jahre** `freeBeds`, `freeBedsPerCategory` und **`hutStatus` SERVICED / UNSERVICED / CLOSED** (also auch Öffnungszeiten und Winterraum). | Keine Lizenz oder Nutzungsbedingung für Dritte gefunden; nicht dokumentiert. | Ohne Login, ohne Schlüssel (eigene Abfrage). `manage/hutsList` verlangt Login (401). | Funktioniert, aber inoffiziell: kann sich ändern. **Vor Einbau beim DAV (Ressort Hütten) oder ÖAV (Bettencheck nutzt die Daten) um Erlaubnis fragen.** ID-Zuordnung einmalig pro Hütte nötig (Stichprobe: ID 100 Gaudeamushütte DAV, 300 Oberwalder-Hütte ÖAV, 500 Capanna Dötra SAC). Betrifft potenziell die 100 Alpenvereinshütten im Bestand, nicht Naturfreunde/privat. | eigene `curl`-Abfrage 12.11.2026; https://www.alpenverein.de/artikel/huettentouren-planung-bettencheck_ab9568eb-135a-4bfb-a0ce-297c34b9186a |
| **SAC-Hütten** | Laufen über dasselbe System (Tenant `SAC`). Eigenes offenes API nicht gefunden. 2026 wurde eine Reservationsgebühr für SAC-Hütten diskutiert. | – | – | – | https://www.srf.ch/news/schweiz/buchungen-auf-vorrat-no-shows-in-sac-huetten-kommt-jetzt-die-reservationsgebuehr |
| **Open-Meteo** | Punktvorhersage (Modelle u. a. ICON, MeteoSwiss ICON-CH), Schneehöhe, Nullgradgrenze. | Daten **CC BY 4.0**. | Kostenlos ohne Schlüssel nur **nicht-kommerziell** (ohne Werbung/Abo): 600/min, 5.000/h, **10.000/Tag**, 300.000/Monat **pro IP**. Hinweis des Anbieters: auf Vercel/Netlify greifen Limits früher (geteilte IPs). | Sehr verlässlich in der Praxis (nicht belegt als SLA). Server-seitig cachen (pro Gebiet und Tag eine Abfrage). | https://open-meteo.com/en/terms |
| **MeteoSwiss Open Data** | Seit 22.05.2025 offen: ICON-CH1/CH2-EPS, Lokalprognosen, Radar; STAC-Download, EDR-API laut Changelog ergänzt (Datum nicht geprüft). | Freie Nutzung mit Quellenangabe (Drittquellen: CC BY 4.0). | Kostenlos, kein Schlüssel. | Offiziell; Rohdaten (GRIB), aufwendiger als Open-Meteo. | https://opendatadocs.meteoswiss.ch/ ; https://www.meteoswiss.admin.ch/services-and-publications/service/open-data.html |
| **SLF Lawinenbulletin (CH)** | `https://aws.slf.ch/api/bulletin/caaml` (CAAML, auch JSON; eigene Abfrage liefert aktuelles Bulletin vom 11.11.2026 mit Regionen), Warnregionen als GeoJSON unter `aws.slf.ch/api/warningregion/`. | **CC BY 4.0**, sichtbarer Link auf slf.ch Pflicht. | Kostenlos, kein Schlüssel. | Keine Haftung, kein Bereitschaftsdienst. | https://slf.ch/en/services-and-products/slf-data-service |
| **EAWS / avalanche.report** (Tirol, Südtirol, Trentino; Spiegel weiterer Dienste inkl. **LWD Bayern** `…-DE-BY.json`, GeoSphere/Vorarlberg) | Tägliche Bulletins als CAAML v6 JSON/XML, z. B. `https://static.avalanche.report/eaws_bulletins/YYYY-MM-DD/YYYY-MM-DD-DE-BY.json`. | **Keine Lizenzangabe gefunden (nicht belegt).** | Kostenlos, kein Schlüssel (eigene Abfrage). | Für Anzeige der Gefahrenstufe nur mit Zustimmung bzw. als Link zum offiziellen Bericht. Frankreich (Vogesen haben keinen Lawinendienst; Météo-France BRA für Alpen) nicht geprüft. | eigene `curl`-Abfrage; https://www.avalanches.org/standards/information-pyramid/ |
| **Transitous (MOTIS)**, schon im Einsatz | Routing; MOTIS-Antworten haben pro Abschnitt `realTime` und `alerts` (Störungsmeldungen aus GTFS-RT/SIRI-SX, Abfrage jede Minute). Für Folgetage sind beide leer (eigene Abfrage Offenburg–Kandersteg 13.11.2026). Endpunkte `one-to-many`/`one-to-all` für Erreichbarkeit. | Quellen-Lizenzen + OSM; **sichtbarer Link auf Transitous Pflicht**. | **Nur nicht-kommerziell und Open Source.** Kein formales Limit, aber **ab etwa 720 Anfragen pro 24 h an `/plan`/`one-to-*`, bei vielen Nutzern oder automatisierten Abfragen vorher Kontakt aufnehmen**; Scraping unerwünscht, stattdessen Datensatz herunterladen. User-Agent mit Kontakt Pflicht (bei uns gesetzt). | Community-betrieben, keine SLA. Jede neue Live-Funktion (Rückfahrt-Rechner, A→B, weitere Startorte) vervielfacht Anfragen; **Cache-Design und Kontakt mit Transitous sind Voraussetzung**. | https://transitous.org/api/ ; https://transitous.org/doc/ |
| **SBB / opentransportdata.swiss** | GTFS-RT **Service Alerts** der Schweiz; OJP 2.0 inkl. **OJP Fare (Preise mit Halbtax)**. | Lizenzangaben widersprüchlich (Referenz nötig). | Kostenloser API-Schlüssel nötig, Limits pro Schlüssel. | Offiziell, zuverlässig. | https://ckan.opendata.swiss/dataset/gtfs-realtime-service-alerts1 ; `bahnverbindungen.md` 3.1 |
| **DB Baustellen** | **Kein offenes, maschinenlesbares Baustellen-API gefunden.** DB InfraGO plant digitale BauFplo-Veröffentlichung 2026/27 (Zugang unklar). Pressemitteilungen "Bauen 2026 in Baden-Württemberg" und Rheintalbahn-Meldungen sind die praktische Quelle. Termine 2027 für Offenburg–Basel noch nicht veröffentlicht (Stand 12.11.2026). | – | – | Manuell pflegen (YAML mit Zeitraum, Strecke, betroffene Haltestellen). | https://www.deutschebahn.com/de/presse/presse-regional/pr-stuttgart-de/Bauprojekte-/Bauen-2026-in-Baden-Wuerttemberg-13690456 ; https://www.dbinfrago.com/resource/blob/13869048/ae64f0b41199bcbfc841fd93b285037a/02_Digitale-BauFplo-data.pdf |
| **Deutschlandticket** | **66,80 € pro Monat ab 01.01.2027** (bisher 63 €), erstmals per Preisindex (VMK Lindau, März 2026). Gültigkeit grenzüberschreitend regelbasiert, kein Datenfeld (siehe `bahnverbindungen.md` 3.3). | – | – | Preis jährlich per Index neu. | https://www.stmb.bayern.de/med/pressemitteilungen/pressearchiv/2026/115/index.php (30.09.2026) |
| **DB Gruppen- und Sparpreise** | Sparpreis Europa Gruppe Schweiz (ab 6 Personen) ab 16,99 € einfach inkl. Reservierung; Super Sparpreis Gruppe DE ab 8,99 €. Kein offizielles Preis-API; inoffiziell db-vendo-client. | – | – | Preise schwanken; nur als "ab"-Hinweis und Link. | https://www.bahn.de/angebot/gruppen/sparpreis-europa-gruppe-schweiz ; https://www.bahn.de/angebot/sparpreis-flexpreis/super-sparpreis-gruppe |
| **Halbtax / Schnupper-Halbtax** | Halbtax rund 185 CHF/Jahr; Schnupper-Halbtax-Aktionen (z. B. 2 Monate 33 CHF) wechselnd; Wohnsitz in DE möglich, Aktionen teils eingeschränkt. | – | – | Nur Sekundärquellen; vor Anzeige auf sbb.ch prüfen. | https://reisetopia.ch/deals/sbb-schnupper-halbtax |
| **Hütten-Öffnungszeiten als offene Daten** | Beste Quelle ist der `hutStatus` aus hut-reservation.org (siehe oben). OSM: `tourism=alpine_hut` + `opening_hours` (z. B. `Jun 01-Sep 30`), `check_date:opening_hours`; Füllgrad nicht geprüft **(nicht belegt)**. | OSM: ODbL. | Overpass kostenlos. | OSM-Werte oft veraltet; nur als Ergänzung für Naturfreunde/private Häuser. | https://wiki.openstreetmap.org/wiki/Alpine_hut |
| **DAV360 (Sektionsprogramm)** | Weiter offen: `GET /api/events/get-event-list-view-by-id/17307` liefert 321 Events (eigene Abfrage 12.11.2026). | Nicht dokumentiert. | Kein Schlüssel. | Abstimmung mit Geschäftsstelle ausstehend (`dav360-api.md`). | eigene Abfrage |
| **Moobly** (DAV Summit Club) | Mitfahrzentrale Berge, **Widget für Sektionsseiten und Einbindung ins Tourenprogramm**. | – | Kostenlos. | Angebot laut einer Übersicht noch "sehr gering". | https://www.alpenverein.de/artikel/mitfahrzentrale-in-die-berge-moobly_2896e7ba-2080-40ca-bdbd-810ffc5797d7 |

---

## 4. Verbreitung und Gemeinschaft

### 4.1 Wie solche Angebote Nutzer gewinnen (Belege)

- **Im Programm sichtbar machen.** München & Oberland kennzeichnet Öffi-Touren mit Icon und Filter im
  Programm und zahlt Leitungen eine höhere Öffi-Pauschale; Ergebnis 23 % auf 36 % Öffi-Touren in vier
  Jahren (alpinwelt 2/2026, Link in 1.3). Der Hebel sind die **Tourenleitenden**, nicht Einzelnutzer.
- **Druckprodukte und Plakate.** Der DAV-Netzplan (Vitzthum) und die Starthütten-Karte sind die am
  häufigsten zitierten Öffi-Hilfen im DAV-Werkzeugkasten (10/2026). Augsburg druckt ein eigenes
  ÖPNV-Programmheft (Link in 1.3).
- **Bundesweite Kanäle.** DAV Panorama bringt jedes Frühjahr einen Öffi-Schwerpunkt (2/2026) und
  eine Sammlung "Taten fürs Klima" mit über 60 Sektionsprojekten auf einer Karte:
  https://www.alpenverein.de/artikel/mach-mit-machs-nach_b341c79b-dcbb-445b-b031-e59ff26977e8 . Ein
  Eintrag dort und im DAV-Werkzeugkasten bringt Reichweite über Offenburg hinaus.
- **Newsletter, Push, Social.** Bahn zum Berg setzt auf Newsletter, Push-Mitteilungen, Bluesky und
  "Zum Startbildschirm hinzufügen" (https://www.bahn-zum-berg.at/).
- **Anreize koppeln.** "Freie Nacht fürs Klima" war 2026 so gefragt, dass das Budget ausgeschöpft ist
  (Link in 1.4); der GOC zahlt eine Bahnfahrt pro Monat. Ein sichtbarer Anreiz im Werkzeug ("diese
  Hütte war 2026 bei Freie Nacht fürs Klima", "Sektion zahlt X %") senkt die Schwelle.
- **Kletterhalle.** Die Sektion betreibt das DAV Kletterzentrum Offenburg (Rammersweierstr. 9) mit
  regelmäßigen Treffs (z. B. inklusiver Klettertreff jeden dritten Mittwoch); dort erreicht man aktive
  Mitglieder ohne Umweg (https://www.alpenverein.de/artikel/klettern-mit-handicap_01139193-920d-43a7-91e6-622321340e5c).
  Belege, dass Hallenplakate Nutzung steigern, wurden nicht gefunden **(nicht belegt)**.

### 4.2 Nachbarsektionen

| Sektion | Stand | Anknüpfung |
|---|---|---|
| Freiburg | 50 %-Zuschuss (max. 35 €), Gruppentickets über Gleisnost, ÖV-Ziel ohne Werkzeug. | Gleiche Rheintalbahn, gleiche Ziele (Schweiz, Schwarzwald). Startort Freiburg wäre für den Planer nur ein weiterer Datensatz. |
| Lahr/Schwarzwald (dav-lahr.de) | Website existiert; keine Mobilitätsangebote gefunden **(nicht belegt)**. | Startort Lahr ist schon angelegt (`sichtbar: false`). |
| Karlsruhe (alpenverein-karlsruhe.de) | Keine Klimaseite gefunden; DAV-Faltblatt "Rock & Rail" (2024) zeigt Klettergebiete per Stadtbahn ab Karlsruhe. | https://alpenverein.de/files/dav_rockrail_2024.pdf ; Startort Karlsruhe würde Murgtal/Battert/Pfalz abdecken. |
| Kehl | Keine eigene DAV-Sektion gefunden **(nicht belegt)**; Kehl ist Startort für Europass ins Elsass. | Startort Kehl angelegt. |

Das Klimaschutzkonzept erlaubt ausdrücklich, Klimaschutzbudgets mehrerer Sektionen für gemeinsame
Maßnahmen zu bündeln (1.2). Ein gemeinsamer Planer "Oberrhein" (Offenburg, Freiburg, Lahr, Karlsruhe)
ist damit finanzierbar, ohne dass eine Sektion allein zahlt.

### 4.3 Gemeinsame Bahnanreisen in Sektionen

| Muster | Beispiel | Quelle |
|---|---|---|
| Fester Treffpunkt am Bahnhof mit Gleis und Zug im Programm | München & Oberland (Senioren): "Mü-Hbf. vor Gleis 27" | https://www.alpenverein-muenchen-oberland.de/uploads/images/fpvEGLLXQ2QK1se2Cl8DXA/2026_03-_07-programm.pdf |
| Gruppe findet sich im Zug, Verbindung vorab verschickt; Problem: Reservierung bei vollen Zügen | ÖAV Edelweiss (Interview 2025) | https://alpenverein-edelweiss.at/oeav/avAssets/docs/_edelweiss/_vePrintmedien/2025/Interview%20Angelika%20Meirhofer.pdf |
| Mehrere Gruppen in verschiedenen Zügen, gemeinsamer Endpunkt | GOC Pride Hike, 80 Teilnehmende, Ziel Tegernsee | GOC-Link in 1.3 |
| Gruppenticket über Reisebüro, Abrechnung mit Geschäftsstelle | Freiburg (ab 6 Personen, Gleisnost) | Freiburg-Link in 1.3 |
| Mindestteilnehmerzahl, D-Ticket-Inhaber zahlen nichts | Augsburg Senioren (ab 7) | Augsburg-Link in 1.3 |
| Fahrgemeinschaften vorab koordinieren (Plätze abfragen) | München & Oberland, 2,5 Personen pro Pkw | alpinwelt 2/2026 |

Eine Mitfahrbörse **für die Bahn** (wer sitzt im selben Zug) wurde bei keiner Sektion gefunden.

---

## 5. Ideen

Bewertung "Autoersatz": wie direkt die Idee eine Fahrt ersetzt, die sonst mit dem Auto stattfände
(gering / mittel / hoch). Aufwand: klein = Tage, mittel = 1–3 Wochen, groß = mehr.

| # | Idee | Nutzen für Mitglieder | Aufwand | Daten | Autoersatz |
|---|---|---|---|---|---|
| 1 | **Rückfahrt-Rechner: "Spätestens los um …"** Aus letzter Rückfahrt, Zustieg (Gehzeit, Bergbahn-Betriebsende) und Puffer rückwärts rechnen: spätester Abmarsch an Hütte oder Gipfel, dazu die vorletzte Verbindung als Plan B. | Nimmt die größte Angst bei Öffi-Touren (letzter Bus weg). Macht Tagestouren planbar, die man sonst mit dem Auto fährt. | klein | Vorhanden: `rueckfahrt`, `zustiege.gehzeitMin`; neu: Betriebsende der Bergbahnen (manuell, YAML). | hoch |
| 2 | **Hütten-Ampel fürs Datum**: freie Betten und Status (bewirtschaftet / Winterraum / geschlossen) direkt neben der Verbindung, auch für die Karte ("nur offene Hütten"). | Eine Ansicht statt drei Websites; verhindert Planung zu geschlossenen Hütten (November!). | mittel | hut-reservation.org `getHutAvailability` (inoffiziell, Erlaubnis einholen), einmalige ID-Zuordnung für ~100 Alpenvereinshütten, Cache 6–24 h. | mittel |
| 3 | **Sektionsprogramm mit Anreise**: DAV360-Touren auf Gebiete abbilden, pro Tour die Verbindung ab Offenburg zeigen und für Tourenleitende einen fertigen Anreisetext (Zug, Treffpunkt Gleis, Ticket, Rückfahrt) erzeugen, der in `arrivalHints` kopiert wird. | Tourenleitende sparen Recherche; Teilnehmende sehen die Bahnoption, bevor Fahrgemeinschaften verabredet sind. | mittel | DAV360-API (offen, Absprache mit Geschäftsstelle), Anreicherungstabelle Event → Gebiet/Haltestelle, Transitous. | hoch (betrifft Kleinbus- und Pkw-Touren der Sektion direkt) |
| 4 | **Zug-Treff statt Mitfahrbörse**: "Ich fahre Sa mit dem 6:12 nach Basel" als teilbarer Link bzw. Text für WhatsApp/Signal, mit Hinweis auf Gruppen-Sparpreis ab 6 Personen. Ohne Nutzerkonten. | Gesellschaft und günstigere Gruppentickets; soziale Hürde sinkt. | klein (Teilen-Text); groß (echte Börse mit Konten) | Vorhandene Verbindungsdaten; Gruppenpreis-Hinweise aus `tickets.yaml`. | hoch |
| 5 | **Kostenvergleich Bahn gegen Auto pro Ziel**, inkl. D-Ticket (66,80 € ab 2027: "mit D-Ticket 0 € bis Basel Bad Bf"), Europass, Halbtax, Gruppen-Sparpreis, Sektionszuschuss falls beschlossen. Auto: km × Kostensatz geteilt durch Mitfahrende. | Geld ist neben Zeit das zweite Argument; viele Mitglieder haben das D-Ticket schon. | mittel | Straßendistanz (schon via OSRM für CO2), Ticketregeln, Preisangaben als "ab"-Werte mit Datum. | mittel |
| 6 | **Überschreitungen (A nach B)**: Touren mit Start und Ziel an verschiedenen Haltestellen ("Bergsafari"), Hinfahrt zu A, Rückfahrt ab B. | Das, was mit dem Auto nicht geht; stärkstes positives Argument für die Bahn. | mittel | Neues Feld `ueberschreitungen` im Gebiet (Haltestellen-Paar, Gehzeit, Tour-Link), zwei Transitous-Abfragen. | mittel |
| 7 | **Wetter am Datum** pro Gebiet und auf der Karte; Sortierung "erreichbar und trocken am Samstag". | Spontane Zielwahl nach Wetter, die sonst das Auto begünstigt. | klein bis mittel | Open-Meteo (CC BY 4.0, nicht-kommerziell, Cache pro Gebiet/Tag wegen Vercel-IP-Limits); optional MeteoSwiss. | mittel |
| 8 | **Lawinenlage für Winterziele** (62 Gebiete mit Skitour/Schneeschuh): Gefahrenstufe des Tages je Warnregion, Link zum Bulletin. | Winterplanung in einem Schritt; Sicherheit. | mittel | SLF CAAML (CC BY 4.0) für CH; EAWS-JSON für Bayern/Tirol/Vorarlberg nur nach Lizenzklärung, sonst Link. Zuordnung Gebiet → Warnregion über Polygone. | gering bis mittel |
| 9 | **Baustellen- und Störungshinweis**: Kalender geplanter Sperrungen (Rheintalbahn, Schwarzwaldbahn, Gotthard) als YAML; Warnung, wenn das gewählte Datum betroffen ist; kurzfristig `alerts` aus Transitous. | Verhindert die eine schlechte Erfahrung, nach der Leute wieder Auto fahren. | klein (manuell) / mittel (API) | DB-Pressemitteilungen (manuell), Transitous `alerts`, SBB Service Alerts (Schlüssel). | mittel |
| 10 | **Offenburg-Netzplan als Plakat und PDF**, aus den Daten generiert (Fahrzeitringe, Linien, Gebiete), für Kletterzentrum, Geschäftsstelle, Programmheft, mit QR-Code zum Planer. | Inspiration ohne Bildschirm; erreicht auch Nicht-Nutzer. | mittel | Vorhandene Richtwerte und Gebiete; Absprache mit DAV-Panorama wegen Vitzthum-Stil. | mittel (indirekt, große Reichweite) |
| 11 | **Weitere Startorte und Nachbarsektionen**: Lahr, Kehl, Achern sichtbar schalten; Freiburg und Karlsruhe ergänzen; gemeinsamer Klimafonds-Antrag ("Unterwegs im grünen Bereich", 50 % bis 50.000 €), Kosten aus gebündelten Klimaschutzbudgets. | Mehr Mitglieder erreicht, Pflege geteilt. | mittel | Startorte (Lahr/Kehl vorbereitet), Richtwerte-Lauf je Startort; Transitous-Kontingent klären. | hoch (Reichweite) |
| 12 | **Zuugle-Kooperation**: Offenburg (oder Freiburg) als Startort bei Bahn zum Berg beantragen; Gegenrichtung prüfen: Zuugle-Widget auf Gebietsseiten für Touren, unser Planer für den Oberrhein. | Mehr Touren ohne eigene Pflege; Sichtbarkeit in einem DAV-Partnerprodukt. | klein (Anfrage), mittel (Widget) | Zuugle-Embed (AGPL, seit 10/2026 produktiv), Startort-Anfrage beim Verein. | mittel |
| 13 | **Anreize sichtbar machen**: Markierung "Freie Nacht fürs Klima" an den 10 Hütten (falls 2027 fortgesetzt), Sektionszuschuss mit Rechenbeispiel, Öffi-Pauschale für Leitungen als Vorschlag an den Vorstand. | Lenkt Entscheidungen bei Hüttenwahl und Ausschreibung. | klein | Hüttenliste DAV 2026/27, Beschluss der Sektion. | mittel |
| 14 | **Wochenend-Tipp**: automatisch erzeugte Auswahl "diesen Samstag gut erreichbar, Hütte offen, Wetter gut" als RSS/Newsletter-Baustein und Social-Post. | Kommt zu den Mitgliedern, statt dass sie suchen. | mittel | Kombination aus 2, 7 und Richtwerten; Versand über bestehenden Sektions-Newsletter. | mittel |
| 15 | **Öffi-Fahrten zählen**: anonymer Knopf "So bin ich gefahren" bzw. Abfrage bei Sektionstouren; Summe in die Emissionsbilanz der Sektion, umgerechnet in eingesparte Euro beim internen CO2-Preis (140 €/t). | Macht den Beitrag sichtbar; Argument für Zuschüsse. Hinweis: die Spec schließt einen Zähler über alle Nutzer bisher aus. | mittel | Eigene Zählung (ohne Personenbezug), Emissionsfaktoren aus `emissionen.yaml`. | gering (indirekt) |
