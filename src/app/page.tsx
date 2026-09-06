import { inhalt, findeHaltestelle, sichtbareStartorte, huettenImGebiet } from '@/lib/content/laden'
import { minutenAlsDauer } from '@/lib/datum'
import type { GebietEintrag } from '@/lib/filter'
import { Startseite } from '@/components/Startseite'
import type { SuchEintrag } from '@/components/Suche'

export default function Start() {
  const i = inhalt()
  const startort = sichtbareStartorte(i)[0]

  const gebiete: GebietEintrag[] = i.gebiete.map((g) => {
    const h = findeHaltestelle(i, g.haltestellen[0])!
    const r = h.richtwerte[startort.id]
    return {
      id: g.id, name: g.name, beschreibung: g.beschreibung, sportarten: g.sportarten, saison: g.saison,
      fahrzeitMin: r?.fahrzeitMin, umstiege: r?.umstiege, takt: r?.takt, ticket: r?.ticket,
      anzahlHuetten: huettenImGebiet(i, g.id).length, lat: g.lat, lon: g.lon, hauptHaltestelleId: h.id,
    }
  })

  const suchEintraege: SuchEintrag[] = [
    ...i.gebiete.map((g) => ({ id: g.id, name: g.name, typ: 'gebiet' as const, meta: 'Gebiet' })),
    ...i.huetten.map((h) => ({ id: h.id, name: h.name, typ: 'huette' as const, meta: `${h.hoehe} m` })),
  ]

  const empfehlungen = i.huetten
    .filter((h) => h.betreiber.typ === 'dav' && h.betreiber.sektion === 'Offenburg')
    .map((h) => {
      const st = findeHaltestelle(i, h.zustiege[0].haltestelleId)
      const r = st?.richtwerte[startort.id]
      return { id: h.id, name: h.name, meta: r ? `ca. ${minutenAlsDauer(r.fahrzeitMin)}` : '' }
    })

  return <Startseite startort={{ id: startort.id, name: startort.name }} gebiete={gebiete} suchEintraege={suchEintraege} empfehlungen={empfehlungen} />
}
