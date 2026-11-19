import { AusgangsortListe } from '@/components/karte/AusgangsortListe'
import { ZeitfensterWahl } from '@/components/zeitfenster/ZeitfensterWahl'

/** Startseite: zuerst das Zeitfenster (wann), dann die Ausgangsorte, die hineinpassen (wohin). Die Karte steht im Rahmen daneben. */
export default function Start() {
  return (
    <>
      <section className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">In die Berge, ohne Auto.</h1>
        <p className="mt-1 text-sm text-tinte-2 sm:text-base">Ausgangsorte für Touren ab Offenburg mit Bahn und Bus.</p>
      </section>
      <ZeitfensterWahl />
      <AusgangsortListe />
    </>
  )
}
