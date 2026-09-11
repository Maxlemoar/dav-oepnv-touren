import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { FehlerMeldenFooter } from '@/components/FehlerMeldenFooter'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: { default: 'Ohne Auto in die Berge', template: '%s · Ohne Auto in die Berge' },
  description: 'Hütten und Tourengebiete, die von Offenburg aus mit Bahn und Bus erreichbar sind. Mit Live-Verbindung für dein Datum.',
}
export const viewport: Viewport = { themeColor: '#f7f6f2' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-dvh font-sans">
        <header className="sticky top-0 z-20 border-b border-linie bg-papier/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="font-semibold tracking-tight no-underline">Ohne Auto in die Berge</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/ueber" className="text-tinte-2 hover:text-tinte">Über</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">{children}</main>
        <footer className="border-t border-linie px-4 py-8 text-center text-sm text-tinte-3">
          Arbeitskreis Klimaschutz · DAV Sektion Offenburg · <Link href="/ueber" className="underline">Datenquellen</Link> · <FehlerMeldenFooter />
        </footer>
      </body>
    </html>
  )
}
