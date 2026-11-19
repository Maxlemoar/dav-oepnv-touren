'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TicketBadge } from '@/components/Badges'
import { ZeitraumLink } from '@/components/Zeitraum'
import { sortiere, type Bewertung } from '@/lib/bewertung'
import { datumKurz, minutenAlsDauer } from '@/lib/datum'
import type { Ausgangsort, Fahrt } from '@/lib/musterfahrplan/typen'
import { alsMin, alsUhrzeit, naechte, zeitfensterAusUrl } from '@/lib/zeitfenster'
import { naechteText } from '@/lib/zeitraum'
import { useBewertungen } from './useBewertungen'

const LADEN = (
  <div className="mt-6 space-y-3" aria-hidden>
    <div className="skeleton h-6 w-48" />
    <div className="skeleton h-24" />
    <div className="skeleton h-24" />
  </div>
)

/**
 * Liste der Ausgangsorte, beurteilt nach dem Zeitfenster aus der URL: passende zuerst (Tagestour nach Zeit vor Ort, mehrere
 * Tage nach Fahrzeit), darunter eingeklappt die übrigen mit Grund. Ohne gewähltes Datum nur die Bitte um ein Datum.
 */
export function AusgangsortListe() {
  return (
    <Suspense fallback={LADEN}>
      <AusgangsortListeInnen />
    </Suspense>
  )
}

/** "06:12" → "6:12" */
const uhrzeit = (hhmm: string) => {
  const m = alsMin(hhmm)
  return m === undefined ? hhmm : alsUhrzeit(m)
}
const fahrtText = (f: Fahrt) => `${uhrzeit(f.ab)} → ${uhrzeit(f.an)}`

function AusgangsortListeInnen() {
  const z = zeitfensterAusUrl(useSearchParams())
  const { orte, liveBis, bewertungen, laedt } = useBewertungen(z)

  if (!z.gewaehlt) {
    return <p className="mt-6 text-tinte-2">Wähle ein Datum, dann zeigt die Karte, wohin du hin und zurück kommst.</p>
  }
  if (laedt) return LADEN
  if (!bewertungen) {
    return <p className="warnhinweis mt-6">Die Ausgangsorte ließen sich nicht laden. Bitte die Seite neu laden.</p>
  }

  const mehrtaegig = naechte(z) > 0
  const eintraege = sortiere(
    orte.flatMap((ort) => (bewertungen[ort.id] ? [{ ort, bewertung: bewertungen[ort.id] }] : [])),
    mehrtaegig,
  )
  const passen = eintraege.filter((e): e is { ort: Ausgangsort; bewertung: Extract<Bewertung, { passt: true }> } => e.bewertung.passt)
  const passenNicht = eintraege.filter((e): e is { ort: Ausgangsort; bewertung: Extract<Bewertung, { passt: false }> } => !e.bewertung.passt)
  const nachLiveBis = liveBis !== undefined && z.rueck > liveBis

  return (
    <section aria-labelledby="liste-titel" className="mt-6">
      <h2 id="liste-titel" className="text-xl font-semibold">
        {passen.length === 1 ? '1 Ausgangsort passt' : `${passen.length} Ausgangsorte passen`}
      </h2>
      <p className="mt-1 text-sm text-tinte-3">
        {nachLiveBis
          ? `Zeiten nach dem Fahrplan bis ${datumKurz(liveBis)}; Verbindung am Datum auf der Ortsseite prüfen.`
          : 'Zeiten nach typischem Fahrplan. Die Verbindung am Datum steht auf der Ortsseite.'}
      </p>

      {passen.length > 0 && (
        <ul className="mt-3 space-y-3">
          {passen.map(({ ort, bewertung: b }) => (
            <li key={ort.id}>
              <ZeitraumLink href={`/gebiet/${ort.id}`} className="karte-card no-underline hover:shadow-md">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold">{ort.name}</h3>
                  <span className="zahl shrink-0 text-tanne">
                    {mehrtaegig ? naechteText(b.naechte) : `${minutenAlsDauer(b.vorOrtMin)} vor Ort`}
                  </span>
                </div>
                <p className="text-sm text-tinte-2">Gebiet {ort.gebiet} · {ort.region}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span>hin <span className="zahl">{fahrtText(b.hin)}</span></span>
                  <span>zurück <span className="zahl">{fahrtText(b.rueck)}</span></span>
                  {ort.ticket && <TicketBadge ticket={ort.ticket} />}
                </div>
              </ZeitraumLink>
            </li>
          ))}
        </ul>
      )}

      {passenNicht.length > 0 && (
        <details className="mt-4 rounded-[var(--radius-karte)] border border-linie bg-karte">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            {passenNicht.length === 1 ? '1 passt nicht' : `${passenNicht.length} passen nicht`}
            <span aria-hidden className="text-tinte-3">▾</span>
          </summary>
          <ul className="divide-y divide-linie border-t border-linie">
            {passenNicht.map(({ ort, bewertung: b }) => (
              <li key={ort.id}>
                <ZeitraumLink href={`/gebiet/${ort.id}`} className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-3 px-4 py-2 text-sm no-underline hover:bg-papier">
                  <span className="font-medium text-tinte">{ort.name}</span>
                  <span className="text-tinte-3">{b.grund}</span>
                </ZeitraumLink>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
