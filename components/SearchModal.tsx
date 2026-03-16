'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'

type ContentType = 'news' | 'company' | 'robot' | 'funding' | 'glossary'

interface SearchEntry {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  tags: string[]
  companies: string[]
  type?: ContentType
  url?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

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

const TYPE_COLORS: Record<ContentType, string> = {
  news:     '#f59e0b',
  company:  'var(--accent-positive)',
  robot:    '#60a5fa',
  funding:  '#a78bfa',
  glossary: '#f472b6',
}

const TYPE_LABELS: Record<ContentType, string> = {
  news:     'news',
  company:  'company',
  robot:    'robotdb',
  funding:  'funding',
  glossary: 'glossary',
}

// Legacy category colors (for news articles with explicit category)
const CATEGORY_COLORS: Record<string, string> = {
  market:      'var(--accent-positive)',
  breaking:    '#f59e0b',
  research:    '#60a5fa',
  policy:      '#a78bfa',
  'deep-dive': '#f472b6',
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchEntry[]>([])
  const [index, setIndex] = useState<SearchEntry[]>([])
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load search index once
  useEffect(() => {
    if (index.length > 0) return
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        setIndex(data)
        setFuse(
          new Fuse(data, {
            keys: [
              { name: 'title',     weight: 4 },
              { name: 'excerpt',   weight: 2 },
              { name: 'companies', weight: 2 },
              { name: 'tags',      weight: 1.5 },
              { name: 'category',  weight: 1 },
            ],
            threshold: 0.35,
            includeScore: true,
            minMatchCharLength: 2,
          }),
        )
        // Show recent news by default
        setResults(data.filter((e) => e.type === 'news' || !e.type).slice(0, 8))
      })
      .catch(() => {})
  }, [index.length])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      if (index.length > 0) {
        setResults(index.filter((e) => e.type === 'news' || !e.type).slice(0, 8))
      }
    }
  }, [isOpen, index])

  // Search
  useEffect(() => {
    if (!fuse) return
    if (query.trim().length < 2) {
      setResults(index.filter((e) => e.type === 'news' || !e.type).slice(0, 8))
      setActiveIdx(0)
      return
    }
    const hits = fuse.search(query.trim()).map((r) => r.item)
    setResults(hits.slice(0, 10))
    setActiveIdx(0)
  }, [query, fuse, index])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const navigate = useCallback(
    (item: SearchEntry) => {
      const url = item.url ?? `/news/${item.slug}`
      router.push(url)
      onClose()
    },
    [router, onClose],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIdx]) {
      navigate(results[activeIdx])
    }
  }

  if (!isOpen) return null

  function getBadgeColor(item: SearchEntry): string {
    if (item.type && item.type !== 'news') return TYPE_COLORS[item.type]
    if (item.category && CATEGORY_COLORS[item.category]) return CATEGORY_COLORS[item.category]
    return 'var(--text-tertiary)'
  }

  function getBadgeLabel(item: SearchEntry): string {
    if (item.type && TYPE_LABELS[item.type]) return TYPE_LABELS[item.type]
    return item.category
  }

  const resultCountLabel = query.length >= 2
    ? `${results.length} result${results.length !== 1 ? 's' : ''}`
    : 'Recent news'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 6, 8, 0.8)',
          backdropFilter: 'blur(2px)',
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '10vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 640,
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-strong)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          overflow: 'hidden',
        }}
      >
        {/* Input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search news, companies, robots, funding, glossary…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)',
            }}
          />
          <kbd
            onClick={onClose}
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 10,
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: 'auto', flex: 1 }}>
          {results.length === 0 && query.length >= 2 && (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: 13,
                fontFamily: 'var(--font-data)',
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((item, i) => {
            const badgeColor = getBadgeColor(item)
            return (
              <div
                key={`${item.type ?? 'news'}-${item.slug}-${i}`}
                onClick={() => navigate(item)}
                onMouseEnter={() => setActiveIdx(i)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: i === activeIdx ? 'var(--bg-hover)' : 'transparent',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-data)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: badgeColor,
                      border: `1px solid ${badgeColor}`,
                      padding: '1px 5px',
                    }}
                  >
                    {getBadgeLabel(item)}
                  </span>
                  {item.date && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-data)', color: 'var(--text-tertiary)' }}>
                      {formatDate(item.date)}
                    </span>
                  )}
                  {item.companies && item.companies.length > 0 && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-data)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                      {item.companies[0]}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontFamily: 'var(--font-head)',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    marginBottom: 3,
                  }}
                >
                  {item.title}
                </div>
                {item.excerpt && (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.excerpt}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '8px 16px',
            display: 'flex',
            gap: 16,
            fontSize: 10,
            fontFamily: 'var(--font-data)',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
            news · companies · robots · funding · glossary
          </span>
          {results.length > 0 && (
            <span>{resultCountLabel}</span>
          )}
        </div>
      </div>
    </>
  )
}
