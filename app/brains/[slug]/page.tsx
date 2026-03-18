import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { getBrains, getBrain } from '@/lib/content'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const brains = getBrains()
  return brains.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brain = getBrain(slug)
  if (!brain) return { title: 'Brain Not Found — humanoidintel.ai' }

  const url = `https://humanoidintel.ai/brains/${slug}`
  return {
    title: `${brain.name} by ${brain.developer} — humanoidintel.ai`,
    description: brain.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${brain.name} — ${brain.developer}`,
      description: brain.description,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brain.name} by ${brain.developer} — humanoidintel.ai`,
      description: brain.description,
      creator: '@humanoidintel',
    },
  }
}

function statusClass(status: string) {
  return ['production', 'commercial'].includes(status) ? 'data-pos' : 'data-neg'
}

export default async function BrainProfilePage({ params }: Props) {
  const { slug } = await params
  const brain = getBrain(slug)

  if (!brain) {
    notFound()
  }

  const allBrains = getBrains()

  // Related: same developer
  const related = allBrains.filter(
    (b) => b.slug !== slug && b.developer === brain.developer,
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: brain.name,
    description: brain.description,
    applicationCategory: 'Robotics AI',
    operatingSystem: 'Robotics Platform',
    author: {
      '@type': 'Organization',
      name: brain.developer,
    },
    url: `https://humanoidintel.ai/brains/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
        { '@type': 'ListItem', position: 2, name: 'Brain Database', item: 'https://humanoidintel.ai/brains' },
        { '@type': 'ListItem', position: 3, name: brain.name, item: `https://humanoidintel.ai/brains/${slug}` },
      ],
    },
  }

  const specs: { label: string; value: string | undefined }[] = [
    { label: 'Architecture', value: brain.architecture },
    { label: 'Parameters', value: brain.parameters ?? undefined },
    { label: 'Compute', value: brain.computeTops ?? undefined },
    { label: 'Training Data', value: brain.trainingDataScale ?? undefined },
    { label: 'License', value: brain.license ?? undefined },
    { label: 'Status', value: brain.status?.toUpperCase() },
    { label: 'Open Source', value: brain.openSource ? 'Yes' : 'No' },
  ]

  return (
    <>
      <SchemaMarkup schema={schema} />
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <div
          className="font-data"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '16px 0 0' }}
        >
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Terminal</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <Link href="/brains" style={{ color: 'var(--text-tertiary)' }}>Brain DB</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{brain.name}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: 32,
            marginTop: 24,
          }}
        >
          {/* Main content */}
          <div>
            {/* Hero */}
            <div
              style={{
                borderTop: '2px solid var(--accent-positive)',
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <span className={statusClass(brain.status) + ' font-data'}
                  style={{ fontSize: 11, border: '1px solid', padding: '2px 6px', textTransform: 'uppercase' }}>
                  {brain.status}
                </span>
                <span
                  className="font-data"
                  style={{
                    fontSize: 11,
                    border: '1px solid var(--border-subtle)',
                    padding: '2px 6px',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {brain.architecture}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 6px',
                    border: '1px solid',
                    color: brain.openSource ? '#22c55e' : 'var(--text-tertiary)',
                    borderColor: brain.openSource ? '#22c55e' : 'var(--border-subtle)',
                  }}
                >
                  {brain.openSource ? 'Open Source' : 'Proprietary'}
                </span>
              </div>
              <h1
                className="font-head"
                style={{ fontSize: 36, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}
              >
                {brain.name}
              </h1>
              <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                by {brain.developer}
              </div>
            </div>

            {/* Specs grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 32,
              }}
            >
              {specs.map(
                (spec) =>
                  spec.value !== undefined && (
                    <div key={spec.label} className="metric-block" style={{ marginBottom: 0 }}>
                      <div className="metric-label">{spec.label}</div>
                      <div
                        className="font-head"
                        style={{
                          fontSize: 18,
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          marginTop: 4,
                        }}
                      >
                        {String(spec.value)}
                      </div>
                    </div>
                  ),
              )}
            </div>

            {/* Robots Supported */}
            {brain.robotsSupported.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 12 }}>
                  Robots Supported
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {brain.robotsSupported.map((robot) => (
                    <span
                      key={robot}
                      className="font-data"
                      style={{
                        fontSize: 11,
                        padding: '4px 10px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {robot}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>
                About
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                {brain.description}
              </p>
            </div>

            {/* Key Differentiator */}
            <div style={{ marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>
                Key Differentiator
              </div>
              <div
                style={{
                  borderLeft: '2px solid var(--accent-positive)',
                  paddingLeft: 16,
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {brain.keyDifferentiator}
              </div>
            </div>

            {/* Funding Context */}
            {brain.fundingContext && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 12 }}>
                  Funding Context
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {brain.fundingContext}
                </p>
              </div>
            )}

            {/* Milestones */}
            {brain.milestones && brain.milestones.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 16 }}>
                  Milestones
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {brain.milestones.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '110px 1fr',
                        gap: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderBottom: '1px solid var(--border-subtle)',
                        alignItems: 'start',
                      }}
                    >
                      <span
                        className="font-data"
                        style={{ fontSize: 11, color: 'var(--text-tertiary)', paddingTop: 2 }}
                      >
                        {m.date}
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        {m.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Website link */}
            {brain.website && (
              <a
                href={brain.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-data"
                style={{
                  fontSize: 11,
                  color: 'var(--accent-positive)',
                  display: 'block',
                  padding: '10px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 12,
                }}
              >
                Visit Website →
              </a>
            )}

            {/* Also from developer */}
            {related.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div className="panel-title" style={{ marginBottom: 12 }}>
                  Also from {brain.developer}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {related.map((sib) => (
                    <Link
                      key={sib.slug}
                      href={`/brains/${sib.slug}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div
                        className="sibling-item"
                        style={{
                          paddingTop: 10,
                          paddingBottom: 10,
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background-color 0.1s',
                        }}
                      >
                        <div
                          style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}
                        >
                          {sib.name}
                        </div>
                        <span
                          className={statusClass(sib.status) + ' font-data'}
                          style={{ fontSize: 10, textTransform: 'uppercase' }}
                        >
                          {sib.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to database */}
            <Link
              href="/brains"
              className="font-data"
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                display: 'block',
                padding: '10px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ← Full Brain Database
            </Link>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  )
}
