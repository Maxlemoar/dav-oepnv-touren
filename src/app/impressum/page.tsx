import { seitenMetadaten } from '@/lib/metadaten'
import { rechtliches } from '@/lib/rechtliches'
import { FehlerMelden } from '@/components/FehlerMelden'
import { AngabenFolgen, Anschrift, Stelle } from './Angaben'

export const metadata = seitenMetadaten({
  titel: 'Impressum',
  beschreibung: 'Anbieterkennzeichnung des ÖV-Tourenplaners „Ohne Auto in die Berge“ ab Offenburg.',
  pfad: '/impressum',
})

export default function ImpressumSeite() {
  const r = rechtliches()
  const v = r.verantwortlich
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Impressum</h1>
      <p className="text-tinte-2">{r.projekt}.</p>

      {!v && <AngabenFolgen r={r} />}

      {v && (
        <>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Angaben gemäß § 5 DDG</h2>
            <Stelle v={v} />
          </section>
          {v.vertretungsberechtigt && (
            <section className="space-y-2">
              <h2 className="text-xl font-semibold">Vertreten durch</h2>
              <ul className="space-y-1">{v.vertretungsberechtigt.map((p) => <li key={p}>{p}</li>)}</ul>
            </section>
          )}
          {v.registergericht && v.registernummer && (
            <section className="space-y-2">
              <h2 className="text-xl font-semibold">Registereintrag</h2>
              <p>Vereinsregister, {v.registergericht}, {v.registernummer}</p>
            </section>
          )}
          {v.inhaltlichVerantwortlich && (
            <section className="space-y-2">
              <h2 className="text-xl font-semibold">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
              <address className="not-italic">
                <span className="block">{v.inhaltlichVerantwortlich.name}</span>
                <Anschrift zeilen={v.inhaltlichVerantwortlich.anschrift} />
              </address>
            </section>
          )}
          {r.kontaktEmail && r.kontaktEmail !== v.email && (
            <section className="space-y-2">
              <h2 className="text-xl font-semibold">Kontakt zum Projekt</h2>
              <p><a href={`mailto:${r.kontaktEmail}`} className="text-tanne underline">{r.kontaktEmail}</a></p>
            </section>
          )}
        </>
      )}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Ohne Gewähr</h2>
        <p>
          Verbindungen, Fahrzeiten, Zustiege und Öffnungszeiten stellen wir sorgfältig zusammen, aber ohne Gewähr.
          Maßgeblich sind die Fahrpläne der Verkehrsunternehmen und die Angaben der Hütten. Für die Inhalte
          verlinkter Seiten sind deren Betreiber verantwortlich.
        </p>
        <p>
          Hinweise auf Fehler nehmen wir gern entgegen: <FehlerMelden titel="Impressum" />
        </p>
      </section>
    </article>
  )
}
