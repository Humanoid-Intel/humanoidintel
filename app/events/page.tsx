import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'

export const metadata: Metadata = {
  title: 'Events & Conferences — humanoidintel.ai',
  description:
    'Upcoming robotics conferences, trade shows, and academic events relevant to humanoid robotics.',
  alternates: { canonical: 'https://humanoidintel.ai/events' },
  openGraph: {
    title: 'Events & Conferences — humanoidintel.ai',
    description:
      'Upcoming robotics conferences, trade shows, and academic events relevant to humanoid robotics.',
    url: 'https://humanoidintel.ai/events',
  },
}

interface RobotEvent {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  category: string
  relevance: string
  url: string
  robotCompanies: string[]
}

function getEvents(): RobotEvent[] {
  const filePath = path.join(process.cwd(), 'content', 'data', 'events.json')
  if (!fs.existsSync(filePath)) return []
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const TODAY = '2026-03-17'

function getEventStatus(startDate: string, endDate: string): 'past' | 'live' | 'future' {
  if (endDate < TODAY) return 'past'
  if (startDate <= TODAY && endDate >= TODAY) return 'live'
  return 'future'
}

function getDaysUntil(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date(TODAY + 'T00:00:00')
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const sMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const eMonth = end.toLocaleDateString('en-US', { month: 'short' })
  if (sMonth === eMonth) {
    return `${sMonth} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}, ${end.getFullYear()}`
}

const categoryLabels: Record<string, string> = {
  'trade-show': 'TRADE SHOW',
  'ai-conference': 'AI CONFERENCE',
  'academic': 'ACADEMIC',
}

const categoryColors: Record<string, string> = {
  'trade-show': '#dfa234',
  'ai-conference': '#76b5c5',
  'academic': '#cde0d5',
}

export default function EventsPage() {
  const events = getEvents().sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  const liveEvents = events.filter((e) => getEventStatus(e.startDate, e.endDate) === 'live')
  const futureEvents = events.filter((e) => getEventStatus(e.startDate, e.endDate) === 'future')
  const pastEvents = events.filter((e) => getEventStatus(e.startDate, e.endDate) === 'past')

  return (
    <>
    <Header />
    <TickerTape />
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@graph': events.map((event) => ({
            '@type': 'Event',
            name: event.name,
            startDate: event.startDate,
            endDate: event.endDate,
            location: {
              '@type': 'Place',
              name: event.location,
              address: event.location,
            },
            description: event.relevance,
            organizer: event.name,
            url: event.url,
          })),
        }}
      />
      {/* Page header */}
      <div
        style={{
          padding: '24px 0 16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Events & Conferences
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            marginTop: 6,
          }}
        >
          ROBOTICS CONFERENCES // TRADE SHOWS // ACADEMIC SYMPOSIA — 2026 CALENDAR
        </p>
      </div>

      {/* Summary strip */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <SummaryBlock label="TOTAL EVENTS" value={String(events.length)} />
        <SummaryBlock label="LIVE NOW" value={String(liveEvents.length)} accent />
        <SummaryBlock label="UPCOMING" value={String(futureEvents.length)} />
        <SummaryBlock label="COMPLETED" value={String(pastEvents.length)} muted />
      </div>

      {/* Live events */}
      {liveEvents.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader title="HAPPENING NOW" />
          {liveEvents.map((event) => (
            <EventCard key={event.id} event={event} status="live" />
          ))}
        </section>
      )}

      {/* Upcoming events */}
      {futureEvents.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader title="UPCOMING" />
          {futureEvents.map((event) => (
            <EventCard key={event.id} event={event} status="future" />
          ))}
        </section>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader title="COMPLETED" />
          {pastEvents.map((event) => (
            <EventCard key={event.id} event={event} status="past" />
          ))}
        </section>
      )}
    </main>
    <Footer />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SummaryBlock({
  label,
  value,
  accent,
  muted,
}: {
  label: string
  value: string
  accent?: boolean
  muted?: boolean
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        padding: '12px 16px',
        minWidth: 120,
        flex: '1 1 0',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: 10,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: 24,
          fontWeight: 700,
          color: accent
            ? '#4ade80'
            : muted
              ? 'var(--text-tertiary)'
              : 'var(--text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-head)',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-secondary)',
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 12,
      }}
    >
      {title}
    </div>
  )
}

function EventCard({
  event,
  status,
}: {
  event: RobotEvent
  status: 'past' | 'live' | 'future'
}) {
  const daysUntil = status === 'future' ? getDaysUntil(event.startDate) : null
  const catColor = categoryColors[event.category] || 'var(--text-secondary)'
  const catLabel = categoryLabels[event.category] || event.category.toUpperCase()

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="event-card"
      style={{
        display: 'block',
        backgroundColor: status === 'live' ? 'rgba(74, 222, 128, 0.04)' : 'var(--bg-panel)',
        border:
          status === 'live'
            ? '1px solid rgba(74, 222, 128, 0.25)'
            : '1px solid var(--border-subtle)',
        padding: 16,
        marginBottom: 8,
        opacity: status === 'past' ? 0.45 : 1,
        transition: 'background-color 0.15s, border-color 0.15s',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Top row: name + category badge + status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 15,
            fontWeight: 600,
            color: status === 'past' ? 'var(--text-secondary)' : 'var(--text-primary)',
          }}
        >
          {event.name}
        </span>

        {/* Category badge */}
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: 9,
            fontWeight: 500,
            padding: '2px 6px',
            border: `1px solid ${catColor}`,
            color: catColor,
            letterSpacing: '0.05em',
          }}
        >
          {catLabel}
        </span>

        {/* Live indicator */}
        {status === 'live' && (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 8px',
              backgroundColor: 'rgba(74, 222, 128, 0.15)',
              color: '#4ade80',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#4ade80',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            LIVE
          </span>
        )}

        {/* Countdown */}
        {status === 'future' && daysUntil !== null && (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 10,
              color: 'var(--text-tertiary)',
              marginLeft: 'auto',
            }}
          >
            T-{daysUntil}d
          </span>
        )}

        {/* Past label */}
        {status === 'past' && (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 9,
              color: 'var(--text-tertiary)',
              marginLeft: 'auto',
            }}
          >
            COMPLETED
          </span>
        )}
      </div>

      {/* Data row: dates + location */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          fontFamily: 'var(--font-data)',
          fontSize: 11,
          color: 'var(--text-secondary)',
          marginBottom: 8,
        }}
      >
        <span>{formatDateRange(event.startDate, event.endDate)}</span>
        <span style={{ color: 'var(--text-tertiary)' }}>{event.location}</span>
      </div>

      {/* Relevance */}
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {event.relevance}
      </p>

      {/* Company tags */}
      {event.robotCompanies.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 10,
          }}
        >
          {event.robotCompanies.map((company) => (
            <span
              key={company}
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: 9,
                padding: '2px 6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.03em',
              }}
            >
              {company}
            </span>
          ))}
        </div>
      )}
    </a>
  )
}
