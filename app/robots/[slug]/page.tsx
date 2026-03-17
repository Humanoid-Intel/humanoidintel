import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { getRobots, getRobot, getCompanies } from '@/lib/content'
import { generateRobotSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const robots = getRobots()
  return robots.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const robot = getRobot(slug)
  if (!robot) return { title: 'Robot Not Found — humanoidintel.ai' }

  const url = `https://humanoidintel.ai/robots/${slug}`
  return {
    title: `${robot.name} by ${robot.manufacturer} — humanoidintel.ai`,
    description: robot.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${robot.name} — ${robot.manufacturer}`,
      description: robot.description,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${robot.name} by ${robot.manufacturer} — humanoidintel.ai`,
      description: robot.description,
      creator: '@humanoidintel',
    },
  }
}

function statusClass(status: string) {
  return ['commercial', 'pilot', 'production'].includes(status) ? 'data-pos' : 'data-neg'
}

export default async function RobotProfilePage({ params }: Props) {
  const { slug } = await params
  const robot = getRobot(slug)

  if (!robot) {
    notFound()
  }

  const allRobots = getRobots()
  const companies = getCompanies()

  // Siblings: same manufacturer
  const siblings = allRobots.filter(
    (r) => r.slug !== slug && r.manufacturer === robot.manufacturer,
  )

  // Company match
  const company = companies.find(
    (c) => c.name.toLowerCase() === robot.manufacturer.toLowerCase(),
  )

  const schema = generateRobotSchema(robot)

  const specs: { label: string; value: string | number | undefined }[] = [
    { label: 'Height', value: robot.height },
    { label: 'Weight', value: robot.weight },
    { label: 'Degrees of Freedom', value: robot.dof },
    { label: 'Payload Capacity', value: robot.payload },
    { label: 'Battery Life', value: robot.battery },
    { label: 'Actuation Type', value: robot.actuatorType },
    { label: 'Country', value: robot.country },
    { label: 'Status', value: robot.status?.toUpperCase() },
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
          <Link href="/robots" style={{ color: 'var(--text-tertiary)' }}>Robot DB</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{robot.name}</span>
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
                <span className={statusClass(robot.status) + ' font-data'}
                  style={{ fontSize: 11, border: '1px solid', padding: '2px 6px', textTransform: 'uppercase' }}>
                  {robot.status}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{robot.country}</span>
              </div>
              <h1
                className="font-head"
                style={{ fontSize: 36, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}
              >
                {robot.name}
              </h1>
              <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                by{' '}
                {company ? (
                  <Link href={`/companies/${company.slug}`} className="data-pos">
                    {robot.manufacturer}
                  </Link>
                ) : (
                  robot.manufacturer
                )}
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
                {robot.description}
              </p>
            </div>

            {/* Deployment notes */}
            {robot.deploymentNotes && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 12 }}>
                  Deployment Notes
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
                  {robot.deploymentNotes}
                </div>
              </div>
            )}

            {/* Milestones */}
            {robot.milestones && robot.milestones.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 16 }}>
                  Milestones
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {robot.milestones.map((m, i) => (
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

            {/* Company funding */}
            {company && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 16 }}>
                  {robot.manufacturer} — Funding Summary
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12,
                  }}
                >
                  {company.totalFunding && (
                    <div className="metric-block" style={{ marginBottom: 0 }}>
                      <div className="metric-label">Total Funding</div>
                      <div className="metric-value" style={{ fontSize: 20 }}>
                        {company.totalFunding}
                      </div>
                    </div>
                  )}
                  {company.latestValuation && (
                    <div className="metric-block" style={{ marginBottom: 0 }}>
                      <div className="metric-label">Latest Valuation</div>
                      <div className="metric-value" style={{ fontSize: 20 }}>
                        {company.latestValuation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Also from manufacturer */}
            {siblings.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div className="panel-title" style={{ marginBottom: 12 }}>
                  Also from {robot.manufacturer}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {siblings.map((sib) => (
                    <Link
                      key={sib.slug}
                      href={`/robots/${sib.slug}`}
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
              href="/robots"
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
              ← Full Robot Database
            </Link>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  )
}
