'use client'

import { useState } from 'react'

export interface FlowBar {
  h: number
  pos: boolean
  amountM: number
  label: string
  weekLabel: string // e.g. "Jan 28 – Feb 3"
  rounds: Array<{ company: string; amount: string; round: string }>
}

interface Props {
  bars: FlowBar[]
}

export default function CapitalFlowChart({ bars }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip */}
      {hovered !== null && bars[hovered].pos && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: `${(hovered / bars.length) * 100}%`,
            transform: hovered > bars.length * 0.65 ? 'translateX(-80%)' : 'translateX(-10%)',
            zIndex: 50,
            background: 'var(--bg-secondary, #111)',
            border: '1px solid var(--border-subtle, #333)',
            borderRadius: 4,
            padding: '8px 10px',
            minWidth: 180,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-data, monospace)',
              color: 'var(--text-tertiary, #888)',
              marginBottom: 4,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {bars[hovered].weekLabel}
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-data, monospace)',
              color: 'var(--accent-positive, #6ea87a)',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {bars[hovered].label}
          </div>
          {bars[hovered].rounds.map((r, ri) => (
            <div
              key={ri}
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-data, monospace)',
                color: 'var(--text-secondary, #bbb)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: 'var(--text-primary, #eee)' }}>{r.company}</span>
              <span style={{ color: 'var(--accent-positive, #6ea87a)', whiteSpace: 'nowrap' }}>
                {r.amount}
                {r.round ? ` · ${r.round}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart area */}
      <div
        style={{
          position: 'relative',
          height: 140,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${(i / 3) * 100}%`,
              height: 1,
              backgroundColor: 'var(--border-subtle)',
              opacity: 0.5,
            }}
          />
        ))}
        {/* Zero line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 1,
            backgroundColor: 'var(--text-tertiary)',
          }}
        />
        {/* Bars */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '0 2px',
          }}
        >
          {bars.map((bar, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: bar.pos ? 'pointer' : 'default',
              }}
              onMouseEnter={() => bar.pos && setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {bar.pos ? (
                <>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${bar.h}%`,
                        backgroundColor: 'var(--accent-positive)',
                        opacity: hovered === i ? 1 : 0.8,
                        transition: 'opacity 0.1s, box-shadow 0.1s',
                        boxShadow: hovered === i ? '0 0 0 1px var(--accent-positive)' : 'none',
                      }}
                    />
                  </div>
                  <div style={{ height: '50%' }} />
                </>
              ) : (
                <>
                  <div style={{ height: '50%' }} />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${bar.h}%`,
                        backgroundColor: 'var(--accent-negative)',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div
        className="font-data"
        style={{
          fontSize: 10,
          color: 'var(--text-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
        }}
      >
        <span>12w ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}
