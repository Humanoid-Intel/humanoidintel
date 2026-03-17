import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { getArticles, getArticle, getCompanies, getRobots } from '@/lib/content'
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo'
import { NewsletterForm } from '@/components/NewsletterForm'
import ShareButtons from '@/components/ShareButtons'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = getArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getArticle(slug)
  if (!result) return { title: 'Article Not Found — humanoidintel.ai' }

  const { article } = result
  const url = `https://humanoidintel.ai/news/${slug}`

  return {
    title: `${article.title} — humanoidintel.ai`,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      creator: '@humanoidintel',
    },
  }
}

function formatDate(dateStr: string, includeTime = false) {
  if (!dateStr) return ''
  try {
    const opts: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    }
    if (includeTime) {
      opts.hour = '2-digit'
      opts.minute = '2-digit'
      opts.hour12 = false
      opts.timeZoneName = 'short'
    }
    return new Date(dateStr).toLocaleDateString('en-US', opts)
  } catch {
    return dateStr
  }
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    breaking: 'BREAKING',
    'deep-dive': 'DEEP DIVE',
    market: 'MARKET',
    policy: 'POLICY',
    research: 'RESEARCH',
  }
  return map[cat] ?? cat.toUpperCase()
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const result = await getArticle(slug)

  if (!result) {
    notFound()
  }

  const { article, content, faqs } = result

  // Calculate reading time from content (strip HTML tags first)
  const plainText = content.replace(/<[^>]*>/g, '')
  const readingTime = Math.ceil(plainText.split(/\s+/).length / 200)

  const allArticles = getArticles()
  const allCompanies = getCompanies()
  const allRobots = getRobots()

  // Related articles: same category, excluding current
  const related = allArticles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 4)

  // Resolve company and robot profile links from frontmatter
  const mentionedCompanies = (article.companies ?? [])
    .map((name) => allCompanies.find((c) => c.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean)

  const mentionedRobots = (article.robots ?? [])
    .map((name) => allRobots.find((r) => r.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean)

  const articleSchema = generateArticleSchema(article)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Terminal', url: 'https://humanoidintel.ai' },
    { name: 'Newsfeed', url: 'https://humanoidintel.ai/news' },
    { name: article.title, url: `https://humanoidintel.ai/news/${article.slug}` },
  ])
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null

  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      {faqSchema && <SchemaMarkup schema={faqSchema} />}
      <Header />
      <TickerTape />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 0,
          maxWidth: 1200,
        }}
      >
        {/* Main article column */}
        <article
          style={{
            padding: '32px 32px 48px',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          {/* Breadcrumb */}
          <div
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 20 }}
          >
            <Link href="/" style={{ color: 'var(--text-tertiary)' }}>
              Terminal
            </Link>
            {' '}
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/news" style={{ color: 'var(--text-tertiary)' }}>
              Newsfeed
            </Link>
            {' '}
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{article.title.slice(0, 40)}…</span>
          </div>

          {/* Category + Breaking badge */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <span className="tag">{categoryLabel(article.category)}</span>
            {article.featured && (
              <span
                className="font-data"
                style={{
                  fontSize: 10,
                  color: 'var(--accent-negative)',
                  border: '1px solid var(--accent-negative)',
                  padding: '2px 6px',
                  textTransform: 'uppercase',
                }}
              >
                FEATURED
              </span>
            )}
          </div>

          {/* Headline */}
          <h1
            className="font-head"
            style={{
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div
            className="font-data"
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginBottom: 24,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <span>Published: {formatDate(article.date, true)}</span>
            {article.updated && (
              <span style={{ color: 'var(--accent-positive)' }}>
                Last updated: {formatDate(article.updated, true)}
              </span>
            )}
            <span>By humanoidintel.ai Editorial</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{readingTime} min read</span>
          </div>

          {/* Share buttons */}
          <div style={{ marginBottom: 24 }}>
            <ShareButtons
              title={article.title}
              url={`https://humanoidintel.ai/news/${article.slug}`}
            />
          </div>

          {/* Excerpt / TLDR block */}
          {article.excerpt && (
            <div
              style={{
                borderLeft: '2px solid var(--accent-positive)',
                paddingLeft: 16,
                marginBottom: 32,
                fontStyle: 'italic',
                fontSize: 15,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {article.excerpt}
            </div>
          )}

          {/* Article body */}
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
                padding: '40px 0',
                color: 'var(--text-tertiary)',
                fontSize: 14,
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Full article content coming soon.
            </div>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {article.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Sources */}
          {article.sources && article.sources.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                className="font-head"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-tertiary)',
                  marginBottom: 12,
                }}
              >
                Sources
              </div>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {article.sources.map((source, i) => (
                  <li
                    key={i}
                    style={{ fontSize: 13, color: 'var(--text-secondary)' }}
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="data-pos"
                      style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </article>

        {/* Right sidebar */}
        <aside style={{ padding: '32px 16px' }}>

          {/* Companies mentioned */}
          {mentionedCompanies.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>Companies</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {mentionedCompanies.map((c) => c && (
                  <Link
                    key={c.slug}
                    href={`/companies/${c.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      transition: 'border-color 0.1s',
                    }}
                    className="company-link"
                  >
                    <span style={{ color: 'var(--accent-positive)', fontSize: 10 }}>▶</span>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Robots mentioned */}
          {mentionedRobots.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>Robots</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {mentionedRobots.map((r) => r && (
                  <Link
                    key={r.slug}
                    href={`/robots/${r.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      transition: 'border-color 0.1s',
                    }}
                    className="company-link"
                  >
                    <span style={{ color: 'var(--accent-positive)', fontSize: 10 }}>▶</span>
                    {r.name}
                    <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 11 }}>{r.manufacturer}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div
                className="panel-title"
                style={{ marginBottom: 16 }}
              >
                Related Coverage
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/news/${rel.slug}`}
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <div
                      className="related-item"
                      style={{
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      <span className="tag" style={{ marginBottom: 4, display: 'inline-block' }}>
                        {categoryLabel(rel.category)}
                      </span>
                      <div
                        className="news-title"
                        style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--text-primary)' }}
                      >
                        {rel.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: 16,
            }}
          >
            <div
              className="font-head"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Stay ahead of humanoid robotics
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Weekly intelligence briefing — funding, launches, research.
            </p>
            <NewsletterForm label="Subscribe" />
          </div>
        </aside>
      </div>

      <style>{`
        .related-item:hover { background-color: var(--bg-hover); }
        .company-link:hover { border-color: var(--accent-positive) !important; color: var(--text-primary) !important; }
        .article-body h1,
        .article-body h2,
        .article-body h3,
        .article-body h4 {
          font-family: var(--font-head);
          color: var(--text-primary);
          margin-top: 28px;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .article-body h2 { font-size: 22px; }
        .article-body h3 { font-size: 18px; }
        .article-body p { margin-bottom: 16px; }
        .article-body a { color: var(--accent-positive); text-decoration: underline; text-underline-offset: 3px; }
        .article-body ul, .article-body ol {
          padding-left: 20px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .article-body blockquote {
          border-left: 2px solid var(--accent-positive);
          padding-left: 16px;
          font-style: italic;
          color: var(--text-secondary);
          margin: 20px 0;
        }
        .article-body code {
          font-family: var(--font-data);
          font-size: 13px;
          background-color: var(--bg-surface);
          padding: 2px 6px;
          border: 1px solid var(--border-subtle);
        }
        .article-body pre {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 16px;
          overflow-x: auto;
          margin-bottom: 16px;
          font-family: var(--font-data);
          font-size: 13px;
        }
        .article-body strong { color: var(--text-primary); font-weight: 600; }
      `}</style>

      <Footer />
    </>
  )
}
