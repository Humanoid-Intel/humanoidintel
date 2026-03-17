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

/* ── Realistic world continent SVG paths (Natural Earth inspired) ── */
const CONTINENT_PATHS = [
  // North America (mainland)
  'M 40,68 L 42,58 50,48 65,38 80,30 100,25 115,22 130,20 148,22 160,28 170,35 178,40 185,48 192,55 200,58 210,62 218,68 225,72 232,78 238,85 242,92 245,100 247,108 248,115 246,122 242,128 238,132 235,138 230,145 225,152 222,158 218,162 210,168 205,172 198,178 192,182 185,188 178,192 170,196 162,198 155,200 148,195 142,190 135,186 128,182 120,180 112,178 105,175 98,170 90,165 82,158 75,150 68,142 62,135 58,128 55,120 50,112 45,102 42,92 40,82 Z',
  // Central America
  'M 155,200 L 162,198 168,202 175,208 180,212 185,218 188,222 190,228 188,232 185,235 180,237 175,236 170,232 165,228 162,222 158,215 155,208 Z',
  // South America
  'M 185,235 L 192,232 200,230 208,232 215,238 222,245 228,255 232,265 235,278 236,290 235,305 232,318 228,332 222,345 215,358 208,368 200,378 192,385 185,390 178,388 172,382 168,375 165,365 162,352 160,338 158,322 157,308 158,292 160,278 162,265 165,255 170,245 175,240 Z',
  // Greenland
  'M 200,18 L 210,12 225,8 240,10 250,15 255,22 252,30 245,36 235,40 225,38 215,34 208,28 205,22 Z',
  // Europe
  'M 430,48 L 438,42 445,38 455,35 465,34 475,36 482,40 488,45 492,50 498,48 505,45 512,48 518,52 522,58 525,65 528,72 530,80 528,88 524,95 518,100 512,105 505,108 498,112 490,115 482,118 475,120 468,118 460,115 455,112 450,108 445,102 440,95 436,88 433,80 430,72 428,62 Z',
  // British Isles
  'M 435,52 L 440,48 445,46 448,50 446,55 442,58 438,56 Z',
  // Scandinavia
  'M 472,22 L 478,18 485,16 492,18 498,22 502,28 505,35 502,42 498,46 492,44 488,40 485,35 480,30 475,26 Z',
  // Africa
  'M 445,128 L 455,125 465,122 475,122 485,125 495,128 505,132 512,138 518,148 522,158 525,170 528,182 530,195 530,210 528,225 525,240 520,255 515,268 508,280 500,290 492,298 482,305 472,308 462,308 452,305 442,298 435,290 430,280 428,268 426,255 425,240 426,225 428,210 430,195 432,180 435,165 438,150 440,138 Z',
  // Madagascar
  'M 538,275 L 542,270 546,272 548,280 546,288 542,292 538,288 536,282 Z',
  // Asia (Russia + Central/East Asia)
  'M 530,18 L 545,15 565,12 585,10 605,10 625,12 645,15 665,14 685,15 705,18 725,22 745,25 760,22 775,18 790,16 805,18 818,22 828,28 835,35 838,42 835,50 828,55 818,58 808,62 798,68 788,72 780,78 772,82 765,88 758,92 750,95 742,100 735,105 728,108 718,112 708,115 698,118 688,120 678,118 668,115 658,112 648,108 638,105 628,102 618,98 608,95 598,92 588,88 578,85 568,82 558,78 548,72 540,65 535,58 532,50 530,42 528,32 Z',
  // India
  'M 638,110 L 648,108 658,112 668,118 672,128 675,138 678,148 680,158 678,168 675,178 670,188 662,195 652,200 645,198 638,192 632,185 628,175 625,165 622,155 620,145 622,135 625,125 630,118 Z',
  // SE Asia peninsula
  'M 698,118 L 708,120 715,128 720,138 722,148 720,158 718,168 715,178 710,185 705,188 700,185 698,175 696,165 695,155 695,145 696,135 698,128 Z',
  // Middle East / Arabian Peninsula
  'M 530,105 L 540,100 550,98 560,100 568,105 575,112 580,120 582,128 578,135 572,140 565,142 558,140 550,138 545,135 540,130 535,122 530,115 Z',
  // Japan
  'M 818,58 L 822,52 828,50 832,54 835,60 838,68 836,76 832,82 826,85 822,80 818,74 816,68 Z',
  // Indonesia / Philippines
  'M 722,178 L 730,175 738,178 745,182 752,180 758,178 762,182 768,188 775,192 780,198 776,205 770,208 762,210 755,208 748,205 740,202 732,200 726,195 722,188 Z',
  // Australia
  'M 762,272 L 778,265 795,260 812,258 828,262 840,268 848,278 852,290 850,302 845,312 838,322 828,330 815,335 800,338 785,336 772,330 762,320 755,310 752,298 754,285 Z',
  // New Zealand
  'M 865,328 L 870,322 875,320 878,325 880,332 878,340 874,345 870,342 866,336 Z',
  // Taiwan / small islands
  'M 802,115 L 806,112 810,115 808,122 804,125 800,122 Z',
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
