'use client'
import { Fragment, Suspense, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import type { BahnOrt, Land } from '@/lib/content/schema'
import { datumKurz, lokalesDatum, lokaleUhrzeit } from '@/lib/datum'
import { abweichungText, fahrtenAnfrage, fahrtenStatus, fahrtSchluessel, merkenswert, neueFahrten, vorauswahl, vorOrtText } from '@/lib/fahrtenwahl'
import { fakten } from '@/lib/kosten'
import { fahrplanLink, rueckfahrtLink } from '@/lib/links'
import type { GruppenHinweis } from '@/lib/teilen'
import type { FahrtenAntwort, FahrtLive } from '@/lib/verbindung/fahrten'
import { naechte, zeitfensterAusUrl } from '@/lib/zeitfenster'
import { EinladenKnopf } from '../EinladenKnopf'
import { useRuhigerAbruf } from '../useRuhigerAbruf'
import { FahrtZeile } from './FahrtZeile'

type Props = {
  von: { id: string; name: string; bahn?: BahnOrt }
  nach: { id: string; name: string; land: Land; bahn?: BahnOrt }
  /** Gruppenhinweis des Ziellands (content/tickets.yaml). */
  gruppe?: GruppenHinweis
  /** Kennzahlen aus dem Richtwert für die Faktenzeile und die ausführlichen Sätze dazu (CO₂- und Kostenzeile). */
  vergleich?: { co2Kg?: number; autoEuro?: number; details?: ReactNode }
}

type Richtung = 'hin' | 'rueck'

/** Alles, was zu einer Anfrage gehört; passt die Anfrage nicht mehr zur URL, gilt der Stand als nicht geladen. */
type Stand = {
  anfrage: string
  /** null: Abruf fehlgeschlagen */
  antwort: FahrtenAntwort | null
  mehr: Record<Richtung, FahrtLive[]>
  /** Vom Nutzer gewählte Fahrt (fahrtSchluessel); sonst gilt die Vorauswahl. */
  wahl: Partial<Record<Richtung, string>>
  laedt: Partial<Record<Richtung, boolean>>
  meldung: Partial<Record<Richtung, string>>
}

const neuerStand = (anfrage: string, antwort: FahrtenAntwort | null): Stand =>
  ({ anfrage, antwort, mehr: { hin: [], rueck: [] }, wahl: {}, laedt: {}, meldung: {} })

/**
 * Antworten je Anfrage für die Sitzung im Browser: ein erneutes Einhängen (Zurück zur Seite, Datum hin und zurück) löst
 * keine zweite Anfrage an den Fahrplandienst aus. Gemerkt werden nur vollständige Live-Antworten.
 */
const geladeneFahrten = new Map<string, Promise<FahrtenAntwort>>()
const MAX_GEMERKT = 30

function ladeFahrten(anfrage: string, signal: AbortSignal): Promise<FahrtenAntwort> {
  const da = geladeneFahrten.get(anfrage)
  if (da) return da
  const p = fetch(`/api/fahrten?${anfrage}`, { signal })
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<FahrtenAntwort> })
  // Fehlschläge, Abbrüche und Ersatzantworten (typisch, Hinweis, fehlerArt) nicht merken: der nächste Aufruf versucht es live.
  p.then((a) => { if (!merkenswert(a)) geladeneFahrten.delete(anfrage) }, () => geladeneFahrten.delete(anfrage))
  geladeneFahrten.set(anfrage, p)
  if (geladeneFahrten.size > MAX_GEMERKT) geladeneFahrten.delete(geladeneFahrten.keys().next().value!)
  return p
}

const SKELETON = (
  <div className="space-y-2" aria-busy>
    <div className="skeleton h-6 w-2/3" />
    {[0, 1, 2].map((i) => <div key={i} className="skeleton h-11" />)}
    <div className="skeleton mt-4 h-6 w-2/3" />
    {[0, 1, 2].map((i) => <div key={i} className="skeleton h-11" />)}
  </div>
)

/**
 * Hin- und Rückfahrten am gewählten Datum für den Hauptzugang (`/api/fahrten`, höchstens zwei Transitous-Anfragen je
 * Zeitfenster). Vorausgewählt ist das Paar mit der größten Zeit vor Ort; Antippen wählt eine andere Fahrt.
 * "Weitere Abfahrten" lädt je Richtung mit einer Anfrage nach. Ändert sich das Zeitfenster in der URL, wird neu geladen,
 * aber erst, wenn es etwa 800 ms steht (Ziehen am Schieber im Sheet "Wann?"); ein überholter Abruf wird abgebrochen.
 */
export function Fahrtenwahl(props: Props) {
  return (
    <Suspense fallback={SKELETON}>
      <FahrtenwahlInnen {...props} />
    </Suspense>
  )
}

function FahrtenwahlInnen({ von, nach, gruppe, vergleich }: Props) {
  const z = zeitfensterAusUrl(useSearchParams(), { mindestNaechte: 0 })
  const anfrage = fahrtenAnfrage(von.id, nach.id, z)
  const [stand, setStand] = useState<Stand | null>(null)
  const aktuell = stand?.anfrage === anfrage ? stand : null

  useRuhigerAbruf(anfrage, ladeFahrten, (k, e) => setStand(neuerStand(k, e.ok ? e.wert : null)))

  /** Ändert den Stand nur, solange er noch zur Anfrage gehört, aus der die Änderung stammt. */
  const aendere = (fn: (s: Stand) => Stand) => setStand((s) => (s && s.anfrage === anfrage ? fn(s) : s))

  if (!aktuell) return SKELETON

  const portal = nach.land === 'CH' ? 'SBB' : 'bahn.de'
  const link = (r: Richtung, f?: FahrtLive) => {
    const anfrageLink = { land: nach.land, von, nach, zeitLokal: f && lokaleUhrzeit(f.ab) }
    return r === 'hin'
      ? { href: fahrplanLink({ ...anfrageLink, datum: z.datum }), text: `bei ${portal}` }
      : { href: rueckfahrtLink({ ...anfrageLink, datum: z.rueck }), text: `bei ${portal}` }
  }
  const portalLinks = (
    <>
      <a href={link('hin').href} target="_blank" rel="noreferrer" className="underline">Hinfahrt bei {portal}</a>
      {' · '}
      <a href={link('rueck').href} target="_blank" rel="noreferrer" className="underline">Rückfahrt bei {portal}</a>
    </>
  )

  const a = aktuell.antwort
  if (!a) {
    return (
      <div className="space-y-1">
        <p className="text-tinte-2">Fahrten gerade nicht abrufbar.</p>
        <p className="text-sm text-tinte-3">Selbst prüfen: {portalLinks}</p>
      </div>
    )
  }

  const listen: Record<Richtung, FahrtLive[]> = { hin: [...a.hin, ...aktuell.mehr.hin], rueck: [...a.rueckfahrten, ...aktuell.mehr.rueck] }
  const vor = vorauswahl(a, z)
  const vorKey = { hin: vor.hin !== undefined ? fahrtSchluessel(a.hin[vor.hin]) : undefined, rueck: vor.rueck !== undefined ? fahrtSchluessel(a.rueckfahrten[vor.rueck]) : undefined }
  const gewaehlt = (r: Richtung) => aktuell.wahl[r] ?? vorKey[r]
  const fahrtZu = (r: Richtung) => listen[r].find((f) => fahrtSchluessel(f) === gewaehlt(r))
  const hin = fahrtZu('hin')
  const rueck = fahrtZu('rueck')
  const status = fahrtenStatus(a)
  const ohneFahrten = status.art === 'keine_verbindung' || (status.art === 'typisch' && status.leer)

  async function weitere(r: Richtung) {
    const letzte = listen[r].at(-1)
    if (!letzte) return
    aendere((s) => ({ ...s, laedt: { ...s.laedt, [r]: true }, meldung: { ...s.meldung, [r]: undefined } }))
    try {
      const res = await fetch(`/api/fahrten?${anfrage}&weiter=${r}&zeit=${encodeURIComponent(letzte.ab)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { fahrten } = (await res.json()) as { fahrten: FahrtLive[] }
      // Hinfahrten nur am Hin-Datum (die Rückrichtung filtert die API schon aufs Rückdatum).
      const amTag = r === 'hin' ? fahrten.filter((f) => lokalesDatum(f.ab) === z.datum) : fahrten
      aendere((s) => {
        const bisher = r === 'hin' ? [...s.antwort?.hin ?? [], ...s.mehr.hin] : [...s.antwort?.rueckfahrten ?? [], ...s.mehr.rueck]
        const neu = neueFahrten(bisher, amTag)
        return {
          ...s, mehr: { ...s.mehr, [r]: [...s.mehr[r], ...neu] }, laedt: { ...s.laedt, [r]: false },
          meldung: { ...s.meldung, [r]: neu.length ? undefined : 'Keine weiteren Fahrten an diesem Tag.' },
        }
      })
    } catch {
      aendere((s) => ({ ...s, laedt: { ...s.laedt, [r]: false }, meldung: { ...s.meldung, [r]: 'Gerade keine weiteren Fahrten abrufbar.' } }))
    }
  }

  const abschnitt = (r: Richtung, titel: string) => (
    <FahrtenAbschnitt titel={titel} fahrten={listen[r]} gewaehlt={gewaehlt(r)} link={(f) => link(r, f)}
      onWahl={(k) => aendere((s) => ({ ...s, wahl: { ...s.wahl, [r]: k } }))}
      weitere={a.quelle === 'live' && listen[r].length > 0 ? { laedt: !!aktuell.laedt[r], meldung: aktuell.meldung[r], onKlick: () => weitere(r) } : undefined} />
  )

  return (
    <div className="space-y-5">
      {status.art === 'keine_verbindung' ? (
        <div className="space-y-1">
          <p className="warnhinweis">{status.text}</p>
          <p className="text-sm text-tinte-3">Selbst prüfen: {portalLinks}</p>
        </div>
      ) : status.art === 'typisch' ? (
        <TypischHinweis text={status.text} leer={status.leer} links={portalLinks} />
      ) : status.hinweis ? (
        <p className="text-sm text-tinte-3">{status.hinweis}</p>
      ) : null}
      {a.abweichungMin !== undefined && <p className="warnhinweis">{abweichungText(a.datum, a.abweichungMin)}</p>}

      {!ohneFahrten && (
        <>
          {abschnitt('hin', `Hinfahrt ${datumKurz(a.datum)} ab ${von.name}`)}
          {abschnitt('rueck', `Rückfahrt ${datumKurz(a.rueck)} nach ${von.name}`)}
          <div className="flex flex-wrap items-center gap-x-4">
            <p aria-live="polite" className="font-semibold">→ {vorOrtText(hin, rueck, naechte(z))}</p>
            {hin && (
              <EinladenKnopf einladung={{
                startort: von.name, ziel: nach.name, datum: z.datum, ab: hin.ab, an: hin.an, rueckDatum: z.rueck,
                ...(rueck && { rueckAb: rueck.ab }), ...(gruppe && { gruppenHinweis: gruppe.hinweis }),
              }} />
            )}
          </div>
        </>
      )}

      {/* Ticket, CO₂ und Kosten auf einen Blick; die ganzen Sätze mit Gruppenpreis und Fahrtkostenregel zum Aufklappen. */}
      <details className="group border-t border-linie pt-1">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm text-tinte-2 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            {fakten({ ticket: a.ticket.ticket, co2Kg: vergleich?.co2Kg, autoEuro: vergleich?.autoEuro }).map((f, k) => (
              <Fragment key={f}>{k > 0 && ' · '}<span className="whitespace-nowrap">{f}</span></Fragment>
            ))}
          </span>
          <span className="shrink-0 font-medium text-tanne">
            Details <span aria-hidden className="inline-block transition-transform group-open:rotate-180">▾</span>
          </span>
        </summary>
        <div className="space-y-1 pb-1">
          <p className="text-sm text-tinte-2">{a.ticket.hinweis}</p>
          {gruppe && (
            <p className="text-sm text-tinte-2">
              <span className="font-medium text-tinte">Zu mehreren:</span> {gruppe.hinweis}
              {gruppe.quelle && <> <a href={gruppe.quelle} target="_blank" rel="noreferrer" className="underline">Mehr dazu</a></>}
            </p>
          )}
          {vergleich?.details}
        </div>
      </details>
    </div>
  )
}

function TypischHinweis({ text, leer, links }: { text: string; leer: boolean; links: ReactNode }) {
  return (
    <div className="space-y-1 rounded-[var(--radius-knopf)] bg-nebel px-3 py-2 text-sm text-tinte">
      <p><span className="font-semibold">Typischer Fahrplan</span>: {text}</p>
      {leer && <p>Keine typischen Fahrten hinterlegt.</p>}
      <p className="text-tinte-2">Genaue Verbindung prüfen: {links}</p>
    </div>
  )
}

type AbschnittProps = {
  titel: string
  fahrten: FahrtLive[]
  gewaehlt?: string
  link: (f: FahrtLive) => { href: string; text: string }
  onWahl: (schluessel: string) => void
  weitere?: { laedt: boolean; meldung?: string; onKlick: () => void }
}

function FahrtenAbschnitt({ titel, fahrten, gewaehlt, link, onWahl, weitere }: AbschnittProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{titel}</h2>
      {fahrten.length === 0 ? (
        <p className="mt-1 text-sm text-tinte-2">Keine Fahrt im Zeitfenster gefunden.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {fahrten.map((f) => {
            const k = fahrtSchluessel(f)
            return <FahrtZeile key={k} f={f} gewaehlt={k === gewaehlt} onWahl={() => onWahl(k)} link={link(f)} />
          })}
        </ul>
      )}
      {weitere && (
        <div className="mt-1 flex flex-wrap items-center gap-x-3">
          <button type="button" onClick={weitere.onKlick} disabled={weitere.laedt}
            className="min-h-11 text-sm text-tanne underline disabled:no-underline disabled:opacity-60">
            {weitere.laedt ? 'Lädt …' : 'Weitere Abfahrten'}
          </button>
          {weitere.meldung && <span role="status" className="text-sm text-tinte-3">{weitere.meldung}</span>}
        </div>
      )}
    </section>
  )
}
