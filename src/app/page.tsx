import Link from 'next/link'
import { inhalt } from '@/lib/content/laden'

export default function Start() {
  const i = inhalt()
  return (
    <ul className="space-y-2">
      {i.gebiete.map((g) => <li key={g.id}><Link href={`/gebiet/${g.id}`} className="text-tanne underline">{g.name}</Link></li>)}
    </ul>
  )
}
