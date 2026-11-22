import { AusgangsortListe } from '@/components/karte/AusgangsortListe'
import { ZeitfensterWahl } from '@/components/zeitfenster/ZeitfensterWahl'

/** Startseite: zuerst das Zeitfenster (wann), dann die Ausgangsorte, die hineinpassen (wohin). Die Karte steht im Rahmen daneben. */
export default function Start() {
  return (
    <>
      <section className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Ausgangsorte für Touren ab Offenburg mit Bahn und Bus.</h1>
      </section>
      <ZeitfensterWahl />
      <AusgangsortListe />
    </>
  )
}
