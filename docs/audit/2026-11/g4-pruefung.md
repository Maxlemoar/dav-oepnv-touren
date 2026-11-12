# Prüfung Gruppe g4 (Vorarlberg, Arlberg, Allgäu), Stand 12.11.2026

Geprüft wurden die Gebiete arlberg-verwall, kleinwalsertal, brandnertal, bregenz-pfaender, bregenzerwald, lechquellengebirge, montafon-raetikon, silvretta, hintersteiner-tal, nagelfluhkette und oberstdorf, dazu die 26 Hütten mit diesen `gebietId` und die 24 Haltestellen, die diese Gebiete oder die Zustiege der Hütten nutzen. Die Listen wurden per Skript aus den YAML-Dateien erzeugt. Nichts an `content/` oder am Code wurde geändert.

Methode: Koordinaten und Höhen per Overpass (`tourism=alpine_hut|wilderness_hut`). Alle 26 Hütten liegen innerhalb von 50 m vom OSM-Punkt, die Höhen weichen höchstens 13 m ab. Mindelheimer Hütte: OSM nennt 2058 m, Wikipedia und Bergwelten 2013 m wie im Repo. Fahrplan per Transitous (Offenburg → Ziel, Samstag 21.11.2026 ab 05:00). Saisonzeiten und Gehzeiten stammen von Hütten- und Sektionsseiten, aus dem Bergbahn-PDF Montafon Sommer 2026 (Stand 23.10.2026), aus der DAV-Übersicht "Netz Allgäu" (Stand 09/2026), aus dem Winterfahrplan Landbus Montafon 2025/26 und aus Wikipedia.

Wichtiger Hinweis zur Stichprobe: Am Prüftag 21.11.2026 ist die Arlbergbahn gesperrt (ÖBB-Sperre 18.–22.11.2026). Transitous liefert deshalb für Bludenz, Langen und St. Anton Schienenersatzverkehr (SV400). Das ist vorübergehend und kein Datenfehler.

## Zusammenfassung

| Objektart | ok | korrigieren | fraglich | geschlossen / existiert nicht |
|---|---|---|---|---|
| Hütten (26) | 12 | 13 | 0 | 1 (Schwarzwasserhütte, Umbau) |
| Haltestellen (24) | 23 (davon 3 nur saisonal bedient) | 1 | 0 | 0 |
| Gebiete (11) | 5 | 5 | 1 | 0 |

Die wichtigsten Befunde:

- **Schwarzwasserhütte** ist seit 12.10.2025 wegen Umbau geschlossen. Die Wiedereröffnung ist frühestens für den Winter 2026/27 angekündigt, laut Kleinwalsertal Tourismus erst für Sommer 2027.
- **Silvretta-Hochalpenstraße** bleibt auf Vorarlberger Seite voraussichtlich bis Sommer 2030 gesperrt. Ab Montafon führt kein Linienbus mehr auf die Bielerhöhe. Erreichbar ist sie nur mit Vermuntbahn und Tunnelbus (20.06.–04.10.2026) oder im Sommer von Tiroler Seite.
- Die **haltestelleId der Bielerhöhe** ist ungültig. Transitous kennt den Feed `at-PTA-Tyrol-2026` nicht mehr, die neue ID lautet `at-Fahrplandaten-Verkehrsverbund-Tirol-Flex-2026_at:48:1322:0:1`. Andere Haltestellen mit diesem Feed-Präfix außerhalb von g4 sollten ebenfalls geprüft werden.
- **Lustenauer Hütte**: Der Zustieg mischt zwei Wege. 90 min und 200 Hm passen weder ab Dornbirn (laut verlinkter Tour 180 min und 772 Hm) noch ab Bödele (rund 60 min und 110 Hm). Die Buslinie heißt 870, nicht 47. Die Hütte liegt nicht auf der Nagelfluhkette.
- **Gehzeiten zu kurz**:
  - Rappenseehütte 180 statt 240 min. Die eigene `quelle` nennt 4 h.
  - Darmstädter Hütte 210 statt 270 min. Die eigene `quelle` nennt 270 min.
  - Saarbrücker Hütte 90 statt rund 150 min.
  - Mannheimer Hütte 180 statt 240 bis 285 min.
  - Tilisunahütte 180 statt 240 min.
  - Schwarzenberghütte 60 statt 150 min ab Hinterstein. 60 min gelten nur mit dem Giebelhausbus.
  - Fiderepasshütte 150 statt 180 min.
  - Freiburger Hütte 30 statt 50 min auf dem Normalweg.
- **Lindauer Hütte** ist auch im Winter bewirtschaftet (25.12.2026–27.03.2027). `saison` sollte `ganzjaehrig` sein.
- Die Hinweise bei **Mindelheimer Hütte** (Baad und Bärgunttal) und **Mannheimer Hütte** (Leibersteig ab Lünersee) beschreiben den falschen Weg.

## Hütten

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| edmund-probst-haus | ok | Lage, Höhe (1932 m in OSM), Sektion und Ganzjahresbetrieb stimmen (Winter ab 27.12. bis ca. Ostern, Sommer Juni bis Anfang Oktober), die Hütte liegt bei der Station Höfatsblick. | https://www.edmund-probst-haus.de/ | `geschaetzt` kann bleiben, die Gehzeit ab Bergstation ist nicht separat belegt |
| freiburger-huette | korrigieren | Sektion Freiburg-Breisgau, Höhe und Koordinaten ok. Laut Hüttenseite dauert es vom Fahrweg Alpe Formarin um den See ca. 50 min, nur über den Felsensteig (für Geübte) 30 min; letzter Wanderbus ab Formarinsee gegen 18:35, Zugertalstraße ohne Winterdienst. | https://www.freiburger-huette.at/anreise | `zustiege[0].gehzeitMin` 30 → 50, im Hinweis "30 min über den Felsensteig (nur Geübte)" ergänzen |
| heinrich-hueter-huette | ok | Ab Haltestelle Wanderbus Rellstal (1490 m) 45 min, ab Vandans 3:15 h, Hütte 1766 m, Saison bis 03.10.2026. | https://hueterhuette.at/ | – |
| darmstaedter-huette | korrigieren | Die eigene `quelle` (Alpenvereinaktiv-Tour) gibt 270 min und 1150 Hm an, tirol.at sogar 5 h ab Ort. Die Rendlbahn fährt im Sommer 2026 vom 13.06. bis 17.09. (08:15–16:10), danach also nur der lange Fußweg. | https://www.alpenvereinaktiv.com/de/tour/zustieg-darmstaedter-huette-von-st.-anton/14490191/ ; https://www.tirol.at/aktivitaeten/sport/wandern/bergbahnen/rendlbahn | `zustiege[0].gehzeitMin` 210 → 270, `hoehenmeter` 1100 → 1150, Hinweis um "Rendlbahn nur Mitte Juni bis Mitte September" ergänzen |
| douglasshuette | ok | Eigentümer ist illwerke vkw (2009 vom ÖAV Vorarlberg gekauft), ÖAV-Vertragshaus. Lünerseebahn 23.05.–26.10.2026, Bus 580 ab Bludenz. | https://de.wikipedia.org/wiki/Douglassh%C3%BCtte ; Bergbahn-PDF Montafon Sommer 2026 | – |
| fiderepasshuette | korrigieren | Wikipedia nennt ab Mittelberg 3 h (849 Hm stimmt), ab Kanzelwandbahn 2,5 h. | https://de.wikipedia.org/wiki/Fiderepassh%C3%BCtte | `zustiege[0].gehzeitMin` 150 → 180; Alternative im Hinweis besser "Kanzelwandbahn ab Riezlern (ca. 2,5 h)" |
| saarbruecker-huette | korrigieren | Ab Bielerhöhe 2,5–3 h über Madlenerhaus und Tschifernella. Das Kromertal beginnt am Vermuntsee, nicht an der Bielerhöhe. Ab 2027 gibt es einen neuen Pächter. Den Sektionsnamen "Alpenverein und Skiclub Saarbrücken" konnte ich nicht prüfen. | https://www.montafon.at/en/saarbrueckner-huette-2-538-m_vc17577 ; https://www.ich-geh-wandern.de/runde-von-der-bielerhoehe-zur-saarbruecker-huette-silvretta | `zustiege[0].gehzeitMin` 90 → 150, `hoehenmeter` 500 → 550, Hinweis: "Ab Bielerhöhe hinab zum Madlenerhaus und über die Tschifernella zur Hütte; Variante ab Vermuntsee durchs Kromertal" |
| kemptner-huette | korrigieren | Laut Hüttenseite 3 h ab Spielmannsau, das stimmt. Der Hinweis nennt aber eine Busabfahrt mit Stand 2024. Laut DAV-Übersicht fährt Linie 8 von Mai bis November stündlich, Deutschlandticket gilt nicht. | https://www.kemptner-huette.de/anreise-kontakt ; https://www.alpenverein-muenchen-oberland.de/uploads/images/EMTP7tSuR1aZmGDlDBWpyw/netz-allgaeu-2026-09-20.pdf | Im Hinweis "Stand 2024 8:45 Uhr" ersetzen durch "Linie 8, Mai bis November etwa stündlich, Deutschlandticket gilt nicht" |
| lindauer-huette | korrigieren | Die Hütte hat Winterbetrieb (25.12.2026–27.03.2027) und einen beheizten Winterraum. Ab Latschau 2–2,5 h. | https://lindauerhuette.com/ ; https://de.wikipedia.org/wiki/Lindauer_H%C3%BCtte | `saison` sommer → ganzjaehrig; `zustiege[0].gehzeitMin` 120 → 135 |
| madrisahuette | ok | Selbstversorgerhütte der Sektion Karlsruhe, ganzjährig, Schlüssel bei Margit Ganahl in Gargellen (vorher anmelden). Linie 670 laut Sektion halbstündlich, auch in der Nebensaison. Zustieg 30–45 min. Im Winter ist der Zugang bei Lawinengefahr gesperrt. | https://www.alpenverein-karlsruhe.de/huetten/madrisahuette/standort ; https://www.bergwelten.com/h/madrisahuette | optional `gehzeitMin` 60 → 45; im Hinweis "Schlüssel vorab bei der Schlüsselstelle in Gargellen anmelden, im Winter Lawinensperren möglich" |
| mindelheimer-huette | korrigieren | Zustieg ab Mittelberg durchs Wildental über die Kemptner Scharte (2103 m), 3 h. Einen Weg ab Baad durchs Bärgunttal gibt es nicht, das Bärgunttal führt zum Widderstein. Der Winterraum ist abgebaut, es gibt nur einen offenen Notraum. | https://de.wikipedia.org/wiki/Mindelheimer_H%C3%BCtte | `zustiege[0].hoehenmeter` 800 → 890; Hinweis: "Walserbus bis Mittelberg, ab Schwendle durchs Wildental und über die Kemptner Scharte (teils seilversichert)" |
| staufner-haus | ok | Ab Talstation ca. 2 h, ab Bergstation 10 min. Winter Do–So vom 26.12. bis Ende März, Sommer 1.5. bis Allerheiligen. Hochgratbahn im Winter 25.12.2026–04.04.2027. | https://www.dav-ol.de/staufner-haus/ | – |
| mannheimer-huette | korrigieren | Wikipedia nennt vom Lünersee etwa 4 h, die Gebietstour "Zustieg Mannheimer Hütte vom Lünersee" 285 min und 959 Hm. Der Leibersteig ist der Weg ab Oberzalimhütte (Brand/Palüdbahn), nicht ab Lünersee. Der Winterraum liegt in der Zollwachhütte. | https://de.wikipedia.org/wiki/Mannheimer_H%C3%BCtte ; https://www.alpenvereinaktiv.com/de/tour/zustieg-mannheimer-huette-vom-luenersee/42082590/ | `zustiege[0].gehzeitMin` 180 → 270, `hoehenmeter` 750 → 960; Hinweis: "über Totalphütte und Schesaplana-Gebiet, hochalpin"; optional zweiter Zustieg ab Brand über Palüdbahn, Oberzalimhütte und Leiberweg (5 h, Palüdbahn nur Fr–So) |
| konstanzer-huette | ok | Vom Salzhüttle (Wanderbushaltestelle) ca. 1,5 h, ab St. Anton ca. 3 h. Saison 19.06.–26.09.2026. "Gratis" und "Linie 6" konnte ich nicht belegen. | https://www.tirol.at/reisefuehrer/sport/wandern/alpenvereinshuetten/a-konstanzer-huette ; https://www.stantonamarlberg.com/de/sommer/bergregion/huettenverzeichnis/-addresses/konstanzer-huette | `webUrl` → https://www.konstanzerhuette.com/ (Hüttenseite laut OSM); "Gratis" und "Linie 6" streichen, solange unbelegt |
| rappenseehuette | korrigieren | Die eigene `quelle` (Alpenvereinaktiv) nennt 240 min und 1143 Hm, Wikipedia rund 4 h ab Birgsau. Größte DAV-Hütte mit 304 Plätzen, das stimmt. | https://www.alpenvereinaktiv.com/de/tour/zustieg-rappenseehuette-von-birgsau/26246567/ ; https://de.wikipedia.org/wiki/Rappenseeh%C3%BCtte | `zustiege[0].gehzeitMin` 180 → 240 |
| lustenauer-huette | korrigieren | Busanreise laut vmobil mit Linie 870 bis Schwarzenberg Bödele (in Transitous bestätigt, halbstündlich), dann rund 1 h und rund 100 Hm. Die Hütte liegt am Bödele (Bregenzerwaldgebirge), nicht auf der Nagelfluhkette. Hüttenseite ist lustenauerhuette.at, dort "ab 26.10 Betriebsurlaub bis auf weiteres". Ob die Hütte im Winter offen ist, ist unklar. | https://www.vmobil.at/de/ueber-vmobil/wir-sind-vmobil-mobilitaetspartner/energieinstitut-vorarlberg/oeffentliche-anreise-zu-den-huetten-des-alpenverein-vorarlberg ; https://www.bergwelten.com/huetten/lustenauer-huette ; https://www.lustenauerhuette.at | `zustiege[0].gehzeitMin` 90 → 60, `hoehenmeter` 200 → 110; Hinweis: "Landbus 870 ab Bahnhof Dornbirn bis Schwarzenberg Bödele, dann Winterwanderweg bzw. Rodelweg zur Hütte"; `webUrl` → https://www.lustenauerhuette.at |
| schwarzenberghuette | korrigieren | Laut Hüttenseite ab Hinterstein ca. 2,5 h. Mit dem Giebelhausbus (Linie 50, Mai bis November, Deutschlandticket gilt nicht) bis zum Giebelhaus bzw. zur Haltestelle an der Brücke dauert es ca. 1 h. Geschlossen vom 2.11. bis 24.12. | https://www.dav-illertissen.de/Schwarzenberghuette | `zustiege[0].gehzeitMin` 60 → 150; Hinweis: "mit Giebelhausbus (Mai bis November) bis Haltestelle Aufstieg Schwarzenberghütte nur ca. 1 h" |
| prinz-luitpold-haus | ok | Ab Giebelhaus 2,5–3 h. Geöffnet 04.06.–04.10.2026, Winterraum offen und ohne AV-Schlüssel. Bus 49 bis Grüner Hut, dann privater Bus 50. | https://www.prinz-luitpoldhaus.de/cms | – |
| ravensburger-huette | ok | Ab Spullersee 45 min über die Nordstaumauer (Südseite 1¼ h). Wanderbus 706 ab Rüfiplatz von Mitte Juni bis Anfang Oktober, Tageskarte 2025: 25 €. | https://www.ravensburgerhuette.at/die-berghuette/anreise/oeffentlichen-verkehrsmitteln/wanderbus-spullersee/ ; https://www.bergwelten.com/h/ravensburger-huette | `geschaetzt` → false |
| schwarzwasserhuette | geschlossen | Wegen Baumaßnahmen geschlossen (Baubeginn 12.10.2025). Die Wiedereröffnung ist laut Sektion "vrsl. Winter 2026/27" angekündigt, laut Kleinwalsertal Tourismus erst Sommer 2027. Es gibt keinen Winterraum. Ab Auenhütte ca. 2 h. | https://www.alpenverein-schwaben.de/huetten/schwarzwasserhuette/ ; https://kleinwalsertal.com/en/Region/Discover/Tour-Search/Schwarzwasserhutte_tour_9395 | Hinweis "Wegen Umbau geschlossen, Wiedereröffnung vsl. 2027" ergänzen bzw. Hütte vorerst ausblenden; `zustiege[0].gehzeitMin` 90 → 120 |
| ulmer-huette | ok | Ab Galzig-Bergstation ca. 1 h, geöffnet Dez–Apr und Jul–Sep. Galzig- und Vallugabahn fahren im Sommer bis 04.10.2026. | https://www.bergwelten.com/h/ulmer-huette | `geschaetzt` kann bleiben (Öffnungszeiten nur von Bergwelten) |
| totalphuette | ok | ÖAV Vorarlberg, 2381–2385 m. Bus 580 bis Brand Lünerseebahn laut vmobil. Ab Lünersee 1,5 h ist üblich. | https://www.vmobil.at/de/ueber-vmobil/wir-sind-vmobil-mobilitaetspartner/energieinstitut-vorarlberg/oeffentliche-anreise-zu-den-huetten-des-alpenverein-vorarlberg | – |
| tilisunahuette | korrigieren | Wikipedia nennt ab Latschau 4 h, ab Tschagguns 4,5 h. Laut vmobil fahren Linie 601 bis Latschau Kraftwerk oder Linie 670 bis Gargellen Wolfa. | https://de.wikipedia.org/wiki/Tilisunah%C3%BCtte ; vmobil (wie oben) | `zustiege[0].gehzeitMin` 180 → 240; im Hinweis "Linie 601 bis Latschau" nennen |
| waltenbergerhaus | ok | Ab Birgsau über Einödsbach ca. 3,5 h, rund 1130 Hm. Geöffnet von Pfingsten bis Anfang Oktober, Winterraum mit 14 Lagern. | https://de.wikipedia.org/wiki/Waltenbergerhaus | `geschaetzt` → false |
| wiesbadener-huette | korrigieren | Gehzeit 2 h und Saison stimmen: Sommer 11.06.–27.09.2026, Winter 10.02. bis April 2027 (Hütte 2430 m). Der Hinweis "oder Linienbus auf die Bielerhöhe" ist aber falsch, solange die Hochalpenstraße gesperrt ist. Im Winter geht es nur ab Galtür bzw. Wirl mit Ski oder Schneeschuhen. | https://www.wiesbadener-huette.com ; Bergbahn-PDF Montafon Sommer 2026 | Hinweis: "Ab Partenen mit Vermuntbahn und Tunnelbus (Sommer, ca. 20.06.–04.10.) auf die Bielerhöhe … Im Winter Zustieg ab Galtür/Wirl" |
| wormser-huette | ok | Geöffnet Mitte Juni bis Mitte Oktober und Weihnachten bis kurz nach Ostern, also ganzjährig. Hochjoch Bahn 13.06.–01.11.2026. Ab Bergstation Sennigrat (20.06.–04.10.) nur 20 min. | https://de.wikipedia.org/wiki/Wormser_H%C3%BCtte ; Bergbahn-PDF Montafon Sommer 2026 | optional im Hinweis "mit Sennigratbahn nur 20 min" |

## Haltestellen

Ergebnis der Transitous-Stichprobe (Offenburg → Ziel, Samstag 21.11.2026): Für alle Haltestellen außer Bielerhöhe, Brand Lünerseebahn, Spielmannsau und Zugertal Formarinsee gab es Verbindungen. Alle Koordinaten liegen höchstens 50 m vom Transitous-Haltepunkt entfernt.

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| bad-hindelang-busbahnhof | ok | Bus 48 ab Sonthofen etwa stündlich, ganzjährig. Transitous liefert Verbindungen am 21.11. | Transitous; Netz Allgäu 09/2026 | – |
| bielerhoehe | korrigieren | Transitous meldet `unknown feed id "at-PTA-Tyrol-2026"`. Die Haltestelle heißt jetzt Bielerhöhe Silvrettasee (gleiche Koordinaten). Nur im Sommer bedient: Vermuntbahn und Tunnelbus ab Partenen vom 20.06. bis 04.10.2026 (letzte Talfahrt 17:00) oder Sommerbus von Landeck über Galtür. Hochalpenstraße ab Montafon bis ca. Sommer 2030 gesperrt. | https://api.transitous.org/api/v1/geocode?text=Bielerh%C3%B6he&type=STOP ; https://www.montafon.at/montafon/pdfs/oeffnungszeiten/bergbahnen/Betriebszeiten-Bergbahnen-DE-Sommer-2026.pdf | `haltestelleId` → `at-Fahrplandaten-Verkehrsverbund-Tirol-Flex-2026_at:48:1322:0:1`, danach `npm run richtwerte -- --nur bielerhoehe` |
| birgsau | ok | Linie 7 fährt auch im November (Transitous: 12:30 ab Oberstdorf). Deutschlandticket gilt laut DAV-Übersicht nicht. | Transitous; Netz Allgäu 09/2026 | – |
| bludenz | ok | Ganzjährig. Am 21.11. Schienenersatzverkehr wegen Arlbergsperre (18.–22.11.2026), das ist vorübergehend. | Transitous; https://www.oebb.at/de/fahrplan/baustelleninformation/bauarbeiten-arlbergstrecke | – |
| brand-luenerseebahn | ok (saisonal) | Keine Verbindung am 21.11. Bus 580 fährt nur im Sommer bis zur Lünerseebahn, die vom 23.05. bis 26.10.2026 in Betrieb ist. | Bergbahn-PDF Montafon Sommer 2026; https://luenersee.at/en/service-prices/contact-arrival | – (Saisonhinweis erwägen) |
| bregenz | ok | Ganzjährig, Fernverkehr und S-Bahn. | Transitous | – |
| dornbirn | ok | Ganzjährig, Bus 870 aufs Bödele halbstündlich. | Transitous | – |
| gargellen-schafbergbahn | ok | Bus 670 ganzjährig. Schafbergbahn im Sommer 12.06.–11.10.2026. | Transitous; Bergbahn-PDF Montafon Sommer 2026 | – |
| hinterstein-gruener-hut | ok | Bus 49 ganzjährig. Giebelhausbus 50 nur Mai bis November. | Transitous; Netz Allgäu 09/2026 | – |
| hochgratbahn | ok | Bus 95 ab Oberstaufen stündlich. Hochgratbahn im Winter 25.12.2026–04.04.2027. | Transitous; Netz Allgäu 09/2026 | – |
| immenstadt | ok | Ganzjährig, RE 75/RE 7. | Transitous | – |
| langen-am-arlberg | ok | Ganzjährig, Bus 750 nach Lech. 18.–22.11.2026 Schienenersatzverkehr. | Transitous | – |
| lech-ruefiplatz | ok | Ganzjährig, Bus 750/760. Hier starten die Wanderbusse 706 (Spullersee) und Formarinsee. | Transitous; Ravensburger-Hütten-Seite | – |
| mittelberg | ok | Walserbus 1 ganzjährig. Deutschlandticket im Kleinwalsertal nicht gültig. | Transitous; Netz Allgäu 09/2026 | – |
| oberstaufen | ok | Ganzjährig, Fahrzeit ab Offenburg am 21.11. 4:48 bis 5:18 h. | Transitous | – |
| oberstdorf | ok | Ganzjährig, RE 75 ab Ulm. | Transitous | – |
| partenen-zentrum | ok | Bus 650 ganzjährig. Für die Vermuntbahn ist die Haltestelle "Partenen Bergbahnen Talstation" näher. | Transitous; montafon.at | – |
| riezlern-post | ok | Walserbus 1 und 5 ganzjährig. | Transitous | – |
| schruns | ok | Ganzjährig, Montafonerbahn S4. | Transitous | – |
| sonthofen | ok | Ganzjährig. | Transitous | – |
| spielmannsau | ok (saisonal) | Keine Verbindung am 21.11. Linie 8 fährt nur von Mai bis November, stündlich, Deutschlandticket gilt nicht. | Netz Allgäu 09/2026 | – |
| st-anton-am-arlberg | ok | Ganzjährig, Railjet. 18.–22.11.2026 Schienenersatzverkehr. | Transitous | – |
| vandans | ok | Ganzjährig. Rellstal-Wanderbus nur im Sommer, nicht im VMOBIL-Wochenticket enthalten. | Transitous; vmobil | – |
| zugertal-formarinsee | ok (saisonal) | Keine Verbindung am 21.11. Wanderbus nur von Mitte Juni bis Anfang Oktober, kein Winterdienst auf der Mautstraße. | https://www.freiburger-huette.at/anreise | – |

## Gebiete

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| arlberg-verwall | fraglich | Railjet ab Zürich sowie Konstanzer, Darmstädter und Ulmer Hütte stimmen. "Gratis-Wanderbus ins Verwalltal" ist unbelegt: Die Tourismusseite erwähnt nur einen Bus zum Verwallsee bzw. Salzhüttle. | https://www.stantonamarlberg.com/de/sommer/bergregion/huettenverzeichnis/-addresses/konstanzer-huette | "Gratis-" streichen oder belegen |
| kleinwalsertal | korrigieren | Die Walserbus-Angaben stimmen. Die Schwarzwasserhütte ist wegen Umbau aber kein Winterziel, frühestens ab Winter 2026/27, eher 2027. | https://www.alpenverein-schwaben.de/huetten/schwarzwasserhuette/ | Satz zur Schwarzwasserhütte um "(wegen Umbau voraussichtlich bis 2027 geschlossen)" ergänzen; Hinweis "Deutschlandticket im Kleinwalsertal nicht gültig" erwägen |
| brandnertal | ok | Bus 580 ab Bludenz, Lünerseebahn, Totalphütte, Schesaplana und Mannheimer Hütte stimmen; `saison: sommer` passt (Lünerseebahn 23.05.–26.10.). | Bergbahn-PDF Montafon Sommer 2026 | – |
| bregenz-pfaender | ok | Zu Fuß rund 2 h (Gebietstour: 120 min, 658 Hm). Pfänderbahn und Landbus stimmen. | Gebietstour 40065508 | – |
| bregenzerwald | korrigieren | Bödele und Lustenauer Hütte liegen im Bregenzerwaldgebirge, nicht auf der Nagelfluhkette. Der Bus aufs Bödele ist Linie 870. | vmobil (Lustenauer Hütte); Transitous | "Wanderungen auf der Nagelfluhkette zur Lustenauer Hütte" → "Wanderungen vom Bödele zur Lustenauer Hütte und übers Hochälpele" |
| lechquellengebirge | ok | Bus Langen–Lech (750) stimmt. Wanderbusse zum Formarinsee und Spullersee fahren von Mitte Juni bis Anfang Oktober, Freiburger und Ravensburger Hütte in 30–50 bzw. 45 min. | Hüttenseiten Freiburger und Ravensburger Hütte | optional ergänzen: "Spullersee-Bus kostenpflichtig" |
| montafon-raetikon | ok | Montafonerbahn, Bus 670 nach Gargellen, Rellstalbus und die Sektionen Karlsruhe, Lindau, Worms und Vorarlberg stimmen. | Landbus Montafon 2025/26; vmobil | – |
| silvretta | korrigieren | "oder Linienbus auf die Bielerhöhe" stimmt ab Montafon bis voraussichtlich 2030 nicht, nur von Tiroler Seite (Sommerbus Landeck–Galtür–Bielerhöhe). Vermuntbahn und Tunnelbus fahren nur im Sommer, für Skitouren im Frühjahr ist die Anreise über Galtür nötig. | Bergbahn-PDF Montafon Sommer 2026; https://www.oeamtc.at/news/vorarlberg/silvretta-hochalpenstrasse-sperre-bis-2030-24352721/print | "Ab Partenen mit Vermuntbahn und Tunnelbus (Sommer), von Tiroler Seite mit dem Sommerbus über Galtür auf die Bielerhöhe. Die Hochalpenstraße ist ab Montafon bis voraussichtlich 2030 gesperrt." |
| hintersteiner-tal | ok | Bus 48/49 ab Sonthofen, privater Giebelhausbus 50 (Mai bis November), Prinz-Luitpold-Haus und Übergang zum Nebelhorn stimmen. | Netz Allgäu 09/2026; https://www.prinz-luitpoldhaus.de/cms | – |
| nagelfluhkette | korrigieren | Hochgrat, Bus 95 und Staufner Haus stimmen. Laut Transitous dauert die Fahrt ab Offenburg nach Oberstaufen 4:48 bis 5:18 h, zur Hochgratbahn 5:32 bis 6:02 h, nicht "viereinhalb Stunden". Die Richtwerte nennen 346 min. | Transitous; `content/haltestellen/oberstaufen.yaml` | "in viereinhalb Stunden" → "in knapp fünf Stunden" |
| oberstdorf | korrigieren | "Kürzestes deutsches Alpenziel ab Offenburg" stimmt nicht: Immenstadt (262 min), Sonthofen (278 min) und Bregenz (244 min) sind laut Richtwerten schneller als Oberstdorf (299 min). Busse nach Spielmannsau und Birgsau sowie die Hütten stimmen. | `content/haltestellen/*.yaml` (Richtwerte) | "Kürzestes deutsches Alpenziel" → "Das südlichste Bahnziel Deutschlands, direkt per RE ab Ulm" |

## Nebenbefunde Touren

- **arlberg-verwall, "Zustieg Darmstädter Hütte von St. Anton"** (270 min, 1150 Hm) widerspricht dem Hüttenzustieg (210 min, 1100 Hm), obwohl beide auf dieselbe Quelle verweisen. Die Tour ist richtig, die Hütte nicht.
- **oberstdorf, "Zustieg Rappenseehütte von Birgsau"** (240 min) widerspricht ebenso dem Hüttenzustieg (180 min) bei gleicher Quelle.
- **bregenzerwald, "Zustieg von Dornbirn zur Lustenauer Hütte"** (180 min, 772 Hm) zeigt, dass die 90 min und 200 Hm am Hüttenzustieg weder zu Dornbirn noch zum Bödele passen.
- **kleinwalsertal, "Schwarzwasserhütte – Zustieg von Mittelberg"**: Die Hütte ist bis voraussichtlich 2027 geschlossen, darauf sollte bei der Tour hingewiesen werden.
- **silvretta, "Piz Buin – Skihochtour"** und die Bielerhöhe-Touren: Ohne Hochalpenstraße ist die Bielerhöhe im Winter und Frühjahr mit Bus nur über Galtür/Wirl erreichbar, Vermuntbahn und Tunnelbus fahren nur im Sommer. Ob die Skitour `oeffiTauglich: true` verdient, ist fraglich.
