import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { getCompanies, getCompany, getRobots } from '@/lib/content'
import WatchlistButton from '@/components/WatchlistButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const companies = getCompanies()
  return companies.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = getCompany(slug)
  if (!company) return { title: 'Company Not Found — humanoidintel.ai' }

  const url = `https://humanoidintel.ai/companies/${slug}`
  return {
    title: `${company.name} — humanoidintel.ai`,
    description: company.description,
    alternates: { canonical: url },
    openGraph: {
      title: company.name,
      description: company.description,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} — humanoidintel.ai`,
      description: company.description,
      creator: '@humanoidintel',
    },
  }
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params
  const company = getCompany(slug)

  if (!company) {
    notFound()
  }

  const allRobots = getRobots()

  // Match robots to company
  const companyRobots = allRobots.filter(
    (r) => r.manufacturer.toLowerCase() === company.name.toLowerCase(),
  )

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 1000 }}>
        {/* Breadcrumb */}
        <div
          className="font-data"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '16px 0 0' }}
        >
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Terminal</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <Link href="/companies" style={{ color: 'var(--text-tertiary)' }}>Companies</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{company.name}</span>
        </div>

        {/* Company header */}
        <div
          style={{
            borderTop: '2px solid var(--accent-positive)',
            backgroundColor: 'var(--bg-surface)',
            padding: 20,
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span
              className="font-data"
              style={{
                fontSize: 11,
                color:
                  company.status === 'active'
                    ? 'var(--accent-positive)'
                    : 'var(--text-tertiary)',
                border: '1px solid',
                padding: '2px 6px',
                textTransform: 'uppercase',
              }}
            >
              {company.status}
            </span>
            <span
              className="font-data"
              style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
            >
              Founded {company.founded}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1
              className="font-head"
              style={{ fontSize: 36, fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {company.name}
            </h1>
            <WatchlistButton companySlug={company.slug} companyName={company.name} />
          </div>

          <div
            className="font-data"
            style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 20, flexWrap: 'wrap' }}
          >
            <span>HQ: {company.hq}</span>
            <span>CEO: {company.ceo}</span>
            {company.headcount && <span>Headcount: {company.headcount}</span>}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="data-pos"
              >
                {company.website.replace(/^https?:\/\//, '')} ↗
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
          {/* Main */}
          <div>
            {/* Funding metrics */}
            {(company.totalFunding || company.latestValuation) && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 16 }}>Funding Summary</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {company.totalFunding && (
                    <div className="metric-block" style={{ flex: '1 1 140px', marginBottom: 0 }}>
                      <div className="metric-label">Total Funding</div>
                      <div className="metric-value">{company.totalFunding}</div>
                    </div>
                  )}
                  {company.latestValuation && (
                    <div className="metric-block" style={{ flex: '1 1 140px', marginBottom: 0 }}>
                      <div className="metric-label">Latest Valuation</div>
                      <div className="metric-value">{company.latestValuation}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>About</div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {company.description}
              </p>
            </div>

            {/* Products / robots */}
            {companyRobots.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 16 }}>Products</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {companyRobots.map((robot) => (
                    <Link
                      key={robot.slug}
                      href={`/robots/${robot.slug}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div
                        className="product-card"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          padding: 14,
                          transition: 'border-color 0.15s, background-color 0.15s',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: 'var(--text-primary)',
                            marginBottom: 6,
                          }}
                        >
                          {robot.name}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span
                            className="font-data"
                            style={{
                              fontSize: 10,
                              color: ['commercial', 'pilot', 'production'].includes(robot.status)
                                ? 'var(--accent-positive)'
                                : 'var(--text-tertiary)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {robot.status}
                          </span>
                          {robot.payload && (
                            <span
                              className="font-data"
                              style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
                            >
                              {robot.payload} payload
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                          {robot.description.slice(0, 80)}…
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products list fallback if no robots in DB */}
            {companyRobots.length === 0 && company.products.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="panel-title" style={{ marginBottom: 12 }}>Products</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {company.products.map((p) => (
                    <span key={p} className="tag">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent developments placeholder */}
            <div style={{ marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>Recent Developments</div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                }}
              >
                Recent developments are auto-populated from tagged articles in the Newsfeed.{' '}
                <Link href="/news" className="data-pos">
                  Browse all news →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div className="panel-title" style={{ marginBottom: 12 }}>Quick Facts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(
                  [
                    { label: 'Founded', value: String(company.founded) },
                    { label: 'Headquarters', value: company.hq },
                    { label: 'CEO', value: company.ceo },
                    company.headcount ? { label: 'Team Size', value: company.headcount } : null,
                    { label: 'Status', value: company.status },
                  ] as ({ label: string; value: string } | null)[]
                )
                  .filter((f): f is { label: string; value: string } => f !== null)
                  .map((fact) => (
                      <div
                        key={fact.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingBottom: 8,
                        }}
                      >
                        <span className="font-data" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: 10 }}>
                          {fact.label}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {fact.value}
                        </span>
                      </div>
                  ))}
              </div>
            </div>

            <Link
              href="/companies"
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
              ← All Companies
            </Link>

            <Link
              href="/funding"
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
              Funding Dashboard →
            </Link>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  )
}
