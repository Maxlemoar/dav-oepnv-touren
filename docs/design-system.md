# Design System

Ziel: Auf dem Handy am Samstagmorgen in 30 Sekunden zur Antwort. Ruhig, lesbar, ohne Outdoor-Kitsch.
Eine Farbe trägt Bedeutung, sonst Grau- und Papiertöne.

## Grundsätze

1. **Mobile first.** Alles wird für 360 px Breite entworfen und wächst ab 640 px (sm) und 1024 px (lg).
   Auf dem Handy ist die Liste der Normalfall, die Karte ein Knopf. Ab lg stehen Liste und Karte nebeneinander.
2. **Eine Spalte, klare Reihenfolge.** Versprechen, Suche, Datum, Filter, Ergebnisse. Keine Sidebar auf dem Handy.
3. **Berührbar.** Jedes Bedienelement mindestens 44 px hoch. Chips 36 px mit 8 px Abstand. Keine Hover-only-Funktionen.
4. **Farbe heißt etwas.** Grün bis Orange ist Reisezeit. Signalfarbe nur für Handlungen und das Tagesziel-Urteil.
   Betreiberfarben (DAV, SAC) nur als kleines Symbol, nie als Fläche.
5. **Zahlen zuerst.** Fahrzeit, Umstiege, Tourenfenster stehen fett am Anfang der Zeile. Prosa danach.
6. **Wartezustände sind ehrlich.** Skeleton beim Laden, klarer Hinweis beim Richtwert-Fallback, nie leere Fläche.

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
| titel | 28 px / lg 36 px | 600 | Seitentitel |
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
- **Datum**: natives `input type=date` in Karte-Weiß, daneben Chips "Sa" und "So" für das kommende Wochenende.
- **Kartenknopf**: auf dem Handy fest unten mittig (`fixed bottom-4`), 48 px hoch, tanne mit weißem Text.
- **Skeleton**: nebel-Fläche mit `animate-pulse`, gleiche Höhe wie die spätere Zeile.

## Verhalten

- Zustand (Datum, Filter, Suche) lebt in der URL. Zurück-Taste und Teilen funktionieren.
- Live-Daten laden nach dem Rendern. Die Seite ist ohne JavaScript lesbar, nur ohne Uhrzeiten.
- Fokus sichtbar (2 px tanne-Ring). Kontraste mindestens 4.5:1 für Text.
