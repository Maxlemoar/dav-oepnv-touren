# Maschinelle Prüfung

Erzeugt am 2026-11-12 mit `npm run audit`. Winter-Samstag 2026-11-21, Rückfahrt Sonntag 2026-11-22, nach Fahrplanwechsel 2026-12-19. Rohdaten als JSON im selben Ordner.

## Verbindungen (157 Haltestellen)

Zähler: {"winter_unerreichbar":17,"winter_keine_rueckfahrt_sonntag":18,"fahrplanwechsel_aendert_fahrzeit":49,"nach_fahrplanwechsel_keine_hinfahrt":26,"abfrage_fehlgeschlagen":2,"mehr_umstiege_als_richtwert":9,"winter_keine_fruehe_hinfahrt":1}

| Haltestelle | Region | Richtwert | Winter Sa | Rückfahrt So | Nach Wechsel | Befund |
|---|---|---|---|---|---|---|
| abzw-voralp | Uri (Zentralschweiz) | 296 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| adelboden | Berner Oberland | 240 | 05:48–10:02 (254 min, 3 U) | 17:51–22:29 | 297 min | fahrplanwechsel_aendert_fahrzeit |
| airolo | Tessin / Bedretto | 271 | 06:30–11:01 (271 min, 1 U) | 17:57–22:29 | 356 min | fahrplanwechsel_aendert_fahrzeit |
| alpnachstad | Zentralschweiz | 178 | 06:30–09:28 (178 min, 2 U) | 19:29–22:29 | 233 min | fahrplanwechsel_aendert_fahrzeit |
| andermatt | Uri (Zentralschweiz) | 276 | 06:30–11:06 (276 min, 2 U) | 17:50–22:29 | 361 min | fahrplanwechsel_aendert_fahrzeit |
| arth-goldau | Zentralschweiz | 191 | 05:48–09:16 (208 min, 2 U) | 19:15–22:29 | 246 min | fahrplanwechsel_aendert_fahrzeit |
| bad-griesbach | Nordschwarzwald | 48 | 05:00–05:48 (48 min, 0 U) | 22:01–22:48 | – | nach_fahrplanwechsel_keine_hinfahrt |
| bad-urach | Schwäbische Alb | 228 | 05:58–09:36 (218 min, 3 U) | 19:21–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| baden-baden | Nordschwarzwald | 27 | 05:58–06:11 (13 min, 0 U) | 22:19–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| badenweiler-schule | Südschwarzwald | 105 | 05:52–07:36 (104 min, 1 U) | 20:21–22:33 | – | nach_fahrplanwechsel_keine_hinfahrt |
| bielerhoehe | Vorarlberg | 474 | – | – | – | abfrage_fehlgeschlagen |
| binn-faeld | Aletsch / Goms (Wallis) | 302 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| blaubeuren | Schwäbische Alb | 244 | 05:56–09:26 (210 min, 1 U) | 19:27–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| bludenz | Vorarlberg | 302 | 05:48–10:51 (303 min, 5 U) | 17:30–22:29 | 323 min | fahrplanwechsel_aendert_fahrzeit |
| brand-luenerseebahn | Vorarlberg | 389 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| braunwald | Glarner Alpen (Glarus) | 272 | 05:48–10:32 (284 min, 3 U) | 17:25–22:29 | 327 min | fahrplanwechsel_aendert_fahrzeit |
| bregenz | Vorarlberg | 244 | 05:56–10:00 (244 min, 3 U) | 18:01–22:32 | 335 min | fahrplanwechsel_aendert_fahrzeit |
| brienz | Berner Oberland | 231 | 05:48–10:21 (273 min, 3 U) | 18:02–22:29 | 288 min | mehr_umstiege_als_richtwert |
| bruegg-buerglen | Uri (Zentralschweiz) | 250 | 05:48–10:10 (262 min, 4 U) | 18:44–22:29 | 305 min | mehr_umstiege_als_richtwert, fahrplanwechsel_aendert_fahrzeit |
| buehl | Nordschwarzwald | 19 | 05:48–06:07 (19 min, 0 U) | 21:35–21:56 | – | nach_fahrplanwechsel_keine_hinfahrt |
| chaeppeliberg | Zentralschweiz | 361 | 07:30–12:31 (301 min, 2 U) | 16:44–21:25 | 334 min | fahrplanwechsel_aendert_fahrzeit |
| col-de-la-schlucht | Vogesen | 199 | – | – | – | abfrage_fehlgeschlagen |
| cruina | Tessin / Bedretto | 354 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| davos-dischma-duerrboden | Davos (Graubünden) | 375 | erst an 20:30 | 02:00–21:25 | – | winter_keine_fruehe_hinfahrt |
| davos-dorf | Davos (Graubünden) | 287 | 05:48–10:57 (309 min, 3 U) | 17:37–22:29 | 351 min | fahrplanwechsel_aendert_fahrzeit |
| disentis | Surselva (Graubünden) | 310 | 05:48–11:09 (321 min, 3 U) | 17:10–22:29 | 364 min | fahrplanwechsel_aendert_fahrzeit |
| dornbirn | Vorarlberg | 264 | 05:56–10:19 (263 min, 4 U) | 17:39–22:29 | 351 min | fahrplanwechsel_aendert_fahrzeit |
| engelberg | Zentralschweiz | 209 | 06:30–09:53 (203 min, 2 U) | 19:02–22:29 | 257 min | fahrplanwechsel_aendert_fahrzeit |
| erlenbach-simmental | Berner Oberland | 203 | 05:48–09:28 (220 min, 2 U) | 18:30–22:29 | 263 min | fahrplanwechsel_aendert_fahrzeit |
| erstfeld | Uri (Zentralschweiz) | 234 | 05:48–09:57 (249 min, 3 U) | 19:01–22:29 | 292 min | mehr_umstiege_als_richtwert, fahrplanwechsel_aendert_fahrzeit |
| feldberg-baerental | Südschwarzwald | 128 | 05:48–07:37 (109 min, 2 U) | 20:19–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| fidaz-bargis | Surselva (Graubünden) | 307 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| fiesch | Aletsch / Goms (Wallis) | 265 | 06:30–10:55 (265 min, 3 U) | 17:55–22:29 | 350 min | fahrplanwechsel_aendert_fahrzeit |
| flims-dorf-post | Surselva (Graubünden) | 269 | 05:48–10:29 (281 min, 3 U) | 17:58–22:29 | 324 min | fahrplanwechsel_aendert_fahrzeit |
| freiburg-schauinslandbahn | Südschwarzwald | 101 | 05:48–07:23 (95 min, 2 U) | 21:36–23:00 | – | nach_fahrplanwechsel_keine_hinfahrt |
| gernsbach | Nordschwarzwald | 70 | 05:48–06:58 (70 min, 1 U) | 21:02–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| gersbach-post | Südschwarzwald | 164 | 06:42–09:26 (164 min, 2 U) | – | – | winter_keine_rueckfahrt_sonntag |
| goeschenen | Uri (Zentralschweiz) | 260 | 06:30–10:50 (260 min, 1 U) | 18:09–22:29 | 345 min | fahrplanwechsel_aendert_fahrzeit |
| goescheneralp | Uri (Zentralschweiz) | 313 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| goppenstein | Lötschental (Wallis) | 262 | 05:48–09:52 (244 min, 2 U) | 18:02–22:29 | 287 min | fahrplanwechsel_aendert_fahrzeit |
| griesalp | Berner Oberland | 340 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| grimsel-hospiz | Berner Oberland | 307 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| grindelwald | Berner Oberland | 250 | 05:48–10:10 (262 min, 3 U) | 18:17–22:29 | 305 min | mehr_umstiege_als_richtwert, fahrplanwechsel_aendert_fahrzeit |
| handegg | Berner Oberland | 293 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| hausach | Mittlerer Schwarzwald | 27 | 05:46–06:13 (27 min, 0 U) | 21:49–22:16 | – | nach_fahrplanwechsel_keine_hinfahrt |
| hinterweidenthal-ort | Pfälzerwald | 185 | 05:58–08:31 (153 min, 2 U) | 20:24–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| hinterzarten | Hochschwarzwald | 89 | 05:48–07:13 (85 min, 1 U) | 20:45–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| hoch-ybrig-weglosen | Schwyz (Zentralschweiz) | 340 | 05:48–10:10 (262 min, 4 U) | 16:45–21:25 | 331 min | fahrplanwechsel_aendert_fahrzeit |
| iffigenalp | Berner Oberland | 384 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| ihringen | Kaiserstuhl | 64 | 05:52–07:22 (90 min, 2 U) | 21:37–22:38 | – | nach_fahrplanwechsel_keine_hinfahrt |
| innertkirchen | Berner Oberland | 262 | 05:48–10:52 (304 min, 4 U) | 17:03–22:29 | 320 min | mehr_umstiege_als_richtwert |
| jaun-dorf | Freiburger Voralpen | 290 | 05:48–10:06 (258 min, 3 U) | 17:52–22:29 | 301 min | fahrplanwechsel_aendert_fahrzeit |
| kandersteg | Berner Oberland | 250 | 05:48–09:40 (232 min, 2 U) | 18:14–22:29 | 276 min | fahrplanwechsel_aendert_fahrzeit |
| klosters-platz | Prättigau (Graubünden) | 268 | 05:48–10:28 (280 min, 3 U) | 18:00–22:29 | 323 min | fahrplanwechsel_aendert_fahrzeit |
| langen-am-arlberg | Vorarlberg | 328 | 05:48–11:40 (352 min, 3 U) | 16:46–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| lauterbrunnen | Berner Oberland | 236 | 05:48–09:56 (248 min, 3 U) | 18:31–22:29 | 291 min | mehr_umstiege_als_richtwert, fahrplanwechsel_aendert_fahrzeit |
| lenk | Berner Oberland | 267 | 05:48–10:25 (277 min, 3 U) | 17:35–22:29 | 320 min | fahrplanwechsel_aendert_fahrzeit |
| leukerbad | Leukerbad / Gemmi (Wallis) | 282 | 06:30–11:12 (282 min, 4 U) | 17:43–22:29 | 367 min | fahrplanwechsel_aendert_fahrzeit |
| linthal | Glarner Alpen (Glarus) | 251 | 05:48–10:16 (268 min, 2 U) | 17:42–22:29 | 311 min | fahrplanwechsel_aendert_fahrzeit |
| loeffingen | Hochschwarzwald | 136 | 05:56–08:12 (136 min, 1 U) | 20:13–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| meiringen | Berner Oberland | 245 | 05:48–10:16 (268 min, 3 U) | 17:51–22:29 | 301 min | mehr_umstiege_als_richtwert, fahrplanwechsel_aendert_fahrzeit |
| mettmen | Glarner Alpen (Glarus) | 289 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| metzeral | Vogesen | 153 | 06:35–09:08 (153 min, 2 U) | 20:19–22:22 | 124 min | fahrplanwechsel_aendert_fahrzeit |
| moleson-sur-gruyeres | Freiburger Voralpen | 254 | 06:30–10:44 (254 min, 3 U) | 18:18–22:29 | 339 min | fahrplanwechsel_aendert_fahrzeit |
| nessental-triftbahn | Berner Oberland | 281 | 05:48–11:11 (323 min, 5 U) | 16:40–22:29 | – | mehr_umstiege_als_richtwert |
| noiraigue | Neuenburger Jura | 213 | 05:48–09:34 (226 min, 2 U) | 18:54–22:29 | 298 min | fahrplanwechsel_aendert_fahrzeit |
| nordrach-adler | Mittlerer Schwarzwald | 104 | 07:12–08:56 (104 min, 1 U) | 17:37–19:16 | – | nach_fahrplanwechsel_keine_hinfahrt |
| oberdorf-so | Solothurner Jura | 160 | 05:48–08:46 (178 min, 3 U) | 19:46–22:29 | 221 min | fahrplanwechsel_aendert_fahrzeit |
| oberstaufen | Allgäu | 346 | 05:58–11:16 (318 min, 3 U) | 17:42–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| oberstdorf | Allgäu | 299 | 05:58–11:19 (321 min, 2 U) | 17:38–22:32 | 595 min | fahrplanwechsel_aendert_fahrzeit |
| partenen-zentrum | Vorarlberg | 374 | 05:56–12:10 (374 min, 6 U) | 16:17–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| raeterichsboden | Berner Oberland | 299 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| riezlern-post | Kleinwalsertal (Allgäu) | 338 | 05:58–12:00 (362 min, 3 U) | 17:15–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| rosenlaui | Berner Oberland | 321 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| saas-fee | Saastal (Wallis) | 274 | 06:30–11:04 (274 min, 3 U) | 17:50–22:29 | 359 min | fahrplanwechsel_aendert_fahrzeit |
| sand-kapelle | Nordschwarzwald | 92 | 06:58–08:13 (75 min, 1 U) | 18:44–19:56 | – | nach_fahrplanwechsel_keine_hinfahrt |
| schruns | Vorarlberg | 328 | 05:56–11:24 (328 min, 5 U) | 17:04–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| schwanden-gl | Glarner Alpen (Glarus) | 234 | 05:48–09:54 (246 min, 2 U) | 18:34–22:29 | 290 min | fahrplanwechsel_aendert_fahrzeit |
| schwarzsee-gypsera | Freiburger Voralpen | 233 | 05:48–09:53 (245 min, 3 U) | 18:34–22:29 | 288 min | fahrplanwechsel_aendert_fahrzeit |
| seebrugg | Südschwarzwald | 145 | 05:48–07:55 (127 min, 2 U) | 20:01–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| singen | Hegau | 114 | 05:56–07:50 (114 min, 0 U) | 20:05–21:59 | 265 min | fahrplanwechsel_aendert_fahrzeit |
| sonthofen | Allgäu | 278 | 05:58–11:00 (302 min, 2 U) | 18:02–22:32 | – | nach_fahrplanwechsel_keine_hinfahrt |
| spielmannsau | Allgäu | 343 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| st-imier | Berner Jura | 210 | 05:48–09:12 (204 min, 2 U) | 18:59–22:29 | 247 min | fahrplanwechsel_aendert_fahrzeit |
| stechelberg | Berner Oberland | 257 | 05:48–10:17 (269 min, 4 U) | 18:10–22:29 | – | mehr_umstiege_als_richtwert |
| steingletscher | Berner Oberland | 316 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| stoos | Schwyz (Zentralschweiz) | 257 | 05:48–10:17 (269 min, 4 U) | 18:10–22:29 | 312 min | fahrplanwechsel_aendert_fahrzeit |
| tavannes | Berner Jura | 207 | 05:48–09:04 (196 min, 2 U) | 18:56–22:29 | 239 min | fahrplanwechsel_aendert_fahrzeit |
| tiefenbach | Uri (Zentralschweiz) | 396 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |
| todtnau-busbahnhof | Südschwarzwald | 129 | 06:42–08:51 (129 min, 2 U) | 19:53–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| triberg | Mittlerer Schwarzwald | 43 | 05:56–06:39 (43 min, 0 U) | 21:15–21:59 | – | nach_fahrplanwechsel_keine_hinfahrt |
| trubschachen | Emmental (Bern) | 219 | 05:48–09:12 (204 min, 2 U) | 18:47–22:29 | 247 min | fahrplanwechsel_aendert_fahrzeit |
| wald-zh | Zürcher Oberland | 199 | 05:48–09:19 (211 min, 3 U) | 19:18–23:00 | 254 min | fahrplanwechsel_aendert_fahrzeit |
| waldkirch | Mittlerer Schwarzwald | 60 | 05:52–06:52 (60 min, 1 U) | 21:34–22:29 | – | nach_fahrplanwechsel_keine_hinfahrt |
| walenstadt | Walensee (St. Gallen) | 225 | 05:48–09:46 (238 min, 3 U) | 18:44–22:29 | 281 min | fahrplanwechsel_aendert_fahrzeit |
| wasserauen | Alpstein (Appenzell) | 287 | 05:56–10:43 (287 min, 2 U) | 17:48–22:29 | 338 min | fahrplanwechsel_aendert_fahrzeit |
| wildhaus-dorf | Toggenburg (Ostschweiz) | 297 | 05:48–10:28 (280 min, 4 U) | 18:06–23:00 | 323 min | fahrplanwechsel_aendert_fahrzeit |
| zell-wiesental | Südschwarzwald | 116 | 05:48–07:56 (128 min, 1 U) | 20:34–22:29 | 201 min | fahrplanwechsel_aendert_fahrzeit |
| zermatt | Mattertal (Wallis) | 287 | 06:30–11:17 (287 min, 3 U) | 17:37–22:29 | 369 min | fahrplanwechsel_aendert_fahrzeit |
| zugertal-formarinsee | Vorarlberg | 394 | – | – | – | winter_unerreichbar, winter_keine_rueckfahrt_sonntag |

## Hütten (132)

Zähler: {"hoehe_passt_nicht_zu_koordinaten":7,"hoehenmeter_abweichung":11,"zustieg_weit":6,"zustieg_zu_kurz":21}

| Hütte | Höhe YAML / Gelände | Zustieg (Luftlinie, Gehzeit YAML / Schätzung, hm YAML / Gelände) | geschätzt | Befund |
|---|---|---|---|---|
| chalet-schnepfenried | 1250 / 1077 | metzeral: 3.6 km, 120/156 min, 770/599 hm | ja | hoehe_passt_nicht_zu_koordinaten |
| doldenhornhuette | 1915 / 2354 | kandersteg: 2.8 km, 150/265 min, 740/1181 hm |  | hoehe_passt_nicht_zu_koordinaten, hoehenmeter_abweichung:kandersteg |
| freiburger-huette | 1931 / 1908 | zugertal-formarinsee: 1.2 km, 30/27 min, 140/33 hm; lech-ruefiplatz: 12.5 km, 240/300 min, 550/468 hm |  | zustieg_weit:lech-ruefiplatz |
| fridolinshuette | 2111 / 2102 | linthal: 12.1 km, 300/414 min, 1460/1454 hm | ja | zustieg_weit:linthal |
| glecksteinhuette | 2317 / 2287 | grindelwald: 4.8 km, 165/298 min, 850/1245 hm |  | hoehenmeter_abweichung:grindelwald |
| grialetschhuette | 2542 / 2539 | davos-dischma-duerrboden: 3.2 km, 90/141 min, 540/542 hm; davos-dorf: 14.3 km, 270/387 min, 990/973 hm |  | zustieg_weit:davos-dorf |
| heinrich-hueter-huette | 1766 / 1771 | vandans: 6.8 km, 45/297 min, 280/1142 hm |  | zustieg_zu_kurz:vandans, hoehenmeter_abweichung:vandans |
| hohwaldhuette | 900 / 981 | barr: 13.4 km, 30/349 min, 100/778 hm | ja | zustieg_zu_kurz:barr, zustieg_weit:barr, hoehenmeter_abweichung:barr |
| huefihuette | 2334 / 2159 | bristen: 10.3 km, 300/383 min, 1570/1394 hm |  | hoehe_passt_nicht_zu_koordinaten |
| konstanzer-huette | 1688 / 1689 | st-anton-am-arlberg: 8.7 km, 90/216 min, 200/392 hm |  | zustieg_zu_kurz:st-anton-am-arlberg |
| la-chaume-des-veaux | 980 / 928 | barr: 13.1 km, 40/338 min, 180/725 hm | ja | zustieg_zu_kurz:barr, zustieg_weit:barr, hoehenmeter_abweichung:barr |
| les-jonquilles | 900 / 729 | metzeral: 1.4 km, 60/64 min, 300/251 hm | ja | hoehe_passt_nicht_zu_koordinaten |
| lindauer-huette | 1744 / 1741 | schruns: 8 km, 120/293 min, 750/1058 hm | ja | zustieg_zu_kurz:schruns, hoehenmeter_abweichung:schruns |
| lustenauer-huette | 1250 / 1246 | dornbirn: 7 km, 90/234 min, 200/817 hm | ja | zustieg_zu_kurz:dornbirn, hoehenmeter_abweichung:dornbirn |
| muttseehuette | 2501 / 2485 | linthal: 7.7 km, 210/446 min, 1850/1837 hm | ja | zustieg_zu_kurz:linthal |
| naturfreundehaus-breitnau | 1060 / 1054 | hinterzarten: 5.6 km, 20/130 min, 30/171 hm | ja | zustieg_zu_kurz:hinterzarten |
| naturfreundehaus-brend | 1150 / 1140 | triberg: 8.7 km, 75/228 min, 300/517 hm | ja | zustieg_zu_kurz:triberg |
| naturfreundehaus-bruenig | 960 / 965 | bruenig-hasliberg: 0.5 km, 5/10 min, -40/-62 hm |  | zustieg_zu_kurz:bruenig-hasliberg |
| naturfreundehaus-gersbacher-hoernle | 994 / 989 | gersbach-post: 1.6 km, 20/45 min, 80/126 hm; zell-wiesental: 5.1 km, 150/163 min, 570/557 hm | ja | zustieg_zu_kurz:gersbach-post |
| naturfreundehaus-grosser-wald | 500 / 240 | gaggenau: 2.3 km, 45/57 min, 150/96 hm | ja | hoehe_passt_nicht_zu_koordinaten |
| naturfreundehaus-haeusern | 920 / 952 | seebrugg: 5.1 km, 15/103 min, 40/-15 hm |  | zustieg_zu_kurz:seebrugg |
| naturfreundehaus-kniebis | 920 / 920 | freudenstadt-hbf: 9.6 km, 10/219 min, 0/250 hm; bad-griesbach: 5.5 km, 150/157 min, 450/453 hm | ja | zustieg_zu_kurz:freudenstadt-hbf |
| naturfreundehaus-sommerecke | 800 / 774 | hornberg: 5.4 km, 60/150 min, 50/395 hm | ja | zustieg_zu_kurz:hornberg, hoehenmeter_abweichung:hornberg |
| raemsenberg | 1634 / 1238 | bruegg-buerglen: 2.5 km, 30/142 min, 100/586 hm, Bahn | ja | hoehe_passt_nicht_zu_koordinaten |
| ramshaldenhuette | 1035 / 1052 | hinterzarten: 5.3 km, 5/124 min, 0/169 hm | ja | zustieg_zu_kurz:hinterzarten |
| ravensburger-huette | 1948 / 1955 | lech-ruefiplatz: 5.8 km, 45/169 min, 120/515 hm | ja | zustieg_zu_kurz:lech-ruefiplatz, hoehenmeter_abweichung:lech-ruefiplatz |
| rugghubelhuette | 2294 / 1792 | engelberg: 4.1 km, 135/199 min, 700/788 hm, Bahn; engelberg: 4.1 km, 240/199 min, 1290/788 hm |  | hoehe_passt_nicht_zu_koordinaten, hoehenmeter_abweichung:engelberg |
| schwarzenberghuette | 1380 / 1446 | hinterstein-gruener-hut: 5.2 km, 60/168 min, 520/579 hm | ja | zustieg_zu_kurz:hinterstein-gruener-hut |
| schwarzwasserhuette | 1620 / 1628 | riezlern-post: 8.3 km, 90/223 min, 380/537 hm |  | zustieg_zu_kurz:riezlern-post |
| silvrettahuette | 2341 / 2336 | klosters-platz: 12.3 km, 270/364 min, 1150/1141 hm | ja | zustieg_weit:klosters-platz |
| tilisunahuette | 2211 / 2210 | schruns: 7 km, 180/377 min, 1200/1527 hm | ja | zustieg_zu_kurz:schruns, hoehenmeter_abweichung:schruns |
| todtnauer-huette | 1321 / 1323 | todtnau-busbahnhof: 6.1 km, 45/197 min, 380/676 hm; feldberg-baerental: 7.4 km, 60/185 min, 100/362 hm | ja | zustieg_zu_kurz:todtnau-busbahnhof, zustieg_zu_kurz:feldberg-baerental |

## Touren (221)

Zähler: {"start_nicht_an_haltestelle":56,"ende_nicht_an_haltestelle":54,"start_an_haltestelle_ausserhalb_gebiet":1,"skitour_in_sommergebiet":6,"url_status_410":1,"dauer_weicht_ab":1}

| Gebiet | Tour | Start (nächste Haltestelle) | Ende | YAML / Seite | Befund |
|---|---|---|---|---|---|
| adelboden | [Chäligang Klettersteig – Engstligenalp (ab Unter dem Birg)](https://www.alpenvereinaktiv.com/de/tour/chaeligang-klettersteig-adelboden/11019254/) | Adelboden/Unter dem Birg (adelboden 4.43 km) |  | 180/180 min, 343/343 hm, 0.6/0.6 km | start_nicht_an_haltestelle |
| adelboden | [Grossstrubel via Engstligenalp](https://www.alpenvereinaktiv.com/de/tour/grossstrubel-via-engstligenalp/117953727/) |  (adelboden 5.31 km) |  (leukerbad 6.1 km) | 181/181 min, 1309/1309 hm, 6.8/6.8 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| airolo-bedretto | [Corno Gries – Nufenenpass über den Griespass (ab Cruina)](https://www.alpenvereinaktiv.com/de/tour/corno-gries-nufenpass-ueber-den-griespass/808410764/) |  (cruina 1.41 km) |  (cruina 2.83 km) | 150/150 min, 418/418 hm, 6.5/6.5 km | ende_nicht_an_haltestelle |
| airolo-bedretto | [Von Ossasco via Capanna Cristallina nach Piano di Peccia (2 Tage)](https://www.alpenvereinaktiv.com/de/tour/von-ossasco-via-capanna-cristallina-nach-piano-di-peccia-2-tage-/28035755/) | Ossasco im Bedrettotal (ossasco 0.01 km) | Piano di Peccia (ossasco 12.09 km) | 585/585 min, 1552/1552 hm, 23.8/23.8 km | ende_nicht_an_haltestelle |
| albtrauf-bad-urach | [Grafenberg - Hörnle - Bad Urach](https://www.alpenvereinaktiv.com/de/tour/grafenberg-hoernle-bad-urach/116978703/) | Bushaltestelle Grafenberg Ziegelwasenstraße (eningen-eninger-weide 8.76 km) | Bahnhof Bad Urach (bad-urach 0.05 km) | 290/290 min, 472/472 hm, -/15.9 km | start_nicht_an_haltestelle |
| aletsch-goms | [Aletschgletscher 1: Fiescheralp – Bettmerhorn – Märjelensee – Gletscherstube](https://www.alpenvereinaktiv.com/de/tour/aletschgletscher-1-fiescheralp-bettmerhorn-maerjelensee-gletscherstube/116177379/) | Bergstation Fiescheralp 2200m, Fiesch, Wallis (fiesch 2.55 km) | Gletscherstube, Märjela 2330m (fiesch 4.54 km) | 330/330 min, 519/519 hm, 10.9/10.9 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| alpstein | [Von Wasserauen über Äscher und Ebenalp zum Berggasthaus Schäffler](https://www.alpenvereinaktiv.com/de/tour/von-wasserauen-ueber-aescher-und-ebenalp-zum-berggasthaus-schaeffler/805622751/) | Parkplatz Wasserauen bei der Seilbahn (wasserauen 0.32 km) | Berggasthaus Schäffler (wasserauen 3.01 km) | 240/240 min, 1000/1000 hm, 6.5/6.5 km | ende_nicht_an_haltestelle |
| badenweiler-blauen | [Badenweiler auf den Blauen](https://www.alpenvereinaktiv.com/de/tour/badenweiler-auf-den-blauen/127774580/) |  (badenweiler-schule 2.13 km) |  (badenweiler-schule 3.94 km) | 136/136 min, 635/635 hm, -/5.6 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| bregenz-pfaender | [Vom Stadtzentrum Bregenz auf den Pfänder](https://www.alpenvereinaktiv.com/de/tour/vom-stadtzentrum-bregenz-auf-den-pfaender/40065508/) | Bahnhof Bregenz Hafen (bregenz 0.74 km) | Lochau Pfänder / Moos (bregenz 3.54 km) | 120/120 min, 658/658 hm, 5.2/5.2 km | ende_nicht_an_haltestelle |
| bregenzerwald | [Zustieg von Dornbirn zur Lustenauer Hütte](https://www.alpenvereinaktiv.com/de/tour/zustieg-von-dornbirn-zur-lustenauer-huette/25479291/) | Dornbirn Steinebach (dornbirn 2.1 km) | Lustenauer Hütte (dornbirn 6.99 km) | 180/180 min, 772/772 hm, 6.3/6.3 km | start_nicht_an_haltestelle |
| bregenzerwald | [Vom Bödele auf die Lustenauer Hütte bis nach Schwarzenberg](https://www.alpenvereinaktiv.com/de/tour/vom-boedele-auf-die-lustenauer-huette-bis-nach-schwarzenberg/40082923/) | Bödele Weißtanne (dornbirn 5.81 km) | Schwarzenberg Dorfplatz (dornbirn 8.6 km) | 180/180 min, 244/244 hm, 9.6/9.6 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| bregenzerwald | [Rickatschwende - Bödele - Schwende](https://www.alpenvereinaktiv.com/de/tour/rickatschwende-boedele-schwende/109091813/) | Rickatschwende (dornbirn 3.35 km) |  | 211/211 min, 348/348 hm, 9/9 km | start_nicht_an_haltestelle |
| bregenzerwald | [Vom Ebnit über den Bocksberg nach Dornbirn](https://www.alpenvereinaktiv.com/de/tour/vom-ebnit-ueber-den-bocksberg-nach-dornbirn/19630158/) | Bushaltestelle Springhaldenweg Ebnit (dornbirn 7.56 km) | Dornbirn, Bushaltestelle Karrenseilbahn (dornbirn 2.16 km) | 300/300 min, 451/451 hm, 11.5/11.5 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| buehlertal | [Rund um den Wiedenfelsen, Gertelbacher Wasserfälle, Falkenfelsen und Hertahütte](https://www.alpenvereinaktiv.com/de/tour/rund-um-den-wiedenfelsen-gertelbacher-wasserfaelle-falkenfelsen-und/119266514/) |  (sand-kapelle 1.5 km) |  | 205/205 min, 462/462 hm, -/9.4 km | start_an_haltestelle_ausserhalb_gebiet |
| chasseral | [Les pres d'Orvin - Chasseral](https://www.alpenvereinaktiv.com/de/tour/les-pres-d-orvin-chasseral/112538665/) | Bushaltestelle Bellevue, Les près d'Orvin (les-pres-d-orvin 0.01 km) | Hotel Chasseral (st-imier 4.29 km) | 253/253 min, 724/724 hm, 12.2/12.2 km | ende_nicht_an_haltestelle |
| dahner-felsenland | [Klettersteigrunde Hanselsteig, Felsenpfad und Leiterlsteig](https://www.alpenvereinaktiv.com/de/tour/klettersteigrunde-hanselsteig-felsenpfad-und-leiterlsteig/45326356/) | Parkplatz Loderhof (hinterstein-gruener-hut 425.81 km) |  | 120/120 min, 333/333 hm, -/3.6 km | start_nicht_an_haltestelle |
| dahner-felsenland | [Napoleon-Steig mit Lämmerteichfelsen und großem Eyberg](https://www.alpenvereinaktiv.com/de/tour/napoleon-steig-mit-laemmerteichfelsen-und-grossem-eyberg/801389080/) | Wanderparkplatz bei der Schuhfabrik Däumling, Fabrikstr. 18, 76891 Bruchweiler-Bärenbach (dahn-sued 3.42 km) |  | 360/360 min, 675/675 hm, -/21.9 km | start_nicht_an_haltestelle |
| davos | [Dischmatal – Grialetschhütte SAC – Chant Sura (ab Bahnhof Davos Dorf)](https://www.alpenvereinaktiv.com/de/tour/dischmatal-grialetschhuette-sac-chant-sura/800819386/) | Bahnhof Davos Dorf (davos-dorf 0.04 km) | Chant Sura (davos-dischma-duerrboden 3.98 km) | 465/465 min, 1290/1290 hm, 23.9/23.9 km | ende_nicht_an_haltestelle |
| davos | [Von der Grialetschhütte über den Piz Sarsura nach Susch](https://www.alpenvereinaktiv.com/de/tour/von-der-grialetschhuette-ueber-den-piz-sarsura-nach-susch/805989916/) | Grialetschhütte (2542m) (davos-dischma-duerrboden 3.2 km) | Susch (1450m) (davos-dischma-duerrboden 12.46 km) | 420/420 min, 860/860 hm, 18.4/18.4 km | ende_nicht_an_haltestelle |
| disentis | [Kronenwanderung: Disentis – Cavardirashütte (Etappe 1)](https://www.alpenvereinaktiv.com/de/tour/kronenwanderung-disentis-cavardirashuette-etappe-1-/23438581/) | Disentis/Mustér (disentis 3 km) | Cavadirashütte (disentis 5.19 km) | 240/240 min, 1024/1024 hm, 6.3/6.3 km | start_nicht_an_haltestelle |
| disentis | [Rundwanderung Lag Serein bei Caischavedra](https://www.alpenvereinaktiv.com/de/tour/rundwanderung-lag-serein-bei-caischavedra/9881853/) | Caischavedra (disentis 3.04 km) |  | 240/240 min, 510/510 hm, 8.4/8.4 km | start_nicht_an_haltestelle |
| disentis | [Cavardirashütte – Abstieg über Alp Cavrain Sut nach Sumvitg-Cumpadials](https://www.alpenvereinaktiv.com/de/tour/cavardirashuette-abstieg-ueber-alp-cavrain-sut-nach-sumvitg-cumpadials/805968511/) | Cavardirashütte (disentis 5.19 km) | Bahnhof Sumvitg-Cumpadial (disentis 6.15 km) | 420/420 min, 39/39 hm, 16.4/16.4 km | ende_nicht_an_haltestelle |
| elm-sernftal | [Leglerhütte (2273 m) ab Mettmen](https://www.alpenvereinaktiv.com/de/tour/leglerhuette-2273-m.ue.m.-/24505683/) | Mettmen (GL) / Garichti, Bergstation (mettmen 0.01 km) | Leglerhütte SAC (mettmen 3.57 km) | 165/165 min, 558/558 hm, 5.5/5.5 km | skitour_in_sommergebiet |
| elm-sernftal | [Rundtour Mittaghorn über die Martinsmadhütte (Alpinwanderweg, ab Elm)](https://www.alpenvereinaktiv.com/de/tour/rundtour-mittaghorn-alpinwanderweg-/26509718/) | Bergstation der Tschinglenbahn (elm-dorf 2.19 km) |  | 330/330 min, 978/978 hm, 8.2/8.2 km | start_nicht_an_haltestelle |
| elm-sernftal | [Segnespass: Elm – Martinsloch – Flims](https://www.alpenvereinaktiv.com/de/tour/segnespass/27188810/) | Tschinglen-Alp (erreichbar mit Tschinglenbahn ab Elm) (elm-dorf 2.19 km) | Flims (flims-dorf-post 0.61 km) | 393/393 min, 1111/1111 hm, 17.4/17.4 km | start_nicht_an_haltestelle |
| engelberg | [Erlebnisweg Engelberger Aaschlucht](https://www.alpenvereinaktiv.com/de/tour/erlebnisweg-engelberger-aaschlucht/29370545/) | Bahnhof in Engelberg (engelberg 0.03 km) | Bahnhof in Grafenort (engelberg 6.06 km) | 150/150 min, 5/5 hm, 8.9/8.9 km | ende_nicht_an_haltestelle |
| feldberg | [Schönster Aufstieg zum Feldberg](https://www.alpenvereinaktiv.com/de/tour/schoenster-aufstieg-zum-feldberg/3663463/) | Feldberg Bärental Bahnhof (feldberg-baerental 0.02 km) | Feldbergerhof (feldberg-baerental 4.81 km) | 270/270 min, 675/675 hm, 14.8/14.8 km | ende_nicht_an_haltestelle |
| feldberg | [Von Bärental über den Zweiseenblick und Grafenmatt zum Feldbergpass](https://www.alpenvereinaktiv.com/de/tour/von-baerental-ueber-den-zweiseenblick-und-grafenmatt-zum-feldbergpass/801970604/) | Bahnhof Feldberg Bärental (feldberg-baerental 0.02 km) | Bushaltestelle Feldberg Hebelhof (feldberg-baerental 5.45 km) | 330/330 min, 800/800 hm, 16.1/16.1 km | ende_nicht_an_haltestelle |
| flims | [Von Cassons über den Flimserstein nach Bargis](https://www.alpenvereinaktiv.com/de/tour/von-cassons-ueber-den-flimserstein-nach-bargis/23434814/) | Bergbahnstation Cassons (flims-dorf-post 5.31 km) | Bargis (fidaz-bargis 0.02 km) | 210/210 min, 195/195 hm, 9.1/9.1 km | start_nicht_an_haltestelle |
| flims | [Von der Ringelspitzhütte über das Tschepband auf die Ringelspitz (Piz Barghis)](https://www.alpenvereinaktiv.com/de/tour/von-der-ringelspitzhuette-ueber-das-tschepband-auf-die-ringelspitz-piz/801270014/) | Vättis - Kunkelpass (fidaz-bargis 4.3 km) | Kunkelpass (fidaz-bargis 5.07 km) | 215/215 min, 1225/1225 hm, 6.1/6.1 km | ende_nicht_an_haltestelle |
| gantrisch-stockhorn | [Grat- und Höhenwanderung zum Stockhorn](https://www.alpenvereinaktiv.com/de/tour/grat-und-hoehenwanderung-zum-stockhorn/102955995/) | Wasserscheide / Gurnigel (gurnigel-berghaus 1.2 km) | Bergstation der Seilbahn der Stockhornbahn (erlenbach-simmental 4.11 km) | 307/307 min, 1000/1000 hm, -/11.5 km | ende_nicht_an_haltestelle |
| goeschenen-goescheneralp | [Dammastock Ostgrat ab Dammahütte](https://www.alpenvereinaktiv.com/de/tour/dammastock-ostgrat/124443024/) |  (goescheneralp 3.2 km) |  (goescheneralp 6 km) | 330/330 min, 1206/1206 hm, 3.3/3.3 km | ende_nicht_an_haltestelle |
| grand-ventron | [Rundwanderung zum Le Grand Ventron und Cascades Bocksloch vom Campingplatz Schlossberg](https://www.alpenvereinaktiv.com/de/tour/rundwanderung-zum-le-grand-ventron-und-cascades-bocksloch-vom-/322132730/) | Campingplatz oder Bahnhof Kruth (kruth 2.44 km) |  | 301/301 min, 736/736 hm, 14/14 km | start_nicht_an_haltestelle |
| grindelwald | [Bachsee ab Grindelwald](https://www.alpenvereinaktiv.com/de/tour/bachsee-ab-grindelwald/809510832/) | Grindelwald, Gaggi Säge, 3818 Grindelwald, Schweiz (grindelwald 0.62 km) | Grindelwald, Gaggi Säge, 3818 Grindelwald, Schweiz (grindelwald 5.07 km) | 250/250 min, 1223/1223 hm, 7.1/7.1 km | ende_nicht_an_haltestelle |
| grindelwald | [Von Grindelwald First über den Bachalpsee zum Faulhorn](https://www.alpenvereinaktiv.com/de/tour/aussichtsreiche-wanderung-von-grindelwald-first-ueber-den-bachalpsee-zum/807601847/) | Berggasthaus First (grindelwald 4.23 km) |  | 240/240 min, 545/545 hm, 11.6/11.6 km | start_nicht_an_haltestelle |
| hegau-hohentwiel | [Auf dem Burgenweg von Singen nach Mühlhausen](https://www.alpenvereinaktiv.com/de/tour/auf-dem-burgenweg-von-singen-nach-muehlhausen/1560463/) |  (singen 1.09 km) |  (singen 6.69 km) | 240/240 min, 493/493 hm, -/13.8 km | ende_nicht_an_haltestelle |
| hegau-hohentwiel | [Hegauhöhen - über fünf Hegauberge von Engen nach Singen](https://www.alpenvereinaktiv.com/de/tour/hegauhoehen-ueber-fuenf-hegauberge-von-engen-nach-singen/109919387/) | Engen (singen 11.99 km) | Singen Hohentwiel (singen 1.1 km) | 692/692 min, 1109/1109 hm, -/35.9 km | start_nicht_an_haltestelle |
| hintersteiner-tal | [Türle](https://www.alpenvereinaktiv.com/de/tour/tuerle/1374768/) | Parkplatz „Auf der Höh“ in Hinterstein (hinterstein-gruener-hut 0.17 km) | Hinterstein (hinterstein-gruener-hut 5.92 km) | 360/360 min, 1085/1085 hm, 13/13 km | ende_nicht_an_haltestelle |
| hintersteiner-tal | [Obertal](https://www.alpenvereinaktiv.com/de/tour/obertal/1398578/) | Parkplatz „Auf der Höhe“ in Hinterstein, von dort weiter mit der privaten Buslinie zum Giebelhaus (hinterstein-gruener-hut 5.93 km) |  | 225/225 min, 285/285 hm, 7.7/7.7 km | start_nicht_an_haltestelle |
| hintersteiner-tal | [Vom Giebelhaus über das Prinz-Luitpold-Haus auf den Wiedemerkopf](https://www.alpenvereinaktiv.com/de/tour/vom-giebelhaus-ueber-das-prinz-luitpold-haus-auf-den-wiedemerkopf/45393078/) | Giebelhaus (hinterstein-gruener-hut 5.93 km) | Giebelhaus (hinterstein-gruener-hut 9.47 km) | 234/234 min, 1087/1087 hm, 7.3/7.3 km | start_nicht_an_haltestelle |
| hinterzarten-breitnau | [Von Hinterzarten nach Breitnau](https://www.alpenvereinaktiv.com/de/tour/von-hinterzarten-nach-breitnau/4680246/) | Bahnhof Hinterzarten (hinterzarten 0.04 km) | Breitnau Kirche (hinterzarten 4.27 km) | 225/225 min, 425/425 hm, 12.5/12.5 km | ende_nicht_an_haltestelle |
| kaiserstuhl | [Endingen - Bischoffingen](https://www.alpenvereinaktiv.com/de/tour/endingen-bischoffingen/105162879/) |  (endingen-kaiserstuhl 1.12 km) |  (ihringen 7.12 km) | 184/184 min, 357/357 hm, -/10 km | ende_nicht_an_haltestelle |
| kandel-waldkirch | [KK Waldkirch - St. Peter - Kirchzarten](https://www.alpenvereinaktiv.com/de/tour/kk-waldkirch-st.-peter-kirchzarten/109925611/) |  (waldkirch 0.04 km) |  (freiburg-schauinslandbahn 7.84 km) | 506/506 min, 1202/1202 hm, -/25.9 km | ende_nicht_an_haltestelle |
| kandel-waldkirch | [KK Kirchzarten - St. Peter - Kandel - Waldkirch](https://www.alpenvereinaktiv.com/de/tour/kk-kirchzarten-st.-peter-kandel-waldkirch/109863993/) |  (freiburg-schauinslandbahn 7.83 km) |  (waldkirch 1.54 km) | 524/524 min, 1069/1069 hm, -/27.4 km | start_nicht_an_haltestelle |
| kiental-griesalp | [Morgenhorn (3627 m) ab Griesalp](https://www.alpenvereinaktiv.com/de/tour/morgenhorn-3627-m/64236517/) |  (griesalp 0.06 km) |  (griesalp 6.27 km) | 750/750 min, 2224/2224 hm, 9.2/9.2 km | ende_nicht_an_haltestelle |
| kiental-griesalp | [Griesalp zur Rotstockhütte](https://www.alpenvereinaktiv.com/de/tour/griesalp-zur-rotstockhuette-mai-2022/242477216/) |  (griesalp 0.51 km) |  (stechelberg 4.97 km) | 305/305 min, 1182/1182 hm, 9.6/9.6 km | ende_nicht_an_haltestelle |
| kleinwalsertal | [Von Riezlern im Kleinwalsertal auf den Gottesacker](https://www.alpenvereinaktiv.com/de/tour/von-riezlern-im-kleinwalsertal-auf-den-gottesacker/1362481/) | Riezlern Post (riezlern-post 0.01 km) |  (riezlern-post 2.3 km) | 330/330 min, 1039/1039 hm, 16.4/16.4 km | ende_nicht_an_haltestelle |
| kleinwalsertal | [Schwarzwasserhütte - Zustieg von Mittelberg](https://www.alpenvereinaktiv.com/de/tour/schwarzwasserhuette-zustieg-von-mittelberg/24161921/) | Talstation der Seilbahn auf das Walmendinger Horn (mittelberg 2.02 km) | Schwarzwasserhütte (mittelberg 5.16 km) | 135/135 min, 171/171 hm, 5.7/5.7 km | start_nicht_an_haltestelle |
| kleinwalsertal | [Vom Kleinwalsertal auf den Hohen Ifen](https://www.alpenvereinaktiv.com/de/tour/vom-kleinwalsertal-auf-den-hohen-ifen/1374459/) | Parkplatz der Ifen-Bergbahnen (für Tourengeher ausgewiesen) (mittelberg 2.3 km) |  | 210/210 min, 981/981 hm, 14.2/14.2 km | start_nicht_an_haltestelle |
| klosters-praettigau | [Klettersteig Sulzfluh, St. Antönien](https://www.alpenvereinaktiv.com/de/tour/klettersteig-sulzfluh-st.-antoenien/9408873/) | St. Antönien, Garstett (Parkplatz 6) (st-antoenien-rueti 2.38 km) |  | 400/400 min, 1196/1196 hm, 11.1/11.1 km | start_nicht_an_haltestelle |
| klosters-praettigau | [Skitour Klosters Platz – Furka Berg](https://www.alpenvereinaktiv.com/de/tour/skitour-klosters-platz-furka-berg-entspannte-skitour-zum-saisonstart/207019186/) |  (klosters-platz 0.2 km) |  (davos-dorf 5.22 km) | 232/232 min, 1139/1139 hm, 9.6/9.6 km | ende_nicht_an_haltestelle |
| klosters-praettigau | [Silvretta-Skidurchquerung Etappe 4: Silvrettahütte – Vermuntstausee](https://www.alpenvereinaktiv.com/de/tour/silvretta-skidurchquerung-etappe-4-silvrettahuette-vermuntstausee/12633223/) | Silvrettahütte (bielerhoehe 7.98 km) | Vermuntstausee (bielerhoehe 3.12 km) | 465/465 min, 1500/1500 hm, 16.7/16.7 km | ende_nicht_an_haltestelle |
| lauterbrunnental | [Jungfrau über Innerer Rottalgrat (ab Stechelberg via Rottalhütte)](https://www.alpenvereinaktiv.com/de/tour/jungfrau-ueber-innerer-rottalgrat/112006887/) | Stechelberg (stechelberg 1.15 km) | Mönchsjochhütte (stechelberg 7.95 km) | 900/900 min, 3600/3600 hm, 13.5/13.5 km | ende_nicht_an_haltestelle |
| lechquellengebirge | [Basislager Hotel Adler (12): Spullersee - Steinernes Meer - Freiburger Hütte - Formarin Alpe](https://www.alpenvereinaktiv.com/de/tour/basislager-hotel-adler-12-spullersee-steinernes-meer-freiburger/50151623/) | Bushaltestelle Spullersee (langen-am-arlberg 4.67 km) | Formarinalpe (zugertal-formarinsee 0.13 km) | 300/300 min, 632/632 hm, 11.2/11.2 km | start_nicht_an_haltestelle |
| lechquellengebirge | [Freiburger Hütte - Gehrengrat](https://www.alpenvereinaktiv.com/de/tour/freiburger-huette-gehrengrat/1522327/) | Bushaltestelle "Spullersee" (langen-am-arlberg 4.69 km) | Bushaltestelle "Formarinsee" (zugertal-formarinsee 0.01 km) | 240/240 min, 521/521 hm, 11.6/11.6 km | start_nicht_an_haltestelle |
| lechquellengebirge | [Basislager Hotel Adler (11): Zug - Ravensburger Hütte - Spullersee](https://www.alpenvereinaktiv.com/de/tour/basislager-hotel-adler-11-zug-ravensburger-huette-spullersee/51214313/) | Bushaltestelle an der Kirche in Zug (lech-ruefiplatz 2.56 km) | Bushaltestelle Spullersee (langen-am-arlberg 4.68 km) | 172/172 min, 580/580 hm, 7/7 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| lenk | [Leiterli – Iffigenalp via Wildhornhütte SAC](https://www.alpenvereinaktiv.com/de/tour/vom-lenker-hausberg-zur-iffigenalp-via-wildhornhuette-sac/37459857/) | Leiterli (iffigenalp 4.08 km) | Iffigenalp (iffigenalp 0.05 km) | 314/314 min, 562/562 hm, 15.4/15.4 km | start_nicht_an_haltestelle |
| lenk | [Umrundung des Wildstrubel – von der Wildstrubelhütte zu den Simmenfällen](https://www.alpenvereinaktiv.com/de/tour/umrundung-des-wildstrubel-von-der-wildstrubelhuette-zu-den-simmenfaellen/115980139/) | Wildstrubelhütte (iffigenalp 2.76 km) | Simmenfälle (iffigenalp 4 km) | 270/270 min, 300/300 hm, 11.1/11.1 km | ende_nicht_an_haltestelle |
| leukerbad | [Gemmi – Daubenhorn](https://www.alpenvereinaktiv.com/de/tour/gemmi-daubenhorn/36953716/) | Gemmi (leukerbad 2.18 km) |  | 240/240 min, 745/745 hm, 10.6/10.6 km | start_nicht_an_haltestelle |
| leukerbad | [Besteigung des Torrenthorns (ab Rinderhütte)](https://www.alpenvereinaktiv.com/de/tour/besteigung-des-torrenthorns/29148418/) | Rinderhütte, Bergstation Gondelbahn (leukerbad 2.09 km) |  | 180/180 min, 690/690 hm, 6.8/6.8 km | start_nicht_an_haltestelle |
| leukerbad | [Panoramatrail Gemmi](https://www.alpenvereinaktiv.com/de/tour/panoramatrail-gemmi/63631365/) | Gemmipass, Leukerbad (leukerbad 2.18 km) | Daubensee Talstation, Leukerbad (leukerbad 2.76 km) | 180/180 min, 308/308 hm, 7/7 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| linthal | [Fisetenpass – Gämsfairenstock – Claridenhütte](https://www.alpenvereinaktiv.com/de/tour/fisetenpass-gaemsfairenstock-claridenhuette/67634158/) | Bergstation der Seilbahn zum Fisetenpass (urnerboden-dorf 2.42 km) | Claridenhütte (urnerboden-dorf 4.3 km) | 240/240 min, 960/960 hm, 8.1/8.1 km | start_nicht_an_haltestelle |
| linthal | [Fridolinshütte – vom Fisetenpass über die Claridenhütte](https://www.alpenvereinaktiv.com/de/tour/fridolinshuette-vom-fisetenpass-ueber-claridenhuette/36441227/) |  (urnerboden-dorf 2.55 km) |  (urnerboden-dorf 8.5 km) | 403/403 min, 1032/1032 hm, 13.8/13.8 km | start_nicht_an_haltestelle |
| linthal | [Skitour vom Urnerboden über den Gämsfairenstock zur Claridenhütte](https://www.alpenvereinaktiv.com/de/tour/skitour-vom-urnerboden-ueber-den-gaemsfairenstock-zur-claridenhuette-in/801602224/) | Bergstation Seilbahn Urnerboden-Fisetenpass, 2008 m. (urnerboden-dorf 2.42 km) | Claridenhütte, 2453 m. (urnerboden-dorf 4.3 km) | 180/180 min, 960/960 hm, 6.3/6.3 km | start_nicht_an_haltestelle, skitour_in_sommergebiet |
| linthal | [Urnerboden – Braunwald](https://www.alpenvereinaktiv.com/de/tour/urnerboden-braunwald/38589206/) | Urnerboden, Haltestelle "Kantonsgrenze" (linthal 3.5 km) | Bergstation Braunwaldbahn (braunwald 0.05 km) | 180/180 min, 412/412 hm, 8.8/8.8 km | start_nicht_an_haltestelle |
| loetschental | [Lauchernalp – Lötschenpass – Selden](https://www.alpenvereinaktiv.com/de/tour/lauchernalp-loetschenpass-selden/2811504/) | Bergstation Lauchernalp (wiler-loetschen 1.21 km) | Selden (wiler-loetschen 6.53 km) | 305/305 min, 727/727 hm, 12.2/12.2 km | ende_nicht_an_haltestelle |
| loetschental | [Lötschental: Fafleralp – Anenhütte](https://www.alpenvereinaktiv.com/de/tour/loetschental-anenhuette/116366804/) |  (wiler-loetschen 7 km) |  | 227/227 min, 593/593 hm, 10.1/10.1 km | start_nicht_an_haltestelle |
| loetschental | [Lötschenpass Trail (ab Hockenhorngrat)](https://www.alpenvereinaktiv.com/de/tour/loetschenpass-trail/66295350/) | Hockenhorngrat (wiler-loetschen 4.09 km) |  | 240/240 min, 509/509 hm, 6.7/6.7 km | start_nicht_an_haltestelle |
| meiringen-rosenlaui | [Rosenhorn (3689 m) – Normalweg von der Dossenhütte](https://www.alpenvereinaktiv.com/de/tour/rosenhorn-3689m-normalweg-von-der-dossenhuette/54890409/) | Parkplatz am Einstieg zur Gletscherschlucht Rosenlaui (rosenlaui 0.2 km) | Parkplatz am Einstieg zur Gletscherschlucht Rosenlaui (rosenlaui 5.52 km) | 330/330 min, 2350/2350 hm, 10.1/10.1 km | ende_nicht_an_haltestelle |
| montafon-raetikon | [Tübinger Hütte von Gargellen über Vergaldner Joch](https://www.alpenvereinaktiv.com/de/tour/tuebinger-huette-von-gargellen-ueber-vergaldner-joch/14607059/) | In Gargellen am Parkplatz der Bergbahn (gargellen-schafbergbahn 0.05 km) | Tübinger Hütte (DAV) (bielerhoehe 6.79 km) | 360/360 min, 1086/1086 hm, 12.9/12.9 km | ende_nicht_an_haltestelle |
| montafon-raetikon | [Skitour Rotbühelspitze Gargellen](https://www.alpenvereinaktiv.com/de/tour/skitour-rotbuehelspitze-gargellen/119133115/) | Gargellen Bushaltestelle Schafbergbahn / Parkplatz Schafbergbahn (gargellen-schafbergbahn 0.21 km) |  | 360/360 min, 1410/1410 hm, 17.6/17.6 km | skitour_in_sommergebiet |
| montoz | [Wertvolle Baukunst und ein traditionsreicher Käse](https://www.alpenvereinaktiv.com/de/tour/wertvolle-baukunst-und-ein-traditionsreicher-kaese/8483404/) | Tavannes (tavannes 0.03 km) | Bellelay (tavannes 5.35 km) | 135/135 min, 280/280 hm, 7.5/7.5 km | ende_nicht_an_haltestelle |
| montoz | [Zum lebendigen Hochmoor und feinem Tête de Moine](https://www.alpenvereinaktiv.com/de/tour/zum-lebendigen-hochmoor-und-feinem-tete-de-moine/60534713/) | Reconvilier (tavannes 2.59 km) | Tavannes (tavannes 0.03 km) | 255/255 min, 420/420 hm, 14.8/14.8 km | start_nicht_an_haltestelle |
| murgtal | [Wanderung von Gernsbach via Teufelsmühle nach Bad Herrenalb](https://www.alpenvereinaktiv.com/de/tour/wanderung-von-gernsbach-via-teufelsmuehle-nach-bad-herrenalb/804445365/) | Gernsbach, Bahnhof (gernsbach 0.6 km) | Bad Herrenalb, Bahnhof (hoerden 7.28 km) | 290/290 min, 717/717 hm, -/13.2 km | ende_nicht_an_haltestelle |
| murgtal | [Murgleiter Etappe 3: Schönmünzach - Baiersbronn](https://www.alpenvereinaktiv.com/de/tour/murgleiter-etappe3-schoenmuenzach-bayersbronn/1529785/) |  (forbach 8.39 km) |  (baiersbronn 0.14 km) | 405/405 min, 982/982 hm, -/24.2 km | start_nicht_an_haltestelle |
| nagelfluhkette | [Nagelfluhkette Mittag - Hochgrat](https://www.alpenvereinaktiv.com/de/tour/nagelfluhkette-mittag-hochgrat/803079884/) | Bergstation Mittagbahn (immenstadt 2.43 km) | Bergstation Hochgratbahn (hochgratbahn 2.23 km) | 420/420 min, 1288/1288 hm, -/13.7 km | start_nicht_an_haltestelle |
| pilatus | [Alpnachstad – Pilatus](https://www.alpenvereinaktiv.com/de/tour/alpnachstad-pilatus/101585316/) |  (alpnachstad 0.53 km) |  (alpnachstad 3.18 km) | 292/292 min, 1605/1605 hm, 8.1/8.1 km | ende_nicht_an_haltestelle |
| pilatus | [Pilatus – (Matthorn) – Fräkmünt – Ämsigen](https://www.alpenvereinaktiv.com/de/tour/pilatus-matthorn-fraekmuent-aemsigen/44649380/) | Pilatus Kulm (alpnachstad 3.25 km) | Ämsigen Station (alpnachstad 1.77 km) | 203/203 min, 361/361 hm, 9.8/9.8 km | start_nicht_an_haltestelle |
| pilatus | [Alpnachstad – Kriens](https://www.alpenvereinaktiv.com/de/tour/alpnachstad-kriens/111501226/) |  (alpnachstad 0.07 km) |  (alpnachstad 8.76 km) | 523/523 min, 1772/1772 hm, 18.2/18.2 km | ende_nicht_an_haltestelle |
| renchtal-kniebis | [Bad Peterstal zum Glaswaldsee, Haberer Turm nach Bad Griesbach](https://www.alpenvereinaktiv.com/de/tour/bad-peterstal-zum-glaswaldsee-haberer-turm-nach-bad-griesbach/3522902/) | Bahnhof Bad Peterstal (bad-griesbach 3.14 km) | Bahnhof Bad Griesbach (bad-griesbach 0.06 km) | 360/360 min, 797/797 hm, 18.1/18.1 km | start_nicht_an_haltestelle |
| renchtal-kniebis | [Auf dem Grenzweg von Freudenstadt nach Kniebis](https://www.alpenvereinaktiv.com/de/tour/auf-dem-grenzweg-von-freudenstadt-nach-kniebis/15725352/) | Tourist-Information Freudenstadt, Marktplatz 64 (freudenstadt-hbf 1.34 km) | Besucherzentrum Kniebis, Straßburger Str. 349 (bad-griesbach 5.53 km) | 255/255 min, 364/364 hm, 15.4/15.4 km | ende_nicht_an_haltestelle |
| reusstal-maderanertal | [Krönten von der Kröntenhütte via Westgrat (Normalweg)](https://www.alpenvereinaktiv.com/de/tour/kroenten-von-der-kroentenhuette-ueber-westgrat-normalweg-/57528086/) | Bodenberg im Erstfeldertal (erstfeld 3.74 km) |  | 510/510 min, 2100/2100 hm, 18.5/18.5 km | start_nicht_an_haltestelle |
| reusstal-maderanertal | [Krönten (3108 m) – Skitour ab Kröntenhütte](https://www.alpenvereinaktiv.com/de/tour/kroenten-3108-m-/65632263/) | Krönten Hütte (SAC) (erstfeld 6.16 km) |  | 240/240 min, 1202/1202 hm, 10.4/10.4 km | skitour_in_sommergebiet |
| reusstal-maderanertal | [Höhenweg Maderanertal (ab Bristen, Talstation Golzern)](https://www.alpenvereinaktiv.com/de/tour/hoehenweg-maderanertal/115477342/) | Bergstation der Luftseilbahn Bristen-Golzern (bristen 2.55 km) | Talstation der Luftseilbahn Bristen-Golzern (bristen 1.68 km) | 360/360 min, 800/800 hm, 15.6/15.6 km | start_nicht_an_haltestelle |
| riemenstalden | [Alpenkranz, 6. Etappe: Lidernenhütte – Rossstock – Biel](https://www.alpenvereinaktiv.com/de/tour/alpenkranz-6.-etappe-lidernenhuette-rossstock-biel/28919014/) | Lidernenhütte (chaeppeliberg 1.37 km) | Biel (bruegg-buerglen 3.23 km) | 225/225 min, 729/729 hm, 7.5/7.5 km | ende_nicht_an_haltestelle |
| rigi | [Schwyzer Höhenweg, Etappe 2: Rigi Staffel – Goldau](https://www.alpenvereinaktiv.com/de/tour/schwyzer-hoehenweg-etappe-2-rigi-goldau-/13833049/) | Rigi-Staffel (arth-goldau 5.72 km) | Goldau (arth-goldau 0.07 km) | 190/190 min, 1/1 hm, 9.1/9.1 km | start_nicht_an_haltestelle |
| rigi | [Chäserenholz-Schneeschuhtrail ab Rigi Kulm](https://www.alpenvereinaktiv.com/de/tour/chaeserenholz-trail/37283077/) | Rigi Kulm (arth-goldau 4.82 km) |  | 65/65 min, 150/150 hm, 1.5/1.5 km | start_nicht_an_haltestelle |
| rigi | [Rigi Kulm – Scheidegg](https://www.alpenvereinaktiv.com/de/tour/schweiz-1.-rigi-kulm-scheidegg/119707126/) |  (arth-goldau 4.93 km) |  (arth-goldau 3.34 km) | 182/182 min, 366/366 hm, 7.4/7.4 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| schaechental | [ViaSuworow, Etappe 6: Biel-Chinzig – Muotathal](https://www.alpenvereinaktiv.com/de/tour/viasuworow-etappe-6-biel-chinzig-muotathal/25013693/) | Biel, Altdorf (bruegg-buerglen 2.86 km) | Hinterthal, Muotathal (hoch-ybrig-weglosen 5.96 km) | 300/300 min, 560/560 hm, 14.5/14.5 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| schaechental | [Winterwanderweg 520: Ratzi – Biel – Ruogig](https://www.alpenvereinaktiv.com/de/tour/winterwanderweg-520-ruogig-biel-ratzi/25309238/) | Bergstation der Luftseilbahn Spiringen - Ratzi (bruegg-buerglen 3.92 km) | Bergstation der Luftseilbahn Bürglen - Ruogig (bruegg-buerglen 2.9 km) | 138/138 min, 342/342 hm, 7.8/7.8 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| schauinsland | [Freiburg nach Horben](https://www.alpenvereinaktiv.com/de/tour/freiburg-nach-horben/108227604/) |  (freiburg-schauinslandbahn 6.34 km) |  (freiburg-schauinslandbahn 0.54 km) | 115/115 min, 317/317 hm, -/7.8 km | start_nicht_an_haltestelle |
| schluchsee-haeusern | [Seebrugg - Unterkrummenhof - Aha](https://www.alpenvereinaktiv.com/de/tour/seebrugg-unterkrummenhof-aha/810314311/) | Seebrugg (Gemeinde Schluchsee), Bahnhof, 932 m; Parkplätze zwischen Jugendherberge und Bahnhof. ÖPNV: Breisgau-S-Bahn nach Seebrugg, evtl. weiter mit dem Bus, Linie 7319 (Seebrugg – Sankt Blasien), Haltestelle »Seebrugg Staumauer«. (seebrugg 0.03 km) | Aha (Gemeinde Schluchsee), Bahnhof, 940 m; Parkmöglichkeit. Mit der Breisgau-S-Bahn gelangt man von Aha zurück nach Seebrugg. (feldberg-baerental 5.01 km) | 165/165 min, 25/25 hm, 11/11 km | ende_nicht_an_haltestelle |
| schluchsee-haeusern | [Seebrugg - Aha](https://www.alpenvereinaktiv.com/de/tour/seebrugg-aha/810822167/) | Bahnhof Seebrugg (Gemeinde Schluchsee), 932 m. (seebrugg 0.04 km) | Bahnhof Aha (Gemeinde Schluchsee), 940 m. Mit der Breisgau-S-Bahn gelangt man von Aha zurück nach Seebrugg. (feldberg-baerental 5.01 km) | 225/225 min, 130/130 hm, 11.6/11.6 km | ende_nicht_an_haltestelle |
| schwarzsee-kaiseregg | [Schwarzsee-Runde](https://www.alpenvereinaktiv.com/de/tour/schwarzsee-runde/115190639/) |  (hinterstein-gruener-hut 147.18 km) |  | 39/39 min, 15/15 hm, -/2.5 km | start_nicht_an_haltestelle |
| silvretta | [Piz Buin, 3312m - Skihochtour auf den höchsten Vorarlberger Silvretta-Gipfel](https://www.alpenvereinaktiv.com/de/tour/piz-buin-3312m-skihochtour-auf-den-hoechsten-vorarlberger-silvretta/13160122/) | Bielerhöhe, 2040m (bielerhoehe 0.04 km) |  | 510/510 min, 1405/1405 hm, 21.4/21.4 km | skitour_in_sommergebiet |
| silvretta | [A7: Silvretta-Bielerhöhe über die Saarbrücker Hütte zum Vermuntsee](https://www.alpenvereinaktiv.com/de/tour/a7-silvretta-bielerhoehe-ueber-die-saarbruecker-huette-zum-vermuntsee/7424980/) | – |  | 249/- min, 607/- hm, 10.9/- km | url_status_410 |
| todtnau-belchen | [Panoramaweg von Todtnau zum Feldberger Hof (Winterwanderung)](https://www.alpenvereinaktiv.com/de/tour/panoramaweg-von-todtnau-zum-feldberger-hof/806280469/) | Busbahnhof Todtnau (todtnau-busbahnhof 0 km) | Feldberger Hof (feldberg-baerental 4.81 km) | 300/300 min, 850/850 hm, 15.2/15.2 km | ende_nicht_an_haltestelle |
| toggenburg | [Wildhaus – Chreialpfirst – Zwinglipass – Wildhaus](https://www.alpenvereinaktiv.com/de/tour/wildhaus-chreialpfirst-zwinglipass-wildhaus/23425318/) | Wildhaus, PostAuto-Haltestelle Post (wildhaus-dorf 0.06 km) | Wildhaus, PostAuto-Haltestelle Post (wildhaus-dorf 2.43 km) | 360/360 min, 909/909 hm, 13.3/13.3 km | ende_nicht_an_haltestelle |
| toggenburg | [Skitour auf den Wildhauser Schafberg](https://www.alpenvereinaktiv.com/de/tour/skitour-auf-den-wildhauser-schafberg/34921141/) | Wildhaus (wildhaus-dorf 1.25 km) | Wildhaus (wildhaus-dorf 0.2 km) | 240/240 min, 1020/1020 hm, 5.8/5.8 km | skitour_in_sommergebiet |
| triberg-brend | [WasserWeltenSteig: von den Triberger Wasserfällen zum Brend](https://www.alpenvereinaktiv.com/de/tour/wasserweltensteig-von-den-triberger-wasserfaellen-zum-brend/38617871/) | Triberg, Kasse Wasserfall (triberg 1.33 km) | Bushaltestelle Neueck (triberg 12.15 km) | 330/330 min, 575/575 hm, 20/20 km | ende_nicht_an_haltestelle |
| triberg-brend | [Von St. Georgen nach Triberg](https://www.alpenvereinaktiv.com/de/tour/von-st.-georgen-nach-triberg/14574120/) | Bahnhof St. Georgen (triberg 7.99 km) | Bahnhof Triberg (triberg 0.03 km) | 315/315 min, 450/450 hm, 16.8/16.8 km | start_nicht_an_haltestelle |
| weissenstein | [Von Oberdorf via Stigelos und Nesselboden auf den Weissenstein](https://www.alpenvereinaktiv.com/de/tour/von-oberdorf-via-stigelos-und-nesselboden-auf-den-weissenstein/26620825/) | Oberdorf, Talstation Seilbahn Weissenstein (oberdorf-so 0.02 km) | Bergstation Seilbahn Weissenstein (oberdorf-so 2.1 km) | 150/150 min, 636/636 hm, 4.9/4.9 km | ende_nicht_an_haltestelle |
| weissenstein | [Panoramatour](https://www.alpenvereinaktiv.com/de/tour/panoramatour/23424887/) | Oberdorf (oberdorf-so 0.04 km) | Balmberg (oberdorf-so 4.58 km) | 210/210 min, 774/774 hm, 8.3/8.3 km | ende_nicht_an_haltestelle |
| wutachschlucht | [Lotenbachklamm und Wutachschlucht](https://www.alpenvereinaktiv.com/de/tour/lotenbachklamm-und-wutachschlucht/14605178/) | Rathaus Bonndorf (bachheim 6.33 km) |  | 225/225 min, 380/380 hm, -/12.2 km | start_nicht_an_haltestelle |
| wutachschlucht | [Gauchachschlucht - Wutachschlucht - Rötenbachklamm](https://www.alpenvereinaktiv.com/de/tour/gauchachschlucht-wutachschlucht-roetenbachklamm/804362760/) | Bahnhof Döggingen (bachheim 4.74 km) | Bahnhof Rötenbach (loeffingen 3.5 km) | 600/600 min, 687/687 hm, -/29.6 km | start_nicht_an_haltestelle, ende_nicht_an_haltestelle |
| zermatt-mattertal | [Domhütte: Zustieg von Randa inkl. Hängebrücke](https://www.alpenvereinaktiv.com/de/tour/domhuette-zustieg-von-randa-inkl.-haengebruecke/800548025/) | Randa (randa 0.15 km) | Domhütte (randa 2.8 km) | 200/270 min, 1610/1610 hm, 6.1/6.1 km | dauer_weicht_ab |
| zermatt-mattertal | [Neuer Zustieg Monte-Rosa-Hütte ab Riffelberg](https://www.alpenvereinaktiv.com/de/tour/neuer-zustieg-monte-rosa-huette-ab-riffelberg-furi-bergstation-/803163377/) | Bergstation Riffelberg (zermatt 3.59 km) | Monte Rosa Hütte (zermatt 9.08 km) | 210/210 min, 573/573 hm, 9.6/9.6 km | start_nicht_an_haltestelle |

## Links (346, davon 10 nicht erreichbar)

| Wo | URL | Status |
|---|---|---|
| huette les-jonquilles webUrl | https://amis-nature.org/article236.html | 404 |
| huette les-jonquilles quelle | https://amis-nature.org/article236.html | 404 |
| huette mannheimer-huette webUrl | https://www.mannheimerhuette.co.at/mannheimerhuette/ | 404 |
| huette monte-rosa-huette webUrl | https://www.section-monte-rosa.ch/de/ | 0 |
| huette saarbruecker-huette webUrl | https://saarbrueckerhuette.at/ | 0 |
| huette schwarzenberghuette webUrl | https://www.dav-illertissen.de/Schwarzenberghutte/SBHInfo.htm | 403 |
| gebiet braunwald link | https://www.braunwald.ch/ | 403 |
| gebiet dahner-felsenland link | https://www.pfalzkletterer.de/ | 0 |
| gebiet schwarzsee-kaiseregg link | https://www.schwarzsee.ch/ | 403 |
| gebiet zermatt-mattertal link | https://www.section-monte-rosa.ch/de/ | 0 |
