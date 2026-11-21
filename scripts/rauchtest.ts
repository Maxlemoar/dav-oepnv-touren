/** Fünf Live-Abfragen gegen Transitous für den nächsten Samstag. Warnt nur, Exit-Code immer 0. */
import { ladeInhalt, findeHaltestelle, findeStartort } from '../src/lib/content/laden'
import { naechsterSamstag, lokaleUhrzeit, lokalesDatum } from '../src/lib/datum'
import { ladeFahrplan } from '../src/lib/verbindung/fahrplan'
import { verbindungErmitteln } from '../src/lib/verbindung/service'
import { STANDARD_ZEITFENSTER } from '../src/lib/zeitfenster'

const ZIELE = ['feldberg-baerental', 'kandersteg', 'engelberg', 'wasserauen', 'metzeral']

async function main() {
  const i = ladeInhalt()
  const startort = findeStartort(i, 'offenburg')
  if (!startort) { console.warn('WARN Startort offenburg fehlt im Inhalt'); return }
  const datum = naechsterSamstag()
  console.log(`Rauchtest ab ${startort.name} für ${datum}`)
  let warnungen = 0
  const heute = lokalesDatum(new Date())
  const fahrplan = ladeFahrplan()
  for (const id of ZIELE) {
    const h = findeHaltestelle(i, id)
    if (!h) { console.warn(`WARN ${id}: Haltestelle fehlt im Inhalt`); warnungen++; continue }
    const a = await verbindungErmitteln({ startort, haltestelle: h, z: { datum, rueck: datum, ...STANDARD_ZEITFENSTER }, tickets: i.tickets, heute, fahrplan })
    if (a.quelle !== 'live' || !a.hinfahrt) { console.warn(`WARN ${id}: ${[a.fehlerArt, a.fehler ?? a.hinweis].filter(Boolean).join(': ') || 'keine Hinfahrt im Fenster'}`); warnungen++; continue }
    const rueck = a.rueckfahrt ? `zurück ab ${lokaleUhrzeit(a.rueckfahrt.ab)}` : 'keine Rückfahrt'
    console.log(`OK   ${id}: ab ${lokaleUhrzeit(a.hinfahrt.ab)}, an ${lokaleUhrzeit(a.hinfahrt.an)}, ${a.hinfahrt.umstiege} Umstiege, ${rueck}, ${a.passung ? (a.passung.passt ? 'passt' : a.passung.grund) : 'Passung ?'}, ${a.ticket.ticket}${a.fehler ? ` (${a.fehler})` : ''}`)
  }
  console.log(warnungen ? `${warnungen} Warnungen` : 'Alle Ziele erreichbar')
}

main().catch((e) => { console.warn('WARN Rauchtest abgebrochen:', (e as Error).message) })
