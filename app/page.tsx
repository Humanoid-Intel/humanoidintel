import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { NewsletterForm } from '@/components/NewsletterForm'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { FAQAccordion } from '@/components/FAQAccordion'
import { getArticles, getFeaturedArticle, getRobots, getFundingRounds } from '@/lib/content'
import { generateFAQSchema } from '@/lib/seo'
import type { Article, Robot } from '@/lib/types'
import CapitalFlowChart from '@/components/CapitalFlowChart'
import type { FlowBar } from '@/components/CapitalFlowChart'

// ── Homepage FAQ — SEO/GEO signals for AI answer engines ────────────────────
const HOME_FAQS = [
  {
    q: 'What is humanoidintel.ai?',
    a: 'humanoidintel.ai is the leading intelligence platform for the humanoid robotics industry — a Bloomberg Terminal-style dashboard covering funding rounds, robot specifications, market data, research papers, and breaking news across every major humanoid and bipedal robot company globally. It is updated hourly by an autonomous AI agent.',
  },
  {
    q: 'Which humanoid robot companies does humanoidintel.ai track?',
    a: 'humanoidintel.ai tracks all major humanoid robot manufacturers and AI brain companies including Figure AI, Tesla Optimus, Agility Robotics, Boston Dynamics Atlas, Unitree, Apptronik, Sanctuary AI, 1X Technologies, NEURA Robotics, Fourier Intelligence, Agibot, Kepler, UBTech, Galbot, Physical Intelligence, Skild AI, and dozens more across the US, China, Europe, and South Korea.',
  },
  {
    q: 'Which humanoid robots are commercially available in 2026?',
    a: 'As of 2026, commercially available or pilot-deployed humanoid robots include Tesla Optimus Gen 2 (8,000+ units in internal manufacturing), Unitree H1/G1 (3,200+ units in research and commercial use), Agility Robotics Digit v4 (400+ units in Amazon warehouses), Figure AI Figure 02/03 (deployed at BMW), and UBTECH Walker X (600+ units in service roles). Most others are in late-stage development or limited pilot programs.',
  },
  {
    q: 'How much has been invested in humanoid robotics?',
    a: 'The humanoid robotics sector has attracted over $10 billion in venture and strategic investment through early 2026. Major rounds include Physical Intelligence ($600M Series B), Skild AI ($1.4B Series C), Figure AI ($675M Series B), and Agility Robotics ($150M from Amazon). 2026 year-to-date sector funding already exceeds $3.6 billion.',
  },
  {
    q: 'What is physical AI?',
    a: 'Physical AI refers to artificial intelligence systems that operate in and interact with the physical world — as opposed to purely digital AI. In the context of humanoid robotics, physical AI encompasses vision-language-action (VLA) models, foundation models for robot control, sim-to-real transfer techniques, and whole-body locomotion and manipulation systems. Companies like Physical Intelligence, Skild AI, and Nvidia GR00T are building foundational physical AI platforms.',
  },
  {
    q: 'What is a VLA model in robotics?',
    a: 'A Vision-Language-Action (VLA) model is a type of AI foundation model that processes visual input (camera feeds), understands natural language instructions, and outputs robot control actions. VLA models allow robots to be instructed in plain language and generalize to new tasks without reprogramming. Leading VLA models include Nvidia GR00T N1, Physical Intelligence π0, Skild AI\'s generalist robot brain, and Google DeepMind\'s RT-2.',
  },
  {
    q: 'How often is data on humanoidintel.ai updated?',
    a: 'humanoidintel.ai\'s news feed is updated hourly by an autonomous AI agent that scans hundreds of RSS feeds and news sources. The robot database, funding tracker, and company directory are updated regularly as new data becomes available. The site deploys automatically to Cloudflare\'s global edge network on every update.',
  },
  {
    q: 'What is the difference between a humanoid robot and other types of robots?',
    a: 'Humanoid robots have a bipedal, human-like form — two legs, two arms, and typically a head — designed to operate in human environments and use tools made for humans. This distinguishes them from industrial robotic arms (fixed, single-limb), quadruped robots (four-legged like Boston Dynamics Spot), autonomous mobile robots (AMRs, which move on wheels), and surgical robots. humanoidintel.ai covers only humanoid and bipedal robots, plus the AI software stack powering them.',
  },
]

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
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
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/New_York',
    })
    return `${time} ET`
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

// ── Deployed robots tracker data ─────────────────────────────────────────────
const DEPLOYED_ROBOTS = [
  { company: 'Tesla',          robot: 'Optimus Gen 2', units: 8000, type: 'Internal Mfg',    trend: true,  note: 'Giga TX + Shanghai' },
  { company: 'Unitree',        robot: 'H1 / G1',       units: 3200, type: 'Research / Comm', trend: true,  note: '120+ institutions' },
  { company: 'Agility',        robot: 'Digit v4',      units: 400,  type: 'Warehouse',        trend: true,  note: 'Amazon fulfillment' },
  { company: 'UBTECH',         robot: 'Walker X',      units: 600,  type: 'Service',          trend: true,  note: 'Hotels, banks, retail' },
  { company: 'Kepler',         robot: 'Forerunner',    units: 280,  type: 'Factory',          trend: true,  note: 'Auto / electronics' },
  { company: 'Tiangong / BHRIC', robot: 'Tiangong',   units: 250,  type: 'State Mfg',        trend: true,  note: 'Beijing SOEs' },
  { company: 'Figure AI',      robot: 'Figure 02/03', units: 150,  type: 'Factory',          trend: true,  note: 'BMW Spartanburg' },
  { company: 'Fourier',        robot: 'GR-1 / GR2',   units: 120,  type: 'Research / Care',  trend: true,  note: 'Labs + eldercare' },
  { company: '1X Technologies',robot: 'NEO Beta',      units: 60,   type: 'Home Trial',       trend: true,  note: 'Early-access households' },
  { company: 'Sanctuary AI',   robot: 'Phoenix',       units: 25,   type: 'Retail RaaS',      trend: true,  note: 'Canadian Tire' },
]

// ── Race timeline data ────────────────────────────────────────────────────────
const RACE_TIMELINE = [
  { company: 'Tesla',       robot: 'Optimus',     target: '50k units',     date: 'EOY 2026',  color: 'var(--accent-positive)', prog: 95 },
  { company: 'Unitree',     robot: 'H1/G1',       target: '5k+ units',     date: 'Q2 2026',   color: '#60a5fa', prog: 88 },
  { company: 'Figure AI',   robot: 'Figure 03',   target: '1,000 units',   date: 'Q3 2026',   color: 'var(--accent-positive)', prog: 72 },
  { company: 'Apptronik',   robot: 'Apollo',      target: '500 units',     date: 'Q2 2026',   color: '#a78bfa', prog: 70 },
  { company: 'Kepler',      robot: 'Forerunner',  target: '1,000 units',   date: 'H2 2026',   color: '#f59e0b', prog: 62 },
  { company: 'NEURA',       robot: '4NE-1 / MAiRA', target: '1,000 units', date: 'H2 2026',   color: '#f59e0b', prog: 58 },
  { company: 'Galbot',      robot: 'G1',          target: '500 units',     date: 'H2 2026',   color: '#60a5fa', prog: 48 },
  { company: 'Agility',     robot: 'Digit v5',    target: 'Scale Amazon',  date: '2026',      color: 'var(--accent-positive)', prog: 65 },
  { company: 'Sunday',      robot: 'Home',        target: 'Consumer launch','date': 'Q1 2027', color: '#f472b6', prog: 35 },
  { company: 'Boston Dyn.', robot: 'Atlas',       target: 'Commercial beta','date': '2027',   color: '#94a3b8', prog: 25 },
]

// ── Research papers preview — most recent 5 ───────────────────────────────────
const RECENT_PAPERS = [
  {
    id: 'psi0-2026',
    title: 'Ψ₀: An Open Foundation Model Towards Universal Humanoid Loco-Manipulation',
    institution: 'USC / Shanghai AI Lab',
    date: '2026-03-12',
    category: 'VLA Models',
    url: 'https://arxiv.org/abs/2603.12263',
  },
  {
    id: 'spark-2026',
    title: 'SPARK: Skeleton-Parameter Aligned Retargeting on Humanoid Robots',
    institution: 'UC Berkeley',
    date: '2026-03-11',
    category: 'Sim-to-Real',
    url: 'https://arxiv.org/abs/2603.11480',
  },
  {
    id: 'zerowbc-2026',
    title: 'ZeroWBC: Learning Natural Visuomotor Humanoid Control from Human Egocentric Video',
    institution: 'Shanghai AI Lab',
    date: '2026-03-10',
    category: 'VLA Models',
    url: 'https://arxiv.org/abs/2603.09170',
  },
  {
    id: 'ultra-2026',
    title: 'ULTRA: Unified Multimodal Control for Autonomous Humanoid Loco-Manipulation',
    institution: 'UIUC',
    date: '2026-03-03',
    category: 'Locomotion',
    url: 'https://arxiv.org/abs/2603.03279',
  },
  {
    id: 'humi-2026',
    title: 'HuMI: Humanoid Whole-Body Manipulation from Robot-Free Demonstrations',
    institution: 'Peking University / BIGAI',
    date: '2026-02-06',
    category: 'Manipulation',
    url: 'https://arxiv.org/abs/2602.06643',
  },
]

// ── Capital flows — real data from funding-rounds.json ────────────────────────
function buildCapitalFlowBars(): FlowBar[] {
  const NUM_WEEKS = 12
  const today = new Date('2026-03-16')

  let rounds: Array<{ date: string; amount: string; company?: string; round?: string }> = []
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'content/data/funding-rounds.json'),
      'utf-8'
    )
    rounds = JSON.parse(raw)
  } catch { /* fallback below */ }

  function parseM(amt: string): number {
    if (!amt || amt === 'N/A') return 0
    const paren = amt.match(/\(~?\$([0-9.]+[BMbm]?)\)/)
    if (paren) {
      const n = parseFloat(paren[1]); if (isNaN(n)) return 0
      return paren[1].toUpperCase().includes('B') ? n * 1000 : n
    }
    const stripped = amt.replace(/[^0-9.BMKbmk]/g, '')
    const n = parseFloat(stripped); if (isNaN(n)) return 0
    const u = amt.toUpperCase()
    if (u.includes('B')) return n * 1000
    if (u.includes('K')) return n / 1000
    return n
  }

  function fmtWeekLabel(weekIdx: number): string {
    // weekIdx 0 = oldest week, NUM_WEEKS-1 = most recent
    const weeksAgo = NUM_WEEKS - 1 - weekIdx
    const startMs = today.getTime() - (weeksAgo + 1) * 7 * 24 * 60 * 60 * 1000
    const endMs   = today.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(new Date(startMs))} – ${fmt(new Date(endMs))}`
  }

  // Bucket rounds into weekly bins (week 0 = oldest, week 11 = most recent)
  const weeklyAmounts = Array<number>(NUM_WEEKS).fill(0)
  const weeklyRounds: Array<Array<{ company: string; amount: string; round: string }>> =
    Array.from({ length: NUM_WEEKS }, () => [])

  for (const r of rounds) {
    if (!r.date) continue
    const d = new Date(r.date)
    const ageDays = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (ageDays < 0 || ageDays > NUM_WEEKS * 7) continue
    const weekIdx = NUM_WEEKS - 1 - Math.floor(ageDays / 7)
    if (weekIdx >= 0 && weekIdx < NUM_WEEKS) {
      weeklyAmounts[weekIdx] += parseM(r.amount)
      weeklyRounds[weekIdx].push({
        company: r.company ?? 'Unknown',
        amount: r.amount ?? '—',
        round: r.round ?? '',
      })
    }
  }

  const maxAmount = Math.max(...weeklyAmounts, 1)

  return weeklyAmounts.map((amountM, i) => {
    if (amountM > 0) {
      const h = Math.max(12, Math.round((amountM / maxAmount) * 85))
      const label = amountM >= 1000 ? `$${(amountM/1000).toFixed(1)}B` : `$${Math.round(amountM)}M`
      return { h, pos: true, amountM, label, weekLabel: fmtWeekLabel(i), rounds: weeklyRounds[i] }
    }
    // Quiet week — small negative bar
    return { h: 8, pos: false, amountM: 0, label: '—', weekLabel: fmtWeekLabel(i), rounds: [] }
  })
}

// Total 2026 YTD funding
function get2026YTDFunding(): string {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'content/data/funding-rounds.json'), 'utf-8'
    )
    const rounds: any[] = JSON.parse(raw)
    function parseM(amt: string): number {
      if (!amt || amt === 'N/A') return 0
      const paren = amt.match(/\(~?\$([0-9.]+[BMbm]?)\)/)
      if (paren) { const n = parseFloat(paren[1]); return paren[1].toUpperCase().includes('B') ? n * 1000 : n }
      const stripped = amt.replace(/[^0-9.BMKbmk]/g, '')
      const n = parseFloat(stripped); if (isNaN(n)) return 0
      const u = amt.toUpperCase()
      if (u.includes('B')) return n * 1000; if (u.includes('K')) return n / 1000; return n
    }
    const totalM = rounds.filter(r => r.date?.startsWith('2026')).reduce((s, r) => s + parseM(r.amount), 0)
    return totalM >= 1000 ? `$${(totalM/1000).toFixed(1)}B` : `$${Math.round(totalM)}M`
  } catch { return '$3.6B' }
}

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

  const capitalFlowBars = buildCapitalFlowBars()
  const ytdFunding = get2026YTDFunding()
  const totalDeployed = DEPLOYED_ROBOTS.reduce((s, r) => s + r.units, 0)

  const allRounds = getFundingRounds()
  const recentRounds = [...allRounds]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const homeFaqSchema = generateFAQSchema(HOME_FAQS)

  return (
    <>
      <SchemaMarkup schema={homeFaqSchema} />
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
                <span>{formatDate(featured.date)}</span>
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

          {/* Capital Flows // Recent Rounds panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Capital Flows // Recent Rounds</span>
              <Link
                href="/funding"
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-secondary)' }}
              >
                Full Dashboard →
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                className="font-data"
                style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}
              >
                <thead>
                  <tr>
                    {['Company', 'Round', 'Amount', 'Lead Investor', 'Date'].map((col) => (
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
                  {recentRounds.map((r) => (
                    <tr
                      key={r.id}
                      className="robot-row"
                      style={{ cursor: 'pointer', transition: 'background-color 0.1s' }}
                    >
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 11,
                          paddingBottom: 11,
                          paddingRight: 16,
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Link href={`/companies/${r.companySlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {r.company}
                        </Link>
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 11,
                          paddingBottom: 11,
                          paddingRight: 16,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {r.round}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 11,
                          paddingBottom: 11,
                          paddingRight: 16,
                          whiteSpace: 'nowrap',
                        }}
                        className="data-pos"
                      >
                        {r.amount}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 11,
                          paddingBottom: 11,
                          paddingRight: 16,
                          color: 'var(--text-tertiary)',
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {r.leadInvestors?.[0] ?? '—'}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingTop: 11,
                          paddingBottom: 11,
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDate(r.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* YTD summary bar */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span className="font-data" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                2026 YTD sector total
              </span>
              <span className="data-pos font-data" style={{ fontSize: 13, fontWeight: 600 }}>
                {ytdFunding}
              </span>
            </div>
          </div>

          {/* Research Hub panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Research Hub // Latest Papers</span>
              <Link
                href="/research"
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-secondary)' }}
              >
                Full Hub →
              </Link>
            </div>

            <div>
              {RECENT_PAPERS.map((paper) => (
                <a
                  key={paper.id}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
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
                      {formatDate(paper.date)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className="tag" style={{ alignSelf: 'flex-start' }}>
                        {paper.category.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {paper.title}
                      </span>
                      <span
                        className="font-data"
                        style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
                      >
                        {paper.institution}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* FAQ panel — inside left column, after Research Hub */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">FAQ</span>
              <span className="font-data" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                // humanoid robotics intelligence
              </span>
            </div>
            <FAQAccordion faqs={HOME_FAQS} />
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
              <div className="metric-value">{ytdFunding}</div>
              <div className="data-pos font-data" style={{ fontSize: 12, marginTop: 4 }}>
                <Link href="/funding" style={{ color: 'inherit', textDecoration: 'none' }}>
                  View all rounds →
                </Link>
              </div>
            </div>

            {/* Capital flows chart */}
            <div
              className="font-data"
              style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}
            >
              Capital Flows — Trailing 12 Weeks
            </div>
            <CapitalFlowChart bars={capitalFlowBars} />
          </div>

          {/* Deployed Robots Tracker */}
          <div className="panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-header">
              <span className="panel-title">Deployed Robots // Real Work</span>
              <span className="font-data" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                ~{totalDeployed.toLocaleString()} total
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {DEPLOYED_ROBOTS.map((r, i) => {
                const barPct = Math.round((r.units / DEPLOYED_ROBOTS[0].units) * 100)
                return (
                  <div
                    key={r.company + r.robot}
                    className="font-data"
                    style={{
                      paddingTop: 9,
                      paddingBottom: 9,
                      borderBottom: i < DEPLOYED_ROBOTS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{r.company}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 5 }}>{r.robot}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{r.type}</span>
                        <span className="data-pos" style={{ fontSize: 12, minWidth: 44, textAlign: 'right' }}>
                          {r.units >= 1000 ? `${(r.units/1000).toFixed(1)}k` : r.units}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 2, backgroundColor: 'var(--border-subtle)', borderRadius: 1 }}>
                      <div style={{
                        height: '100%',
                        width: `${barPct}%`,
                        backgroundColor: 'var(--accent-positive)',
                        opacity: 0.7,
                        borderRadius: 1,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>{r.note}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deployment Race Timeline */}
          <div className="panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-header">
              <span className="panel-title">Deployment Race // 2026</span>
              <span className="font-data" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                communicated targets
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {RACE_TIMELINE.map((item, i) => (
                <div
                  key={item.company}
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderBottom: i < RACE_TIMELINE.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.company}
                      </span>
                      <span className="font-data" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                        {item.robot}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="font-data" style={{ fontSize: 10, color: item.color }}>
                        {item.date}
                      </span>
                      <span
                        className="font-data"
                        style={{
                          fontSize: 10,
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          padding: '1px 5px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.target}
                      </span>
                    </div>
                  </div>
                  {/* Race bar */}
                  <div style={{ height: 3, backgroundColor: 'var(--border-subtle)', borderRadius: 2 }}>
                    <div style={{
                      height: '100%',
                      width: `${item.prog}%`,
                      backgroundColor: item.color,
                      borderRadius: 2,
                      opacity: 0.85,
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="font-data"
              style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 8 }}
            >
              Bar = readiness progress based on public announcements. Not financial advice.
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
              The go-to feed for robotics engineers, VCs, and founders
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
