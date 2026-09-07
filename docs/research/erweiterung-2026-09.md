# Erweiterung des Datenbestands, September 2026

Stand: 7. September 2026. Ziel: Tourengebiete und Hütten, die von Offenburg mit Bahn und Bus in bis zu ca. 5 h erreichbar sind und im Datenbestand fehlten.

Methodik: Haltestellen per Transitous-Geocode (`type=STOP`, Bahnhof bevorzugt), Erreichbarkeit per Transitous-Plan ab Offenburg (`de-DELFI_de:08317:14506_G`) für Samstag, 26.09.2026, Abfahrt ab 05:00 Uhr, `numItineraries=4`; angegeben ist die **schnellste** der zurückgegebenen Itineraries (Minuten, inkl. Umsteigezeiten). `richtwerte` bleiben leer und werden mit `npm run richtwerte` berechnet. Hüttenkoordinaten aus OSM/Nominatim bzw. Hüttenseite, Zustiege aus Hüttenseite/Naturfreunde-Verzeichnis; `geschaetzt: true`, wo Gehzeit oder Höhenmeter nicht belegt sind. Touren nur mit alpenvereinaktiv-URLs, die per curl 200 lieferten; Dauer und Höhenmeter aus dem JSON-LD der Tourseite, Länge nicht übernommen.

## Neue Gebiete (30)

| Gebiet | Hauptbahnhof / Haltestelle | Fahrzeit Transitous | Typ | Hütten |
|---|---|---|---|---|
| Kaiserstuhl | Endingen a. K. Bf (38 min), Ihringen Bf (64 min) | 0:38 | Tag | – |
| Battert und Merkur (Baden-Baden) | Baden-Baden Bf (25 min), Ebersteinburg Wolfsschlucht (67 min, Bus) | 0:25 | Tag, Klettern | – |
| Murgtal | Gaggenau (53), Hörden (58), Gernsbach (60), Forbach (78), Baiersbronn (109) | 0:53 | Tag | NFH Hörden, NFH Großer Wald (Michelbach) |
| Bühlertal und Gertelbach | Bühl (Baden) Bf (19), Bühlertal Gertelbachstraße (66, Bus 264) | 0:19 | Tag / Hütte | Wiedenbachhütte (DAV Heidelberg) |
| Nordrach und Moosgebirge | Nordrach Adler (75, Bus 7131 ab Biberach) | 1:15 | Tag / Hütte | NFH Kornebene |
| Schauinsland | Freiburg, Schauinslandbahn Talstation (73) | 1:13 | Tag | – |
| Kandel ab Waldkirch | Waldkirch Bf (52) | 0:52 | Tag | – |
| Wutachschlucht und Gauchachschlucht | Bachheim Bf (130), Wutachmühle (131, Bus), Löffingen Bf (133) | 2:10 | Tag | – |
| Wiesental und Hohe Möhr | Zell i. W. Bf (116), Gersbach Post (164, Bus) | 1:56 | Tag / Hütte | NFH Gersbacher Hörnle |
| Badenweiler und Hochblauen | Badenweiler Schule (105, Bus 650 ab Müllheim) | 1:45 | Tag | – |
| Dahner Felsenland | Hinterweidenthal Ort (177, Bus), Dahn Süd (208) | 2:57 | Tag, Klettern/Klettersteig | – |
| Albtrauf Bad Urach / Reutlingen | Bad Urach Bf (188), Eningen Eninger Weide (209, Bus 7644) | 3:08 | Tag / Wanderheim | Wanderheim Eninger Weide (Albverein) |
| Blaubeuren und Blautal | Blaubeuren Bf (180) | 3:00 | Tag, Klettern | – |
| Hegau und Hohentwiel | Singen Bf (112, direkt RE 2) | 1:52 | Tag | – |
| Saverne und Haut-Barr | Saverne (55) | 0:55 | Tag | – |
| Donon ab Schirmeck | Schirmeck - La Broque (74) | 1:14 | Tag / Hütte | Refuge CV Fréconrupt |
| Wasserfallen und Passwang | Reigoldswil, Dorfplatz (145) | 2:25 | Tag | – |
| Creux du Van | Noiraigue (213) | 3:33 | Tag / Hütte | Cabane Perrenoud (SAC) |
| Gantrisch, Stockhorn und Niesen | Mülenen (197), Erlenbach i. S. (203), Gurnigel Berghaus (271) | 3:17 | Tag | – |
| Schwarzsee und Kaiseregg | Schwarzsee, Gypsera (233) | 3:53 | Tag / Hütte | NFH Aurore |
| Jaun, Gastlosen und Vanil Noir | Charmey village (265), Jaun Dorf (276) | 4:25 | Wochenende / Hütte | Cabane des Marindes (SAC) |
| Moléson und Gruyères | Moléson-sur-Gruyères (254) | 4:14 | Tag/Wochenende | – |
| Walensee: Churfirsten und Flumserberg | Unterterzen (220), Walenstadt (225), Flumserberg Tannenboden (243) | 3:40 | Tag / Hütte | Spitzmeilenhütte (SAC) |
| Brienzer Rothorn | Brienz (231), Brünig-Hasliberg (234), Sörenberg Post (237) | 3:51 | Tag / Hütte | NFH Brünig |
| Stoos und Fronalpstock | Stoos SZ (257) | 4:17 | Tag/Wochenende | – |
| Hoch-Ybrig und Druesberg | Hoch-Ybrig, Talstation Weglosen (246) | 4:06 | Tag / Hütte | Druesberghütte (privat) |
| Braunwald | Braunwald (272) | 4:32 | Wochenende | – |
| Napf und Emmental | Wasen i. E. (202), Trubschachen (219) | 3:22 | Tag / Hütte | NFH Ämmital |
| Bachtel und Zürcher Oberland | Wald ZH (199) | 3:19 | Tag | – |
| Nagelfluhkette | Immenstadt (256), Oberstaufen (290), Hochgratbahn (332, Bus 95) | 4:16 | Tag / Hütte | Staufner Haus (DAV) |

Neue Haltestellen: 52. Neue Hütten/Häuser: 15 (3 SAC, 2 DAV, 7 Naturfreunde, 3 privat/Verein: Albverein, Club Vosgien, Druesberghütte).

## Geprüft, aber verworfen

| Kandidat | Grund |
|---|---|
| Meiental (Färnigen, Sustli-/Sewenhütte) | Transitous schnellste Verbindung 6:06 h; Bus 162 Wassen–Sustenpass nur im Sommer mit wenigen Kursen. |
| Charmey, Gros Mont (Zustieg Marindes) | Haltestelle in Transitous ohne Verbindung (Saisonbus); Zustieg stattdessen ab Charmey village eingetragen. |
| Bühlertal Post (KVV) | KVV-Haltestelle in Transitous nicht routbar; stattdessen Bühlertal Gertelbachstraße (routbar, 66 min). |
| Bad Teinach-Zavelstein | Bahnhof Bad Teinach-Neubulach liegt 3 km unterhalb von Zavelstein, 103–147 min mit 2 Umstiegen über Stuttgart; geringer Mehrwert gegenüber Nordschwarzwald-Zielen mit Direktverbindung. |
| Bad Herrenalb / Bad Wildbad (Albtal, Enztal) | Erreichbar (85 bzw. 125 min), aus Zeitgründen nicht bearbeitet; Kandidat für die nächste Runde. |
| Thann / Grand Ballon (Südvogesen) | Erreichbar (130 min), nicht bearbeitet; Kandidat für die nächste Runde. |
| Oberlenningen (Schwäbische Alb) | Kein Bahnhof im Transitous-Datensatz gefunden (nur Bushaltestellen). |
| Beckenried/Klewenalp, Melchtal/Melchsee-Frutt, Sarnen | Erreichbar (188–241 min), aber ohne Alpenvereins-/Naturfreundehütte und ohne belegte ÖV-Touren; zurückgestellt. |
| Kaiserstuhl-Wanderheim, Naturfreundehaus Kandel/Schauinsland/Badenweiler | Keine Naturfreunde- oder Vereinshäuser mit Übernachtung in den Verzeichnissen (naturfreunde.de Südschwarzwald / Schwarzwald Mitte-Nord) gefunden. |
| Pfälzerwald-Häuser (NFH Bethof, Rahnenhof, Kiesbuckel) | Liegen nicht im Einzugsbereich der Dahner Haltestellen (Bethof bei Vorderweidenthal ohne Busanschluss ab Dahn), PWV-Hütten sind Tageshütten ohne Übernachtung. |
| Naturfreundehaus Heidsteinhütte (Münstertal) | Zustieg ab Bus Neuhof; das bestehende Gebiet `munstertal` ist das französische Munster, kein passendes Gebiet vorhanden und bestehende Dateien wurden nicht angefasst. |
| Naturfreundehaus Hotzenwald, Hirzwald, Urnagold, Beatenberg, Buchberghaus | Kein neues Gebiet mit passender Haltestelle angelegt. |
| Stockhütte Gurnigel, Berghaus Grön (Gantrisch) | Private Lagerhäuser, keine Koordinaten belegt; Gebiet ohne Hütte angelegt. |
| Alpenvereinaktiv-Touren für Creux du Van, Moléson, Stoos, Braunwald, Bachtel, Napf, Wasserfallen, Saverne/Donon, Blaubeuren | Keine per Web-Suche auffindbare Tour mit Start an der Haltestelle (Blaubeuren-Tour lieferte HTTP 410); `links` verweisen auf SAC-Tourenportal bzw. Alpenvereinaktiv-Gebietssuche. |

## Geschätzte Werte (geschaetzt: true)

- Cabane Perrenoud: Gehzeit 2–3 h laut Wikipedia/Hikr, 700 hm aus Höhen abgeleitet.
- Wiedenbachhütte: Zustieg ab Bühl (90 min, 150 hm) geschätzt; Haltestelle Gertelbachstraße direkt an der Hütte.
- Kornebene: 40 min / 190 hm ab Nordrach Adler aus Karte; Naturfreunde-Verzeichnis nennt nur "Gengenbach 9 km".
- Gersbacher Hörnle: 80 hm ab Gersbach Post geschätzt; Zustieg ab Zell (150 min / 570 hm) geschätzt.
- NFH Hörden: Höhe 220 m und 60 hm geschätzt (Verzeichnis ohne Höhenangabe).
- NFH Großer Wald: Höhe ~500 m (Verzeichnis), 45 min / 150 hm ab Gaggenau geschätzt.
- Wanderheim Eninger Weide: 15 min / 30 hm ab Haltestelle (1 km laut Albverein).
- Refuge Fréconrupt: 70 min / 310 hm ab Schirmeck (4 km, 630 m) geschätzt.
- Cabane des Marindes: 240 min / 1000 hm ab Charmey village (Sektion nennt 3,5 h ab Pra Jean); Koordinaten aus LV03 578783/153906 umgerechnet.
- NFH Aurore: Koordinaten (46.669/7.2865) aus Lage neben der Talstation Gypsera geschätzt.
- NFH Ämmital: 460 hm ab Wasen (690 m) abgeleitet, Gehzeit 2 h laut Haus.
- Druesberghütte: 550 hm ab Weglosen (1035 m) abgeleitet, Gehzeit 1,5–2 h laut Hütte.
- Nicht geschätzt: Spitzmeilenhütte, Staufner Haus, NFH Brünig (Werte von Hütten-/Naturfreundeseite).

## Offene Punkte

- Fahrzeiten sind Momentaufnahmen für den 26.09.2026 (Herbstfahrplan, keine Baustellenprüfung); `npm run richtwerte` liefert die verbindlichen Richtwerte.
- Wieslauterbahn nach Dahn fährt nur sonn- und feiertags Mai–Oktober; werktags Bus ab Hinterweidenthal.
- Wanderbusse Wutachschlucht (950/7258) und Ahornbus (Napf) sind saisonal bzw. reservationspflichtig.
- Bahn-IDs (`bahn`) für die neuen Haltestellen mit `npm run bahn-ids` nachziehen.
