import type { Metadata } from 'next'
import { inhalt, findeGebiet, findeHuette, sichtbareStartorte } from '@/lib/content/laden'
import { PROGRAMM_URL, ladeSektionstouren } from '@/lib/dav360'
import { baueZuordnungsIndex, ordneZu, zugangAm } from '@/lib/dav360-zuordnung'
import { datumLesbar } from '@/lib/datum'
import { SektionstourKarte, type SektionstourZiel } from '@/components/SektionstourKarte'
import { SektionstourZaehlerRahmen } from '@/components/SektionstourZaehler'

// Das Tourenprogramm ändert sich selten; alle sechs Stunden neu holen (wie der Abruf in lib/dav360).
export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Sektionstouren mit Bahn und Bus',
  description: 'Das Tourenprogramm der DAV Sektion Offenburg: welche Touren mit Bahn und Bus ab Offenburg machbar sind, mit Anreisetext für die Tourenleitung.',
}

export default async function SektionstourenSeite() {
  const { touren, fehler } = await ladeSektionstouren()
  // Beim Neuaufbau im Hintergrund lieber werfen: Next.js zeigt dann weiter die letzte gute Fassung.
  // Nur im Build gibt es keine, dort steht der Hinweis auf der Seite.
  if (fehler && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('Tourenprogramm der Sektion (DAV360) nicht erreichbar')
  }
  const i = inhalt()
  const start = sichtbareStartorte(i)[0]
  const index = baueZuordnungsIndex(i)

  const draussen = touren.filter((t) => !t.ohneOrt)
  const ohneOrt = touren.filter((t) => t.ohneOrt)
  const eintraege = draussen.map((tour) => {
    const z = ordneZu(tour, index)
    const zugang = z && zugangAm(i, z, tour.start)
    const gebiet = z && findeGebiet(i, z.gebietId)
    const huette = z?.huetteId ? findeHuette(i, z.huetteId) : undefined
    const ziel: SektionstourZiel | undefined = z && zugang && gebiet
      ? {
          gebiet: { id: gebiet.id, name: gebiet.name },
          huette: huette && { id: huette.id, name: huette.name },
          zugang, sicherheit: z.sicherheit, grund: z.grund,
        }
      : undefined
    return { tour, ziel }
  })
  const zugeordnet = eintraege.filter((e) => e.ziel).length

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">Sektionstouren mit Bahn und Bus</h1>
        <p className="mt-2 text-tinte-2">
          Zu jeder anstehenden Tour der Sektion: Ist sie ohne Auto ab {start.name} machbar, und wie? Tourenleiterinnen und
          Tourenleiter können den Anreisetext direkt in DAV360 übernehmen.
        </p>
        <p className="mt-1 text-sm text-tinte-3">
          Quelle: <a href={PROGRAMM_URL} target="_blank" rel="noreferrer" className="underline">Tourenprogramm der Sektion Offenburg</a>.
          Ziele erkennen wir aus Titel und Beschreibung, das kann danebenliegen.
        </p>
      </header>

      {fehler ? (
        <div className="rounded-[var(--radius-karte)] bg-signal-tint p-4 text-sm text-tinte">
          Das Tourenprogramm ist gerade nicht erreichbar. Die Touren stehen weiter auf der{' '}
          <a href={PROGRAMM_URL} target="_blank" rel="noreferrer" className="font-medium underline">Seite der Sektion</a>.
        </div>
      ) : draussen.length === 0 ? (
        <p className="karte-card text-tinte-2">
          Gerade stehen keine Touren im Programm. <a href={PROGRAMM_URL} target="_blank" rel="noreferrer" className="underline">Zum Tourenprogramm</a>
        </p>
      ) : (
        <SektionstourZaehlerRahmen gesamt={draussen.length} zugeordnet={zugeordnet}>
          <div className="mt-3 space-y-3">
            {eintraege.map(({ tour, ziel }) => (
              <SektionstourKarte key={tour.id} tour={tour} ziel={ziel} start={{ id: start.id, name: start.name }} />
            ))}
          </div>
        </SektionstourZaehlerRahmen>
      )}

      {ohneOrt.length > 0 && (
        <details className="text-sm text-tinte-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-tanne underline">
            {ohneOrt.length} {ohneOrt.length === 1 ? 'Termin' : 'Termine'} ohne Anreise (Kurse und Abende)
          </summary>
          <ul className="mt-1 space-y-1">
            {ohneOrt.map((t) => (
              <li key={t.id}>
                <span className="zahl">{datumLesbar(t.start)}</span>{' '}
                {t.link ? <a href={t.link} target="_blank" rel="noreferrer" className="underline">{t.titel}</a> : t.titel}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
