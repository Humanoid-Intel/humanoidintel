import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#050608',
          padding: '64px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Green top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: '#00ff88',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Site label */}
        <div
          style={{
            color: '#00ff88',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 28,
            position: 'relative',
          }}
        >
          humanoidintel.ai
        </div>
        {/* Main headline */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 54,
            fontWeight: 600,
            lineHeight: 1.2,
            maxWidth: 820,
            position: 'relative',
            marginBottom: 24,
          }}
        >
          The Bloomberg Terminal of Humanoid Robotics
        </div>
        {/* Subline */}
        <div
          style={{
            color: '#666666',
            fontSize: 22,
            position: 'relative',
            letterSpacing: '0.02em',
          }}
        >
          Funding · Robot Specs · Research · Market Intelligence
        </div>
        {/* Bottom-right watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 64,
            color: '#2a2a2a',
            fontSize: 13,
          }}
        >
          humanoidintel.ai
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
