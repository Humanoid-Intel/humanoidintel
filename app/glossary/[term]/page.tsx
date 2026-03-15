import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { getGlossaryTerms, getGlossaryTerm } from '@/lib/content'
import { generateFAQSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ term: string }>
}

export async function generateStaticParams() {
  const terms = getGlossaryTerms()
  return terms.map((t) => ({ term: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params
  const result = await getGlossaryTerm(slug)
  if (!result) return { title: 'Term Not Found — humanoidintel.ai' }

  const { term } = result
  const url = `https://humanoidintel.ai/glossary/${slug}`

  return {
    title: `${term.term} — Humanoid Robotics Glossary — humanoidintel.ai`,
    description: term.definition,
    alternates: { canonical: url },
    openGraph: {
      title: `${term.term} — humanoidintel.ai`,
      description: term.definition,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params
  const result = await getGlossaryTerm(slug)

  if (!result) {
    notFound()
  }

  const { term, content } = result

  const allTerms = getGlossaryTerms()
  const relatedTerms = allTerms.filter(
    (t) =>
      t.slug !== slug &&
      (term.relatedTerms?.includes(t.slug) ||
        term.relatedTerms?.includes(t.term) ||
        t.category === term.category),
  ).slice(0, 6)

  // FAQ schema from definition
  const faqSchema = generateFAQSchema([
    { q: `What is ${term.term}?`, a: term.definition },
    { q: `What category does ${term.term} belong to?`, a: `${term.term} is a ${term.category} concept in humanoid robotics.` },
  ])

  return (
    <>
      <SchemaMarkup schema={faqSchema} />
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 1000 }}>
        {/* Breadcrumb */}
        <div
          className="font-data"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '16px 0 0' }}
        >
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Terminal</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <Link href="/glossary" style={{ color: 'var(--text-tertiary)' }}>Glossary</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{term.term}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 260px',
            gap: 32,
            marginTop: 24,
          }}
        >
          {/* Main */}
          <div>
            {/* Category badge */}
            <span className="tag" style={{ marginBottom: 16, display: 'inline-block' }}>
              {term.category}
            </span>

            {/* Term heading */}
            <h1
              className="font-head"
              style={{
                fontSize: 36,
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: 20,
                lineHeight: 1.15,
              }}
            >
              {term.term}
            </h1>

            {/* Short definition */}
            <div
              style={{
                borderLeft: '2px solid var(--accent-positive)',
                paddingLeft: 16,
                marginBottom: 28,
                fontSize: 16,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {term.definition}
            </div>

            {/* Full body content */}
            {content ? (
              <div
                className="article-body"
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                }}
              >
                Extended definition coming soon.{' '}
                <Link href="/glossary" className="data-pos">
                  Browse all terms →
                </Link>
              </div>
            )}

            {/* See also */}
            {term.seeAlso && term.seeAlso.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div className="panel-title" style={{ marginBottom: 10 }}>See Also</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {term.seeAlso.map((ref) => (
                    <Link key={ref} href={`/glossary/${ref}`} className="tag" style={{ textDecoration: 'none' }}>
                      {ref}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: related terms */}
          <aside>
            {relatedTerms.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div className="panel-title" style={{ marginBottom: 12 }}>
                  Related Terms
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {relatedTerms.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/glossary/${related.slug}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div
                        className="sibling-item"
                        style={{
                          paddingTop: 10,
                          paddingBottom: 10,
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background-color 0.1s',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            marginBottom: 2,
                          }}
                        >
                          {related.term}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {related.category}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/glossary"
              className="font-data"
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                display: 'block',
                padding: '10px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ← Full Glossary
            </Link>
          </aside>
        </div>

        <style>{`
          .article-body h1, .article-body h2, .article-body h3 {
            font-family: var(--font-head);
            color: var(--text-primary);
            margin-top: 24px;
            margin-bottom: 10px;
            font-weight: 500;
          }
          .article-body h2 { font-size: 20px; }
          .article-body h3 { font-size: 16px; }
          .article-body p { margin-bottom: 14px; }
          .article-body a { color: var(--accent-positive); text-decoration: underline; text-underline-offset: 3px; }
          .article-body ul, .article-body ol { padding-left: 20px; margin-bottom: 14px; }
          .article-body strong { color: var(--text-primary); font-weight: 600; }
        `}</style>

        <div style={{ paddingBottom: 48 }} />
      </div>

      <Footer />
    </>
  )
}
