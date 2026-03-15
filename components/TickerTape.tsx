import React from 'react'

export interface TickerItem {
  symbol: string
  label: string
  status: string
  positive: boolean
}

const defaultItems: TickerItem[] = [
  { symbol: 'FIG.AI', label: 'Figure 03', status: '+BMW.Deploy', positive: true },
  { symbol: 'TSLA.BOT', label: 'Optimus', status: '8k.Units.Q1', positive: true },
  { symbol: 'BOS.DYN', label: 'Atlas', status: '+Hyundai.Scale', positive: true },
  { symbol: 'AGIL.ROB', label: 'Digit', status: '+AMZN.Contract', positive: true },
  { symbol: 'SANC.AI', label: 'Phoenix', status: '+SeriesC.250M', positive: true },
  { symbol: '1X.TECH', label: 'NEO Beta', status: '-Prod.Delay.Q2', positive: false },
  { symbol: 'APP.TRON', label: 'Apollo', status: '+NASA.Collab', positive: true },
  { symbol: 'UNIT.REE', label: 'H1', status: '+China.Deploy', positive: true },
  { symbol: 'NEURA', label: '4NE-1', status: '+Series.B.80M', positive: true },
  { symbol: 'FUND.YTD', label: '2026', status: '$4.2B.Raised', positive: true },
]

interface TickerTapeProps {
  items?: TickerItem[]
}

export default function TickerTape({ items = defaultItems }: TickerTapeProps) {
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
