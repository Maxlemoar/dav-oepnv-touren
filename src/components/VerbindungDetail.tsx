import type { VerbindungKurz, Abschnitt } from '@/lib/verbindung/auswerten'

const MODUS_SYMBOL: Record<Abschnitt['modus'], string> = { zug: '🚆', bus: '🚌', seilbahn: '🚠', schiff: '⛴', fuss: '🚶', sonstig: '•' }

type Props = {
  titel: string
  v: VerbindungKurz
  /** Fahrplan-/Buchungslink für genau diese Verbindung (Datum und Abfahrtszeit gesetzt). */
  link?: { href: string; text: string }
}

export function VerbindungDetail({ titel, v, link }: Props) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{titel}</div>
      <ol className="space-y-1 text-sm">
        {v.abschnitte.map((a, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr] gap-x-2">
            <span aria-hidden>{MODUS_SYMBOL[a.modus]}</span>
            <span>
              <span className="zahl">{a.ab}</span> {a.von} → <span className="zahl">{a.an}</span> {a.nach}
              <span className="text-tinte-3"> · {a.linie}</span>
            </span>
          </li>
        ))}
      </ol>
      {link && (
        <a href={link.href} target="_blank" rel="noreferrer" className="mt-1 inline-block min-h-11 text-sm text-tanne underline">{link.text}</a>
      )}
    </div>
  )
}
