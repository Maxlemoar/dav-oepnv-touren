'use client'
import { useState, type ReactNode } from 'react'

/**
 * Weitere Haltestelle im Gebiet, eingeklappt. Der Inhalt (mit der Live-Verbindung) wird erst beim ersten Öffnen
 * gerendert, damit nicht jede Haltestelle beim Seitenaufruf eine Anfrage an den Fahrplandienst auslöst; danach bleibt er.
 */
export function AufklappHaltestelle({ titel, children }: { titel: ReactNode; children: ReactNode }) {
  const [geoeffnet, setGeoeffnet] = useState(false)
  return (
    <details className="karte-card group" onToggle={(e) => { if (e.currentTarget.open) setGeoeffnet(true) }}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 font-medium">
        <span>{titel}</span>
        <span aria-hidden className="text-tanne transition-transform group-open:rotate-90">›</span>
      </summary>
      {geoeffnet && <div className="mt-3 space-y-3">{children}</div>}
    </details>
  )
}
