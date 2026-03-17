import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { getNewsletterEdition, getNewsletterEditions } from '@/lib/content'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const editions = getNewsletterEditions()
  // Must return at least one entry for output: 'export' — use a placeholder
  // when no editions exist yet; the page returns notFound() for it
  if (editions.length === 0) return [{ slug: '_placeholder' }]
  return editions.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getNewsletterEdition(slug)
  if (!result) return {}
  const { edition } = result
  return {
    title: `${edition.title} — humanoidintel.ai`,
    description: edition.excerpt,
    alternates: { canonical: `https://humanoidintel.ai/newsletter/${slug}` },
    openGraph: {
      title: edition.title,
      description: edition.excerpt,
      url: `https://humanoidintel.ai/newsletter/${slug}`,
    },
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default async function NewsletterEditionPage({ params }: Props) {
  const { slug } = await params
  const result = await getNewsletterEdition(slug)
  if (!result) notFound()

  const { edition, content } = result

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 760 }}>
        {/* Back link */}
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <Link
            href="/newsletter"
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', textDecoration: 'none' }}
          >
            ← Newsletter Archive
          </Link>
        </div>

        {/* Header */}
        <div
          style={{
            borderTop: '2px solid var(--accent-positive)',
            paddingTop: 20,
            marginBottom: 32,
          }}
        >
          {edition.edition > 0 && (
            <div
              className="font-data"
              style={{ fontSize: 11, color: 'var(--accent-positive)', marginBottom: 8, textTransform: 'uppercase' }}
            >
              Issue #{String(edition.edition).padStart(3, '0')}
            </div>
          )}
          <h1
            className="font-head"
            style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 12 }}
          >
            {edition.title}
          </h1>
          <div
            className="font-data"
            style={{ fontSize: 12, color: 'var(--text-tertiary)' }}
          >
            {formatDate(edition.date)} · humanoidintel.ai
          </div>
        </div>

        {/* Body */}
        <div
          className="prose"
          style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Footer CTA */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid var(--border-subtle)',
            marginBottom: 48,
            fontSize: 13,
            color: 'var(--text-tertiary)',
          }}
        >
          <Link
            href="/newsletter"
            className="font-data"
            style={{ color: 'var(--accent-positive)', textDecoration: 'none', fontSize: 11 }}
          >
            ← More editions
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
