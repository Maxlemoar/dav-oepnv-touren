# Eingespielte Korrekturen aus dem Qualitätscheck November 2026

Erzeugt mit `npx tsx scripts/korrekturen.ts` am 2026-11-19. Grundlage: `g1-korrekturen.yaml` bis `g4-korrekturen.yaml` (210 Vorschläge).

| Ergebnis | Anzahl |
|---|---|
| eingespielt (automatisch) | 134 |
| Konflikt (alter Wert passt nicht, nicht gesetzt) | 0 |
| von Hand (struktureller Vorschlag) | 4 |
| übersprungen (nicht belegt, Arbeitskreis) | 72 |

## Eingespielt (134)

Wert geprüft und gesetzt.

| Nr. | Datei | Feld | alt | neu | Grund |
|---|---|---|---|---|---|
| g1#0 | huetten/cabane-perrenoud.yaml | zustiege[0].hinweis | Über die Ferme Robert und den Soliat auf den Jurakamm, 23 Plätze, an Wochenenden bewartet… | Über die Ferme Robert und den Soliat auf den Jurakamm, 27 Plätze, an Wochenenden (Sa 11 b… | gesetzt |
| g1#2 | huetten/chalet-schnepfenried.yaml | hoehe | 1250 | 1050 | gesetzt |
| g1#3 | huetten/chalet-schnepfenried.yaml | betreiber.sektion | Amis de la Nature Haut-Rhin | Amis de la Nature Colmar | gesetzt |
| g1#5 | huetten/chalet-schnepfenried.yaml | zustiege[0].hinweis | Ab Metzeral über Sondernach zum Schnepfenried, Bus nur saisonal. 45 Plätze, Selbstversorg… | Ab Metzeral über Sondernach zum Schnepfenried. 45 Plätze, Selbstversorgung, geöffnet Sa 1… | gesetzt |
| g1#6 | huetten/hohwaldhuette.yaml | lat | 48.38667 | 48.38826 | gesetzt |
| g1#7 | huetten/hohwaldhuette.yaml | lon | 7.27722 | 7.28265 | gesetzt |
| g1#10 | huetten/jurahaus.yaml | zustiege[0].gehzeitMin | 60 | 45 | gesetzt |
| g1#11 | huetten/jurahaus.yaml | zustiege[0].hoehenmeter | 250 | 315 | gesetzt |
| g1#13 | huetten/la-chaume-des-veaux.yaml | lat | 48.38972 | 48.39247 | gesetzt |
| g1#14 | huetten/la-chaume-des-veaux.yaml | lon | 7.28032 | 7.28054 | gesetzt |
| g1#17 | huetten/les-jonquilles.yaml | lat | 48.005 | 48.0314 | gesetzt |
| g1#18 | huetten/les-jonquilles.yaml | lon | 7.06 | 7.0572 | gesetzt |
| g1#19 | huetten/les-jonquilles.yaml | quelle | https://amis-nature.org/article236.html | https://ww14bew.naturfreunde.de/sites/default/files/attachments/nfh-vogesen-flyer.pdf | gesetzt |
| g1#20 | huetten/les-jonquilles.yaml | webUrl | https://amis-nature.org/article236.html | – | Feld entfernt |
| g1#23 | huetten/les-jonquilles.yaml | zustiege[0].hinweis | – | Route du Gaschney oberhalb Muhlbach-sur-Munster, 31 Betten. Ähnlich weit ab Bahnhof Muhlb… | gesetzt |
| g1#24 | huetten/naturfreundehaus-bellevue.yaml | betreiber.sektion | Naturfreunde Schweiz | Naturfreunde Tavannes | gesetzt |
| g1#25 | huetten/naturfreundehaus-bellevue.yaml | zustiege[0].hinweis | Ab Bahnhof Tavannes oder Reconvilier 90 Gehminuten auf den Montoz. | Ab Bahnhof Tavannes oder Reconvilier 90 Gehminuten auf den Montoz. Bahn Sonceboz–Moutier … | gesetzt |
| g1#26 | huetten/naturfreundehaus-brend.yaml | zustiege[0].gehzeitMin | 75 | 90 | gesetzt |
| g1#28 | huetten/naturfreundehaus-grosser-wald.yaml | hoehe | 500 | 235 | gesetzt |
| g1#30 | huetten/naturfreundehaus-grosser-wald.yaml | zustiege[0].hinweis | Bus 253 ab Gaggenau Bahnhof nach Michelbach, ab Haltestelle 500 m; zu Fuß 3 km. 30 Betten… | Bus 253 ab Gaggenau Bahnhof bis Michelbach Kirche, ab dort 400 m; zu Fuß 3 km. 30 Betten,… | gesetzt |
| g1#33 | huetten/naturfreundehaus-sommerecke.yaml | zustiege[0].hinweis | Bus ab Hornberg bis Fohrenbühl, dann 4 km Fußweg. Selbstversorgerhaus für Gruppen, 50 Bet… | Rufbus (Linie 7484) ab Hornberg bis Fohrenbühl, vorher anmelden; dann 4 km Fußweg. Selbst… | gesetzt |
| g1#34 | huetten/sandkaestle.yaml | zustiege[0].hinweis | – | Am ehemaligen Kurhaus Sand. Selbstversorgerhütte der Sektion mit 17 Plätzen, wird nur an … | gesetzt |
| g1#38 | huetten/todtnauer-huette.yaml | webUrl | – | https://www.todtnauer-huette.de/ | gesetzt |
| g1#39 | huetten/wiedenbachhuette.yaml | zustiege[0].hinweis | Selbstversorgerhütte, 32 Betten, Bus 264 ab Bühl Bahnhof bis Gertelbachstraße, Hütte dire… | Selbstversorgerhütte, 31 Betten, Bus 264 ab Bühl Bahnhof bis Gertelbachstraße, Hütte dire… | gesetzt |
| g1#41 | huetten/refuge-des-trois-fours.yaml | zustiege[0].hinweis | Bus zum Col de la Schlucht nur saisonal (Navette des Crêtes ab Munster bzw. Colmar), dann… | Bus zum Col de la Schlucht nur im Sommer (Navette des Crêtes, 2026: 30.5.–27.9.), dann 2 … | gesetzt |
| g1#42 | haltestellen/badenweiler-schule.yaml | haltestelleId | de-DELFI_de:08315:5473:1:1 | de-DELFI_de:08315:971:1:1 | gesetzt |
| g1#43 | haltestellen/badenweiler-schule.yaml | name | Badenweiler Schule | Badenweiler, Oberweiler | gesetzt |
| g1#44 | haltestellen/badenweiler-schule.yaml | lat | 47.80801 | 47.80833 | gesetzt |
| g1#45 | haltestellen/badenweiler-schule.yaml | lon | 7.67472 | 7.67088 | gesetzt |
| g1#46 | haltestellen/dahn-sued.yaml | haltestelleId | de-amarillo-bw_de:07340:3747 | de-DELFI_de:07340:3743:0:RiN | gesetzt |
| g1#47 | haltestellen/dahn-sued.yaml | name | Dahn Süd | Dahn, Stadtmitte | gesetzt |
| g1#48 | haltestellen/dahn-sued.yaml | lat | 49.14845 | 49.1501 | gesetzt |
| g1#49 | haltestellen/dahn-sued.yaml | lon | 7.77732 | 7.77936 | gesetzt |
| g1#50 | haltestellen/col-de-la-schlucht.yaml | haltestelleId | fr-offre-de-transport-du-reseau-fluo-grand-est-haut-rhin-68_141735 | fr-offre-de-transport-du-reseau-fluo-grand-est-vosges-88_141735 | gesetzt |
| g1#51 | gebiete/buehlertal.yaml | beschreibung | (Bus ab Bühl Bahnhof, 20 Minuten) | (Bus 264 ab Bühl Bahnhof, knapp 40 Minuten) | gesetzt |
| g1#55 | gebiete/murgtal.yaml | beschreibung | Zwei Naturfreundehäuser in Hörden und Michelbach liegen direkt am Bahnhof. | Das Naturfreundehaus Hörden liegt 800 m von der Stadtbahn, das Haus Großer Wald in Michel… | gesetzt |
| g1#57 | gebiete/blaubeuren.yaml | beschreibung | in drei Stunden | in dreieinhalb Stunden | gesetzt |
| g1#60 | gebiete/chasseral.yaml | beschreibung | ab St-Imier über Mont-Soleil | ab St-Imier durch die Combe Grède | gesetzt |
| g2#0 | huetten/anenhuette.yaml | zustiege[0].hinweis | Bus bis Fafleralp (Sommer) verkürzt auf 1:30 h, Fafleralp liegt aber über 5:30 h ab Offen… | Nach dem Bergsturz von Blatten (28.05.2025) keine Sommersaison; Wiedereröffnung laut Hütt… | gesetzt |
| g2#2 | huetten/fruendenhuette.yaml | zustiege[0].gehzeitMin | 165 | 225 | gesetzt |
| g2#3 | huetten/fruendenhuette.yaml | zustiege[0].hoehenmeter | 1000 | 1130 | gesetzt |
| g2#4 | huetten/fruendenhuette.yaml | zustiege[0].hinweis | Gondel oder Bus zum Oeschinensee, ab dort 2:45 h (T3). | Gondelbahn Kandersteg–Oeschinen (im Sommer 2026 mit Zeitfenster-Reservation). Der T3-Weg … | gesetzt |
| g2#5 | huetten/windegghuette.yaml | zustiege[0].hinweis | Triftbahn bis Underi Trift (1357 m), ab dort 1:30 h (T2), Triftbrücke. | Triftbahn bis Underi Trift, ab dort 1:30 h (T2). Die Triftbahn fuhr 2026 wegen technische… | gesetzt |
| g2#6 | huetten/konkordiahuette.yaml | zustiege[0].gehzeitMin | 300 | 330 | gesetzt |
| g2#7 | huetten/konkordiahuette.yaml | zustiege[0].hoehenmeter | 700 | 1050 | gesetzt |
| g2#8 | huetten/konkordiahuette.yaml | geschaetzt | true | false | gesetzt |
| g2#10 | huetten/bluemlisalphuette.yaml | lat | 46.5 | 46.5102 | gesetzt |
| g2#11 | huetten/bluemlisalphuette.yaml | lon | 7.77 | 7.7716 | gesetzt |
| g2#12 | huetten/doldenhornhuette.yaml | lat | 46.4735 | 46.4869 | gesetzt |
| g2#13 | huetten/doldenhornhuette.yaml | lon | 7.6895 | 7.6974 | gesetzt |
| g2#14 | huetten/lauteraarhuette.yaml | zustiege[0].hoehenmeter | 450 | 950 | gesetzt |
| g2#15 | huetten/oberaletschhuette.yaml | zustiege[0].hoehenmeter | 600 | 970 | gesetzt |
| g2#16 | huetten/schreckhornhuette.yaml | zustiege[0].hoehenmeter | 1140 | 1380 | gesetzt |
| g2#17 | huetten/lohnerhuette.yaml | zustiege[0].hoehenmeter | 810 | 980 | gesetzt |
| g2#18 | huetten/monte-rosa-huette.yaml | zustiege[0].hoehenmeter | 400 | 540 | gesetzt |
| g2#19 | huetten/monte-rosa-huette.yaml | zustiege[0].hinweis | Gornergratbahn bis Rotenboden, Querung von Gorner- und Grenzgletscher, Gletscherausrüstun… | Gornergratbahn bis Rotenboden, Querung des Gornergletschers (T4), Gletscherausrüstung nöt… | gesetzt |
| g2#20 | huetten/schoenbielhuette.yaml | zustiege[0].hoehenmeter | 1090 | 1160 | gesetzt |
| g2#21 | huetten/britanniahuette.yaml | zustiege[0].hoehenmeter | 50 | 150 | gesetzt |
| g2#23 | huetten/dossenhuette.yaml | zustiege[0].gehzeitMin | 270 | 240 | gesetzt |
| g2#24 | huetten/dossenhuette.yaml | zustiege[0].hoehenmeter | 1300 | 1360 | gesetzt |
| g2#25 | huetten/loetschenpasshuette.yaml | zustiege[0].hoehenmeter | 720 | 790 | gesetzt |
| g2#26 | huetten/loetschenpasshuette.yaml | geschaetzt | true | false | gesetzt |
| g2#27 | huetten/binntalhuette.yaml | zustiege[0].hoehenmeter | 720 | 770 | gesetzt |
| g2#28 | huetten/binntalhuette.yaml | webUrl | – | http://www.cabane-binntal.ch | gesetzt |
| g2#29 | huetten/rottalhuette.yaml | zustiege[0].hoehenmeter | 1890 | 1800 | gesetzt |
| g2#30 | huetten/rothornhuette.yaml | zustiege[0].hoehenmeter | 1575 | 1620 | gesetzt |
| g2#32 | huetten/engelhornhuette.yaml | zustiege[0].hoehenmeter | 540 | 570 | gesetzt |
| g2#33 | huetten/engelhornhuette.yaml | geschaetzt | true | false | gesetzt |
| g2#36 | huetten/cabane-des-marindes.yaml | zustiege[0].haltestelleId | charmey-village | im-fang-praz-jean | gesetzt |
| g2#37 | huetten/cabane-des-marindes.yaml | zustiege[0].gehzeitMin | 240 | 210 | gesetzt |
| g2#50 | gebiete/loetschental.yaml | beschreibung | … Anenhütte im Talschluss unter dem Langgletscher, Lötschenpasshütte als Übergang ins Ber… | … Lötschenpasshütte als Übergang ins Berner Oberland. Nach dem Bergsturz von Blatten (Mai… | gesetzt |
| g2#51 | gebiete/grimsel-haslital.yaml | beschreibung | … Triftbahn im Gadmertal … | … Triftbahn im Gadmertal (2026 außer Betrieb) … | gesetzt |
| g2#52 | gebiete/kandersteg.yaml | beschreibung | Oeschinensee, Gemmipass und drei SAC-Hütten, alle direkt ab Bahnhof. … | Oeschinensee, Gemmipass und fünf SAC-Hütten (Doldenhorn, Fründen, Blüemlisalp, Balmhorn, … | gesetzt |
| g2#54 | gebiete/zermatt-mattertal.yaml | beschreibung | Sechs SAC-Hütten ab Bahnhof, … Fahrzeit knapp über fünf Stunden … | Sechs SAC-Hütten, drei davon ab Bahnhof Zermatt (Schönbiel, Rothorn, Monte Rosa über die … | gesetzt |
| g2#55 | gebiete/gantrisch-stockhorn.yaml | beschreibung | Alles ab Offenburg in dreieinhalb Stunden … | Erlenbach und Mülenen ab Offenburg in dreieinhalb Stunden, Gurnigel in rund fünf … | gesetzt |
| g2#56 | gebiete/jaun-charmey.yaml | beschreibung | Von Charmey aus führt der Zustieg zur Cabane des Marindes … | Ab der Haltestelle Im Fang, Praz-Jean (Bus 260) führt der Zustieg zur Cabane des Marindes… | gesetzt |
| g3#0 | huetten/raemsenberg.yaml | lat | 46.868 | 46.8954 | gesetzt |
| g3#1 | huetten/raemsenberg.yaml | lon | 8.712 | 8.7108 | gesetzt |
| g3#2 | huetten/raemsenberg.yaml | zustiege[0].gehzeitMin | 30 | 5 | gesetzt |
| g3#3 | huetten/raemsenberg.yaml | zustiege[0].hoehenmeter | 100 | 0 | gesetzt |
| g3#4 | huetten/raemsenberg.yaml | zustiege[0].hinweis | Luftseilbahn Biel-Kinzig bis Bergstation Biel, dann Fußweg. | Bus ab Altdorf (Linie Flüelen–Altdorf–Bürglen) bis Brügg, Luftseilbahn Biel-Kinzig in zwe… | gesetzt |
| g3#5 | huetten/raemsenberg.yaml | geschaetzt | true | false | gesetzt |
| g3#6 | huetten/cavardirashuette.yaml | saison | ganzjaehrig | sommer | gesetzt |
| g3#7 | huetten/cavardirashuette.yaml | zustiege[0].hinweis | Seilbahn Disentis–Caischavedra (Sommer an Wochenenden, Winter täglich) verkürzt auf 1:30 … | Hütte wegen Abriss und Neubau 2027 und 2028 geschlossen, Winter 2026/27 nur Schutzraum. A… | gesetzt |
| g3#8 | huetten/grialetschhuette.yaml | betreiber.sektion | St. Gallen | Davos | gesetzt |
| g3#9 | huetten/muttseehuette.yaml | zustiege[0].gehzeitMin | 210 | 240 | gesetzt |
| g3#11 | huetten/muttseehuette.yaml | zustiege[0].bergbahn | false | true | gesetzt |
| g3#12 | huetten/muttseehuette.yaml | zustiege[0].hinweis | Ab Tierfehd 2:30 h (T3); Bus Linthal–Tierfehd saisonal, spart rund 1 h Talweg. | Linthal–Tierfed 1:30 h zu Fuss oder Alpentaxi (Reservation Pflicht), Luftseilbahn Tierfed… | gesetzt |
| g3#13 | huetten/fridolinshuette.yaml | zustiege[0].gehzeitMin | 300 | 330 | gesetzt |
| g3#14 | huetten/fridolinshuette.yaml | zustiege[0].hinweis | Ab Tierfehd 4:00 h (T2); Bus Linthal–Tierfehd saisonal, spart rund 1 h Talweg. | Linthal–Tierfehd 1:30 h zu Fuss oder Alpentaxi (Reservation Pflicht), ab Tierfehd 4:00 h … | gesetzt |
| g3#15 | huetten/ringelspitzhuette.yaml | zustiege[0].hoehenmeter | 450 | 850 | gesetzt |
| g3#16 | huetten/ringelspitzhuette.yaml | zustiege[0].hinweis | Bus Flims–Fidaz–Bargis nur im Sommer; ab Bargis 2:15 h (T2). | Bus Flims–Fidaz–Bargis nur im Sommer (Ende Mai bis Mitte Oktober); ab Bargis 2:15 h (T4). | gesetzt |
| g3#19 | huetten/rugghubelhuette.yaml | lat | 46.842 | 46.8462 | gesetzt |
| g3#20 | huetten/rugghubelhuette.yaml | lon | 8.445 | 8.4627 | gesetzt |
| g3#22 | huetten/kroentenhuette.yaml | zustiege[0].gehzeitMin | 210 | 285 | gesetzt |
| g3#24 | huetten/chelenalphuette.yaml | zustiege[0].hoehenmeter | 570 | 740 | gesetzt |
| g3#25 | huetten/claridenhuette.yaml | zustiege[0].hoehenmeter | 430 | 660 | gesetzt |
| g3#26 | huetten/dammahuette.yaml | zustiege[0].gehzeitMin | 165 | 150 | gesetzt |
| g3#27 | huetten/dammahuette.yaml | zustiege[0].hoehenmeter | 650 | 760 | gesetzt |
| g3#28 | huetten/fergenhuette.yaml | zustiege[0].hoehenmeter | 950 | 1050 | gesetzt |
| g3#29 | huetten/hundsteinhuette.yaml | zustiege[0].hoehenmeter | 630 | 740 | gesetzt |
| g3#31 | huetten/voralphuette.yaml | zustiege[0].hoehenmeter | 670 | 740 | gesetzt |
| g3#32 | huetten/albert-heim-huette.yaml | zustiege[1].gehzeitMin | 180 | 210 | gesetzt |
| g3#34 | huetten/capanna-corno-gries.yaml | saison | sommer | ganzjaehrig | gesetzt |
| g3#36 | huetten/capanna-piansecco.yaml | zustiege[0].hinweis | Bus Airolo–All'Acqua (Sommer), ab Haltestelle 1 h (T2). | Bus Airolo–All'Acqua (Linie 112, im Winter wenige Kurse), ab Haltestelle 1 h (T2). | gesetzt |
| g3#39 | huetten/druesberghuette.yaml | geschaetzt | true | false | gesetzt |
| g3#45 | gebiete/airolo-bedretto.yaml | beschreibung | … im Sommer Bus bis All'Acqua und zum Nufenenpass … | … ganzjährig Bus bis All'Acqua, im Sommer weiter zum Nufenenpass … | gesetzt |
| g3#46 | gebiete/alpstein.yaml | beschreibung | … die Hundsteinhütte ist die einzige SAC-Hütte. | … die Hundsteinhütte ist die einzige SAC-Hütte auf der Appenzeller Seite (dazu die Zwingl… | gesetzt |
| g3#47 | gebiete/walensee-churfirsten-flumserberg.yaml | beschreibung | Direktzug Basel–Chur, ab Offenburg unter vier Stunden. | Über Zürich mit dem IR35, ab Offenburg unter vier Stunden. | gesetzt |
| g3#48 | gebiete/davos.yaml | beschreibung | Das Dischmatal ab Davos Dorf führt mit dem Bus bis Dürrboden … | Im Sommer fährt der Bus ab Davos Dorf durchs Dischmatal bis Dürrboden … | gesetzt |
| g3#49 | gebiete/disentis.yaml | beschreibung | … mit der Cavardirashütte auf der Tödi-Südseite, im Winter über die Seilbahn Caischavedra… | … mit der Cavardirashütte auf der Tödi-Südseite (2027 und 2028 wegen Neubau geschlossen) … | gesetzt |
| g3#50 | gebiete/linthal.yaml | beschreibung | … mit Fridolins- und Muttseehütte ab Tierfehd … | … mit Fridolins- und Muttseehütte ab Tierfehd (1,5 h zu Fuss ab Bahnhof oder Alpentaxi; z… | gesetzt |
| g4#0 | haltestellen/bielerhoehe.yaml | haltestelleId | at-PTA-Tyrol-2026_at:48:1322:0:1 | at-Fahrplandaten-Verkehrsverbund-Tirol-Flex-2026_at:48:1322:0:1 | gesetzt |
| g4#1 | huetten/schwarzwasserhuette.yaml | zustiege[0].hinweis | … Im Winter beliebtes Skitouren- und Schneeschuhziel. | … Hütte wegen Umbau geschlossen (seit 12.10.2025), Wiedereröffnung voraussichtlich 2027, … | gesetzt |
| g4#2 | huetten/schwarzwasserhuette.yaml | zustiege[0].gehzeitMin | 90 | 120 | gesetzt |
| g4#3 | huetten/freiburger-huette.yaml | zustiege[0].gehzeitMin | 30 | 50 | gesetzt |
| g4#4 | huetten/darmstaedter-huette.yaml | zustiege[0].gehzeitMin | 210 | 270 | gesetzt |
| g4#5 | huetten/darmstaedter-huette.yaml | zustiege[0].hoehenmeter | 1100 | 1150 | gesetzt |
| g4#6 | huetten/darmstaedter-huette.yaml | zustiege[0].hinweis | … mit der Rendlbahn zur Bergstation verkürzt sich der Aufstieg auf 2 bis 2:30 h. | … mit der Rendlbahn (Sommer 2026: 13.06.–17.09.) zur Bergstation verkürzt sich der Aufsti… | gesetzt |
| g4#7 | huetten/rappenseehuette.yaml | zustiege[0].gehzeitMin | 180 | 240 | gesetzt |
| g4#11 | huetten/saarbruecker-huette.yaml | zustiege[0].hinweis | Ab Bielerhöhe über die Staumauer und den Fahrweg ins Kromertal zur Hütte … | Ab Bielerhöhe hinab zum Madlenerhaus und über die Tschifernella zur Hütte unter dem Großl… | gesetzt |
| g4#12 | huetten/wiesbadener-huette.yaml | zustiege[0].hinweis | Ab Partenen mit Vermuntbahn und Tunnelbus oder Linienbus auf die Bielerhöhe, … | Ab Partenen mit Vermuntbahn und Tunnelbus (Sommer, 2026: 20.06.–04.10.) auf die Bielerhöh… | gesetzt |
| g4#13 | huetten/lindauer-huette.yaml | saison | sommer | ganzjaehrig | gesetzt |
| g4#16 | huetten/mindelheimer-huette.yaml | zustiege[0].hinweis | Walserbus ab Oberstdorf über Mittelberg bis Endhaltestelle Baad, dann durchs Bärgunttal z… | Walserbus ab Oberstdorf bis Mittelberg, ab Schwendle durchs Wildental und über die Kemptn… | gesetzt |
| g4#20 | huetten/mannheimer-huette.yaml | zustiege[0].hinweis | Lünerseebahn zur Bergstation, über die Totalphütte und den Leibersteig weiter … | Lünerseebahn zur Bergstation, über die Totalphütte weiter zur Hütte am Brandner Gletscher… | gesetzt |
| g4#21 | huetten/schwarzenberghuette.yaml | zustiege[0].gehzeitMin | 60 | 150 | gesetzt |
| g4#22 | huetten/schwarzenberghuette.yaml | zustiege[0].hinweis | Bus Linie 49 ab Sonthofen bis Hinterstein, dann Fahrweg zur Hütte … | Bus 48/49 ab Sonthofen bis Hinterstein, dann zu Fuß ca. 2,5 h; mit Giebelhausbus 50 (Mai … | gesetzt |
| g4#25 | huetten/lustenauer-huette.yaml | zustiege[0].hinweis | Landbus 47 ab Bahnhof Dornbirn aufs Bödele (Losenpass), dann über die Lustenauer Hütte-We… | Landbus 870 ab Bahnhof Dornbirn bis Schwarzenberg Bödele (halbstündlich), dann auf dem Wi… | gesetzt |
| g4#26 | huetten/lustenauer-huette.yaml | webUrl | https://www.alpenverein-vorarlberg.at/huetten | https://www.lustenauerhuette.at | gesetzt |
| g4#29 | huetten/ravensburger-huette.yaml | geschaetzt | true | false | gesetzt |
| g4#31 | gebiete/bregenzerwald.yaml | beschreibung | … Wanderungen auf der Nagelfluhkette zur Lustenauer Hütte, … | … Wanderungen vom Bödele zur Lustenauer Hütte und übers Hochälpele, … | gesetzt |
| g4#32 | gebiete/silvretta.yaml | beschreibung | Ab Partenen mit Vermuntbahn und Tunnelbus oder Linienbus auf die Bielerhöhe am Silvrettas… | Ab Partenen im Sommer mit Vermuntbahn und Tunnelbus, von Tiroler Seite mit dem Sommerbus … | gesetzt |
| g4#33 | gebiete/kleinwalsertal.yaml | beschreibung | … Schwarzwasserhütte am Hohen Ifen als Winterziel. | … Schwarzwasserhütte am Hohen Ifen als Winterziel (wegen Umbau voraussichtlich bis 2027 g… | gesetzt |
| g4#34 | gebiete/oberstdorf.yaml | beschreibung | Kürzestes deutsches Alpenziel ab Offenburg, … | Südlichster Bahnhof Deutschlands, direkt per RE ab Ulm, … | gesetzt |

## Von Hand (4)

Strukturelle Vorschläge, die das Skript nicht setzt. Was daraus wurde, steht im Abschnitt „Von Hand erledigt“.

| Nr. | Datei | Feld | alt | neu | Grund |
|---|---|---|---|---|---|
| g1#62 | gebiete/montoz.yaml | touren | Wertvolle Baukunst und ein traditionsreicher Käse; Zum lebendigen Hochmoor und feinem Têt… | entfernen (Start Bellelay, Maison de la Tête de Moine) | Feld ist eine Liste oder Tabelle, kein Einzelwert |
| g2#1 | huetten/anenhuette.yaml | (ganze Hütte) | sichtbar | ausblenden oder als geschlossen kennzeichnen bis zur Wiedereröffnung | struktureller Vorschlag ((ganze Hütte)) |
| g2#35 | haltestellen/im-fang-praz-jean.yaml | (neu) | – | { id: im-fang-praz-jean, name: "Im Fang, Praz-Jean", haltestelleId: "ch-opentransportdata… | struktureller Vorschlag ((neu)) |
| g3#42 | haltestellen/hoch-ybrig-weglosen.yaml | richtwerte | offenburg 340 / kehl 297 / lahr 352 | neu berechnen (Transitous ab Offenburg 246–262 min) | Feld ist eine Liste oder Tabelle, kein Einzelwert |

## Übersprungen (72)

Ohne belastbare Quelle; diese Vorschläge stehen in `docs/pruefliste-arbeitskreis.md`.

| Nr. | Datei | Feld | alt | neu | Grund |
|---|---|---|---|---|---|
| g1#1 | huetten/cabane-perrenoud.yaml | zustiege[0].gehzeitMin | 150 | 165 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#4 | huetten/chalet-schnepfenried.yaml | zustiege[0].hoehenmeter | 770 | 590 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#8 | huetten/hohwaldhuette.yaml | zustiege[0].hoehenmeter | 100 | 250 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#9 | huetten/hohwaldhuette.yaml | zustiege[0].hinweis | Bus Fluo 67 Barr–Le Hohwald, wenige Kurse, am Wochenende kaum. Ab Le Hohwald 30 Minuten z… | Im Winter Navette des Neiges (Linie 542) Barr–Le Hohwald–Champ du Feu, nur Mi/Sa/So; sons… | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#12 | huetten/jurahaus.yaml | zustiege[1].gehzeitMin | 180 | 240 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#15 | huetten/la-chaume-des-veaux.yaml | zustiege[0].hoehenmeter | 180 | 320 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#16 | huetten/la-chaume-des-veaux.yaml | zustiege[0].hinweis | Bus Fluo 67 Barr–Le Hohwald, wenige Kurse. Ab Le Hohwald 40 Minuten, zu Fuß ab Barr etwa … | Im Winter Navette des Neiges (Linie 542) Barr–Le Hohwald–Champ du Feu, nur Mi/Sa/So; sons… | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#21 | huetten/les-jonquilles.yaml | zustiege[0].gehzeitMin | 60 | 90 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#22 | huetten/les-jonquilles.yaml | zustiege[0].hoehenmeter | 300 | 410 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#27 | huetten/naturfreundehaus-gersbacher-hoernle.yaml | zustiege[1].gehzeitMin | 150 | 195 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#29 | huetten/naturfreundehaus-grosser-wald.yaml | zustiege[0].hoehenmeter | 150 | 90 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#31 | huetten/naturfreundehaus-kornebene.yaml | zustiege[0].hoehenmeter | 190 | 245 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#32 | huetten/naturfreundehaus-kornebene.yaml | zustiege[0].hinweis | Bus 7131 ab Biberach (Baden) Bahnhof. Bewirtschaftet, 15 Betten, Gaststätte. | Bus 7131 ab Zell am Harmersbach Bahnhof. Das Haus nennt selbst Gengenbach (9 km) als näch… | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#35 | huetten/schwenninger-huette.yaml | zustiege[0].gehzeitMin | 60 | 100 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#36 | huetten/todtnauer-huette.yaml | zustiege[0].gehzeitMin | 45 | 60 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#37 | huetten/todtnauer-huette.yaml | zustiege[0].hoehenmeter | 380 | 320 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#40 | huetten/refuge-du-grand-ventron.yaml | zustiege[0].gehzeitMin | 150 | 180 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#52 | gebiete/baden-baden-battert.yaml | beschreibung | mit Bus 205/244 | mit Bus 244 oder X44 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#53 | gebiete/kinzigtal.yaml | beschreibung | In Hausach führt ein Klettersteig über den Hausacher Felsen.  |  | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#54 | gebiete/kinzigtal.yaml | sportarten | ["wandern","klettersteig"] | ["wandern"] | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#56 | gebiete/nordrach.yaml | beschreibung | Bus 7131 ab Biberach (Baden) bis Nordrach | Bus 7131 ab Zell am Harmersbach bis Nordrach | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#58 | gebiete/dahner-felsenland.yaml | beschreibung | sonn- und feiertags von Mai bis Oktober fährt die Wieslauterbahn direkt | in der Saison fährt an Wochenenden die Wieslauterbahn (2026 erst ab 27.6., nur bis Dahn S… | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#59 | gebiete/champ-du-feu.yaml | beschreibung | der Bus nach Le Hohwald fährt selten, am Wochenende kaum. | im Winter fährt die Navette des Neiges (Linie 542) Barr–Le Hohwald–Champ du Feu mittwochs… | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#61 | gebiete/albtrauf-bad-urach.yaml | beschreibung | für Achalm und Roßberg | für die Achalm | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#63 | huetten/hohwaldhuette.yaml | zustiege[0].gehzeitMin | 30 | 60 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g1#64 | huetten/la-chaume-des-veaux.yaml | zustiege[0].gehzeitMin | 40 | 70 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#9 | huetten/konkordiahuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#22 | huetten/britanniahuette.yaml | zustiege[0].gehzeitMin | 60 | 75 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#31 | huetten/rothornhuette.yaml | webUrl | https://www.sac-oberaargau.ch/huetten/rothornhuette | http://www.rothornhuette-sac.ch | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#34 | huetten/bluemlisalphuette.yaml | webUrl | https://www.bluemlisalphuette.ch | https://www.bluemlisalphuette.com | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#38 | huetten/cabane-des-marindes.yaml | geschaetzt | true | false | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#39 | huetten/wildhornhuette.yaml | zustiege[0].gehzeitMin | 225 | 180 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#40 | huetten/wildstrubelhuette.yaml | zustiege[0].hoehenmeter | 1170 | 1280 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#41 | huetten/laemmerenhuette.yaml | zustiege[0].gehzeitMin | 210 | 240 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#42 | huetten/schoenbielhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#43 | huetten/taeschhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#44 | huetten/tierberglihuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#45 | huetten/gaulihuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#46 | huetten/oberaletschhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#47 | huetten/wildhornhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#48 | huetten/wildstrubelhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#49 | huetten/baechlitalhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g2#53 | gebiete/kandersteg.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#10 | huetten/muttseehuette.yaml | zustiege[0].hoehenmeter | 1850 | 880 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#17 | huetten/ringelspitzhuette.yaml | zustiege[1].gehzeitMin | 210 | 255 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#18 | huetten/ringelspitzhuette.yaml | zustiege[1].hoehenmeter | 920 | 1320 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#21 | huetten/rugghubelhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#23 | huetten/kroentenhuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#30 | huetten/hundsteinhuette.yaml | webUrl | https://www.sac-saentis.ch | https://www.hundstein.ch | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#33 | huetten/albert-heim-huette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#35 | huetten/capanna-corno-gries.yaml | betreiber.sektion | Rossberg | Bellinzona e Valli | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#37 | huetten/treschhuette.yaml | saison | ganzjaehrig | sommer | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#38 | huetten/etzlihuette.yaml | saison | sommer | ganzjaehrig | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#40 | huetten/planurahuette.yaml | zustiege[0].hoehenmeter | 920 | 1100 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#41 | haltestellen/bruegg-buerglen.yaml | name | Brügg (Bürglen UR), Seilbahn Biel-Kinzig | Bürglen UR, Brügg (Seilbahn Biel-Kinzig) | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#43 | haltestellen/chaeppeliberg.yaml | richtwerte.offenburg.fahrzeitMin | 361 | neu berechnen (Transitous 295–301 min) | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g3#44 | haltestellen/goeschenen.yaml | haltestelleId | eu-european-sleeper_8505119 | ID aus ch-opentransportdataswiss26 (sloid Göschenen) per Geocode ermitteln | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#8 | huetten/fiderepasshuette.yaml | zustiege[0].gehzeitMin | 150 | 180 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#9 | huetten/saarbruecker-huette.yaml | zustiege[0].gehzeitMin | 90 | 150 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#10 | huetten/saarbruecker-huette.yaml | zustiege[0].hoehenmeter | 500 | 550 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#14 | huetten/lindauer-huette.yaml | zustiege[0].gehzeitMin | 120 | 135 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#15 | huetten/tilisunahuette.yaml | zustiege[0].gehzeitMin | 180 | 240 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#17 | huetten/mindelheimer-huette.yaml | zustiege[0].hoehenmeter | 800 | 890 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#18 | huetten/mannheimer-huette.yaml | zustiege[0].gehzeitMin | 180 | 270 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#19 | huetten/mannheimer-huette.yaml | zustiege[0].hoehenmeter | 750 | 960 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#23 | huetten/lustenauer-huette.yaml | zustiege[0].gehzeitMin | 90 | 60 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#24 | huetten/lustenauer-huette.yaml | zustiege[0].hoehenmeter | 200 | 110 | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#27 | huetten/kemptner-huette.yaml | zustiege[0].hinweis | Bergsteigerbus ab Bahnhof Oberstdorf nach Spielmannsau (morgens, Stand 2024 8:45 Uhr), … | Bergsteigerbus Linie 8 ab Bahnhof Oberstdorf nach Spielmannsau (Mai bis November, etwa st… | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#28 | huetten/konstanzer-huette.yaml | webUrl | https://www.dav-konstanz.de | https://www.konstanzerhuette.com/ | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#30 | huetten/waltenbergerhaus.yaml | geschaetzt | true | false | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#35 | gebiete/nagelfluhkette.yaml | beschreibung | … in viereinhalb Stunden, … | … in knapp fünf Stunden, … | nicht belegt (`sicher: false`), geht an den Arbeitskreis |
| g4#36 | gebiete/arlberg-verwall.yaml | beschreibung | Im Sommer Gratis-Wanderbus ins Verwalltal | Im Sommer Wanderbus ins Verwalltal | nicht belegt (`sicher: false`), geht an den Arbeitskreis |

<!-- von Hand -->
