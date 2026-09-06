import { fehlerMeldenLink } from '@/lib/links'

export function FehlerMelden({ titel }: { titel: string }) {
  const href = fehlerMeldenLink(titel, process.env.NEXT_PUBLIC_FEHLER_MAIL)
  return (
    <a href={href} className="text-sm text-tinte-3 underline hover:text-tinte" target="_blank" rel="noreferrer">
      Fehler melden
    </a>
  )
}
