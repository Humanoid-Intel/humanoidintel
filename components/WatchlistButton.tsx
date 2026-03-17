'use client'

import { useState, useEffect } from 'react'

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

interface Props {
  companySlug: string
  companyName: string
}

export default function WatchlistButton({ companySlug, companyName }: Props) {
  const [watching, setWatching] = useState(false)

  useEffect(() => {
    setWatching(getWatchlist().includes(companySlug))
  }, [companySlug])

  function toggle() {
    const current = getWatchlist()
    let next: string[]
    if (current.includes(companySlug)) {
      next = current.filter((s) => s !== companySlug)
    } else {
      next = [...current, companySlug]
    }
    setWatchlist(next)
    setWatching(next.includes(companySlug))
    // Dispatch storage event so other components (WatchlistClient) can react
    window.dispatchEvent(new Event('watchlist-update'))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={watching ? `Remove ${companyName} from watchlist` : `Add ${companyName} to watchlist`}
      aria-label={watching ? `Remove ${companyName} from watchlist` : `Add ${companyName} to watchlist`}
      style={{
        background: 'none',
        border: '1px solid',
        borderColor: watching ? 'var(--accent-positive)' : 'var(--border-subtle)',
        color: watching ? 'var(--accent-positive)' : 'var(--text-tertiary)',
        cursor: 'pointer',
        padding: '3px 8px',
        fontSize: 14,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        transition: 'color 0.15s, border-color 0.15s',
        fontFamily: 'var(--font-data)',
      }}
      onMouseEnter={(e) => {
        if (!watching) {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)'
        }
      }}
      onMouseLeave={(e) => {
        if (!watching) {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'
        }
      }}
    >
      <span style={{ fontSize: 13 }}>{watching ? '\u2605' : '\u2606'}</span>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {watching ? 'Watching' : 'Watch'}
      </span>
    </button>
  )
}
