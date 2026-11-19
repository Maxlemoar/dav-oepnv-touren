import Link from 'next/link'

export const metadata = { title: 'Seite nicht gefunden' }

export default function NichtGefunden() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-10">
      <p className="zahl text-tinte-3">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Diese Seite gibt es nicht</h1>
      <p className="text-tinte-2">
        Vielleicht hat sich die Adresse geändert oder ein Ziel wurde umbenannt. Auf der Startseite findest du alle
        Hütten und Tourengebiete, die ab Offenburg mit Bahn und Bus erreichbar sind.
      </p>
      <Link href="/" className="knopf no-underline">Zur Startseite</Link>
    </article>
  )
}
