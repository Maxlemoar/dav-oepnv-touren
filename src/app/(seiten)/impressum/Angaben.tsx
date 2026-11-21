import type { Rechtliches, Verantwortlich } from '@/lib/rechtliches'

/** Hinweis, solange die verantwortliche Stelle nicht feststeht. Bewusst auffällig, nichts erfunden. */
export function AngabenFolgen({ r }: { r: Rechtliches }) {
  return (
    <div role="note" className="rounded-[var(--radius-karte)] border border-signal/40 bg-signal-tint p-4 text-tinte">
      <p className="font-semibold">Angaben zur verantwortlichen Stelle folgen</p>
      <p className="mt-1">
        Wer diese Seite verantwortet, stimmen wir gerade mit der DAV Sektion Offenburg ab. Name, Anschrift und
        Kontakt werden in Kürze hier ergänzt.
      </p>
      {r.kontaktEmail && (
        <p className="mt-2">
          Bis dahin erreichst du das Projekt unter <a href={`mailto:${r.kontaktEmail}`} className="text-tanne underline">{r.kontaktEmail}</a>.
        </p>
      )}
    </div>
  )
}

export function Anschrift({ zeilen }: { zeilen: string[] }) {
  return (
    <>
      {zeilen.map((z, n) => <span key={n} className="block">{z}</span>)}
    </>
  )
}

/** Name, Anschrift und Kontakt der verantwortlichen Stelle. */
export function Stelle({ v }: { v: Verantwortlich }) {
  return (
    <address className="not-italic">
      <span className="block font-medium">{v.name}</span>
      <Anschrift zeilen={v.anschrift} />
      <span className="mt-2 block">E-Mail: <a href={`mailto:${v.email}`} className="text-tanne underline">{v.email}</a></span>
      {v.telefon && <span className="block">Telefon: {v.telefon}</span>}
    </address>
  )
}
