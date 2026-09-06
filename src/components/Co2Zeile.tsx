export function Co2Zeile({ kg }: { kg: number | undefined }) {
  if (kg === undefined) return null
  return <p className="text-sm text-tinte-2">🌱 Bahn statt Auto spart etwa <span className="zahl">{kg} kg</span> CO₂ pro Person.</p>
}
