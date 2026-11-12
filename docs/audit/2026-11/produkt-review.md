# Produkt-Review „Ohne Auto in die Berge, ab Offenburg“

Stand: 12.11.2026 · Live-System https://dav-oepnv-touren.vercel.app · Code-Stand im lokalen Repo (Next.js 16.3.4)
Methode: curl-Messungen, Browser-Pane (Seitentext, DOM, 375 px), Code-Lektüre, `npm outdated`, `npm audit --omit=dev`, `npx vitest run`, `eslint`, `tsc`.
Personas: (a) Mitglied plant am Handy ein Wochenende, (b) Tourenleiterin prüft am Laptop ihre Sektionstour, (c) Mitglied stöbert im November.

> **Nebenwirkung dieser Prüfung:** Die Messungen von `/api/uebersicht` haben für Sa 14.11. (`datum=2026-11-14&fenster=360`, also genau der Schlüssel, den die Startseite heute abfragt) und für Sa–So 14.–15.11. Antworten in den CDN-Cache geschrieben, in denen Transitous mit HTTP 429 abgelehnt hat (1 bzw. 0 von 84 Gebieten live). Diese Antworten bleiben bis zu 24 h im Cache (siehe K1). Empfehlung: CDN-Cache in Vercel leeren oder neu deployen.

## 1. Stärken

1. **Klare Idee, ehrliche Inhalte:** 84 Gebiete mit konkreten, ÖV-bezogenen Beschreibungen (Linie, Umstiegsort, Ticket) und Sortierung nach Fahrzeit; z. B. Bühlertal „ca. 0:19 h, Deutschlandticket“, Kandersteg „Halbtax“ (Startseite, Listenansicht).
2. **Gute Live-Verbindungen:** `/api/verbindung?…nach=kandersteg&datum=2026-11-14` liefert Hinfahrt 07:30 → 10:40, Rückfahrt 18:14, „7:34 h am Berg“, Ticket-Hinweis „Bis Basel Bad Bf gilt das Deutschlandticket …“ und bahn.de-Links mit `soid/zoid`, die direkt die Suche öffnen (`src/lib/links.ts`).
3. **Schnelle, statisch vorgerenderte Detailseiten:** `/gebiet/kandersteg` 0,60 s, `/huette/doldenhornhuette` 0,52 s, `/ueber` 0,74 s (alle `x-vercel-cache: PRERENDER`); die Liste steht ohne JavaScript im HTML.
4. **Datenschutzfreundliche Einbettung:** Alpenvereinaktiv-Karten laden erst nach Klick („Beim Laden werden Daten an Alpenvereinaktiv übertragen“), die Schrift kommt selbst gehostet über `next/font`.
5. **Saubere Technik:** 178 Tests in 19 Dateien grün (5,2 s), `eslint` und `tsc --noEmit` ohne Befund, Inhalte per Zod beim Build geprüft, Filter- und Datumszustand teilbar in der URL, Inhalte unter CC BY 4.0, Code offen.
6. **Barrierefreiheit in den Grundlagen:** `lang="de"`, saubere Überschriften (H1 → H2 → H3), `aria-pressed` an allen Chips, Suche als ARIA-Combobox mit Pfeiltasten/Enter/Escape, Sheets als `<dialog>`, Touch-Ziele `min-h-11`, Badge-Farben mit Kontrast-Kommentar (`Badges.tsx`).

## 2. Schwächen

### Kritisch

**K1 · Übersicht scheitert an Transitous-Ratenlimit und wird 24 h so gecacht**
- Beleg: Kalter Abruf `/api/uebersicht?von=offenburg&datum=2026-12-05` dauerte 26,4 s; 84/84 Gebiete enthalten, aber nur **5 live**, 79 `richtwert`, alle 84 mit `fehler: "Transitous HTTP 429"`, `tagesziel` bei **0 von 84** gesetzt. Kein `X-Unvollstaendig`, weil die 429-Fehler schnell kommen. Zweiter Abruf: `x-vercel-cache: HIT`, byte-identisch. Ebenso 21.11.: 0 live; 14.11. (Startseiten-Schlüssel): 1 live.
- Ursache: Ein kalter Abruf feuert 168 Transitous-Anfragen mit 8 parallel (`PARALLEL = 4` × Hin/Rück, `src/app/api/uebersicht/route.ts`), und die Route setzt `s-maxage=86400` auch auf unvollständige oder fehlerhafte Antworten. Gleiches gilt für `/api/verbindung` (Fallback mit Fehler wird 24 h gecacht).
- Folge: Auf der Startseite fehlt jedes „Tagesziel“/„Besser mit Übernachtung“-Urteil, der Filter „Tagestour“ wirkt nicht (`filter.ts`: `uebersicht[g.id] !== false`), und niemand erfährt, warum.
- Vorschlag: (1) Antworten mit Fehlern nicht oder nur kurz cachen (`s-maxage=300` oder `no-store`, wenn eine Antwort `fehler` hat oder `quelle: richtwert` ist). (2) Übersicht nicht live für 84 Ziele rechnen, sondern per Vercel Cron nachts für die nächsten zwei Wochenenden (Sa, So, Sa–So) vorberechnen und ablegen, gedrosselt mit Rücksicht auf `Retry-After`. (3) In der Oberfläche anzeigen, wenn Live-Daten fehlen („Tagesurteil gerade nicht verfügbar“).

**K2 · Gewählter Zeitraum geht beim Klick auf ein Ziel verloren, Detailseiten haben keine Datumsauswahl**
- Beleg: Bei `/?datum=2026-11-13&rueck=2026-11-15&…` zeigt die Pill „Fr 13.11. – So 15.11.“, die Karten verlinken aber auf `/gebiet/engelberg` ohne Query (`GebietKarte.tsx`, `Ergebnisstreifen.tsx`, Karten-Popup in `Karte.tsx`, `Suche.tsx`, `HuetteKarte.tsx`). Die Gebiets- und Hüttenseite fallen dann auf den kommenden Samstag zurück (`zeitraumAusUrl`), und dort gibt es kein Datumsfeld (`document.querySelector('input[type=date]')` → keins). Die Über-Seite verspricht trotzdem „ein längerer Zeitraum lässt sich oben wählen“.
- Folge: Persona (b) kann ihre konkrete Sektionstour (Datum X) nur prüfen, wenn sie die URL von Hand ändert. Persona (a) sieht nach „Fr–So“ auf der Hüttenseite Sa–So.
- Vorschlag: `datum`, `rueck`, `fenster` in allen internen Links mitgeben und auf Gebiets- und Hüttenseite dieselbe Zeitraum-Pill samt Sheet „Wann?“ einbauen; das verwendete Datum sichtbar nennen („Verbindung für Sa 14.11.“).

**K3 · Kein Impressum, keine Datenschutzerklärung**
- Beleg: `/impressum` und `/datenschutz` → 404; Footer enthält nur „Arbeitskreis Klimaschutz · DAV Sektion Offenburg · Datenquellen · Fehler melden“. Im Browser werden ohne Einwilligung Kacheln und Schriften von `tiles.openfreemap.org` geladen (25 Anfragen beim ersten Kartenaufruf), Hosting bei Vercel (USA) protokolliert IP-Adressen, „Fehler melden“ führt zu GitHub (`fehlerMeldenLink`, `NEXT_PUBLIC_FEHLER_MAIL` in Produktion nicht gesetzt).
- Folge: Für eine öffentliche Vereinsseite in Deutschland fehlen die Pflichtangaben nach § 5 DDG und Art. 13 DSGVO; abmahnfähig und für den Verein peinlich.
- Vorschlag: Impressum (Verein, Vertretungsberechtigte, Anschrift, E-Mail, Vereinsregister) und Datenschutzerklärung (Vercel, OpenFreeMap, Transitous serverseitig, Alpenvereinaktiv nach Klick, GitHub/Mail) mit Footer-Links; mit dem Vorstand bzw. dem Datenschutzverantwortlichen der Sektion abstimmen. Ideal: Seite unter einer Sektionsdomain betreiben.

### Hoch

**H1 · Jahreszeit wird ignoriert: Sommerziele, geschlossene Hütten und Saisonbusse ohne Warnung**
- Beleg: `saison` wird nur als Badge auf Gebiets- und Hüttenseite angezeigt (`gebiet/[id]/page.tsx:40`, `huette/[id]/page.tsx:40`); `filtereGebiete` und die Startseitenkarte nutzen es nicht. Filter „Hochtour“ + „Mit Hütte“ am 13.–15.11. liefert 23 Ziele, darunter Grimsel („Busse nur etwa Juni bis Oktober“), Göscheneralp, Andermatt/Furka. Hüttenseite Doldenhornhütte zeigt nur „Sommer“ und die Anreise mit „1 Nacht“. `/api/verbindung?nach=goescheneralp&datum=2026-11-14&rueck=2026-11-15` liefert `quelle: live` ohne Hinfahrt; die Oberfläche zeigt dann den Richtwert „ca. 5:13 h · 2 Umstiege · stündlich ab Offenburg“ (`VerbindungZeile.tsx`, Zweig `!antwort.hinfahrt`), obwohl kein Bus fährt.
- Daten: 75 von 132 Hütten `sommer`, kein Gebiet `winter`, 18 Gebiete, in denen alle Hütten Sommerhütten sind; 14 Gebiete stehen auf `sommer`, führen aber Skitour oder Schneeschuh (u. a. Kandersteg mit eigener Schneeschuh-Tour, Oberstdorf, Göschenen). 12 Beschreibungen nennen Saisonbusse im Freitext.
- Vorschlag: `saison` durch Öffnungsmonate ersetzen (`offen: { von: 6, bis: 10 }`) und datumsabhängig nutzen: Hinweis-Badge „am gewählten Datum geschlossen“, Startseiten-Filter „geöffnet am Datum“ standardmäßig an, Sportarten je Jahreszeit. Bei `live` ohne Hinfahrt klar „Am gewählten Datum keine Verbindung gefunden (Saisonbus?)“ statt Richtwert zeigen. Saisonbusse als Feld der Haltestelle pflegen.

**H2 · Startseite enthält das Datum vom Build, auf jeder Seite ein Hydration-Fehler**
- Beleg: Das statische HTML von `/` (`age: 2249580`, also 26 Tage) enthält „Sa 12.9.“; im Browser wirft React `Minified React error #418` (Textabweichung), danach rechnet der Client neu und zeigt „Sa 14.11.“. `naechsterSamstag()` läuft beim Prerendern (`Startseite.tsx`, `useMemo` ohne Suchparameter).
- Folge: Wer ohne oder mit langsamem JavaScript kommt (oder eine Suchmaschine), sieht ein September-Datum; der Fehler verdeckt künftige echte Fehler in Monitoring.
- Vorschlag: Server-HTML ohne konkretes Datum („Kommender Samstag“) und das Datum erst nach dem Mounten einsetzen, oder die Startseite täglich neu validieren (`revalidate = 3600`).

**H3 · Irreführende Fehlermeldungen und keine Datumsprüfung**
- Beleg: `/gebiet/feldberg?datum=2025-11-08` zeigt „Live-Fahrplan gerade nicht erreichbar“, tatsächlich antwortet Transitous mit HTTP 400, weil das Datum in der Vergangenheit liegt; ebenso `datum=2027-11-27` (außerhalb des Fahrplans). Die Seiten-URL wird nicht geprüft (`zeitraumAusUrl` übernimmt jedes `datum`), das Ergebnis wird 24 h gecacht. Nur das Datumsfeld im Sheet hat `min={heute}`.
- Vorschlag: `datum` gegen „heute bis Fahrplanende (12.12.2026 bzw. Folgejahr)“ prüfen, vergangene Daten auf den nächsten Samstag umbiegen und Fehlerarten unterscheiden (Datum ungültig / keine Verbindung / Dienst nicht erreichbar).

**H4 · Erster Eindruck am Handy: leere Karte, keine Erklärung, keine Legende**
- Beleg: Standardansicht ist die Karte (`STANDARD_ANSICHT = 'karte'`, `steuerleiste.ts`); in der Kartenansicht wird die Überschrift „In die Berge, ohne Auto. Hütten und Touren ab Offenburg mit Bahn und Bus.“ auf dem Handy ausgeblendet (`Startseite.tsx`: `hidden lg:block`). Bei 375 px sieht man Suchfeld, „Sa 14.11.“, „Filter“, eine mehrere Sekunden leere Fläche, bis die Kacheln geladen sind, und farbige Punkte ohne Legende (`Karte.tsx` hat keine).
- Folge: Persona (a) und (c) verstehen in 10 Sekunden nicht, was die Seite kann und was Grün/Gelb/Orange bedeutet.
- Vorschlag: Einzeiler mit Nutzenversprechen auch in der Kartenansicht zeigen, auf dem Handy mit der Liste starten oder eine kurze Einführung einblenden, Legende „bis 2 h / 3 h / 4 h / über 4 h“ unten links in die Karte.

### Mittel

**M1 · Auffindbarkeit kaum vorhanden**
- Beleg: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image` → 404. Alle 216 Gebiets- und Hüttenseiten tragen dieselbe Meta-Beschreibung aus `layout.tsx` (geprüft auf `/gebiet/kandersteg`, `/huette/raemsenberg`); keine `og:`-/Twitter-Tags, kein Canonical, kein JSON-LD. 404-Seite auf Englisch („This page could not be found.“). Domain `*.vercel.app`.
- Vorschlag: `app/sitemap.ts` und `app/robots.ts`, `generateMetadata` mit Beschreibung aus `gebiet.beschreibung` bzw. „Hütte X (1915 m), ab Offenburg mit Bahn …“, `opengraph-image` je Gebiet, JSON-LD (`TouristDestination`, `LodgingBusiness` für Hütten), deutsche `not-found.tsx` mit Link zur Startseite, eigene Domain.

**M2 · Zod im Browser-Bundle**
- Beleg: Chunk `2f_zc4siqcxgi.js` (379 567 B roh, 89 530 B br) enthält Zod (105 Treffer auf `invalid_type`/`ZodError`). Er kommt über `Filter.tsx` und `filter.ts` (`SportartSchema.options`) sowie `VerbindungZeile.tsx` → `verbindung/parameter.ts` in Client-Komponenten. Das ist knapp ein Drittel des Start-JS (287 781 B br).
- Vorschlag: Sportarten, Labels und Datumslogik als einfache Konstanten in eine Datei ohne Zod auslagern; `zeitraumAusUrl` aus `parameter.ts` herauslösen.

**M3 · Begriffe nicht erklärt**
- Beleg: „ca. 4:10 h“ ist ein Richtwert vom 07.09.2026 (`berechnetAm`, nirgends angezeigt) und weicht live ab (Kandersteg 28.11.: 3:52 h, 2 statt 1 Umstieg). Kandersteg am 14.11. zeigt „7:34 h am Berg“ und gleichzeitig „Besser mit Übernachtung“, weil die Ankunft 10:40 nach der 10-Uhr-Grenze liegt (`regeln.ts`). „Mindestens am Berg“, „Haus der Sektion“ (welche Sektion?), Reisezeitfarben und „Fahrzeit offen“ werden nirgends erklärt; die Über-Seite erklärt nur die Tagesziel-Regel.
- Vorschlag: Kurze Erklärtexte am Ort („ca. = typische Fahrzeit an einem Samstag, Stand Sept. 2026“), Begründung beim Urteil („Ankunft erst 10:40“), „Haus der Sektion Offenburg“, Glossar auf der Über-Seite.

**M4 · Hütten ohne Buchungslink, Schätzungen nur teilweise gekennzeichnet**
- Beleg: 0 von 132 Hütten haben `buchungUrl`; der Knopf „Buchen“ erscheint nie, obwohl Spezifikation Zeile 83 einen Buchungslink vorsieht. 61 von 132 Hütten haben `geschaetzt: true`; der Hinweis „Zustiegszeiten sind geschätzt“ steht nur auf der Hüttenseite, die Hüttenkarten der Gebietsseite zeigen „2:30 h Zustieg“ ohne Kennzeichnung (`HuetteKarte.tsx`). Quelle vieler SAC-Hütten ist die Wikipedia-Liste.
- Vorschlag: Buchungslinks nachpflegen (SAC-Hütten über das SAC-Buchungsportal, DAV über alpsonline/Hüttenseite), „geschätzt“ als „ca.“ auch auf den Karten.

**M5 · Suche findet Hütten nur im Vorschlagsmenü**
- Beleg: Suchwort „doldenhorn“ → Liste „Nichts gefunden. Filter lockern oder Fahrzeit erhöhen.“, weil `filtereGebiete` nur Name, Region und Beschreibung des Gebiets prüft; die Hütte steht nur im Dropdown. Der Rat „Fahrzeit erhöhen“ ist hier falsch.
- Vorschlag: Gebiete auch über die Namen ihrer Hütten und Touren finden; bei null Treffern passende Hütten direkt anbieten.

**M6 · Sicherheitsupdates offen**
- Beleg: `npm audit --omit=dev`: 4 Schwachstellen (1 kritisch, 3 hoch): `next` 16.3.4 (u. a. RCE in `next/og` und Bildoptimierung, Cache-Poisoning; die betroffenen Funktionen werden laut Code nicht genutzt, das Risiko ist daher gering), `zod` < 4.6.6, `sharp`, `source-map-js`. `next` ist exakt auf 16.3.4 gepinnt, aktuell 16.4.6.
- Vorschlag: `next`/`eslint-config-next` auf 16.4.6, `zod` 4.6.7, `npm audit fix`; Dependabot oder Renovate aktivieren.

### Niedrig

**N1 · Elf Ziele standardmäßig ausgeblendet:** Mit `maxStd: 5` zeigt die Startseite 73 von 84 Gebieten; Arlberg, Montafon, Silvretta, Kleinwalsertal u. a. fehlen ohne Hinweis. Vorschlag: „11 weitere Ziele über 5 h“ als Link unter der Liste.

**N2 · „Fehler melden“ führt zu GitHub:** Ohne `NEXT_PUBLIC_FEHLER_MAIL` öffnet der Link `github.com/…/issues/new`; die meisten Mitglieder haben kein Konto. Vorschlag: Mailadresse des Arbeitskreises setzen.

**N3 · Kein sichtbarer Datenstand:** Richtwerte (`berechnetAm: 2026-09-07`) stammen aus dem Sommerfahrplan; am 13.12.2026 wechselt der Fahrplan. Vorschlag: Stand im Footer bzw. auf der Über-Seite und Richtwerte nach dem Fahrplanwechsel neu berechnen.

**N4 · Kleinigkeiten Barrierefreiheit:** Die Zeitraum-Pill heißt für Screenreader nur „Sa 14.11.“ (kein „Zeitraum ändern“); Kartenpunkte sind nicht per Tastatur erreichbar (Liste als Alternative ist vorhanden); der Ergebnisstreifen ist nur wischbar. Vorschlag: `aria-label` ergänzen, Hinweis „Alle Ziele auch in der Liste“.

**N5 · Für Tourenleitungen fehlt Gruppenwissen:** Keine Hinweise auf Gruppenfahrscheine, Sparpreise oder Platzreservierung (z. B. SBB-Gruppenreise ab 10 Personen). Vorschlag: Absatz „Mit der Gruppe“ in `tickets.yaml` und auf der Gebietsseite.

**N6 · `/maplibre/*` ohne Langzeit-Cache:** `maplibre-gl-shared.mjs` (492 KB roh, 140 KB br) wird mit `max-age=0, must-revalidate` ausgeliefert. Vorschlag: versionierten Dateinamen und `immutable`-Header über `next.config.ts` `headers()`.

## 3. Messwerte

| Messung | Wert | Bemerkung |
|---|---|---|
| `/` Antwortzeit | 0,56 s (TTFB 0,53 s) | `x-vercel-cache: HIT` |
| `/` HTML | 186 150 B roh, 27 153 B br | enthält RSC-Daten aller 84 Gebiete und 216 Sucheinträge |
| `/` JavaScript (10 Dateien inkl. CSS) | 1 013 242 B roh, 287 781 B br | größter Chunk 379 567 B roh = Zod |
| Karte nachgeladen | `maplibre-gl-shared.mjs` 140 KB br, Worker 6 KB br, `karte.json` 7,8 KB br, 25 Anfragen an openfreemap | Standardansicht am Handy |
| `/gebiet/kandersteg` | 0,60 s, 29 951 B | PRERENDER |
| `/huette/doldenhornhuette` | 0,52 s, 14 855 B | PRERENDER |
| `/ueber` | 0,74 s, 13 764 B | PRERENDER |
| `/api/verbindung?…nach=kandersteg&datum=2026-11-28` | 3,17 s kalt, 1 982 B | `quelle: live`, 2 Umstiege, 3:52 h |
| `/api/uebersicht?…datum=2026-12-05` kalt | **26,4 s**, 43 379 B | 84/84 Gebiete, **5 live**, 79 richtwert, 84× `fehler` (HTTP 429), 0× `tagesziel`, kein `X-Unvollstaendig` |
| dasselbe zweiter Abruf | 0,25 s | `HIT`, byte-identisch: Fehlerantwort gecacht |
| `/api/uebersicht?…datum=2026-11-14&fenster=360` kalt | 27,6 s, 39 794 B | 1 live, 77× 429, 7× „nicht erreichbar“ |
| `/api/uebersicht?…datum=2026-11-21` kalt | 17,9 s, 38 905 B | 0 live |
| `/api/verbindung` mit `datum=2025-11-08` | 200, 0,56 s | `quelle: richtwert`, `fehler: Transitous HTTP 400`; UI: „Live-Fahrplan gerade nicht erreichbar“ |
| `/api/verbindung` mit `rueck` vor `datum` | 400 | „rueck: darf nicht vor datum liegen“ |
| `/api/uebersicht?datum=gestern` | 400 | Validierung greift |
| `/gebiet/gibtsnicht`, `/huette/gibtsnicht` | 404 | englische Standardseite |
| `/robots.txt`, `/sitemap.xml`, `/impressum`, `/datenschutz` | 404 | |
| Meta-Beschreibung je Seite | 1 für alle Seiten | keine OG-Tags, kein JSON-LD |
| Konsole Startseite | React-Fehler #418 | HTML enthält „Sa 12.9.“ |
| Inhalte | 84 Gebiete, 132 Hütten, 221 Touren, 14 Gebiete ohne Tour | 61 Hütten geschätzt, 0 mit Buchungslink |
| Saison | Gebiete 62 ganzjährig / 22 Sommer / 0 Winter; Hütten 57 / 75 / 0 | 14 Sommer-Gebiete mit Winter-Sportarten |
| Tests | 19 Dateien, 178 Tests, alle grün, 5,2 s | `eslint` und `tsc` ohne Befund |
| `npm audit --omit=dev` | 1 kritisch, 3 hoch | next 16.3.4, zod 4.5.4, sharp, source-map-js |
| `npm outdated` | 16 Pakete | u. a. next 16.4.6, maplibre-gl 6.18.0, zod 4.6.7 |
