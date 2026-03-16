'use client'

import React, { useEffect, useState } from 'react'

export interface TickerItem {
  symbol: string
  label: string
  status: string
  positive: boolean
}

const STATIC_ITEMS: TickerItem[] = [
  { symbol: 'FIG.AI',    label: 'Figure 03',  status: '+1.5B.SeriesC',  positive: true },
  { symbol: 'TSLA.BOT',  label: 'Optimus',    status: '+8k.Units.Q1',   positive: true },
  { symbol: 'BOS.DYN',   label: 'Atlas',      status: '+New.CEO.2026',  positive: true },
  { symbol: 'AGIL.ROB',  label: 'Digit',      status: '+AMZN.Scale',    positive: true },
  { symbol: 'NEURA',     label: '4NE-1',      status: '+$1B.SeriesD',   positive: true },
  { symbol: 'APP.TRON',  label: 'Apollo',     status: '+$520M.ExtA',    positive: true },
  { symbol: 'UNIT.REE',  label: 'G1',         status: '+3k.Ships.25',   positive: true },
  { symbol: 'SUNDAY',    label: 'HomeBot',    status: '+$1.15B.Val',    positive: true },
  { symbol: 'GALBOT',    label: 'G1',         status: '+RMB2.5B.SerB',  positive: true },
  { symbol: 'SANC.AI',   label: 'Phoenix',    status: '+$90M.SeriesD',  positive: true },
  { symbol: '1X.TECH',   label: 'NEO',        status: '+$125M.SerC',    positive: true },
  { symbol: 'MIND.ROB',  label: 'Stealth',    status: '+Founded.2026',  positive: true },
  { symbol: 'FUND.YTD',  label: '2026',       status: '$5.8B.Raised',   positive: true },
]

interface TickerTapeProps {
  items?: TickerItem[]
}

export default function TickerTape({ items: propItems }: TickerTapeProps) {
  const [items, setItems] = useState<TickerItem[]>(propItems ?? STATIC_ITEMS)

  useEffect(() => {
    if (propItems) return  // caller overrides; skip fetch
    fetch('/ticker-data.json')
      .then((r) => r.json())
      .then((data: TickerItem[]) => {
        if (Array.isArray(data) && data.length > 0) setItems(data)
      })
      .catch(() => {/* keep static fallback */})
  }, [propItems])

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '8px 16px',
        fontFamily: 'var(--font-data)',
        fontSize: 11,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}
      className="no-scrollbar"
    >
      <div style={{ display: 'inline-flex', gap: 24, alignItems: 'center' }}>
        {items.map((item, index) => (
          <span
            key={`${item.symbol}-${index}`}
            style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
          >
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="ticker-val">{item.label}</span>
            <span className={item.positive ? 'data-pos' : 'data-neg'}>
              {item.status}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
