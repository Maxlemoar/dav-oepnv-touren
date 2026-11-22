# Zeitfenster-UX: Hin- und Rückzeile, Kopfzeile, Zurück-Knopf

Stand 2026-11-22. Folgt auf die Zeitfenster-Karte (`2026-11-19-zeitfenster-karte-design.md`, live seit 22.11.).

## Warum

Maximilians Feedback nach dem Livegang: Die Datumswahl fragt dreimal dasselbe (Datum, Schalter Tagestour/Mehrere
Tage, zweites Datumsfeld) und lässt offen, für welchen Tag „los ab“ und „zurück bis“ gelten. Die Kopfzeile wirkt
verrutscht und wiederholt den Titel. Der Zurück-Link auf der Ortsseite ist kaum als drückbar zu erkennen. Stefan
will die Seite dem Vorstand zeigen; sie soll dafür ruhig und eindeutig wirken.

## Ziele

1. Datum und Zeitraum frei wählen, ohne Schalter: wie im DB Navigator je eine Zeile für Hin- und Rückfahrt.
2. Kopfzeile über die volle Breite, kein doppelter Titel.
3. Ein klar erkennbarer, schlichter Zurück-Knopf auf der Ortsseite.

Nicht-Ziele: Änderungen an Bewertung, Musterfahrplan, Karte oder URL-Format. Kein eigener Kalender, keine neue
Abhängigkeit.

## Ansätze (Punkt 1)

- **A, gewählt:** Hin- und Rückzeile mit je nativem Datumsfeld und Uhrzeit-Auswahl. Mehrtägig ergibt sich aus
  den Daten. Robust, auf dem Handy der gewohnte Wähler, Uhrzeit hängt sichtbar am Tag. Kostet den Doppelschieber.
- **B:** Kalender für einen Zeitraum plus Schieber wie heute. Kompakter, aber selbst gebaut oder als Bibliothek,
  aufwendig barrierefrei zu machen, und die Frage „welcher Tag gilt für los ab“ bleibt.

## Entwurf

### 1. Hin- und Rückzeile (`ZeitfensterWahl`)

```
Hinfahrt     [ Sa 28.11. ]   ab    [ 6:00 ▾ ]
Rückfahrt    [ Sa 28.11. ]   bis   [ 21:00 ▾ ]
             [Sa 28.11.] [So 29.11.] [Wochenende]
Mindestens vor Ort  ●━━━━━○──────  4 h        (nur wenn Hin- und Rücktag gleich)
```

- Datumsfelder bleiben native `input type=date` mit dem bestehenden Entwurfsverhalten (`DatumFeld`).
- Uhrzeiten als native `select` in 30-Minuten-Stufen von 4:00 bis 24:00 (`ZEITBAND`), Anzeige wie `alsUhrzeit`.
- Das Rückdatum folgt dem Hindatum: Beim Ändern des Hindatums bleibt die Zahl der Nächte gleich (gleicher Tag
  bleibt gleicher Tag). Das Rückdatum ist frühestens das Hindatum (Hüttenseite: Hindatum + 1).
- Am gleichen Tag gilt weiter: „zurück bis“ liegt mindestens eine Stufe nach „los ab“, der jeweils andere Wert
  weicht aus (Logik aus `band()` übernehmen).
- Schnellwahl: kommender Samstag, Sonntag danach (beides Tagestouren) und „Wochenende“ (Sa hin, So zurück).
  Aktiv markiert, wenn Datum und Rückdatum passen.
- Ohne gewähltes Datum (`gewaehlt: false`) sind beide Datumsfelder leer, das Rückdatum ist gesperrt bis zur
  Wahl der Hinfahrt; Uhrzeiten und „vor Ort“ lassen sich schon einstellen und schreiben wie heute nur die Uhrzeiten.
- Entfällt: Schalter Tagestour/Mehrere Tage, `mehrVorgemerkt`, der Hinweis „Los ab gilt für …“, `Zeitband`
  (falls sonst unbenutzt) und `rueckFuerArt` (falls sonst unbenutzt).
- Die URL bleibt unverändert (`datum`, `rueck`, `ab`, `bis`, `vorort`); geteilte Links gelten weiter.

### 2. Kopfzeile und Titel

- Kopfzeile ohne `max-w-5xl`: Name links mit dem Innenabstand der Seitenleiste (`px-4 sm:px-6`), „Sektionstouren“
  und „Über“ rechts außen, Abstand `gap-6`, Tippfläche mindestens 44 px. Gilt für alle Seiten.
- Startseite: Die Überschrift „In die Berge, ohne Auto.“ entfällt. Das `h1` ist Stefans Satz „Ausgangsorte für
  Touren ab Offenburg mit Bahn und Bus.“ in kleinerer Größe (etwa `text-xl`/`sm:text-2xl`). Seitentitel und
  Metadaten bleiben.

### 3. Zurück-Knopf (Ortsseite)

- Text nur „← Zurück“, ohne Zeitfenster in Klammern; gestaltet als umrandeter Knopf (vorhandene Klasse `pill`
  oder gleichwertig), mindestens 44 px hoch.
- Er steht oben in der Seitenleiste und bleibt beim Scrollen sichtbar (sticky; ab lg im Scrollbereich der
  Seitenleiste, darunter unter der Kopfzeile), mit Papier-Hintergrund, damit Inhalt nicht durchscheint.
- Ziel unverändert: `/` mit dem aktuellen Zeitfenster (`ZeitraumLink`), auch bei Einstieg über einen geteilten Link.

## Dem Umsetzer überlassen

Genaue Abstände und Farben im Rahmen von `docs/design-system.md`; ob `select` oder `input type=time` mit
`step=1800` (meine Wahl: `select`, weil `step` in Safari nicht greift); Tests für die neue Datumsfolge-Regel in
`tests/lib/zeitfenster.test.ts`.
