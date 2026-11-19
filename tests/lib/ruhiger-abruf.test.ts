import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ruhigerAbruf, RUHE_MS } from '@/lib/ruhiger-abruf'

/** lade-Attrappe: merkt sich Aufrufe und Signale, Ergebnisse von Hand auflösen. */
function attrappe() {
  const aufrufe: { anfrage: string; signal: AbortSignal; aufloesen: (w: string) => void; ablehnen: (e: unknown) => void }[] = []
  const lade = vi.fn((anfrage: string, signal: AbortSignal) => new Promise<string>((aufloesen, ablehnen) => {
    aufrufe.push({ anfrage, signal, aufloesen, ablehnen })
    signal.addEventListener('abort', () => ablehnen(new DOMException('abgebrochen', 'AbortError')))
  }))
  const fertig = vi.fn()
  return { aufrufe, lade, fertig }
}

describe('ruhigerAbruf', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('lädt die erste Anfrage gleich (nach einem Tick), nicht erst nach der Ruhezeit', () => {
    const { lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('k1')
    expect(lade).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(lade).toHaveBeenCalledTimes(1)
    expect(lade.mock.calls[0][0]).toBe('k1')
  })

  it('10 Änderungen innerhalb von 2 s führen zu genau einem Abruf, nach der Ruhezeit', () => {
    const { lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('start')
    vi.advanceTimersByTime(0)
    expect(lade).toHaveBeenCalledTimes(1)
    for (let i = 0; i < 10; i++) {
      a.anfrage(`k${i}`)
      vi.advanceTimersByTime(200)
    }
    // 2 s gezogen; der letzte Wert ist erst 200 ms alt.
    expect(lade).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(RUHE_MS)
    expect(lade).toHaveBeenCalledTimes(2)
    expect(lade.mock.calls[1][0]).toBe('k9')
    vi.advanceTimersByTime(10_000)
    expect(lade).toHaveBeenCalledTimes(2)
  })

  it('wartet mindestens etwa 800 ms Ruhe', () => {
    expect(RUHE_MS).toBeGreaterThanOrEqual(800)
  })

  it('lädt nichts, wenn der Wert zur geladenen Anfrage zurückkehrt', () => {
    const { lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('a')
    vi.advanceTimersByTime(0)
    a.anfrage('b')
    vi.advanceTimersByTime(300)
    a.anfrage('a')
    vi.advanceTimersByTime(RUHE_MS * 2)
    expect(lade).toHaveBeenCalledTimes(1)
  })

  it('bricht einen überholten Abruf ab und meldet nur das Ergebnis der aktuellen Anfrage', async () => {
    const { aufrufe, lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('alt')
    vi.advanceTimersByTime(0)
    a.anfrage('neu')
    vi.advanceTimersByTime(RUHE_MS)
    expect(aufrufe).toHaveLength(2)
    expect(aufrufe[0].signal.aborted).toBe(true)
    expect(aufrufe[1].signal.aborted).toBe(false)
    aufrufe[1].aufloesen('ergebnis-neu')
    await vi.runAllTimersAsync()
    expect(fertig).toHaveBeenCalledTimes(1)
    expect(fertig).toHaveBeenCalledWith('neu', { ok: true, wert: 'ergebnis-neu' })
  })

  it('meldet Fehlschläge, aber keine Abbrüche', async () => {
    const { aufrufe, lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('x')
    vi.advanceTimersByTime(0)
    aufrufe[0].ablehnen(new Error('HTTP 502'))
    await vi.runAllTimersAsync()
    expect(fertig).toHaveBeenCalledWith('x', { ok: false })
  })

  it('beenden bricht ab, verwirft offene Anfragen und lädt danach wieder sofort', async () => {
    const { aufrufe, lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('x')
    vi.advanceTimersByTime(0)
    a.anfrage('y')
    a.beenden()
    expect(aufrufe[0].signal.aborted).toBe(true)
    vi.advanceTimersByTime(RUHE_MS * 2)
    expect(lade).toHaveBeenCalledTimes(1)
    await vi.runAllTimersAsync()
    expect(fertig).not.toHaveBeenCalled()
    // Wieder eingehängt (StrictMode, Zurück zur Seite): gleich laden.
    a.anfrage('x')
    vi.advanceTimersByTime(0)
    expect(lade).toHaveBeenCalledTimes(2)
  })

  it('StrictMode: anfrage, beenden, anfrage im selben Tick lädt nur einmal', () => {
    const { lade, fertig } = attrappe()
    const a = ruhigerAbruf({ lade, fertig })
    a.anfrage('x')
    a.beenden()
    a.anfrage('x')
    vi.advanceTimersByTime(0)
    expect(lade).toHaveBeenCalledTimes(1)
  })
})
