'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { Job } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return '1d ago'
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    timeZone: 'America/New_York',
  })
}

const DEPT_GROUPS: Record<string, string> = {
  Engineering: 'Engineering',
  'Software Engineering': 'Engineering',
  'Robotics Engineering': 'Engineering',
  'Mechanical Engineering': 'Engineering',
  'Electrical Engineering': 'Engineering',
  'Controls Engineering': 'Engineering',
  Research: 'Research',
  'Research & Development': 'Research',
  Science: 'Research',
  Product: 'Product',
  'Product Management': 'Product',
  Operations: 'Operations',
  'Manufacturing': 'Operations',
  'Supply Chain': 'Operations',
  Design: 'Design',
  Marketing: 'Marketing',
  Sales: 'Sales',
  Finance: 'Finance',
  Legal: 'Legal',
  HR: 'HR',
  'People Operations': 'HR',
}

function normalizeDept(dept: string): string {
  return DEPT_GROUPS[dept] ?? dept
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { jobs: Job[] }

const TAG_COLORS: Record<string, string> = {
  controls:    '#22c55e',
  'ml/ai':     '#a78bfa',
  embedded:    '#f59e0b',
  hardware:    '#60a5fa',
  perception:  '#34d399',
  simulation:  '#f472b6',
  software:    '#94a3b8',
  safety:      '#ef4444',
  product:     '#fb923c',
  research:    '#c084fc',
  electrical:  '#facc15',
  operations:  '#64748b',
  senior:      '#22c55e',
  leadership:  '#f59e0b',
  internship:  '#ec4899',
  junior:      '#60a5fa',
}

export default function JobsClient({ jobs }: Props) {
  const [search, setSearch] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set())
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'company' | 'title'>('newest')

  // ── Derived filter options ──
  const allCompanies = useMemo(() =>
    [...new Set(jobs.map((j) => j.company))].sort(), [jobs])

  const allDepts = useMemo(() =>
    [...new Set(jobs.map((j) => normalizeDept(j.department)))].sort(), [jobs])

  // ── Stats ──
  const totalOpen    = jobs.length
  const companiesHiring = new Set(jobs.map((j) => j.company)).size
  const remoteCount  = jobs.filter((j) => j.remote).length
  const remotePct    = totalOpen > 0 ? Math.round((remoteCount / totalOpen) * 100) : 0

  // ── Filtering & sorting ──
  const filtered = useMemo(() => {
    let result = jobs.filter((j) => {
      if (remoteOnly && !j.remote) return false
      if (selectedCompanies.size > 0 && !selectedCompanies.has(j.company)) return false
      if (selectedDepts.size > 0 && !selectedDepts.has(normalizeDept(j.department))) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.tags.some((t) => t.includes(q))
        )
      }
      return true
    })

    if (sortBy === 'company') result = [...result].sort((a, b) => a.company.localeCompare(b.company))
    else if (sortBy === 'title') result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    else result = [...result].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

    return result
  }, [jobs, search, selectedCompanies, selectedDepts, remoteOnly, sortBy])

  const toggleCompany = (name: string) => {
    setSelectedCompanies((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const toggleDept = (dept: string) => {
    setSelectedDepts((prev) => {
      const next = new Set(prev)
      next.has(dept) ? next.delete(dept) : next.add(dept)
      return next
    })
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCompanies(new Set())
    setSelectedDepts(new Set())
    setRemoteOnly(false)
  }

  const hasFilters = search || selectedCompanies.size > 0 || selectedDepts.size > 0 || remoteOnly

  // ─── Styles ──────────────────────────────────────────────────────────────────

  const S = {
    page: {
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-mono)',
    } as React.CSSProperties,

    container: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 24px 80px',
    } as React.CSSProperties,

    header: {
      borderBottom: '1px solid var(--border)',
      paddingBottom: 20,
      marginBottom: 28,
      marginTop: 32,
    } as React.CSSProperties,

    statsBar: {
      display: 'flex',
      gap: 32,
      flexWrap: 'wrap' as const,
      marginBottom: 28,
      padding: '14px 20px',
      border: '1px solid var(--border)',
      backgroundColor: 'rgba(255,255,255,0.02)',
    } as React.CSSProperties,

    stat: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
    } as React.CSSProperties,

    statLabel: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
    } as React.CSSProperties,

    statValue: {
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--accent-positive)',
      lineHeight: 1,
    } as React.CSSProperties,

    layout: {
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 32,
      alignItems: 'start',
    } as React.CSSProperties,

    sidebar: {
      position: 'sticky' as const,
      top: 80,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 20,
      // Hide scrollbar visually but keep it functional
      scrollbarWidth: 'thin' as const,
    } as React.CSSProperties,

    filterGroup: {
      border: '1px solid var(--border)',
      padding: '12px 14px',
    } as React.CSSProperties,

    filterLabel: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      marginBottom: 8,
      display: 'block',
    } as React.CSSProperties,

    checkItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '3px 0',
      cursor: 'pointer',
      fontSize: 11,
      color: 'var(--text-primary)',
    } as React.CSSProperties,

    input: {
      width: '100%',
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '7px 10px',
      outline: 'none',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    select: {
      background: 'var(--background)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '6px 10px',
      cursor: 'pointer',
      outline: 'none',
    } as React.CSSProperties,

    jobCard: {
      border: '1px solid var(--border)',
      padding: '16px 20px',
      marginBottom: 8,
      transition: 'border-color 0.15s',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 12,
      alignItems: 'start',
    } as React.CSSProperties,

    jobTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: 4,
      lineHeight: 1.3,
    } as React.CSSProperties,

    jobMeta: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap' as const,
      fontSize: 11,
      color: 'var(--text-secondary)',
      marginBottom: 8,
      alignItems: 'center',
    } as React.CSSProperties,

    badge: (color: string) => ({
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      padding: '2px 6px',
      border: `1px solid ${color}`,
      color: color,
    }),

    tag: (tag: string) => ({
      fontSize: 9,
      padding: '2px 5px',
      border: `1px solid ${TAG_COLORS[tag] ?? '#475569'}`,
      color: TAG_COLORS[tag] ?? '#64748b',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
    }),

    applyBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '7px 14px',
      border: '1px solid var(--accent-positive)',
      color: 'var(--accent-positive)',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      textDecoration: 'none',
      cursor: 'pointer',
      background: 'transparent',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      transition: 'background 0.15s',
    } as React.CSSProperties,

    emptyState: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: 'var(--text-secondary)',
      fontSize: 13,
      border: '1px solid var(--border)',
    } as React.CSSProperties,
  }

  return (
    <div style={S.page}>
      <TickerTape />
      <Header />

      <main style={S.container}>
        {/* ── Page header ── */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              TALENT BOARD
            </h1>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              HUMANOID ROBOTICS INDUSTRY
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-secondary)', maxWidth: 560 }}>
            Open roles aggregated from 40+ companies — updated hourly via Greenhouse, Lever, and Indeed.
            Click any role to apply directly on the company&apos;s site.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div style={S.statsBar}>
          <div style={S.stat}>
            <span style={S.statLabel}>Open Roles</span>
            <span style={S.statValue}>{totalOpen.toLocaleString()}</span>
          </div>
          <div style={S.stat}>
            <span style={S.statLabel}>Companies Hiring</span>
            <span style={S.statValue}>{companiesHiring}</span>
          </div>
          <div style={S.stat}>
            <span style={S.statLabel}>Remote Roles</span>
            <span style={S.statValue}>{remotePct}%</span>
          </div>
          <div style={S.stat}>
            <span style={S.statLabel}>Showing</span>
            <span style={S.statValue}>{filtered.length}</span>
          </div>
          <div style={{ ...S.stat, marginLeft: 'auto', alignSelf: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              Updated hourly
            </span>
          </div>
        </div>

        {/* ── Layout ── */}
        <div style={S.layout}>

          {/* ── Sidebar filters ── */}
          <div style={S.sidebar}>

            {/* Search */}
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>Search</span>
              <input
                style={S.input}
                placeholder="title, skill, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>Sort by</span>
              <select
                style={{ ...S.select, width: '100%' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="newest">Newest first</option>
                <option value="company">Company A–Z</option>
                <option value="title">Role A–Z</option>
              </select>
            </div>

            {/* Remote toggle */}
            <div style={S.filterGroup}>
              <label style={{ ...S.checkItem, userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  style={{ accentColor: 'var(--accent-positive)', cursor: 'pointer' }}
                />
                Remote only
              </label>
            </div>

            {/* Department filter */}
            {allDepts.length > 0 && (
              <div style={S.filterGroup}>
                <span style={S.filterLabel}>Department</span>
                {allDepts.map((dept) => (
                  <label key={dept} style={{ ...S.checkItem, userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={selectedDepts.has(dept)}
                      onChange={() => toggleDept(dept)}
                      style={{ accentColor: 'var(--accent-positive)', cursor: 'pointer' }}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            )}

            {/* Company filter */}
            {allCompanies.length > 0 && (
              <div style={S.filterGroup}>
                <span style={S.filterLabel}>Company</span>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {allCompanies.map((company) => (
                    <label key={company} style={{ ...S.checkItem, userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={selectedCompanies.has(company)}
                        onChange={() => toggleCompany(company)}
                        style={{ accentColor: 'var(--accent-positive)', cursor: 'pointer' }}
                      />
                      {company}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '7px 14px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* ── Job list ── */}
          <div>
            {jobs.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⚙</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Jobs syncing...</div>
                <div style={{ fontSize: 12 }}>
                  The job board is updated hourly from Greenhouse, Lever &amp; Indeed.
                  Check back shortly — or follow{' '}
                  <a
                    href="https://x.com/HumanoidIntelAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-positive)' }}
                  >
                    @HumanoidIntelAI
                  </a>{' '}
                  for alerts.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={S.emptyState}>
                <div>No roles match the current filters.</div>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: 12,
                    background: 'transparent',
                    border: '1px solid var(--accent-positive)',
                    color: 'var(--accent-positive)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filtered.map((job) => (
                <JobCard
                key={job.id}
                job={job}
                S={{ jobCard: S.jobCard, jobTitle: S.jobTitle, jobMeta: S.jobMeta, applyBtn: S.applyBtn, badge: S.badge, tag: S.tag }}
                daysAgo={daysAgo}
                formatDate={formatDate}
              />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ─── Styles type ──────────────────────────────────────────────────────────────

type Styles = {
  jobCard: React.CSSProperties
  jobTitle: React.CSSProperties
  jobMeta: React.CSSProperties
  applyBtn: React.CSSProperties
  badge: (color: string) => React.CSSProperties
  tag: (tag: string) => React.CSSProperties
}

// ─── Job card sub-component ───────────────────────────────────────────────────

function JobCard({
  job,
  S,
  daysAgo,
  formatDate,
}: {
  job: Job
  S: Styles
  daysAgo: (s: string) => string
  formatDate: (s: string) => string
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      style={{
        ...S.jobCard,
        borderColor: hover ? 'var(--accent-positive)' : 'var(--border)',
        backgroundColor: hover ? 'rgba(34,197,94,0.03)' : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Left column */}
      <div>
        {/* Company + department */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-positive)' }}>
            {job.company}
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
            {job.department}
          </span>
          {job.type !== 'full-time' && (
            <>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={S.badge('#f59e0b')}>
                {job.type}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <div style={S.jobTitle}>{job.title}</div>

        {/* Meta row */}
        <div style={S.jobMeta}>
          <span>📍 {job.remote ? 'Remote' : job.location}</span>
          {job.remote && job.location !== 'See listing' && (
            <span style={{ color: 'var(--text-secondary)' }}>({job.location})</span>
          )}
          <span style={{ color: 'var(--border)' }}>·</span>
          <span title={formatDate(job.postedAt)}>{daysAgo(job.postedAt)}</span>
          {job.salary && (
            <>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={{ color: 'var(--accent-positive)' }}>{job.salary}</span>
            </>
          )}
        </div>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
            {job.tags.slice(0, 6).map((tag) => (
              <span key={tag} style={S.tag(tag)}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right column — Apply button */}
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...S.applyBtn,
          borderColor: hover ? 'var(--accent-positive)' : 'var(--border)',
          color: hover ? 'var(--background)' : 'var(--accent-positive)',
          backgroundColor: hover ? 'var(--accent-positive)' : 'transparent',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        Apply ↗
      </a>
    </div>
  )
}

