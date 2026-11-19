import { KartenRahmen } from '@/components/karte/KartenRahmen'

/**
 * Startseite und Ortsseiten teilen diesen Rahmen: links das Feld (Liste oder Ort), rechts die Karte. Das Layout bleibt
 * beim Wechsel zwischen / und /gebiet/<id> stehen, die Karte lädt dabei nicht neu.
 */
export default function KartenLayout({ children }: { children: React.ReactNode }) {
  return <KartenRahmen>{children}</KartenRahmen>
}
