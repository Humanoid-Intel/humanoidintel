'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'

interface SearchEntry {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  tags: string[]
  companies: string[]
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

function formatDate(dateStr: string) {
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
              { name: 'title', weight: 3 },
              { name: 'excerpt', weight: 2 },
              { name: 'companies', weight: 2 },
              { name: 'tags', weight: 1 },
              { name: 'category', weight: 1 },
            ],
            threshold: 0.35,
            includeScore: true,
            minMatchCharLength: 2,
          }),
        )
        // Show recent articles by default
        setResults(data.slice(0, 8))
      })
      .catch(() => {})
  }, [index.length])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      if (index.length > 0) setResults(index.slice(0, 8))
    }
  }, [isOpen, index])

  // Search
  useEffect(() => {
    if (!fuse) return
    if (query.trim().length < 2) {
      setResults(index.slice(0, 8))
      setActiveIdx(0)
      return
    }
    const hits = fuse.search(query.trim()).map((r) => r.item)
    setResults(hits.slice(0, 8))
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
    (slug: string) => {
      router.push(`/news/${slug}`)
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
      navigate(results[activeIdx].slug)
    }
  }

  if (!isOpen) return null

  const categoryColors: Record<string, string> = {
    market: 'var(--accent-positive)',
    breaking: '#f59e0b',
    research: '#60a5fa',
    policy: '#a78bfa',
    'deep-dive': '#f472b6',
  }

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
            placeholder="Search articles, companies, topics..."
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
        <div
          ref={listRef}
          style={{ overflowY: 'auto', flex: 1 }}
        >
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

          {results.map((item, i) => (
            <div
              key={item.slug}
              onClick={() => navigate(item.slug)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor:
                  i === activeIdx ? 'var(--bg-hover)' : 'transparent',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-data)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: categoryColors[item.category] ?? 'var(--text-tertiary)',
                    border: `1px solid ${categoryColors[item.category] ?? 'var(--border-subtle)'}`,
                    padding: '1px 5px',
                  }}
                >
                  {item.category}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-data)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {formatDate(item.date)}
                </span>
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
          ))}
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
          {results.length > 0 && (
            <span style={{ marginLeft: 'auto' }}>
              {query.length >= 2 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Recent articles'}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
