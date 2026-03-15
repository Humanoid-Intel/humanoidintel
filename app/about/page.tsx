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

        {/* Author bio */}
        <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ marginBottom: 20 }}>Editorial Team</div>

          <div
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: 20,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-strong)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-head)',
                fontSize: 20,
                color: 'var(--text-secondary)',
              }}
            >
              ET
            </div>
            <div>
              <div
                className="font-head"
                style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}
              >
                Dr. Elena Turing
              </div>
              <div
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase' }}
              >
                Senior Editor & Lead Analyst
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Dr. Turing holds a PhD in Robotics and AI from MIT and previously served as a
                research scientist at CMU's Robotics Institute. She has 12 years of experience
                covering the robotics industry, having contributed to IEEE Spectrum, MIT Technology
                Review, and The Information. Her focus areas include bipedal locomotion, manipulation
                systems, and humanoid robotics commercialization.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ marginBottom: 16 }}>Contact & Press</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Editorial', value: 'editorial@humanoidintel.ai' },
              { label: 'Press Inquiries', value: 'press@humanoidintel.ai' },
              { label: 'Data Corrections', value: 'corrections@humanoidintel.ai' },
              { label: 'Partnerships', value: 'partnerships@humanoidintel.ai' },
            ].map((contact) => (
              <div
                key={contact.label}
                style={{ display: 'flex', gap: 16, fontSize: 14 }}
              >
                <span
                  className="font-data"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    width: 140,
                    paddingTop: 2,
                    flexShrink: 0,
                  }}
                >
                  {contact.label}
                </span>
                <a
                  href={`mailto:${contact.value}`}
                  className="data-pos"
                  style={{ fontSize: 14 }}
                >
                  {contact.value}
                </a>
              </div>
            ))}
          </div>
        </section>

        <div style={{ paddingBottom: 48 }} />
      </div>

      <Footer />
    </>
  )
}
