# Buchungslinks der Hütten (Stand 19.11.2026)

116 von 133 Hütten haben ein `buchungUrl`: 85 mit Online-Buchung, 31 mit Anfrage (Formular, E-Mail oder Telefon auf der verlinkten Seite). 17 Hütten haben keinen Link.

Vorgehen: Hütten-IDs von hut-reservation.org über die öffentliche Schnittstelle `/api/v1/reservation/hutInfo/{id}` (IDs 1 bis 800) ermittelt und per Name, Website und Koordinaten zugeordnet. Das Muster `https://www.hut-reservation.org/reservation/book-hut/{id}/wizard` ist auf offiziellen Seiten verlinkt, z. B. Rappenseehütte (dav-kempten.de, ID 707), Gaulihütte (gaulihuette.ch, ID 27), Druesberghütte (druesberghuette.ch, ID 741) und Douglasshütte (douglasshuette.at, ID 393). Die Buchungsseite antwortet für jede ID mit 200 (Single-Page-App); deshalb ist die ID-Zuordnung über die Schnittstelle der eigentliche Nachweis. Hütten, deren Eintrag dort gesperrt ist (`hutUnlocked: false`: Edmund-Probst-Haus 713, Ravensburger Hütte 708, Jurahaus 443, Lohnerhütte 754), haben stattdessen den Link der Hüttenseite. Alle eingetragenen URLs liefern Status 200 (nach Weiterleitungen, bei 403 mit Browser-Kennung per GET).

Bot-Sperren: dav-offenburg.de und bergfreunde-saar.de antworten auf HEAD mit 403, per GET mit Browser-Kennung mit 200. dav-baar.de (Schwenninger Hütte) antwortet auch dann mit 403; die Seite wurde im Browser geprüft und ist die offizielle Sektionsseite. todtnauer-huette.de und douglasshuette.at blockieren curl ebenfalls; die Links wurden im Browser von dort abgelesen.

## Hütten mit Link

| Hütte | Link | Quelle des Links | Art |
|---|---|---|---|
| Albert-Heim-Hütte | https://www.hut-reservation.org/reservation/book-hut/710/wizard | hut-reservation.org (Hütten-ID 710, per API hutInfo bestätigt) | Online-Buchung |
| Almagellerhütte | https://www.hut-reservation.org/reservation/book-hut/208/wizard | hut-reservation.org (Hütten-ID 208, per API hutInfo bestätigt) | Online-Buchung |
| Bächlitalhütte | https://www.hut-reservation.org/reservation/book-hut/23/wizard | hut-reservation.org (Hütten-ID 23, per API hutInfo bestätigt) | Online-Buchung |
| Balmhornhütte | https://www.hut-reservation.org/reservation/book-hut/579/wizard | hut-reservation.org (Hütten-ID 579, per API hutInfo bestätigt) | Online-Buchung |
| Berggasthaus Äscher | https://aescher.ch/anfragen/ | Hüttenseite aescher.ch/uebernachten (Link „Buchungsanfrage“) | Anfrage |
| Berggasthaus Bollenwees | https://bollenwees.ch/zimmer-matratzenlager/ | Hüttenseite bollenwees.ch (Zimmer & Lager, Abschnitt „Anfragen & Reservationen“) | Anfrage |
| Berggasthaus Meglisalp | https://meglisalp.ch/anfrage-und-reservation/ | Hüttenseite meglisalp.ch (Anfrage und Reservation) | Anfrage |
| Bergseehütte | https://bergsee.ch/reservation | Hüttenseite bergsee.ch (Reservation; Winter Hüttenbuch, Sommer ab Januar 2027 über SAC-Portal) | Anfrage |
| Binntalhütte | https://www.hut-reservation.org/reservation/book-hut/264/wizard | hut-reservation.org (Hütten-ID 264, per API hutInfo bestätigt) | Online-Buchung |
| Blüemlisalphütte | https://www.hut-reservation.org/reservation/book-hut/1/wizard | hut-reservation.org (Hütten-ID 1, per API hutInfo bestätigt) | Online-Buchung |
| Britanniahütte | https://www.hut-reservation.org/reservation/book-hut/9/wizard | hut-reservation.org (Hütten-ID 9, per API hutInfo bestätigt) | Online-Buchung |
| Cabane des Marindes | https://www.hut-reservation.org/reservation/book-hut/574/wizard | hut-reservation.org (Hütten-ID 574, per API hutInfo bestätigt) | Online-Buchung |
| Cabane Perrenoud | https://www.cas-neuchatel.ch/cabanes/cabane-perrenoud/tarifs-et-reservations.php | CAS Neuchâtel, Hüttenseite (Tarifs et réservations, per E-Mail) | Anfrage |
| Capanna Corno Gries | https://www.hut-reservation.org/reservation/book-hut/197/wizard | hut-reservation.org (Hütten-ID 197, per API hutInfo bestätigt) | Online-Buchung |
| Capanna Cristallina | https://www.hut-reservation.org/reservation/book-hut/20/wizard | hut-reservation.org (Hütten-ID 20, per API hutInfo bestätigt) | Online-Buchung |
| Capanna Piansecco | https://www.hut-reservation.org/reservation/book-hut/399/wizard | hut-reservation.org (Hütten-ID 399, per API hutInfo bestätigt) | Online-Buchung |
| Carschinahütte | https://www.hut-reservation.org/reservation/book-hut/46/wizard | hut-reservation.org (Hütten-ID 46, per API hutInfo bestätigt) | Online-Buchung |
| Chalet-Refuge Schnepfenried | https://amisdelanaturecolmar.fr/contact/ | Amis de la Nature Colmar, Seite Refuge du Schnepfenried („Pour vos réservations, veuillez utiliser le formulaire de contact“) | Anfrage |
| Chelenalphütte | https://www.hut-reservation.org/reservation/book-hut/55/wizard | hut-reservation.org (Hütten-ID 55, per API hutInfo bestätigt) | Online-Buchung |
| Claridenhütte | https://www.claridenhuette.ch/reservation/ | Hüttenseite claridenhuette.ch (Reservation, per Telefon/E-Mail) | Anfrage |
| Dammahütte | https://www.hut-reservation.org/reservation/book-hut/228/wizard | hut-reservation.org (Hütten-ID 228, per API hutInfo bestätigt) | Online-Buchung |
| Darmstädter Hütte | https://www.alpenverein-darmstadt.de/huetten/darmstaedterhuette/uebernachten-und-reservieren | DAV Darmstadt-Starkenburg, Hüttenseite (Übernachten und Reservieren, per E-Mail an Hüttenwirt) | Anfrage |
| Doldenhornhütte | https://www.hut-reservation.org/reservation/book-hut/11/wizard | hut-reservation.org (Hütten-ID 11, per API hutInfo bestätigt) | Online-Buchung |
| Domhütte | https://www.hut-reservation.org/reservation/book-hut/697/wizard | hut-reservation.org (Hütten-ID 697, per API hutInfo bestätigt) | Online-Buchung |
| Dossenhütte | https://www.hut-reservation.org/reservation/book-hut/31/wizard | hut-reservation.org (Hütten-ID 31, per API hutInfo bestätigt) | Online-Buchung |
| Douglasshütte | https://www.hut-reservation.org/reservation/book-hut/393/wizard | hut-reservation.org (Hütten-ID 393, per API hutInfo bestätigt) | Online-Buchung |
| Druesberghütte | https://www.hut-reservation.org/reservation/book-hut/741/wizard | hut-reservation.org (Hütten-ID 741, per API hutInfo bestätigt) | Online-Buchung |
| Edmund-Probst-Haus | https://www.huetten-holiday.com/huts/edmund-probst-haus | Hüttenseite edmund-probst-haus.de (Link „Reservierung Sommer“) | Online-Buchung |
| Etzlihütte | https://www.hut-reservation.org/reservation/book-hut/398/wizard | hut-reservation.org (Hütten-ID 398, per API hutInfo bestätigt) | Online-Buchung |
| Fergenhütte | https://www.hut-reservation.org/reservation/book-hut/241/wizard | hut-reservation.org (Hütten-ID 241, per API hutInfo bestätigt) | Online-Buchung |
| Fiderepasshütte | https://www.huetten-holiday.com/huts/fiderepass-huette | Hüttenseite fiderepasshuette.de (Link „Hier gehts direkt zur Reservierung“) | Online-Buchung |
| Freiburger Hütte | https://www.hut-reservation.org/reservation/book-hut/97/wizard | hut-reservation.org (Hütten-ID 97, per API hutInfo bestätigt) | Online-Buchung |
| Fridolinshütte | https://fridolinshuette.ch/belegung-21 | Hüttenseite fridolinshuette.ch (Belegungsplan/Reservationen, per E-Mail) | Anfrage |
| Fründenhütte | https://www.hut-reservation.org/reservation/book-hut/19/wizard | hut-reservation.org (Hütten-ID 19, per API hutInfo bestätigt) | Online-Buchung |
| Gaulihütte | https://www.hut-reservation.org/reservation/book-hut/27/wizard | hut-reservation.org (Hütten-ID 27, per API hutInfo bestätigt) | Online-Buchung |
| Gelmerhütte | https://www.hut-reservation.org/reservation/book-hut/66/wizard | hut-reservation.org (Hütten-ID 66, per API hutInfo bestätigt) | Online-Buchung |
| Glecksteinhütte | https://www.hut-reservation.org/reservation/book-hut/2/wizard | hut-reservation.org (Hütten-ID 2, per API hutInfo bestätigt) | Online-Buchung |
| Grialetschhütte | https://www.hut-reservation.org/reservation/book-hut/444/wizard | hut-reservation.org (Hütten-ID 444, per API hutInfo bestätigt) | Online-Buchung |
| Gruppenhaus Rämsenberg | https://www.dav-offenburg.de/anfragen/kontakt/Reservierungsanfrage/126974/document-35029+object-126974 | DAV Offenburg, Hüttenseite Rämsenberg (Reservierungsanfrage) | Anfrage |
| Gspaltenhornhütte | https://www.hut-reservation.org/reservation/book-hut/44/wizard | hut-reservation.org (Hütten-ID 44, per API hutInfo bestätigt) | Online-Buchung |
| Heinrich-Hueter-Hütte | https://www.hut-reservation.org/reservation/book-hut/89/wizard | hut-reservation.org (Hütten-ID 89, per API hutInfo bestätigt) | Online-Buchung |
| Hohwaldhütte | https://www.bergfreunde-saar.de/hohwaldhuette/Buchung%20und%20Preise | DAV Bergfreunde Saar, Hüttenseite (Buchung und Preise) | Anfrage |
| Hüfihütte | https://www.hut-reservation.org/reservation/book-hut/388/wizard | hut-reservation.org (Hütten-ID 388, per API hutInfo bestätigt) | Online-Buchung |
| Hundsteinhütte | https://www.hut-reservation.org/reservation/book-hut/32/wizard | hut-reservation.org (Hütten-ID 32, per API hutInfo bestätigt) | Online-Buchung |
| Jurahaus (Cabane du Jura) | https://www.jurahaus-sac.ch/kontakt | Hüttenseite jurahaus-sac.ch/übernachten („Reserviere via das Kontaktformular“) | Anfrage |
| Kemptner Hütte | https://www.huetten-holiday.com/huts/kemptner-huette | Hüttenseite kemptner-huette.de (Link „Jetzt buchen!“) | Online-Buchung |
| Konkordiahütte | https://www.hut-reservation.org/reservation/book-hut/12/wizard | hut-reservation.org (Hütten-ID 12, per API hutInfo bestätigt) | Online-Buchung |
| Konstanzer Hütte | https://www.hut-reservation.org/reservation/book-hut/502/wizard | hut-reservation.org (Hütten-ID 502, per API hutInfo bestätigt) | Online-Buchung |
| Kröntenhütte | https://www.hut-reservation.org/reservation/book-hut/274/wizard | hut-reservation.org (Hütten-ID 274, per API hutInfo bestätigt) | Online-Buchung |
| Lämmerenhütte | https://www.hut-reservation.org/reservation/book-hut/453/wizard | hut-reservation.org (Hütten-ID 453, per API hutInfo bestätigt) | Online-Buchung |
| Lauteraarhütte | https://www.hut-reservation.org/reservation/book-hut/558/wizard | hut-reservation.org (Hütten-ID 558, per API hutInfo bestätigt) | Online-Buchung |
| Leglerhütte | https://www.hut-reservation.org/reservation/book-hut/13/wizard | hut-reservation.org (Hütten-ID 13, per API hutInfo bestätigt) | Online-Buchung |
| Leutschachhütte | https://www.hut-reservation.org/reservation/book-hut/717/wizard | hut-reservation.org (Hütten-ID 717, per API hutInfo bestätigt) | Online-Buchung |
| Lidernenhütte | https://www.hut-reservation.org/reservation/book-hut/5/wizard | hut-reservation.org (Hütten-ID 5, per API hutInfo bestätigt) | Online-Buchung |
| Lindauer Hütte | https://www.hut-reservation.org/reservation/book-hut/297/wizard | hut-reservation.org (Hütten-ID 297, per API hutInfo bestätigt) | Online-Buchung |
| Lohnerhütte | https://www.sac-wildstrubel.ch/de/Lohnerhutte | SAC Wildstrubel, Hüttenseite (Reservation obligatorisch; Umstellung auf SAC-System, Buchungen ab Januar 2027) | Anfrage |
| Lötschenpasshütte | https://www.loetschenpass.ch/die-huette/buchung/ | Hüttenseite loetschenpass.ch (Onlinebuchung) | Online-Buchung |
| Mannheimer Hütte | https://www.hut-reservation.org/reservation/book-hut/654/wizard | hut-reservation.org (Hütten-ID 654, per API hutInfo bestätigt) | Online-Buchung |
| Martinsmadhütte | https://www.hut-reservation.org/reservation/book-hut/615/wizard | hut-reservation.org (Hütten-ID 615, per API hutInfo bestätigt) | Online-Buchung |
| Mindelheimer Hütte | https://www.mindelheimer-huette.de/formular | Hüttenseite mindelheimer-huette.de/reservierung (Reservierungsformular) | Anfrage |
| Monte-Rosa-Hütte | https://www.hut-reservation.org/reservation/book-hut/6/wizard | hut-reservation.org (Hütten-ID 6, per API hutInfo bestätigt) | Online-Buchung |
| Mutthornhütte | https://www.hut-reservation.org/reservation/book-hut/14/wizard | hut-reservation.org (Hütten-ID 14, per API hutInfo bestätigt) | Online-Buchung |
| Muttseehütte | https://www.hut-reservation.org/reservation/book-hut/229/wizard | hut-reservation.org (Hütten-ID 229, per API hutInfo bestätigt) | Online-Buchung |
| Naturfreundehaus Aurore (Schwarzsee) | https://aurore.nfh.ch/de/reservation/ | Hausseite aurore.nfh.ch (Reservation) | Anfrage |
| Naturfreundehaus Badener Höhe | https://www.naturfreunde-karlsruhe.de/unsere-haeuser/badener-hoehe/buchungsformular-nfh-badener-hoehe.html | NaturFreunde Karlsruhe, Hausseite (Buchungsformular) | Anfrage |
| Naturfreundehaus Brend | https://naturfreundehaus-brend.de/index.php/zimmer/ | Hausseite naturfreundehaus-brend.de (Zimmer, „Jetzt buchen“ mit Buchungswidget) | Online-Buchung |
| Naturfreundehaus Brünig | https://mos-guesthouse.ch/book/ | Hausseite mos-guesthouse.ch (Book) | Online-Buchung |
| Naturfreundehaus Feldberg | https://www.naturfreundehaus-feldberg.de/kontakt/ | Hausseite naturfreundehaus-feldberg.de (Kontakt) | Anfrage |
| Naturfreundehaus Grindelwald | https://hotelreservation.expert/#/f48d84c4ad | naturfreunde.ch/haeuser/grindelwald (Link „Reservationsanfrage“) | Anfrage |
| Naturfreundehaus Hörden | https://www.naturfreunde-hoerden.de/haus-buchung/ | Hausseite naturfreunde-hoerden.de (Haus Buchung) | Anfrage |
| Naturfreundehaus Kniebis | https://www.naturfreundehaus-kniebis.de/kontakt | Hausseite naturfreundehaus-kniebis.de/uebernachten (Verweis auf Kontaktformular) | Anfrage |
| Naturfreundehaus Kornebene | https://www.kornebene.de/haus-kornebene/ | Hausseite kornebene.de (Formular „Übernachtungsanfrage“) | Anfrage |
| Naturfreundehaus Sommerecke | https://taenzerdorf.org/de/sommerecke/vermietung-sommerecke | Hausseite taenzerdorf.org (Vermietung Sommerecke) | Anfrage |
| Oberaletschhütte | https://www.hut-reservation.org/reservation/book-hut/47/wizard | hut-reservation.org (Hütten-ID 47, per API hutInfo bestätigt) | Online-Buchung |
| Planurahütte | https://planurahuette.ch/kurzinfo/belegungsplan | Hüttenseite planurahuette.ch (Reservation/Belegungsplan, telefonisch) | Anfrage |
| Prinz-Luitpold-Haus | https://www.hut-reservation.org/reservation/book-hut/270/wizard | hut-reservation.org (Hütten-ID 270, per API hutInfo bestätigt) | Online-Buchung |
| Ramshaldenhütte | https://www.dav-freiburg.de/de/huette/anmeldung_ramshalde.php | DAV Freiburg, Hüttenseite Ramshalde (Anmeldeformular) | Anfrage |
| Rappenseehütte | https://www.hut-reservation.org/reservation/book-hut/707/wizard | hut-reservation.org (Hütten-ID 707, per API hutInfo bestätigt) | Online-Buchung |
| Ravensburger Hütte | https://www.ravensburgerhuette.at/uebernachtung/buchen-und-reservierung/ | Hüttenseite ravensburgerhuette.at (Buchen und Reservierung, Anfrageformular) | Anfrage |
| Refuge des Trois Fours | https://chaletrefuge3fours.ffcam.fr/reservation.html | Refugeseite chaletrefuge3fours.ffcam.fr (Réservation) | Online-Buchung |
| Refuge du Grand Ventron | https://refugegrandventron.ffcam.fr/reservation.html | Refugeseite refugegrandventron.ffcam.fr (Réservation, Formular per Post/Mail) | Anfrage |
| Ringelspitzhütte | https://www.hut-reservation.org/reservation/book-hut/514/wizard | hut-reservation.org (Hütten-ID 514, per API hutInfo bestätigt) | Online-Buchung |
| Rothornhütte | https://www.hut-reservation.org/reservation/book-hut/334/wizard | hut-reservation.org (Hütten-ID 334, per API hutInfo bestätigt) | Online-Buchung |
| Rotondohütte | https://www.hut-reservation.org/reservation/book-hut/404/wizard | hut-reservation.org (Hütten-ID 404, per API hutInfo bestätigt) | Online-Buchung |
| Rottalhütte | https://www.hut-reservation.org/reservation/book-hut/498/wizard | hut-reservation.org (Hütten-ID 498, per API hutInfo bestätigt) | Online-Buchung |
| Rugghubelhütte | https://www.hut-reservation.org/reservation/book-hut/41/wizard | hut-reservation.org (Hütten-ID 41, per API hutInfo bestätigt) | Online-Buchung |
| Saarbrücker Hütte | https://www.hut-reservation.org/reservation/book-hut/309/wizard | hut-reservation.org (Hütten-ID 309, per API hutInfo bestätigt) | Online-Buchung |
| Salbithütte | https://www.hut-reservation.org/reservation/book-hut/227/wizard | hut-reservation.org (Hütten-ID 227, per API hutInfo bestätigt) | Online-Buchung |
| Sandkästle | https://www.dav-offenburg.de/anfragen/kontakt/Reservierungsanfrage/126974/document-42691+object-126974 | DAV Offenburg, Hüttenseite Sandkästle (Reservierungsanfrage) | Anfrage |
| Schönbielhütte | https://www.hut-reservation.org/reservation/book-hut/308/wizard | hut-reservation.org (Hütten-ID 308, per API hutInfo bestätigt) | Online-Buchung |
| Schönbrunner Hütte | https://www.schoenbrunner-huette.de/index.php?id=279 | Hüttenseite schoenbrunner-huette.de (Belegung & Buchung) | Anfrage |
| Schreckhornhütte | https://www.hut-reservation.org/reservation/book-hut/204/wizard | hut-reservation.org (Hütten-ID 204, per API hutInfo bestätigt) | Online-Buchung |
| Schwarzenberghütte | https://www.hut-reservation.org/reservation/book-hut/562/wizard | hut-reservation.org (Hütten-ID 562, per API hutInfo bestätigt) | Online-Buchung |
| Schwenninger Hütte | https://www.dav-baar.de/schwenninger-huette/ | DAV Baar, Hüttenseite (Abschnitt Buchung, Anfragen per E-Mail) | Anfrage |
| Silvrettahütte | https://www.hut-reservation.org/reservation/book-hut/80/wizard | hut-reservation.org (Hütten-ID 80, per API hutInfo bestätigt) | Online-Buchung |
| Spannorthütte | https://www.hut-reservation.org/reservation/book-hut/244/wizard | hut-reservation.org (Hütten-ID 244, per API hutInfo bestätigt) | Online-Buchung |
| Spitzmeilenhütte | https://www.hut-reservation.org/reservation/book-hut/682/wizard | hut-reservation.org (Hütten-ID 682, per API hutInfo bestätigt) | Online-Buchung |
| Staufner Haus | https://www.hut-reservation.org/reservation/book-hut/85/wizard | hut-reservation.org (Hütten-ID 85, per API hutInfo bestätigt) | Online-Buchung |
| Täschhütte | https://www.hut-reservation.org/reservation/book-hut/51/wizard | hut-reservation.org (Hütten-ID 51, per API hutInfo bestätigt) | Online-Buchung |
| Tierberglihütte | https://www.hut-reservation.org/reservation/book-hut/305/wizard | hut-reservation.org (Hütten-ID 305, per API hutInfo bestätigt) | Online-Buchung |
| Tilisunahütte | https://www.hut-reservation.org/reservation/book-hut/91/wizard | hut-reservation.org (Hütten-ID 91, per API hutInfo bestätigt) | Online-Buchung |
| Todtnauer Hütte | https://app.mews.com/distributor/9f9b50d5-978d-4dba-9173-b24100c9b89e | Hüttenseite todtnauer-huette.de (Link „Jetzt buchen“) | Online-Buchung |
| Totalphütte | https://www.hut-reservation.org/reservation/book-hut/92/wizard | hut-reservation.org (Hütten-ID 92, per API hutInfo bestätigt) | Online-Buchung |
| Treschhütte | https://www.hut-reservation.org/reservation/book-hut/688/wizard | hut-reservation.org (Hütten-ID 688, per API hutInfo bestätigt) | Online-Buchung |
| Ulmer Hütte | https://www.ulmerhuette.at/anfrage | Hüttenseite ulmerhuette.at (Link „Aufenthalt anfragen“) | Anfrage |
| Voralphütte | https://www.hut-reservation.org/reservation/book-hut/259/wizard | hut-reservation.org (Hütten-ID 259, per API hutInfo bestätigt) | Online-Buchung |
| Waltenbergerhaus | https://www.huetten-holiday.com/huts/waltenbergerhaus | Hüttenseite waltenbergerhaus.de (Link „Reservieren“) | Online-Buchung |
| Weisshornhütte | https://www.hut-reservation.org/reservation/book-hut/672/wizard | hut-reservation.org (Hütten-ID 672, per API hutInfo bestätigt) | Online-Buchung |
| Weissmieshütte | https://www.hut-reservation.org/reservation/book-hut/209/wizard | hut-reservation.org (Hütten-ID 209, per API hutInfo bestätigt) | Online-Buchung |
| Wiedenbachhütte | https://www.alpenverein-heidelberg.de/huetten/Wiedenbachh%C3%BCtte | DAV Heidelberg, Hüttenseite (Abschnitt Reservierung) | Anfrage |
| Wiesbadener Hütte | https://www.hut-reservation.org/reservation/book-hut/234/wizard | hut-reservation.org (Hütten-ID 234, per API hutInfo bestätigt) | Online-Buchung |
| Wildhornhütte | https://www.hut-reservation.org/reservation/book-hut/164/wizard | hut-reservation.org (Hütten-ID 164, per API hutInfo bestätigt) | Online-Buchung |
| Wildstrubelhütte | https://www.hut-reservation.org/reservation/book-hut/65/wizard | hut-reservation.org (Hütten-ID 65, per API hutInfo bestätigt) | Online-Buchung |
| Windegghütte | https://www.hut-reservation.org/reservation/book-hut/214/wizard | hut-reservation.org (Hütten-ID 214, per API hutInfo bestätigt) | Online-Buchung |
| Wormser Hütte | https://www.hut-reservation.org/reservation/book-hut/667/wizard | hut-reservation.org (Hütten-ID 667, per API hutInfo bestätigt) | Online-Buchung |
| Zwinglipasshütte | https://www.hut-reservation.org/reservation/book-hut/30/wizard | hut-reservation.org (Hütten-ID 30, per API hutInfo bestätigt) | Online-Buchung |

## Hütten ohne Link

| Hütte | Grund |
|---|---|
| Anenhütte | Status geschlossen |
| Cavardirashütte | Status Umbau |
| Clubhaus Backi | Sektionsseite zeigt nur Belegungsplan-PDFs, keine Reservierungs- oder Kontaktseite |
| Engelhornhütte | Reservation nur telefonisch beim Hüttenwart (steht auf der Hüttenseite = webUrl) |
| La Chaume des Veaux | Reservierung nur per E-Mail-Adresse auf der Website, keine Reservierungsseite |
| Les Jonquilles | keine Website gefunden, nur Telefonnummer in einem Naturfreunde-Flyer |
| Lustenauer Hütte | Hüttenseite bietet nur einen mailto-Link „Aufenthalt anfragen“ |
| Madrisahütte | Reservierung per E-Mail, Adresse steht auf der Hüttenseite (= webUrl), keine eigene Seite |
| Naturfreundehaus Ämmital (Höchschwendi) | Reservation per E-Mail/Telefon, steht auf der Hausseite (= webUrl), keine eigene Seite |
| Naturfreundehaus Bellevue (Montoz) | laut naturfreunde.ch „nicht reservierbar“ |
| Naturfreundehaus Breitnau | Hausseite (Jimdo) ohne Reservierungsseite; Buchung nur über Drittportal gruppenhaus.de |
| Naturfreundehaus Gersbacher Hörnle | keine offizielle Hausseite gefunden, nur Drittportal gruppenhaus.de |
| Naturfreundehaus Großer Wald (Michelbach) | keine offizielle Hausseite gefunden, nur Drittportal gruppenhaus.de |
| Naturfreundehaus Häusern | keine offizielle Hausseite gefunden, nur Drittportal gruppenhaus.de |
| Refuge du Club Vosgien de Fréconrupt | keine offizielle Seite des Club Vosgien Schiltigheim zum Refuge gefunden |
| Schwarzwasserhütte | Status Umbau (in hut-reservation.org als ID 189 geführt, bewusst nicht eingetragen) |
| Wanderheim Eninger Weide (Hans-Schenk-Haus) | Übernachtung „nach Vereinbarung“, keine Reservierungsseite (Kontakt auf webUrl) |

## Hinweise

- Lohnerhütte, Bergseehütte und Mindelheimer Hütte nehmen Sommerreservierungen 2027 erst ab Januar 2027 an; Lohner- und Bergseehütte stellen auf das SAC-System (hut-reservation.org) um. Dann lohnt ein Wechsel auf den direkten Buchungslink.
- Die Allgäuer Hütten Kemptner Hütte, Waltenbergerhaus, Fiderepasshütte und Edmund-Probst-Haus buchen über huetten-holiday.com, nicht über hut-reservation.org.
- Die Darmstädter Hütte hat ausdrücklich kein Reservierungssystem; Anfragen gehen per E-Mail an den Hüttenwirt.
