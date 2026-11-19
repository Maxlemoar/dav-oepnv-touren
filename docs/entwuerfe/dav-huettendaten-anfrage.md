# Entwurf: Anfrage an den DAV-Bundesverband wegen Hüttendaten

Stand 19.11.2026. **Entwurf, nicht versendet.** Absender: Maximilian Marowsky für den Arbeitskreis Klimaschutz der DAV Sektion Offenburg.

## Empfänger

- **An:** Ressort Hütten und Wege, `huetten.wege@alpenverein.de`. Laut Kontaktseite des Bundesverbands gehört das Ressort zum Geschäftsbereich Alpine Raumordnung.
- **Cc:** Stabsbereich Digitale Services, `alpenverein.digital@alpenverein.de`. Dort liegt vermutlich die technische Seite der Schnittstelle.
- Optional **Cc:** `klimaschutz@alpenverein.de`, weil der Planer eine Klimaschutzmaßnahme ist und wir parallel den Klimafonds ansprechen.

Eine eigene Kontaktadresse von hut-reservation.org für Datennutzung wurde nicht gefunden. Laut DAV betreiben DAV, ÖAV, SAC und AVS das System gemeinsam. Das Impressum der Seite wird nur per JavaScript geladen und war maschinell nicht auszulesen.

## Vor dem Versand klären

- [ ] Läuft die Anfrage über die Sektion? Möglich ist, dass Vorstand oder Hüttenreferent sie selbst stellen oder mitzeichnen. Anfragen „von der Sektion“ haben beim Bundesverband vermutlich mehr Gewicht.
- [ ] Impressum und Datenschutzerklärung des Planers sind online (Paket P5). Der DAV wird sich die Seite ansehen.
- [ ] Der Datenstand der Hütten ist korrigiert (geschlossene Hütten, falsche Standorte). Siehe Qualitätscheck.

---

**Betreff:** Anfrage: Öffnungsstatus und freie Plätze aus der Hüttenreservierung im ÖV-Tourenplaner der Sektion Offenburg

Sehr geehrte Damen und Herren,

im Arbeitskreis Klimaschutz der DAV Sektion Offenburg haben wir einen Planer gebaut: „Ohne Auto in die Berge, ab Offenburg“ (https://dav-oepnv-touren.vercel.app). Er zeigt, welche Tourengebiete und Hütten von Offenburg aus mit Bahn und Bus erreichbar sind, mit einer echten Verbindung für das gewählte Datum. Das Angebot ist ehrenamtlich, nichtkommerziell und werbefrei. Der Code ist offen (https://github.com/Maxlemoar/dav-oepnv-touren). Er setzt um, was das DAV-Klimaschutzkonzept unter Mobilität nennt: „Bereitstellung von Informationen (z. B. zu Optionen der ÖPV-Anreise)“.

Wer ohne Auto auf eine Hütte will, braucht zwei Gewissheiten: Er kommt hin und zurück, und die Hütte ist an dem Tag offen. Die erste liefert der Planer schon. Für die zweite würden wir gern Daten aus der Hüttenreservierung der Alpenvereine (hut-reservation.org) anzeigen und bitten Sie um Ihre Zustimmung.

**Was wir anzeigen möchten**, nur für Alpenvereinshütten aus unserem Bestand (derzeit 28 DAV-, 4 ÖAV- und 68 SAC-Hütten):

- den Status am gewählten Datum: bewirtschaftet, nicht bewirtschaftet (Winterraum) oder geschlossen,
- auf Wunsch die Zahl der freien Plätze oder nur eine grobe Angabe („Plätze frei“ oder „ausgebucht“),
- daneben einen Link zur Buchung der jeweiligen Hütte auf hut-reservation.org. Wir buchen nichts selbst und verarbeiten keine Personendaten.

**Wie wir abfragen würden:** nur serverseitig und nur, wenn jemand die Seite einer Hütte öffnet, gespeichert für 6 bis 24 Stunden. Es gibt keine Massenabfragen und keine Weitergabe der Rohdaten. Die Quelle stünde sichtbar neben der Angabe, etwa so: „Status und freie Plätze: Hüttenreservierung der Alpenvereine (hut-reservation.org), Stand <Uhrzeit>“.

Unsere Fragen:

1. Dürfen wir Öffnungsstatus und freie Plätze für die genannten Hütten so anzeigen?
2. Wenn ja, in welchem Umfang: nur der Status, eine grobe Angabe oder die genaue Zahl der freien Plätze?
3. Welche Quellenangabe wünschen Sie, und gibt es Bedingungen, etwa ein Logo, einen Haftungshinweis oder eine Häufigkeit der Abfragen?
4. Gibt es eine offizielle Schnittstelle oder einen Datenzugang für Sektionen und Partner? Oder können Sie uns sagen, wen wir dafür ansprechen sollen? Das ÖAV-Werkzeug „Bettencheck“ nutzt nach unserem Verständnis dieselben Daten.
5. Können Sie für die SAC- und ÖAV-Hütten mitentscheiden, oder sollen wir dort gesondert anfragen?

Bis wir Ihre Antwort haben, binden wir keine Daten aus der Hüttenreservierung ein.

Für Rückfragen oder ein kurzes Gespräch stehe ich gern zur Verfügung.

Mit freundlichen Grüßen
Maximilian Marowsky
Arbeitskreis Klimaschutz, DAV Sektion Offenburg
<Absender-E-Mail>

---

## Hintergrund und offene Fragen

- **Technischer Stand:** Ohne Login antworten zwei Endpunkte: `GET /api/v1/reservation/hutInfo/{id}` und `GET /api/v1/reservation/getHutAvailability?hutId={id}&step=WIZARD`. Der zweite liefert pro Tag für zwei Jahre `freeBeds`, `freeBedsPerCategory` und `hutStatus` (SERVICED, UNSERVICED, CLOSED). Das hat die eigene Abfrage vom 12.11.2026 ergeben (`docs/research/naechstes-level.md`, Abschnitt 3). Nutzungsbedingungen für Dritte wurden nicht gefunden. Die Schnittstelle ist undokumentiert und kann sich ändern.
- **Die Anfrage nennt die Endpunkte bewusst nicht.** Es soll nicht so wirken, als hätten wir schon eingebaut. Fragt der DAV nach, können wir sie nennen.
- **Für jede Hütte muss einmal die ID zugeordnet werden.** Naturfreunde- und private Häuser sind nicht im System. Für sie bleibt nur die manuelle Angabe aus dem neuen Feld `status`.
- **Offen:** ob der DAV für SAC und ÖAV sprechen kann. SAC-Hütten sind im Bestand die Mehrheit (68). Ist die Antwort für SAC-Hütten nein, lohnt eine eigene Anfrage beim SAC (Kontakt nicht recherchiert).
- **Offen:** Wer bei hut-reservation.org technisch und rechtlich verantwortlich ist. Das Impressum (`/guest/legal-notice`) liest die Seite per JavaScript nach und war ohne Browser nicht abrufbar.

## Quellen

- DAV-Kontaktseite (Ressort Hütten und Wege `huetten.wege@alpenverein.de`, Stabsbereich Digitale Services `alpenverein.digital@alpenverein.de`, Klimaschutz `klimaschutz@alpenverein.de`, Anschrift Anni-Albers-Straße 7, 80807 München), abgerufen 19.11.2026: https://www.alpenverein.de/verband/kontakt
- DAV, „Onlinereservierungssystem der Alpenvereinshütten“ (gemeinsamer Betrieb durch DAV, ÖAV, SAC und AVS, keine Angaben zu Schnittstellen), abgerufen 19.11.2026: https://www.alpenverein.de/artikel/onlinereservierungssystem-der-alpenvereinshutten_c060cfdc-a751-43ae-adc2-0d3e3e640bda
- DAV, Bettencheck des ÖAV (09.07.2025): https://www.alpenverein.de/artikel/huettentouren-planung-bettencheck_ab9568eb-135a-4bfb-a0ce-297c34b9186a
- DAV-Klimaschutzkonzept 2025, S. 9 (Maßnahme „Bereitstellung von Informationen (z. B. zu Optionen der ÖPV-Anreise)“): https://www.alpenverein.de/files/natur/2025_klimaschutzkonzept.pdf
- hut-reservation.org (Startseite und Route `/guest/legal-notice` im JavaScript-Bundle), abgerufen 19.11.2026: https://www.hut-reservation.org/
- Eigene Befunde: `docs/research/naechstes-level.md` (Abschnitt 3, Abfrage vom 12.11.2026), `docs/audit/2026-11/bericht.md` (Hüttenstatus, Saison-Ampel)
