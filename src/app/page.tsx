import { inhalt, findeHaltestelle, sichtbareStartorte, huettenImGebiet } from '@/lib/content/laden'
import { istSektionshaus } from '@/lib/content/schema'
import type { GebietEintrag } from '@/lib/filter'
import { Startseite } from '@/components/Startseite'
import type { SuchEintrag } from '@/components/Suche'

export default function Start() {
  const i = inhalt()
  const startort = sichtbareStartorte(i)[0]

  const gebiete: GebietEintrag[] = i.gebiete
    .map((g) => {
      const h = findeHaltestelle(i, g.haltestellen[0])!
      const r = h.richtwerte[startort.id]
      const huetten = huettenImGebiet(i, g.id)
      return {
        id: g.id, name: g.name, region: h.region, beschreibung: g.beschreibung, sportarten: g.sportarten, saison: g.saison,
        fahrzeitMin: r?.fahrzeitMin, umstiege: r?.umstiege, takt: r?.takt, ticket: r?.ticket,
        anzahlHuetten: huetten.length, anzahlTouren: g.touren.length, sektionshaus: huetten.some(istSektionshaus),
        lat: g.lat, lon: g.lon, hauptHaltestelleId: h.id,
      }
    })
    .sort((a, b) => (a.fahrzeitMin ?? 9999) - (b.fahrzeitMin ?? 9999))

  const regionVonGebiet = new Map(gebiete.map((g) => [g.id, g.region]))
  const nameVonGebiet = new Map(i.gebiete.map((g) => [g.id, g.name]))
  const suchEintraege: SuchEintrag[] = [
    ...gebiete.map((g) => ({ id: g.id, name: g.name, typ: 'gebiet' as const, meta: g.region, suchtext: g.region })),
    ...i.huetten.map((h) => {
      const gebiet = nameVonGebiet.get(h.gebietId) ?? ''
      const region = regionVonGebiet.get(h.gebietId) ?? ''
      return { id: h.id, name: h.name, typ: 'huette' as const, meta: `${gebiet} · ${h.hoehe} m`, suchtext: `${gebiet} ${region}` }
    }),
  ]

  return (
    <Startseite
      startort={{ id: startort.id, name: startort.name }}
      titel={
        <section key="titel" className="mb-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">In die Berge, ohne Auto.</h1>
          <p className="mt-1 text-sm text-tinte-2 sm:text-base">Hütten und Touren ab {startort.name} mit Bahn und Bus.</p>
        </section>
      }
      gebiete={gebiete}
      suchEintraege={suchEintraege}
    />
  )
}
