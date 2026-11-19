export type Gedrosselt<A extends unknown[]> = {
  /** Ruft `fn` sofort, wenn das letzte Mal mindestens `ms` her ist, sonst einmal am Ende des Intervalls mit den letzten Argumenten. */
  rufe: (...a: A) => void
  /** Führt einen offenen Aufruf gleich aus (z. B. beim Loslassen des Schiebers). */
  sofort: () => void
  /** Verwirft einen offenen Aufruf. */
  abbrechen: () => void
}

/** Drosselt `fn` auf höchstens einen Aufruf je `ms`, mit Nachläufer: der letzte Aufruf geht nie verloren. */
export function drossel<A extends unknown[]>(fn: (...a: A) => void, ms: number): Gedrosselt<A> {
  let zuletzt = Number.NEGATIVE_INFINITY
  let timer: ReturnType<typeof setTimeout> | undefined
  let offen: A | undefined

  function stoppeTimer() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }
  function laufe() {
    stoppeTimer()
    if (!offen) return
    const a = offen
    offen = undefined
    zuletzt = Date.now()
    fn(...a)
  }

  return {
    rufe(...a) {
      offen = a
      if (timer !== undefined) return
      const warte = zuletzt + ms - Date.now()
      if (warte <= 0) laufe()
      else timer = setTimeout(laufe, warte)
    },
    sofort: laufe,
    abbrechen() {
      stoppeTimer()
      offen = undefined
    },
  }
}
