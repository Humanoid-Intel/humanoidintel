'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { Article, Company, FundingRound } from '@/lib/types'

const STORAGE_KEY = 'humanoidintel-watchlist'

function getWatchlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function setWatchlist(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
}

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

interface Props {
  articles: Article[]
  companies: Company[]
  fundingRounds: FundingRound[]
}

export default function WatchlistClient({ articles, companies, fundingRounds }: Props) {
  const [watchedSlugs, setWatchedSlugs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setWatchedSlugs(getWatchlist())
    setMounted(true)

    const handler = () => setWatchedSlugs(getWatchlist())
    window.addEventListener('watchlist-update', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('watchlist-update', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  function removeFromWatchlist(slug: string) {
    const next = watchedSlugs.filter((s) => s !== slug)
    setWatchlist(next)
    setWatchedSlugs(next)
  }

  if (!mounted) {
    return (
      <>
        <Header />
        <TickerTape />
        <div style={{ maxWidth: 900, padding: '0 16px' }}>
          <div style={{ padding: '20px 0 16px', borderBottom: '1px solid var(--border-strong)' }}>
            <h1
              className="font-head"
              style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              My Watchlist
            </h1>
          </div>
          <div style={{ padding: '40px 0', color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center' }}>
            Loading...
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const watchedCompanies = companies.filter((c) => watchedSlugs.includes(c.slug))

  // Match articles: check companies array, tags, or if company name appears in tags
  const watchedCompanyNames = watchedCompanies.map((c) => c.name.toLowerCase())
  const watchedArticles = articles
    .filter((a) => {
      if (a.companies && a.companies.some((cs) => watchedSlugs.includes(cs))) return true
      if (a.tags && a.tags.some((t) => watchedCompanyNames.includes(t.toLowerCase()))) return true
      if (a.tags && a.tags.some((t) => watchedSlugs.includes(t.toLowerCase()))) return true
      return false
    })
    .slice(0, 20)

  const watchedFunding = fundingRounds
    .filter((f) => watchedSlugs.includes(f.companySlug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)

  const isEmpty = watchedSlugs.length === 0

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
            My Watchlist
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Track companies, news, and funding activity for your portfolio.
          </p>
        </div>

        {isEmpty ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginTop: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16, color: 'var(--text-tertiary)' }}>
              &#9734;
            </div>
            <div
              className="font-head"
              style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}
            >
              No companies on your watchlist
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto 20px' }}>
              Add companies to your watchlist by clicking the &#9733; icon on any company page.
            </p>
            <Link
              href="/companies"
              className="font-data"
              style={{
                fontSize: 11,
                color: 'var(--accent-positive)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Browse Companies &#8594;
            </Link>
          </div>
        ) : (
          <>
            {/* Watched Companies */}
            <div style={{ marginTop: 24, marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 16 }}>
                Watched Companies ({watchedCompanies.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {watchedCompanies.map((company) => (
                  <div
                    key={company.slug}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      padding: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Link
                        href={`/companies/${company.slug}`}
                        className="font-head"
                        style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}
                      >
                        {company.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(company.slug)}
                        title={`Remove ${company.name} from watchlist`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '2px 4px',
                          lineHeight: 1,
                        }}
                      >
                        &#10005;
                      </button>
                    </div>
                    <div
                      className="font-data"
                      style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}
                    >
                      <span>{company.hq}</span>
                      <span
                        style={{
                          color: company.status === 'active' ? 'var(--accent-positive)' : 'var(--text-tertiary)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {company.status}
                      </span>
                      {company.totalFunding && <span>{company.totalFunding}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div style={{ marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 16 }}>
                Latest News
              </div>
              {watchedArticles.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 13,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  No recent articles for your watched companies.
                </div>
              ) : (
                <div>
                  {watchedArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/news/${article.slug}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          padding: '14px 0',
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background-color 0.1s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-hover)'
                          ;(e.currentTarget as HTMLDivElement).style.paddingLeft = '8px'
                          ;(e.currentTarget as HTMLDivElement).style.paddingRight = '8px'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                          ;(e.currentTarget as HTMLDivElement).style.paddingLeft = '0'
                          ;(e.currentTarget as HTMLDivElement).style.paddingRight = '0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className="font-data" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {formatDate(article.date)}
                          </span>
                          <span className="tag">{article.category.toUpperCase()}</span>
                        </div>
                        <h3
                          className="font-head news-title"
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            lineHeight: 1.3,
                            marginBottom: 4,
                          }}
                        >
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {article.excerpt.slice(0, 120)}{article.excerpt.length > 120 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Funding Activity */}
            <div style={{ marginBottom: 32 }}>
              <div className="panel-title" style={{ marginBottom: 16 }}>
                Funding Activity
              </div>
              {watchedFunding.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 13,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  No funding rounds for your watched companies.
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Table header */}
                  <div
                    className="font-data"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 100px 1fr 100px',
                      gap: 12,
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-strong)',
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Company</span>
                    <span>Round</span>
                    <span>Amount</span>
                    <span>Lead Investors</span>
                    <span>Date</span>
                  </div>
                  {watchedFunding.map((round) => (
                    <div
                      key={round.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 100px 1fr 100px',
                        gap: 12,
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Link
                        href={`/companies/${round.companySlug}`}
                        style={{ color: 'var(--accent-positive)', fontWeight: 500 }}
                      >
                        {round.company}
                      </Link>
                      <span className="font-data" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                        {round.round}
                      </span>
                      <span className="font-data" style={{ color: 'var(--text-primary)', fontSize: 11 }}>
                        {round.amount}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                        {round.leadInvestors.join(', ')}
                      </span>
                      <span className="font-data" style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
                        {formatDate(round.date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  )
}
