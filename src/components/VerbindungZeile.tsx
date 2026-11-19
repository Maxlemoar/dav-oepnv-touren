'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import type { VerbindungAntwort } from '@/lib/verbindung/service'
import type { BahnOrt, Land } from '@/lib/content/schema'
import { datumKurz, lokaleUhrzeit, minutenAlsDauer, tageDifferenz, wochentagKurz } from '@/lib/datum'
import { zeitfensterAusUrl, zeitfensterSchreiben } from '@/lib/zeitfenster'
import { fahrplanLink, rueckfahrtLink } from '@/lib/links'
import { spaetestensLos, spaetestensZurueck } from '@/lib/rueckfahrt'
import type { GruppenHinweis } from '@/lib/teilen'
import { PassungBadge, TicketBadge } from './Badges'
import { EinladenKnopf } from './EinladenKnopf'
import { VerbindungDetail } from './VerbindungDetail'

// Allgemeiner Saisontext aus service.ts (SAISON_HINWEIS); hier kopiert, weil service.ts nicht in den Browser darf.
// Er wiederholt nur die Überschrift und wird deshalb nicht noch einmal angezeigt.
const ALLGEMEINER_SAISON_HINWEIS = 'Am Datum keine Busverbindung (Saisonbetrieb)'

type Props = {
  von: { id: string; name: string; bahn?: BahnOrt }
  nach: { id: string; name: string; land: Land; bahn?: BahnOrt }
  /** Hütte 1 (Rückfahrt frühestens am Folgetag), Gebiet 0. */
  mindestNaechte: 0 | 1
  /** Gehzeit bis zur Hütte, für "an der Hütte gegen …" und den Rückfahrt-Rechner */
  zustiegMin?: number
  /** Zustieg mit Bergbahn: Hinweis auf deren letzte Talfahrt. */
  bergbahn?: boolean
  /** Name der Hütte für den Einladungstext. */
  huetteName?: string
  /** Gruppenhinweis des Ziellands (content/tickets.yaml). */
  gruppe?: GruppenHinweis
}

/**
 * Live-Verbindung zum Zeitfenster aus der URL (los ab, zurück bis, mindestens vor Ort) mit der Passung dazu: "passt, 7:37 h
 * vor Ort", bei mehreren Tagen "passt · 1 Nacht", sonst der Grund. Hüttenseiten und weitere Haltestellen der Ortsseite.
 */
export function VerbindungZeile({ von, nach, mindestNaechte, zustiegMin, bergbahn, huetteName, gruppe }: Props) {
  const sp = useSearchParams()
  const z = zeitfensterAusUrl(sp, { mindestNaechte })
  const { datum } = z
  // Antwort wird mit ihrer Anfrage gespeichert; passt sie nicht mehr, zeigt die Zeile das Skeleton.
  const q = zeitfensterSchreiben(new URLSearchParams({ von: von.id, nach: nach.id }), z)
  q.set('rueck', z.rueck)
  if (mindestNaechte > 0) q.set('mindestnaechte', String(mindestNaechte))
  const anfrage = q.toString()
  const [geladen, setGeladen] = useState<{ anfrage: string; antwort: VerbindungAntwort } | null>(null)
  const [offen, setOffen] = useState(false)
  const antwort = geladen?.anfrage === anfrage ? geladen.antwort : null

  useEffect(() => {
    let aktiv = true
    // Der Zeitraum steckt in der Anfrage; für den Fallback dort wieder herauslesen.
    const q = new URLSearchParams(anfrage)
    const datumAnfrage = q.get('datum')!
    const rueckAnfrage = q.get('rueck')!
    fetch(`/api/verbindung?${anfrage}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((a: VerbindungAntwort) => { if (aktiv) setGeladen({ anfrage, antwort: a }) })
      .catch(() => {
        if (!aktiv) return
        const antwort: VerbindungAntwort = {
          quelle: 'richtwert', datum: datumAnfrage, rueckfahrtDatum: rueckAnfrage,
          naechte: tageDifferenz(datumAnfrage, rueckAnfrage), ticket: { ticket: 'keins', hinweis: '' },
          fehlerArt: 'dienst_nicht_erreichbar',
        }
        setGeladen({ anfrage, antwort })
      })
    return () => { aktiv = false }
  }, [anfrage])

  const portal = nach.land === 'CH' ? 'SBB' : 'bahn.de'
  // Links tragen Datum und lokale Abfahrtszeit der gezeigten Verbindung; ohne Live-Daten die Standardzeiten.
  const hinLink = (zeitLokal?: string) => fahrplanLink({ land: nach.land, von, nach, datum, zeitLokal })
  const rueckLink = (rueckDatum: string, zeitLokal?: string) => rueckfahrtLink({ land: nach.land, von, nach, datum: rueckDatum, zeitLokal })

  if (!antwort) {
    return (
      <div className="space-y-2" aria-busy>
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    )
  }

  if (antwort.quelle === 'richtwert' || !antwort.hinfahrt) {
    const links = (
      <>
        <a href={hinLink()} target="_blank" rel="noreferrer" className="underline">Hinfahrt bei {portal}</a>
        {' · '}
        <a href={rueckLink(antwort.rueckfahrtDatum)} target="_blank" rel="noreferrer" className="underline">Rückfahrt bei {portal}</a>
      </>
    )
    return <VerbindungOhneLive antwort={antwort} vonName={von.name} links={links} />
  }

  const h = antwort.hinfahrt
  const hinfahrtUrl = hinLink(lokaleUhrzeit(h.ab))
  const rueckfahrtUrl = rueckLink(antwort.rueckfahrtDatum, antwort.rueckfahrt ? lokaleUhrzeit(antwort.rueckfahrt.ab) : undefined)
  const ankunftHuette = zustiegMin ? new Date(Date.parse(h.an) + zustiegMin * 60_000).toISOString() : undefined

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="zahl text-lg">{wochentagKurz(datum)} {lokaleUhrzeit(h.ab)}</span>
        <span className="text-tinte-2">ab {von.name} ·</span>
        <span className="zahl text-lg">{lokaleUhrzeit(h.an)}</span>
        <span className="text-tinte-2">in {nach.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-tinte-2">
        <span>{minutenAlsDauer(h.dauerMin)}, {h.umstiege === 0 ? 'direkt' : `${h.umstiege} ${h.umstiege === 1 ? 'Umstieg' : 'Umstiege'}`}</span>
        {ankunftHuette && <span>· an der Hütte gegen <span className="zahl">{lokaleUhrzeit(ankunftHuette)}</span></span>}
        <PassungBadge passung={antwort.passung} />
        <TicketBadge ticket={antwort.ticket.ticket} />
      </div>
      {antwort.rueckfahrt && (
        <div className="text-sm text-tinte-2">
          Rückfahrt {datumKurz(antwort.rueckfahrtDatum)}: <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.ab)}</span> ab {nach.name},{' '}
          <span className="zahl">{lokaleUhrzeit(antwort.rueckfahrt.an)}</span> in {von.name}
        </div>
      )}
      {antwort.rueckfahrt && (
        <RueckfahrtRechner rueckAb={antwort.rueckfahrt.ab} haltestelle={nach.name}
          zustieg={mindestNaechte >= 1 && zustiegMin !== undefined ? { gehzeitMin: zustiegMin, bergbahn } : undefined} />
      )}
      <div className="flex flex-wrap items-center gap-x-4">
        <button type="button" onClick={() => setOffen((o) => !o)} className="min-h-11 text-sm text-tanne underline" aria-expanded={offen}>
          {offen ? 'Details ausblenden' : 'Umstiege und Ticket'}
        </button>
        <EinladenKnopf einladung={{
          startort: von.name, ziel: nach.name, ...(huetteName && { huette: huetteName }),
          datum, ab: h.ab, an: h.an, rueckDatum: antwort.rueckfahrtDatum,
          ...(antwort.rueckfahrt && { rueckAb: antwort.rueckfahrt.ab }),
          ...(gruppe && { gruppenHinweis: gruppe.hinweis }),
        }} />
      </div>
      {offen && (
        <div className="space-y-3 rounded-[var(--radius-knopf)] bg-papier p-3">
          <VerbindungDetail titel="Hinfahrt" v={h} link={{ href: hinfahrtUrl, text: `Hinfahrt bei ${portal}` }} />
          {antwort.hinfahrtSpaeter && (
            <VerbindungDetail titel="Später los" v={antwort.hinfahrtSpaeter} link={{ href: hinLink(lokaleUhrzeit(antwort.hinfahrtSpaeter.ab)), text: `Spätere Hinfahrt bei ${portal}` }} />
          )}
          {antwort.rueckfahrt && <VerbindungDetail titel="Rückfahrt" v={antwort.rueckfahrt} link={{ href: rueckfahrtUrl, text: `Rückfahrt bei ${portal}` }} />}
          <p className="text-sm text-tinte-2">{antwort.ticket.hinweis}</p>
          {gruppe && (
            <p className="text-sm text-tinte-2">
              <span className="font-medium text-tinte">Zu mehreren:</span> {gruppe.hinweis}
              {gruppe.quelle && <> <a href={gruppe.quelle} target="_blank" rel="noreferrer" className="underline">Mehr dazu</a></>}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={hinfahrtUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer w-full sm:w-auto">Hinfahrt bei {portal}</a>
            <a href={rueckfahrtUrl} target="_blank" rel="noreferrer" className="knopf-sekundaer w-full sm:w-auto">Rückfahrt bei {portal}</a>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Zeile ohne Live-Verbindung: Richtwert ("ca. 4:10 h"), Hinweis zur Fehlerart und Links zum Selbstprüfen. Die Passung
 * (bzw. ihr Grund, etwa "fährt am Datum nicht") steht in jedem Zweig, in dem es sie gibt, außer bei vergangenem Datum.
 */
export function VerbindungOhneLive({ antwort, vonName, links }: { antwort: VerbindungAntwort; vonName: string; links: ReactNode }) {
  const r = antwort.richtwert
  const art = antwort.fehlerArt ?? 'dienst_nicht_erreichbar'
  if (art === 'datum_vergangen') {
    return <p className="warnhinweis">Das Datum liegt in der Vergangenheit. Bitte oben einen anderen Tag wählen.</p>
  }
  const passung = antwort.passung && <PassungBadge passung={antwort.passung} />
  if (art === 'keine_verbindung') {
    return (
      <div className="space-y-1">
        <p className="warnhinweis">
          {antwort.hinweis
            ? <>Am gewählten Datum keine Verbindung gefunden, vermutlich Saisonbetrieb.{antwort.hinweis !== ALLGEMEINER_SAISON_HINWEIS && <> {antwort.hinweis}</>}</>
            : 'Am gewählten Datum keine passende Verbindung gefunden.'}
        </p>
        {passung && <div>{passung}</div>}
        <div className="text-sm text-tinte-3">Selbst prüfen: {links}</div>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      {r ? (
        // Typische Verbindung als Richtwert, ausdrücklich mit "ca." und ohne Uhrzeiten.
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="zahl text-lg">ca. {minutenAlsDauer(r.fahrzeitMin)}</span>
          <span className="text-tinte-2">· {r.umstiege} {r.umstiege === 1 ? 'Umstieg' : 'Umstiege'} · {taktText(r.takt)} ab {vonName}</span>
          {passung}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-tinte-2">Keine typische Verbindung bekannt.</span>
          {passung}
        </div>
      )}
      <div className="text-sm text-tinte-3">
        {art === 'fahrplan_noch_nicht_verfuegbar'
          ? <>{antwort.hinweis ?? 'Der Fahrplan für dieses Datum ist noch nicht veröffentlicht.'} Typische Fahrzeit an einem Samstag. </>
          : 'Live-Fahrplan gerade nicht erreichbar, typische Fahrzeit an einem Samstag. '}
        {links}
      </div>
    </div>
  )
}

/**
 * Rückfahrt-Rechner aus der Live-Rückfahrt: auf Gebietsseiten "spätestens zurück an der Haltestelle", auf
 * Hüttenseiten zusätzlich der späteste Abmarsch an der Hütte (Abstieg 70 % des Aufstiegs plus Puffer).
 */
function RueckfahrtRechner({ rueckAb, haltestelle, zustieg }: { rueckAb: string; haltestelle: string; zustieg?: { gehzeitMin: number; bergbahn?: boolean } }) {
  if (!zustieg) {
    return (
      <p className="text-sm text-tinte">
        <span aria-hidden>⏱</span> Spätestens um <span className="zahl">{spaetestensZurueck(rueckAb)}</span> zurück an der Haltestelle {haltestelle}, das ist die letzte Rückfahrt.
      </p>
    )
  }
  const s = spaetestensLos(rueckAb, zustieg)
  return (
    <p className="text-sm text-tinte">
      <span aria-hidden>⏱</span> Spätestens um <span className="zahl">{s.haltestelleUm}</span> an der Haltestelle sein → an der Hütte
      spätestens ca. <span className="zahl">{s.losUm}</span> losgehen
      <span className="text-tinte-2"> ({s.abstiegMin > 0 && <>Abstieg ca. {minutenAlsDauer(s.abstiegMin)} + </>}{s.pufferMin} min Puffer)</span>.
      {s.bergbahnPruefen && <> Letzte Talfahrt der Bahn prüfen, sie kann früher sein.</>}
    </p>
  )
}

/** Der Takt zählt Abfahrten am Startort zwischen 6 und 12 Uhr, nicht die Bedienung am Ziel. */
function taktText(t: string) {
  return t === 'stuendlich' ? 'stündlich' : t === 'zweistuendlich' ? 'zweistündlich' : 'unregelmäßig'
}
