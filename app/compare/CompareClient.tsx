'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { Robot } from '@/lib/types'

interface Props {
  robots: Robot[]
}

// Parse a numeric value from strings like "60kg", "1.70m", "5 hrs"
function parseNum(val: string | undefined): number | null {
  if (!val) return null
  const match = val.match(/([\d.]+)/)
  return match ? parseFloat(match[1]) : null
}

type SpecRow = {
  label: string
  key: string
  getValue: (r: Robot) => string
  higherIsBetter?: boolean // for numeric comparison highlighting
  isNumeric?: boolean
}

const SPEC_ROWS: SpecRow[] = [
  { label: 'Manufacturer', key: 'manufacturer', getValue: (r) => r.manufacturer },
  { label: 'Country', key: 'country', getValue: (r) => r.country },
  {
    label: 'Status',
    key: 'status',
    getValue: (r) => r.status.toUpperCase(),
  },
  {
    label: 'Height',
    key: 'height',
    getValue: (r) => r.height ?? '—',
    higherIsBetter: true,
    isNumeric: true,
  },
  {
    label: 'Weight',
    key: 'weight',
    getValue: (r) => r.weight ?? '—',
    higherIsBetter: false,
    isNumeric: true,
  },
  {
    label: 'DOF',
    key: 'dof',
    getValue: (r) => (r.dof != null ? String(r.dof) : '—'),
    higherIsBetter: true,
    isNumeric: true,
  },
  {
    label: 'Payload',
    key: 'payload',
    getValue: (r) => r.payload ?? '—',
    higherIsBetter: true,
    isNumeric: true,
  },
  {
    label: 'Battery',
    key: 'battery',
    getValue: (r) => r.battery ?? '—',
    higherIsBetter: true,
    isNumeric: true,
  },
  {
    label: 'Actuator Type',
    key: 'actuatorType',
    getValue: (r) => r.actuatorType,
  },
]

// Defaults: try to pre-select Figure 03 and Optimus Gen 2
function getDefaults(robots: Robot[]): string[] {
  const fig03 = robots.find((r) => r.slug === 'figure-03')
  const optGen2 = robots.find((r) => r.slug === 'optimus-gen-2')
  const defaults: string[] = []
  defaults.push(fig03?.slug ?? robots[0]?.slug ?? '')
  defaults.push(optGen2?.slug ?? robots[1]?.slug ?? '')
  return defaults.filter(Boolean)
}

export default function CompareClient({ robots }: Props) {
  const source = robots.length > 0 ? robots : []
  const defaults = useMemo(() => getDefaults(source), [source])

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(defaults)

  const selectedRobots = useMemo(() => {
    return selectedSlugs
      .map((slug) => source.find((r) => r.slug === slug))
      .filter(Boolean) as Robot[]
  }, [selectedSlugs, source])

  const canAddMore = selectedSlugs.length < 3

  function handleSelect(index: number, slug: string) {
    setSelectedSlugs((prev) => {
      const next = [...prev]
      next[index] = slug
      return next
    })
  }

  function handleAddColumn() {
    if (!canAddMore) return
    // Pick the first robot not already selected
    const available = source.find((r) => !selectedSlugs.includes(r.slug))
    if (available) {
      setSelectedSlugs((prev) => [...prev, available.slug])
    }
  }

  function handleRemoveColumn(index: number) {
    if (selectedSlugs.length <= 2) return
    setSelectedSlugs((prev) => prev.filter((_, i) => i !== index))
  }

  // Determine best value for each numeric row
  function getBestIndex(row: SpecRow): number | null {
    if (!row.isNumeric || row.higherIsBetter === undefined) return null
    const values = selectedRobots.map((r) => {
      if (row.key === 'dof') return r.dof ?? null
      const raw = row.getValue(r)
      return parseNum(raw)
    })

    let bestIdx: number | null = null
    let bestVal: number | null = null
    values.forEach((v, i) => {
      if (v === null) return
      if (bestVal === null) {
        bestVal = v
        bestIdx = i
      } else if (row.higherIsBetter && v > bestVal) {
        bestVal = v
        bestIdx = i
      } else if (!row.higherIsBetter && v < bestVal) {
        bestVal = v
        bestIdx = i
      }
    })

    // Only highlight if there is an actual difference
    const nonNull = values.filter((v) => v !== null)
    if (nonNull.length < 2) return null
    const allSame = nonNull.every((v) => v === nonNull[0])
    if (allSame) return null

    return bestIdx
  }

  // Responsive: detect column count for mobile stacking
  const colCount = selectedRobots.length

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 1200, margin: '0 auto' }}>
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
            Compare Robots
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginTop: 4,
              maxWidth: 600,
            }}
          >
            Side-by-side specification comparison. Select robots to compare key
            metrics and identify best-in-class values.
          </p>
        </div>

        {/* Robot selectors */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            padding: '16px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {selectedSlugs.map((slug, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label
                className="font-data"
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-tertiary)',
                }}
              >
                Robot {i + 1}
              </label>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <select
                  className="font-data"
                  value={slug}
                  onChange={(e) => handleSelect(i, e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-strong)',
                    padding: '6px 10px',
                    fontSize: 12,
                    fontFamily: 'var(--font-data)',
                    minWidth: 180,
                    appearance: 'auto',
                  }}
                >
                  {source.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} — {r.manufacturer}
                    </option>
                  ))}
                </select>
                {selectedSlugs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(i)}
                    className="font-data"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '5px 8px',
                      fontSize: 12,
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                    title="Remove"
                  >
                    x
                  </button>
                )}
              </div>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={handleAddColumn}
              className="font-data"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--accent-positive)',
                border: '1px solid var(--border-strong)',
                padding: '6px 14px',
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-end',
              }}
            >
              + Add Robot
            </button>
          )}
        </div>

        {/* Comparison table — desktop */}
        <div
          className="compare-table-desktop"
          style={{ overflowX: 'auto', paddingBottom: 40 }}
        >
          <table
            className="font-data"
            style={{
              width: '100%',
              fontSize: 12,
              borderCollapse: 'collapse',
              marginTop: 0,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-tertiary)',
                    fontWeight: 'normal',
                    borderBottom: '1px solid var(--border-strong)',
                    padding: '12px 12px 10px 0',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: 120,
                  }}
                >
                  Spec
                </th>
                {selectedRobots.map((robot) => (
                  <th
                    key={robot.slug}
                    style={{
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      borderBottom: '1px solid var(--border-strong)',
                      padding: '12px 12px 10px 0',
                      fontSize: 13,
                    }}
                  >
                    <Link
                      href={`/robots/${robot.slug}`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {robot.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row) => {
                const bestIdx = getBestIndex(row)
                return (
                  <tr key={row.key}>
                    <td
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        padding: '10px 12px 10px 0',
                        color: 'var(--text-tertiary)',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 'normal',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.label}
                    </td>
                    {selectedRobots.map((robot, i) => {
                      const val = row.getValue(robot)
                      const isBest = bestIdx === i
                      const isStatus = row.key === 'status'
                      const statusColor =
                        isStatus &&
                        ['COMMERCIAL', 'PILOT', 'PRODUCTION'].includes(val)
                          ? 'var(--accent-positive)'
                          : undefined
                      return (
                        <td
                          key={robot.slug}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            padding: '10px 12px 10px 0',
                            color: isBest
                              ? 'var(--accent-positive)'
                              : statusColor ?? 'var(--text-secondary)',
                            fontWeight: isBest ? 600 : 'normal',
                            fontSize: 12,
                          }}
                        >
                          {val}
                          {isBest && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 9,
                                color: 'var(--accent-positive)',
                                opacity: 0.7,
                              }}
                            >
                              BEST
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="compare-table-mobile" style={{ display: 'none', paddingBottom: 40 }}>
          {selectedRobots.map((robot, robotIdx) => (
            <div
              key={robot.slug}
              style={{
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                padding: 16,
                marginTop: 12,
              }}
            >
              <h3
                className="font-head"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                  borderBottom: '1px solid var(--border-strong)',
                  paddingBottom: 8,
                }}
              >
                <Link
                  href={`/robots/${robot.slug}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {robot.name}
                </Link>
              </h3>
              {SPEC_ROWS.map((row) => {
                const val = row.getValue(robot)
                const bestIdx = getBestIndex(row)
                const isBest = bestIdx === robotIdx
                return (
                  <div
                    key={row.key}
                    className="font-data"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        fontSize: 10,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        color: isBest
                          ? 'var(--accent-positive)'
                          : 'var(--text-secondary)',
                        fontWeight: isBest ? 600 : 'normal',
                      }}
                    >
                      {val}
                      {isBest && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 9,
                            color: 'var(--accent-positive)',
                            opacity: 0.7,
                          }}
                        >
                          BEST
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Responsive styles via inline style tag */}
      <style>{`
        @media (max-width: 640px) {
          .compare-table-desktop { display: none !important; }
          .compare-table-mobile { display: block !important; }
        }
        @media (min-width: 641px) {
          .compare-table-desktop { display: block !important; }
          .compare-table-mobile { display: none !important; }
        }
      `}</style>

      <Footer />
    </>
  )
}
