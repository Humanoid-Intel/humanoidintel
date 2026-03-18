'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'

interface Supplier {
  company: string
  products: string[]
  customers: string[]
  hq: string
  criticality: 'critical' | 'high' | 'medium'
}

interface SupplyCategory {
  category: string
  suppliers: Supplier[]
  bottleneck?: boolean
  bottleneckReason?: string | null
  avgCostPercent?: number | null
}

interface SupplyChainRelationship {
  supplier: string
  robot: string
  robotSlug: string | null
  companySlug: string | null
  component: string
  category: string
  confidence: 'confirmed' | 'inferred'
}

const CATEGORY_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48',
  '#a855f7', '#10b981',
]

const customerSlugMap: Record<string, string> = {
  'Figure AI': 'figure-ai',
  'Agility Robotics': 'agility-robotics',
  Agility: 'agility-robotics',
  Apptronik: 'apptronik',
  'NEURA Robotics': 'neura-robotics',
  NEURA: 'neura-robotics',
  Unitree: 'unitree-robotics',
  Galbot: 'galbot',
  '1X Technologies': '1x-technologies',
  Fourier: 'fourier-intelligence',
  Kepler: 'kepler',
  'Boston Dynamics': 'boston-dynamics',
  'Sanctuary AI': 'sanctuary-ai',
  'Tesla Optimus': 'tesla-optimus',
  Agibot: 'agibot',
  Samsung: 'samsung',
  ABB: 'abb',
}

function criticalityColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'var(--accent-negative)'
    case 'high':
      return '#d4a843'
    default:
      return 'var(--text-secondary)'
  }
}

function criticalityDot(level: string): string {
  switch (level) {
    case 'critical':
      return '🔴'
    case 'high':
      return '🟡'
    default:
      return '⚪'
  }
}

export default function SupplyChainClient({ data, relationships }: { data: SupplyCategory[]; relationships: SupplyChainRelationship[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const totalSuppliers = data.reduce((n, cat) => n + cat.suppliers.length, 0)
  const allCustomers = useMemo(() => {
    const set = new Set<string>()
    data.forEach((cat) =>
      cat.suppliers.forEach((s) => s.customers.forEach((c) => set.add(c)))
    )
    return set
  }, [data])

  const filteredData = selectedCategory === 'all'
    ? data
    : data.filter((cat) => cat.category === selectedCategory)

  const filteredSupplierCount = filteredData.reduce((n, cat) => n + cat.suppliers.length, 0)

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 64px' }}>
      {/* Page title */}
      <div style={{ padding: '32px 0 16px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Supply Chain Intelligence
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            marginTop: 6,
          }}
        >
          Key suppliers and components powering the humanoid robotics industry
        </p>
      </div>

      {/* Category selector + stats row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-strong)',
              padding: '10px 36px 10px 14px',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              minWidth: 260,
            }}
          >
            <option value="all">All Segments ({totalSuppliers} suppliers)</option>
            {data.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.suppliers.length})
              </option>
            ))}
          </select>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {filteredSupplierCount} supplier{filteredSupplierCount !== 1 ? 's' : ''} shown
          </span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {data.length} segments total
          </span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {allCustomers.size} customer relationships
          </span>
        </div>
      </div>

      {/* BOM Cost Summary */}
      {(() => {
        const bomCategories = data.filter(c => c.avgCostPercent && c.avgCostPercent > 0)
        if (bomCategories.length === 0) return null
        return (
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              padding: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                marginBottom: 10,
              }}
            >
              BOM Cost Breakdown (avg %)
            </div>
            {/* Bar */}
            <div style={{ display: 'flex', height: 24, borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
              {bomCategories.map((c, i) => (
                <div
                  key={c.category}
                  title={`${c.category}: ~${c.avgCostPercent}%`}
                  style={{
                    width: `${c.avgCostPercent}%`,
                    backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    minWidth: 2,
                  }}
                />
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px 16px' }}>
              {bomCategories.map((c, i) => (
                <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {c.category} — {c.avgCostPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Category panels */}
      {filteredData.map((cat) => (
        <section
          key={cat.category}
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          {/* Category header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {cat.category}
              {cat.bottleneck && (
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 12,
                  border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444',
                  marginLeft: 8, fontFamily: 'monospace',
                }} title={cat.bottleneckReason ?? undefined}>
                  ⚠ BOTTLENECK
                </span>
              )}
              {cat.avgCostPercent != null && cat.avgCostPercent > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>
                  ~{cat.avgCostPercent}% of BOM
                </span>
              )}
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                color: 'var(--text-tertiary)',
              }}
            >
              {cat.suppliers.length} supplier{cat.suppliers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-data)',
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Supplier', 'Products', 'Key Customers', 'Robots', 'HQ', 'Criticality'].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {cat.suppliers.map((supplier) => (
                  <tr
                    key={supplier.company}
                    className="robot-row"
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {supplier.company}
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {supplier.products.map((product) => (
                          <span
                            key={product}
                            style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: 10,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}
                      >
                        {supplier.customers.map((customer, i) => {
                          const slug = customerSlugMap[customer]
                          return (
                            <span key={i}>
                              {slug ? (
                                <Link
                                  href={`/companies/${slug}`}
                                  style={{
                                    color: 'var(--accent-positive)',
                                    fontSize: 11,
                                  }}
                                >
                                  {customer}
                                </Link>
                              ) : (
                                <span
                                  style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: 11,
                                  }}
                                >
                                  {customer}
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      {(() => {
                        const matched = relationships.filter(
                          r => r.supplier.toLowerCase() === supplier.company.toLowerCase()
                        )
                        if (matched.length === 0) return <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>—</span>
                        const unique = Array.from(new Map(matched.map(m => [m.robotSlug ?? m.robot, m])).values())
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
                            {unique.map((m, i) => (
                              <span key={i}>
                                {m.robotSlug ? (
                                  <Link href={`/robots/${m.robotSlug}`} style={{ color: 'var(--accent-positive)', fontSize: 11 }}>
                                    {m.robot}
                                  </Link>
                                ) : (
                                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{m.robot}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )
                      })()}
                    </td>

                    <td
                      style={{
                        padding: '10px 12px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {supplier.hq}
                    </td>

                    <td
                      style={{
                        padding: '10px 12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: 10,
                        letterSpacing: '0.05em',
                        color: criticalityColor(supplier.criticality),
                      }}
                    >
                      {criticalityDot(supplier.criticality)}{' '}
                      {supplier.criticality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  )
}
