import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { NewsletterForm } from '@/components/NewsletterForm'
import { getNewsletterEditions } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Newsletter Archive — humanoidintel.ai',
  description:
    'Every edition of the humanoidintel.ai intelligence briefing — weekly analysis of humanoid robotics funding, launches, and research.',
  alternates: { canonical: 'https://humanoidintel.ai/newsletter' },
  openGraph: {
    title: 'Newsletter Archive — humanoidintel.ai',
    description: 'Weekly humanoid robotics intelligence briefing.',
    url: 'https://humanoidintel.ai/newsletter',
  },
}

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

const newsletterSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Newsletter Archive',
  description: 'Every edition of the humanoidintel.ai intelligence briefing — weekly analysis of humanoid robotics funding, launches, and research.',
  url: 'https://humanoidintel.ai/newsletter',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Newsletter', item: 'https://humanoidintel.ai/newsletter' },
    ],
  },
}

export default function NewsletterPage() {
  const editions = getNewsletterEditions()

  return (
    <>
      <SchemaMarkup schema={newsletterSchema} />
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
              The go-to weekly briefing for robotics engineers, VCs, and founders — covering
              humanoid robotics funding, product launches, research breakthroughs, and market analysis.
            </p>
            <p
              className="font-data"
              style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}
            >
              Weekly. No spam. Unsubscribe any time.
            </p>
          </div>

          <NewsletterForm label="Subscribe Free" />
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

        {editions.length > 0 ? (
          <div>
            {editions.map((edition) => (
              <div
                key={edition.slug}
                style={{
                  padding: '22px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="font-data"
                  style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}
                >
                  {edition.edition > 0 && `Issue #${String(edition.edition).padStart(3, '0')} · `}
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

                <Link
                  href={`/newsletter/${edition.slug}`}
                  className="font-data"
                  style={{
                    fontSize: 11,
                    color: 'var(--accent-positive)',
                    textDecoration: 'none',
                  }}
                >
                  Read Issue →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '40px 0',
              fontSize: 14,
              color: 'var(--text-tertiary)',
              textAlign: 'center',
            }}
          >
            Issue #001 is on its way. Subscribe above to be the first to receive it.
          </div>
        )}

        <div style={{ paddingBottom: 48 }} />
      </div>

      <Footer />
    </>
  )
}
