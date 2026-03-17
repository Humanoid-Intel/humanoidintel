'use client'

import { useState, useMemo } from 'react'

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

/* ── Coordinate conversion (simplified Mercator) ──────────────────── */
const SVG_W = 960
const SVG_H = 500

function lngToX(lng: number): number {
  return (lng + 180) / 360 * SVG_W
}

function latToY(lat: number): number {
  // Mercator projection
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const maxMerc = Math.log(Math.tan(Math.PI / 4 + (85 * Math.PI / 180) / 2))
  return SVG_H / 2 - (mercN / maxMerc) * (SVG_H / 2)
}

function circleRadius(units: number): number {
  // Log scale, min 4, max 18
  return Math.max(4, Math.min(18, 3 + Math.log(units + 1) * 1.8))
}

/* ── Simplified world continent SVG paths ─────────────────────────── */
const CONTINENT_PATHS = [
  // North America
  'M 80,60 L 120,40 160,35 200,50 230,60 250,90 248,120 240,140 235,160 220,175 200,190 180,200 160,210 130,200 100,190 80,175 60,150 55,120 60,90 Z',
  // South America
  'M 180,210 L 200,200 220,210 230,240 235,270 230,300 220,330 210,360 195,380 180,390 170,380 165,350 160,320 158,290 160,260 165,240 170,220 Z',
  // Europe
  'M 430,55 L 460,40 490,45 510,55 520,70 530,85 520,100 510,110 500,120 480,125 460,120 445,110 435,95 430,80 Z',
  // Africa
  'M 440,130 L 470,125 500,130 520,145 530,170 535,200 530,240 520,270 510,300 500,310 480,315 460,310 445,300 435,280 430,250 425,220 430,190 435,160 Z',
  // Asia (simplified)
  'M 520,40 L 560,30 600,25 650,30 700,35 740,45 770,55 800,70 830,80 850,95 840,120 820,140 800,150 770,155 740,160 710,155 690,145 670,140 650,135 630,130 610,125 590,120 570,110 550,100 530,90 525,70 Z',
  // India / SE Asia
  'M 630,135 L 660,145 680,150 700,160 710,180 700,200 680,210 660,205 640,195 630,180 625,160 Z',
  // SE Asia islands
  'M 720,170 L 740,165 760,170 770,180 780,195 790,210 780,220 760,215 740,210 730,200 720,185 Z',
  // Australia
  'M 760,280 L 800,270 830,275 850,285 860,300 855,320 840,335 820,340 800,338 780,330 765,315 760,300 Z',
  // Middle East
  'M 530,120 L 560,115 580,125 575,140 565,155 550,160 535,150 530,135 Z',
  // Japan / Korea
  'M 800,75 L 810,70 820,75 825,85 820,100 810,105 800,100 795,90 Z',
]

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

          {/* Continents */}
          {CONTINENT_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="var(--bg-surface)"
              stroke="var(--border-strong)"
              strokeWidth={0.8}
            />
          ))}

          {/* Deployment dots */}
          {locations.map((loc) => {
            const cx = lngToX(loc.lng)
            const cy = latToY(loc.lat)
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
                {/* Unit label for large deployments */}
                {loc.units >= 1000 && (
                  <text
                    x={cx}
                    y={cy + r + 12}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize={8}
                    fontFamily="var(--font-data)"
                  >
                    {loc.units.toLocaleString()}
                  </text>
                )}
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
