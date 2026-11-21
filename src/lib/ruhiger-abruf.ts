/**
 * Abruf erst nach Ruhe: Solange sich die Anfrage ändert (Schieber im Sheet "Wann?", jede Änderung schreibt die URL), wird
 * nichts geladen. Erst wenn sie `ruheMs` lang gleich bleibt, startet ein Abruf. Ein laufender, überholter Abruf wird per
 * AbortController abgebrochen und nie gemeldet. So kostet ein Ziehen am Schieber höchstens einen Abruf (zwei
 * Transitous-Anfragen) statt einen je URL-Schreibvorgang. Browsersicher, ohne React; die Komponenten hängen es an
 * `useEffect`.
 */

/** Etwa so lange muss das Zeitfenster stehen, bevor live geladen wird. */
export const RUHE_MS = 800

export type AbrufErgebnis<T> = { ok: true; wert: T } | { ok: false }

export type RuhigerAbruf = {
  /** Neue Anfrage. Die erste (und die erste nach `beenden`) lädt im nächsten Tick, weitere erst nach der Ruhezeit. */
  anfrage: (anfrage: string) => void
  /** Aushängen: Timer stoppen, laufenden Abruf abbrechen, nichts mehr melden. Danach lädt `anfrage` wieder sofort. */
  beenden: () => void
}

export function ruhigerAbruf<T>(opts: {
  lade: (anfrage: string, signal: AbortSignal) => Promise<T>
  /** Ergebnis der aktuellen Anfrage; Abbrüche und überholte Anfragen werden nie gemeldet. */
  fertig: (anfrage: string, e: AbrufErgebnis<T>) => void
  ruheMs?: number
}): RuhigerAbruf {
  const ruheMs = opts.ruheMs ?? RUHE_MS
  /** Zuletzt angefragt (wartet oder läuft bzw. ist geladen). */
  let gewuenscht: string | undefined
  /** Gestartet und noch nicht überholt. */
  let geladen: string | undefined
  let steuerung: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let erste = true

  function stoppeTimer() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  function starte(anfrage: string) {
    timer = undefined
    if (anfrage === geladen) return
    steuerung?.abort()
    const s = new AbortController()
    steuerung = s
    geladen = anfrage
    opts.lade(anfrage, s.signal).then(
      (wert) => { if (steuerung === s && !s.signal.aborted) opts.fertig(anfrage, { ok: true, wert }) },
      () => { if (steuerung === s && !s.signal.aborted) opts.fertig(anfrage, { ok: false }) },
    )
  }

  return {
    anfrage(anfrage) {
      if (anfrage === gewuenscht) return
      gewuenscht = anfrage
      stoppeTimer()
      const warte = erste ? 0 : ruheMs
      erste = false
      timer = setTimeout(() => starte(anfrage), warte)
    },
    beenden() {
      stoppeTimer()
      steuerung?.abort()
      steuerung = undefined
      gewuenscht = undefined
      geladen = undefined
      erste = true
    },
  }
}
