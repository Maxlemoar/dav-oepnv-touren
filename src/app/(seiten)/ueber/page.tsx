import { inhalt } from '@/lib/content/laden'
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
        Diese Seite zeigt Ausgangsorte für Touren ab Offenburg mit Bahn und Bus: Du wählst dein Zeitfenster, die Karte zeigt,
        wohin du hin und zurück kommst, und die Seite eines Orts die echten Verbindungen für dein Datum.
      </p>
      <h2 className="text-xl font-semibold">So rechnen wir</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Zeitfenster: Du wählst den Tag, wann du frühestens losfährst und spätestens zurück bist und bei Tagestouren, wie lange du mindestens vor Ort sein willst.
          Ein Ort passt, wenn Hin- und Rückfahrt hineinfallen und genug Zeit bleibt. Bei Hütten liegt die Rückfahrt frühestens am Folgetag.</li>
        <li>Die Karte rechnet mit dem typischen Fahrplan eines Werktags, Samstags oder Sonntags; die genaue Verbindung am Datum zeigt die Ortsseite live.</li>
        <li>CO₂: {i.emissionen.pkwGrammProFahrzeugKm} g/km pro Pkw bei {i.emissionen.personenProPkw} Personen gegen {i.emissionen.bahnGrammProPersonenKm} g pro Personenkilometer Bahn.
          Quelle: <a href={i.emissionen.quelleUrl} className="underline">{i.emissionen.quelle}</a>, Stand {i.emissionen.stand}.</li>
      </ul>
      <h2 id="begriffe" className="text-xl font-semibold">Begriffe</h2>
      <dl className="space-y-3">
        <div>
          <dt className="font-medium">Zeitfenster</dt>
          <dd className="text-tinte-2">Hinfahrt ab, Rückfahrt bis und „mindestens vor Ort“, einstellbar unter „Wann?“; ohne Wahl 6:00 bis 21:00 und 4 Stunden.
            Passt eine Verbindung, steht etwa „passt, 7:37 h vor Ort“ da, sonst der Grund, etwa „keine Rückfahrt bis 21:00“.</dd>
        </div>
        <div>
          <dt className="font-medium">Typischer Fahrplan</dt>
          <dd className="text-tinte-2">Hin- und Rückfahrten an einem gewöhnlichen Werktag, Samstag und Sonntag, vorab berechnet. Damit beurteilt die Karte
            alle Orte auf einmal. Feiertage, Baustellen und Ausfälle kennt er nicht; die Ortsseite fragt deshalb die Verbindung am Datum live ab.</dd>
        </div>
        <div>
          <dt className="font-medium">Richtwert („ca. 4:10 h“)</dt>
          <dd className="text-tinte-2">Typische Fahrzeit ab Offenburg an einem Samstag, vorab berechnet{stand ? ` (Stand ${datumTTMMJJJJ(stand)})` : ''}.
            Er dient zum Vergleichen und Sortieren. Die echte Verbindung für dein Datum steht auf der Seite des Ziels und kann abweichen.</dd>
        </div>
        <div>
          <dt className="font-medium">Farben der Karte</dt>
          <dd className="text-tinte-2">Grün bis Orange: bei Tagestouren nach Zeit vor Ort (8 Stunden und mehr bis unter 4 Stunden), bei mehreren Tagen nach Fahrzeit.
            Grau sind Orte, die nicht ins Zeitfenster passen.</dd>
        </div>
        <div>
          <dt className="font-medium">Saison</dt>
          <dd className="text-tinte-2">Sommerziele liegen etwa von Mitte Mai bis Oktober, manche Busse fahren nur in der Saison.
            Fährt der Bus am gewählten Datum nicht, passt der Ort nicht, und es steht „fährt am Datum nicht“ da.</dd>
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
