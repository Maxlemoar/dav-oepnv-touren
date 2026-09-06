# Hütten mit ÖV-Zustieg ab Offenburg (Recherche)

Stand: 6. September 2026. Recherche für das Klimaschutz-/ÖV-Projekt der DAV Sektion Offenburg.

Fragestellung: Welche Hütten von DAV, SAC, ÖAV und Naturfreunden liegen an Talbahnhöfen bzw. Bushaltestellen, die von Offenburg (Baden) mit Bahn und Bus in rund 5 Stunden erreichbar sind, und welche Datenquellen/Attribute existieren dafür bereits?

Legende:
- **(S)** = Schätzung des Recherchierenden (Gehzeit, Buslinie oder Reisezeit nicht aus einer Quelle belegt).
- Gehzeiten der SAC-Hütten stammen, wenn nicht anders angegeben, aus der Wikipedia-Liste der SAC-Hütten, die ihre Zustiegszeiten aus dem SAC-Tourenportal übernimmt.
- Reisezeiten ab Offenburg: eigene Abfrage bei `transport.opendata.ch` (SBB-Fahrplan, Freitag 12.09.2026, Abfahrt ab 07:00, schnellste von max. 4 Verbindungen) – siehe Tabelle 0. Für deutsche/österreichische Ziele (Oberstdorf, St. Anton) aus Trainline-Angaben.
- Tourentyp: W = Wandern, H = Hochtour, S = Skitour, K = Klettern, F = Familie/Gruppenhaus.

---

## 0. Reisezeiten Offenburg → Talort (Referenz für die 5-Stunden-Grenze)

Gemessen über `https://transport.opendata.ch/v1/connections` (SBB-Daten, inkl. DB-Strecke Offenburg–Basel). Werte sind die schnellste Verbindung an einem Freitag, real schwanken sie je nach Uhrzeit um ±30 min.

| Talort (Haltestelle) | Reisezeit | Umstiege | Innerhalb ~5 h? |
|---|---|---|---|
| Metzeral (Vogesen, TER ab Colmar) | 2:05 | 2 | ja |
| Todtnau Busbahnhof | 3:28 | 2 | ja |
| Feldberg-Bärental | 4:04 | 2 | ja |
| Hinterzarten | 4:06 | 2 | ja (via Basel; via Freiburg vermutlich schneller, S) |
| Kandersteg | 4:04 | 3 | ja |
| Kiental, Dorf | 4:02 | 4 | ja |
| Sarnen | 4:02 | 3 | ja |
| Lauterbrunnen | 4:20 | 4 | ja |
| Orvin, Les Prés-d'Orvin (Jura) | 4:20 | 4 | ja |
| Engelberg | 4:23 | 4 | ja |
| Bregenz | 4:24 | 3 | ja |
| Adelboden | 4:26 | 4 | ja |
| Meiringen | 4:30 | 4 | ja |
| Melchtal, Dorf | 4:31 | 4 | ja |
| Grindelwald | 4:34 | 4 | ja |
| Wengen | 4:35 | 5 | ja |
| Le Locle (Jura) | 4:36 | 4 | ja |
| Bürglen UR (Rämsenberg) | 4:36 | 5 | ja |
| Wiler (Lötschen) | 4:39 | 4 | ja |
| Linthal | 4:40 | 3 | ja |
| Oberstdorf | 4:43 (Trainline, schnellste) | ≥1 | ja, knapp |
| Fiesch | 4:46 | 3 | ja |
| Mürren | 4:48 | 6 | ja |
| Lenk im Simmental | 4:49 | 4 | ja |
| Klosters Platz | 4:52 | 4 | ja |
| Stechelberg | 4:52 | 5 | ja |
| Wildhaus, Dorf | 4:52 | 5 | ja |
| Flims Dorf | 4:54 | 4 | ja |
| Appenzell | 4:54 | 4 | ja |
| Braunwald | 4:56 | 4 | ja |
| Innertkirchen, Grimseltor | 4:56 | 5 | ja |
| Leukerbad | 5:00 | 4 | Grenze |
| Melchsee-Frutt (Bergstation) | 5:03 | 5 | Grenze |
| Wasserauen (Alpstein) | 5:07 | 4 | Grenze |
| Dornbirn | 5:09 | 4 | Grenze |
| Göschenen | 5:10 | 4 | Grenze |
| Zermatt | 5:11 | 4 | Grenze |
| Saas-Fee | 5:13 | 3 | Grenze |
| St. Anton am Arlberg | 5:14 (Trainline, schnellste) | ≥1 | Grenze |
| Rosenlaui | 5:15 | 5 | Grenze |
| Gadmen | 5:17 | 5 | Grenze |
| Davos Platz | 5:19 | 5 | Grenze |
| Airolo | 5:21 | 4 | Grenze |
| Andermatt | 5:26 | 5 | Grenze |
| Grimsel Hospiz | 5:31 | 5 | knapp darüber |
| Arosa | 5:33 | 4 | knapp darüber |
| Disentis | 5:33 | 4 | knapp darüber |
| Engstlenalp | 5:33 | 7 | knapp darüber |
| Vals | 5:35 | 5 | knapp darüber |
| Bergün | 5:36 | 4 | knapp darüber |
| Realp | 5:41 | 5 | knapp darüber |
| Bezau (Bregenzerwald) | 5:43 | 4 | knapp darüber |
| Elm | 5:48 | 6 | knapp darüber |
| Sustenpass | 5:53 | 5 | darüber |
| Sedrun | 5:56 | 5 | darüber |
| Bludenz | 5:58 (SBB-Routing via Zürich; via Railjet vermutlich ~4:45, S) | 8 | unklar |
| Arolla | 6:21 | 6 | nein |

Erkenntnis: Berner Oberland, Zentralschweiz, Glarnerland, Prättigau, Goms und Alpstein liegen klar in Reichweite; Zermatt/Saas, Davos, Airolo, Andermatt und der Arlberg sind Grenzfälle (gut für Wochenend- und Mehrtagestouren, kaum für Tagesanreise mit Aufstieg am selben Tag); Arosa, Disentis/Sedrun, Elm, Arolla, Montafon, Bregenzerwald und Lechtal liegen eher bei 5,5–6,5 h.

---

## 1. Hüttentabelle nach Region

Spalten: Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg (Gehzeit ab Haltestelle, ggf. Bergbahn) | Region | Tourentyp | Höhe | Quelle

### 1.1 Schwarzwald (eigene Sektion und Nachbarsektionen, Naturfreunde)

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Sandkästle | DAV Sektion Offenburg (Selbstversorger, nur Mitglieder, 17 Plätze) | Bf Bühl → Bus bis Hst. Sand Kapelle (Schwarzwaldhochstraße) | wenige Minuten (S) | Nordschwarzwald | W, S (Loipe) | 830 m | https://www.dav-offenburg.de/Sektion/H%C3%BCtten/Sandk%C3%A4stle |
| Schönbrunner Hütte | DAV Sektion Ettlingen (Selbstversorger, 34 Plätze) | Bf Bühl → Bus Richtung Bühlertal/Sand (S) | ca. 1 h (S) | Nordschwarzwald (Nationalpark) | W | 720 m | https://de.wikipedia.org/wiki/Sch%C3%B6nbrunner_H%C3%BCtte |
| Wiedenbachhütte | DAV Sektion Heidelberg (Selbstversorger, 32 Betten) | Bf Bühl / Bühlertal-Bus (S) | ca. 30 min (S) | Nordschwarzwald | W, F | 370 m | https://de.wikipedia.org/wiki/Wiedenbachh%C3%BCtte |
| Ramshaldenhütte | DAV Sektion Freiburg-Breisgau (Selbstversorger, 51 Betten) | Bf Hinterzarten → Bus B500 Richtung Thurner/St. Märgen (S) | ca. 15–30 min (S) | Hochschwarzwald (Breitnau) | W, S (Loipe) | 1035 m | https://www.dav-freiburg.de/de/huette/ramshalde.php |
| Schwenninger Hütte | DAV Sektion Baar (Selbstversorger, 20 Lager) | Bf Triberg | ca. 1 h | Mittlerer Schwarzwald | W | 800 m | https://www.dav-baar.de/schwenninger-huette/ |
| Naturfreundehaus Feldberg | NaturFreunde (Bewirtschaftet, 50 Plätze) | Bf Titisee/Feldberg-Bärental → Bus 7300 Hst. Feldberger Hof | ca. 15 min (S) | Südschwarzwald | W, S | 1350 m | https://www.naturfreunde.de/haus/naturfreundehaus-feldberg |
| Naturfreundehaus Brend | NaturFreunde | Furtwangen (Bus ab Bf Triberg/Neustadt, S) | ca. 45 min (S) | Mittlerer Schwarzwald, Westweg | W | 1150 m | https://www.naturfreunde.de/access-gsg-arten/suedschwarzwald |
| Naturfreundehaus Breitnau | NaturFreunde | Bf Hinterzarten → Bus (S) | ca. 30 min (S) | Hochschwarzwald | W, F | 1060 m | https://www.naturfreunde.de/access-gsg-arten/suedschwarzwald |
| Naturfreundehaus Häusern | NaturFreunde | Bus Häusern (ab Bf Seebrugg/St. Blasien, S) | ca. 20 min (S) | Südschwarzwald | W, F | 920 m | https://www.naturfreunde.de/haus/naturfreundehaus-haeusern |
| Naturfreundehaus Hotzenwald | NaturFreunde | Rickenbach (Bus ab Bad Säckingen, S) | (S) | Hotzenwald | W, F | 950 m | https://www.naturfreunde.de/access-gsg-arten/suedschwarzwald |
| Naturfreundehaus Kornebene | NaturFreunde | Nordrach (Bus ab Bf Biberach/Baden, S) | (S) | Ortenau / Kinzigtal | W, F | 640 m | https://www.naturfreunde.de/access-gsg-arten/schwarzwald-mittenord |
| Naturfreundehaus Sommerecke | NaturFreunde | Kinzigtal (Bahn Hausach–Schramberg / Wolfach, S) | (S) | Mittlerer Schwarzwald | W, F | ca. 800 m (S) | https://www.naturfreunde.de/access-gsg-arten/schwarzwald-mittenord |
| Naturfreundehaus Kniebis | NaturFreunde | Bf Freudenstadt → Bus Kniebis (S) | ca. 10 min (S) | Nordschwarzwald | W, S | ca. 900 m (S) | https://www.naturfreundehaus-kniebis.de/ |
| Naturfreundehaus Badener Höhe | NaturFreunde | Bus Schwarzwaldhochstraße (Sand/Unterstmatt, S) | ca. 1 h (S) | Nordschwarzwald | W, F | ca. 1000 m (S) | https://www.naturfreunde.de/access-gsg-arten/schwarzwald-mittenord |

Anmerkung: Weitere Selbstversorgerhäuser badischer Sektionen im Schwarzwald sind in der DAV-Liste nicht enthalten (Sektion Lahr/Schwarzwald und Sektion Kehl betreiben nach dieser Recherche keine eigene Hütte; Karlsruhe hat seine Hütten im Ötztal und Montafon). Das OSM-Tag `operator=Schwarzwaldverein` (7 Objekte im Suchgebiet) verweist auf Wanderheime des Schwarzwaldvereins, die für das Projekt ebenfalls interessant sein könnten.

### 1.2 Vogesen

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Hohwaldhütte | DAV Sektion Bergfreunde Saar (40 Betten) | Le Hohwald (Bus ab Bf Barr/Obernai, S) | (S) | Nordvogesen (Champ du Feu) | W, S | 940 m | https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Deutschen_Alpenvereins |
| Les Jonquilles | Amis de la Nature Metzeral | Bf Metzeral (TER Colmar–Metzeral, 2:05 ab Offenburg) | ca. 1 h (S) | Hohneck-Massiv | W, S | 900 m | https://amis-nature.org/article236.html |
| Chalet-Refuge Schnepfenried | Amis de la Nature Haut-Rhin (45 Plätze) | Bf Metzeral → Bus/Navette Schnepfenried (nur saisonal, S) | 1,5–2 h ab Metzeral (S) | Hohneck / Petit Ballon | W, S | ca. 1250 m (S) | https://www.massif-des-vosges.fr/sit/231001216-chalet-refuge-des-amis-de-la-nature-du-schnepfenried/ |
| La Chaume des Veaux | Amis de la Nature Strasbourg-Neudorf (80 Betten) | Le Hohwald (Bus ab Barr, S) | (S) | Nordvogesen | W, F | 980 m | https://www.naturfreunde.de/naturfreundehaeuser-den-vogesen-f |
| Refuge Gruckert | Amis de la Nature Strasbourg-Ville | Bf Barr | (S) | Nordvogesen | W, F | (S) | https://www.naturfreunde.de/naturfreundehaeuser-den-vogesen-f |
| Chalet Amis de la Nature Vieil-Armand | AN Uffholtz | Bus ab Cernay/Thann (S) | (S) | Südvogesen (Hartmannswillerkopf) | W | 1125 m | https://amis-nature.org/rubrique173.html |
| Chalet Amis de la Nature Petit Ballon | AN Guebwiller | Bus ab Guebwiller (S) | (S) | Petit Ballon | W | 1200 m | https://amis-nature.org/rubrique173.html |
| Chalet Amis de la Nature Lac Noir | AN Val d'Orbey | Orbey (Bus ab Colmar, S) | (S) | Vogesenkamm | W, F | ca. 950 m (S) | https://amisnature-val-orbey.fr/ |
| Refuge des Trois Fours | Club Alpin Français Nancy | Col de la Schlucht (Navette des Crêtes im Sommer ab Munster, S) | ca. 30 min (S) | Hohneck | W, S | ca. 1250 m (S) | https://clubalpin-hautes-vosges.ffcam.fr/liens/refuges/ |
| Refuge du Grand Ventron | CAF Hautes-Vosges | Kruth/Wildenstein (TER-Endpunkt Kruth, S) | ca. 2–3 h (S) | Grand Ventron | W | ca. 1100 m (S) | https://clubalpin-hautes-vosges.ffcam.fr/liens/refuges/ |
| Chalet du Langenberg | CAF Belfort | Sewen (Bus ab Masevaux, S) | (S) | Ballon d'Alsace | W, S | (S) | https://chaletlangenberg.ffcam.fr/ |

Hinweis: In den Vogesen ist die Ortsbus-Abdeckung dünn; belastbar per Bahn erreichbar sind Metzeral (Munstertal), Kruth (Thur-Tal), Barr/Obernai. Das Portal `massif-des-vosges.fr/ou-dormir/refuges/` listet 66 Refuges (Club Vosgien, Amis de la Nature, CAF, Ski-Clubs).

### 1.3 Berner Oberland

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Doldenhornhütte | SAC Emmental (36 Pl.) | Bf Kandersteg | 2:30 | Kandersteg | W, K | 1915 m | https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs |
| Fründenhütte | SAC Altels (58 Pl.) | Bf Kandersteg → Bus/Gondel Oeschinensee | 2:45 ab Oeschinensee (T3) | Kandersteg | W, H | 2562 m | ebd. |
| Blüemlisalphütte | SAC Blümlisalp (100 Pl.) | Bf Kandersteg (Oeschinen) oder Bus Griesalp (ab Reichenbach/Kiental) | 4:00 ab Kandersteg / 4:00 ab Griesalp | Kandersteg / Kiental | W, H | 2840 m | ebd. |
| Balmhornhütte | SAC Altels (20 Pl.) | Bf Kandersteg → Bus Eggenschwand | 2:00 (T3) | Kandersteg (Gasterntal) | W, H | 1956 m | ebd. |
| Mutthornhütte (Neubau 2026) | SAC Weissenstein (60 Pl.) | Bf Kandersteg → Bus Gasterntal (Selden) | 5:00 (Gletscher, L) | Kandersteg / Petersgrat | H, S | 2787 m | ebd. |
| Lämmerenhütte | SAC Angenstein (96 Pl.) | Bf Kandersteg → Sunnbüel-Bahn / Bf Leukerbad → Gemmibahn | 1:30 ab Gemmipass (T2) | Gemmi | W, H, S | 2507 m | ebd. |
| Gspaltenhornhütte | SAC Bern (60 Pl.) | Bf Reichenbach → Bus Griesalp | 3:30 (T3) | Kiental | W, H | 2455 m | ebd. |
| Glecksteinhütte | SAC Burgdorf (88 Pl.) | Bf Grindelwald → Bus Hst. Abzweigung Gleckstein (Sommer) | 2:45 (T3), 850 Hm | Grindelwald | W, H | 2316 m | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/glecksteinhuette-sac-2147000118/ |
| Schreckhornhütte | SAC Basel (56 Pl.) | Bf Grindelwald → Pfingsteggbahn | 4:30 (T4) | Grindelwald | H | 2530 m | Wikipedia SAC-Liste |
| Berghaus Bäregg | privat (Grindelwald, kein SAC) | Bf Grindelwald → Pfingsteggbahn | ca. 1:30 | Grindelwald | W | ca. 1770 m (S) | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/berghaus-baeregg-2147436705/ |
| Naturfreundehaus Grindelwald | Naturfreunde Schweiz (50 Betten) | Bf Grindelwald | 0:15 | Grindelwald | F, W, S | 1126 m | https://naturfreunde.ch/haeuser/grindelwald/ |
| Guggihütte | SAC Interlaken (24 Pl.) | Bf Eigergletscher (Wengernalpbahn) | 2:45 (T4) | Kleine Scheidegg | H | 2791 m | Wikipedia SAC-Liste |
| Berglihütte | SAC Grindelwald (20 Pl.) | Bf Jungfraujoch | 2:30 (WS, Gletscher) | Jungfraujoch | H | 3299 m | ebd. |
| Konkordiahütte | SAC Grindelwald (155 Pl.) | Bf Jungfraujoch / Fiescheralp (Bahn ab Fiesch) | 4:15 ab Jungfraujoch / 5:30 ab Fiescheralp | Aletsch | H, S | 2850 m | ebd. |
| Rottalhütte | SAC Interlaken (28 Pl.) | Bf Lauterbrunnen → Bus Stechelberg | 5:00 (T4) | Lauterbrunnental | H | 2755 m | ebd. |
| Silberhornhütte | SAC Lauterbrunnen (10 Pl.) | Bus Stechelberg | 5:30 (T5) | Lauterbrunnental | H | 2663 m | ebd. |
| Lohnerhütte | SAC Wildstrubel (18 Pl.) | Bus Adelboden (ab Bf Frutigen) | 3:30 (T5-) | Adelboden | W (anspruchsvoll) | 2171 m | ebd. |
| Wildstrubelhütte | SAC Wildhorn (68 Pl.) | Bus Lenk / Bahn Montana (Violettes) | 6:00 ab Lenk / 1:15 ab Bergstation Montana | Lenk / Wildstrubel | H, S | 2793 m | ebd. |
| Wildhornhütte | SAC Moléson (79 Pl.) | Bf Lenk → Bus Iffigenalp (Sommer) | 3:45 ab Iffigenalp / 5:00 ab Lenk | Lenk | W, H, S | 2303 m | ebd. |
| Geltenhütte | SAC Oldenhorn (70 Pl.) | Bf Gstaad → Bus Lauenen | 3:15 (T2) | Lauenen | W | 2002 m | ebd. |
| Dossenhütte | SAC Oberaargau (51 Pl.) | Bf Meiringen → Bus Rosenlaui | 4:30 (T4) | Rosenlaui | H | 2663 m | ebd. |
| Engelhornhütte | Akademischer Alpenclub Bern (nicht SAC) | Bf Meiringen → Bus Rosenlaui | ca. 1:30–2:00 (S) | Rosenlaui | K, W | 1901 m | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/engelhornhuette-aacb-2147000088/ |
| Gaulihütte | SAC Bern (65 Pl.) | Bf Meiringen → Bus Innertkirchen | 4:30 ab Urbachtal | Haslital | W, H | 2205 m | Wikipedia SAC-Liste |
| Windegghütte | SAC Bern (41 Pl.) | Bus Innertkirchen → Hst. Nessental, Triftbahn → Bergstation Underi Trift | 1:30 (T2) | Trift / Gadmertal | W, F | 1886 m | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/windegghuette-sac-2147000295/berg-und-alpinwandern/von-der-bergstation-underi-trift-278/ |
| Trifthütte (Neubau 2026) | SAC Bern (60 Pl.) | Triftbahn Bergstation | 4:30 (T4) | Trift | H | 2417 m | Wikipedia SAC-Liste |
| Tierberglihütte | SAC Baselland (78 Pl.) | Bus Sustenpass Hst. Steingletscher (ab Meiringen) | 3:00 (T4) | Susten | H, S | 2795 m | ebd. |
| Gelmerhütte | SAC Brugg (55 Pl.) | Bus Grimsel Hst. Handegg → Gelmerbahn | 2:00 ab Bergstation | Grimsel | W, K | 2412 m | ebd. |
| Bächlitalhütte | SAC Am Albis (75 Pl.) | Bus Grimsel Hst. Räterichsboden | 2:15 (T2) | Grimsel | W, H | 2328 m | ebd. |
| Lauteraarhütte | SAC Zofingen (28 Pl.) | Bus Grimsel Hospiz | 4:15 (T2) | Grimsel | H | 2393 m | ebd. |
| Naturfreundehaus Beatenberg | Naturfreunde Schweiz | Bus Beatenberg (ab Interlaken/Thun) | (S) | Thunersee | F, W | ca. 1150 m (S) | https://naturfreunde.ch/haeuser/beatenberg/ |
| Naturfreundehaus Brünig | Naturfreunde Schweiz | Bf Brünig-Hasliberg | (S) | Brünig | F, W | ca. 960 m | https://naturfreunde.ch/haeuser/bruenig/ |

### 1.4 Zentralschweiz (Engelberg, Uri, Andermatt, Melchtal)

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Rämsenberg (Gruppenhaus, gepachtet seit 05/2025) | DAV Sektion Offenburg (33 Pl., nur DAV-Mitglieder, Selbstversorger) | Bf Altdorf → Bus Bürglen → Luftseilbahn Biel-Kinzig | ab Bergstation Biel ca. 20–45 min (S) | Schächental, Uri | W, S, F | 1634 m | https://www.dav-offenburg.de/Sektion/H%C3%BCtten/R%C3%A4msenberg |
| Rugghubelhütte | SAC Titlis (85 Pl.) | Bf Engelberg → Brunni-Bahn Ristis | 2:00–2:30 ab Ristis / 4:00 ab Engelberg | Engelberg | W, H | 2294 m | https://www.rugghubel.ch/zugang |
| Spannorthütte | SAC Uto (40 Pl.) | Bf Engelberg (oder Fürenalpbahn Talstation) | 3:00 (T3) | Engelberg | W, H, K | 1956 m | Wikipedia SAC-Liste |
| Grassenbiwak | SAC Engelberg (18 Pl.) | Bf Engelberg | 4:45 (T4) | Engelberg | H | 2647 m | ebd. |
| Sustlihütte | SAC Rossberg (67 Pl.) | Bus Sustenpass Hst. Sustenbrüggli (ab Meiringen) | 1:00 (T2) | Susten | W, K, S | 2257 m | ebd. |
| Sewenhütte | SAC Pfannenstiel (62 Pl.) | Bus Sustenpass Hst. Gorezmettlen (ab Wassen/Göschenen) | 1:30–2:00 | Meiental | W, H | 2150 m | ebd. |
| Bergseehütte | SAC Angenstein (65 Pl.) | Bf Göschenen → Bus Göscheneralp | 1:30 (T2) | Göscheneralp | W, K | 2370 m | ebd. |
| Chelenalphütte | SAC Aarau (42 Pl.) | Bus Göscheneralp | 3:00 (T2) | Göscheneralp | H | 2350 m | ebd. |
| Dammahütte | SAC Pilatus (22 Pl.) | Bus Göscheneralp (See) | 2:30–3:00 | Göscheneralp | H | 2438 m | ebd. |
| Voralphütte | SAC Uto (40 Pl.) | Bus Göscheneralp Hst. Voralpkurve | 2:30 (T2) | Göschenen | W, H | 2126 m | ebd. |
| Salbithütte | SAC Lindenberg (58 Pl.) | Bf Göschenen | 3:15 (T2) | Göschenen | K, W | 2105 m | ebd. |
| Albert-Heim-Hütte | SAC Uto (64 Pl.) | Bus Furkapass Hst. Tiefenbach (ab Andermatt/Realp) | 1:30 (T2) | Furka | W, H, S | 2542 m | ebd. |
| Rotondohütte | SAC Lägern (80 Pl.) | Bf Realp (MGB) | 3:30 (T2) | Furka/Rotondo | H, S | 2570 m | ebd. |
| Kröntenhütte | SAC Gotthard (80 Pl.) | Bf Erstfeld | 2:45 (T2) | Erstfeldertal | W, H | 1903 m | ebd. |
| Leutschachhütte | SAC Zimmerberg (60 Pl.) | Bus Intschi → Seilbahn Arnisee | 2:30 ab Arnisee | Reusstal | W | 2208 m | ebd. |
| Treschhütte | SAC Am Albis (32 Pl.) | Bf Gurtnellen | 2:30 (T2) | Fellital | W, S | 1475 m | ebd. |
| Etzlihütte | SAC Thurgau (75 Pl.) | Bf Erstfeld/Amsteg → Bus Bristen | 4:00 (T2) | Maderanertal | W, S | 2052 m | ebd. |
| Hüfihütte | SAC Pilatus (32 Pl.) | Bus Bristen | 5:00 (T2) | Maderanertal | H | 2334 m | ebd. |
| Lidernenhütte | SAC Mythen (87 Pl.) | Bus Chäppeliberg (ab Sisikon/Riemenstalden) → Seilbahn | 0:15 ab Seilbahn / 1:30 zu Fuß | Riemenstaldental | W, S, F | 1727 m | ebd. |

Melchtal/Melchsee-Frutt: Keine SAC- oder DAV-Hütte; Berggasthäuser (Tannalp, Frutt) sind privat. Melchsee-Frutt ist per Bus + Seilbahn in 5:03 erreichbar (Bergstation).

### 1.5 Glarus (Linthal, Braunwald, Elm)

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Fridolinshütte | SAC Tödi (50 Pl.) | Bf Linthal → Bus Tierfehd | 4:00 (T2) | Tödi | W, H | 2111 m | Wikipedia SAC-Liste |
| Muttseehütte | SAC Winterthur (76 Pl.) | Bus Tierfehd (ggf. Werkseilbahn Kalktrittli, S) | 2:30 (T3) | Linthal | W, H | 2501 m | ebd. |
| Claridenhütte | SAC Bachtel (74 Pl.) | Bus Urnerboden (ab Linthal) → Seilbahn Fisetengrat | 2:30 ab Fisetenpass (T3) | Klausen/Clariden | W, H, S | 2457 m | ebd. |
| Planurahütte | SAC Tödi (41 Pl.) | Bus Klausenpass | 4:15 (WS, Gletscher) | Clariden | H, S | 2947 m | ebd. |
| Glärnischhütte | SAC Tödi (90 Pl.) | Bf Glarus → Bus Klöntal | 3:30 (T3) | Glärnisch | W, H | 1990 m | ebd. |
| Leglerhütte | SAC Tödi (54 Pl.) | Bf Schwanden → Bus Kies → Seilbahn Mettmen | 2:30 ab Mettmen (T2) | Kärpf / Mettmen | W, S | 2273 m | ebd. |
| Martinsmadhütte | SAC Randen (40 Pl.) | Bf Schwanden → Bus Elm | 3:30 (T3) | Elm (Tschingelhörner) | W | 2002 m | ebd. |

Braunwald: keine SAC-Hütte, aber Ausgangspunkt für Ortstock/Bächistock-Touren; Standseilbahn ab Bf Linthal-Braunwald.

### 1.6 Graubünden (Prättigau, Davos, Arosa, Surselva, Flims)

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Carschinahütte | SAC Rätia (80 Pl.) | Bf Küblis → Bus St. Antönien Rüti | 2:45 (T2) | Rätikon (Sulzfluh) | W, K | 2236 m | Wikipedia SAC-Liste |
| Silvrettahütte | SAC St. Gallen (69 Pl.) | Bf Klosters Platz (Bus Monbiel) | 3:45 ab Klosters / 4:30 ab Monbiel | Silvretta | W, H, S | 2341 m | ebd. |
| Seetalhütte | SAC Prättigau (10 Pl.) | Bf Klosters | 3:15 (T2) | Silvretta | W | 2065 m | ebd. |
| Fergenhütte | SAC Prättigau (21 Pl.) | Bf Klosters | 2:45 (T2) | Klosters | W | 2141 m | ebd. |
| Grialetschhütte | SAC St. Gallen (58 Pl.) | Bf Davos Dorf → Bus Dürrboden | 1:30 ab Dürrboden (T2) | Dischma | W, H, S | 2542 m | ebd. |
| Kesch-Hütte | SAC Davos (92 Pl.) | Bf Bergün → Alpentaxi/Bus Chants | 2:30 ab Chants / 5:00 ab Bergün | Albula | W, H, S | 2625 m | ebd. |
| Ela-Hütte | SAC Davos (26 Pl.) | Bf Bergün | 3:15 (T2) | Albula (Piz Ela) | W | 2252 m | ebd. |
| Ramozhütte | SAC Arosa (23 Pl.) | Bf Arosa | 2:30 (T2) | Arosa | W, S | 2293 m | ebd. |
| Ringelspitzhütte | SAC Rätia (36 Pl.) | Bf Tamins/Reichenau (Bus) oder Bargis (Flims, S) | 3:45 ab Tamins / 2:15 ab Bargis | Flims / Ringelspitz | W, H | 2000 m | ebd. |
| Calandahütte | SAC Rätia (29 Pl.) | Bf Haldenstein (S-Bahn Chur) | 4:00 (T2) | Calanda | W | 2073 m | ebd. |
| Cavardirashütte | SAC Winterthur (70 Pl.) | Bf Disentis → Seilbahn Caischavedra | 1:30 ab Seilbahn (ZS Winter) / 3:30 ab Disentis | Surselva | H, S | 2649 m | ebd. |
| Medelserhütte | SAC Uto (51 Pl.) | Bf Disentis → Bus Curaglia | 3:30 (T2) | Medel | W, S | 2524 m | ebd. |
| Maighelshütte | SAC Piz Terri (83 Pl.) | Bf Oberalppass (MGB) | 1:30 (T2) | Oberalp / Rheinquelle | W, S, F | 2310 m | ebd. |
| Terrihütte | SAC Piz Terri (93 Pl.) | Bf Ilanz → Bus Vrin | 3:00 (T2) | Val Lumnezia | W | 2170 m | ebd. |
| Länta-Hütte | SAC Bodan (33 Pl.) | Bus Vals → Zervreila | 2:45 (T2) | Vals / Rheinwaldhorn | W, H | 2090 m | ebd. |
| Naturfreundehaus Brambrüesch | Naturfreunde Schweiz | Chur → Bergbahn Brambrüesch (S) | (S) | Chur / Malix | F, W | ca. 1600 m (S) | https://naturfreunde.ch/haeuser/brambrueesch/ |
| Partnerhaus Davos Clavadel | Naturfreunde Schweiz (Partnerhaus) | Bf Davos Platz → Bus Clavadel | (S) | Davos | F, W, S | 1965 m (Angabe naturfreunde.ch) | https://naturfreunde.ch/haeuser/partnerhaus-davos/ |

### 1.7 Wallis (Zermatt, Saas, Goms/Aletsch, Leukerbad, Lötschental)

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Schönbielhütte | SAC Monte Rosa (70 Pl.) | Bf Zermatt → Schwarzsee-Bahn | 2:30 ab Schwarzsee / 4:30 ab Zermatt | Zermatt | W, H | 2694 m | Wikipedia SAC-Liste |
| Monte-Rosa-Hütte | SAC Monte Rosa (120 Pl.) | Bf Zermatt → Gornergratbahn Rotenboden | 3:45 (Gletscher) | Zermatt | H, S | 2883 m | ebd. |
| Rothornhütte (Neubau 2024) | SAC Oberaargau (54 Pl.) | Bf Zermatt | 4:30 (T3+) | Zermatt | H | 3179 m | ebd. |
| Täschhütte | SAC Uto (74 Pl.) | Bf Täsch (Taxi/Bus Täschalp) | 1:30 ab Täschalp / 4:00 ab Täsch | Mattertal | W, H, S | 2701 m | ebd. |
| Domhütte | SAC Uto (75 Pl.) | Bf Randa | 4:30 (T4) | Mattertal | H | 2940 m | ebd. |
| Weisshornhütte | SAC Basel (31 Pl.) | Bf Randa | 4:30 (T2) | Mattertal | H | 2932 m | ebd. |
| Topalihütte | SAC Monte Rosa (38 Pl.) | Bf St. Niklaus | 4:30 (T2) | Mattertal | W, H | 2674 m | ebd. |
| Weissmieshütte | SAC Olten (125 Pl.) | Bus Saas-Grund → Bergbahn Kreuzboden | 0:45 ab Kreuzboden | Saastal | W, H, F | 2726 m | ebd. |
| Almagellerhütte | SAC Niesen (120 Pl.) | Bus Saas-Almagell | 3:30 (T2) | Saastal | W, H | 2894 m | ebd. |
| Britanniahütte | SAC Genf (134 Pl.) | Bus Saas-Fee → Felskinn-Bahn | ca. 1:00 ab Felskinn (S) | Saastal | H, S | 3030 m | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/?type=hut |
| Oberaletschhütte | SAC Chasseral (58 Pl.) | Bus Blatten b. Naters → Belalp-Bahn | 4:30 (T3) | Aletsch | W, H | 2640 m | Wikipedia SAC-Liste |
| Binntalhütte | SAC Delémont (50 Pl.) | Bf Fiesch → Bus Binn/Fäld | 3:00 (T2) | Binntal | W, S | 2267 m | ebd. |
| Hollandiahütte | SAC Bern (86 Pl.) | Bus Fafleralp (ab Bf Goppenstein, Lötschental) | 7:00 ab Fafleralp (Gletscher) | Lötschenlücke | H, S | 3238 m | ebd. |
| Baltschiederklause | SAC Blümlisalp (50 Pl.) | Bf Ausserberg | 6:30 (T2) | Baltschiedertal | W, H | 2783 m | ebd. |
| Lämmerenhütte (siehe 1.3) | SAC Angenstein | Bf Leukerbad (Bus ab Leuk) → Gemmibahn | 1:30 | Gemmi | W, H, S | 2507 m | ebd. |

Arolla (Bertol-, Vignettes-, Dixhütte) liegt mit 6:21 außerhalb des 5-h-Radius und wird nicht gelistet.

### 1.8 Tessin (Airolo, Bedretto, Piora)

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Pianseccohütte | SAC Bellinzona e Valli (46 Pl.) | Bf Airolo → Bus Bedretto Hst. All'Acqua | 1:00 (T2) | Val Bedretto | W, S, F | 1988 m | Wikipedia SAC-Liste |
| Corno-Gries-Hütte | SAC Rossberg (46 Pl.) | Bus Nufenenpass Hst. Alp Corno (Sommer) | 1:00 (T3) | Nufenen | W, H | 2338 m | ebd. |
| Cristallinahütte | SAC Tessin (120 Pl.) | Bus Bedretto Hst. Ossasco | 3:45 (T2) | Bedretto / Cristallina | W, H, S | 2575 m | ebd. |
| Cadlimohütte | SAC Uto (76 Pl.) | Bf Oberalppass (3:15) oder Bf Piotta → Ritom-Bahn (Val Piora, 5:00) | 3:15 / 5:00 | Piora / Lukmanier | W, S | 2570 m | ebd. |
| Capanna Campo Tencia | SAC Tessin (60 Pl.) | Bf Faido → Bus Dalpe | 3:30 (T3-) | Leventina | W, H | 2140 m | ebd. |

### 1.9 Appenzell / Alpstein

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Hundsteinhütte | SAC Säntis (42 Pl.) | Bf Weissbad/Appenzell → Bus Brülisau (oder Staubernbahn ab Frümsen) | 2:45 ab Brülisau (T2) / 1:45 ab Staubern | Alpstein (Fälensee) | W, K, F | 1554 m | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/hundsteinhuette-sac-2147000138/ |
| Zwinglipasshütte | SAC Toggenburg | Bus Wildhaus (ab Bf Nesslau/Buchs) | ca. 3:00 (S) | Alpstein (Altmann) | W, K | ca. 1990 m (S) | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/zwinglipasshuette-2147000300/ |

Der Alpstein hat sonst vor allem private Berggasthäuser (Meglisalp, Äscher, Bollenwees, Säntis) – gute ÖV-Anbindung via Wasserauen (Ebenalpbahn) und Brülisau.

### 1.10 Jura

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Jurahaus / Cabane du Jura | SAC Biel/Bienne (35 Betten, Wochenenden) | Bus Les Prés-d'Orvin (ab Bf Biel) | ca. 1:00 (S) | Chasseral | W, S (Langlauf) | ca. 1300 m (S) | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/jurahaus-2147469225/ |
| Clubhaus Backi | SAC Weissenstein | Bf Lommiswil / Bus (S) | ca. 1:30 (S) | Hasenmatt / Weissenstein | W | (S) | https://www.sac-weissenstein.ch/H%C3%BCtten.html |
| Naturfreundehaus La Combe d'Enges | Naturfreunde Schweiz | Chaumont (Standseilbahn ab Neuchâtel, S) | (S) | Chaumont NE | F, W | 1113 m | https://naturfreunde.ch/haeuser/la-combe-denges/ |
| Naturfreundehaus Bellevue | Naturfreunde Schweiz | Bf Tavannes | (S) | Berner Jura | F, W | (S) | https://naturfreunde.ch/haeuser/bellevue/ |

### 1.11 Vorarlberg (Montafon, Rätikon, Silvretta, Bregenzerwald, Kleinwalsertal, Lechquellen)

Reisezeit-Vorbehalt: Bregenz 4:24, Dornbirn 5:09, Bludenz/Schruns realistisch ~5–5,5 h (S), Bezau 5:43, Lech ~6 h (S). Die meisten Hütten hier sind Grenzfälle für den 5-h-Radius.

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Madrisahütte | DAV Sektion Karlsruhe (20 Lager) | Bf Schruns → Landbus 670 Gargellen (Schafbergbahn) | 1:00 | Rätikon / Gargellen | W, S | 1660 m | https://www.alpenverein-karlsruhe.de/huetten/madrisahuette/standort |
| Tilisunahütte | ÖAV Sektion Vorarlberg (155 Pl.) | Bf Schruns → Bus 601/670 (Tschagguns/Latschau) | ca. 3:00 (S) | Rätikon | W, K | 2211 m | https://www.vmobil.at/de/ueber-vmobil/wir-sind-vmobil-mobilitaetspartner/energieinstitut-vorarlberg/oeffentliche-anreise-zu-den-huetten-des-alpenverein-vorarlberg |
| Lindauer Hütte | DAV Sektion Lindau (160 Pl.) | Bf Schruns → Bus Latschau/Golmerbahn (S) | ca. 2:00 (S) | Rätikon (Drei Türme) | W, K | 1744 m | Wikipedia DAV-Liste |
| Heinrich-Hueter-Hütte | ÖAV Vorarlberg (92 Pl.) | Bf Vandans/Bludenz → Rellstal-Wanderbus (Bus 580) | ca. 1:15 (S) | Rätikon (Zimba) | W, K | 1766 m | vmobil.at (s. o.) |
| Totalphütte | ÖAV Vorarlberg (34 Pl.) | Bf Bludenz → Bus 580 Brand → Lünerseebahn | ca. 1:30 ab Lünersee (S) | Rätikon (Schesaplana) | W, H | 2385 m | vmobil.at (s. o.) |
| Douglasshütte | ÖAV Vorarlberg | Bus 580 → Lünerseebahn Bergstation | ca. 0:05 (S) | Rätikon (Lünersee) | W, F | 1979 m | Wikipedia ÖAV-Liste |
| Sarotlahütte | ÖAV Vorarlberg (44 Pl.) | Bf Bludenz → Bus 580 Brand | ca. 2:00 (S) | Rätikon | W | 1611 m | vmobil.at (s. o.) |
| Mannheimer Hütte | DAV Sektion Mannheim (184 Pl.) | Lünerseebahn Bergstation | ca. 3:00 (S) | Rätikon (Schesaplana) | H, W | 2679 m | Wikipedia DAV-Liste |
| Oberzalimhütte | DAV Sektion Mannheim (28 Pl.) | Bus 580 Brand | ca. 2:00 (S) | Rätikon | W | 1889 m | Wikipedia DAV-Liste |
| Saarbrücker Hütte | DAV Sektion ASS Saarbrücken (89 Pl.) | Bf Schruns → Bus 85 Bielerhöhe | ca. 1:30 (S) | Silvretta | W, H, S | 2538 m | https://www.alpenverein.de/artikel/huetten-mit-bahn-anreise_44a4563e-7782-4e99-bf0a-61f283766eea |
| Wiesbadener Hütte | DAV Sektion Wiesbaden (200 Pl.) | Bus 85 Bielerhöhe | ca. 2:00 (S) | Silvretta (Piz Buin) | H, S | 2443 m | Wikipedia DAV-Liste |
| Tübinger Hütte | DAV Sektion Tübingen (119 Pl.) | Bus Gaschurn/Partenen (S) | ca. 3:30–4:00 (S) | Silvretta | W, H | 2191 m | Wikipedia DAV-Liste |
| Neue Heilbronner Hütte | DAV Sektion Heilbronn (108 Pl.) | Bus Partenen → Zeinisjoch (Sommerbus, S) | ca. 2:00–2:30 (S) | Verwall | W | 2320 m | Wikipedia DAV-Liste |
| Wormser Hütte | DAV Sektion Worms (58 Pl.) | Bf Schruns → Hochjochbahn | ca. 1:00 ab Bergstation (S) | Verwall | W, S | 2305 m | Wikipedia DAV-Liste |
| Freschenhaus | ÖAV Vorarlberg (50 Pl.) | Bf Rankweil → Bus 495 Laterns + Wanderbus | ca. 2:00 (S) | Bregenzerwaldgebirge | W | 1846 m | vmobil.at (s. o.) |
| Frassenhütte | ÖAV Vorarlberg (60 Pl.) | Bf Bludenz → Bus 501 → Muttersbergbahn | ca. 1:15 (S) | Lechquellengebirge | W | 1725 m | vmobil.at (s. o.) |
| Lustenauer Hütte | ÖAV Vorarlberg, Bezirk Lustenau (16 Pl.) | Bf Dornbirn → Bus 870 Schwarzenberg | ca. 1:30 (S) | Bregenzerwald | W, F | 1250 m | vmobil.at (s. o.) |
| Freiburger Hütte | DAV Sektion Freiburg-Breisgau (140 Pl.) | Bf Langen a. A./Bludenz → Bus Lech → Wanderbus Formarinalpe (stündlich, Sommer) | 0:30 ab Formarinalpe | Lechquellengebirge (Rote Wand) | W, K, F | 1931 m | https://www.freiburger-huette.at/anreise |
| Ravensburger Hütte | DAV Sektion Ravensburg (121 Pl.) | Bus Lech Rüfiplatz → Wanderbus 706 Spullersee (Mitte Juni–Anfang Okt.) | ca. 0:45 ab Spullersee (S) | Lechquellengebirge | W | 1948 m | https://www.ravensburgerhuette.at/die-berghuette/anreise/oeffentlichen-verkehrsmitteln/wanderbus-spullersee/ |
| Göppinger Hütte | DAV Sektion Hohenstaufen Göppingen (64 Pl.) | Bus Lech → Zug (S) | ca. 3:00 (S) | Lechquellengebirge | W | 2245 m | Wikipedia DAV-Liste |
| Biberacher Hütte | DAV Sektion Biberach (90 Pl.) | Bus Schröcken/Schoppernau bzw. Buchboden (S) | ca. 3:00 (S) | Lechquellengebirge | W | 1846 m | Wikipedia DAV-Liste |
| Schwarzwasserhütte | DAV Sektion Schwaben (70 Pl.) | Bf Oberstdorf → Walserbus Riezlern → Auenhütte/Ifenbahn | ca. 1:15 (S) | Kleinwalsertal (Ifen) | W, S | 1620 m | Wikipedia DAV-Liste; https://www.dav-offenburg.de/artikel/Frauentour-der-Ortsgruppe-Nordrach-des-DAV-Sektion-Offenburg-zur-Schwarzwasserhuette/83119 |
| Hütte Au | DAV Sektion Überlingen (62 Pl.) | Bus Au im Bregenzerwald (ab Bezau/Dornbirn, S) | ca. 15 min (S) | Bregenzerwald | F, W, S | 800 m | Wikipedia DAV-Liste |

### 1.12 Arlberg / Verwall / Lechtaler Alpen

Reisezeit-Vorbehalt: St. Anton 5:14 (schnellste), Landeck 7:42 (Abfrage via Zürich) – das Lechtal (Reutte, Elbigenalp) und Paznaun (Galtür, Ischgl) liegen deutlich über 5 h.

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Konstanzer Hütte | DAV Sektion Konstanz (67 Pl.) | Bf St. Anton a. A. → Gratis-Bus 6 Verwall/Salzhüttle (Sommer) | 1:30 ab Salzhüttle / 3:00 ab St. Anton | Verwall | W, F | 1688 m | https://www.stantonamarlberg.com/en/summer/mountain-region/mountain-huts/huette-detailseite/-addresses/konstanzer-huette |
| Darmstädter Hütte | DAV Sektion Darmstadt-Starkenburg (69 Pl.) | Bf St. Anton a. A. (Rendlbahn) | 3:30 ab Bahnhof / 2:00–2:30 ab Rendlbahn | Verwall | W, H, K | 2384 m | https://www.alpenvereinaktiv.com/de/tour/zustieg-darmstaedter-huette-von-st.-anton/14490191/ |
| Ulmer Hütte | DAV Sektion Ulm (52 Pl.) | Bf St. Anton → Galzigbahn oder Bus Alpe Rauz | ca. 1:00 ab Galzig/Rauz (S) | Lechtaler Alpen (Valluga) | W, S | 2288 m | https://www.stantonamarlberg.com/de/sommer/bergregion/huettenverzeichnis/-addresses/ulmer-huette-0 |
| Leutkircher Hütte | DAV Sektion Leutkirch (58 Pl.) | Bf St. Anton | ca. 3:00 (S) | Lechtaler Alpen | W | 2251 m | Wikipedia DAV-Liste |
| Kaiserjochhaus | DAV Sektion Leutkirch (60 Pl.) | Bf St. Anton / Pettneu (Bus) | ca. 3:30 (S) | Lechtaler Alpen | W | 2310 m | Wikipedia DAV-Liste |
| Stuttgarter Hütte | DAV Sektion Schwaben (56 Pl.) | Bus Zürs (ab St. Anton/Langen) | ca. 2:30 (S) | Lechtaler Alpen | W | 2310 m | Wikipedia DAV-Liste |
| Kaltenberghütte | DAV Sektion Reutlingen (71 Pl.) | Bf Langen a. A. / Bus Stuben | ca. 2:30 (S) | Verwall | W, S | 2089 m | Wikipedia DAV-Liste |
| Edmund-Graf-Hütte | ÖAV Touristenklub Innsbruck (91 Pl.) | Bus Pettneu (ab St. Anton) | ca. 3:30 (S) | Verwall (Hoher Riffler) | W, H | 2408 m | Wikipedia ÖAV-Liste |

### 1.13 Allgäu (Oberstdorf, Hindelang, Kleinwalsertal)

Reisezeit: Oberstdorf 4:43 (schnellste), Hindelang/Hinterstein ca. 5:00 (S).

| Hütte | Betreiber | Talbahnhof / Bushaltestelle | Zustieg | Region | Typ | Höhe | Quelle |
|---|---|---|---|---|---|---|---|
| Kemptner Hütte | DAV Sektion Allgäu-Kempten (290 Pl.) | Bf Oberstdorf → Bus/Shuttle Spielmannsau | 3:00 ab Spielmannsau | Allgäuer Alpen (E5) | W | 1844 m | https://www.kemptner-huette.de/anreise-kontakt |
| Rappenseehütte | DAV Sektion Allgäu-Kempten (304 Pl.) | Bf Oberstdorf → Bus Birgsau | 3:00–4:00 ab Birgsau | Allgäuer Alpen (Heilbronner Weg) | W, H | 2091 m | https://www.alpenvereinaktiv.com/de/tour/zustieg-rappenseehuette-von-birgsau/26246567/ |
| Waltenbergerhaus | DAV Sektion Allgäu-Immenstadt (71 Pl.) | Bus Birgsau/Einödsbach | ca. 3:30 (S) | Allgäuer Alpen | W, H | 2085 m | Wikipedia DAV-Liste |
| Edmund-Probst-Haus | DAV Sektion Allgäu-Immenstadt (108 Pl.) | Bf Oberstdorf → Nebelhornbahn Höfatsblick | ca. 0:10 (S) | Nebelhorn | W, F, S | 1930 m | Wikipedia DAV-Liste |
| Fiderepasshütte | DAV Sektion Oberstdorf (120 Pl.) | Bf Oberstdorf → Fellhornbahn / Walserbus Mittelberg | ca. 2:30 (S) | Allgäuer Alpen | W | 2067 m | Wikipedia DAV-Liste |
| Mindelheimer Hütte | DAV Sektion Mindelheim (120 Pl.) | Bf Oberstdorf → Walserbus Mittelberg/Baad | ca. 3:00 (S) | Allgäuer Alpen | W | 2013 m | Wikipedia DAV-Liste |
| Prinz-Luitpold-Haus | DAV Sektion Allgäu-Immenstadt (280 Pl.) | Bus Hinterstein → Wanderbus Giebelhaus | ca. 2:30 ab Giebelhaus | Allgäuer Alpen (Hochvogel) | W, H | 1846 m | https://www.hoehenrausch.de/huetten/prinz-luitpold-haus/ |
| Schwarzenberghütte | DAV Sektion Illertissen (59 Betten) | Bus Hinterstein (ab Bf Sonthofen) | ca. 1:00 (S) | Allgäuer Alpen | W, F, S | 1380 m | Wikipedia DAV-Liste |
| Staufner Haus | DAV Sektion Oberstaufen-Lindenberg (86 Pl.) | Bf Oberstaufen → Bus Hochgratbahn | ca. 0:30 ab Bergstation (S) | Nagelfluhkette | W, S | 1634 m | Wikipedia DAV-Liste |
| Kaufbeurer Haus | DAV Sektion Allgäu-Immenstadt (50 Pl.) | Bus Hinterstein / Giebelhaus (S) | ca. 3:00 (S) | Allgäuer Alpen | W | 2007 m | Wikipedia DAV-Liste |

---

## 2. Datenquellen und APIs für Hüttendaten

### 2.1 DAV / ÖAV / AVS (Outdooractive-Plattform)

- **Wo liegen die Daten?** Die Hüttendatenbank von DAV, ÖAV und AVS wird zentral in der Outdooractive-Plattform gepflegt (Sektionen pflegen ihre Hütte dort bzw. über das DAV-Hüttenportal ein). Öffentlich sichtbar auf `alpenvereinaktiv.com/de/huetten/`; die „Hüttensuche" auf `alpenverein.de` ist seit dem Relaunch nur ein Link dorthin, technisch über die Outdooractive **FlexView API** eingebettet (Quelle: https://corporate.outdooractive.com/oa-blog/outdooractive-flexview-api-fur-die-neue-dav-huttensuche).
- **Outdooractive Data API** (`developers.outdooractive.com`): REST, XML/JSON, Zugriff nur mit API-Key/Projekt (kommerzielle Vereinbarung mit Outdooractive). Objekte sind „OOI" (POI/Tour/Region); Hütten sind POIs der Kategorie *hut* mit Feldern u. a. `elevation`, `landlord` (Adresse), `accessibleByCar`, `accessibleByCableway`, `HutNeedsKey`. Die Felder `publicTransit`, `gettingThere`, `parking` existieren nur bei **Touren**, nicht bei Hütten (Quelle: https://developers.outdooractive.com/API-Reference/Data-Model.v1.html). Ein boolesches ÖV-Attribut für Hütten wurde im Datenmodell nicht gefunden.
- **Lizenz:** Auf einer Projektseite der Open Tourism Data Hackdays heißt es, Outdooractive-Daten für Touren, POIs und Bedingungen seien über die Data API „unter CC-BY-4.0 als Open Data" zugänglich (https://hack.opendata.ch/project/117). Das bezieht sich mutmaßlich auf ein Hackathon-Kontingent; die Entwicklerseiten selbst nennen nur „Terms and conditions". Die Alpenvereins-Hüttendaten sind formal keine offenen Daten; für eine Weiterverwendung ist eine Vereinbarung mit DAV-Bundesverband bzw. Outdooractive nötig. **Einschätzung: lizenzpflichtig / verhandlungsbedürftig.**
- **Alternativen ohne Lizenz:** Wikipedia „Liste der Hütten des Deutschen Alpenvereins" (344 Hüttenzeilen mit Name, Sektion, Höhe, Schlafplätze, Gebirgsgruppe; CC BY-SA) und „Liste der Hütten des Österreichischen Alpenvereins"; Wikidata (siehe 2.5).
- **Hut Reservation** (`hut-reservation.org`, seit Winter 2024/25, gemeinsam von DAV/ÖAV/SAC/AVS, >500 Hütten, ~1,5 Mio Reservierungen/Jahr): keine öffentliche API dokumentiert. Verfügbarkeiten fließen automatisch an Outdooractive („Last-Minute-Hüttenbett").

### 2.2 SAC

- **SAC-Tourenportal** (`sac-cas.ch/de/huetten-und-touren/sac-tourenportal/?type=hut`): TYPO3-Frontend, Daten aus einem Backend `https://www.suissealpine.sac-cas.ch/api/1` (im Quelltext referenziert; geratene Pfade wie `/hut`, `/huts`, `/search` liefern 404 – **undokumentierte, nicht öffentliche API**). Hüttenstammdaten (Höhe, Sektion, Schlafplätze, Schutzraum, Telefon, Bewartungskalender, Dienstleistungen) sind frei einsehbar; Routenbeschreibungen sind Teil des kostenpflichtigen Tourenportal-Abos. Ablösung ab Frühjahr 2028 durch die Plattform „Ridian" (Ubique).
- **SAC-Hüttenportal** (`huettenportal.sac-cas.ch`): Login-Portal für Hüttenwarte/Sektionen (Datenpflege), keine offene Schnittstelle.
- **Open Data:** Kein Datensatz auf `opendata.swiss` oder `data.geo.admin.ch` mit SAC-Hüttenstammdaten gefunden. Geocat führt nur eine BFS-Statistik „SAC-Hütten: Logiernächte nach Mitgliederkategorie". SAC-Hütten sind in swisstopo-Kartenlayern enthalten (Basiskarte), aber nicht als eigener Fachdatensatz abrufbar.
- **Freie Sekundärquelle:** Wikipedia „Liste der Hütten des Schweizer Alpen-Clubs" (152 Hütten; Spalten Sektion, Kanton, Höhe, Bewartung nach Monat, Kapazität, **Ausgangspunkt(e), Aufstiegszeit, Höhenunterschied, SAC-Grad** – Zeiten aus dem Tourenportal übernommen; Stand Juni 2026, CC BY-SA). Diese Liste ist die beste maschinell auswertbare, freie Grundlage für den SAC-Teil (Rohtext über `?action=raw` parsebar; für diese Recherche so gemacht).

### 2.3 OpenStreetMap (ODbL)

Eigene Overpass-Auswertung (06.09.2026), Bounding Box 45,5–48,5° N / 5,5–11,5° E (Vogesen, Schwarzwald, Schweiz, Vorarlberg, Allgäu, Tirol West):

| Kennzahl | Wert |
|---|---|
| Objekte `tourism=alpine_hut` | 2043 |
| davon mit `operator` | 881 (43 %) |
| davon mit `ele` | 1443 (71 %) |
| davon mit `capacity` | 560 (27 %) |
| davon mit `website` | 1045 |
| davon mit `wikidata` | 721 |
| `operator` ≈ DAV/Alpenverein | 116 |
| `operator` ≈ SAC/CAS | 180 |
| `operator` ≈ Naturfreunde/Amis de la Nature | 12 |
| `operator:wikidata` | 4 |

Die Schreibweise des Betreibers ist uneinheitlich: „SAC - CAS" (78), „SAC" (15), „CAS" (5), „Club Alpin Suisse" (3), „SAC Sektion Tödi", „DAV" (9), „DAV Sektion München" (5), „Sektion Vorarlberg" (6), „Österreichischer Alpenverein Sektion Vorarlberg" (2) usw. Ein Matching auf Verband/Sektion braucht also eine Normalisierung (Regex) oder besser `operator:wikidata`, das praktisch nicht gepflegt ist.

ÖV-Nähe in OSM: In der engeren Schweizer-Alpen-Box (46,0–47,8° N / 6,5–10,6° E) liegen 154 von 1054 Hütten (15 %) innerhalb von 300 m einer Bushaltestelle, eines Bahnhofs oder einer Seilbahnstation. Das ist ein brauchbarer Proxy für „Hütte direkt an ÖV", ersetzt aber nicht die Zustiegsberechnung vom Talort.

Wiki-Tagging-Empfehlung für `tourism=alpine_hut`: `name`, `operator`, `ele`, `capacity`, `reservation`, `access`, `opening_hours`, `winter_room`, `phone`, `website` (https://wiki.openstreetmap.org/wiki/DE:Tag:tourism=alpine_hut). Ein ÖV-Tag für Hütten gibt es nicht; ÖV-Erreichbarkeit muss aus Haltestellen (`highway=bus_stop`, `railway=station`, `aerialway=station`) und Wegenetz berechnet werden.

### 2.4 Naturfreunde

- **Deutschland:** `naturfreunde.de/haus/...` (Einzelseiten je Haus; Baden: 68 Häuser, Schwarzwald ca. 20). Keine API; Adressen/Höhen im HTML. Kein ÖV-Feld, nur Freitext.
- **Schweiz:** `naturfreunde.ch/haeuser/` (61 Häuser inkl. Partnerhäuser, gedrucktes „Häuserverzeichnis 2025"). Freitext-Anreise („15 Min. ab Bahnhof").
- **Österreich:** „Hüttenatlas *Umsteigen vorm Aufsteigen*" (94 Naturfreunde-Hütten mit ÖV-Anreise, PDF: https://www.naturfreunde.at/files/pdfs/NFI_Huettenatlas_Zweite_Auflage_Medium.pdf) und `huetteninfos.naturfreunde.at`. Das ist die einzige gefundene Verbandspublikation, die Hütten explizit nach ÖV-Erreichbarkeit kuratiert – aber als Broschüre, nicht als Datensatz.
- **Frankreich (Vogesen):** Amis de la Nature (`amis-nature.org`), Flyer der elsässischen Häuser bei naturfreunde.de, Portal `massif-des-vosges.fr/ou-dormir/refuges/` (66 Refuges aller Träger).

### 2.5 Wikidata (CC0)

SPARQL-Zählung (06.09.2026), Objekte mit `P31/P279* = Q182676 (Schutzhütte)`:

| Land | Hütten | mit `P127` (Eigentümer/Sektion) | mit Koordinaten |
|---|---|---|---|
| Schweiz | 312 | 150 | 312 |
| Deutschland | 316 | 108 | 313 |
| Österreich | 625 | 390 | 624 |
| Frankreich | 288 | 142 | 284 |

Wikidata eignet sich als lizenzfreies Rückgrat (ID, Koordinaten, Höhe, Sektion als verlinkte Entität, Wikipedia-/OSM-Verknüpfung), ist aber unvollständig (SAC: 152 offizielle Hütten vs. 150 mit Eigentümer).

### 2.6 ÖV-Fahrplandaten für die Zustiegsberechnung

- Schweiz: `transport.opendata.ch` (frei, ohne Key; für diese Recherche genutzt) und GTFS/HRDF auf `opentransportdata.swiss`. Das SBB-Routing deckt auch Offenburg–Basel ab, aber nicht zuverlässig DB-Binnenziele (Oberstdorf) oder österreichische Regionalbusse.
- Deutschland: DELFI-GTFS (Deutschlandweit), bwegt/NVBW für Baden-Württemberg.
- Österreich: VAO/ÖBB-GTFS; Vorarlberg über VMOBIL.
- Prior Art: **Zuugle** des Vereins *Bahn zum Berg* (https://github.com/bahnzumberg, Open Source) berechnet automatisiert die ÖV-Erreichbarkeit tausender Touren im gesamten Alpenraum (AT, Bayern, CH, FR, IT, SI) und ist die technisch nächstliegende Referenzimplementierung für genau dieses Projekt.

---

## 3. Bestehende ÖV-Attribute in den Hüttenportalen

| Portal | ÖV-Attribut auf Hüttenebene | Was existiert stattdessen |
|---|---|---|
| **alpenvereinaktiv.com / DAV-Hüttensuche** | **Kein boolesches Feld** „mit ÖV erreichbar" für Hütten gefunden. Hütten-Filtergruppe „Erreichbarkeit" bezieht sich auf `accessibleByCar` / `accessibleByCableway` (Auto, Bergbahn). | Freitextblock „Anreise → Öffentliche Verkehrsmittel" je Hütte (z. B. Freiburger Hütte: „Anreise per Zug/Bahnhof: Bludenz oder Langen/Arlberg. Anreise per Bus / Bushaltestelle: Lech a. Arlberg, Wanderbus zur Formarinalpe"). Für **Touren** gibt es die Checkbox „mit Bahn und Bus erreichbar" und den Reiter „Mit Öffis zum Berg" (Sammlungen). Zustiegstouren zu Hütten tragen dieses Tour-Attribut, sodass indirekt „Hütte hat ÖV-Zustieg" ableitbar ist. |
| **ÖAV Hüttenfinder (alpenverein.at)** | Kein Filter gefunden; Seite aus der Recherche-Umgebung nicht erreichbar (ECONNREFUSED), Aussage stützt sich auf Suchergebnisse. | Projekt „Mit Bus und Bahn zu Alpenvereinshütten" (2017, VCÖ-Preis): kuratierte Listen auf alpenvereinaktiv/outdooractive – aber nur Ost-/Zentralösterreich, **nicht Vorarlberg/Tirol-West**. ÖAV Vorarlberg + Energieinstitut/VMOBIL: eigene Liste mit Buslinien für 7 Hütten (Tilisuna, Totalp, Sarotla, Heinrich-Hueter, Freschen, Frassen, Lustenauer). |
| **SAC-Tourenportal** | Kein Hüttenfeld „ÖV". | Jede **Route** hat einen strukturierten **Ausgangspunkt mit ÖV-Haltestelle** (z. B. „Abzw. Gleckstein (Grindelwald) 1557 m – Busbetrieb im Sommerhalbjahr"), verlinkt direkt auf den SBB-Fahrplan; Kartenlayer „ÖV-Haltestellen" in Portal und App. Damit ist die ÖV-Zuordnung beim SAC faktisch vollständig, aber nur über Routen und im Abo-Bereich. Die Wikipedia-Liste übernimmt Ausgangspunkt + Aufstiegszeit. |
| **Hut Reservation** | nein | Nur Reservierung. |
| **Naturfreunde** | nein (Freitext) | AT: Hüttenatlas als Broschüre. |
| **OSM** | kein Tag | Berechnung über Haltestellen-Nähe/Routing (siehe 2.3). |
| **Wikidata** | nein | – |

Fazit: **Kein Verband führt ein maschinenlesbares Hüttenattribut „ÖV-erreichbar".** Am nächsten kommen (a) das Tour-Attribut „mit Bahn und Bus erreichbar" bei Outdooractive/alpenvereinaktiv (manuell vom Autor gesetzt, Pflegequalität unklar) und (b) der strukturierte ÖV-Ausgangspunkt jeder SAC-Route. Ein eigener Datensatz „Hütte → Talhaltestelle → Gehzeit" muss daher aus Wikipedia-Listen, OSM-Routing und Fahrplandaten aufgebaut oder mit dem DAV-Bundesverband (Outdooractive-Zugang) vereinbart werden.

---

## 4. Unsicherheiten

1. **Reisezeiten**: Einzelabfrage an einem Freitag ab 07:00 über die SBB-API; Wochenend-, Winter- und Saisonfahrpläne (Wanderbusse, Passbusse Susten/Grimsel/Furka/Nufenen nur Sommer) weichen ab. Deutsche und österreichische Binnenziele (Oberstdorf, St. Anton, Bludenz, Schruns, Lech) wurden nur über Trainline-Angaben bzw. Schätzung abgedeckt; Bludenz (5:58) wirkt durch Routing via Zürich zu pessimistisch.
2. **Gehzeiten mit (S)**: bei DAV/ÖAV-Hütten in Vorarlberg, Arlberg und Allgäu überwiegend Schätzungen aus Gebietskenntnis; SAC-Zeiten sind Tourenportal-Werte, aber teils bezogen auf den *nächstgelegenen* Ausgangspunkt (z. B. Bergstation), nicht auf den Talbahnhof.
3. **Vollständigkeit**: Die Tabelle enthält ~110 Einträge, aber keine Naturfreundehäuser in Vorarlberg/Tirol, nur eine Auswahl Vogesen-Refuges (Club-Vosgien-Hütten fehlen) und keine privaten Berggasthäuser. Sektionen Lahr und Kehl: keine Hütte gefunden, aber Websites nicht vollständig geprüft.
4. **Höhen (S)** einzelner Naturfreunde-/AN-Häuser sowie Jurahaus/Zwinglipasshütte sind aus Karten geschätzt.
5. **Outdooractive-Lizenz**: Die CC-BY-4.0-Aussage stammt von einer Hackathon-Projektseite; ob sie für Alpenvereins-Hüttendaten gilt, ist unbestätigt. Rechte an den Hüttendaten liegen bei DAV/ÖAV/AVS; Outdooractive ist Dienstleister.
6. **SAC-API** `suissealpine.sac-cas.ch/api/1`: Existenz belegt (Quelltext), Endpunkte unbekannt; Nutzung ohne Absprache wäre Scraping. Ablösung durch „Ridian" 2028 macht Integrationen kurzlebig.
7. **alpenverein.at** war aus der Recherche-Umgebung nicht abrufbar (Verbindungsabbruch); Aussagen zum ÖAV-Hüttenfinder beruhen auf Suchmaschinen-Snippets.
8. **OSM-Zählungen** sind Momentaufnahmen (06.09.2026) und Bounding-Box-basiert; Vogesen/Schwarzwald enthalten in OSM teils Wanderheime als `alpine_hut`, teils als `tourism=hostel`/`guest_house`, was die Abdeckung unterschätzt.
9. **Rämsenberg**: Zustieg von der Seilbahn-Bergstation Biel zum Haus nicht belegt (Sektionsseite nennt nur „Bus zur Talstation der Luftseilbahn Biel-Kinzig").

---

## Quellen (Auswahl)

- DAV Offenburg Hütten: https://www.dav-offenburg.de/Sektion/H%C3%BCtten ; Rämsenberg: https://www.dav-offenburg.de/Sektion/H%C3%BCtten/R%C3%A4msenberg ; Sandkästle: https://www.dav-offenburg.de/Sektion/H%C3%BCtten/Sandk%C3%A4stle ; Presse: https://www.badische-zeitung.de/tipp-eines-mitglieds-bringt-die-wende-alpenverein-offenburg-bekommt-wieder-eine-huette-in-der-schwei
- DAV Freiburg: https://www.dav-freiburg.de/de/huette/index.php ; Freiburger Hütte Anreise: https://www.freiburger-huette.at/anreise
- DAV Karlsruhe: https://www.alpenverein-karlsruhe.de/huetten
- Wikipedia SAC-Liste: https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs
- Wikipedia DAV-Liste: https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Deutschen_Alpenvereins
- Wikipedia ÖAV-Liste: https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_%C3%96sterreichischen_Alpenvereins
- SAC Tourenportal Hüttensuche: https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/?type=hut ; ÖV im Tourenportal: https://www.sac-cas.ch/de/die-alpen/mit-dem-tourenportal-und-dem-oev-in-den-schnee-35493/ ; Ridian-Ablösung: https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal-abonnement/
- alpenvereinaktiv Hütten: https://www.alpenvereinaktiv.com/de/huetten/ ; ÖV-Filter Touren: https://www.alpenverein.de/artikel/tourenplanung-alpenvereinaktiv-oeffentliche-anreise_a21d0d03-eb49-467d-b6b7-2d0bc7663124 ; Hütten mit Bahnanreise: https://www.alpenverein.de/artikel/huetten-mit-bahn-anreise_44a4563e-7782-4e99-bf0a-61f283766eea
- Outdooractive Data Model: https://developers.outdooractive.com/API-Reference/Data-Model.v1.html ; FlexView/DAV: https://corporate.outdooractive.com/oa-blog/outdooractive-flexview-api-fur-die-neue-dav-huttensuche ; Hackdays CC-BY-Hinweis: https://hack.opendata.ch/project/117
- ÖAV „Mit Bus und Bahn zu Alpenvereinshütten": https://www.alpenverein.at/portal/natur-umwelt/sanfte_mobilitaet/Bundeslaender/umweltfreundliche-reise-in-die-berge-bundesweit.php ; VCÖ: https://mobilitaetsprojekte.vcoe.at/mit-bus-und-bahn-zu-alpenvereinshtten-2017 ; Vorarlberg/VMOBIL: https://www.vmobil.at/de/ueber-vmobil/wir-sind-vmobil-mobilitaetspartner/energieinstitut-vorarlberg/oeffentliche-anreise-zu-den-huetten-des-alpenverein-vorarlberg
- Hut Reservation: https://www.alpenverein.de/artikel/onlinereservierungssystem-der-alpenvereinshutten_c060cfdc-a751-43ae-adc2-0d3e3e640bda
- OSM Wiki: https://wiki.openstreetmap.org/wiki/DE:Tag:tourism=alpine_hut ; Overpass-Zählungen: eigene Abfragen 06.09.2026
- Wikidata SPARQL: eigene Abfrage 06.09.2026 (query.wikidata.org)
- Naturfreunde: https://www.naturfreunde.de/access-gsg-arten/suedschwarzwald ; https://www.naturfreunde.de/access-gsg-arten/schwarzwald-mittenord ; https://naturfreunde.ch/haeuser/ ; https://www.naturfreunde.at/files/pdfs/NFI_Huettenatlas_Zweite_Auflage_Medium.pdf ; Vogesen: https://www.naturfreunde.de/naturfreundehaeuser-den-vogesen-f
- Vogesen CAF: https://clubalpin-hautes-vosges.ffcam.fr/liens/refuges/ ; Amis de la Nature: https://amis-nature.org/rubrique173.html ; Refuge-Portal: https://www.massif-des-vosges.fr/ou-dormir/refuges/
- Zuugle / Bahn zum Berg: https://github.com/bahnzumberg ; https://bahn-zum-berg.at/tipps-tricks/zuugle
- DAV Altdorf ÖV-Leitfaden: https://www.dav-altdorf.de/leitfaden
- Reisezeiten: https://transport.opendata.ch/ (API), Trainline Offenburg–Oberstdorf / –St. Anton
