import Link from 'next/link'

export const metadata = { title: 'Seite nicht gefunden' }

export default function NichtGefunden() {
  // Liegt außerhalb der Gruppen, darum mit derselben Breite wie (seiten)/layout.tsx.
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <article className="mx-auto max-w-2xl space-y-4 py-10">
        <p className="zahl text-tinte-3">404</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Diese Seite gibt es nicht</h1>
        <p className="text-tinte-2">
          Vielleicht hat sich die Adresse geändert oder ein Ziel wurde umbenannt. Auf der Startseite findest du die
          Ausgangsorte für Touren ab Offenburg mit Bahn und Bus.
        </p>
        <Link href="/" className="knopf no-underline">Zur Startseite</Link>
      </article>
    </div>
  )
}
