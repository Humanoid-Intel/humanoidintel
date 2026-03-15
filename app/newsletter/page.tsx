import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Newsletter Archive — humanoidintel.ai',
  description:
    'Every edition of the humanoidintel.ai intelligence briefing — weekly analysis of humanoid robotics funding, launches, and research.',
  alternates: { canonical: 'https://humanoidintel.ai/newsletter' },
  openGraph: {
    title: 'Newsletter Archive — humanoidintel.ai',
    description:
      'Weekly humanoid robotics intelligence briefing.',
    url: 'https://humanoidintel.ai/newsletter',
  },
}

// Placeholder newsletter editions — would be populated from content/newsletter/ in production
const NEWSLETTER_EDITIONS = [
  {
    id: 'issue-012',
    date: '2026-03-10',
    title: 'Issue #012 — Figure AI BMW Expansion, Sanctuary $250M, and the New VLA Benchmarks',
    excerpt:
      'This week: Figure AI extends its BMW manufacturing partnership to five plants, Sanctuary AI closes a monster Series C, and new benchmarks show VLA models are improving 3× year-over-year.',
  },
  {
    id: 'issue-011',
    date: '2026-03-03',
    title: 'Issue #011 — Tesla Optimus Q1 Update, EU Regulatory Preview, and Boston Dynamics\' Atlas HD',
    excerpt:
      'Tesla confirms 8,000 Optimus units in Q1. The EU drafts its first humanoid robot regulatory framework. And we review Boston Dynamics\' new all-electric Atlas platform.',
  },
  {
    id: 'issue-010',
    date: '2026-02-24',
    title: 'Issue #010 — China Deployment Wave, 1X NEO Beta Delay, and the Manipulation Research Surge',
    excerpt:
      'Unitree crosses 10,000 units. 1X pushes NEO Beta to Q3. And a wave of new manipulation research papers emerges from CMU, Berkeley, and Stanford.',
  },
  {
    id: 'issue-009',
    date: '2026-02-17',
    title: "Issue #009 — NVIDIA Isaac Lab 2.0, Apptronik's Mercedes Deal, and the WBC Frontier",
    excerpt:
      'NVIDIA releases Isaac Lab 2.0 with 10× faster sim throughput. Apptronik deepens its Mercedes-Benz collaboration. And we break down whole-body control advances.',
  },
  {
    id: 'issue-008',
    date: '2026-02-10',
    title: 'Issue #008 — humanoidintel.ai State of Humanoids 2026 Special Report',
    excerpt:
      'Our annual deep-dive: 47 humanoid platforms tracked, $4.2B raised YTD, and the key technical milestones that will define the next 12 months.',
  },
  {
    id: 'issue-007',
    date: '2026-02-03',
    title: 'Issue #007 — Agility Digit V5 Deployment, Research Roundup, and Policy Watch',
    excerpt:
      'Digit V5 goes live in more Amazon facilities. Our monthly research roundup covers 12 papers from ICRA. And we analyze the latest US and EU policy signals.',
  },
]

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function NewsletterPage() {
  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 860 }}>
        {/* Newsletter CTA at top */}
        <div
          style={{
            borderTop: '2px solid var(--accent-positive)',
            backgroundColor: 'var(--bg-surface)',
            padding: '24px',
            marginTop: 24,
            marginBottom: 32,
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              className="font-data"
              style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase' }}
            >
              Intelligence Briefing · Weekly
            </div>
            <h1
              className="font-head"
              style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}
            >
              The humanoidintel.ai Newsletter
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Join 12,400+ robotics engineers, VCs, and founders receiving weekly intelligence on
              humanoid robotics funding, product launches, research breakthroughs, and market analysis.
            </p>
            <p
              className="font-data"
              style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}
            >
              Weekly. No spam. Unsubscribe any time.
            </p>
          </div>

          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            action="https://buttondown.email/api/emails/embed-subscribe/humanoidintel"
            method="post"
          >
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email address for newsletter"
              style={{
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'var(--font-ui)',
                outline: 'none',
                width: '100%',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--accent-positive)',
                color: '#050608',
                padding: '10px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                width: '100%',
              }}
            >
              Subscribe Free
            </button>
          </form>
        </div>

        {/* Archive list */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-strong)', marginBottom: 0 }}>
          <h2
            className="font-head"
            style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Past Editions
          </h2>
        </div>

        <div>
          {NEWSLETTER_EDITIONS.map((edition) => (
            <div
              key={edition.id}
              style={{
                padding: '22px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}
              >
                {formatDate(edition.date)}
              </div>

              <h3
                className="font-head"
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                  marginBottom: 8,
                }}
              >
                {edition.title}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {edition.excerpt}
              </p>

              {/* "Read" link — would go to newsletter detail in production */}
              <span
                className="font-data"
                style={{
                  fontSize: 11,
                  color: 'var(--accent-positive)',
                  cursor: 'pointer',
                }}
              >
                Read Issue →
              </span>
            </div>
          ))}
        </div>

        {/* Empty state note */}
        <div
          style={{
            padding: '24px 0',
            fontSize: 13,
            color: 'var(--text-tertiary)',
          }}
        >
          Newsletter editions from{' '}
          <code
            className="font-data"
            style={{
              fontSize: 12,
              backgroundColor: 'var(--bg-surface)',
              padding: '2px 6px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            content/newsletter/
          </code>{' '}
          will appear here automatically when added.
        </div>

        <div style={{ paddingBottom: 48 }} />
      </div>

      <Footer />
    </>
  )
}
