import { inhalt } from '@/lib/content/laden'

export const metadata = { title: 'Über' }

export default function UeberSeite() {
  const i = inhalt()
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
      <h2 className="text-xl font-semibold">Datenquellen</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Fahrplan: <a href="https://transitous.org" className="underline">Transitous</a> (offene Routing-API auf Basis von DELFI, opentransportdata.swiss, SNCF, ÖBB).</li>
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
