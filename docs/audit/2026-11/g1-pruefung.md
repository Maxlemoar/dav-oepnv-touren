# Prüfung Gruppe g1 (Schwarzwald, Alb, Pfalz, Vogesen, Jura), Stand 12.11.2026

Umfang per Skript aus den YAML-Dateien ermittelt: 32 Gebiete, 29 Hütten mit diesen `gebietId`, 50 Haltestellen (Gebiete und Zustiege).
Methoden: offizielle Seiten der Betreiber (DAV-Sektionen, NaturFreunde Deutschland, SAC/CAS, FFCAM, Albverein), OpenStreetMap/Overpass
(Hüttenpositionen), EU-DEM 25 m über opentopodata.org (Höhen von Hütten und Haltestellen, daraus Höhenmeter der Zustiege),
Transitous-Abfragen Offenburg → Haltestelle für Samstag, 21.11.2026 (Abfahrt ab 05:00 Uhr) sowie Abfahrten an einzelnen Haltestellen.
Höhenmeter, die nur aus dem Geländemodell abgeleitet sind, stehen in der Korrekturliste mit `sicher: false`.

## Zusammenfassung

| Objektart | ok | korrigieren | fraglich | geschlossen / existiert nicht |
|---|---|---|---|---|
| Hütten (29) | 10 | 14 | 5 | 0 |
| Haltestellen (50) | 46 | 3 | 1 | 0 |
| Gebiete (32) | 19 | 9 | 4 | 0 |

Wichtigste Punkte:

1. **Les Jonquilles** liegt laut Häuserverzeichnis der Naturfreunde an der Route du Gaschney in Muhlbach (48.0314, 7.0572), nicht bei 48.005/7.06. Das sind knapp 3 km Abweichung. Die Quell-URL liefert 404.
2. **Chalet Schnepfenried**: Höhe 1050 m statt 1250 m, Betreiber ist die Sektion Colmar der Amis de la Nature. Geöffnet nur am Wochenende und in den Ferien.
3. **Naturfreundehaus Großer Wald**: Höhe ist rund 235 m, nicht 500 m. Das Haus liegt in Michelbach und nicht „direkt am Bahnhof“, wie das Gebiet Murgtal behauptet. Bewirtet ist es nur sonntags.
4. **Hohwaldhütte und La Chaume des Veaux**: Koordinaten 440 m bzw. 310 m daneben. Den Bus Barr–Le Hohwald gibt es nur als Navette des Neiges (Linie 542, im Winter Mi/Sa/So), ganzjährig ist keine Linie belegt.
5. **Tavannes (Montoz)**: Die Bahnstrecke Sonceboz–Moutier ist vom 8.9.2026 bis 4.9.2027 gesperrt, es fährt Ersatzbus EV8. Das Naturfreundehaus Bellevue ist laut Naturfreunde Schweiz „nicht reservierbar“.
6. **Weissenstein-Seilbahn**: Herbstrevision vom 16. bis 27.11.2026. **Schauinslandbahn**: Revision vom 16.11. bis 4.12.2026.
7. **Dahner Felsenland**: Die Wieslauterbahn fuhr 2026 erst ab 27.6., nur bis Dahn Süd, und pausiert seit September. An der Haltestelle Dahn Süd fährt sonst nichts (0 Abfahrten am Samstag).
8. **Badenweiler Schule** hat am Wochenende keine Abfahrten, die Busse 650B halten an „Badenweiler, Oberweiler“.
9. **Col de la Schlucht**: Die `haltestelleId` kennt Transitous nicht mehr, die Haltestelle hat jetzt die ID aus dem Vosges-Feed (…vosges-88_141735). Die Navette des Crêtes fuhr 2026 nur vom 30.5. bis 27.9.
10. **Naturfreundehaus Kornebene**: Das Haus selbst nennt Gengenbach (9 km) als nächste Haltestelle, einen Zustieg ab Nordrach belegt keine Quelle. Bus 7131 fährt laut Transitous ab Zell a. H., nicht ab Biberach.
11. **Jurahaus**: laut SAC-Hüttenportal 45 min und 315 Hm ab Les Prés-d'Orvin (Daten: 60 min, 250 Hm). Der Zustieg ab St-Imier ist mit 3 h zu knapp.
12. **Sandkästle (Sektionshaus)**: wird laut Sektionsseite nur an Mitglieder vermietet, hat 17 Plätze und ist Selbstversorgerhütte. Das steht bisher nirgends in den Daten.

Systematischer Hinweis: Bei vielen Hütten ist `zustiege[].haltestelleId` der Bahnhof, `gehzeitMin` gilt aber ab einer Bushaltestelle
(Ramshalde, Breitnau, Brend, Kniebis, Häusern, Kornebene, Sommerecke, Todtnauer Hütte, Hohwald, Feldberg). Wo der Hinweistext das erklärt,
ist das als ok gewertet. Die App zeigt dann aber eine zu kurze Gehzeit „ab Bahnhof“. Besser wäre ein eigenes Feld für die Busstrecke oder
die Bushaltestelle als eigene Haltestelle.

## Hütten

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| cabane-perrenoud | korrigieren | Lage und Höhe stimmen (OSM w56034247, 1419 m), aber 27 statt 23 Plätze, und außerhalb der Wochenend-Bewartung ist die Hütte geschlossen, Schlüssel gibt es nicht. | https://www.cas-neuchatel.ch/cabanes/cabane-perrenoud/ · https://www.refuges.info/point/1372 | `zustiege[0].hinweis` korrigieren (27 Plätze, Sa 11 bis So 16 Uhr bewartet, sonst geschlossen); `gehzeitMin` 150→165 (unbelegt, fraglich) |
| chalet-schnepfenried | korrigieren | Betreiber ist die Section Colmar der Amis de la Nature, Höhe 1050 m (nicht 1250 m), geöffnet nur Sa 16 bis So 16 Uhr und in den Schulferien. Für „Bus nur saisonal“ gibt es keinen Beleg. | https://ww14bew.naturfreunde.de/sites/default/files/attachments/nfh-vogesen-flyer.pdf · https://www.massif-des-vosges.fr/sit/231001216-chalet-refuge-des-amis-de-la-nature-du-schnepfenried/ | `hoehe` 1250→1050; `betreiber.sektion` → "Amis de la Nature Colmar"; `zustiege[0].hoehenmeter` 770→590 (DEM); Hinweis anpassen |
| clubhaus-backi | ok | Lage (OSM n5842143687), 1165 m, 30 Plätze, nur mit Clubmitglied mietbar und ab Gänsbrunnen „gut eine Stunde“ sind belegt. Die Seilbahn Oberdorf–Weissenstein hat vom 16. bis 27.11.2026 Revision. | https://www.sac-weissenstein.ch/clubhaus-backi.html · https://www.bls.ch/de/freizeit-und-ferien/ausfluege/solothurn-weissenstein-winter | `geschaetzt` kann für zustiege[0] entfallen; Revisionshinweis in `zustiege[1].hinweis` |
| hohwaldhuette | korrigieren | Hütte, Sektion Bergfreunde Saar, 900 m und 48 Plätze stimmen, aber die Koordinate liegt 440 m neben dem Gebäude. Ein ganzjähriger Bus nach Le Hohwald ist nicht belegt, nur die Navette des Neiges 542 im Winter. Von Le Hohwald (ca. 640 m) sind es eher 250 als 100 Hm. | https://www.bergfreunde-saar.de/hohwaldhuette · https://www.openstreetmap.org/way/275178581 · https://barr.fr/wp-content/uploads/2024/11/2024-25-flyer-navettes-des-neiges-champ-du-feu.pdf | `lat` 48.38826, `lon` 7.28265; `zustiege[0].gehzeitMin` 30→60, `hoehenmeter` 100→250 (geschätzt); Hinweis zum Bus korrigieren |
| jurahaus | korrigieren | Das SAC-Hüttenportal nennt ab Les Prés-d'Orvin 45 min und 315 Hm (T1). Bewartet an fast allen Wochenenden, 35 Plätze (SAC) bzw. 40 (Hüttenseite). Ab St-Imier über den Chasseral sind 3 h zu knapp. | https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal/jurahaus-2147469225/ · https://www.jurahaus-sac.ch/ | `zustiege[0].gehzeitMin` 60→45, `hoehenmeter` 250→315; `zustiege[1].gehzeitMin` 180→240 (geschätzt) |
| la-chaume-des-veaux | korrigieren | Das Haus gibt es (Section Strasbourg-Neudorf, 980 m, 80 Betten), die Koordinate liegt aber 310 m daneben. Für den Bus gilt dasselbe wie bei der Hohwaldhütte. Von Le Hohwald sind es ca. 320 Hm. | https://www.refuges.info/point/3148 · https://ww14bew.naturfreunde.de/sites/default/files/attachments/nfh-vogesen-flyer.pdf | `lat` 48.39247, `lon` 7.28054; `zustiege[0].gehzeitMin` 40→70, `hoehenmeter` 180→320 (geschätzt); Hinweis zum Bus korrigieren |
| les-jonquilles | korrigieren | Section Metzeral, 900 m und 31 Betten passen, aber das Haus steht an der Route du Gaschney in Muhlbach (UTM 32 355168/5321615 = 48.0314, 7.0572), knapp 3 km von der eingetragenen Position. Die Quell-URL liefert 404. | https://ww14bew.naturfreunde.de/sites/default/files/attachments/nfh-vogesen-flyer.pdf | `lat`/`lon` ersetzen; `quelle` ersetzen, `webUrl` streichen; Zustieg ab Metzeral ca. 90 min, 410 Hm (DEM, geschätzt) |
| naturfreundehaus-badener-hoehe | ok | Koordinaten exakt wie bei den Naturfreunden. Voll bewirtschaftet, 50 Betten, ab Kurhaus Sand 1,8 bis 2 km Fußweg. | https://www.naturfreunde.de/haus/naturfreundehaus-badener-hoehe | `geschaetzt: false` möglich |
| naturfreundehaus-bellevue | fraglich | Das Haus gibt es (1284 m, Koordinate wie bei Naturfreunde Schweiz, 90 min ab Tavannes/Reconvilier). Es gehört der Sektion Tavannes und ist laut Seite „nicht reservierbar“. Ob man dort übernachten kann, ist unklar. Bahn nach Tavannes bis 4.9.2027 durch Ersatzbus ersetzt. | https://naturfreunde.ch/haeuser/bellevue/ · https://latele.ch/articles/aucun-train-durant-un-an-sur-la-ligne-entre-sonceboz-et-moutier | `betreiber.sektion` → "Naturfreunde Tavannes"; Hinweis zu Reservierung und Bahnersatz; Alternative: Cabane Montoz (CAS Pierre-Pertuis, 500 m entfernt) |
| naturfreundehaus-breitnau | ok | Lage, 58 Betten und bewirtschaftet sind belegt. Bus 116 ab Hinterzarten fährt stündlich, Haltestelle Breitnau-Fahrenberg liegt 1 km entfernt. Ruhetag Di und Mi. | https://www.naturfreunde.de/haus/naturfreundehaus-breitnau-wanderhuette-am-fahrenberg | Ruhetage in den Hinweis aufnehmen; `betreiber.sektion` fehlt |
| naturfreundehaus-brend | korrigieren | Die Naturfreunde nennen ab Furtwangen Busbahnhof 6 km, 300 Hm und ca. 1,5 h, eingetragen sind 75 min. 48 Betten, Ruhetag Mo. | https://www.naturfreunde.de/haus/naturfreundehaus-brend | `zustiege[0].gehzeitMin` 75→90 |
| naturfreundehaus-feldberg | ok | Ab Feldberger Hof „ca. 1,5 Stunden“ ist belegt, ebenso 46 Betten, bewirtschaftet und Ruhetag Di. Die 100 Hm belegt keine Quelle, über den Nordhang dürfte es mehr sein. | https://www.naturfreunde.de/haus/naturfreundehaus-feldberg | – |
| naturfreundehaus-gersbacher-hoernle | korrigieren | zustiege[0] passt (1 km/20 min, 40 Betten, Mo/Di zu, Busse 7308 und 9002 laut Transitous). zustiege[1] ab Zell über die Hohe Möhr (ca. 10 km, über 550 Hm) ist mit 150 min zu knapp. | https://www.naturfreunde.de/haus/naturfreundehaus-gersbacher-hoernle | `zustiege[1].gehzeitMin` 150→195 (geschätzt) |
| naturfreundehaus-grosser-wald | korrigieren | Laut Koordinate der Naturfreunde und Geländemodell liegt das Haus auf ca. 235 m, nicht auf 500 m. Bus 253 bis Michelbach Kirche (365 m), geöffnet nur So 11 bis 18:30 Uhr, unter der Woche für Gruppen. | https://www.naturfreunde.de/haus/naturfreundehaus-grosser-wald | `hoehe` 500→235; `zustiege[0].hoehenmeter` 150→90; Öffnungszeiten in den Hinweis |
| naturfreundehaus-haeusern | ok | „Ganzjährig nur für Gruppen geöffnet“, teilbewirtschaftet, 18 Betten und 22 Lager. Bus 7319 fährt stündlich, ab Häusern 15 min. | https://www.naturfreunde.de/haus/naturfreundehaus-haeusern | – |
| naturfreundehaus-hoerden | ok | 800 m ab Stadtbahn Hörden, Selbstversorger, 12 Betten und 6 Lager (=18), Koordinaten exakt. | https://www.naturfreunde.de/haus/naturfreundehaus-hoerden | `geschaetzt: false` möglich |
| naturfreundehaus-kniebis | ok | Bus 100 Freudenstadt–Kniebis Skistadion, ab dort ca. 600 m. 48 Betten, Verpflegung nach Absprache. | https://www.naturfreunde.de/haus/naturfreundehaus-kniebis | – |
| naturfreundehaus-kornebene | fraglich | Laut Haus ist die nächste Haltestelle Gengenbach (9 km), einen Weg ab Nordrach nennt es nicht. Nordrach Adler (398 m) → Haus (640 m) sind ca. 245 Hm. Bus 7131 fährt laut Transitous ab Zell a. H. Geöffnet nur Fr–So, an Feiertagen und in den BW-Ferien, 15 Betten. | https://www.kornebene.de/haus-kornebene/ · https://www.naturfreunde.de/haus/naturfreundehaus-kornebene | Zustieg ab Nordrach belegen oder auf Gengenbach (9 km) umstellen; `hoehenmeter` 190→245; Hinweis (Zell a. H., Öffnungstage) |
| naturfreundehaus-sommerecke | korrigieren | Haus und Zustieg (4 km ab Fohrenbühl) sind belegt, aber Hornberg–Fohrenbühl ist ein Rufbus (ODM 7484/9484). | https://www.naturfreunde.de/haus/naturfreundehaus-sommerecke | Hinweis: Rufbus, vorher anmelden |
| ramshaldenhuette | ok | 51 Plätze, Selbstversorger, ganzjährig. Haltestelle Ramshalde direkt unterhalb, Bus 116 fährt stündlich. Bei Trockenheit droht Wassermangel. | https://www.dav-freiburg.de/de/huette/ramshalde.php | `geschaetzt: false` möglich |
| refuge-de-freconrupt | fraglich | Das Refuge gibt es (OSM n13905095801), „1 h ab Bahnhof Schirmeck, GR532“ ist belegt. Die Sektion „Club Vosgien Schiltigheim“ und 25 bis 30 Plätze sind es nicht. | https://www.rando-bruche.fr/pratique/refuges/ | Sektion und Plätze belegen oder streichen |
| refuge-des-trois-fours | fraglich | Ganzjährig bewartet (gardé), 40 Plätze, 1197 m und Lage passen. Die FFCAM-Seite nennt keine Sektion, „Nancy“ ist unbelegt. Die Navette des Crêtes fuhr 2026 nur vom 30.5. bis 27.9. | https://chaletrefuge3fours.ffcam.fr/ · https://booking.labresse.net/la-navette-des-cretes.html | Sektion prüfen; Hinweis „bewirtschaftet, 40 Plätze“ ergänzen |
| refuge-du-grand-ventron | fraglich | „Non gardé et fermé“, 22 Plätze, nur auf Reservierung, 1150 m: passt. Die Sektion „Hautes-Vosges“ ist unbelegt. Von Kruth (479 m) zum Gipfelgebiet sind es über 6 km und über 670 Hm, 150 min sind zu knapp. | https://refugegrandventron.ffcam.fr/ | `zustiege[0].gehzeitMin` 150→180 (geschätzt); Hinweis: Öffnung nur nach Reservierung |
| sandkaestle | korrigieren | 830 m und Lage beim ehemaligen Kurhaus Sand stimmen. Es fehlt: Die Hütte wird nur an Mitglieder vermietet, hat 17 Plätze, ist Selbstversorgerhütte, Bettzeug muss man mitbringen. | https://www.dav-offenburg.de/Sektion/H%C3%BCtten/Sandk%C3%A4stle | `zustiege[0].hinweis` ergänzen |
| schoenbrunner-huette | ok | Betreiber ist seit 2015 die Sektion Ettlingen (OSM nennt noch Mannheim, das ist veraltet). Selbstversorger, ganzjährig, 720 m, 11 Betten und 24 Lager. | https://de.wikipedia.org/wiki/Sch%C3%B6nbrunner_H%C3%BCtte · https://www.schoenbrunner-huette.de/ | – |
| schwenninger-huette | korrigieren | Selbstversorgerhütte der Sektion Baar auf ca. 800 m. Bahnhof Triberg liegt aber 6 km entfernt, 60 min sind zu kurz. 20 Plätze (Bergwelten) bzw. 16 Betten (Gruppenhaus). | https://www.bergwelten.com/h/schwenninger-huette · https://www.gruppenhaus.de/schwenninger-huette-des-dav-sektion-baar-triberg-hs3475.html | `zustiege[0].gehzeitMin` 60→100 (geschätzt) |
| todtnauer-huette | korrigieren | Privater Berggasthof (seit 2022 Saier/Roso), 1321 m. Haltestelle „Fahl, Todtnauerhütte“ (1007 m) liegt 1 km entfernt, also ca. 315 Hm, eher 60 als 45 min. zustiege[1] ist unbelegt. | https://www.schwarzwaldportal.com/todtnauer-huette.html · Transitous-Geocode de-DELFI_de:08336:3659:0:1 | `zustiege[0].gehzeitMin` 45→60, `hoehenmeter` 380→320; `webUrl` https://www.todtnauer-huette.de/ |
| wanderheim-eninger-weide | ok | 751 m, ca. 34 Betten. Bewirtung Fr–So und an Feiertagen, Übernachtung täglich, Haltestelle ca. 1 km entfernt, Bus 7644 laut Transitous. | https://tuerme-wanderheime.albverein.net/wanderheime/wanderheim-eninger-weide-hans-schenk-haus/ | `geschaetzt: false` möglich |
| wiedenbachhuette | korrigieren | Lage, Sektion Heidelberg und ganzjährig passen, die Haltestelle liegt 40 m entfernt. Es sind 31 Betten, nicht 32. | https://www.alpenvereinaktiv.com/de/selbstversorgerhuette/wiedenbachhuette/7242196/ | Hinweis „32 Betten“ → „31 Betten“ |

## Haltestellen

Transitous-Test: Offenburg → Haltestelle, Samstag 21.11.2026. Wenn nicht anders vermerkt: echte Haltestelle, Verbindung vorhanden, Koordinate weniger als 60 m von der Transitous-Position.

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| buehl | ok | RE ohne Umstieg, 19 min. | Transitous | – |
| buehlertal-gertelbachstrasse | ok | Bus 264 ab Bühl ZOB, Fahrzeit Bus 38 min, ganzjährig. | Transitous | – |
| baden-baden | ok | Fernverkehr und RE, 13–26 min. | Transitous | – |
| ebersteinburg-wolfsschlucht | ok | Busse 244 und X44 ab Baden-Baden. | Transitous | – |
| hausach | ok | 21–27 min. | Transitous | – |
| hornberg | ok | 30 min ohne Umstieg. | Transitous | – |
| triberg | ok | 43 min ohne Umstieg. | Transitous | – |
| bad-griesbach | ok | RS2 ohne Umstieg, ca. 50 min. | Transitous | – |
| freudenstadt-hbf | ok | RS1 ohne Umstieg. | Transitous | – |
| waldkirch | ok | S2 ab Freiburg. | Transitous | – |
| ihringen | ok | S1, 64–90 min. | Transitous | – |
| endingen-kaiserstuhl | ok | S5, ca. 40 min. | Transitous | – |
| gernsbach | ok | S8. | Transitous | – |
| hoerden | ok | S8. | Transitous | – |
| gaggenau | ok | S8; Bus 253 nach Michelbach etwa alle 2 h. | Transitous | – |
| forbach | ok | S8. | Transitous | – |
| baiersbronn | ok | S8/RE40. | Transitous | – |
| sand-kapelle | ok | Busse 263/264 ab Bühl, ganzjährig. | Transitous | – |
| nordrach-adler | ok | Bus 7131, aber ab Zell (Harmersbach) Bahnhof, nicht ab Biberach. Am Samstag erste Ankunft 07:56. | Transitous | siehe Gebiet nordrach |
| hinterzarten | ok | S1/S10. | Transitous | – |
| badenweiler-schule | korrigieren | Am Wochenende keine Abfahrten (die nächste ist Mo 23.11. 06:10), nur Schulkurse. Transitous lässt die Fahrt in „Badenweiler, Oberweiler“ (Bus 650B) enden und rechnet 5 min Fußweg dazu. | Transitous stoptimes de-DELFI_de:08315:5473:1:1 | `haltestelleId` → de-DELFI_de:08315:971:1:1, `name` „Badenweiler, Oberweiler“, `lat` 47.80833, `lon` 7.67088 |
| freiburg-schauinslandbahn | ok | Bus 21 ganzjährig. Die Schauinslandbahn selbst hat vom 16.11. bis 4.12.2026 Revision. | https://www.schauinslandbahn.de/en/informationen/betriebszeiten | Revision im Gebietstext erwähnen |
| zell-wiesental | ok | S6 ab Basel. | Transitous | – |
| gersbach-post | ok | Bus 7308 ab Fahrnau, Bus 9002 ab Zell, beide samstags. | Transitous | – |
| todtnau-busbahnhof | ok | Busse 140 (ab Kirchzarten) und 7300 (ab Titisee). | Transitous | – |
| feldberg-baerental | ok | S1, Bus 7300. | Transitous | – |
| loeffingen | ok | S10. | Transitous | – |
| bachheim | ok | S10. | Transitous | – |
| wutachmuehle | ok | Bus 950 ab Döggingen fährt auch an einem Novembersamstag, also nicht nur saisonal. | Transitous | – |
| seebrugg | ok | S1, Bus 7319 nach Häusern stündlich. | Transitous | – |
| singen | ok | RE2 ohne Umstieg, 114 min. | Transitous | – |
| hinterweidenthal-ort | ok | Kein Bahnhof: Transitous rechnet RB55 bis Hinterweidenthal Bahnhof plus 10 min Fußweg. An der Haltestelle fahren samstags nur Rufbuslinien 2551–2553. | Transitous | Optional: die Bahnhofshaltestelle verwenden |
| dahn-sued | korrigieren | 0 Abfahrten am Samstag. Die Haltestelle hängt an der Wieslauterbahn (2026 erst ab 27.6., seit September pausiert). Busse 250/2553 halten in „Dahn, Stadtmitte“, 5 min entfernt. | Transitous stoptimes · https://www.wochenblatt-reporter.de/dahner-felsenland/c-lokales/die-eisenbahn-kehrt-ins-dahner-felsenland-zurueck_a796863 | `haltestelleId` → de-DELFI_de:07340:3743:0:RiN, `name` „Dahn, Stadtmitte“, `lat` 49.1501, `lon` 7.77936 |
| bad-urach | ok | RB63 ab Metzingen. | Transitous | – |
| eningen-eninger-weide | ok | Bus 7644 ab Reutlingen Hbf, samstags erst 08:37. | Transitous | – |
| blaubeuren | ok | RE55 ab Ulm, 210 min. | Transitous | – |
| saverne | ok | TER/K1, 55–69 min. | Transitous | – |
| schirmeck | ok | TER, 74 min. | Transitous | – |
| barr | ok | TER, 81–96 min. | Transitous | – |
| metzeral | ok | TER, 138–153 min. | Transitous | – |
| munster | ok | TER. | Transitous | – |
| col-de-la-schlucht | korrigieren | Transitous findet die `haltestelleId` (Feed Haut-Rhin 68) nicht mehr. Unter „LE VALTIN – Col de la Schlucht“ gibt es sie im Vosges-Feed (88). Im November keine Verbindung, die Navette des Crêtes fuhr 2026 vom 30.5. bis 27.9. | Transitous-Geocode · https://booking.labresse.net/la-navette-des-cretes.html | `haltestelleId` → fr-offre-de-transport-du-reseau-fluo-grand-est-vosges-88_141735 |
| kruth | ok | TER bis Endpunkt Kruth. | Transitous | – |
| reigoldswil | ok | Busse 70/71 ab Liestal. Die Gondelbahn Wasserfallen fuhr im Winter laut Fahrplan 2024/25 nur am Wochenende und hat Revisionspausen. | Transitous · https://tp-info.ch/sites/default/files/fap/2024/pdf/2029.pdf | Hinweis im Gebiet |
| oberdorf-so | ok | S21. Die Seilbahn hat vom 16. bis 27.11.2026 Revision. | Transitous · https://www.bls.ch/de/freizeit-und-ferien/ausfluege/solothurn-weissenstein-winter | – |
| gaensbrunnen | ok | S21 (Weissensteinstrecke in Betrieb). | Transitous | – |
| st-imier | ok | RE4/R41. | Transitous | – |
| les-pres-d-orvin | ok | Bus 70 ab Biel. | Transitous | – |
| tavannes | fraglich | Die Strecke Sonceboz–Moutier ist vom 8.9.2026 bis 4.9.2027 für Züge gesperrt. Transitous führt über Ersatzbus EV8 zu „Tavannes, Rue des Eaux“. | https://latele.ch/articles/aucun-train-durant-un-an-sur-la-ligne-entre-sonceboz-et-moutier · Transitous | Sperrhinweis bis 4.9.2027; Richtwerte nach Bauende neu rechnen |
| noiraigue | ok | R21, 213–232 min. | Transitous | – |

## Gebiete

| Objekt-ID | Urteil | Befund | Quelle | Vorschlag |
|---|---|---|---|---|
| buehlertal | korrigieren | Bus 264 Bühl ZOB → Gertelbachstraße braucht laut Fahrplan 38 min, nicht 20 min. Der Rest stimmt. | Transitous | „(Bus ab Bühl Bahnhof, 20 Minuten)“ → „(Bus 264 ab Bühl Bahnhof, knapp 40 Minuten)“ |
| baden-baden-battert | korrigieren | Nach Ebersteinburg fahren laut Transitous die Linien 244 und X44. Eine Linie 205 ist nicht belegt. | Transitous | „Bus 205/244“ → „Bus 244 oder X44“ (sicher: false) |
| kinzigtal | fraglich | Einen Klettersteig am „Hausacher Felsen“ belegt keine Quelle. Sportart `klettersteig` und der Satz sind damit unbelegt. | Websuche ohne Treffer | Satz und `klettersteig` streichen, sofern nicht belegbar |
| triberg-brend | ok | Bahnhof am Westweg, Bus nach Furtwangen, Naturfreundehaus Brend: passt. | – | – |
| renchtal-kniebis | ok | Bus 100 Freudenstadt–Kniebis belegt. | Transitous | – |
| kandel-waldkirch | ok | Waldkirch 280 m → Kandel 1241 m (ca. 960 Hm), S2 halbstündlich. | – | – |
| kaiserstuhl | ok | – | Transitous | – |
| murgtal | korrigieren | Das Naturfreundehaus Großer Wald liegt in Michelbach (Bus 253), nicht am Bahnhof. | https://www.naturfreunde.de/haus/naturfreundehaus-grosser-wald | „Zwei Naturfreundehäuser in Hörden und Michelbach liegen direkt am Bahnhof.“ → „Das Naturfreundehaus Hörden liegt 800 m von der Stadtbahn, das Haus Großer Wald in Michelbach erreicht man mit Bus 253 ab Gaggenau.“ |
| schwarzwaldhochstrasse | ok | Busse 263/264 ab Bühl bis Sand ganzjährig. | Transitous | – |
| nordrach | korrigieren | Bus 7131 fährt laut Transitous ab Zell am Harmersbach (Ortenau-S-Bahn ab Biberach). Der Zustieg zur Kornebene ab Nordrach ist unbelegt. | Transitous · https://www.kornebene.de/haus-kornebene/ | „Bus 7131 ab Biberach (Baden)“ → „Bus 7131 ab Zell am Harmersbach“ (sicher: false) |
| hinterzarten-breitnau | ok | Bus 116 Richtung St. Märgen stündlich. Ramshalde direkt an der Haltestelle, Naturfreundehaus 1 km entfernt. | Transitous | – |
| badenweiler-blauen | korrigieren | Text stimmt (650B, ca. 16 min), aber die Haltestelle Schule wird am Wochenende nicht bedient. | Transitous | Haltestelle umstellen (siehe badenweiler-schule) |
| schauinsland | ok | Text stimmt. Die Bahn hat vom 16.11. bis 4.12.2026 Revision. | https://www.schauinslandbahn.de/en/informationen/betriebszeiten | Revision erwähnen, solange aktuell |
| wiesental-hohe-moehr | ok | S6 und Bus 9002 belegt. | Transitous | – |
| todtnau-belchen | fraglich | „Belchen ab dem Todtnauer Busbahnhof“: Der Belchen liegt rund 10 km westlich, ein Bus ab Todtnau dorthin ist nicht belegt. Bus 7300 über Fahl stimmt. | – | Belchen-Zugang (Belchenbus o. ä.) belegen oder Satz anpassen |
| feldberg | ok | – | Transitous | – |
| wutachschlucht | ok | Höllentalbahn hält in Löffingen und Bachheim, Bus 950 fährt sogar im November. `sommer` passt. | Transitous · https://www.wtv-online.de/freizeit/wanderbus-schluchtensteig/2026_OePNVFlyer_Schluchtensteig_compressed.pdf | – |
| schluchsee-haeusern | ok | – | Transitous | – |
| hegau-hohentwiel | ok | RE2 ohne Umstieg in 114 min. | Transitous | – |
| dahner-felsenland | korrigieren | „Sonn- und feiertags von Mai bis Oktober fährt die Wieslauterbahn direkt“ stimmt 2026 nicht: Start erst am 27.6., nur bis Dahn Süd, seit September pausiert. Die Busse 250 und 2553 sind belegt. | https://www.wochenblatt-reporter.de/dahner-felsenland/c-lokales/die-eisenbahn-kehrt-ins-dahner-felsenland-zurueck_a796863 · https://wieslauterbahn.info/ | Satz zur Wieslauterbahn vorsichtiger fassen; Haltestelle dahn-sued umstellen |
| albtrauf-bad-urach | ok | Ermstalbahn und Bus 7644 belegt. „Roßberg“ liegt nicht bei der Eninger Weide (nur Achalm). | Transitous | Optional: „für Achalm und Roßberg“ → „für die Achalm“ |
| blaubeuren | korrigieren | Laut Transitous braucht man ab Offenburg 210 min, nicht drei Stunden. | Transitous | „in drei Stunden“ → „in dreieinhalb Stunden“ |
| saverne-haut-barr | ok | 55–69 min. | Transitous | – |
| donon-schirmeck | ok | Refuge Fréconrupt „1 h ab Bahnhof Schirmeck“ belegt. | https://www.rando-bruche.fr/pratique/refuges/ | – |
| champ-du-feu | fraglich | Ein ganzjähriger Bus Barr–Le Hohwald ist nicht belegt. Im Winter fährt die Navette des Neiges 542 Barr–Le Hohwald–Champ du Feu (2025/26: 6.12. bis 8.3., Mi/Sa/So), also gerade am Wochenende. | https://barr.fr/wp-content/uploads/2024/11/2024-25-flyer-navettes-des-neiges-champ-du-feu.pdf | „der Bus … fährt selten, am Wochenende kaum“ → „im Winter fährt die Navette des Neiges (Linie 542) Mi/Sa/So, sonst kaum Busse“ |
| munstertal | korrigieren | Die Haltestellen-ID für den Col de la Schlucht ist veraltet. Saisonal ist richtig: Navette des Crêtes 2026 vom 30.5. bis 27.9. | https://booking.labresse.net/la-navette-des-cretes.html | ID ersetzen; ggf. Saisonzeitraum nennen |
| grand-ventron | ok | Kruth ist Endpunkt der Strecke, die CAF-Hütte ist unbewartet. | Transitous · https://refugegrandventron.ffcam.fr/ | – |
| wasserfallen-baselbiet | ok | Bus 70/71 ab Liestal, ca. 2,5 h. Die Gondelbahn fuhr laut Fahrplan 2024/25 im Winter nur am Wochenende. | https://tp-info.ch/sites/default/files/fap/2024/pdf/2029.pdf | Winterbetrieb (nur Wochenende) im Text erwähnen |
| weissenstein | ok | Text stimmt. Die Seilbahn hat vom 16. bis 27.11.2026 Herbstrevision. | https://www.bls.ch/de/freizeit-und-ferien/ausfluege/solothurn-weissenstein-winter | – |
| chasseral | korrigieren | „Zustieg ab St-Imier über Mont-Soleil“ ist geografisch falsch: Mont-Soleil liegt nördlich von St-Imier, der Chasseral südlich (über die Combe Grède). | Kartenlage; Tour „Combe Grède / Chasseral“ in den eigenen Daten | „über Mont-Soleil“ → „durch die Combe Grède“ |
| montoz | fraglich | Bahn nach Tavannes bis 4.9.2027 durch Ersatzbus ersetzt. Das Bellevue ist „nicht reservierbar“. Zwei der drei Touren starten in Bellelay (siehe Nebenbefunde). | https://latele.ch/articles/aucun-train-durant-un-an-sur-la-ligne-entre-sonceboz-et-moutier · https://naturfreunde.ch/haeuser/bellevue/ | Hinweis auf Bahnersatz; Übernachtung über Cabane Montoz (CAS) prüfen |
| creux-du-van | ok | Noiraigue–Soliat ca. 2 h über Ferme Robert ist plausibel, Perrenoud an Wochenenden bewartet. 213–232 min ab Offenburg. | Transitous · https://www.cas-neuchatel.ch/cabanes/cabane-perrenoud/ | – |

## Nebenbefunde Touren

- **montoz**: „Wertvolle Baukunst und ein traditionsreicher Käse“ (8483404) und „Zum lebendigen Hochmoor und feinem Tête de Moine“ (60534713) starten beide an der „ViaBerna – Maison de la Tête de Moine“ in Bellelay. Sie haben keinen Bezug zu Tavannes oder Montoz, also besser entfernen oder einem anderen Gebiet zuordnen. „Le Grimm Trail“ startet am Restaurant Le Grimm, ab Bahnhof Tavannes laut Tour 1 h 10 min zusätzlich (in `dauerMin` 110 nicht enthalten).
- **chasseral**: „Saint-Imier – Mont Soleil“ führt auf den Mont-Soleil, nicht zum Chasseral. Als Tour ab St-Imier ist sie in Ordnung, sie stützt aber die falsche Aussage in `beschreibung`.
- **kinzigtal**: Sportart `klettersteig` ohne Klettersteig-Tour und ohne Beleg.
- Ohne Touren: nordrach, blaubeuren, saverne-haut-barr, donon-schirmeck, wasserfallen-baselbiet, creux-du-van (kein Fehler, nur Hinweis).
