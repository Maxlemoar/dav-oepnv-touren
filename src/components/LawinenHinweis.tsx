'use client'
import { Fragment, Suspense } from 'react'
import { lawinenSaison, type Lawinendienst } from '@/lib/lawinen'
import { useZeitraum } from './Zeitraum'

type Props = {
  /** Zuständige Dienste; leer, wenn das Ziel kein Winterziel ist oder keinen Dienst hat (Schwarzwald, Vogesen). */
  dienste: Lawinendienst[]
  mindestNaechte: 0 | 1
  className?: string
}

/** Link zur Lawinenlage, wenn Hin- oder Rückdatum zwischen 1. Dezember und 30. April liegt. */
export function LawinenHinweis(props: Props) {
  if (props.dienste.length === 0) return null
  return <Suspense fallback={null}><LawinenInnen {...props} /></Suspense>
}

function LawinenInnen({ dienste, mindestNaechte, className }: Props) {
  const { datum, rueck } = useZeitraum(mindestNaechte)
  if (!lawinenSaison(datum) && !lawinenSaison(rueck)) return null
  return (
    <p className={`rounded-[var(--radius-knopf)] bg-nebel px-3 py-2 text-sm text-tinte ${className ?? ''}`}>
      Lawinenlage vor der Tour prüfen:{' '}
      {dienste.map((d, n) => (
        <Fragment key={d.id}>
          {n > 0 && ' · '}
          <a href={d.url} target="_blank" rel="noreferrer" className="text-tanne underline">{d.name}</a>
        </Fragment>
      ))}
    </p>
  )
}
