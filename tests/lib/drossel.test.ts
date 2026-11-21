import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drossel } from '@/lib/drossel'

describe('drossel', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('ruft sofort beim ersten Mal, danach höchstens einmal je Intervall mit den letzten Argumenten', () => {
    const fn = vi.fn()
    const d = drossel(fn, 150)
    d.rufe(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(1)
    d.rufe(2)
    d.rufe(3)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(149)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('begrenzt eine lange Folge von Aufrufen', () => {
    const fn = vi.fn()
    const d = drossel(fn, 150)
    // 40 Schritte in 4 s (wie ein langes Ziehen hin und her): höchstens 4000 / 150 + 1 Aufrufe.
    for (let i = 0; i < 40; i++) { d.rufe(i); vi.advanceTimersByTime(100) }
    vi.advanceTimersByTime(150)
    expect(fn.mock.calls.length).toBeLessThanOrEqual(28)
    expect(fn).toHaveBeenLastCalledWith(39)
  })

  it('sofort schreibt den offenen Aufruf gleich und lässt keinen Nachläufer stehen', () => {
    const fn = vi.fn()
    const d = drossel(fn, 150)
    d.rufe('a')
    d.rufe('b')
    d.sofort()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('b')
    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalledTimes(2)
    d.sofort()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('abbrechen verwirft den offenen Aufruf', () => {
    const fn = vi.fn()
    const d = drossel(fn, 150)
    d.rufe('a')
    d.rufe('b')
    d.abbrechen()
    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith('a')
  })
})
