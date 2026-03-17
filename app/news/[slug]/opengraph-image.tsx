import { ImageResponse } from 'next/og'
import { getArticle, getArticles } from '@/lib/content'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }))
}

const CATEGORY_COLORS: Record<string, string> = {
  breaking: '#ff4444',
  market: '#00aaff',
  research: '#aa44ff',
  policy: '#ffaa00',
  'deep-dive': '#00ff88',
}

const CATEGORY_LABELS: Record<string, string> = {
  breaking: 'BREAKING',
  market: 'MARKET',
  research: 'RESEARCH',
  policy: 'POLICY',
  'deep-dive': 'DEEP DIVE',
}

export default async function ArticleOGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getArticle(slug)

  const title = result?.article.title ?? 'humanoidintel.ai'
  const excerpt = result?.article.excerpt ?? ''
  const category = result?.article.category ?? 'breaking'
  const accentColor = CATEGORY_COLORS[category] ?? '#00ff88'
  const categoryLabel = CATEGORY_LABELS[category] ?? category.toUpperCase()
  const fontSize = title.length > 70 ? 36 : title.length > 50 ? 42 : 50

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#050608',
          padding: '56px 64px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
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
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Site name */}
        <div
          style={{
            color: '#00ff88',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 20,
            position: 'relative',
          }}
        >
          humanoidintel.ai
        </div>
        {/* Category badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
            position: 'relative',
          }}
        >
          <div
            style={{
              backgroundColor: accentColor,
              color: '#000000',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 14px',
              letterSpacing: '0.08em',
            }}
          >
            {categoryLabel}
          </div>
        </div>
        {/* Article title */}
        <div
          style={{
            color: '#ffffff',
            fontSize,
            fontWeight: 600,
            lineHeight: 1.25,
            maxWidth: 1000,
            position: 'relative',
            flex: 1,
          }}
        >
          {title}
        </div>
        {/* Excerpt */}
        {excerpt && (
          <div
            style={{
              color: '#555555',
              fontSize: 18,
              lineHeight: 1.5,
              maxWidth: 900,
              position: 'relative',
              marginTop: 16,
            }}
          >
            {excerpt.length > 130 ? `${excerpt.slice(0, 130)}…` : excerpt}
          </div>
        )}
        {/* Bottom label */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 64,
            color: '#222222',
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
