'use client'
import { Fragment, Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { naechte, zeitfensterAusUrl } from '@/lib/zeitfenster'

type Props = { huetten: ReactNode; touren: ReactNode }

/** "Von hier erreichbar": bei mehreren Tagen stehen die Hütten zuerst, sonst Touren und Links. Ohne URL wie Tagestour. */
export function ErreichbarReihenfolge(props: Props) {
  return (
    <Suspense fallback={<Reihe {...props} huettenZuerst={false} />}>
      <AusUrl {...props} />
    </Suspense>
  )
}

function AusUrl(props: Props) {
  const z = zeitfensterAusUrl(useSearchParams(), { mindestNaechte: 0 })
  return <Reihe {...props} huettenZuerst={naechte(z) > 0} />
}

function Reihe({ huetten, touren, huettenZuerst }: Props & { huettenZuerst: boolean }) {
  const teile = [<Fragment key="touren">{touren}</Fragment>, <Fragment key="huetten">{huetten}</Fragment>]
  return <>{huettenZuerst ? teile.reverse() : teile}</>
}
