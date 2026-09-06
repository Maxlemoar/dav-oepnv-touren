'use client'
// Platzhalter, wird in Task 14 durch MapLibre ersetzt.
export function Karte({ gebietIds }: { gebietIds: string[]; uebersicht: Record<string, boolean | undefined> }) {
  return <div className="flex h-full items-center justify-center text-tinte-3">Karte folgt ({gebietIds.length} Gebiete)</div>
}
