import { seitenMetadaten } from '@/lib/metadaten'
import { rechtliches } from '@/lib/rechtliches'
import { AngabenFolgen, Stelle } from '../impressum/Angaben'

export const metadata = seitenMetadaten({
  titel: 'Datenschutz',
  beschreibung: 'Welche Daten beim ÖV-Tourenplaner „Ohne Auto in die Berge“ anfallen: kein Tracking, keine Cookies, Karte von OpenFreeMap, Hosting bei Vercel.',
  pfad: '/datenschutz',
})

const LINK = 'text-tanne underline'

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{titel}</h2>
      {children}
    </section>
  )
}

function Rechtsgrundlage({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-tinte-2">{children}</p>
}

export default function DatenschutzSeite() {
  const r = rechtliches()
  const v = r.verantwortlich
  const fehlerMail = process.env.NEXT_PUBLIC_FEHLER_MAIL

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Datenschutz</h1>
        <p className="text-tinte-2">
          Kurz gesagt: Diese Seite setzt keine Cookies, misst keine Reichweite und verfolgt dich nicht. Du brauchst kein
          Konto und gibst keine Daten ein. Personenbezogene Daten fallen nur an, wo es technisch nicht anders geht.
          Das steht hier im Einzelnen.
        </p>
      </header>

      <Abschnitt titel="Verantwortlich">
        <p>{r.projekt}.</p>
        {v ? (
          <>
            <p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
            <Stelle v={v} />
            {v.datenschutzbeauftragter && <p>Datenschutzbeauftragte Person: {v.datenschutzbeauftragter}</p>}
          </>
        ) : (
          <AngabenFolgen r={r} />
        )}
      </Abschnitt>

      <Abschnitt titel="Hosting bei Vercel">
        <p>
          Die Seite liegt bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA). Bei jedem Aufruf
          verarbeitet Vercel technisch notwendige Daten in Server-Protokollen: deine IP-Adresse, Datum und Uhrzeit,
          die aufgerufene Adresse, die zuvor besuchte Seite (Referrer) sowie Browser und Betriebssystem. Das dient
          dem sicheren und stabilen Betrieb und der Abwehr von Angriffen. Die Protokolle werden nur für begrenzte
          Zeit aufbewahrt und nicht mit anderen Daten zusammengeführt.
        </p>
        <p>
          Vercel hat seinen Sitz in den USA und ist nach dem EU-US Data Privacy Framework zertifiziert; für
          Übermittlungen in die USA gilt damit der Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO).
          Vercel verarbeitet die Daten in unserem Auftrag (Art. 28 DSGVO). Mehr dazu in der{' '}
          <a href="https://vercel.com/legal/privacy-policy" className={LINK}>Datenschutzerklärung von Vercel</a>.
        </p>
        <Rechtsgrundlage>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren Betrieb der Seite).</Rechtsgrundlage>
      </Abschnitt>

      <Abschnitt titel="Karte von OpenFreeMap">
        <p>
          Die Karte auf der Startseite und auf allen Gebietsseiten (auf großen Bildschirmen immer; auf dem Handy auf der
          Startseite in der Kartenansicht, auf Gebietsseiten im Kartenstreifen über dem Inhalt) lädt dein Browser direkt von <span className="whitespace-nowrap">tiles.openfreemap.org</span>, einem freien
          Kartendienst (<a href="https://openfreemap.org" className={LINK}>openfreemap.org</a>) mit Daten von
          OpenStreetMap: Kartenkacheln, Kartenstil und Kartenschriften. Dabei erhält der Betreiber deine IP-Adresse
          und Angaben zu deinem Browser, weil er die Kacheln sonst nicht an dich ausliefern kann. Welche
          Kartenausschnitte du ansiehst, ist für ihn ebenfalls erkennbar.
        </p>
        <p>
          Die Schrift der Seite selbst liefern wir vom eigenen Server aus; Server von Google oder anderen
          Schriftanbietern werden nicht kontaktiert.
        </p>
        <Rechtsgrundlage>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer Kartendarstellung der Ziele).</Rechtsgrundlage>
      </Abschnitt>

      <Abschnitt titel="Fahrplanabfragen über Transitous">
        <p>
          Verbindungen für dein Datum fragt unser Server bei <a href="https://transitous.org" className={LINK}>Transitous</a>{' '}
          ab, einem offenen Fahrplandienst. Übermittelt werden nur Start- und Zielhaltestelle, Datum und Uhrzeit.
          Deine IP-Adresse und andere Angaben über dich gehen nicht an Transitous.
        </p>
      </Abschnitt>

      <Abschnitt titel="Wetterdaten über Open-Meteo">
        <p>
          Für Daten bis 14 Tage voraus zeigen wir auf Gebiets- und Hüttenseiten die Vorhersage von{' '}
          <a href="https://open-meteo.com" className={LINK}>Open-Meteo</a> an. Sie ruft unser Server ab, nur mit
          Koordinaten und Höhe des Ziels und dem Datum. Deine IP-Adresse und andere Angaben über dich werden dabei
          nicht übermittelt.
        </p>
      </Abschnitt>

      <Abschnitt titel="Tourenkarten erst nach Klick">
        <p>
          Karten und Höhenprofile von Tourenportalen wie Alpenvereinaktiv oder komoot laden nie von selbst. An ihrer
          Stelle steht ein Platzhalter. Erst wenn du auf „Karte und Höhenprofil laden“ klickst, verbindet sich dein
          Browser mit dem Portal. Dann erhält der Anbieter deine IP-Adresse und Browserangaben und kann eigene
          Cookies setzen; es gilt dessen Datenschutzerklärung. Nach dem Neuladen der Seite steht wieder der
          Platzhalter da.
        </p>
        <Rechtsgrundlage>Rechtsgrundlage: deine Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).</Rechtsgrundlage>
      </Abschnitt>

      <Abschnitt titel="Links zu anderen Seiten">
        <p>
          Links zu bahn.de, sbb.ch, Hüttenseiten oder Tourenportalen sind gewöhnliche Links. Erst wenn du einen
          anklickst, ruft dein Browser die fremde Seite auf; vorher erfährt der Anbieter nichts von dir. Fahrplanlinks
          enthalten Start, Ziel und Datum, aber keine Angaben über dich. Auf der fremden Seite gilt deren
          Datenschutzerklärung.
        </p>
      </Abschnitt>

      <Abschnitt titel="Gespeicherte Ansicht im Browser">
        <p>
          Ob du lieber die Liste oder die Karte siehst, merkt sich die Seite im lokalen Speicher deines Browsers
          (localStorage). Dieser Eintrag bleibt auf deinem Gerät und wird nicht an uns übertragen. Du kannst ihn
          jederzeit über die Browser-Einstellungen löschen. Darüber hinaus gibt es keine Cookies, kein Tracking und
          keine Analyse- oder Werbedienste.
        </p>
        <Rechtsgrundlage>Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (für die von dir gewählte Funktion erforderlich).</Rechtsgrundlage>
      </Abschnitt>

      <Abschnitt titel="„Fehler melden“">
        {fehlerMail ? (
          <p>
            Der Link „Fehler melden“ öffnet dein E-Mail-Programm mit einer Nachricht an {fehlerMail}. Schickst du sie ab,
            erhalten wir deine E-Mail-Adresse und was du schreibst. Wir nutzen beides nur, um den Hinweis zu bearbeiten
            und dir zu antworten, und löschen die Nachricht, wenn sie erledigt ist.
          </p>
        ) : (
          <p>
            Der Link „Fehler melden“ führt zu GitHub (GitHub Inc., USA), wo der Quellcode der Seite liegt. Um dort einen
            Hinweis anzulegen, brauchst du ein GitHub-Konto; was du schreibst, ist öffentlich sichtbar. Für die
            Verarbeitung bei GitHub gilt die{' '}
            <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" className={LINK}>Datenschutzerklärung von GitHub</a>.
          </p>
        )}
        {r.kontaktEmail && (
          <p>
            Schreibst du uns an {r.kontaktEmail}, verwenden wir deine Adresse und Nachricht nur zur Bearbeitung deiner
            Anfrage.
          </p>
        )}
        <Rechtsgrundlage>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, Hinweise zu bearbeiten und zu beantworten).</Rechtsgrundlage>
      </Abschnitt>

      <Abschnitt titel="Deine Rechte">
        <p>Du hast gegenüber der verantwortlichen Stelle das Recht auf</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO),</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO),</li>
          <li>Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
        </ul>
        <p>
          Du musst keine Daten angeben, um die Seite zu nutzen. Es gibt keine automatisierte Entscheidungsfindung und
          kein Profiling. Die Seite wird verschlüsselt (HTTPS) übertragen.
        </p>
      </Abschnitt>

      <Abschnitt titel="Beschwerderecht">
        <p>
          Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), etwa bei der für deinen
          Wohnort zuständigen oder beim Landesbeauftragten für den Datenschutz und die Informationsfreiheit
          Baden-Württemberg (<a href="https://www.baden-wuerttemberg.datenschutz.de" className={LINK}>baden-wuerttemberg.datenschutz.de</a>).
        </p>
      </Abschnitt>

      <p className="text-sm text-tinte-3">Stand: November 2026</p>
    </article>
  )
}
