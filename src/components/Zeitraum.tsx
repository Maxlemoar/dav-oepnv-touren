'use client'
import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { zeitfensterAusUrl } from '@/lib/zeitfenster'
import { mitZeitraum, zeitraumQuery } from '@/lib/zeitraum'

/**
 * Zeitfenster der Detailseiten aus der URL (datum, rueck, ab, bis, vorort). Gebietsseiten 0, Hüttenseiten 1 Mindestnacht.
 * Nutzt useSearchParams; aufrufende Komponenten stehen deshalb in einer Suspense-Grenze.
 */
export function useZeitraum(mindestNaechte: 0 | 1) {
  return zeitfensterAusUrl(useSearchParams(), { mindestNaechte })
}

type LinkProps = { href: string; className?: string; children: ReactNode }

/**
 * Interner Link, der das Zeitfenster der aktuellen Seite mitnimmt. Ohne JavaScript bzw. bis zur Hydration ohne Zeitfenster.
 * Nur gesetzte Parameter wandern mit; ist rueck ohne datum gesetzt, wird datum ergänzt.
 */
export function ZeitraumLink(props: LinkProps) {
  return (
    <Suspense fallback={<Link href={props.href} className={props.className}>{props.children}</Link>}>
      <ZeitraumLinkInnen {...props} />
    </Suspense>
  )
}

function ZeitraumLinkInnen({ href, className, children }: LinkProps) {
  const sp = useSearchParams()
  // Steht nur rueck in der URL, geht das hier verwendete Hin-Datum ausdrücklich mit (Hin- und Rückdatum bleiben zusammen).
  return <Link href={mitZeitraum(href, zeitraumQuery(sp, zeitfensterAusUrl(sp).datum))} className={className}>{children}</Link>
}
