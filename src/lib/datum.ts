const ZONE = 'Europe/Berlin'

const teileFormat = new Intl.DateTimeFormat('de-DE', {
  timeZone: ZONE, hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short',
})

function lokaleTeile(d: Date) {
  const t: Record<string, string> = {}
  for (const p of teileFormat.formatToParts(d)) t[p.type] = p.value
  return {
    jahr: t.year, monat: t.month, tag: t.day,
    stunde: Number(t.hour), minute: Number(t.minute), wochentag: t.weekday,
  }
}

/** Minuten seit lokaler Mitternacht (Europe/Berlin). */
export function lokaleMinuten(iso: string): number {
  const t = lokaleTeile(new Date(iso))
  return t.stunde * 60 + t.minute
}

export function lokaleUhrzeit(iso: string): string {
  const t = lokaleTeile(new Date(iso))
  return `${String(t.stunde).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

/** YYYY-MM-DD in Europe/Berlin. */
export function lokalesDatum(iso: string | Date): string {
  const t = lokaleTeile(typeof iso === 'string' ? new Date(iso) : iso)
  return `${t.jahr}-${t.monat}-${t.tag}`
}

function tageAddieren(datum: string, tage: number): string {
  const d = new Date(`${datum}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + tage)
  return d.toISOString().slice(0, 10)
}

export function folgetag(datum: string): string {
  return tageAddieren(datum, 1)
}

/** Kommender Samstag (heute, falls Samstag) als YYYY-MM-DD. */
export function naechsterSamstag(heute: Date = new Date()): string {
  const datum = lokalesDatum(heute)
  const wochentag = new Date(`${datum}T00:00:00Z`).getUTCDay() // 0 So … 6 Sa
  return tageAddieren(datum, (6 - wochentag + 7) % 7)
}

/** Lokale Uhrzeit (Minuten seit Mitternacht) an einem Datum als UTC-ISO. */
export function zuUtcIso(datum: string, minuten: number): string {
  const mittagUtc = Date.parse(`${datum}T12:00:00Z`)
  const versatz = lokaleMinuten(new Date(mittagUtc).toISOString()) - 12 * 60 // 60 oder 120
  const ms = Date.parse(`${datum}T00:00:00Z`) + (minuten - versatz) * 60_000
  return new Date(ms).toISOString().replace('.000Z', 'Z')
}

export function wochentagKurz(datum: string): string {
  const t = lokaleTeile(new Date(`${datum}T12:00:00Z`))
  return t.wochentag.replace('.', '')
}

export function minutenAlsDauer(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')} h`
}

export function datumLesbar(datum: string): string {
  const [j, m, t] = datum.split('-')
  return `${wochentagKurz(datum)} ${Number(t)}.${Number(m)}.${j}`
}
