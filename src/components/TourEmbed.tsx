'use client'

import { useState } from 'react'
import type { SammlungEmbed, TourEmbed as TourEmbedDaten } from '@/lib/content/schema'
import { EMBED_ANBIETER_LABEL, embedSeitenUrl, sammlungEmbedUrl, sammlungSeitenUrl, tourEmbedUrl } from '@/lib/einbettung'

type Props = { titel: string } & ({ tour: TourEmbedDaten; sammlung?: never } | { sammlung: SammlungEmbed; tour?: never })

/**
 * Karte und Höhenprofil eines Tourenportals. Das iframe wird erst nach Klick geladen,
 * damit ohne Zustimmung kein Request an den Drittanbieter geht.
 */
export function TourEmbed(props: Props) {
  const [geladen, setGeladen] = useState(false)
  const anbieter = props.tour ? EMBED_ANBIETER_LABEL[props.tour.anbieter] : EMBED_ANBIETER_LABEL.alpenvereinaktiv
  const src = props.tour ? tourEmbedUrl(props.tour) : sammlungEmbedUrl(props.sammlung)
  const seite = props.tour ? embedSeitenUrl(props.tour) : sammlungSeitenUrl(props.sammlung)

  return (
    <div className="space-y-2">
      {geladen ? (
        <iframe
          src={src}
          title={`${props.titel} – Karte und Höhenprofil (${anbieter})`}
          loading="lazy"
          allow="geolocation"
          className="h-[520px] w-full rounded-[var(--radius-karte)] border border-linie bg-nebel sm:h-[600px]"
        />
      ) : (
        <div className="flex h-[520px] flex-col items-center justify-center gap-3 rounded-[var(--radius-karte)] border border-linie bg-nebel p-4 text-center sm:h-[600px]">
          <p className="max-w-sm text-sm text-tinte-2">
            Karte und Höhenprofil kommen von {anbieter}. Beim Laden werden Daten an {anbieter} übertragen.
          </p>
          <button type="button" onClick={() => setGeladen(true)} className="knopf">
            Karte und Höhenprofil laden ({anbieter})
          </button>
        </div>
      )}
      <a href={seite} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm text-tanne underline">
        Bei {anbieter} öffnen
      </a>
    </div>
  )
}
