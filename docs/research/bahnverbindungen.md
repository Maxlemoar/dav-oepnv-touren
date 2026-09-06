# Bahnverbindungen ab Offenburg (Baden) zu Tourenausgangspunkten

Recherche für das Klimaschutz-Projekt der DAV Sektion Offenburg.
Stand: 6. September 2026. Referenztag der Fahrplanabfragen: **Samstag, 12.09.2026**, Abfahrt Offenburg ab ca. 06:30 Uhr.

## 0. Methodik und Lesehilfe

**Wie die Fahrzeiten ermittelt wurden**

| Kürzel in Spalte "Quelle" | Bedeutung |
|---|---|
| **Transitous** | Abfrage der offenen Routing-API `api.transitous.org` (MOTIS, aggregierte GTFS-Daten DE/FR/CH/AT) für den 12.09.2026, Start Offenburg Bahnhof. Direkt Offenburg → Ziel. |
| **CH-API** | Abfrage `transport.opendata.ch` (SBB-Fahrplandaten) für die Teilstrecke **Basel SBB → Ziel** am 12.09.2026 ab 08:00 Uhr, addiert mit dem per Transitous verifizierten Zubringer **Offenburg ab 06:30 (ICE 275) → Basel SBB an 07:48** (1 h 18 min) und der realen Umsteigezeit in Basel (Abfahrten 08:04 / 08:07 / 08:30 / 08:33). |
| **Schätzung** | Keine belastbare API-Abfrage möglich (Datenlücke). Wert aus Fahrplanwissen abgeleitet, Genauigkeit ± 30 min. Diese Werte müssen vor Veröffentlichung nachgeprüft werden. |

Alle Zeiten sind **Richtwerte für einen Samstagmorgen** und gerundet auf 5 Minuten. Reale Fahrzeiten schwanken je nach gewählter Abfahrt um 15–45 Minuten (Anschluss-Wartezeiten). "Umstiege" bezieht sich auf die schnellste sinnvolle Verbindung.

**Wichtige Basiswerte (Transitous, 12.09.2026):**
- Offenburg → Basel SBB: ICE ca. **1 h 18–1 h 22** (ICE 273 ab 05:30, ICE 275 ab 06:30; stündlicher Takt tagsüber). Mit RE 7 bis Basel Bad Bf + S6/Tram ca. 1 h 40.
- Offenburg → Zürich HB: ICE direkt **2 h 30** (ICE 273 05:30 → 08:01).
- Offenburg → Freiburg Hbf: ICE ca. **30–35 min**, RE 7 ca. 45–50 min.
- Offenburg → Strasbourg: TER/RS4 **ca. 30 min**, stündlich.
- Offenburg → Interlaken Ost: **ca. 4 h** (ICE bis Basel + IC 61 direkt).

**Tarif-Basiswissen (siehe auch Abschnitt 4):**
- **Deutschlandticket (D-Ticket)**: gilt im Nahverkehr bis Basel Bad Bf und im gesamten RVL-Gebiet inkl. S6 bis **Basel SBB**; gilt Richtung Frankreich **nur bis Kehl** (nicht bis Strasbourg); gilt bis Schaffhausen (S-Bahn Erzingen–Schaffhausen–Thayngen–Singen); gilt NICHT in ICE/IC/EC, nicht in der Schweiz/Österreich/Frankreich jenseits der genannten Ausnahmen.
- **Europass 24 h** (Eurodistrict Strasbourg-Ortenau): 6,60–11,90 € je Zone, alle Nahverkehrsmittel TGO/CTS/TER zwischen Ortenau und Eurométropole Strasbourg – die praktische Ergänzung zum D-Ticket für die Vogesen-Anreise bis Strasbourg.
- **Schweiz**: Halbtax (CHF 190/Jahr; regelmäßig "Schnupper-Halbtax" für 2 Monate um CHF 33; Touristenversion "Swiss Half Fare Card" 1 Monat ca. CHF 120–150 – Quellen uneinheitlich) halbiert auch Bergbahnen und Postauto; SBB-Sparbillette; DB-Sparpreis Europa ab Offenburg bis zum Schweizer Zielbahnhof.
- **Nachtzug**: ÖBB Nightjet NJ 470/471 Zürich–Hamburg hält in Offenburg (Halt laut Fahrplanportalen; Zeiten in Offenburg je nach Quelle ca. 04:40 oder 06:43 Richtung Süden – **unsicher, prüfen**). Relevant v. a. für Rückreisen aus Zürich am Sonntagabend (Abfahrt Zürich 20:59) und für Anreise aus Norddeutschland.

---

## 1. Tabelle der Zielbahnhöfe

Budgetgrenze: ca. 5 h. Ziele über Budget sind mit **>5 h** markiert, aber der Vollständigkeit halber aufgeführt (relevant für Wochenendtouren mit Frühabfahrt oder Nachtzug).

### 1.1 Schwarzwald (Nahbereich, Tagestouren, D-Ticket)

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Hausach | Kinzigtal (Brandenkopf, Moosturm, Kletter­gebiete Kinzigtal) | 0 h 25 | 0 | halbstündlich (RE 2 Schwarzwaldbahn + Ortenau-S-Bahn) | D-Ticket; Zubringer für Busse ins Wolftal/Gutachtal | Schätzung (Fahrplanwissen, Regelfahrzeit Schwarzwaldbahn) |
| Oppenau / Bad Peterstal-Griesbach | Renchtal (Schliffkopf, Lotharpfad, Westweg) | 0 h 35–0 h 50 | 0 | stündlich (Ortenau-S-Bahn, Sa teils zweistündlich) | D-Ticket; Bus weiter Richtung Schwarzwaldhochstraße nur saisonal | Schätzung |
| Triberg | Mittlerer Schwarzwald (Wasserfälle, Westweg-Etappen) | 0 h 55 | 0 | stündlich (RE 2) | D-Ticket | Schätzung |
| Hinterzarten | Hochschwarzwald (Feldberg-Nordseite, Zastler, Ravennaschlucht) | 1 h 25–1 h 35 | 1 (Freiburg) | stündlich, Freiburg–Titisee halbstündlich | D-Ticket; Höllentalbahn S1/S10 | Transitous |
| Feldberg-Bärental | Feldberg (Wandern, Skitouren, Winterbergsteigen) | 1 h 40–1 h 50 | 1–2 (Freiburg; Bus 7300 zum Feldberger Hof) | stündlich | D-Ticket; Bus 7300 bis Feldberg-Pass ca. 15 min | Transitous |
| Schluchsee | Hochschwarzwald Süd (Dreiseenbahn) | 2 h 20 | 2 (Freiburg, Titisee) | stündlich | D-Ticket | Transitous |
| Todtnau (Busbahnhof) | Feldberg-Südseite, Belchen, Todtnauer Hütte | 2 h 20 | 2 (Freiburg, Kirchzarten/Titisee + Bus) | stündlich | D-Ticket; Bus 7300 ab Titisee oder Bus 140 ab Kirchzarten | Transitous |

### 1.2 Vogesen (via Strasbourg/Colmar)

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Strasbourg | Umsteigeknoten Vogesen | 0 h 30–0 h 35 | 0 | stündlich (TER/RS4) | D-Ticket nur bis Kehl; Europass 24 h oder TER-Ticket Offenburg–Strasbourg; TGV-Kurse ca. 21 min | Transitous |
| Munster (Haut-Rhin) | Hohneck, Petit Ballon, Schlucht (Wandern, Klettern im Munstertal) | 2 h 15–2 h 30 | 2 (Strasbourg, Colmar) | ca. stündlich, Sa teils zweistündlich | Sommer-Wochenenden "Navette des Crêtes" zum Col de la Schlucht (saisonal, prüfen) | Transitous |
| Metzeral | Endpunkt Munstertal, direktester Zugang Hohneck/Kastelberg | 2 h 35–2 h 50 | 2 (Strasbourg, Colmar) | ca. stündlich | Bahnhof liegt am Talende, Aufstieg direkt ab Bahnhof möglich | Transitous |
| Le Hohwald | Champ du Feu, Nordvogesen-Übergang | 2 h 30–3 h (Schätzung) | 2–3 (Strasbourg, Barr/Obernai, Bus Fluo Grand Est) | Bus wenige Kurse, Wochenende stark eingeschränkt | Transitous fand keine Verbindung (Busdaten fehlen) – Anreise samstags fraglich, Busfahrplan Fluo 67 manuell prüfen | Schätzung |

### 1.3 Berner Oberland

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Interlaken Ost | Knoten Jungfrauregion/Haslital | 3 h 50–4 h 05 | 1 (Basel) | stündlich (IC 61 direkt Basel–Interlaken Ost) | Einzelne ICE Berlin–Interlaken fahren durch (Umstieg entfällt) – Kurse prüfen | Transitous |
| Grindelwald | Wetterhorn, Schreckhorn, Eiger, Faulhorn; Skitouren Kleine Scheidegg | 4 h 25–4 h 40 | 2–3 (Basel, Interlaken Ost, ggf. Spiez) | stündlich | Bergbahnen (Eiger Express, First) ab Bahnhof; Halbtax gilt | CH-API |
| Lauterbrunnen | Jungfrau-Südseite, Schilthorn, Rottal | 4 h 25 | 2–3 | stündlich | | CH-API |
| Wengen | Jungfraujoch-Zubringer, Männlichen, Mönchsjochhütte | 4 h 45 (Schätzung: Lauterbrunnen + WAB ca. 15–20 min) | 3–4 | stündlich (WAB halbstündlich) | | Schätzung auf Basis CH-API |
| Mürren | Schilthorn, Sefinenfurgge, Rotstockhütte | 4 h 55 | 4 (Basel, Interlaken Ost, Lauterbrunnen, Grütschalp) | stündlich | | CH-API |
| Meiringen | Haslital, Engelhörner, Rosenlaui (Klettern), Brünig | 4 h 10 | 2 (Basel, Luzern) | stündlich (IR/PE Luzern–Interlaken) | Alternativ via Spiez–Interlaken Ost (4 h 40) | CH-API |
| Grimsel Hospiz | Grimselgebiet (Klettern Gelmer/Handegg, Hochtouren Oberaar, Lauteraarhütte) | 5 h 05 | 3 (Basel, Luzern, Meiringen; Bus 161) | Bus 161 nur ca. Juni–Oktober, wenige Kurse | Saisonal; Winter nicht erreichbar | CH-API |
| Kandersteg | Blüemlisalp, Gemmi, Lötschenpass, Öschinensee; Skitouren; Eisklettern | 4 h 10 | 1–2 (Basel, Bern oder Spiez) | stündlich | Ein beliebter Ausgangspunkt mit sehr guter Erreichbarkeit | CH-API |
| Adelboden (Post) | Engstligenalp, Wildstrubel, Bunderspitz; Skitouren | 4 h 30 | 3 (Basel, Bern, Frutigen; Bus 230) | stündlich | | CH-API |
| Lenk im Simmental | Wildstrubel, Iffigenalp, Wildhorn | 4 h 55 | 3 (Basel, Bern/Spiez, Zweisimmen) | stündlich | | CH-API |

### 1.4 Zentralschweiz / Gotthard

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Engelberg | Titlis, Spannort, Fürenalp; Skitouren; Klettern | 3 h 30 (Regelfahrzeit) | 2 (Basel, Luzern) | stündlich, Luzern–Engelberg halbstündlich | Am 12.09.2026 Ersatzbus Stansstad–Engelberg (Zentralbahn-Baustelle); Regelfall IR direkt Luzern–Engelberg 43 min | CH-API |
| Göschenen | Göscheneralp, Salbitschijen (Klettern), Bergseehütte | 4 h 15–4 h 30 | 1–2 (Basel, ggf. Zürich/Arth-Goldau) | stündlich (IR 26/46 Gotthard-Bergstrecke) | Bus Göschenen–Göscheneralp saisonal | CH-API (abgeleitet) |
| Andermatt | Urseren, Gotthard-Gebiet, Gemsstock; Skitouren-Klassiker; Klettern Furka/Grimsel | 4 h 30–4 h 50 | 2–3 (Basel, Göschenen; ggf. Zürich) | stündlich | Matterhorn-Gotthard-Bahn ab Göschenen; Postauto Furka/Oberalp saisonal | CH-API |
| Airolo | Tessiner Alpen Nord, Gotthard-Südseite, Bedretto (Skitouren) | 4 h 30 | 1 (Basel; IR 26 samstags Basel–Airolo direkt) | stündlich | Sehr gutes Verhältnis Fahrzeit/Höhe; Alternativ via Gotthard-Basistunnel–Bellinzona | CH-API |
| Sedrun | Oberalp, Maighels, Skitouren Sedrun | 5 h 45–6 h (**>5 h**) | 3 | stündlich | Über Chur–Disentis oder Göschenen–Andermatt; nur mit Frühabfahrt/Nachtzug im Budget | CH-API |
| Disentis/Mustér | Surselva, Medelsergruppe, Tödi-Südseite | 5 h 40 (**>5 h**) | 2 (Basel, Chur) | stündlich | | CH-API |

### 1.5 Glarus / Ostschweiz / Alpstein

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Takt-Hinweis | Quelle |
|---|---|---|---|---|---|---|
| Braunwald | Tödi-Gebiet, Ortstock, Skitouren Braunwald | 4 h 35 | 3–4 (Basel, Zürich, Ziegelbrücke/Linthal, Standseilbahn) | stündlich | Autofreier Ort, Standseilbahn ab Linthal | CH-API |
| Elm (Dorf) | Glarner Alpen, Segnespass, Tschingelhörner, Skitouren | 4 h 25 | 4 (Basel, Zürich, Ziegelbrücke, Schwanden; Bus 541) | stündlich | | CH-API |
| Wildhaus (Dorf) | Churfirsten, Alpstein-Südseite, Säntis | 4 h 30 | 3 (Basel, Sargans, Buchs SG; Bus 797) | stündlich | | CH-API |
| Appenzell | Alpstein (Ebenalp, Hoher Kasten) | 4 h 30 | 3 (Basel, Zürich, Gossau; S23) | stündlich | | CH-API |
| Wasserauen | Alpstein zentral (Seealpsee, Säntis, Altmann; Klettern) | 4 h 45 | 3 (Basel, Zürich, Gossau) | stündlich | Endbahnhof direkt am Tourstart | CH-API |
| Schwägalp | Säntis (Schwebebahn), Kreuzberge | 4 h 40 | 4 (Basel, Zürich, Gossau, Urnäsch; Bus 791) | stündlich | | CH-API |

### 1.6 Graubünden

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Chur | Knoten Graubünden | 3 h 50–4 h 00 | 1 (Basel oder Zürich) | stündlich (IC 3 Basel–Chur direkt) | | Transitous/CH-API |
| Flims (Dorf/Waldhaus) | Flimserstein, Segnes, Cassons; Skitouren | 4 h 30 | 2 (Basel, Chur; Bus 81) | stündlich | | CH-API |
| Klosters Platz | Silvretta, Madrisa, Skitouren Prättigau | 4 h 30 | 2 (Basel, Landquart) | stündlich (RE 13/24) | Zugang Silvrettahütte, Vereina | CH-API |
| Davos Platz | Davoser Skitourenklassiker, Jakobshorn, Sertig, Dischma | 5 h 00 (Regelfall) | 2–3 | stündlich | Am 12.09.2026 Ersatzbus Küblis–Davos (Baustelle) → ca. 5 h 20 | CH-API |
| Arosa | Weisshorn, Aroser Rothorn, Skitouren Arosa | 5 h 30–5 h 40 (**>5 h**) | 2 (Basel, Chur) | stündlich | Mit ICE 05:30 ab Offenburg knapp im Budget | CH-API |

### 1.7 Wallis / Chamonix

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Zermatt | Matterhorn, Monte-Rosa-Gruppe, Hochtouren, Skitouren | 5 h 15–5 h 20 (**>5 h, knapp**) | 2–3 (Basel, Visp; ggf. Täsch) | stündlich | IC 6 Basel–Visp via Lötschberg-Basistunnel; MGB Visp–Zermatt 1 h 10 | CH-API |
| Saas-Fee (Busterminal) | Mischabel, Allalin, Weissmies; Hochtouren, Skitouren | 5 h 15–5 h 20 (**>5 h, knapp**) | 2 (Basel, Visp; Bus 511) | stündlich | Bus 511 Visp–Saas-Fee ca. 55 min | CH-API |
| Chamonix-Mont-Blanc | Mont-Blanc-Gebiet | 6 h 30–7 h 15 (**>5 h**) | 3–4 (Basel, Visp, Martigny, Vallorcine) | stündlich | Nur als Mehrtages-Ziel realistisch | CH-API |

### 1.8 Jura

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Vallorbe | Waadtländer Jura (Dent de Vaulion, Mont d'Or), Skilanglauf | 5 h 15 (**>5 h, knapp**) | 3 (Basel, Bern, Lausanne) | stündlich | | CH-API |
| Pontarlier | Französischer Jura (Haut-Doubs), Skitouren/Langlauf | 4 h 45–5 h 00 | 3 (Basel, Bern, Neuchâtel) | RE Neuchâtel–Pontarlier ca. zweistündlich | | CH-API |

### 1.9 Vorarlberg / Tirol / Allgäu / Bayern

| Bahnhof | Region / Tourengebiet | Fahrzeit ca. | Umstiege | Takt | Hinweise | Quelle |
|---|---|---|---|---|---|---|
| Bregenz | Pfänder, Bregenzerwald (Bus) | 4 h 20 | 2 (Basel, Zürich; EC Zürich–München) | EC ca. zweistündlich | | Transitous |
| Bludenz | Knoten Montafon/Brandnertal/Klostertal | 5 h 00 (Schätzung; Transitous mit langsamer Erstverbindung 5 h 19) | 2–3 (Basel, Zürich; RJX) | RJX Zürich–Bludenz stündlich/zweistündlich | Zeitgewinn mit ICE 05:30 ab Offenburg | Schätzung / Transitous |
| Schruns | Montafon, Silvretta (Hochtouren, Skitouren), Rätikon | 5 h 15–5 h 30 (**>5 h, knapp**) | 3 (Basel, Zürich, Bludenz; Montafonerbahn) | Montafonerbahn halbstündlich | Transitous/CH-API haben keine Daten für die Montafonerbahn – Schätzung aus Bludenz + 20 min | Schätzung |
| St. Anton am Arlberg | Arlberg, Verwall, Lechtaler Alpen; Skitouren | 5 h 15–5 h 30 (**>5 h, knapp**) | 2 (Basel, Zürich; RJX direkt Zürich–St. Anton) | RJX ca. zweistündlich | Transitous: 5 h 54 mit Umweg über Bregenz; mit RJX ab Zürich schneller | Schätzung / Transitous |
| Oberstdorf | Allgäuer Alpen (Nebelhorn, Trettachtal, Skitouren), Kleinwalsertal (Bus) | 5 h 00 | 2 (Mannheim oder Karlsruhe/Stuttgart, Ulm) | ca. zweistündlich (RE 75 Ulm–Oberstdorf) | D-Ticket gilt ab Ulm (RE 75); ICE-Teilstrecke kostenpflichtig | Transitous |
| Sonthofen / Bad Hindelang | Allgäuer Alpen Ost (Hintersteiner Tal, Oberjoch) | 4 h 50 (Sonthofen) / ca. 5 h 15 (Bad Hindelang, Bus) | 2–3 | ca. zweistündlich | Transitous fand keine Verbindung nach Bad Hindelang (Busdaten fehlen) | Transitous / Schätzung |
| Garmisch-Partenkirchen | Wetterstein, Zugspitze, Ammergauer Alpen | 5 h 35 (**>5 h**) | 2 (Mannheim, München) | stündlich (RB 6 München–Garmisch) | Nur mit Frühabfahrt sinnvoll | Transitous |

### 1.10 Kurzfazit zur Erreichbarkeit

- **Bis 2 h 30 (Tagestouren, meist D-Ticket/Europass):** gesamter Schwarzwald, Vogesen bis Munster/Metzeral.
- **3 h 30 – 4 h 30 (Wochenende, 2 Tage):** Engelberg, Meiringen, Kandersteg, Interlaken, Grindelwald, Lauterbrunnen, Adelboden, Airolo, Göschenen, Andermatt, Klosters, Flims, Glarnerland, Alpstein, Bregenz.
- **4 h 30 – 5 h 15 (Wochenende mit Frühabfahrt):** Mürren, Lenk, Grimsel, Wasserauen, Schwägalp, Davos, Pontarlier, Oberstdorf, Bludenz.
- **Über Budget (>5 h 15):** Zermatt/Saas-Fee (knapp), Arosa, Sedrun, Disentis, Vallorbe (knapp), Schruns/St. Anton (knapp), Garmisch, Chamonix. Für diese Ziele lohnen 3–4-Tage-Formate oder die Nutzung des Nightjet ab/bis Zürich.
- Auffällig: Die Schweizer Ziele sind wegen des Taktfahrplans und der kurzen Umsteigezeiten in Basel **fast durchgehend im Stundentakt** erreichbar, die deutschen Alpenziele (Allgäu, Garmisch) sind trotz geringerer Distanz langsamer und nur zweistündlich angebunden.

---

## 2. Bestehende Angebote / Wettbewerber

| Angebot | URL | Was es macht | Einschätzung (gut / schlecht) |
|---|---|---|---|
| **alpenvereinaktiv.com – Filter "mit Bahn und Bus erreichbar"** (DAV/ÖAV/AVS, Technik Outdooractive) | https://www.alpenvereinaktiv.com / https://www.alpenverein.de/artikel/tourenplanung-alpenvereinaktiv-oeffentliche-anreise_a21d0d03-eb49-467d-b6b7-2d0bc7663124 | Autoren markieren Touren als ÖPNV-freundlich (Qualitätskriterien des DAV-Ressorts Natur & Umwelt); Filter im Portal. | Gut: offizielle DAV-Plattform, große Tourenbasis, Kriterien definiert. Schlecht: Markierung ist manuell/binär, keine Fahrzeitberechnung vom Heimatbahnhof, keine Fahrplananbindung, Datenqualität autorabhängig. |
| **Outdooractive "ÖPNV-freundliche Touren"** | https://corporate.outdooractive.com/oa-blog/oepnv-freundliche-touren | Gleiches Merkmal wie oben, als Property im Outdooractive-CMS für alle Outdooractive-Portale. | Gut: skaliert auf viele Portale. Schlecht: nur ein Flag, kein Routing, kein Bezug zum Startort. |
| **Zuugle / Bahn zum Berg** (Verein Bahn zum Berg, AT) | https://www.zuugle.at, https://www.zuugle.de, https://www.zuugle.ch, https://www.bahn-zum-berg.at | Suchmaschine, die Touren aus ~9 Portalen (Bergfex, Outdooractive u. a.) crawlt, für jeden Heimatbahnhof die ÖV-An-/Rückreise berechnet und nur Touren mit sinnvoller Anreise zeigt. Seit 2023–2025 alpenweit (AT, Bayern, CH, FL, Südtirol, FR, SLO); seit 2026 freie Adresseingabe als Startpunkt. | Gut: **das** Referenzprodukt – echtes Routing vom Heimatort, Fahrplan-Vorschläge, Fußweg zum Tourstart, Rückreise. Schlecht: Abdeckung für Schwarzwald/Vogesen/Baden-Württemberg als Startregion unklar (Kern ist Alpenraum); Datenquelle sind fremde Portale (Qualität schwankt); Fahrzeiten sind Schätzungen aus statischen Fahrplänen; kein sektionsspezifisches Tourenprogramm. **Vor eigenem Bau prüfen, ob zuugle.de mit Startort Offenburg bereits brauchbare Ergebnisse liefert** – ggf. Kooperation statt Konkurrenz. |
| **DAV München & Oberland – "Mit Bahn und Bus in die Berge" / Tourentipps** | https://www.alpenverein-muenchen-oberland.de/umwelt/mit-bahn-und-bus-in-die-berge | Redaktionell gepflegte Tourentipps mit Anreise ab München, Tour der Woche, BergBus. | Gut: kuratiert, konkret, regional. Schlecht: rein redaktionell, nicht übertragbar, kein Tool. |
| **DAV – Netzplan "Öffentlich in die Berge"** | https://www.alpenverein.de/artikel/oeffentlich-in-die-berge-netzplan-winter_cb1f2c73-430e-4d49-8fef-cf1a284786c6 | Schematischer "U-Bahn-Plan" der Tourenziele mit Bahn/Bus (Winter/Sommer) ab München. | Gut: hervorragende Kommunikationsform, auf einen Blick verständlich – **Vorbild für einen "Offenburg-Netzplan"**. Schlecht: statisch, ohne Fahrzeiten ab anderen Orten. |
| **DAV Bergsteigerbus / BergBus** | https://www.alpenverein.de/natur/naturvertraeglicher-bergsport/bergsteigerbus/klimafreundliche-anreise-bergsport_aid_29948.html | Von Sektionen (München, Kempten, Rosenheim) organisierte Busse für die letzte Meile; seit 2024 in den ÖPNV integriert. | Gut: löst das Letzte-Meile-Problem. Schlecht: nur Bayern; hoher Organisationsaufwand. |
| **DAV Freiburg – Mobilität** | https://www.dav-freiburg.de/de/sektion/Natur-Umweltschutz/mobilitaet.php | Sektionsregel: ÖV-Touren werden mit 50 % der Fahrtkosten (max. 25 €/Person/Tour) bezuschusst; ca. 1/5 der Touren per ÖV. | Gut: Nachbarsektion mit fast identischer Ausgangslage (Rheintalbahn, Basel-Knoten) – **natürlicher Kooperationspartner** (gemeinsame Tabelle, gemeinsames Programm). Schlecht: kein Tool, keine Tourenliste öffentlich. |
| **DAV Konstanz, DAV Schwaben, DAV Würzburg, DAV Rosenheim – Bus-&-Bahn-Seiten** | https://www.dav-konstanz.de/klimaschutz/mobilitaet, https://www.alpenverein-schwaben.de/natur-umwelt/naturvertraeglicher-bergsport/bus-bahn | Ratgeberseiten, Links auf alpenvereinaktiv-Filter, einzelne Tourentipps. | Gut: zeigen die Best Practices der Sektionen. Schlecht: verstreut, keine gemeinsame Datenbasis. |
| **SAC-Tourenportal** | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/ | >6000 Touren; Startpunkt jeder Tour direkt mit SBB-Fahrplan verlinkt; Karten-Layer "ÖV-Haltestellen" mit nächsten Abfahrten. | Gut: nahtlose Fahrplananbindung, sehr hohe Tourenqualität (Bergführer-Autoren), alle Disziplinen. Schlecht: kostenpflichtiges Abo; nur Schweiz; kein Filter "Fahrzeit ab X". |
| **SAC "Alpen retour" / ÖV-Bergführer, Schneetourenbus, Bus alpin** | https://www.sac-cas.ch/de/umwelt/bergsport-und-umwelt/mobilitaet/, https://www.sac-cas.ch/de/die-alpen/lancierung-alpen-retour-15382/ | Mobilitätskampagne: Sektionen erhalten Beratung durch ÖV-erfahrene Bergführer; Tourentipps "Alpen retour"; Förderung von Schneetourenbus/Bus alpin. | Gut: Vorbild für Kampagnen-Framing und Sektionsarbeit. Schlecht: kein Tool, Schweiz-intern. |
| **Bergwelten – "10 Wochenendtouren mit öffentlicher Anreise"** u. ä. | https://www.bergwelten.com/a/10-wochenendtouren-mit-oeffentlicher-anreise | Redaktionelle Listen. | Nur Inspiration. |
| **Bergzeit-Magazin – Skitouren mit Öffis** | https://www.bergzeit.de/magazin/skitour-skiurlaub-oeffentliche-verkehrsmittel/ | Redaktionelle Regionen-Liste. | Nur Inspiration. |
| **bwegt – "Wandern mit bwegt"** (Land BW) | https://www.bwegt.de/land-entdecken/wandern-mit-bwegt | Wanderungen in BW mit ÖPNV-Anreise, D-Ticket-Fokus. | Gut: passt exakt für den Schwarzwald-Teil, Landesförderung. Schlecht: keine Alpen, kein Bergsport (Hochtouren/Ski/Klettern). |
| **Fahrtziel Natur** (DB, BUND, NABU, VCD) | https://www.fahrtziel-natur.de/gebiet/schwarzwald/anreise, https://www.fahrtziel-natur.de/gebiet/allgaeu/anreise | Kooperation für 23 Naturregionen; Anreise-Infos Schwarzwald (Höllentalbahn, Wiesentalbahn, KONUS-Gästekarte) und Allgäu. | Gut: etablierte Marke, Partner für Kommunikation. Schlecht: touristisch, keine Touren, keine Fahrzeiten. |
| **Mountain Wilderness / ÖAV "Ohne Auto in die Berge" / #machseinfach** | https://www.alpenverein.at/portal/news/2021/2021_05_19_ohne-auto-in-die-berge-moeglichkeiten-und-herausforderungen.php, https://www.alpenverein.at/portal/natur-umwelt/sanfte_mobilitaet/zuugle.at.php | Kampagnen, Sammlung von Letzte-Meile-Angeboten (Bayern, Stand 2022), Verweis auf Zuugle. | Gut: Problemanalyse "letzte Meile". Schlecht: veraltete Listen, kein Tool. |

**Lücke, die das Offenburger Projekt füllen kann:** Es gibt keine Quelle, die für einen konkreten Heimatbahnhof (Offenburg) eine **Erreichbarkeitskarte/-tabelle der Tourenregionen mit Fahrzeit, Takt, Ticket-Hinweisen** liefert und diese mit dem eigenen Sektionsprogramm verknüpft. Zuugle kommt dem am nächsten, ist aber tourenzentriert (nicht regionen-/bahnhofszentriert) und für Schwarzwald/Vogesen als Startregion unsicher.

---

## 3. Datenquellen und APIs für Fahrplandaten

### 3.1 Routing-APIs (Verbindungssuche)

| Quelle | Abdeckung | Zugang / Kosten | Erfahrung in dieser Recherche | Eignung |
|---|---|---|---|---|
| **Transitous (MOTIS)** – https://api.transitous.org (Doku: https://github.com/public-transport/transitous, https://github.com/motis-project/motis) | Europa-weit, aggregiert GTFS von DB (gtfs.de/DELFI), SBB, SNCF, ÖBB/VAO u. a., inkl. GTFS-RT; Koordinaten-zu-Koordinaten, OpenAPI. | Frei, ohne Key, Community-betrieben; keine SLA. Selbst hostbar (MOTIS ist Open Source). | **Beste Quelle im Test**: Offenburg→CH/FR/DE korrekt inkl. ICE-Kursen. Lücken: Montafonerbahn (Schruns), Busse Elsass (Le Hohwald), Bus Bad Hindelang. | **Empfehlung als Primärquelle** für ein Erreichbarkeits-Tool (grenzüberschreitend, kostenlos). Fallback-Logik für Lücken nötig. |
| **transport.opendata.ch** – https://transport.opendata.ch/docs.html | Schweizer Fahrplan (SBB-Daten) inkl. ausländischer Grenzbahnhöfe; JSON, sehr einfach. | Frei, ohne Key; Rate-Limit (mehrfach HTTP 429 bei ~30 Anfragen in kurzer Zeit). | Sehr zuverlässig **innerhalb der Schweiz**. Deutsche Teilstrecke unbrauchbar (nur RE 7 Offenburg–Basel Bad, keine ICE; Höllentalbahn fehlt); Österreich (Schruns, St. Anton) leer. | Ideal für die Schweizer Legs ab Basel SBB/Zürich HB; nicht für End-to-End ab Offenburg. |
| **OJP 2.0 (opentransportdata.swiss)** – https://opentransportdata.swiss/en/cookbook/open-journey-planner-ojp/, https://api-manager.opentransportdata.swiss/ | Offizielle Schweizer Plattform: Routing (OJP), GTFS-RT, SIRI, OJP Fare (Preise!), Zugformation. XML-Standard. | Kostenloser API-Key nötig; Rate-Limits pro Key (Limits & Kosten: https://opentransportdata.swiss/en/limits-and-costs/). | Nicht getestet (Key erforderlich). | Für Produktivbetrieb mit Schweizer Preisen (OJP Fare) die offizielle Wahl; Adapter-Lib: https://github.com/openTdataCH/ojp-adapter. |
| **DB: db-vendo-client / v6.db.transport.rest** – https://github.com/public-transport/db-vendo-client, https://v6.db.transport.rest/ | Inoffizieller Client für die bahn.de-("Vendo")-APIs: Journeys, Abfahrten, Preise, D-Ticket-Kennzeichnung soweit bahn.de sie liefert. | Frei; öffentliche Instanz ohne Garantie. | Öffentliche Instanz war während der gesamten Recherche **HTTP 503**. | Nur mit eigenem Hosting (db-vendo-client als Node-Lib) einsetzbar; Risiko: DB kann Schnittstellen jederzeit ändern. |
| **DB API Marketplace – RIS::Journeys / RIS::Connections / Timetables** – https://developers.deutschebahn.com/db-api-marketplace/apis/product/ris-journeys-transporteure, https://developer-docs.deutschebahn.com/apis | Offizielle DB-APIs (Fahrten, Anschlüsse, Bahnhofstafeln). | Registrierung; RIS-APIs vertraglich/nach Prüfung; Timetables-API frei, aber nur Stationstafeln (kein Routing). | Nicht getestet. | Für einen Verein eher Overkill; Timetables-API ohne Routing wenig hilfreich. |
| **VAO START (Verkehrsauskunft Österreich)** – https://www.verkehrsauskunft.at/start | REST-Routing Österreich inkl. Vorarlberg/Tirol. | Kostenloser, limitierter Zugang für Firmen/Privatpersonen (seit 2022). | Nicht getestet; ÖBB-Scotty-HAFAS per Fetch nicht auswertbar. | Ergänzung für Montafon/Arlberg, falls Transitous-Lücken bleiben. |
| **SNCF / Fluo Grand Est** | Routing über transport.data.gouv.fr-Navitia-Instanzen bzw. GTFS. | Frei. | Nicht separat getestet; Transitous enthält SNCF-Züge, aber offenbar nicht alle Fluo-Busse (Le Hohwald). | Für Vogesen-Busse GTFS Fluo 67/68 direkt einbinden. |

### 3.2 Statische Fahrplandaten (GTFS/NeTEx) – für eigene Berechnungen, Karten, Takt-Auswertungen

| Datensatz | URL | Hinweise |
|---|---|---|
| **DELFI Deutschland (GTFS + NeTEx)** | https://www.opendata-oepnv.de (Datensatz "Deutschlandweite Sollfahrplandaten (GTFS)") | Offizieller Gesamtdatensatz DE (Nah- und Fernverkehr), kostenlose Registrierung; Basis fast aller DE-Router. |
| **gtfs.de** | https://gtfs.de/de/feeds/de_full/ (auch de_fv Fernverkehr, de_rv Regionalverkehr, de_nv Nahverkehr) | Aufbereitete, wöchentlich aktualisierte GTFS-Feeds aus DELFI-NeTEx; einfacher nutzbar als das Original; Echtzeit: https://gtfs.de/de/realtime/ |
| **GTFS Schweiz** | https://opentransportdata.swiss (Datensatz "Fahrplan GTFS") | Wöchentlich; inkl. Bergbahnen/Postauto (wichtig für letzte Meile). |
| **GTFS Österreich** | https://data.oebb.at/de/datensaetze~soll-fahrplan-gtfs~ ; Mobilitätsverbünde Österreich (https://www.mobilitydata.gv.at) | ÖBB + Verbünde (VVV Vorarlberg, VVT Tirol). |
| **GTFS Frankreich (SNCF, TER Grand Est, Fluo)** | https://transport.data.gouv.fr/datasets/horaires-sncf ; TER: https://eu.ftp.opendatasoft.com/sncf/plandata/export-ter-gtfs-last.zip | Fluo Grand Est Busse als eigene Feeds auf transport.data.gouv.fr suchen. |
| **Nachtzüge** | Im DELFI/SBB-GTFS enthalten (ÖBB Nightjet als Fernverkehr). | Halt Offenburg des NJ 470/471 verifizieren (Quellen widersprüchlich, siehe 4). |

### 3.3 Deutschlandticket-Abdeckung als Datenproblem

- **Es gibt keinen maschinenlesbaren D-Ticket-Gültigkeits-Flag** in DELFI-GTFS/NeTEx oder gtfs.de (Recherche ohne Treffer). bahn.de/DB Navigator bieten einen "Deutschlandticket"-Filter (https://www.bahn.de/service/informationen-buchung/filter-deutschland-ticket), der intern über Produktklasse + Tarifgebiet arbeitet; db-vendo-client kann diese Kennzeichnung teilweise auslesen (nicht verifiziert).
- **Praktikabler Ansatz für das Projekt:** regelbasiert. D-Ticket gilt = (Produktklasse Nahverkehr: RE/RB/S/Bus/Tram) UND (Fahrt innerhalb Deutschland ODER in einer Whitelist grenzüberschreitender Ausnahmen). Relevante Ausnahmen für Offenburg: RVL bis **Basel SBB** (S6, RE 7 bis Basel Bad Bf), **Schaffhausen** (Erzingen–Schaffhausen–Thayngen–Singen, Schaffhausen–Lottstetten), **Kehl** (nicht Strasbourg), Lindau (nicht Bregenz). Quellen: https://www.sbb-deutschland.de/gilt-das-deutschlandticket-auf-unseren-strecken/, https://rvl-online.de/deutschlandticket/, https://www.bahn.de/faq/pk/angebot/regionale-angebote/deutschland-ticket/nutzung/gueltigkeit
- Preise für die Schweiz: **OJP Fare** (opentransportdata.swiss) liefert SBB-Preise inkl. Halbtax; für DB-Sparpreise nur über bahn.de/Vendo (inoffiziell).

### 3.4 Tourendaten (zur Verknüpfung)

- alpenvereinaktiv/Outdooractive: API nur für Partner (Outdooractive Platform API, kostenpflichtig).
- SAC-Tourenportal: keine offene API.
- Eigene Sektionstouren: aus dem Programm (https://www.dav-offenburg.de/programm) mit Startbahnhof anreichern – kleinster, sofort umsetzbarer Datensatz.

---

## 4. Unsicherheiten und offene Punkte

1. **Fahrzeiten sind Momentaufnahmen** vom Fahrplantag 12.09.2026. Fahrplanwechsel am 13.12.2026; alle Werte danach neu prüfen. Sonntagsfahrpläne (Rückreise) wurden nicht abgefragt.
2. **Baustellen im Abfragezeitraum verzerren einzelne Werte**: Zentralbahn Stansstad–Engelberg (Ersatzbus), RhB Küblis–Davos (Ersatzbus). Rheintalbahn-Sperrungen 2026: Ostern (28.03.–13.04.), 07.–10.08., 14.–17.08., **18.–21.09.** und **02.–05.10.2026** zwischen Offenburg und Herbolzheim – an diesen Wochenenden gelten die Tabellenwerte nicht (Umleitung Zürich–Schwarzwaldbahn–Offenburg als Ersatz). Quelle: DB-Presse (https://www.deutschebahn.com/de/presse/presse-regional/pr-stuttgart-de/aktuell/presseinformationen/Bauarbeiten-auf-der-Rheintalbahn-So-bleiben-Fahrgaeste-mobil-13980532).
3. **Datenlücken in den APIs**: Montafonerbahn (Schruns), Fluo-Busse Elsass (Le Hohwald), Bus Sonthofen–Bad Hindelang, Postauto-Saisonlinien (Grimsel, Göscheneralp, Navette des Crêtes). Diese Zeilen sind Schätzungen.
4. **Nightjet-Halt Offenburg**: Transitous zeigt einen Fernzug "20N" ab Offenburg 04:42 (Basel SBB 06:21, Zürich 07:55), bahndampf.de nennt für NJ 471 Offenburg 06:43 / Zürich 10:05. Mindestens eine Quelle ist veraltet – vor Nutzung im Konzept auf bahn.de/oebb.at prüfen.
5. **ICE-Direktverbindungen**: Ob einzelne ICE Berlin–Interlaken Ost bzw. Frankfurt–Chur am Samstag in Offenburg halten, wurde nicht abschließend verifiziert; Transitous zeigt ICE 273/275 bis Basel SBB.
6. **Takt-Angaben** beruhen auf 3–4 abgefragten Verbindungen pro Ziel und Fahrplanwissen; für die Rückreise am späten Nachmittag/Abend (letzte Bergbahn, letzte Busse) fehlen Abfragen – für die Tourenplanung entscheidend.
7. **Tarife** (Halbtax-Preise, Schnupper-Halbtax, Europass-Zonen, D-Ticket-Preis 63 €) sind Stand 2026 aus Sekundärquellen; Preise ändern sich jährlich.
8. **Wettbewerbs-Check Zuugle**: Nicht getestet, ob zuugle.de/zuugle.ch mit Startort Offenburg heute bereits brauchbare Treffer für Schwarzwald/Vogesen/Schweiz liefert. Das sollte der nächste Schritt sein, bevor ein eigenes Tool gebaut wird.
9. **Regionale Detailziele** im Schwarzwald (Hausach, Triberg, Renchtal) wurden aus Fahrplanwissen geschätzt, nicht per API abgefragt – geringe Unsicherheit, aber unverifiziert.
10. Alle API-Ergebnisse wurden über einen Textzusammenfasser ausgelesen; einzelne Zwischenhalte oder Minutenangaben können dabei verfälscht sein. Für eine Veröffentlichung sollten die Kernwerte direkt auf bahn.de/sbb.ch gegengeprüft werden.

## Nachtrag: Zuugle geprüft (2026-09-06)

- Zuugle ist Open Source (AGPL-3.0, github.com/bahnzumberg/zuugle-suchseite), betrieben vom Verein "Bahn zum Berg".
- Startorte auf zuugle.de: nur Bayern (Bad Endorf, Bad Reichenhall, Garmisch, Kempten, Landshut, München, Passau, Rosenheim). Offenburg und ganz Baden-Württemberg fehlen.
- Startorte auf zuugle.ch: siehe Abfrage `https://www.zuugle.ch/api/cities?domain=www.zuugle.ch`.
- Konsequenz: Kein direkter Wettbewerb für Offenburg. Option für später: Offenburg als Startort bei Zuugle beantragen oder unsere Daten dort einspeisen, statt ein eigenes Tourenportal zu bauen.
