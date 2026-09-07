# Design System

Ziel: Auf dem Handy am Samstagmorgen in 30 Sekunden zur Antwort. Ruhig, lesbar, ohne Outdoor-Kitsch.
Eine Farbe trägt Bedeutung, sonst Grau- und Papiertöne.

## Grundsätze

1. **Mobile first.** Alles wird für 360 px Breite entworfen und wächst ab 640 px (sm) und 1024 px (lg).
   Auf dem Handy ist die Liste der Normalfall, die Karte ein Segment in der Steuerleiste. Ab lg stehen Liste und Karte nebeneinander.
2. **Eine Spalte, klare Reihenfolge.** Versprechen, Suche, Steuerleiste (Zeitraum, Filter, Ansicht), Ergebnisse. Keine Sidebar auf dem Handy.
   Details zu Zeitraum und Filter liegen in Sheets, nicht auf der Seite.
3. **Berührbar.** Jedes Bedienelement mindestens 44 px hoch. Chips 36 px mit 8 px Abstand. Keine Hover-only-Funktionen.
4. **Farbe heißt etwas.** Grün bis Orange ist Reisezeit. Signalfarbe nur für Handlungen und das Tagesziel-Urteil.
   Betreiberfarben (DAV, SAC) nur als kleines Symbol, nie als Fläche.
5. **Zahlen zuerst.** Fahrzeit, Umstiege, Tourenfenster stehen fett am Anfang der Zeile. Prosa danach.
6. **Wartezustände sind ehrlich.** Skeleton beim Laden, klarer Hinweis beim Richtwert-Fallback, nie leere Fläche.
7. **Ergebnisse über der Falz.** Auf 390 px Breite ist die erste Ergebniskarte ohne Scrollen sichtbar: Kopf inkl. Suchfeld
   höchstens ca. 190 px (Titel eine Zeile, Untertitel eine Zeile, Suchfeld 44 px), darunter die 57 px hohe Steuerleiste,
   dann sofort die Empfehlungsleiste und die Karten. Die Seite lädt zum Stöbern ein, nicht zum Formularausfüllen.

## Farben (Tokens in globals.css)

| Token | Wert | Verwendung |
|---|---|---|
| papier | #f7f6f2 | Seitenhintergrund |
| karte | #ffffff | Karten (Cards), Eingaben |
| nebel | #e8e6df | Skeleton, Trennflächen |
| linie | #d5d2c8 | Rahmen, Trennlinien |
| tinte | #1b1f1c | Text |
| tinte-2 | #4a5049 | Sekundärtext |
| tinte-3 | #666b64 | Hinweise, Meta |
| tanne | #1f4d3a | Primärfarbe, Buttons, Links |
| tanne-hell | #2f6b52 | Hover, aktive Chips |
| tanne-tint | #e3efe8 | Hintergrund aktiver Chips, Erfolg |
| signal | #c4471a | Tagesziel-Badge, wichtiger Hinweis |
| signal-tint | #fbe9e0 | Hintergrund Warnhinweis |
| stufe-2 … stufe-5 | #2f6b52, #7fa85a, #d9a441, #b85a22 | Reisezeit bis 2/3/4/5 h, Karte und Badge. Text auf stufe-3 und stufe-4 in tinte, sonst weiß |
| dav / sac | #2f6b52 / #c8102e | Betreiber-Symbol |

## Typografie

Geist Sans (self-hosted über next/font), Fallback system-ui. Basis 16 px, Zeilenhöhe 1.5.

| Stil | Größe | Gewicht | Verwendung |
|---|---|---|---|
| titel | 24 px / sm 36 px | 600 | Seitentitel |
| h2 | 22 px | 600 | Abschnitte |
| h3 | 18 px | 600 | Kartentitel |
| text | 16 px | 400 | Fließtext |
| meta | 14 px | 400 | Hinweise, Badges |
| zahl | 18 px | 600, tabular-nums | Fahrzeit, Uhrzeiten |

## Abstände und Formen

4-px-Raster. Seitenrand 16 px, ab sm 24 px. Kartenabstand 12 px. Karten-Radius 14 px, Buttons und Chips 10 px.
Schatten nur eine Stufe: `0 1px 2px rgb(0 0 0 / 0.06)`.

## Bausteine

- **Chip**: 36 px hoch, Rahmen linie, aktiv tanne-tint mit tanne-Text. Mehrfachwahl bei Sportart, Einfachwahl bei Art und Fahrzeit.
- **Segment**: Zweier- oder Dreier-Umschalter (Tagestour / Übernachtung / alle), volle Breite auf dem Handy.
- **Karte (Card)**: weiß, Radius 14, 16 px Innenabstand, Titel + Meta-Zeile + Verbindungszeile. Ganze Karte ist Link.
- **Badge**: 24 px hoch, Radius 999. Varianten: stufe (Reisezeit), tagesziel (signal), ticket (nebel), betreiber (Symbol + Text).
- **Verbindungszeile**: eine Zeile fett mit Zahlen, darunter Meta. Aufklappbar zu Abschnitten.
- **Steuerleiste**: eine Zeile, sticky unter dem Header (`sticky top-14`), bg-papier/95 mit backdrop-blur und Trennlinie unten, 56 px + 1 px hoch, horizontal scrollbar. Links die Pills Zeitraum und Filter, rechts das Segment Liste | Karte (nur unter lg). Muss direktes Kind des Ergebnis-Containers sein, sonst trägt sticky nicht.
- **Pill**: 40 px hoch, Radius 999, Rahmen linie auf Karte-Weiß, Symbol + Text, `aria-haspopup="dialog"`. Zeitraum-Pill zeigt "Sa 12.9." oder "Sa 12.9. – So 13.9." (`zeitraumText`), Filter-Pill trägt einen tanne-Zähler (`anzahlAktiverFilter`: Sportarten + Art + Fahrzeit ≠ 5 h + Fenster ≠ 6 h) als kleines Badge.
- **Sheet**: natives `<dialog>` mit `showModal()`. Auf dem Handy von unten (rounded-t-2xl, max-h 85dvh, Griff-Linie), ab sm zentriert (max-w-md, rounded-2xl). Backdrop tinte/50, Klick darauf und Esc schließen, Body-Scroll gesperrt, Fokus auf dem ersten Bedienelement. Kopf mit Titel, Body scrollbar, unten "Fertig" (knopf, volle Breite) und optional ein sekundärer Knopf. Auswahl wirkt sofort im Hintergrund, "Fertig" schließt nur.
- **Sheet "Wann?"**: 2×2-Raster großer Chips Sa / So / Wochenende / Fr–So (44 px, Datum klein als zweite Zeile), darunter aufklappbar "Anderes Datum" mit den Feldern Hin und Zurück ("Zurück" liegt nie vor "Hin"), darunter "Mindestens am Berg" als Chip-Reihe 3 / 4 / 5 / 6 / 8 h, nur bei gleichem Tag aktiv, sonst ausgegraut mit Hinweis.
- **Sheet "Was?"**: Art-Segment (Alle / Tagestour / Mit Hütte), Sportart-Chips, Fahrzeit-Chips, unten "Zurücksetzen" (sekundär) neben "Fertig".
- **Empfehlungsleiste**: einzeilig in tanne-tint, Label fett, Links nebeneinander, horizontal scrollbar. Ersetzt den Kasten.
- **Skeleton**: nebel-Fläche mit `animate-pulse`, gleiche Höhe wie die spätere Zeile.
- **Tour-Card**: Card ohne Ganzflächen-Link; der Titel ist der Link zum Portal (neuer Tab). Darunter eine Meta-Zeile mit
  Punkt-Trennern in fester Reihenfolge (Sportart · Dauer h:mm · Höhenmeter · Länge · Schwierigkeit), nur belegte Werte.
  Dritte Zeile: Anbieter-Badge (nebel: "Alpenvereinaktiv", "SAC-Tourenportal", "komoot") und Badge "ÖV-tauglich" (tanne-tint).
  Raster wie Hütten (sm: 2 Spalten). Reihenfolge auf der Gebietsseite: Kopf, Anreise, Touren, Hütten.
- **Einbettung (Platzhalter bis Klick)**: Fremdinhalte (Karte, Höhenprofil eines Tourenportals) laden nie von selbst.
  Platzhalter in Kartenhöhe (520 px, sm 600 px), Rahmen linie, Radius karte, nebel-Fläche, ein Satz zum Datenabfluss und ein
  `knopf` "Karte und Höhenprofil laden (Anbieter)". Erst nach Klick ersetzt das iframe (`loading="lazy"`, `allow="geolocation"`,
  volle Breite, gleiche Höhe) den Platzhalter. Darunter immer der Textlink "Bei Anbieter öffnen" (44 px hoch).
  Auf der Gebietsseite liegt der Tour-Embed hinter `details`/`summary` "Karte anzeigen" über beide Spalten; ein Sammlungs-Embed
  steht offen über den Tour-Cards.

## Verhalten

- Zustand (Zeitraum, Filter, Suche) lebt in der URL. Zurück-Taste und Teilen funktionieren.
- Live-Daten laden nach dem Rendern. Die Seite ist ohne JavaScript lesbar, nur ohne Uhrzeiten.
- Fokus sichtbar (2 px tanne-Ring). Kontraste mindestens 4.5:1 für Text.
