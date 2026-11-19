'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Saison } from '@/lib/content/labels'
import { datumKurz } from '@/lib/datum'
import { zeitfensterKurz } from '@/lib/fahrtenwahl'
import { gebietPasstZurJahreszeit } from '@/lib/saison'
import { zeitfensterAusUrl } from '@/lib/zeitfenster'
import { Sheet } from '../Sheet'
import { KalenderSymbol } from '../Steuerleiste'
import { ZeitfensterWahl } from '../zeitfenster/ZeitfensterWahl'

const PLATZHALTER = (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-sm text-tinte-2">Fahrten für</span>
    <span className="pill text-tinte-2"><KalenderSymbol />Kommender Samstag</span>
  </div>
)

/**
 * Pill der Ortsseite: nennt das Zeitfenster aus der URL ("Sa 21.11., 6:00–21:00") und öffnet das Sheet "Wann?" mit
 * `ZeitfensterWahl`. Die Wahl schreibt die URL; Fahrtenwahl, Karte und Links ziehen nach. Außerhalb der Saison des
 * Gebiets steht ein Warnhinweis darunter.
 */
export function ZeitfensterPill(props: { saison?: Saison }) {
  return <Suspense fallback={PLATZHALTER}><PillInnen {...props} /></Suspense>
}

function PillInnen({ saison }: { saison?: Saison }) {
  const z = zeitfensterAusUrl(useSearchParams(), { mindestNaechte: 0 })
  const [offen, setOffen] = useState(false)
  const text = zeitfensterKurz(z)
  const ausserSaison = saison !== undefined && !gebietPasstZurJahreszeit({ saison }, z.datum)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-tinte-2">Fahrten für</span>
        <button type="button" className="pill" aria-haspopup="dialog" aria-label={`Zeitfenster ändern: ${text}`} onClick={() => setOffen(true)}>
          <KalenderSymbol />{text}
        </button>
      </div>
      {ausserSaison && (
        <p className="warnhinweis">
          {saison === 'sommer' ? 'Sommerziel' : 'Winterziel'}: Am {datumKurz(z.datum)} liegt es außerhalb der üblichen Saison. Hütten und Busse können geschlossen sein.
        </p>
      )}
      {offen && (
        <Sheet offen titel="Wann?" onClose={() => setOffen(false)}>
          <ZeitfensterWahl mindestNaechte={0} />
        </Sheet>
      )}
    </div>
  )
}

/** " (Sa 21.11., 6:00–21:00)" für den Rückweg zur Karte; bis zur Hydration leer. */
export function ZeitfensterInKlammern() {
  return <Suspense fallback={null}><KlammernInnen /></Suspense>
}

function KlammernInnen() {
  return <> ({zeitfensterKurz(zeitfensterAusUrl(useSearchParams(), { mindestNaechte: 0 }))})</>
}
