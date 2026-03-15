import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { NewsletterForm } from '@/components/NewsletterForm'
import { getArticles, getFeaturedArticle, getRobots } from '@/lib/content'
import type { Article, Robot } from '@/lib/types'

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    breaking: 'BREAKING',
    'deep-dive': 'DEEP DIVE',
    market: 'MARKET',
    policy: 'POLICY',
    research: 'RESEARCH',
  }
  return map[cat] ?? cat.toUpperCase()
}

function statusClass(status: string) {
  return ['commercial', 'pilot', 'production'].includes(status) ? 'data-pos' : 'data-neg'
}

// ── capital-flows bar data (22 bars, trailing 12 weeks) ────────────────────

const capitalFlowBars = [
  { h: 38, pos: true },
  { h: 52, pos: true },
  { h: 29, pos: false },
  { h: 45, pos: true },
  { h: 61, pos: true },
  { h: 18, pos: false },
  { h: 55, pos: true },
  { h: 40, pos: true },
  { h: 33, pos: false },
  { h: 70, pos: true },
  { h: 25, pos: false },
  { h: 48, pos: true },
  { h: 58, pos: true },
  { h: 22, pos: false },
  { h: 65, pos: true },
  { h: 42, pos: true },
  { h: 30, pos: false },
  { h: 74, pos: true },
  { h: 50, pos: true },
  { h: 28, pos: false },
  { h: 80, pos: true },
  { h: 68, pos: true },
]

// ── placeholder data ────────────────────────────────────────────────────────

const placeholderFeatured: Article = {
  slug: 'humanoid-robotics-intelligence-platform-launch',
  title: 'humanoidintel.ai Launches: The Definitive Intelligence Platform for Humanoid Robotics',
  date: '2026-03-15',
  category: 'breaking',
  tags: ['launch', 'humanoid', 'robotics'],
  excerpt:
    'A new era of humanoid robotics intelligence begins. Track every robot, every funding round, and every breakthrough from one terminal.',
  featured: true,
}

const placeholderArticles: Article[] = [
  {
    slug: 'figure-03-bmw-expansion',
    title: 'Figure 03 BMW Contract Expands to 5 Plants as Commercial Deployment Accelerates',
    date: '2026-03-14T09:00:00Z',
    category: 'market',
    tags: ['Figure AI', 'BMW'],
    excerpt: '',
  },
  {
    slug: 'tesla-optimus-q1-production',
    title: 'Tesla Optimus Hits 8,000 Units in Q1 2026, On Track for 50k Annual Target',
    date: '2026-03-13T14:30:00Z',
    category: 'market',
    tags: ['Tesla', 'Optimus'],
    excerpt: '',
  },
  {
    slug: 'sanctuary-series-c-250m',
    title: 'Sanctuary AI Raises $250M Series C Led by SoftBank at $1.8B Valuation',
    date: '2026-03-12T11:00:00Z',
    category: 'breaking',
    tags: ['Sanctuary AI', 'funding'],
    excerpt: '',
  },
  {
    slug: 'unitree-h1-china-deployment',
    title: 'Unitree H1 Crosses 10,000 Unit Milestone with Major China Manufacturing Contracts',
    date: '2026-03-11T08:00:00Z',
    category: 'market',
    tags: ['Unitree', 'China'],
    excerpt: '',
  },
  {
    slug: 'vla-model-benchmarks-2026',
    title: 'New VLA Model Benchmarks Reveal 3x Improvement in Dexterous Manipulation Tasks',
    date: '2026-03-10T16:00:00Z',
    category: 'research',
    tags: ['VLA', 'AI', 'manipulation'],
    excerpt: '',
  },
  {
    slug: 'eu-robotics-regulation-framework',
    title: 'EU Proposes First Comprehensive Humanoid Robotics Regulatory Framework for 2027',
    date: '2026-03-09T10:00:00Z',
    category: 'policy',
    tags: ['EU', 'regulation', 'policy'],
    excerpt: '',
  },
]

const placeholderRobots: Robot[] = [
  {
    slug: 'figure-03',
    name: 'Figure 03',
    manufacturer: 'Figure AI',
    country: 'USA',
    status: 'commercial',
    height: '1.70m',
    weight: '60kg',
    dof: 44,
    payload: '20kg',
    battery: '5hrs',
    actuatorType: 'Electric',
    description: '',
  },
  {
    slug: 'optimus-gen3',
    name: 'Optimus Gen 3',
    manufacturer: 'Tesla',
    country: 'USA',
    status: 'pilot',
    height: '1.73m',
    weight: '57kg',
    dof: 40,
    payload: '20kg',
    battery: '8hrs',
    actuatorType: 'Electric',
    description: '',
  },
  {
    slug: 'atlas-hd',
    name: 'Atlas HD',
    manufacturer: 'Boston Dynamics',
    country: 'USA',
    status: 'commercial',
    height: '1.80m',
    weight: '89kg',
    dof: 28,
    payload: '25kg',
    battery: '4hrs',
    actuatorType: 'Hydraulic/Electric',
    description: '',
  },
  {
    slug: 'digit-v5',
    name: 'Digit V5',
    manufacturer: 'Agility Robotics',
    country: 'USA',
    status: 'pilot',
    height: '1.75m',
    weight: '65kg',
    dof: 32,
    payload: '16kg',
    battery: '4hrs',
    actuatorType: 'Electric',
    description: '',
  },
  {
    slug: 'unitree-h1',
    name: 'H1',
    manufacturer: 'Unitree',
    country: 'China',
    status: 'commercial',
    height: '1.80m',
    weight: '47kg',
    dof: 27,
    payload: '30kg',
    battery: '3.5hrs',
    actuatorType: 'Electric',
    description: '',
  },
]

// ── page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const allArticles = getArticles()
  const featuredFromCMS = getFeaturedArticle()
  const robotsFromCMS = getRobots()

  const featured =
    featuredFromCMS ?? (allArticles.length > 0 ? allArticles[0] : placeholderFeatured)
  const latestArticles =
    allArticles.length > 0
      ? allArticles.filter((a) => a.slug !== featured.slug).slice(0, 6)
      : placeholderArticles

  const robots =
    robotsFromCMS.length > 0
      ? robotsFromCMS
          .filter((r) => ['commercial', 'pilot', 'production'].includes(r.status))
          .slice(0, 5)
      : placeholderRobots

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <style>{`
        .hero-panel:hover { background-color: var(--bg-hover) !important; }
        .news-row:hover { background-color: var(--bg-hover); }
        .robot-row:hover { background-color: var(--bg-hover); }
      `}</style>

      <Header />
      <TickerTape />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]" style={{ minHeight: '100vh' }}>

        {/* ── LEFT COLUMN ──────────────────────────────────────────────────── */}
        <div style={{ borderRight: '1px solid var(--border-subtle)' }}>

          {/* Hero panel */}
          <Link href={`/news/${featured.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
            <div
              className="hero-panel"
              style={{
                borderTop: '2px solid var(--accent-positive)',
                backgroundColor: 'var(--bg-surface)',
                padding: '20px 20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              <div
                className="font-data"
                style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  marginBottom: 10,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span>TOP STORY</span>
                <span style={{ color: 'var(--border-strong)' }}>//</span>
                <span>{today}</span>
                <span style={{ color: 'var(--border-strong)' }}>//</span>
                <span>By humanoidintel.ai</span>
                <span className="tag" style={{ marginLeft: 4 }}>
                  {categoryLabel(featured.category)}
                </span>
              </div>

              <h1
                className="hero-headline"
                style={{ marginBottom: 12, color: 'var(--text-primary)' }}
              >
                {featured.title}
              </h1>

              {featured.excerpt && (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    maxWidth: '80%',
                  }}
                >
                  {featured.excerpt}
                </p>
              )}
            </div>
          </Link>

          {/* Latest Developments panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Latest Developments</span>
              <Link
                href="/news"
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-secondary)' }}
              >
                View All Archive →
              </Link>
            </div>

            <div>
              {latestArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  <div
                    className="news-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr',
                      gap: 16,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <div
                      className="font-data"
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        paddingTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {formatDate(article.date)}
                      {formatTime(article.date) && (
                        <>
                          <br />
                          {formatTime(article.date)}
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className="tag" style={{ alignSelf: 'flex-start' }}>
                        {categoryLabel(article.category)}
                      </span>
                      <span
                        className="news-title"
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {article.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Robot Database snippet panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Robot Database // Commercial Bipeds</span>
              <Link
                href="/robots"
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-secondary)' }}
              >
                Full Database →
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                className="font-data"
                style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}
              >
                <thead>
                  <tr>
                    {[
                      'Model',
                      'Manufacturer',
                      'Payload (kg)',
                      'Battery (hrs)',
                      'Actuation',
                      'Status',
                    ].map((col) => (
                      <th
                        key={col}
                        style={{
                          textAlign: 'left',
                          color: 'var(--text-secondary)',
                          fontWeight: 'normal',
                          borderBottom: '1px solid var(--border-strong)',
                          paddingBottom: 8,
                          paddingRight: 16,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {robots.map((robot) => (
                    <tr
                      key={robot.slug}
                      className="robot-row"
                      style={{ cursor: 'pointer', transition: 'background-color 0.1s' }}
                    >
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 12,
                          paddingBottom: 12,
                          paddingRight: 16,
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                        }}
                      >
                        <Link href={`/robots/${robot.slug}`} style={{ color: 'inherit' }}>
                          {robot.name}
                        </Link>
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 12,
                          paddingBottom: 12,
                          paddingRight: 16,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {robot.manufacturer}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 12,
                          paddingBottom: 12,
                          paddingRight: 16,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {robot.payload ?? '—'}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 12,
                          paddingBottom: 12,
                          paddingRight: 16,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {robot.battery ?? '—'}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 12,
                          paddingBottom: 12,
                          paddingRight: 16,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {robot.actuatorType}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 12,
                          paddingBottom: 12,
                        }}
                        className={statusClass(robot.status)}
                      >
                        {robot.status.toUpperCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
        <div>

          {/* Market Pulse panel */}
          <div className="panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-header">
              <span className="panel-title">Market Pulse</span>
            </div>

            {/* Metric block */}
            <div className="metric-block">
              <div className="metric-label">Total Sector Funding (2026 YTD)</div>
              <div className="metric-value">$4.2B</div>
              <div className="data-pos font-data" style={{ fontSize: 12, marginTop: 4 }}>
                +12.3% QoQ
              </div>
            </div>

            {/* Capital flows chart */}
            <div
              className="font-data"
              style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}
            >
              Capital Flows — Trailing 12 Weeks
            </div>
            <div
              style={{
                position: 'relative',
                height: 140,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Grid lines */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${(i / 3) * 100}%`,
                    height: 1,
                    backgroundColor: 'var(--border-subtle)',
                    opacity: 0.5,
                  }}
                />
              ))}
              {/* Zero line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: 1,
                  backgroundColor: 'var(--text-tertiary)',
                }}
              />
              {/* Bars */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '0 2px',
                }}
              >
                {capitalFlowBars.map((bar, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    {bar.pos ? (
                      <>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                          <div
                            style={{
                              width: '100%',
                              height: `${bar.h}%`,
                              backgroundColor: 'var(--accent-positive)',
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <div style={{ height: '50%' }} />
                      </>
                    ) : (
                      <>
                        <div style={{ height: '50%' }} />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: '100%',
                              height: `${bar.h}%`,
                              backgroundColor: 'var(--accent-negative)',
                              opacity: 0.8,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="font-data"
              style={{
                fontSize: 10,
                color: 'var(--text-tertiary)',
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 4,
              }}
            >
              <span>12w ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Adjacent Tech Indexes panel */}
          <div className="panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-header">
              <span className="panel-title">Adjacent Tech Indexes</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Global Robotics ETF (ROBO)', value: '+1.24%', pos: true },
                { label: 'AI Compute Index', value: '+3.45%', pos: true },
                { label: 'Lithium Futures', value: '-0.82%', pos: false },
                { label: 'Actuator Mfg Index', value: '+0.15%', pos: true },
                { label: 'NVIDIA (NVDA)', value: '+2.87%', pos: true },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className="font-data"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderBottom:
                      i < arr.length - 1 ? '1px dashed var(--border-subtle)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className={item.pos ? 'data-pos' : 'data-neg'}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Catalysts panel */}
          <div className="panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-header">
              <span className="panel-title">Upcoming Catalysts</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  name: 'ICRA 2026 Conference',
                  date: 'May 19, 2026',
                  desc: 'Key locomotion + manipulation paper releases expected',
                },
                {
                  name: 'Figure 03 Commercial Launch',
                  date: 'Q2 2026',
                  desc: 'BMW contract expansion to 5 plants',
                },
                {
                  name: 'Tesla Q1 2026 Earnings',
                  date: 'Apr 22, 2026',
                  desc: 'Optimus production update expected',
                },
                {
                  name: 'humanoidintel.ai Summit',
                  date: 'Jun 10, 2026',
                  desc: 'First annual humanoid robotics intelligence summit',
                },
              ].map((event) => (
                <div key={event.name}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      marginBottom: 2,
                    }}
                  >
                    {event.name}
                  </div>
                  <div
                    className="font-data"
                    style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}
                  >
                    {event.date}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                    {event.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter CTA panel */}
          <div className="panel">
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--text-primary)',
                marginBottom: 10,
                lineHeight: 1.4,
              }}
            >
              Join 12,400+ robotics engineers, VCs, and founders
            </div>

            <NewsletterForm label="Subscribe" />

            <p
              className="font-data"
              style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}
            >
              Weekly intelligence. No spam.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
