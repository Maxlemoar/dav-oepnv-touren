import Link from 'next/link'
import { inhalt, findeHaltestelle, sichtbareStartorte, huettenImGebiet } from '@/lib/content/laden'
import { minutenAlsDauer } from '@/lib/datum'
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
      return {
        id: g.id, name: g.name, region: h.region, beschreibung: g.beschreibung, sportarten: g.sportarten, saison: g.saison,
        fahrzeitMin: r?.fahrzeitMin, umstiege: r?.umstiege, takt: r?.takt, ticket: r?.ticket,
        anzahlHuetten: huettenImGebiet(i, g.id).length, anzahlTouren: g.touren.length, lat: g.lat, lon: g.lon, hauptHaltestelleId: h.id,
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

  const empfehlungen = i.huetten
    .filter((h) => h.betreiber.typ === 'dav' && h.betreiber.sektion === 'Offenburg')
    .map((h) => {
      const st = findeHaltestelle(i, h.zustiege[0].haltestelleId)
      const r = st?.richtwerte[startort.id]
      return { id: h.id, name: h.name, meta: r ? `ca. ${minutenAlsDauer(r.fahrzeitMin)}` : '' }
    })

  return (
    <div>
      <section className="mb-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">In die Berge, ohne Auto.</h1>
        <p className="mt-1 text-sm text-tinte-2 sm:text-base">Hütten und Touren ab {startort.name} mit Bahn und Bus.</p>
      </section>
      <Startseite
        startort={{ id: startort.id, name: startort.name }}
        gebiete={gebiete}
        suchEintraege={suchEintraege}
        empfehlungen={empfehlungen.length > 0 && (
          // key: als Prop übergebene Elemente landen im Client in einer Kinderliste; ohne key warnt React.
          <section key="empfehlungen" aria-label="Häuser der Sektion Offenburg"
            className="flex items-center gap-x-3 overflow-x-auto whitespace-nowrap rounded-[var(--radius-karte)] bg-tanne-tint px-3 py-1 text-sm [scrollbar-width:none]">
            <span className="shrink-0 font-semibold text-tanne">Sektion Offenburg:</span>
            {empfehlungen.map((e) => (
              <Link key={e.id} href={`/huette/${e.id}`} className="inline-flex min-h-9 shrink-0 items-center gap-1 text-tanne underline">
                {e.name}{e.meta && <span className="text-tinte-2">{e.meta}</span>}
              </Link>
            ))}
          </section>
        )}
      />
    </div>
  )
}
