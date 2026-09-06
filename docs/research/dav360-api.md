# Sektionsprogramm: DAV360-Schnittstelle (Stand 2026-09-06)

Die Website dav-offenburg.de läuft auf dem DAV360-Sektionsbaukasten (Vue/Vuetify). Das
Tourenprogramm wird per JSON-API geladen, ohne Login abrufbar:

```
GET https://www.dav-offenburg.de/api/events/get-event-list-view-by-id/17307?additionalData={}
GET https://www.dav-offenburg.de/api/groups/get-events-for-group-by-id/<groupId>
```

Sektions-Metadaten: `window.DAV_SECTION` (id 12456, Sektionsnummer 202).
Rohdaten-Snapshot: `dav360-events-raw.json` (≈1 MB, 321 Events).

## Befund

| Merkmal | Wert |
|---|---|
| Events gesamt | 321 (2024: 103, 2025: 119, 2026: 90, 2027: 8) |
| Kategorien | Hochtour 67, Wandern 57, Bergwandern 42, Skitour 41, Klettern 41, MTB 28, Klettersteig 15, Ski alpin 11, Rad 9, Langlauf 6, Schneeschuh 4 |
| `isPublicTransportAvailable` = true | 22 (sonst null) |
| `arrivalHints` gesetzt | 37 (Freitext, z.B. "Anfahrt mit ÖPNV", "Anfahrt im Kleinbus (Mietfahrzeug)") |
| `destination` gesetzt | 1 |
| `geographicRegions` gesetzt | 0 |
| `locations` gesetzt | 16 (nur grobe Region, keine Koordinaten) |
| Uhrzeiten in `dates` | 3 (fast alles 00:00) |

Relevante Felder pro Event: `id, title, description (HTML), category, classification,
season, stamina (z.B. "500-800 hm | 4-6 h"), technique (T1…), dates[], leaders[],
meetingPoint (HTML), arrivalHints (HTML), isPublicTransportAvailable, bookingCode,
registerEnd, maxNumberOfParticipants, detailRoute`.

## Konsequenzen

- Das System der Wahrheit für Sektionstouren bleibt DAV360. Wir lesen, wir schreiben nicht.
- DAV360 hat bereits die Felder "ÖV möglich" und "Anreisehinweis". Sie werden nur selten gepflegt.
  Ein Hebel für Tourenleiter ist, diese Felder zu füllen; unser Tool kann den Text dafür liefern.
- Ziel/Region fehlt strukturiert. Startbahnhof und Zielgebiet müssen wir aus Titel/Beschreibung
  ableiten (LLM-Extraktion, dann manuelle Prüfung) und in einer eigenen Anreicherungstabelle
  pro Event-ID halten.
- Viele Alpentouren fahren heute mit Kleinbus/Mietfahrzeug. Das ist der Vergleichsfall für CO2.
- Rechtlich/politisch: API ist öffentlich, aber nicht dokumentiert. Vor Launch mit Geschäftsstelle
  abstimmen; Fallback ist ein nächtlicher Snapshot statt Live-Abfrage.
