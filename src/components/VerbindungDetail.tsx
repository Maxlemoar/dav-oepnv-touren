import type { VerbindungKurz, Abschnitt } from '@/lib/verbindung/auswerten'

const MODUS_SYMBOL: Record<Abschnitt['modus'], string> = { zug: '🚆', bus: '🚌', seilbahn: '🚠', schiff: '⛴', fuss: '🚶', sonstig: '•' }

export function VerbindungDetail({ titel, v }: { titel: string; v: VerbindungKurz }) {
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
    </div>
  )
}
