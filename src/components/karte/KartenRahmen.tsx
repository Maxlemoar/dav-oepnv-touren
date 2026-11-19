'use client'
import { Suspense, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ansichtAus, STANDARD_ANSICHT, type Ansicht } from '@/lib/steuerleiste'
import { KartePlatzhalter } from '@/components/KartePlatzhalter'
import { AnsichtSegment } from '@/components/Steuerleiste'

/** Gebiets-id aus /gebiet/<id>, sonst undefined (Startseite). */
function gebietAusPfad(pfad: string): string | undefined {
  const m = /^\/gebiet\/([^/]+)/.exec(pfad)
  if (!m) return undefined
  try { return decodeURIComponent(m[1]) } catch { return m[1] }
}

/** Gemerkte Wahl Liste | Karte der Startseite (derselbe Schlüssel wie bisher in Startseite.tsx). */
const ANSICHT_SCHLUESSEL = 'ansicht'
const ansichtHoerer = new Set<() => void>()
function abonniereGemerkt(cb: () => void) {
  ansichtHoerer.add(cb)
  return () => { ansichtHoerer.delete(cb) }
}
function leseGemerkt(): string | null {
  try { return window.localStorage.getItem(ANSICHT_SCHLUESSEL) } catch { return null }
}
function merke(a: Ansicht) {
  try { window.localStorage.setItem(ANSICHT_SCHLUESSEL, a) } catch { /* Speicher gesperrt */ }
  ansichtHoerer.forEach((cb) => cb())
}

/** Schreibt `ansicht` in die URL; die History-API ist in den Next-Router integriert, useSearchParams zieht nach. */
function schreibeAnsicht(a: Ansicht | null, art: 'push' | 'replace') {
  const sp = new URLSearchParams(window.location.search)
  if (a === null) sp.delete(ANSICHT_SCHLUESSEL)
  else sp.set(ANSICHT_SCHLUESSEL, a)
  const q = sp.toString()
  const url = q ? `?${q}` : window.location.pathname
  if (art === 'push') window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
}

/**
 * Gemeinsamer Rahmen von Startseite und Ortsseiten. Ab lg zwei Spalten: links das Feld (eigener Scroll, 28rem),
 * rechts die Karte (sticky unter dem Header, volle Höhe). Unter lg auf der Startseite der Umschalter Liste | Karte,
 * auf Ortsseiten ein Kartenstreifen über dem Feld; Antippen öffnet die Karte groß (`ansicht=karte`).
 *
 * Nur die Kartenspalte liest die URL (useSearchParams) und liegt deshalb unter einer Suspense-Grenze; das Feld mit
 * den Seiteninhalten bleibt außerhalb und wird statisch vorgerendert. Die Kartenspalte steht im DOM vor dem Feld und
 * trägt `data-ansicht`; das Feld blendet sich darüber per `peer` aus, wenn auf dem Handy die Karte offen ist.
 */
export function KartenRahmen({ children }: { children: ReactNode }) {
  const gebietId = gebietAusPfad(usePathname())
  return (
    <div className="lg:grid lg:grid-cols-[28rem_minmax(0,1fr)]">
      <Suspense fallback={<Kartenspalte gebietId={gebietId} ansicht="liste" />}>
        <KartenspalteAusUrl gebietId={gebietId} />
      </Suspense>
      <div className="px-4 pb-10 pt-4 sm:px-6 max-lg:peer-data-[ansicht=karte]:hidden lg:col-start-1 lg:row-start-1 lg:h-[calc(100dvh-3.5rem-1px)] lg:overflow-y-auto lg:border-r lg:border-linie">
        {children}
      </div>
    </div>
  )
}

function KartenspalteAusUrl({ gebietId }: { gebietId?: string }) {
  const sp = useSearchParams()
  const gemerkt = useSyncExternalStore(abonniereGemerkt, leseGemerkt, () => null)
  const ausUrl = sp.get(ANSICHT_SCHLUESSEL)
  // Ortsseite: das Feld ist der Normalfall, die große Karte nur auf ausdrücklichen Wunsch. Startseite: wie bisher.
  const ansicht: Ansicht = gebietId ? (ausUrl === 'karte' ? 'karte' : 'liste') : ansichtAus(ausUrl, gemerkt)

  function waehle(a: Ansicht) {
    if (gebietId) {
      // Öffnen als neuer Eintrag, damit "Zurück" auf dem Handy wieder zum Ort führt.
      schreibeAnsicht(a === 'karte' ? 'karte' : null, a === 'karte' ? 'push' : 'replace')
      return
    }
    merke(a)
    schreibeAnsicht(a === STANDARD_ANSICHT ? null : a, 'replace')
  }

  return <Kartenspalte gebietId={gebietId} ansicht={ansicht} onAnsicht={waehle} />
}

type SpaltenProps = { gebietId?: string; ansicht: Ansicht; onAnsicht?: (a: Ansicht) => void }

/** Ohne `onAnsicht` (Server-HTML, vor der Hydration) zeigt sie den Ausgangszustand ohne Wirkung der Knöpfe. */
function Kartenspalte({ gebietId, ansicht, onAnsicht }: SpaltenProps) {
  const karteOffen = ansicht === 'karte'
  // Header und Umschalter sind je h-14 plus 1 px Linie (Klassen ausgeschrieben, damit Tailwind sie findet). Handy:
  // offene Karte füllt den Rest unter Header (und Umschalter auf der Startseite), Ortsseite sonst als Streifen.
  const handyHoehe = gebietId
    ? (karteOffen ? 'h-[calc(100dvh-3.5rem-1px)]' : 'h-40 border-b border-linie lg:border-b-0')
    : (karteOffen ? 'h-[calc(100dvh-7rem-2px)]' : 'hidden')
  return (
    // Startseite auf dem Handy: die ganze Spalte klebt unter dem Header, damit der Umschalter über der Liste stehen bleibt.
    <div data-ansicht={ansicht}
      className={`peer ${gebietId ? '' : 'sticky top-[calc(3.5rem+1px)] z-10'} lg:sticky lg:top-[calc(3.5rem+1px)] lg:col-start-2 lg:row-start-1 lg:h-[calc(100dvh-3.5rem-1px)] lg:self-start`}>
      {!gebietId && (
        <div className="flex h-14 items-center justify-end border-b border-linie bg-papier/95 px-4 backdrop-blur sm:px-6 lg:hidden">
          <AnsichtSegment ansicht={ansicht} onAnsicht={onAnsicht} />
        </div>
      )}
      <div className={`relative overflow-hidden ${handyHoehe} lg:block lg:h-full`}>
        <KartePlatzhalter />
        {gebietId && !karteOffen && (
          <button type="button" className="absolute inset-0 z-10 lg:hidden" aria-label="Karte groß öffnen"
            onClick={onAnsicht && (() => onAnsicht('karte'))} />
        )}
        {gebietId && karteOffen && (
          <button type="button" className="pill absolute left-3 top-3 z-10 lg:hidden" onClick={onAnsicht && (() => onAnsicht('liste'))}>
            ← Zurück zum Ort
          </button>
        )}
      </div>
    </div>
  )
}
