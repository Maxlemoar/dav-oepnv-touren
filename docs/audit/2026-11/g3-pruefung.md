# Prüfung Gruppe g3 (Zentral-/Ostschweiz, Tessin-Nord), Stand 12.11.2026

Geprüft: 22 Gebiete, 38 Hütten, 43 Haltestellen (Liste per Skript aus `content/` ermittelt). Abgleich mit OpenStreetMap
(Overpass), der Wikipedia-Liste der SAC-Hütten (Stand Juni 2026, Zeiten aus dem SAC-Tourenportal), den Hütten- und
Bahnseiten, dem amtlichen Gebäudeadressverzeichnis (geo.admin.ch) und Transitous (Samstag 21.11.2026, dazu
Stichproben Sa 16.01.2027 und Sa 17.07.2027).

Wichtig zu den Transitous-Stichproben für 2027: Im Januar 2027 kennt Transitous für Offenburg nur TER-Züge über
Strasbourg (der DB-Fahrplan 2027 fehlt dort noch). Die Fahrzeiten im Januar sind deshalb zu lang und nicht
aussagekräftig. Aussagekräftig ist nur, ob die Schweizer Zubringer am Ziel überhaupt fahren.

## Zusammenfassung

| Objektart | ok | korrigieren | fraglich | geschlossen / existiert nicht |
|---|---|---|---|---|
| Hütten (38) | 17 | 18 | 2 | 1 (Cavardirashütte, Neubau 2027–2028) |
| Haltestellen (43) | 37 | 2 | 4 | 0 |
| Gebiete (22) | 15 | 6 | 1 | 0 |

Die wichtigsten Befunde:

1. **Rämsenberg (Sektionshaus):** Die Koordinaten liegen 3 km zu weit südlich (bei Oberschwand über Spiringen). Das
   Haus steht laut amtlichem Adressverzeichnis (Rämsenberg 9) auf 46.89539 / 8.71083, nur 150 m neben der Bergstation
   Biel. Der Betreiber der Bahn schreibt „nur 2 Gehminuten von der Bergstation“, also stimmen 30 min und 100 Hm nicht.
   Die Bahn fährt ganzjährig im 20-Minuten-Takt, mit Umstieg an der Mittelstation Riedlig und Mittagspause von 12 bis
   13 Uhr. Im April (Revision) fährt sie werktags nur eingeschränkt, am Wochenende normal. Ausserhalb der Fahrzeiten
   läuft sie im Automatikbetrieb (TWINT, Kreditkarte, Jetons).
2. **Cavardirashütte:** Laut Hüttenseite „Abriss/Neubau – 2027 und 2028 geschlossen“, im Winter 2026/27 ist nur der
   Schutzraum offen. Ausserdem ist sie keine Ganzjahreshütte (bewartet nur Juli bis September), und der Weg ab
   Caischavedra ist T4.
3. **Muttseehütte:** Der Zustieg ist falsch zusammengesetzt (1850 Hm in 3:30 h). Richtig ist: Linthal → Tierfed zu Fuss
   1:30 h oder mit dem Alpentaxi (Reservation Pflicht), dann die Luftseilbahn Tierfed–Kalktrittli (KLL/Axpo, Touristen
   nur von etwa Mitte Juni bis Mitte Oktober), ab der Bergstation 2:30 h (T3, oder T2 durch den Stollen). Einen Bus
   nach Tierfehd gibt es nicht, das betrifft auch die Fridolinshütte.
4. **Grialetschhütte:** Sie gehört seit dem Kauf der **Sektion Davos**, nicht St. Gallen. Laut Hüttenseite ist die
   Wintersaison 2027 die letzte Saison des jetzigen Hüttenwart-Paars.
5. **Ringelspitzhütte:** Ab Bargis ist der Weg laut SAC T4 mit 850 Hm, nicht T2 mit 450 Hm. Der Fusszustieg ab Flims
   Dorf ist damit ebenfalls zu kurz angesetzt.
6. **Rugghubelhütte:** Die Koordinaten liegen 1,4 km daneben (OSM und Wikipedia einig: 46.8462 / 8.4627).
7. **Bus Airolo–All'Acqua (Linie 112):** Er fährt laut Transitous auch im November und Januar, nicht nur im Sommer.
   Hinweis bei Piansecco und Gebietstext Airolo/Bedretto korrigieren. Nur der Abschnitt zum Nufenen (Cruina, Linie 111)
   ist Sommerbetrieb.
8. **Kröntenhütte:** Der SAC gibt ab Bodenberg 2:30–3:30 h an, ab Bahnhof Erstfeld kommen etwa 2 h dazu. 210 min sind zu
   knapp, realistisch sind etwa 285 min. Alpentaxi Erstfeld–Bodenberg ist möglich.
9. **Hoch-Ybrig Weglosen:** Die Richtwerte sind widersprüchlich: Offenburg 340 min, Kehl 297 min, Lahr 352 min.
   Transitous liefert ab Offenburg 246–262 min. Neu berechnen.
10. **Höhenmeter mehrerer SAC-Zustiege zu niedrig** (Gegensteigungen fehlen), belegt durch die SAC-Angaben:
    Chelenalp 740 statt 570, Clariden 660 statt 430, Damma 760 statt 650, Fergen 1050 statt 950, Hundstein 740 statt
    630, Voralp 740 statt 670.

## Hütten

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| raemsenberg | korrigieren | Höhe 1634 m und Betreiber DAV Offenburg stimmen, aber die Koordinaten liegen 3,0 km südlich des Hauses. Ab der Bergstation Biel sind es „2 Gehminuten“, also weder 30 min noch 100 Hm. Die Bahn hat 2 Sektionen (Brügg–Riedlig–Biel) im 20-Minuten-Takt, ganzjährig, mit Mittagspause und Automatikbetrieb. | https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=R%C3%A4msenberg%209%20B%C3%BCrglen&type=locations ; https://www.biel-kinzigag.ch/essen-schlafen/gruppenhaus-raemsenberg/ ; https://www.biel-kinzigag.ch/informationen/fahrplan/ ; https://www.dav-offenburg.de/Sektion/H%C3%BCtten/R%C3%A4msenberg | lat 46.8954, lon 8.7108; zustiege[0].gehzeitMin 5, hoehenmeter 0; hinweis neu (siehe korrekturen.yaml); geschaetzt false |
| aescher | ok | Lage und Höhe stimmen (OSM 1454 m). Der Abstieg Ebenalp (1644) → Äscher mit −190 Hm ist plausibel. Saison 2026 lief bis 1.11., der Betrieb geht 2027 weiter. | https://www.aescher.ch | – (geschaetzt kann bleiben, keine Hüttenzeit gefunden) |
| albert-heim-huette | korrigieren | Ab Tiefenbach stimmt der Zustieg (1:30/430 m). Ab Realp gibt der SAC 3:30 h an, nicht 3:00. Laut Wikipedia/SAC ist die Hütte von März bis April und Juli bis September bewartet, also Skitourenhütte. | https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs | zustiege[1].gehzeitMin 210; saison ganzjaehrig (unsicher) |
| bergseehuette | ok | 2370 m, Sektion Angenstein, ab Göscheneralp 1:30/590 m: alles stimmt mit SAC und OSM überein. | Wikipedia-Liste (s. o.) | – |
| bollenwees | ok | Lage und Höhe stimmen (OSM 1470 m). Brülisau (924 m) → 1470 m mit 550 Hm in 1:45 h ist plausibel. | https://www.bollenwees.ch | – |
| capanna-corno-gries | korrigieren | Zustieg Alp Corno/Cruina 1:00/330 m T3 stimmt. Die Hütte ist auch im März und April bewartet (Winterraum ab Oktober). Wem sie gehört, ist unklar: Wikipedia nennt Rossberg, OSM und Bergwelten nennen CAS Bellinzona e Valli. | https://www.corno-gries.ch ; https://www.bergwelten.com/h/capanna-corno-gries | saison ganzjaehrig; betreiber.sektion prüfen („Bellinzona e Valli“?) |
| capanna-cristallina | ok | 2575 m, CAS Ticino, ab Ossasco 3:45/1260 m T2, ganzjährig: stimmt. | Wikipedia-Liste | – |
| capanna-piansecco | korrigieren | Hütte und Zustieg stimmen (Wikipedia 1988 m, Abweichung 6 m). Der Bus nach All'Acqua fährt aber nicht nur im Sommer: Linie 112 hatte im Nov. 2026 und Jan. 2027 Kurse. | Transitous (Sa 21.11.2026, Sa 16.01.2027) | zustiege[0].hinweis: „(Sommer)“ streichen, „im Winter wenige Kurse“ |
| carschinahuette | ok | 2236 m, Rätia, ab St. Antönien Rüti 2:45/800 m. Der SAC nennt T1 statt T2, das ist unerheblich. | Wikipedia-Liste | – |
| cavardirashuette | geschlossen | Die Hütte wird abgerissen und neu gebaut und ist 2027 und 2028 geschlossen; im Winter 2026/27 ist nur der Schutzraum offen. Ausserhalb der Bauzeit ist sie nur Juli bis September bewartet, der Sommerweg ab Caischavedra ist T4. | https://www.cavardirashuette.ch ; https://www.bluewin.ch/en/news/mountaineers-rage-against-the-demolition-of-the-cavardiras-hut-2590309.html | saison sommer; Hinweis auf Schliessung 2027–2028 (oder Hütte bis 2029 ausblenden); hinweis T4 ergänzen |
| chelenalphuette | korrigieren | Ab Göscheneralp gibt der SAC 3:00 h/740 m an; die Gehzeit stimmt, die Höhenmeter nicht. | Wikipedia-Liste | zustiege[0].hoehenmeter 740 |
| claridenhuette | korrigieren | Ab Fisetenpass gibt der SAC 2:30 h/660 m (T3) an. Die Seilbahn Urnerboden–Fisetengrat fährt im Sommer und Winter; Saisonzeiten 2026 nicht gefunden. | Wikipedia-Liste ; https://www.freizeit.ch/?p=142 | zustiege[0].hoehenmeter 660 |
| dammahuette | korrigieren | Über das Südufer gibt der SAC 2:30 h/760 m an. | Wikipedia-Liste | zustiege[0].gehzeitMin 150, hoehenmeter 760 |
| druesberghuette | ok | Privat, 1581 m, 40 Schlafplätze. Ab Weglosen 1,5–2 h, auch im Winter über die Alpstrasse; OSM-Lage stimmt auf 10 m. | https://druesberghuette.ch/hutte-wegbeschreibung/ | geschaetzt false |
| etzlihuette | korrigieren | Lage (160 m Abweichung) und Zustieg ab Bristen 4:00 h stimmen. Die Hütte ist auch im März und teils von Januar bis April bewartet, also Skitourenhütte. | Wikipedia-Liste | saison ganzjaehrig (unsicher) |
| fergenhuette | korrigieren | Unbewartete Selbstversorgerhütte (stimmt). Ab Klosters gibt der SAC 2:45 h/1050 m an. | Wikipedia-Liste | zustiege[0].hoehenmeter 1050 |
| fridolinshuette | korrigieren | Ab Tierfehd 4:00 h stimmt. Einen Bus Linthal–Tierfehd gibt es nicht; Tierfed erreicht man nur zu Fuss (1:30 h) oder mit dem Alpentaxi (Reservation Pflicht). Ab Bahnhof Linthal sind es also gut 5:30 h. | https://www.muttseehuette.ch/lagezustieg/ ; Wikipedia-Liste | zustiege[0].gehzeitMin 330; hinweis ohne Bus, mit Alpentaxi |
| grialetschhuette | korrigieren | Eigentümerin ist seit dem Kauf die Sektion Davos (Mail grialetsch@sac-davos.ch). Der Zustieg ab Dürrboden (1:30–2 h, T1, 556 m) stimmt; im Winter fährt der Dischma-Bus tagsüber nicht bis Dürrboden. | https://www.grialetsch.ch/DE/huette/geschichte.html ; https://www.grialetsch.ch/DE/zustieg/zustieg-sommer.html | betreiber.sektion „Davos“ |
| huefihuette | ok | Ab Bristen gibt der SAC 5:00/1550 m an, nur Sommer: stimmt. | Wikipedia-Liste | – |
| hundsteinhuette | korrigieren | Ab Brülisau gibt der SAC 2:45/740 m an. Offizielle Hüttenseite ist hundstein.ch. | Wikipedia-Liste | zustiege[0].hoehenmeter 740; webUrl https://www.hundstein.ch |
| kroentenhuette | korrigieren | Der SAC gibt ab Bodenberg 2:30–3:30 h an, ab Erstfeld etwa 2 h und 500 Hm mehr. 210 min ab Bahnhof sind zu knapp. Alpentaxi bis Bodenberg möglich; teils bewartet von Februar bis Mai. | https://sac-cas.ch/en/huts-and-tours/sac-route-portal/kroentenhuette-sac-2147000143/mountain-hiking/from-erstfeld-via-bodenberg-357 | zustiege[0].gehzeitMin 285; saison ganzjaehrig (unsicher) |
| leglerhuette | ok | Ab Mettmen gibt der SAC 2:30/700 m an. Die Seilbahn Kies–Mettmen ist im Fahrplan (Juli 2027 bestätigt), fährt aber nur im Sommer. | Wikipedia-Liste ; Transitous 17.07.2027 | – |
| leutschachhuette | ok | Ab Arnisee über Nidersee gibt der SAC 2:30/850 m an, Hütte 2208 m: stimmt. | Wikipedia-Liste | – |
| lidernenhuette | ok | Mit der Seilbahn 0:15 h/30 m, ab Chäppeliberg 1:30/550 m, ganzjährig: stimmt. | Wikipedia-Liste ; https://sac-cas.ch/en/huts-and-tours/sac-route-portal/lidernenhuette-sac-2147000154/mountain-hiking/by-cablecar-386 | – |
| martinsmadhuette | ok | Ab Elm gibt der SAC 3:30/1070 m T3 an: stimmt. | Wikipedia-Liste | – |
| meglisalp | ok | Lage stimmt (OSM 1520 m). Wasserauen → Meglisalp mit 650 Hm in 2 h ist plausibel. | https://www.meglisalp.ch | – |
| muttseehuette | korrigieren | Zeit und Höhenmeter passen nicht zusammen (1850 Hm in 3:30 h). Laut Hütte: Linthal SBB → Tierfed 1:30 h zu Fuss oder Taxi, Seilbahn Tierfed–Kalktrittli (Touristen etwa Mitte Juni bis Mitte Oktober), ab Bergstation 2:30 h. Ohne Seilbahn 6–7 h (T3/T4). Bewartet etwa Mitte Juni bis Mitte Oktober. | https://www.muttseehuette.ch/lagezustieg/ ; https://www.muttseehuette.ch/bewartung/ | zustiege[0]: gehzeitMin 240, hoehenmeter 880, bergbahn true, hinweis neu |
| planurahuette | fraglich | Laut SAC ab Klausenpass 4:15 h/1100 m (WS); die 5:00 h/1350 m ab Fisetengrat sind eine Skiroute. Die eingetragenen 920 Hm ab Fisetengrat sind nicht belegt. | Wikipedia-Liste | zustiege[0].hoehenmeter eher 1100–1350, Quelle SAC-Tourenportal prüfen |
| ringelspitzhuette | korrigieren | Laut SAC ab Bargis 2:15 h, 850 Hm, **T4**, nicht T2/450 Hm. Damit ist auch der Fussweg ab Flims Dorf zu kurz angesetzt. Bus Bargis nur Ende Mai bis Mitte Oktober (stimmt). | Wikipedia-Liste ; https://www.postauto.ch/de/fahrplan-und-netz/ortsbus/flims-laax-falera | zustiege[0].hoehenmeter 850, hinweis „T4“; zustiege[1] gehzeitMin ≈255, hoehenmeter ≈1320 |
| rotondohuette | ok | Ab Realp gibt der SAC 3:30/1040 m an, ganzjährig: stimmt. | Wikipedia-Liste | – |
| rugghubelhuette | korrigieren | Die Koordinaten liegen 1,4 km westlich der Hütte. Zustieg ab Ristis 2–2,5 h/690 m stimmt. Es gibt einen offiziellen Winterzugang und Teilbewartung im Winter. | https://www.rugghubel.ch/zugang ; OSM ; Wikipedia-Liste | lat 46.8462, lon 8.4627; saison ganzjaehrig (unsicher) |
| salbithuette | ok | Ab Göschenen gibt der SAC 3:15/1010 m an: stimmt. | Wikipedia-Liste | – |
| silvrettahuette | fraglich | Wikipedia/SAC nennt „Klosters 3:45 h/1100 m“, der Eintrag rechnet 3:45 ab Monbiel plus 45 min. Welcher Startpunkt gemeint ist, liess sich nicht klären. | Wikipedia-Liste | SAC-Tourenportal prüfen |
| spannorthuette | ok | Ab Engelberg gibt der SAC 3:00/900 m T3 an: stimmt. | Wikipedia-Liste | – |
| spitzmeilenhuette | ok | Laut Hüttenseite Maschgenkamm → Hütte 2–2,5 h, 230 m auf/160 m ab (Berg Jet): stimmt. | https://www.spitzmeilenhuette.ch/zustiege | – |
| treschhuette | korrigieren | Ab Gurtnellen gibt der SAC 2:30/770 m an (stimmt). Bewartet aber nur Mai bis Oktober, also nicht ganzjährig. | Wikipedia-Liste | saison sommer |
| voralphuette | korrigieren | Ab Voralpkurve gibt der SAC 2:30/740 m an. | Wikipedia-Liste | zustiege[0].hoehenmeter 740 |
| zwinglipasshuette | ok | 1999 m (OSM), SAC Toggenburg, Saison 2026 am 22.10. beendet; Sommerbetrieb stimmt. | https://sac-toggenburg.ch | – |

## Haltestellen

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| abzw-voralp | ok | Saisonal: im November keine Verbindung, Postauto 411 Göschenen–Göscheneralp im Juli 2027 bestätigt. | Transitous 21.11.2026 / 17.07.2027 | – |
| airolo | ok | IR26/IR46, 271 min, 1 Umstieg: deckt sich mit den Richtwerten. | Transitous | – |
| all-acqua | ok | Linie 112 fährt auch im November und Januar (nicht nur im Sommer); 295 min. | Transitous 21.11.2026 / 16.01.2027 | Texte in Piansecco und Gebiet anpassen |
| alpnachstad | ok | S5 ab Luzern, 178 min. | Transitous | – |
| andermatt | ok | 276 min über Göschenen. | Transitous | – |
| appenzell | ok | 268–272 min. | Transitous | – |
| arth-goldau | ok | 191–195 min. | Transitous | – |
| braunwald | ok | Standseilbahn ganzjährig im Fahrplan, 272 min. | Transitous | – |
| bristen | ok | Bus 407 ab Amsteg, 260 min. | Transitous | – |
| bruegg-buerglen | korrigieren | Bus 413 Flüelen–Altdorf–Bürglen fährt ganzjährig, 250 min. Ab Fahrplan 2027 heisst die Haltestelle „Bürglen UR, Brügg“ (gleiche ID). | Transitous 21.11.2026 / 16.01.2027 ; https://www.biel-kinzigag.ch/informationen/anreise/ | name „Bürglen UR, Brügg (Seilbahn Biel-Kinzig)“ |
| bruelisau | ok | Bus 192 ab Weissbad, 284–288 min. | Transitous | – |
| chaeppeliberg | fraglich | Bus 541 ab Brunnen/Sisikon fährt ganzjährig, aber selten: im November früheste Ankunft 11:31. Die Richtwerte (361 min) passen nicht zu Transitous (295–301 min). | Transitous | Richtwerte neu berechnen |
| cruina | ok | Saisonal: Bus 111 (Nufenen) nur im Sommer; im November keine Verbindung, im Juli bestätigt. | Transitous | – |
| davos-dischma-duerrboden | fraglich | Im Sommer Bus 312 (Juli bestätigt). Im November und Januar nur die Abendlinie N34 mit Ankunft um 19:30, tagsüber fährt nichts bis Dürrboden. | Transitous | als Sommerhaltestelle kennzeichnen |
| davos-dorf | ok | 287–292 min. | Transitous | – |
| disentis | ok | 310 min. | Transitous | – |
| elm-dorf | ok | Bus 541 (Sernftal) ab Schwanden, 263 min. | Transitous | – |
| engelberg | ok | 203–209 min. | Transitous | – |
| erstfeld | ok | 234 min, 1 Umstieg. | Transitous | – |
| fidaz-bargis | ok | Saisonal: Ortsbus Flims–Bargis nur Ende Mai bis Mitte Oktober, Juli bestätigt; Bargis ist von der Gästekarte ausgenommen. | https://www.postauto.ch/de/fahrplan-und-netz/ortsbus/flims-laax-falera | – |
| flims-dorf-post | ok | 269 min. | Transitous | – |
| flumserberg-tannenboden | ok | Im November über Sargans mit Bus 441 (275 min statt 243), vermutlich wegen der Revision der Gondel Unterterzen. | Transitous | – |
| goeschenen | fraglich | Die Verbindung stimmt (260 min). Die `haltestelleId` stammt aber aus dem European-Sleeper-Feed (`eu-european-sleeper_8505119`), nicht aus dem Schweizer Feed; sie könnte wegfallen. | Transitous | auf ch-opentransportdataswiss26-ID umstellen |
| goescheneralp | ok | Saisonal: Postauto 411 nur im Sommer, im Juli bestätigt. | Transitous | – |
| gurtnellen-wiler | ok | Bus 401 ab Erstfeld, 262 min. | Transitous | – |
| hoch-ybrig-weglosen | korrigieren | Die Richtwerte sind unplausibel (Offenburg 340, Kehl 297, Lahr 352). Transitous liefert ab Offenburg 246–262 min mit Bus 556. | Transitous | Richtwerte neu berechnen |
| intschi | ok | Bus 401, 254 min. | Transitous | – |
| klosters-platz | ok | 268 min. | Transitous | – |
| linthal | ok | 251 min. | Transitous | – |
| mettmen | ok | Saisonal: Seilbahn Kies–Mettmen nur im Sommer, im Juli bestätigt, im November keine Verbindung. | Transitous | – |
| ossasco | ok | Linie 112 auch im Winter. | Transitous | – |
| realp | ok | 319 min. | Transitous | – |
| schwaegalp | ok | Bus 791 ab Urnäsch, 280–284 min. | Transitous | – |
| schwanden-gl | ok | 234 min. | Transitous | – |
| st-antoenien-rueti | fraglich | Im Juli fährt Bus 222 ab Küblis (311–336 min). Für Samstag 21.11.2026 und 16.01.2027 findet Transitous keine Ankunft am selben Tag (erste Ankunft So 08:16). | Transitous | im Winter prüfen (fährt der Bus nur bis St. Antönien Platz?) |
| stoos | ok | Stoosbahn im Fahrplan, 257 min. | Transitous | – |
| tiefenbach | ok | Saisonal: Postauto 681 Furka nur im Sommer, im Juli bestätigt (ab Oberwald oder Andermatt, 434 min). | Transitous | – |
| unterterzen | ok | 220 min. | Transitous | – |
| urnerboden-dorf | ok | Bus 551 ab Linthal fährt ganzjährig (Klausenpass nur im Sommer). Im Januar gibt es samstags nur eine sinnvolle Ankunft (14:55). | Transitous | – |
| wald-zh | ok | 199 min. | Transitous | – |
| walenstadt | ok | 225 min. | Transitous | – |
| wasserauen | ok | 283–287 min. | Transitous | – |
| wildhaus-dorf | ok | Bus 790 ab Wattwil bzw. 797 ab Buchs, 280–297 min. | Transitous | – |

## Gebiete

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| andermatt-furka | ok | Bahn bis Realp und Sommer-Postauto Tiefenbach stimmen. „An der Grenze von fünf Stunden“ gilt für Andermatt (4:36) und Realp (5:19); Tiefenbach braucht 6–7 h. | Transitous | – |
| goeschenen-goescheneralp | ok | Die fünf SAC-Hütten (Salbit, Voralp, Bergsee, Chelenalp, Damma) und der Sommerbus stimmen. | Transitous ; Wikipedia | – |
| reusstal-maderanertal | ok | Erstfeld, Bus 401 und Bus 407 ab Amsteg stimmen. „Kröntenhütte direkt ab Bahnhof“ heisst knapp 5 h. | Transitous ; SAC | – |
| schaechental | ok | Bus ab Altdorf (Linie 413 Flüelen–Altdorf–Bürglen) und Seilbahn Biel-Kinzig ganzjährig stimmen. | https://www.biel-kinzigag.ch/informationen/fahrplan/ | – |
| engelberg | ok | Stimmt. | – | – |
| pilatus | ok | 178 min („keine drei Stunden“) stimmt; Saison Sommer passt. | Transitous | – |
| riemenstalden | ok | Bus ab Sisikon bis Chäppeliberg, Seilbahn, Lidernen 15 min: stimmt. | SAC-Tourenportal | – |
| rigi | ok | 191 min („gut drei Stunden“) stimmt. | Transitous | – |
| hoch-ybrig | ok | Bus 556, Druesberghütte privat mit 40 Plätzen in etwa 2 h, ab Offenburg etwa 4 h: stimmt. | https://druesberghuette.ch/hutte-wegbeschreibung/ | – |
| stoos-fronalpstock | ok | Stoosbahn ab Schlattli, gut 4 h: stimmt. | Transitous | – |
| braunwald | ok | 272 min („viereinhalb Stunden“) stimmt. | Transitous | – |
| elm-sernftal | ok | Bus und Seilbahn nach Mettmen (nur Sommer) und Saison Sommer stimmen. | Transitous | – |
| linthal | korrigieren | Fridolins- und Muttseehütte „ab Tierfehd“: Tierfehd hat keinen Bus (1:30 h zu Fuss oder Taxi). Für Muttsee ist die Seilbahn Tierfed–Kalktrittli (Mitte Juni bis Mitte Oktober) entscheidend. | https://www.muttseehuette.ch/lagezustieg/ | Satz ergänzen: „Tierfehd 1,5 h zu Fuss ab Bahnhof oder Alpentaxi; Muttsee mit KLL-Seilbahn ab Tierfed (Sommer)“ |
| walensee-churfirsten-flumserberg | korrigieren | „Direktzug Basel–Chur“ stimmt so nicht: Nach Walenstadt und Unterterzen fährt der IR35 ab Zürich (bzw. S17 ab Ziegelbrücke), der IC3 Basel–Chur hält dort nicht. | Transitous | „über Zürich (IR35)“ statt „Direktzug Basel–Chur“ |
| toggenburg | ok | Bus ab Buchs (797) oder über Nesslau (790 ab Wattwil) stimmt. | Transitous | – |
| alpstein | korrigieren | „Die Hundsteinhütte ist die einzige SAC-Hütte“ stimmt nicht: Die Zwinglipasshütte (SAC Toggenburg) liegt ebenfalls im Alpstein (hier unter Toggenburg geführt). | https://sac-toggenburg.ch | „einzige SAC-Hütte auf der Nordseite“ o. ä. |
| zuercher-oberland-bachtel | ok | Wald ZH 199 min, S-Bahn ab Zürich: stimmt. | Transitous | – |
| davos | korrigieren | „Das Dischmatal … führt mit dem Bus bis Dürrboden“ gilt nur im Sommer; im Winter fährt tagsüber nichts bis Dürrboden (nur die Abendlinie N34). | Transitous ; https://www.grialetsch.ch | „im Sommer mit dem Bus bis Dürrboden“ |
| klosters-praettigau | fraglich | Klosters stimmt. Ob der Bus nach St. Antönien Rüti im Winter fährt, ist ungeklärt (siehe Haltestelle). | Transitous | prüfen |
| disentis | korrigieren | Die Cavardirashütte ist 2027 und 2028 wegen Neubau geschlossen und im Winter 2026/27 nur Schutzraum. Der Text bewirbt sie als kurzen Skitourenzustieg. | https://www.cavardirashuette.ch | Text anpassen (Schliessung 2027–2028) |
| flims | ok | Bus Bargis nur im Sommer, Segnespass: stimmt. | PostAuto | – |
| airolo-bedretto | korrigieren | „Im Sommer Bus bis All'Acqua“: Linie 112 fährt auch im Winter bis All'Acqua, nur der Nufenen (Cruina) ist Sommerbetrieb. | Transitous | „ganzjährig Bus bis All'Acqua, im Sommer weiter zum Nufenenpass“ |

## Nebenbefunde Touren

- **disentis:** Die Touren „Kronenwanderung: Disentis – Cavardirashütte“ und „Cavardirashütte – Abstieg … nach Sumvitg“
  setzen eine offene Hütte voraus, die 2027 und 2028 geschlossen ist. Vorübergehend ausblenden oder mit Hinweis versehen.
- **klosters-praettigau:** „Silvretta-Skidurchquerung Etappe 4: Silvrettahütte – Vermuntstausee“ endet in Österreich
  am Vermuntstausee. Die Silvretta-Hochalpenstrasse ist im Winter gesperrt, also ist `oeffiTauglich` (Standard true)
  fraglich.
- **Allgemein Fahrplan 2027:** Die Richtwerte stammen vom 07.09.2026. Nach dem Fahrplanwechsel am 13.12.2026 sollte
  `npm run richtwerte` neu laufen, sobald Transitous den DB-Fahrplan 2027 geladen hat (Stand heute fehlt er für Offenburg).
