import { inhalt } from '@/lib/content/laden'
import { EIGENE_SEKTION } from '@/lib/content/labels'
import { datumTTMMJJJJ, juengsterRichtwert } from '@/lib/metadaten'

export const metadata = { title: 'Über' }

export default function UeberSeite() {
  const i = inhalt()
  const stand = juengsterRichtwert(i.haltestellen)
  return (
    <article className="prose mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Über diese Seite</h1>
      <p>
        Der Arbeitskreis Klimaschutz der DAV Sektion Offenburg möchte, dass mehr Bergtouren ohne Auto beginnen.
        Diese Seite zeigt Hütten und Tourengebiete, die von Offenburg aus mit Bahn und Bus gut erreichbar sind,
        mit echter Verbindung für dein Datum.
      </p>
      <h2 className="text-xl font-semibold">So rechnen wir</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Hinfahrt: früheste Ankunft bei Abfahrt zwischen 5 und 8 Uhr. Rückfahrt: letzte Verbindung mit Ankunft vor 23 Uhr. Bei Hütten liegt die Rückfahrt frühestens am Folgetag; ein längerer Zeitraum lässt sich oben wählen.</li>
        <li>Tagesziel: Ankunft bis 10 Uhr, Rückfahrt ab 16:30, dazwischen mindestens 6 Stunden (einstellbar).</li>
        <li>CO₂: {i.emissionen.pkwGrammProFahrzeugKm} g/km pro Pkw bei {i.emissionen.personenProPkw} Personen gegen {i.emissionen.bahnGrammProPersonenKm} g pro Personenkilometer Bahn.
          Quelle: <a href={i.emissionen.quelleUrl} className="underline">{i.emissionen.quelle}</a>, Stand {i.emissionen.stand}.</li>
      </ul>
      <h2 id="begriffe" className="text-xl font-semibold">Begriffe</h2>
      <dl className="space-y-3">
        <div>
          <dt className="font-medium">Tagesziel</dt>
          <dd className="text-tinte-2">Hin und zurück am selben Tag mit genug Zeit am Berg: Ankunft bis 10 Uhr, letzte Rückfahrt ab 16:30.
            Sonst steht „Besser mit Übernachtung“ da, mit dem Grund daneben, etwa „Ankunft erst 10:40“.</dd>
        </div>
        <div>
          <dt className="font-medium">Mindestens am Berg</dt>
          <dd className="text-tinte-2">Zeit zwischen Ankunft und letzter Rückfahrt, die ein Tagesziel mindestens bieten muss. Standard 6 Stunden, einstellbar unter „Wann?“.</dd>
        </div>
        <div>
          <dt className="font-medium">Richtwert („ca. 4:10 h“)</dt>
          <dd className="text-tinte-2">Typische Fahrzeit ab Offenburg an einem Samstag, vorab berechnet{stand ? ` (Stand ${datumTTMMJJJJ(stand)})` : ''}.
            Er dient zum Vergleichen und Sortieren. Die echte Verbindung für dein Datum steht auf der Seite des Ziels und kann abweichen.</dd>
        </div>
        <div>
          <dt className="font-medium">Reisezeitfarben</dt>
          <dd className="text-tinte-2">Grün bis Orange auf Karte und Badges: bis 2 Stunden, bis 3 Stunden, bis 4 Stunden, über 4 Stunden Fahrzeit (Richtwert).</dd>
        </div>
        <div>
          <dt className="font-medium">{`Haus der Sektion ${EIGENE_SEKTION}`}</dt>
          <dd className="text-tinte-2">Im Gebiet steht eine Hütte der DAV-Sektion {EIGENE_SEKTION}. Auf der Karte trägt der Punkt einen dunklen Ring.</dd>
        </div>
        <div>
          <dt className="font-medium">Saison</dt>
          <dd className="text-tinte-2">Sommerziele liegen etwa von Mitte Mai bis Oktober, manche Busse fahren nur in der Saison.
            Der Schalter „Nur was am Datum geht“ blendet Ziele aus, die am gewählten Datum nicht passen; ausgeschaltet tragen sie einen Hinweis wie „Saisonziel“ oder „am Datum kein Bus“.</dd>
        </div>
        <div>
          <dt className="font-medium">vermutlich</dt>
          <dd className="text-tinte-2">Für viele Hütten kennen wir die Öffnungszeiten nicht genau und schätzen sie aus der Saison. Dann steht „vermutlich offen“ oder „vermutlich geschlossen“; vor der Tour bitte bei der Hütte nachfragen.</dd>
        </div>
      </dl>
      <h2 className="text-xl font-semibold">Datenquellen</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Fahrplan: <a href="https://transitous.org" className="underline">Transitous</a> (offene Routing-API auf Basis von DELFI, opentransportdata.swiss, SNCF, ÖBB; <a href="https://transitous.org/sources/" className="underline">Datenquellen</a>).</li>
        <li>Hütten: Wikipedia-Liste der SAC-Hütten, Wikidata, Hüttenseiten der Sektionen. Zustiegszeiten teils geschätzt und so gekennzeichnet.</li>
        <li>Karte: <a href="https://openfreemap.org" className="underline">OpenFreeMap</a>, Daten © OpenStreetMap-Mitwirkende.</li>
      </ul>
      <h2 className="text-xl font-semibold">Mitmachen</h2>
      <p>
        Der Code ist offen: <a href="https://github.com/Maxlemoar/dav-oepnv-touren" className="underline">github.com/Maxlemoar/dav-oepnv-touren</a>.
        Fehler und Ergänzungen bitte über den Link „Fehler melden“ auf jeder Seite.
      </p>
    </article>
  )
}
