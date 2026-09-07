# Touren aus Tourenportalen einbetten (Recherche)

Stand: 7. September 2026. Recherche für den ÖV-Tourenplaner (Next.js) mit Gebietsseiten
(z.B. "Kandersteg", "Feldberg") und Hüttenseiten. Ziel: echte Tourenvorschläge mit Karte und
GPX auf der Gebietsseite, nicht nur ein Link.

Methode: Doku-Seiten der Anbieter (WebFetch/Browser), Quellcode des offiziellen Outdooractive-
WordPress-Plugins (GitHub-Mirror `common-repository/outdooractive-embed`), und `curl`-Checks
auf HTTP-Status sowie `X-Frame-Options`/`Content-Security-Policy: frame-ancestors`.
Alles, was nicht selbst geprüft oder wörtlich in einer Quelle belegt ist, ist als
**(nicht belegt)** markiert.

---

## 1. Übersicht

| Anbieter | Einbettbar (Tour / Liste / Karte) | URL-Muster mit Beispiel | Voraussetzungen (Key, Konto) | Header-Check (iframe erlaubt?) | Kosten | Empfehlung |
|---|---|---|---|---|---|---|
| **alpenvereinaktiv.com** (Outdooractive-Whitelabel der Alpenvereine) | Tour: ja · Liste/Sammlung: ja (mit Karte) · Regionskarte: nur über List2Go-Liste bzw. FlexView-API | Loader-Script `https://www.alpenvereinaktiv.com/de/embed/<id>/js?mw=false` → lädt iframe `https://www.alpenvereinaktiv.com/de/tour/<slug>/<id>/embed.html?flexView=false` (Bsp. Tour 50994062 "Kandersteg-Ryharts-Allmenalp"); Liste: `…/de/embed/202105012/js?initMap=true` → `…/de/liste/nur-mit-oeffis/202105012/embed.html?flexView=false` | Offiziell: Tour muss veröffentlicht sein und Einbettender muss **Pro+**-Nutzer sein; Embed-Code entsteht über Menü "Einbetten" nach Akzeptieren der AGB. Technisch antworten die Endpunkte ohne Key. | **Ja**: `embed.html` liefert 200 ohne XFO/CSP. Normale Tourseiten dagegen `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` (nicht einbettbar). | Pro+: 5,00 €/Monat bzw. 59,99 €/Jahr | **Erste Wahl für V1** (Hochtouren/Skitouren/Wanderungen der Sektionen liegen hier; Öffi-Sammlungen existieren) |
| **outdooractive.com** | identisch zu alpenvereinaktiv (gleiche Plattform, gleiche IDs) | `https://www.outdooractive.com/de/embed/<id>/js?mw=false` → `https://www.outdooractive.com/de/route/wanderung/kandersteg/kandersteg-ryharts-allmenalp/50994062/embed.html?flexView=false`; Pro+-Whitelabel zusätzlich `&usr=<user>&key=USR-…` | wie oben (Pro+); Whitelabel-Variante mit Nutzer-Key | **Ja** (embed.html 200 ohne XFO/CSP). Hinweis: Server liefert bei curl mit Browser-User-Agent 404 (Bot-Schutz), mit curl-Default-UA 200. | Pro+ 59,99 €/Jahr | gleichwertig; für DAV-Kontext alpenvereinaktiv-Domain bevorzugen |
| **Outdooractive Data API** (api-oa.com) | keine Einbettung, sondern Rohdaten (JSON: Titel, Texte, GeoJSON, Bilder, Labels wie `publicTransportFriendly`) + GPX | `https://api-oa.com/api/v2/project/<proj>/contents/<id>?display=verbose&lang=de&key=<key>`; `…/nearby/tour?lat=&lon=&radius=`; `…/filter/tour`; GPX `https://api-oa.com/download.tour.gpx?i=<id>&project=<proj>&key=<key>` | Projekt-Key + API-Key; Test-Keys `api-dev-oa` / `yourtest-outdooractiveapi` nur "for temporary testing". Produktiv: Lizenzvertrag, nur für "Unternehmer" (B2B) | n/a (Server-seitig) | nicht öffentlich; Blog: Destination zahlt Lizenz, Empfänger nutzt kostenlos möglich. Für DAV-Sektionen keine Konditionen gefunden | V2-Option (eigene Karte + GPX), vorher Anfrage bei alpenvereinaktiv-Support/DAV |
| **Outdooractive FlexView API** | Karte/Liste/Galerie aller Touren eines Projekts mit Filtern (Region, Kategorie) + Detailansicht | Script `https://api-oa.com/jscr/oa_head.js?proj=<proj>&key=<key>&lang=de`, Parameter `frontendtype=tour`, `initMode=map|list|gallery`, `zoom`, `center` | Projekt-Key + API-Key (wie Data API) | n/a (JS-Einbindung, kein iframe) | wie Data API | nur mit API-Zugang; genau das nutzt der DAV für seine Hüttensuche |
| **SAC-Tourenportal** (sac-cas.ch) | Tourenziel-Kacheln: ja · Hütten-Kacheln: ja · Routen/Karte/GPX: **nein** | `https://www.sac-cas.ch/de/destinationlistiframe.html?ids=2218,2247&discipline=mountain_hiking` (Sprachen de/fr/it/en; Disziplinen `mountain_hiking, alpine_tour, climbing, via_ferrata, ski_tour, snowshoe_tour`); Hütten: `…?ids=2147000006,2147000238` | keins ("einfach, schnell und kostenlos"); Doku empfiehlt iframe-resizer | **Ja**: 200, kein XFO/CSP | kostenlos. Routen-Details: 900 Routen + Hüttenzustiege gratis, Vollzugriff 49 CHF/Jahr (SAC-Mitglieder gratis) | Ergänzung für Schweizer Gebiete (Kacheln mit Link), keine Karte |
| **komoot** | Tour: ja · Collection (Kartenübersicht): ja · Highlight: ja · Profil-Karte: ja · Routenplaner: nein | `https://www.komoot.com/tour/384495679/embed` (in der Praxis mit `?profile=1`); `https://www.komoot.com/collection/2869519/embed`; `https://www.komoot.com/highlight/472289/embed`; Sprachpräfix (`/de-de/`) weglassen | Embed-Code über "Teilen → Einbetten" in der Web-Version; Inhalt muss eigener und dauerhaft öffentlich sein; kein öffentliches API | **Ja**: alle `/embed`-URLs 200 ohne XFO/CSP; normale Tourseite `X-Frame-Options: sameorigin` | kostenlos | gut für eigene Sektions-Collections (Rad/MTB/Wandern); wenig alpine Tourenqualität, GPX im Embed nicht belegt |
| **bergfex** | keine Embed-Funktion gefunden | – | – | Startseite `X-Frame-Options: sameorigin` (nein) | – | nicht geeignet |
| **hikr.org** | keine Embed-Funktion gefunden | – | – | `X-Frame-Options: SAMEORIGIN`; curl erhält 403 (Bot-Schutz) | – | nur verlinken |
| **bergwelten.com** | keine Embed-Funktion gefunden | – | – | Tourseite 200 ohne XFO-Header, aber keine offizielle Freigabe | – | nur verlinken |
| **Waymarked Trails** (OSM) | keine dokumentierte Einbettung; offene JSON-API für markierte Wege (OSM-Relationen), keine Tourenvorschläge | `https://hiking.waymarkedtrails.org/api/v1/list/search?query=Kandersteg`; `…/api/v1/details/relation/9385137`; `…/api/v1/list/by_area?bbox=` | keins; Code GPLv3, Daten OSM/ODbL; Nutzungspolicy nicht gefunden | Seite 200 ohne XFO (technisch iframe-fähig) | kostenlos | ggf. Hintergrundlayer/Wegenetz, kein Ersatz für Tourenvorschläge |

---

## 2. alpenvereinaktiv.com / outdooractive.com

### 2.1 Offizielle Embed-Funktion (Tour2Go / Hut2Go / List2Go)

- Outdooractive-Hilfeseite "Inhalte auf Blogs und Websites einbetten": Einbetten möglich für
  "Touren, Skigebiete, Ausflugsziele, Hütten, Unterkünfte, Veranstaltungen und Angebote" sowie
  Sammlungen; nur veröffentlichte Inhalte; Funktion hinter den drei Punkten oben rechts →
  "Einbetten" → Vorschaufenster mit Darstellungsoptionen → AGB akzeptieren → HTML-Code
  (iFrame oder JavaScript). Kennzeichnung: **"Enthalten in: Pro+"**.
  Quelle: https://www.outdooractive.com/de/knowledgepage/inhalte-auf-blogs-und-websites-einbetten/40825148/
- alpenvereinaktiv-Wissensdatenbank "Touren auf der eigenen Webseite einbetten" (Stand
  12.12.2023): "Ihr dürft Touren, die bei alpenvereinaktiv findet gerne auf eurer eigenen
  Webseite einbetten. Dazu muss die Tour veröffentlicht und du PRO+ User sein." Nach Akzeptieren
  der AGB wird "der direkte Pfad zur Tour freigegeben".
  Quelle: https://alpenvereinaktiv.atlassian.net/wiki/spaces/AVAKTIV/pages/10321921
- Preise (Outdooractive-Planseite): Pro 2,50 €/Monat bzw. 29,99 €/Jahr; **Pro+ 5,00 €/Monat
  bzw. 59,99 €/Jahr**; "Inhalte auf deiner Website einbetten" ist nur im Pro+-Plan gelistet.
  Quelle: https://www.outdooractive.com/de/membership/plans.html
- Inhalt des Widgets laut Outdooractive-Blog: "interaktive vollwertige topografische Karte mit
  eingezeichnetem Track, inklusive Höhenprofil und GPX-Download". Nutzerkommentar dort:
  Kartenansicht bei Listen auf 15 Einträge begrenzt (nicht offiziell dokumentiert).
  Quelle: https://corporate.outdooractive.com/oa-blog/outdooractive-embed-plugin/
- WordPress-Plugin "Outdooractive Embed" (Version 1.6, 400+ Installationen, zuletzt vor ca.
  1 Jahr aktualisiert): Shortcode `oaembed` mit `url` und `maxwidth` (min. 260 px); Readme:
  "Only published Contents can be embeded"; Screenshots unterscheiden "Embedded Tour with
  standard account" und "with Pro+" (Pro+ = White-Label ohne Outdooractive-Branding).
  Quelle: https://wordpress.org/plugins/outdooractive-embed/

### 2.2 Technische URL-Muster (aus Plugin-Quellcode abgeleitet und per curl geprüft)

Das Plugin baut den Embed so: Loader-Script `https://www.outdooractive.com/<lang>/embed/<id>/js?mw=<true|false>`
(Tour2Go/Hut2Go) bzw. `…/embed/<id>/js?noHeader=…&initMap=…` (List2Go). Bei Pro+ kommen
`&usr=<user>&key=USR-…` dazu (Plugin liest diese aus dem vom Portal generierten Code; in
Drittcode auf GitHub ebenfalls so zu sehen). Als Host wird die Domain des Ursprungslinks
verwendet, d.h. auch `www.alpenvereinaktiv.com`.
Quelle: https://github.com/common-repository/outdooractive-embed (shortcodes.php, includes/get_prouser.php, includes/check_id.php)

Geprüft am 7.9.2026 (curl):

| URL | Ergebnis |
|---|---|
| `https://www.alpenvereinaktiv.com/de/embed/50994062/js?mw=false` | 200, JavaScript-Loader; erzeugt `<iframe src="https://www.alpenvereinaktiv.com/de/tour/kandersteg-ryharts-allmenalp/50994062/embed.html?flexView=false" allow="geolocation">` plus Alpenverein-/"part of outdooractive"-Logo |
| `https://www.alpenvereinaktiv.com/de/tour/kandersteg-ryharts-allmenalp/50994062/embed.html?flexView=false` | 200, 20,8 KB, **kein** `X-Frame-Options`, **keine** CSP → in fremde Seiten einbettbar; Seite enthält Leaflet-Karte |
| `https://www.alpenvereinaktiv.com/de/embed/50994062/iframe?mw=false` | 200, eigenständiges HTML-Dokument (`robots noindex,follow`), das den Loader enthält |
| `https://www.alpenvereinaktiv.com/de/embed/202105012/js?initMap=true` (Sammlung "Nur mit Öffis") | 200, Loader → `https://www.alpenvereinaktiv.com/de/liste/nur-mit-oeffis/202105012/embed.html?flexView=false` (200, ohne XFO/CSP, Leaflet) |
| `https://www.outdooractive.com/de/embed/50994062/js?mw=false` | 200 (nur mit curl-Standard-UA; mit Browser-UA 404) → iframe `https://www.outdooractive.com/de/route/wanderung/kandersteg/kandersteg-ryharts-allmenalp/50994062/embed.html?flexView=false` (200, ohne XFO/CSP) |
| `https://www.alpenvereinaktiv.com/de/embed/50994062` (ohne `/js`) | 200, aber Redirect auf die normale Tourseite |
| `https://www.alpenvereinaktiv.com/de/tour/…/50994062/` (normale Tourseite) | 200 mit `X-Frame-Options: SAMEORIGIN` und `Content-Security-Policy: frame-ancestors 'self'` → **nicht** einbettbar |
| `https://www.alpenvereinaktiv.com/de/embed/1`, `…/de/tour/1` | 410 (ID existiert nicht) |
| `https://www.alpenvereinaktiv.com/de/download.tour.gpx?i=50994062` | 200, `application/gpx+xml`, 11,5 KB, auch ohne Key |

Parameter, die belegt sind: `mw` (Tour/Hütte), `initMap`, `noHeader` (Liste), `usr`/`key`
(Pro+-Whitelabel), Sprache über Pfadsegment `/de/`, `/en/` usw. (Plugin prüft Sprachcode).
Eine Breite/Höhe wird nicht per URL, sondern über das umgebende Element gesetzt (Plugin:
`min-width: 260px; max-width`). **(nicht belegt)**: weitere Parameter des Embed-Dialogs
(Darstellungsvarianten), da der Dialog ein Login erfordert.

Beispiel-IDs für das Projekt: Tour 50994062 "Kandersteg-Ryharts-Allmenalp" (Quelle Tourismus
Adelboden-Lenk-Kandersteg, Labels `publicTransportFriendly`, `publicTransportTimeTable`),
Tour 17940759 "Von der Rappenseehütte zur Hermann-von-Barth-Hütte", Sammlung 202105012
"Nur mit Öffis" (16 Touren, Autor Uwe Kranenpohl, mit Karte), Sammlung 260209200
"Mehrtagestouren mit Bus und Bahn", Übersichtsseite Öffi-Tourensammlungen
https://www.alpenvereinaktiv.com/de/page/oeffi-tourensammlungen/57920259/ (Filter "mit Bahn
und Bus erreichbar", gepflegt von der alpenvereinaktiv-Redaktion).

### 2.3 "Karte mit Touren in Region X"

- Über die Embed-Funktion gibt es keine freie Regionskarte; einbettbar sind einzelne Touren,
  Hütten und **Listen/Sammlungen** (mit Karte). Eine selbst gepflegte Sammlung pro Gebiet
  ("Kandersteg mit ÖV") ist damit der Weg, eine Regionskarte zu bekommen.
- Eine echte Filterkarte (Region + Kategorie + Sprache) bietet nur die **FlexView API**
  (JavaScript, kein iframe): Script `https://api-oa.com/jscr/oa_head.js?proj=<proj>&key=<key>&lang=de`,
  Parameter `frontendtype` (tour, hut, poi …), `initMode` (map, list, gallery), `zoom`, `center`,
  Filter nach Kategorie/Region/Schwierigkeit. Der DAV setzt genau das für seine Hüttensuche ein
  (Agentur ESONO); die DAV-Hüttensuche selbst ist per CSP auf `*.alpenverein.de`, `*.jdav.de`
  usw. beschränkt und damit nicht fremd einbettbar.
  Quellen: https://developers.outdooractive.com/API-Reference/FlexView-API.html ,
  https://corporate.outdooractive.com/oa-blog/outdooractive-flexview-api-fur-die-neue-dav-huttensuche ,
  curl auf https://www.alpenverein.de/huettensuche (301 → services.alpenverein.de, `frame-ancestors https://*.alpenverein.de …`)

### 2.4 Data API (Rohdaten statt Widget)

- Doku: Projekt-Key + API-Key pro Domain nötig; Endpunkte u.a.
  `…/api/v2/project/{proj}/category/tree?type=tour`, `…/contents?type=tour`,
  `…/contents/{id1,id2}?display=verbose&lang=de`, GPX `https://api-oa.com/download.tour.gpx?i=<id>&project=<proj>&key=<key>`,
  KML `…/kml_generate?i=<id>…`, Bilder `https://img.oastatic.com/img2/{ID}/{SIZE}/variant.jpg`.
  Test-Keys "for temporary testing purposes": Projekt `api-dev-oa`, Key in der Doku als
  `yourtest-outdoora-ctiveapi` dargestellt (funktioniert hat `yourtest-outdooractiveapi`).
  Quellen: https://developers.outdooractive.com/API-Reference/Data-API.html ,
  https://developers.outdooractive.com/Overview/Outdooractive-Platform.html
- Geprüft mit Test-Keys: `contents?type=tour&startIndex=0&count=3` → 9.554 Touren, IDs
  entsprechen alpenvereinaktiv-Touren; `contents/50994062?display=verbose` → JSON mit
  `title, category, texts, teaserText, geoJson, bbox, coordinates, images, metrics, regions,
  season, labels (publicTransportFriendly, publicTransportTimeTable), meta.source`;
  `nearby/tour?lat=46.494&lon=7.674&radius=8000` → 200; `search?q=Kandersteg&type=tour` → 200;
  `filter/tour` liefert Kategorie-Filter (z.B. "Wanderung" = 8982343).
- API-Nutzungsbedingungen (corporate.outdooractive.com/en/api-terms): nur für Unternehmer
  (B2B, keine Privatpersonen); beschränkte, nicht übertragbare Lizenz; Caching nur wenn nötig
  und unverändert; Daten **mindestens alle 24 Stunden** aktualisieren; Detailseiten mit
  `robots noindex`; Kennzeichnung mit Outdooractive-Logo, Autor/Fotograf und Lizenzangabe;
  beidseitig jederzeit kündbar, danach sofortige Löschung aller Daten.
- Kosten: nicht veröffentlicht. Outdooractive-Blog: "Es gibt bereits Kunden, bei denen die
  Destination die API Lizenz für die Datendistribution bezahlt und der Empfänger den Service
  kostenlos nutzen kann." Kostenloser "Freemium Business Account"
  (https://corporate.outdooractive.com/de/kostenloser-business-account/) umfasst Firmenprofil,
  Touren/POI anlegen, Fotos, Community – Einbetten/API/FlexView werden dort **nicht** genannt.
  Quellen: https://corporate.outdooractive.com/oa-blog/gestatten-ihre-datenbank/ ,
  https://bw.tourismusnetzwerk.info/2021/03/29/datenaustausch-mein-toubiz-outdooractive-beantragung-eines-freemium-zugangs-bei-outdooractive/
- **Keine Quelle gefunden**, die DAV-Sektionen einen (kostenlosen) Data-API- oder
  FlexView-Zugang zusichert. Anfrage nötig an support@alpenvereinaktiv.com bzw. den DAV-
  Bundesverband (Betreiber von alpenvereinaktiv sind DAV, ÖAV, AVS mit Outdooractive als
  Technikpartner; Quelle: https://alpenvereinaktiv.atlassian.net/wiki/spaces/AVAKTIV/pages/7045173).

### 2.5 Offizieller Weg für DAV-Sektionen ("Sektionswidget", DAV360)

- Sektionen pflegen Touren auf alpenvereinaktiv über geschulte Autor*innen ("Autor*innen-
  schulungen über die Alpenverein Akademie für Backend-Zugang", Autorenstammtisch,
  Wissensdatenbank, Support support@alpenvereinaktiv.com). Ideal: ein*e alpenvereinaktiv-
  Koordinator*in pro Sektion, verantwortlich für Tourenangebot, Wegsperrungen, Hütten der
  Sektion.
  Quellen: https://www.alpenvereinaktiv.com/de/page/service-fuer-mitglieder-und-sektionen/64171280/ ,
  https://www.alpenverein-akademie.at/Verein-und-Funktion/Alpenvereinaktiv/
- Jede Sektion hat eine Partner-/Quellenseite: https://www.alpenvereinaktiv.com/de/quelle/dav-sektion-offenburg/3696600/
  (200) bzw. https://www.outdooractive.com/de/source/dav-sektion-offenburg/3696600/
  ("Verifizierter Partner", "Gehört zu Deutscher Alpenverein (DAV)", Touren "von Walter Knosp,
  alpenvereinaktiv.com"). Eine Embed-Funktion für diese Quellenseite ist nicht dokumentiert.
- Ein eigenes "Sektionswidget" von alpenvereinaktiv wurde **nicht gefunden**; der dokumentierte
  Weg ist die Pro+-Einbettung einzelner Touren/Sammlungen. Sektion Köln z.B. verlinkt nur auf
  alpenvereinaktiv (https://www.dav-koeln.de/cgi-bin/page.cgi?833=).
- DAV360/alpenverein.digital: Module "Mitgliederverwaltung", "Kurse, Touren, Veranstaltungen",
  "Ausleihe", "Zusammenarbeit", "Internet und Portale"; Buchungssysteme lassen sich per Widget
  auf der Sektionsseite einbinden; eine Schnittstelle zwischen DAV360 und alpenvereinaktiv-
  Touren ist in keiner Quelle beschrieben. Das Tourenprogramm der Sektion Offenburg ist
  bereits per DAV360-JSON erreichbar (siehe `docs/research/dav360-api.md`), enthält aber keine
  Geodaten/GPX.
  Quellen: https://www.dav-heilbronn.de/service/alpenverein-digital ,
  https://www.alpenverein-kassel.de/artikel/DAV360/78356

---

## 3. SAC-Tourenportal (sac-cas.ch)

- Zwei offizielle, kostenlose Widgets ("einfach, schnell und kostenlos", kein Konto):
  - Tourenziele: `https://www.sac-cas.ch/[LANG]/destinationlistiframe.html?ids=[IDS]&discipline=[DISCIPLINE]`,
    LANG = de/fr/it/en, IDs kommagetrennt (Beispiel aus der Doku `2218,2247`), DISCIPLINE =
    `mountain_hiking`, `alpine_tour`, `climbing`, `via_ferrata`, `ski_tour`, `snowshoe_tour`;
    ID steht in der URL des Tourenziels im Tourenportal. Ausgabe: "Tourenziel-Kacheln", die auf
    das Tourenziel verlinken; mehrere Disziplinen ergeben mehrere Kacheln.
    Quelle: https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal-abonnement/tourenportal-widget-tourenziele-einbinden/
  - Hütten: `https://www.sac-cas.ch/de/destinationlistiframe.html?ids=2147000006,2147000238,2147000171`
    (Hütten-ID am Ende der Hütten-URL); Ausgabe: Hütten-Kacheln mit Link ins Tourenportal.
    Quelle: https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal-abonnement/tourenportal-widget/
  - Die Doku sieht zusätzlich das Script `iframe-resizer` (cdnjs) vor, damit sich die Höhe anpasst.
    Support: it@sac-cas.ch.
- Header-Check: `https://www.sac-cas.ch/de/destinationlistiframe.html?ids=2218,2247&discipline=mountain_hiking`
  → 200, kein XFO/CSP; Inhalt ist ein TYPO3-Dokument mit `m-destination-list` und einem
  Loading-Wrapper (Kacheln werden per JS nachgeladen).
- Grenzen: Das Widget zeigt keine Karte, keine Route, kein GPX. Routen-Details: "900 kostenlose
  Routen und alle Hüttenzustiege" ohne Abo; Vollzugriff auf "mehr als 7000 Routen in sechs
  Disziplinen", "Zeichnen und GPX-Export von eigenen Routen" und Routenarchiv nur mit Abo
  (49 CHF/Jahr für Nichtmitglieder, für SAC-Mitglieder inklusive). Eine Einbettung von Routen
  oder eine API ist nicht dokumentiert.
  Quelle: https://www.sac-cas.ch/de/huetten-und-touren/sac-tourenportal-abonnement/

---

## 4. komoot

- Support-Artikel "Share and embed komoot content" (Stand ca. Juni 2026): einbettbar sind
  "individual komoot routes, overview maps for entire Collections, Highlights, or your profile
  map"; Embed-Option nur in der Web-Version über "Share → Embed" auf Route, abgeschlossener
  Aktivität, Highlight, Collection oder Profil; komoot generiert den Code (Stil und Code-Typ
  wählbar). Besucher brauchen kein komoot-Konto. Bedingungen: "Make sure you have ownership of
  the content and that it remains publicly accessible for as long as it is referenced";
  fremde Inhalte besser ins eigene Profil speichern; "The komoot route planner cannot be
  embedded"; Löschen/Privatschalten lässt Embeds brechen.
  Quelle: https://support.komoot.com/hc/en-us/articles/10331539580442-Share-and-embed-komoot-content
- API: "Komoot does not provide a publicly accessible API." (nur Geräte-Partner wie Garmin,
  Bosch, Suunto). Quelle: https://support.komoot.com/hc/en-us/articles/7464746034458-Komoot-API
- komoot.business: Embeds für "Tourismusunternehmen, Outdoor-Marken und andere Organisationen",
  drei Schritte (Inhalt teilen → Anzeige wählen → HTML einfügen), Referenzen u.a. ADFC, Visit
  Berlin, Savoie Mont Blanc; keine Preisangabe (Partnerprofil kostenlos beworben).
  Quelle: https://komoot.business/en/partner-opportunities/komoot-embeds
- ToS §12: Nutzung "exclusively with the options described within the package overview and
  solutions"; kommerzielle Nutzung nur im Rahmen der Business-Angebote.
  Quelle: https://www.komoot.com/terms-of-service
- Header-Check (curl, 7.9.2026):

| URL | Ergebnis |
|---|---|
| `https://www.komoot.com/tour/384495679/embed` ("Kandersteg - Oeschinensee") | 200, kein XFO/CSP |
| `https://www.komoot.com/tour/384495679/embed?profile=1` | 200, kein XFO/CSP (Parameter aus Drittdoku: Höhenprofil; `?_height=` laut Iframely) |
| `https://www.komoot.com/collection/2869519/embed` ("Late Summer … Adelboden-Lenk-Kandersteg") | 200, kein XFO/CSP |
| `https://www.komoot.com/highlight/472289/embed` | 200, kein XFO/CSP |
| `https://www.komoot.com/tour/384495679` (normale Seite) | 200, `X-Frame-Options: sameorigin` |

  Hinweis aus Drittquellen: Sprach-/Regionscode (`/de-de/`) aus der Embed-URL entfernen.
  Quelle: https://iframely.com/domains/komoot
- Nicht belegt: ob im Embed ein GPX-Download für Besucher angeboten wird.

---

## 5. Weitere Portale (kurz)

- **bergfex**: keine Embed-/Widget-Doku gefunden; Startseite `X-Frame-Options: sameorigin`;
  Tourenlisten enthalten keine "Einbetten"-Funktion (geprüft an
  https://www.bergfex.de/sommer/schwarzwald/touren/wanderung/).
- **hikr.org**: Community-Berichte, teils mit GPX-Datei je Bericht; keine Embed-Funktion
  dokumentiert; Server antwortet auf curl mit 403 und `X-Frame-Options: SAMEORIGIN`.
- **bergwelten.com**: keine Embed-Funktion gefunden; Tourseite liefert 200 ohne XFO-Header
  (technisch iframe-fähig, aber ohne Freigabe nicht zu empfehlen; Nutzungsbedingungen nicht geprüft).
- **Waymarked Trails** (OSM): zeigt markierte Wege aus OpenStreetMap (Relationen), keine
  redaktionellen Tourenvorschläge. Offene API geprüft: `…/api/v1/list/search?query=Kandersteg`
  (Treffer "Klettersteig Kandersteg-Allmenalp", Relation 9385137), `…/api/v1/details/relation/9385137`
  (200, JSON), `…/api/v1/list/by_area?bbox=…` (200). GPX-Endpunkt: geratene Pfade
  (`…/gpx`, `…/geometry/gpx`) → 404, **(nicht belegt)**. Website/API GPLv3, keine
  Nutzungs-/Ratelimit-Policy gefunden; Seite selbst ohne XFO-Header.
  Quellen: https://github.com/waymarkedtrails/waymarkedtrails-website ,
  https://github.com/waymarkedtrails/waymarkedtrails-api

---

## 6. Bewertung und Empfehlung

### Was V1 realistisch leisten kann

1. **alpenvereinaktiv-Einbettung mit einem Pro+-Konto der Sektion (59,99 €/Jahr)** –
   pro Gebietsseite eine oder mehrere Touren (Tour2Go) und/oder eine selbst gepflegte
   Sammlung "Kandersteg mit Bahn und Bus" (List2Go mit Karte). Das Widget bringt Karte,
   Höhenprofil und GPX-Download mit (Outdooractive-Angabe), die Embed-Endpunkte liefern 200
   ohne Frame-Restriktionen. Die Touren dafür pflegen die Sektionsautor*innen ohnehin auf
   alpenvereinaktiv; Öffi-Sammlungen und das Label "mit Bahn und Bus erreichbar" existieren dort
   bereits. Einbettcode nur über den offiziellen Dialog (AGB-Akzeptanz) erzeugen, nicht die
   Loader-URL "nachbauen" – rechtlich ist Pro+ Voraussetzung.
2. **SAC-Widget kostenlos ergänzen** für Schweizer Gebiete/Hütten (Kacheln mit Link, keine
   Karte) – kein Konto nötig.
3. **komoot-Collections** nur dort, wo die Sektion eigene Collections besitzt (z.B. Rad/MTB);
   kostenlos, iframe-fähig, aber inhaltlich schwächer für Hochtouren/Skitouren und ohne API.

### Was nicht in V1 gehört

- **Outdooractive Data API / FlexView** (eigene Karte, eigene GPX-Auslieferung, Regionsfilter):
  technisch die beste Lösung (Test-Keys liefern bereits alpenvereinaktiv-Touren inkl. GeoJSON,
  Öffi-Labels und GPX), aber B2B-Lizenz mit unbekanntem Preis, Pflicht zu 24-h-Refresh,
  noindex und Attribution. Vorher beim DAV-Bundesverband/alpenvereinaktiv-Support klären, ob
  Sektionen einen Projekt-Key (ggf. über die bestehende DAV-Lizenz wie bei der Hüttensuche)
  bekommen. Falls ja: V2 mit eigener Karte statt iframe.
- Scraping oder iframe-Einbettung normaler Portalseiten (alpenvereinaktiv, komoot, bergfex,
  hikr): durch `X-Frame-Options`/CSP blockiert bzw. ohne Freigabe.

### Offene Punkte für die Anfrage an alpenvereinaktiv/DAV

- Bekommen Sektionen Pro+ oder API-Zugang über den Verband (Hinweis: DMS-Kunden erhalten
  laut Outdooractive-Blog drei kostenlose Pro+-Zugänge)?
- Gibt es für Sektionen ein Listen-/Kartenwidget für die eigene Quellenseite?
- Darf der GPX-Download-Link (`download.tour.gpx?i=<id>`) direkt verlinkt werden?
