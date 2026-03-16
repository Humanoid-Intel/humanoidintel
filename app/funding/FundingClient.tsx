'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { FundingRound } from '@/lib/types'

const PLACEHOLDER_ROUNDS: FundingRound[] = [
  {
    id: '1',
    company: 'Figure AI',
    companySlug: 'figure-ai',
    round: 'Series B',
    amount: '$675M',
    valuation: '$2.6B',
    leadInvestors: ['Microsoft', 'OpenAI', 'Intel Capital'],
    date: '2024-02-29',
    geography: 'USA',
    notes: 'Largest humanoid robotics round to date at time of close.',
  },
  {
    id: '2',
    company: 'Physical Intelligence',
    companySlug: 'physical-intelligence',
    round: 'Series A',
    amount: '$400M',
    valuation: '$2.4B',
    leadInvestors: ['Sequoia', 'Lux Capital'],
    date: '2024-11-04',
    geography: 'USA',
  },
  {
    id: '3',
    company: 'Sanctuary AI',
    companySlug: 'sanctuary-ai',
    round: 'Series C',
    amount: '$250M',
    valuation: '$1.8B',
    leadInvestors: ['SoftBank'],
    date: '2026-03-12',
    geography: 'Canada',
    notes: 'Positions Sanctuary for potential 2027 IPO.',
  },
  {
    id: '4',
    company: 'Apptronik',
    companySlug: 'apptronik',
    round: 'Series A',
    amount: '$160M',
    valuation: '$400M',
    leadInvestors: ['Google', 'Capital Factory'],
    date: '2024-03-14',
    geography: 'USA',
  },
  {
    id: '5',
    company: '1X Technologies',
    companySlug: '1x-technologies',
    round: 'Series B',
    amount: '$100M',
    valuation: '$350M',
    leadInvestors: ['EQT Ventures', 'Samsung Next'],
    date: '2024-01-25',
    geography: 'Europe',
  },
  {
    id: '6',
    company: 'Agility Robotics',
    companySlug: 'agility-robotics',
    round: 'Series B',
    amount: '$150M',
    valuation: '$520M',
    leadInvestors: ['DCVC', 'Playground Global'],
    date: '2024-07-18',
    geography: 'USA',
  },
  {
    id: '7',
    company: 'Neura Robotics',
    companySlug: 'neura-robotics',
    round: 'Series B',
    amount: '$80M',
    valuation: '$300M',
    leadInvestors: ['EQT Ventures'],
    date: '2024-10-01',
    geography: 'Europe',
  },
  {
    id: '8',
    company: 'Unitree Robotics',
    companySlug: 'unitree',
    round: 'Series C',
    amount: '$100M',
    valuation: '$600M',
    leadInvestors: ['Meituan', 'HillHouse'],
    date: '2025-04-15',
    geography: 'China',
  },
  {
    id: '9',
    company: 'Figure AI',
    companySlug: 'figure-ai',
    round: 'Series C',
    amount: '$300M',
    valuation: '$4.0B',
    leadInvestors: ['Bezos Expeditions', 'NVentures'],
    date: '2025-09-20',
    geography: 'USA',
    notes: 'Follow-on to close out Series B momentum.',
  },
  {
    id: '10',
    company: 'Astribot',
    companySlug: 'astribot',
    round: 'Series A',
    amount: '$120M',
    valuation: '$450M',
    leadInvestors: ['Shenzhen Capital Group'],
    date: '2025-06-10',
    geography: 'China',
  },
]

type SortKey = 'company' | 'round' | 'amount' | 'date' | 'geography'

function isRecent(dateStr: string) {
  try {
    return new Date(dateStr).getFullYear() >= 2025
  } catch {
    return false
  }
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

function parseAmount(amt: string): number {
  if (!amt || amt === 'N/A') return 0
  // Handle "€1B (~$1.08B)" or "RMB 2.5B (~$345M)" — extract parenthetical USD amount
  const parenMatch = amt.match(/\(~?\$([0-9.]+[BMbm]?)\)/)
  if (parenMatch) {
    const inner = parenMatch[1]
    const n = parseFloat(inner)
    if (!isNaN(n)) {
      if (inner.toUpperCase().includes('B')) return n * 1000
      return n
    }
  }
  // Strip all non-numeric/non-unit chars (handles ~, €, RMB, spaces, etc.)
  const stripped = amt.replace(/[^0-9.BMKbmk]/g, '')
  const num = parseFloat(stripped)
  if (isNaN(num)) return 0
  const upper = amt.toUpperCase()
  if (upper.includes('B')) return num * 1000
  if (upper.includes('K')) return num / 1000
  return num
}

interface Props {
  rounds: FundingRound[]
}

export default function FundingClient({ rounds }: Props) {
  const source = rounds.length > 0 ? rounds : PLACEHOLDER_ROUNDS

  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = useMemo(() => {
    return [...source].sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      if (sortKey === 'company') { valA = a.company; valB = b.company }
      else if (sortKey === 'round') { valA = a.round; valB = b.round }
      else if (sortKey === 'geography') { valA = a.geography; valB = b.geography }
      else if (sortKey === 'date') {
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      }
      else if (sortKey === 'amount') {
        valA = parseAmount(a.amount)
        valB = parseAmount(b.amount)
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [source, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((a) => !a)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ color: 'var(--border-strong)' }}> ↕</span>
    return <span style={{ color: 'var(--accent-positive)' }}> {sortAsc ? '↑' : '↓'}</span>
  }

  // Summary stats
  const totalRaised = source
    .map((r) => parseAmount(r.amount))
    .reduce((a, b) => a + b, 0)
  const largestRound = source.reduce((a, b) =>
    parseAmount(a.amount) > parseAmount(b.amount) ? a : b,
  )
  const avgRound = totalRaised / source.length

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px' }}>
        {/* Page heading */}
        <div style={{ padding: '24px 0 16px', borderBottom: '1px solid var(--border-strong)' }}>
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Funding Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Complete funding history for every humanoid robotics company.
          </p>

          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Tracked (2024–2026)', value: `$${(totalRaised / 1000).toFixed(1)}B` },
              { label: 'Largest Round', value: `${largestRound.company} ${largestRound.amount}` },
              { label: 'Rounds Tracked', value: String(source.length) },
              { label: 'Avg Round Size', value: `$${Math.round(avgRound)}M` },
            ].map((stat) => (
              <div key={stat.label} className="metric-block" style={{ marginBottom: 0, minWidth: 160 }}>
                <div className="metric-label">{stat.label}</div>
                <div
                  className="font-head"
                  style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
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
                    { label: 'Company', key: 'company' },
                    { label: 'Round', key: 'round' },
                    { label: 'Amount', key: 'amount' },
                    { label: 'Valuation', key: null },
                    { label: 'Lead Investors', key: null },
                    { label: 'Date', key: 'date' },
                    { label: 'Geography', key: 'geography' },
                  ] as { label: string; key: SortKey | null }[]
                ).map((col) => (
                  <th
                    key={col.label}
                    onClick={() => col.key && handleSort(col.key)}
                    style={{
                      textAlign: 'left',
                      color: 'var(--text-secondary)',
                      fontWeight: 'normal',
                      borderBottom: '1px solid var(--border-strong)',
                      padding: '12px 16px 10px 0',
                      whiteSpace: 'nowrap',
                      cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    {col.label}
                    {col.key && <SortIndicator col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((round) => (
                <tr
                  key={round.id}
                  style={{ transition: 'background-color 0.1s' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 16px 12px 0',
                      color: isRecent(round.date) ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      fontWeight: 500,
                    }}
                  >
                    <Link href={`/companies/${round.companySlug}`} style={{ color: 'inherit' }}>
                      {round.company}
                    </Link>
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 16px 12px 0',
                      color: isRecent(round.date) ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {round.round}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 16px 12px 0',
                      color: isRecent(round.date) ? 'var(--accent-positive)' : 'var(--text-tertiary)',
                    }}
                  >
                    {round.amount}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 16px 12px 0',
                      color: isRecent(round.date) ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {round.valuation ?? '—'}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 16px 12px 0',
                      color: isRecent(round.date) ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      maxWidth: 200,
                    }}
                  >
                    {round.leadInvestors.join(', ')}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 16px 12px 0',
                      color: isRecent(round.date) ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {formatDate(round.date)}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '12px 0',
                      color: isRecent(round.date) ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {round.geography}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  )
}
