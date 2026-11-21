/** Textseiten (Über, Hütten, Sektionstouren, Rechtliches): Breite und Abstände wie vor dem Kartenrahmen. */
export default function SeitenLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">{children}</div>
}
