'use client'

import { useState, useMemo } from 'react'
import { WORLD_PATH } from './world-path'

interface DeploymentLocation {
  id: string
  company: string
  robot: string
  location: string
  country: string
  lat: number
  lng: number
  units: number
  type: string
  note: string
}

interface Props {
  locations: DeploymentLocation[]
}

type SortKey = 'units' | 'company' | 'location' | 'type'
type SortDir = 'asc' | 'desc'

/* ── Company color palette ────────────────────────────────────────── */
const COMPANY_COLORS: Record<string, string> = {
  'Tesla': '#4ade80',
  'Agility Robotics': '#38bdf8',
  'Figure AI': '#f472b6',
  'UBTECH': '#fb923c',
  'Unitree': '#a78bfa',
  'Kepler': '#facc15',
  'Tiangong / BHRIC': '#f87171',
  'Fourier': '#2dd4bf',
  '1X Technologies': '#e879f9',
  'Sanctuary AI': '#34d399',
}

function getCompanyColor(company: string): string {
  return COMPANY_COLORS[company] || '#94a3b8'
}

/* ── Coordinate conversion (Natural Earth projection) ─────────────── */
const SVG_W = 960
const SVG_H = 500

// Natural Earth 1 projection parameters (matches world-path.ts generation)
const PROJ_SCALE = 177.61251101371795
const PROJ_TX = 480
const PROJ_TY = 246.12341387337463

// Natural Earth 1 polynomial coefficients
const A0 = 0.8707, A1 = 0, A2 = -0.151386, A3 = 0, A4 = -0.0218474, A5 = 0.0025734, A6 = -0.0013508
const B0 = 1.007226, B1 = 0.015085, B2 = -0.044475, B3 = 0.028874, B4 = -0.005916, B5 = 0, B6 = 0

function projectNE(lng: number, lat: number): [number, number] {
  const lam = (lng * Math.PI) / 180
  const phi = (lat * Math.PI) / 180
  const phi2 = phi * phi
  const phi4 = phi2 * phi2
  const phi6 = phi2 * phi4
  const x = lam * (A0 + phi2 * (A2 + phi2 * (A4 + phi6 * A6)))
  const y = phi * (B0 + phi2 * (B1 + phi2 * (B2 + phi2 * (B3 + phi2 * B4))))
  return [x * PROJ_SCALE + PROJ_TX, -y * PROJ_SCALE + PROJ_TY]
}

function circleRadius(units: number): number {
  // Log scale, min 4, max 18
  return Math.max(4, Math.min(18, 3 + Math.log(units + 1) * 1.8))
}

export default function MapClient({ locations }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [sortKey, setSortKey] = useState<SortKey>('units')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  /* ── Stats ──────────────────────────────────────────────────────── */
  const totalUnits = locations.reduce((s, l) => s + l.units, 0)
  const uniqueCountries = new Set(locations.map((l) => l.country)).size
  const uniqueCompanies = new Set(locations.map((l) => l.company)).size

  /* ── Sorted table data ──────────────────────────────────────────── */
  const sorted = useMemo(() => {
    const copy = [...locations]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'units') cmp = a.units - b.units
      else if (sortKey === 'company') cmp = a.company.localeCompare(b.company)
      else if (sortKey === 'location') cmp = a.location.localeCompare(b.location)
      else if (sortKey === 'type') cmp = a.type.localeCompare(b.type)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [locations, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const hoveredLocation = locations.find((l) => l.id === hoveredId)

  const handleDotHover = (loc: DeploymentLocation, e: React.MouseEvent) => {
    const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setHoveredId(loc.id)
  }

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC'
  }

  return (
    <main style={{ padding: '0 16px 48px' }}>
      {/* ── Page title ──────────────────────────────────────────────── */}
      <div style={{ padding: '24px 0 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          GLOBAL DEPLOYMENT MAP
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginTop: 4,
          }}
        >
          Humanoid robot deployments by location, company, and unit count
        </p>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        {[
          { label: 'TOTAL DEPLOYED UNITS', value: totalUnits.toLocaleString() },
          { label: 'COUNTRIES / REGIONS', value: String(uniqueCountries) },
          { label: 'COMPANIES', value: String(uniqueCompanies) },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: 10,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 26,
                fontWeight: 700,
                color: 'var(--accent-positive)',
                marginTop: 4,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── SVG Map ─────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 16px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {Object.entries(COMPANY_COLORS).map(([company, color]) => (
            <div key={company} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: color,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 10,
                  color: 'var(--text-secondary)',
                }}
              >
                {company}
              </span>
            </div>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line
              key={`vg-${i}`}
              x1={(i * SVG_W) / 6}
              y1={0}
              x2={(i * SVG_W) / 6}
              y2={SVG_H}
              stroke="var(--border-subtle)"
              strokeWidth={0.5}
              strokeDasharray="2,4"
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={(i * SVG_H) / 4}
              x2={SVG_W}
              y2={(i * SVG_H) / 4}
              stroke="var(--border-subtle)"
              strokeWidth={0.5}
              strokeDasharray="2,4"
            />
          ))}

          {/* World land mass (Natural Earth 110m) */}
          <path
            d={WORLD_PATH}
            fill="var(--bg-surface)"
            stroke="var(--border-strong)"
            strokeWidth={0.4}
            strokeLinejoin="round"
          />

          {/* Deployment dots */}
          {locations.map((loc) => {
            const [cx, cy] = projectNE(loc.lng, loc.lat)
            const r = circleRadius(loc.units)
            const color = getCompanyColor(loc.company)
            const isHovered = hoveredId === loc.id

            return (
              <g key={loc.id}>
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.5}
                  >
                    <animate
                      attributeName="r"
                      values={`${r + 4};${r + 10};${r + 4}`}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0.1;0.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Main dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? r + 2 : r}
                  fill={color}
                  fillOpacity={isHovered ? 0.95 : 0.7}
                  stroke={isHovered ? '#fff' : color}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  style={{ cursor: 'pointer', transition: 'r 0.15s, fill-opacity 0.15s' }}
                  onMouseEnter={(e) => handleDotHover(loc, e)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hoveredLocation && (
          <div
            style={{
              position: 'absolute',
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 10,
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-strong)',
              padding: '10px 14px',
              pointerEvents: 'none',
              zIndex: 50,
              minWidth: 200,
              maxWidth: 280,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 13,
                fontWeight: 700,
                color: getCompanyColor(hoveredLocation.company),
                marginBottom: 4,
              }}
            >
              {hoveredLocation.company}
            </div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>ROBOT </span>
                {hoveredLocation.robot}
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>LOC </span>
                {hoveredLocation.location}, {hoveredLocation.country}
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>UNITS </span>
                <span style={{ color: 'var(--accent-positive)', fontWeight: 700 }}>
                  {hoveredLocation.units.toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>TYPE </span>
                {hoveredLocation.type}
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>NOTE </span>
                {hoveredLocation.note}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Deployment table ────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 24,
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}
          >
            ALL DEPLOYMENTS
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-data)',
              fontSize: 11,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  fontSize: 10,
                }}
              >
                <th
                  style={{ textAlign: 'left', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => toggleSort('company')}
                >
                  Company{sortArrow('company')}
                </th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>
                  Robot
                </th>
                <th
                  style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => toggleSort('location')}
                >
                  Location{sortArrow('location')}
                </th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>
                  Country
                </th>
                <th
                  style={{ textAlign: 'right', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => toggleSort('units')}
                >
                  Units{sortArrow('units')}
                </th>
                <th
                  style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => toggleSort('type')}
                >
                  Type{sortArrow('type')}
                </th>
                <th style={{ textAlign: 'left', padding: '8px 16px', fontWeight: 600 }}>
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((loc) => (
                <tr
                  key={loc.id}
                  className="robot-row"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={() => setHoveredId(loc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: getCompanyColor(loc.company),
                        marginRight: 8,
                        flexShrink: 0,
                      }}
                    />
                    {loc.company}
                  </td>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{loc.robot}</td>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{loc.location}</td>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{loc.country}</td>
                  <td
                    style={{
                      padding: '8px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: 'var(--accent-positive)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {loc.units.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 10,
                        textTransform: 'uppercase',
                      }}
                    >
                      {loc.type}
                    </span>
                  </td>
                  <td style={{ padding: '8px 16px', color: 'var(--text-tertiary)' }}>
                    {loc.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Source note ──────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-data)',
          fontSize: 10,
          color: 'var(--text-tertiary)',
          textAlign: 'right',
        }}
      >
        Data as of March 2026. Unit counts are estimates from public disclosures and industry reports.
      </div>
    </main>
  )
}
