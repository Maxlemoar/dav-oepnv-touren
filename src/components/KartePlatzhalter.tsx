/**
 * Platzhalter, bis Kacheln und Punkte geladen sind; auch für das Laden des Karten-Codes. Eigene Datei ohne
 * MapLibre-Import, damit der Kartenrahmen ihn rendern kann, ohne MapLibre ins Seitenbundle zu ziehen.
 */
export function KartePlatzhalter() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-nebel" aria-hidden>
      <p className="animate-pulse px-6 text-center text-sm text-tinte-2">Karte wird geladen …<br />Die Liste zeigt dieselben Ziele.</p>
    </div>
  )
}
