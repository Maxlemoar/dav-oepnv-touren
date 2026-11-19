import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { FehlerMeldenFooter } from '@/components/FehlerMeldenFooter'
import { inhalt } from '@/lib/content/laden'
import { BASIS_URL, SEITENBESCHREIBUNG, SEITENNAME, datumTTMMJJJJ, juengsterRichtwert } from '@/lib/metadaten'
import { rechtliches } from '@/lib/rechtliches'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(BASIS_URL),
  title: { default: SEITENNAME, template: `%s · ${SEITENNAME}` },
  description: SEITENBESCHREIBUNG,
  // "./" ergibt den Pfad der jeweiligen Seite ohne Suchparameter; Seiten mit eigenem Canonical überschreiben das.
  alternates: { canonical: './' },
  openGraph: { type: 'website', locale: 'de_DE', siteName: SEITENNAME, title: SEITENNAME, description: SEITENBESCHREIBUNG },
  twitter: { card: 'summary_large_image' },
}
export const viewport: Viewport = { themeColor: '#f7f6f2' }

const FUSSLINK = 'inline-flex min-h-11 items-center underline hover:text-tinte'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const stand = juengsterRichtwert(inhalt().haltestellen)
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-dvh font-sans">
        <header className="sticky top-0 z-20 border-b border-linie bg-papier/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="font-semibold tracking-tight no-underline">Ohne Auto in die Berge</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/sektionstouren" className="text-tinte-2 hover:text-tinte">Sektionstouren</Link>
              <Link href="/ueber" className="text-tinte-2 hover:text-tinte">Über</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">{children}</main>
        <footer className="border-t border-linie px-4 py-6 text-center text-sm text-tinte-3 sm:px-6">
          <nav aria-label="Rechtliches und Kontakt" className="flex flex-wrap items-center justify-center gap-x-5">
            <Link href="/impressum" className={FUSSLINK}>Impressum</Link>
            <Link href="/datenschutz" className={FUSSLINK}>Datenschutz</Link>
            <Link href="/ueber" className={FUSSLINK}>Über</Link>
            <span className="inline-flex min-h-11 items-center"><FehlerMeldenFooter /></span>
          </nav>
          <p className="mt-1">
            {rechtliches().projekt}
            {' · '}Fahrplandaten: <a href="https://transitous.org/sources/" className="underline hover:text-tinte">Transitous</a>
            {stand && <>{' · '}Richtwerte vom {datumTTMMJJJJ(stand)}</>}
          </p>
        </footer>
      </body>
    </html>
  )
}
