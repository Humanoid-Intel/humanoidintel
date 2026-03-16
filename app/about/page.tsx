import type { Metadata } from 'next'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateOrgSchema } from '@/lib/seo'
import { getArticles, getRobots, getCompanies, getGlossaryTerms } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About — humanoidintel.ai',
  description:
    'humanoidintel.ai is the definitive intelligence platform for humanoid robotics — covering funding, robot specs, research, and market analysis.',
  alternates: { canonical: 'https://humanoidintel.ai/about' },
  openGraph: {
    title: 'About — humanoidintel.ai',
    description:
      'The definitive intelligence platform for humanoid robotics.',
    url: 'https://humanoidintel.ai/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function AboutPage() {
  const articles = getArticles()
  const robots = getRobots()
  const companies = getCompanies()
  const glossaryTerms = getGlossaryTerms()

  const orgSchema = generateOrgSchema()

  const stats = [
    { label: 'Articles Published', value: articles.length > 0 ? String(articles.length) : '200+' },
    { label: 'Robots Tracked', value: robots.length > 0 ? String(robots.length) : '45+' },
    { label: 'Companies Profiled', value: companies.length > 0 ? String(companies.length) : '30+' },
    { label: 'Glossary Terms', value: glossaryTerms.length > 0 ? String(glossaryTerms.length) : '120+' },
  ]

  return (
    <>
      <SchemaMarkup schema={orgSchema} />
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 860 }}>
        {/* Page heading */}
        <div style={{ padding: '32px 0 24px', borderBottom: '1px solid var(--border-strong)' }}>
          <div
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12 }}
          >
            ABOUT // HUMANOIDINTEL.AI
          </div>
          <h1
            className="font-head"
            style={{ fontSize: 32, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            The Definitive Intelligence Platform<br />
            for Humanoid Robotics
          </h1>
        </div>

        {/* Site stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            padding: '24px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="metric-block" style={{ marginBottom: 0 }}>
              <div className="metric-label">{stat.label}</div>
              <div className="metric-value">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ marginBottom: 16 }}>Mission</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            humanoidintel.ai exists to provide the clearest, most comprehensive window into the
            humanoid robotics industry. We believe that the development of humanoid robots will be
            one of the most consequential technological shifts of the 21st century — and that the
            people building, funding, deploying, and researching these systems deserve a dedicated
            intelligence platform.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Our mission is to serve robotics engineers, venture capitalists, corporate strategists,
            policy researchers, and curious minds who need to stay ahead of this rapidly evolving
            industry. We track funding rounds, robot specifications, research breakthroughs, and
            policy developments in real time.
          </p>
        </section>

        {/* Editorial approach */}
        <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ marginBottom: 16 }}>Editorial Approach</div>
          <div
            style={{
              borderLeft: '2px solid var(--accent-positive)',
              paddingLeft: 16,
              marginBottom: 20,
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            We are transparent about our use of AI-assisted content generation, combined with human
            editorial oversight and verification.
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
            humanoidintel.ai uses advanced AI models to assist in drafting, summarizing, and
            structuring content at scale. However, all published articles undergo review by our
            editorial team for accuracy, context, and fairness. We cite primary sources, disclose
            when information is uncertain, and correct errors promptly.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Our robot database and company profiles are maintained through a combination of public
            filings, press releases, academic papers, and direct company communications. Specification
            data may lag real-world developments and we always indicate the "last updated" date.
          </p>
        </section>

        {/* How it works */}
        <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ marginBottom: 20 }}>How It Works</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                step: '01',
                title: 'Global Signal Aggregation',
                desc: 'Our agent monitors 30+ RSS feeds spanning IEEE Spectrum, TechCrunch, The Robot Report, MIT Technology Review, Nikkei Asia, TechNode, and South China Morning Post — plus 80+ targeted Google News queries covering every major humanoid company across the US, China, Europe, and Asia. Runs every hour, around the clock.',
              },
              {
                step: '02',
                title: 'AI-Assisted Writing',
                desc: 'Stories that pass our relevance scoring (freshness, significance, novelty) are drafted by Claude, Anthropic\'s frontier model. Each article synthesizes the source material into concise, factual intelligence — citing primary sources and flagging uncertainty where it exists.',
              },
              {
                step: '03',
                title: 'Automated Publishing',
                desc: 'Qualifying articles are published directly to the site within the hour. The robot database, company profiles, funding dashboard, and research hub are maintained through a combination of primary sources, press releases, SEC filings, and academic papers.',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  gap: 20,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: 20,
                }}
              >
                <div
                  className="font-data"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--accent-positive)',
                    flexShrink: 0,
                    lineHeight: 1,
                    paddingTop: 2,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div
                    className="font-head"
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}
                  >
                    {item.title}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ marginBottom: 16 }}>Contact</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            The fastest way to reach us is on X. We read every mention and DM. For partnerships, data
            submissions, and press enquiries, email us directly.
          </p>
          <a
            href="mailto:info@humanoidintel.ai"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 16px',
              fontSize: 13,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-head)',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: 10,
              marginRight: 10,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            info@humanoidintel.ai
          </a>
          <a
            href="https://x.com/HumanoidIntelAI"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 16px',
              fontSize: 13,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-head)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            @HumanoidIntelAI
          </a>
        </section>

        <div style={{ paddingBottom: 48 }} />
      </div>

      <Footer />
    </>
  )
}
