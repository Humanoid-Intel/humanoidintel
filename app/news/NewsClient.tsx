'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { Article } from '@/lib/types'

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Breaking', value: 'breaking' },
  { label: 'Deep Dives', value: 'deep-dive' },
  { label: 'Market', value: 'market' },
  { label: 'Policy', value: 'policy' },
  { label: 'Research', value: 'research' },
] as const

const PAGE_SIZE = 20

const PLACEHOLDER_ARTICLES: Article[] = [
  {
    slug: 'figure-03-bmw-expansion',
    title: 'Figure 03 BMW Contract Expands to 5 Plants as Commercial Deployment Accelerates',
    date: '2026-03-14',
    category: 'market',
    tags: ['Figure AI', 'BMW'],
    excerpt:
      "Figure AI's commercial partnership with BMW deepens, extending the Figure 03 deployment from two to five manufacturing plants across Germany.",
  },
  {
    slug: 'tesla-optimus-q1-production',
    title: 'Tesla Optimus Hits 8,000 Units in Q1 2026, On Track for 50k Annual Target',
    date: '2026-03-13',
    category: 'market',
    tags: ['Tesla', 'Optimus'],
    excerpt:
      'Tesla reports record Optimus production throughput in Q1 2026, with Fremont Factory now producing 400 units per week.',
  },
  {
    slug: 'sanctuary-series-c-250m',
    title: 'Sanctuary AI Raises $250M Series C Led by SoftBank at $1.8B Valuation',
    date: '2026-03-12',
    category: 'breaking',
    tags: ['Sanctuary AI', 'funding', 'SoftBank'],
    excerpt:
      'Sanctuary AI closes its largest financing round to date, valuing the Canadian robotics company at $1.8B ahead of a planned 2027 IPO.',
  },
  {
    slug: 'unitree-h1-china-deployment',
    title: 'Unitree H1 Crosses 10,000 Unit Milestone with Major China Manufacturing Contracts',
    date: '2026-03-11',
    category: 'market',
    tags: ['Unitree', 'China'],
    excerpt:
      'Unitree Robotics confirms the H1 bipedal robot has shipped over 10,000 units, primarily to automotive and electronics manufacturers in southern China.',
  },
  {
    slug: 'vla-model-benchmarks-2026',
    title: 'New VLA Model Benchmarks Reveal 3× Improvement in Dexterous Manipulation Tasks',
    date: '2026-03-10',
    category: 'research',
    tags: ['VLA', 'AI', 'manipulation'],
    excerpt:
      'A comprehensive benchmark study published by Stanford and MIT shows vision-language-action models have improved manipulation success rates by 3× year-over-year.',
  },
  {
    slug: 'eu-robotics-regulation-framework',
    title: 'EU Proposes First Comprehensive Humanoid Robotics Regulatory Framework for 2027',
    date: '2026-03-09',
    category: 'policy',
    tags: ['EU', 'regulation', 'policy'],
    excerpt:
      'The European Commission has released a draft regulatory framework for humanoid robots, requiring certification for any robot operating in public spaces.',
  },
  {
    slug: 'boston-dynamics-atlas-gen4',
    title: 'Boston Dynamics Unveils Atlas Gen 4: Fully Electric, 28 DOF, 200kg Lift Capacity',
    date: '2026-03-08',
    category: 'breaking',
    tags: ['Boston Dynamics', 'Atlas'],
    excerpt:
      'Boston Dynamics announced the fourth generation Atlas platform, featuring a fully electric actuator stack and dramatic improvements in manipulation payload.',
  },
  {
    slug: 'deep-dive-sim-to-real-2026',
    title: 'Sim-to-Real Transfer in 2026: How Isaac Lab is Closing the Reality Gap',
    date: '2026-03-07',
    category: 'deep-dive',
    tags: ['sim-to-real', 'NVIDIA', 'Isaac Lab'],
    excerpt:
      'A deep technical analysis of NVIDIA Isaac Lab and how it enables humanoid robots to transfer learned behaviors from simulation to the physical world with under 5% performance degradation.',
  },
]

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

interface Props {
  articles: Article[]
}

export default function NewsClient({ articles }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [page, setPage] = useState(1)

  const source = articles.length > 0 ? articles : PLACEHOLDER_ARTICLES

  const filtered =
    activeCategory === 'all'
      ? source
      : source.filter((a) => a.category === activeCategory)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = page < totalPages

  function handleTabChange(cat: string) {
    setActiveCategory(cat)
    setPage(1)
  }

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ maxWidth: 900, padding: '0 16px' }}>
        {/* Page heading */}
        <div
          style={{
            padding: '20px 0 16px',
            borderBottom: '1px solid var(--border-strong)',
            marginBottom: 0,
          }}
        >
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Newsfeed
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Real-time intelligence on humanoid robotics funding, launches, research, and policy.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
          className="no-scrollbar"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleTabChange(cat.value)}
              className="font-data"
              style={{
                padding: '10px 16px',
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color:
                  activeCategory === cat.value
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom:
                  activeCategory === cat.value
                    ? '2px solid var(--accent-positive)'
                    : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
                marginBottom: -1,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '40px 0',
                color: 'var(--text-tertiary)',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              No articles in this category yet.
            </div>
          ) : (
            paginated.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding: '20px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.1s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.backgroundColor =
                      'var(--bg-hover)'
                    ;(e.currentTarget as HTMLDivElement).style.paddingLeft = '8px'
                    ;(e.currentTarget as HTMLDivElement).style.paddingRight = '8px'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLDivElement).style.paddingLeft = '0'
                    ;(e.currentTarget as HTMLDivElement).style.paddingRight = '0'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      className="font-data"
                      style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
                    >
                      {formatDate(article.date)}
                    </span>
                    <span className="tag">{categoryLabel(article.category)}</span>
                  </div>

                  <h2
                    className="font-head news-title"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: 8,
                    }}
                  >
                    {article.title}
                  </h2>

                  {article.excerpt && (
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: 10,
                      }}
                    >
                      {article.excerpt}
                    </p>
                  )}

                  <span
                    className="font-data"
                    style={{ fontSize: 11, color: 'var(--accent-positive)' }}
                  >
                    Read →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="font-data"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '10px 24px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
