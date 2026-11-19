import { ImageResponse } from 'next/og'
import { OG_BILD } from '@/lib/metadaten'

export const alt = OG_BILD.alt
export const size = { width: OG_BILD.width, height: OG_BILD.height }
export const contentType = 'image/png'

// Farben aus docs/design-system.md
const PAPIER = '#f7f6f2'
const TINTE = '#1b1f1c'
const TINTE_2 = '#4a5049'
const TANNE = '#1f4d3a'
const STUFEN = ['#2f6b52', '#7fa85a', '#d9a441', '#b85a22']

/** Seitenweites Vorschaubild für Links in Messengern und sozialen Netzen; statisch beim Build erzeugt. */
export default function Bild() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: PAPIER, padding: '72px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, color: TANNE, fontWeight: 600 }}>
          <div style={{ width: 20, height: 20, borderRadius: 999, background: TANNE }} />
          Ohne Auto in die Berge
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 92, fontWeight: 700, color: TINTE, letterSpacing: -2, lineHeight: 1.05 }}>In die Berge, ohne Auto.</div>
          <div style={{ fontSize: 40, color: TINTE_2, lineHeight: 1.3 }}>Ausgangsorte für Touren ab Offenburg mit Bahn und Bus</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {STUFEN.map((f) => <div key={f} style={{ width: 72, height: 12, borderRadius: 999, background: f }} />)}
          </div>
          <div style={{ fontSize: 24, color: TINTE_2 }}>Arbeitskreis Klimaschutz · DAV Sektion Offenburg</div>
        </div>
      </div>
    ),
    size,
  )
}
