export type Co2Faktoren = { pkwGrammProFahrzeugKm: number; personenProPkw: number; bahnGrammProPersonenKm: number }

/** Ersparnis Bahn gegenüber Auto, Hin- und Rückfahrt, pro Person, in kg, auf 5 kg gerundet. */
export function co2ErsparnisKg(d: { strassenKm?: number; bahnKm?: number }, f: Co2Faktoren): number | undefined {
  if (!d.strassenKm) return undefined
  const bahnKm = d.bahnKm ?? d.strassenKm
  const autoGramm = (d.strassenKm * 2 * f.pkwGrammProFahrzeugKm) / f.personenProPkw
  const bahnGramm = bahnKm * 2 * f.bahnGrammProPersonenKm
  const kg = Math.max(0, (autoGramm - bahnGramm) / 1000)
  return Math.round(kg / 5) * 5
}
