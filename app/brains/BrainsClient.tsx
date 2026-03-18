'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { Brain } from '@/lib/types'

type SortKey = 'name' | 'developer' | 'architecture' | 'parameters' | 'robots' | 'status' | 'openSource'

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Production', value: 'production' },
  { label: 'Research', value: 'research' },
  { label: 'Open-Source', value: 'open-source' },
  { label: 'Proprietary', value: 'proprietary' },
]

function statusClass(status: string) {
  return ['production', 'commercial'].includes(status) ? 'data-pos' : 'data-neg'
}

interface Props {
  brains: Brain[]
}

export default function BrainsClient({ brains }: Props) {
  const source = brains

  const [filter, setFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const filtered = useMemo(() => {
    return source.filter((b) => {
      if (filter === 'all') return true
      if (filter === 'production') return b.status === 'production' || b.status === 'commercial'
      if (filter === 'research') return b.status === 'research' || b.status === 'early-stage'
      if (filter === 'open-source') return b.openSource
      if (filter === 'proprietary') return !b.openSource
      return true
    })
  }, [source, filter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      if (sortKey === 'name') { valA = a.name; valB = b.name }
      else if (sortKey === 'developer') { valA = a.developer; valB = b.developer }
      else if (sortKey === 'architecture') { valA = a.architecture; valB = b.architecture }
      else if (sortKey === 'parameters') { valA = a.parameters ?? ''; valB = b.parameters ?? '' }
      else if (sortKey === 'robots') { valA = a.robotsSupported.length; valB = b.robotsSupported.length }
      else if (sortKey === 'status') { valA = a.status; valB = b.status }
      else if (sortKey === 'openSource') { valA = a.openSource ? 'Open' : 'Closed'; valB = b.openSource ? 'Open' : 'Closed' }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [filtered, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((a) => !a)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ color: 'var(--border-strong)' }}> ↕</span>
    return <span style={{ color: 'var(--accent-positive)' }}> {sortAsc ? '↑' : '↓'}</span>
  }

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px' }}>
        {/* Page heading */}
        <div
          style={{
            padding: '24px 0 16px',
            borderBottom: '1px solid var(--border-strong)',
          }}
        >
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Brain Database
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 600 }}>
            The definitive database of AI brains and foundation models powering humanoid robots.
            Architecture, training data, and deployment status.
          </p>
          <p
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}
          >
            Last updated: {lastUpdated} · {source.length} brains tracked
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            marginBottom: 0,
          }}
          className="no-scrollbar"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className="font-data"
              style={{
                padding: '10px 14px',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: filter === tab.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom:
                  filter === tab.value
                    ? '2px solid var(--accent-positive)'
                    : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', paddingBottom: 40 }}>
          <table
            className="font-data"
            style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 0 }}
          >
            <thead>
              <tr>
                {(
                  [
                    { label: 'Name', key: 'name' },
                    { label: 'Developer', key: 'developer' },
                    { label: 'Architecture', key: 'architecture' },
                    { label: 'Parameters', key: 'parameters' },
                    { label: 'Robots', key: 'robots' },
                    { label: 'Status', key: 'status' },
                    { label: 'Open/Closed', key: 'openSource' },
                  ] as { label: string; key: SortKey }[]
                ).map((col) => (
                  <th
                    key={col.label}
                    onClick={() => handleSort(col.key)}
                    style={{
                      textAlign: 'left',
                      color: 'var(--text-secondary)',
                      fontWeight: 'normal',
                      borderBottom: '1px solid var(--border-strong)',
                      padding: '12px 12px 10px 0',
                      paddingRight: 16,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {col.label}
                    <SortIndicator col={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    No brains match this filter.
                  </td>
                </tr>
              ) : (
                sorted.map((brain) => (
                  <tr
                    key={brain.slug}
                    style={{ cursor: 'pointer', transition: 'background-color 0.1s' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'transparent'
                    }}
                  >
                    {([
                      { value: brain.name, color: 'var(--text-primary)', fontWeight: 500 },
                      { value: brain.developer, color: 'var(--text-secondary)' },
                      { value: brain.architecture, color: 'var(--text-secondary)' },
                      { value: brain.parameters ?? '—', color: 'var(--text-secondary)' },
                      { value: `${brain.robotsSupported.length} robot${brain.robotsSupported.length !== 1 ? 's' : ''}`, color: 'var(--text-secondary)' },
                    ] as { value: React.ReactNode; color: string; fontWeight?: number }[]).map((cell, i) => (
                      <td key={i} style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0 }}>
                        <Link
                          href={`/brains/${brain.slug}`}
                          style={{ display: 'block', padding: '12px 16px 12px 0', color: cell.color, fontWeight: cell.fontWeight, textDecoration: 'none' }}
                        >
                          {cell.value}
                        </Link>
                      </td>
                    ))}
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0 }} className={statusClass(brain.status)}>
                      <Link href={`/brains/${brain.slug}`} style={{ display: 'block', padding: '12px 16px 12px 0', color: 'inherit', textDecoration: 'none' }}>
                        {brain.status.toUpperCase()}
                      </Link>
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0 }}>
                      <Link href={`/brains/${brain.slug}`} style={{ display: 'block', padding: '12px 0', textDecoration: 'none' }}>
                        <span
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '2px 6px',
                            border: '1px solid',
                            color: brain.openSource ? '#22c55e' : 'var(--text-tertiary)',
                            borderColor: brain.openSource ? '#22c55e' : 'var(--border-subtle)',
                          }}
                        >
                          {brain.openSource ? 'Open' : 'Closed'}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  )
}
