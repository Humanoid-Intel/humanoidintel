import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — humanoidintel.ai',
  description: 'How humanoidintel.ai collects and uses data.',
  alternates: { canonical: 'https://humanoidintel.ai/privacy' },
  openGraph: {
    title: 'Privacy Policy — humanoidintel.ai',
    description: 'How humanoidintel.ai collects and uses data.',
    url: 'https://humanoidintel.ai/privacy',
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

const privacySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description: 'How humanoidintel.ai collects and uses data.',
  url: 'https://humanoidintel.ai/privacy',
}

export default function PrivacyPage() {
  return (
    <>
      <SchemaMarkup schema={privacySchema} />
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 720 }}>
        <div style={{ padding: '32px 0 24px', borderBottom: '1px solid var(--border-strong)' }}>
          <div
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase' }}
          >
            Legal · Last updated March 2026
          </div>
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Privacy Policy
          </h1>
        </div>

        <div
          style={{
            paddingTop: 32,
            paddingBottom: 64,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}
        >
          <section>
            <h2
              className="font-head"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}
            >
              Overview
            </h2>
            <p>
              humanoidintel.ai is a free intelligence platform for the humanoid robotics industry.
              We collect minimal data and do not sell or share your personal information with third parties
              for commercial purposes.
            </p>
          </section>

          <section>
            <h2
              className="font-head"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}
            >
              Analytics
            </h2>
            <p>
              We use two privacy-conscious analytics tools to understand how the site is used:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Plausible Analytics</strong> — a
                privacy-first, cookieless analytics service. Plausible does not use cookies, does not
                collect personal data, and is fully GDPR compliant. No consent banner is required.
                See{' '}
                <a
                  href="https://plausible.io/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-positive)' }}
                >
                  plausible.io/privacy
                </a>
                .
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Google Analytics (GA4)</strong> — we
                use GA4 to measure traffic and engagement. Google Analytics may set cookies on your
                device. You can opt out using{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-positive)' }}
                >
                  Google&apos;s opt-out browser add-on
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="font-head"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}
            >
              Newsletter
            </h2>
            <p>
              If you subscribe to the humanoidintel.ai newsletter, your email address is stored
              by{' '}
              <a
                href="https://buttondown.email/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-positive)' }}
              >
                Buttondown
              </a>
              , our email service provider. We use your email solely to send the weekly intelligence
              briefing. We do not share subscriber lists with any third party. You can unsubscribe at
              any time via the link in any email we send.
            </p>
          </section>

          <section>
            <h2
              className="font-head"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}
            >
              Data We Do Not Collect
            </h2>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>We do not require account registration to use the site.</li>
              <li>We do not collect names, phone numbers, or location data.</li>
              <li>We do not run advertising networks or sell audience data.</li>
              <li>We do not use tracking pixels from social networks.</li>
            </ul>
          </section>

          <section>
            <h2
              className="font-head"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}
            >
              Third-Party Links
            </h2>
            <p>
              humanoidintel.ai links to external sites including arXiv, company websites, and news
              sources. We are not responsible for the privacy practices of those sites.
            </p>
          </section>

          <section>
            <h2
              className="font-head"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}
            >
              Contact
            </h2>
            <p>
              Questions about this policy? Email{' '}
              <a
                href="mailto:info@humanoidintel.ai"
                style={{ color: 'var(--accent-positive)' }}
              >
                info@humanoidintel.ai
              </a>
              .
            </p>
          </section>

          <div
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}
          >
            <Link href="/" style={{ color: 'var(--text-tertiary)' }}>← Back to humanoidintel.ai</Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
