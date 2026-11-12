# Prüfung Gruppe g2 (Berner Oberland, Freiburger Voralpen, Emmental, Wallis), Stand 12.11.2026

Geprüft: 19 Gebiete, 39 Hütten, 40 Haltestellen (Liste per Skript aus `content/` ermittelt). Abgleich mit
OpenStreetMap (Overpass, `tourism=alpine_hut` u. a.), den Hüttenseiten im SAC-Tourenportal (Zustiege, Bewartung,
Eigentümer; Abruf 12.11.2026), der Wikipedia-Liste der SAC-Hütten, den Hütten- und Bahnseiten sowie Transitous
(Offenburg → Ziel, Samstag 21.11.2026; dazu Stichproben Sa 17.07.2027 ab einem nahen Schweizer Knoten für alle
Saisonhaltestellen und Abgleich der Haltestellenkoordinaten über `/api/v1/map/stops`).

SAC-Links in den Tabellen in Kurzform: `SAC <id>` = `https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/<id>/`.

## Zusammenfassung

| Objektart | ok | korrigieren | fraglich | geschlossen / existiert nicht |
|---|---|---|---|---|
| Hütten (39) | 18 | 16 | 4 | 1 (Anenhütte, keine Saison bis voraussichtlich 2028) |
| Haltestellen (40) | 39 | 0 | 1 | 0 |
| Gebiete (19) | 13 | 6 | 0 | 0 |

Die wichtigsten Befunde:

1. **Anenhütte geschlossen.** Seit dem Bergsturz von Blatten (28.05.2025) ist die Fafleralp für Touristen kaum
   erreichbar. Die Hütte meldet „2026 keine Sommersaison“ und hofft auf eine Wiedereröffnung spätestens 2028. Seit dem
   04.07.2026 fährt ein Postauto Lauchernalp–Fafleralp (8 Kurse, 20 Plätze, nur mit Voranmeldung).
2. **Fründenhütte:** Der T3-Normalweg vom Oeschinensee ist laut SAC „gesperrt!“ (Felssturzgebiet Spitze Stei, zuletzt
   ein Abbruch am 08.08.2026). Normalroute ist jetzt die Untere Fründschnuer, T4, 3:30–4 h, 1130 Hm (statt 2:45 h, T3).
   Für die Gondel Kandersteg–Oeschinen galt im Sommer 2026 eine Reservation mit Zeitfenster.
3. **Windegghütte / Triftbahn:** Laut Grimselwelt fuhr die Triftbahn in der ganzen Saison 2026 nicht („technical
   issues“). Ob sie 2027 fährt, ist offen. Der Zustieg in den Daten setzt die Bahn voraus. Das Gebiet Grimsel-Haslital
   nennt sie ebenfalls.
4. **Koordinaten:** Blüemlisalphütte (1,1 km daneben) und Doldenhornhütte (1,6 km) liegen außerhalb der Toleranz. Alle
   anderen 37 Hütten liegen höchstens 200 m von OSM entfernt, die Höhen stimmen auf ±10 m.
5. **Höhenmeter zu niedrig** (SAC-Werte): Lauteraar 450 statt 950, Oberaletsch 600 statt 970, Konkordia 700 statt
   1050, Schreckhorn 1140 statt 1380, Lohner 810 statt 980, Monte Rosa 400 statt 540, Britannia 50 statt 150.
6. **Cabane des Marindes:** Laut CAS Gruyère startet der Zustieg an der Bushaltestelle Pra Jean (3:30 h). In Transitous
   heißt sie „Im Fang, Praz-Jean“ (Linie 260, sloid 77758), nicht „Charmey, village“. Eine neue Haltestelle ist nötig.
7. **Geschätzte Werte belegt:** Konkordia, Lötschenpass, Engelhorn und Marindes lassen sich jetzt über SAC- bzw.
   CAS-Seite belegen, `geschaetzt` kann dort auf false. Wildhorn ab Iffigenalp (225 min), Wildstrubel, Lämmeren ab
   Kandersteg und Gauli ab Innertkirchen sind nur indirekt ableitbar und bleiben fraglich.
8. **Saisonhaltestellen bestätigt:** Für Griesalp, Iffigenalp, Grimsel Hospiz, Handegg, Räterichsboden, Steingletscher,
   Rosenlaui und Binn-Fäld findet Transitous am 21.11.2026 keine Verbindung, am 17.07.2027 schon (Linien 220, 282, 161,
   162, 164, 653). Alle anderen 32 Haltestellen sind im November erreichbar.
9. **Gebietstexte veraltet oder unstimmig:** Lötschental (Anenhütte), Kandersteg („drei SAC-Hütten, alle direkt ab
   Bahnhof“, in den Daten sind es fünf), Zermatt („sechs SAC-Hütten ab Bahnhof“, drei davon ab Randa/Täsch), Gantrisch
   („alles in dreieinhalb Stunden“, Gurnigel braucht rund fünf).
10. **Querschnittsrisiko Stop-IDs:** Alle Schweizer `haltestelleId` tragen das Feed-Präfix
    `ch-opentransportdataswiss26_…`. Transitous liefert für dieselben Haltestellen inzwischen meist schon den Feed
    `…swiss27…` (Fahrplan ab 13.12.2026). Noch lösen die 26er-IDs auf. Wenn der 2026er-Feed entfernt wird, könnten sie
    brechen. Das betrifft alle Gruppen, siehe Nebenbefunde.

## Hütten

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| almagellerhuette | ok | SAC Niesen, 2894 m, OSM 12 m entfernt; ab Saas-Almagell T2, 3:30 h, 1220 Hm, bewartet Juli–Sep. | SAC 2147000008; https://de.wikipedia.org/wiki/Liste_der_H%C3%BCtten_des_Schweizer_Alpen-Clubs | – |
| anenhuette | geschlossen | Laut Hüttenseite „2026 keine Sommersaison“, Fafleralp für Touristen länger nicht erreichbar, Wiedereröffnung „spätestens 2028“ erhofft. | https://www.anenhuette.ch ; https://www.srf.ch/news/nach-bergsturz-in-blatten-vs-abgeschnitten-auf-2300-metern-das-schicksal-der-anenhuette | Hütte ausblenden oder als geschlossen kennzeichnen, `zustiege[0].hinweis` ersetzen |
| baechlitalhuette | ok | SAC Am Albis, 2328 m; ab Räterichsboden T2, 2:15 h, 620 Hm (Daten 135 min/590 Hm); auch im Frühjahr bewartet. | SAC 2147000021 | optional `saison: ganzjaehrig` |
| balmhornhuette | ok | SAC Altels, 1956 m; ab Eggenschwand durchs Gasterntal T3, 1:30–2 h, 820 Hm, das passt zu 150 min ab Bahnhof. | SAC 2147000024 | – |
| binntalhuette | korrigieren | CAS Delémont, 2267 m; ab Fäld T2, 3 h, 770 Hm (Daten 720); Bus Binn–Fäld (Linie 653) nur im Sommer. | SAC 2147000035 | `zustiege[0].hoehenmeter` 770, `webUrl` http://www.cabane-binntal.ch |
| bluemlisalphuette | korrigieren | Koordinate 1,1 km südlich der Hütte (OSM 46.5102/7.7716); Zustiege (4 h, 1270 bzw. 1450 Hm) stimmen. | https://www.openstreetmap.org/node/11174401522 ; SAC 2147000036 | `lat` 46.5102, `lon` 7.7716; `webUrl` laut SAC .com (.ch leitet weiter) |
| britanniahuette | korrigieren | CAS Genevoise, 3030 m; ab Felskinn 1–1:30 h, 150 Hm (Daten 50 Hm); bewartet März–Mai und Juli–Sep. | SAC 2147000046 | `zustiege[0].hoehenmeter` 150, `gehzeitMin` 75 |
| cabane-des-marindes | korrigieren | CAS Gruyère, 1868 m, 37 Plätze, bewartet 18.05.–05.10.; Zustieg laut Sektion „Pra Jean (bus TPF) 3h30“, Haltestelle „Im Fang, Praz-Jean“ an Linie 260. | https://www.cas-gruyere.ch/fr/cabanes/cabane-des-marindes/ | neue Haltestelle `im-fang-praz-jean`, `gehzeitMin` 210, `geschaetzt` false |
| doldenhornhuette | korrigieren | Koordinate 1,6 km neben der Hütte (OSM 46.4869/7.6974); Zustieg 2:30 h, 750 Hm stimmt. | https://www.openstreetmap.org/way/222825784 ; SAC 2147000079 | `lat` 46.4869, `lon` 7.6974 |
| domhuette | ok | SAC Uto, 2940 m; ab Randa über Festiflüe T4, 4:30 h, 1530 Hm, bewartet Juli–Sep. | SAC 2147000081 | – |
| dossenhuette | korrigieren | SAC Oberaargau, 2663 m; ab Rosenlaui T4, 4 h, 1360 Hm (Daten 270 min/1300 Hm). | SAC 2147000082 | `gehzeitMin` 240, `hoehenmeter` 1360 |
| engelhornhuette | ok | AACB (privat), 1901 m; ab Rosenlaui T3, 1:30 h, 570 Hm; Schätzung damit belegt. | SAC 2147000088 | `hoehenmeter` 570, `geschaetzt` false |
| fruendenhuette | korrigieren | SAC Altels, 2562 m; der T3-Weg vom Oeschinensee ist laut SAC „gesperrt!“, Normalroute jetzt Untere Fründschnuer, T4, 3:30–4 h, 1130 Hm; einen Bus zum See gibt es nicht. | SAC 2147000102 ; https://www.oeschinensee.ch/?p=1322 | `gehzeitMin` 225, `hoehenmeter` 1130, `hinweis` neu (T4, Gondel-Reservation) |
| gaulihuette | fraglich | SAC Bern, 2205 m; SAC nennt 4:30 h, 1440 Hm „aus dem Urbachtal“; den Abschnitt Innertkirchen–Urbachtal zu Fuß (+1 h) belegt keine Quelle. Auch im Frühjahr bewartet. | SAC 2147000111 | `geschaetzt` bleibt true; optional `saison: ganzjaehrig` |
| gelmerhuette | ok | SAC Brugg, 2412 m; ab Bergstation Gelmerbahn T2, 2 h, 590 Hm; Gelmerbahn saisonal (Grimselwelt nennt den 05.06.–24.10.2027). | SAC 2147000112 ; https://www.grimselwelt.ch/en/?p=45448 | – |
| glecksteinhuette | ok | SAC Burgdorf, 2316 m; ab Abzweigung Gleckstein T3, 2:45–3:30 h, 850 Hm; Bus Grosse Scheidegg 14.05.–18.10.2026. | SAC 2147000118 ; https://www.postauto.ch/de/freizeitangebote/ausflugstipps/rosenlaui-linie | – |
| gspaltenhornhuette | ok | SAC Bern, 2455 m; ab Griesalp über Steineberg T3, 3:30 h, 1100 Hm. | SAC 2147000127 | – |
| konkordiahuette | korrigieren | SAC Grindelwald, 2850 m, offen; ab Fiescheralp über den Aletschgletscher 5–6 h, 1050 Hm, Gletscherausrüstung nötig; bewartet 14.03.–30.05. und 13.06.–19.09.2026. | https://www.konkordiahuette.ch/index.php/en/access-and-tours/summer ; SAC 2147000142 | `gehzeitMin` 330, `hoehenmeter` 1050, `geschaetzt` false, `saison` ganzjaehrig (Konvention) |
| laemmerenhuette | fraglich | SAC Angenstein, 2507 m; ab Gemmipass 1:30 h, 250 Hm stimmt. Für Kandersteg via Sunnbüel nennt SAC nur 6:30 h zu Fuß bzw. 5:30 h im Winter, die 210 min sind so nicht belegt. | SAC 2147000145 | `zustiege[0].gehzeitMin` eher 240 (unsicher) |
| lauteraarhuette | korrigieren | SAC Zofingen, 2393 m; ab Grimsel Hospiz T2, 4–4:30 h, aber 950 Hm (Daten 450). | SAC 2147000148 | `hoehenmeter` 950 |
| loetschenpasshuette | korrigieren | privat, 2690 m; ab Lauchernalp T2, 2:30 h, 790 Hm; bewartet im Winter (27.12.26–12.04.27) und Sommer, ohne Winterraum. | SAC 2147000159 ; https://www.loetschenpass.ch | `hoehenmeter` 790, `geschaetzt` false |
| lohnerhuette | korrigieren | SAC Wildstrubel, 2171 m; ab Adelboden T5-, 3:30 h, aber 980 Hm (Daten 810); nur teilweise bewartet (Juli–Sep). | SAC 2147000157 | `hoehenmeter` 980 |
| monte-rosa-huette | korrigieren | Sektion Monte Rosa, 2883 m, OSM 200 m entfernt; ab Rotenboden über den Gornergletscher T4, 3:30–4 h, 540 Hm. | SAC 2147000182 | `hoehenmeter` 540, `hinweis` (Grenzgletscher streichen, T4) |
| naturfreundehaus-aemmital | ok | 1150 m, Höchschwendi, ab Wasen durchs Hornbachtal 2 h; Selbstkocher, am Wochenende bewirtet. | https://naturfreunde.ch/haeuser/aemmital/ | – |
| naturfreundehaus-aurore | ok | 1070 m, 5 Gehminuten ab Gypsera, Selbstkocher, Schlafsack nötig; OSM 180 m entfernt. | https://naturfreunde.ch/haeuser/aurore/ | – |
| naturfreundehaus-bruenig | ok | Existiert (Sektion Emmenbrücke, Reservation über mos-guesthouse), 960–973 m, 5 min ab Bahnhof. | https://naturfreunde.ch/haeuser/bruenig/ | – |
| naturfreundehaus-grindelwald | ok | Terrassenweg 18, 1126 m, 15 min ab Bahnhof. Ob ganzjährig offen, sagt die Seite nicht eindeutig. | https://naturfreunde.ch/haeuser/grindelwald/ | – |
| oberaletschhuette | korrigieren | CAS Chasseral, 2640 m; ab Belalp T3, 4:30 h, aber 970 Hm (Daten 600); auch im Frühjahr bewartet. | SAC 2147000193 | `hoehenmeter` 970 |
| rothornhuette | ok | Neubau 2024 auf 3180 m bestätigt, SAC Oberaargau; ab Zermatt über Trift T3+, 4–5 h, 1620 Hm. | SAC 2147000222 ; https://www.sac-oberaargau.ch/pdf/01_Home-News/Einladung_Einweihungsfeier_Rothornhuette.pdf | `hoehenmeter` 1620, optional `webUrl` rothornhuette-sac.ch |
| rottalhuette | ok | SAC Interlaken, 2755 m; ab Stechelberg T4, 4:30–5:30 h, 1800 Hm; nur teilweise bewartet. | SAC 2147000226 | `hoehenmeter` 1800 (klein) |
| schoenbielhuette | korrigieren | CAS Monte Rosa, 2694 m; ab Zermatt T2, 4:30 h, aber 1160 Hm; bewartet März–Mai und Juli–Sep. | SAC 2147000241 | `hoehenmeter` 1160, `saison` ganzjaehrig (Konvention) |
| schreckhornhuette | korrigieren | SAC Basel, 2530 m; ab Pfingstegg T4, 4–5 h, aber 1380 Hm (Daten 1140). | SAC 2147000243 | `hoehenmeter` 1380 |
| taeschhuette | ok | SAC Uto, 2701 m, kein Neubau; ab Täsch rund 4 h, 1260 Hm, ab Täschalp 1:30 h. Einen Linienbus zur Täschalp findet Transitous nicht, belegt ist nur das Taxi. | SAC 2147000265 | `hinweis` „Bus oder Taxi“ zu „Taxi“; optional `saison: ganzjaehrig` |
| tierberglihuette | ok | SAC Baselland, 2795 m; ab Hotel Steingletscher T4, 3 h, 940 Hm; bewartet März–Okt. | SAC 2147000269 | optional `saison: ganzjaehrig` |
| weisshornhuette | ok | SAC Basel, 2932 m; ab Randa T2, 4:30 h, 1540 Hm. | SAC 2147000290 | – |
| weissmieshuette | ok | SAC Olten, 2726 m; ab Kreuzboden T2, 45 min, 330 Hm; im Winter und Sommer bewartet. | SAC 2147000291 | – |
| wildhornhuette | fraglich | CAS Moléson, 2303 m; SAC: Lenk–Iffigenalp–Hütte 5 h, 1200 Hm (passt zu z1), ab Iffigenalp nur als Winterroute (2:30–5 h, 720 Hm). 225 min für den Sommer wirken zu lang. | SAC 2147000293 | `zustiege[0].gehzeitMin` 180 (unsicher); optional `saison: ganzjaehrig` |
| wildstrubelhuette | fraglich | SAC Wildhorn, 2788 m (Daten 2793, im Rahmen); SAC: ab Lenk über Iffigenalp 6 h, 1800 Hm, abzüglich Lenk–Iffigenalp etwa 4–4:30 h, 1280 Hm. | SAC 2147000294 | `hoehenmeter` 1280 (unsicher), `geschaetzt` bleibt true |
| windegghuette | korrigieren | SAC Bern, 1886 m; ab Underi Trift T2, 1:30 h, 530 Hm. Die Triftbahn fuhr 2026 nicht, für 2027 gibt es kein Datum. | https://www.grimselwelt.ch/en/trift ; SAC 2147000295 | `hinweis` um den Bahnausfall ergänzen |

## Haltestellen

Alle 40 Haltestellen-IDs lösen in Transitous auf. Die Koordinaten liegen höchstens 153 m (Trubschachen) von der
Transitous-Haltestelle entfernt. „Nov“ steht für die Abfrage Offenburg → Ziel am Sa 21.11.2026 ab 05:00, „Sommer“ für
die Stichprobe am Sa 17.07.2027 ab einem Schweizer Knoten.

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| adelboden | ok | Ganzjährig, Nov 4:00 h, Bus 230 ab Frutigen. | Transitous | – |
| binn-faeld | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 653 Binn–Fäld. | Transitous | – |
| blatten-bei-naters | ok | Ganzjährig, Bus 624 ab Brig. | Transitous | – |
| brienz | ok | Ganzjährig; im Nov 2026 Bahnersatz (EV1) Interlaken West–Ost. | Transitous | – |
| bruenig-hasliberg | ok | Ganzjährig, Luzern-Interlaken-Express. | Transitous | – |
| charmey-village | ok | Ganzjährig, Bus 245/260. Für die Marindes ist Praz-Jean die passende Haltestelle. | Transitous | siehe Hütte |
| erlenbach-simmental | ok | Ganzjährig, GPX/S ab Spiez. | Transitous | – |
| fiesch | ok | Ganzjährig, R43 ab Brig. | Transitous | – |
| goppenstein | ok | Ganzjährig, RE1 ab Bern über die Lötschberg-Bergstrecke. | Transitous | – |
| griesalp | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 220 ab Reichenbach. | Transitous | – |
| grimsel-hospiz | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 161 ab Meiringen. | Transitous | – |
| grindelwald | ok | Ganzjährig; Nov 2026 Bahnersatz (EV3) Interlaken–Wilderswil. | Transitous | – |
| gurnigel-berghaus | ok | Auch im Winter bedient (Bus 323 ab Schwarzenburg, Abfahrt 10:20 MEZ), Ankunft ab Offenburg erst gegen 11:30 MEZ. | Transitous | – |
| handegg | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 161. | Transitous | – |
| iffigenalp | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 282 ab Lenk. | Transitous | – |
| innertkirchen | ok | Ganzjährig, R71 ab Meiringen. | Transitous | – |
| jaun-dorf | ok | Ganzjährig, Bus 245/260. | Transitous | – |
| kandersteg | ok | Ganzjährig, RE1. | Transitous | – |
| lauterbrunnen | ok | Ganzjährig; Nov 2026 Bahnersatz Interlaken–Wilderswil. | Transitous | – |
| lenk | ok | Ganzjährig. | Transitous | – |
| leukerbad | ok | Ganzjährig, Bus 471 ab Leuk. | Transitous | – |
| meiringen | ok | Ganzjährig. | Transitous | – |
| moleson-sur-gruyeres | ok | Ganzjährig, Bus 263 ab Bulle. | Transitous | – |
| muelenen | ok | Ganzjährig; die Niesenbahn fährt seit 2025/26 auch im Winter. | Transitous ; https://www.niesen.ch/en/timetable | – |
| nessental-triftbahn | fraglich | Die Haltestelle wird ganzjährig bedient (Bus 172), aber die Triftbahn, für die sie im Datensatz steht, fuhr 2026 nicht. | https://www.grimselwelt.ch/en/trift | Hinweis an Hütte und Gebiet |
| raeterichsboden | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 161. | Transitous | – |
| randa | ok | Ganzjährig, MGB. | Transitous | – |
| rosenlaui | ok (saisonal) | Bus 164 laut PostAuto 14.05.–18.10.2026, im Nov keine Verbindung. | https://www.postauto.ch/de/freizeitangebote/ausflugstipps/rosenlaui-linie | – |
| saas-almagell | ok | Ganzjährig, Bus 511/513. | Transitous | – |
| saas-fee | ok | Ganzjährig. | Transitous | – |
| saas-grund | ok | Ganzjährig. | Transitous | – |
| schwarzsee-gypsera | ok | Ganzjährig, Bus 123 ab Fribourg. | Transitous | – |
| soerenberg-post | ok | Ganzjährig, Bus 241 ab Schüpfheim. | Transitous | – |
| stechelberg | ok | Ganzjährig, Bus 141. | Transitous | – |
| steingletscher | ok (saisonal) | Nov keine Verbindung, im Sommer Bus 162. | Transitous | – |
| taesch | ok | Ganzjährig. | Transitous | – |
| trubschachen | ok | Ganzjährig. | Transitous | – |
| wasen-emmental | ok | Ganzjährig per Bus 481. Die Haltestelle heißt „Bahnhof“, Personenzüge fahren dort aber nicht. | Transitous | – |
| wiler-loetschen | ok | Ganzjährig, Bus 591 ab Goppenstein, auch nach dem Bergsturz. | Transitous | – |
| zermatt | ok | Ganzjährig. | Transitous | – |

## Gebiete

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| adelboden | ok | Bus 230 Frutigen–Adelboden Post, Lohnerhütte T5- stimmt. | SAC 2147000157 | – |
| aletsch-goms | ok | Fiesch mit Umstieg in Brig stimmt; Binn–Fäld nur im Sommer. Die Eggishornbahn wird bis 12/2028 neu gebaut, Fiesch–Fiescheralp ist nicht betroffen. | https://www.aletscharena.ch/en/here-now/live/news/article/when-will-the-new-mountain-cable-car-go-into-operation | – |
| brienzer-rothorn | ok | Dampfbahn 06.06.–25.10.2026, Sörenberg und Brünig ganzjährig, Fahrzeit rund 4 h stimmt. | https://www.interlaken.swiss/erlebnisse/poi/brienz-rothorn-bahn | – |
| gantrisch-stockhorn | korrigieren | „Alles ab Offenburg in dreieinhalb Stunden“ gilt nur für Erlenbach und Mülenen, Gurnigel braucht rund 5 h (Richtwert 298 min). | Richtwerte | `beschreibung` anpassen |
| grimsel-haslital | korrigieren | Die Triftbahn fuhr 2026 nicht, sonst stimmt alles (Busse Juni–Okt). | https://www.grimselwelt.ch/en/trift | `beschreibung` ergänzen |
| grindelwald | ok | Bus Grosse Scheidegg (Sommer), Pfingsteggbahn, Naturfreundehaus im Dorf stimmen. | – | – |
| jaun-charmey | korrigieren | Der Marindes-Zustieg beginnt in Praz-Jean (Bus 260), nicht in Charmey. | https://www.cas-gruyere.ch/fr/cabanes/cabane-des-marindes/ | `beschreibung` anpassen |
| kandersteg | korrigieren | „Drei SAC-Hütten, alle direkt ab Bahnhof“: im Datensatz sind es fünf, Balmhorn braucht den Bus und Lämmeren die Sunnbüelbahn. `saison: sommer`, obwohl eine Schneeschuhtour und die Lämmerenhütte im Winter dabei sind. | SAC 2147000145 | `beschreibung`, `saison` ganzjaehrig |
| kiental-griesalp | ok | Bus 220 ab Reichenbach (steilste Postautostrecke) nur im Sommer. | Transitous | – |
| lauterbrunnental | ok | Bus 141 bis Stechelberg, Rottal-Zustieg T4 stimmt. | – | – |
| lenk | ok | Bus Iffigenalp nur im Sommer stimmt. | Transitous | – |
| leukerbad | ok | Gemmibahn, Lämmerenhütte, Übergänge stimmen. | – | – |
| loetschental | korrigieren | „Anenhütte im Talschluss“ gilt nicht mehr: Die Hütte ist zu, und die Fafleralp ist nur per Shuttle ab Lauchernalp mit Anmeldung erreichbar. | https://www.anenhuette.ch ; https://www.srf.ch/news/schweiz/nach-bergsturz-von-blatten-aufatmen-im-hinteren-loetschental-der-oev-ist-zurueck | `beschreibung` |
| meiringen-rosenlaui | ok | Bus Rosenlaui im Sommer (Mai–Okt), Dossen- und Engelhornhütte stimmen. | https://www.postauto.ch/de/freizeitangebote/ausflugstipps/rosenlaui-linie | – |
| moleson-gruyeres | ok | Bus 263 ab Bulle, Fahrzeit rund 4:15 h. | Transitous | – |
| napf-emmental | ok | Trubschachen und Wasen erreichbar, 3:20–3:30 h. | Transitous | – |
| saastal | ok | Weissmies 45 min ab Kreuzboden; Britannia ab Felskinn 1–1:30 h, „unter einer Stunde“ ist knapp. | SAC 2147000046 | optional „in gut einer Stunde“ |
| schwarzsee-kaiseregg | ok | Bus 123 Fribourg–Gypsera, Naturfreundehaus 5 min. | Transitous | – |
| zermatt-mattertal | korrigieren | „Sechs SAC-Hütten ab Bahnhof“ widerspricht dem nächsten Satz (Dom, Weisshorn, Täsch ab Randa/Täsch); Fahrzeit 4:47 h statt „knapp über fünf“. | Richtwerte | `beschreibung` |

## Nebenbefunde Touren und Querschnitt

- **loetschental, Tour „Lötschental: Fafleralp – Anenhütte“:** Die Hütte ist bis voraussichtlich 2028 zu, die
  Fafleralp ist nur per Shuttle mit Voranmeldung erreichbar. Tour entfernen oder `oeffiTauglich: false`.
- **kandersteg, Oeschinen-Touren allgemein:** Felssturzgefahr Spitze Stei (Abbruch 08.08.2026), Sperrzone am Südostufer,
  im Sommer Gondel nur mit Zeitfenster-Reservation. Ein Hinweis im Gebiet wäre sinnvoll.
- **grimsel-haslital:** Keine Tour nutzt die Trift, nichts zu tun.
- **Stop-ID-Präfix (alle Gruppen):** `haltestelleId` verwendet `ch-opentransportdataswiss26_Parentch:1:sloid:<n>`. Die
  Transitous-Kartenabfrage liefert für 34 von 39 abgefragten g2-Haltestellen bereits `…swiss27_ch:1:sloid:<n>`. Empfehlung: nach dem
  Fahrplanwechsel `npm run richtwerte` laufen lassen. Brechen die IDs, die Stop-IDs per Geocode neu ziehen.
  Langfristig wäre eine sloid-basierte Zuordnung ohne Feed-Jahr robuster.
- **Fehlende Hütte (Hinweis):** Die Mutthornhütte (SAC Weissenstein) wurde neu gebaut, laut Medienmitteilung der Hütte ist der Bau seit 11/2025 abgeschlossen (https://mutthornhuette.ch/images/pdf/Mani/251107_MM-Bau%20Mutthornhutte%20abgeschlossen.pdf). Sie ist nicht
  im Datensatz und wäre ein Kandidat für Lauterbrunnental oder Kandersteg.
