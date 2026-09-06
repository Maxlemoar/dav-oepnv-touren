export type Stufe = 2 | 3 | 4 | 5

export function reisezeitStufe(fahrzeitMin: number): Stufe {
  if (fahrzeitMin <= 120) return 2
  if (fahrzeitMin <= 180) return 3
  if (fahrzeitMin <= 240) return 4
  return 5
}

/** Entspricht --color-stufe-* in globals.css; für MapLibre, das keine CSS-Variablen liest. */
export const STUFE_FARBE: Record<Stufe, string> = { 2: '#2f6b52', 3: '#7fa85a', 4: '#d9a441', 5: '#b85a22' }
