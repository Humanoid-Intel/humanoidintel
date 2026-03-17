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
        background: watching ? 'rgba(205, 224, 213, 0.12)' : 'var(--bg-surface)',
        border: '1px solid',
        borderColor: watching ? 'var(--accent-positive)' : 'var(--border-strong)',
        color: watching ? 'var(--accent-positive)' : 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '5px 12px',
        fontSize: 14,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
        fontFamily: 'var(--font-data)',
        borderRadius: 2,
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        if (!watching) {
          btn.style.color = 'var(--accent-positive)'
          btn.style.borderColor = 'var(--accent-positive)'
          btn.style.backgroundColor = 'rgba(205, 224, 213, 0.06)'
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        if (!watching) {
          btn.style.color = 'var(--text-secondary)'
          btn.style.borderColor = 'var(--border-strong)'
          btn.style.backgroundColor = 'var(--bg-surface)'
        }
      }}
    >
      <span style={{ fontSize: 16 }}>{watching ? '\u2605' : '\u2606'}</span>
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
        {watching ? 'Watching' : 'Watch'}
      </span>
    </button>
  )
}
