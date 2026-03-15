import Link from 'next/link'

const siteLinks = [
  { label: 'Home', href: '/' },
  { label: 'Newsfeed', href: '/news' },
  { label: 'Robot DB', href: '/robots' },
  { label: 'Companies', href: '/companies' },
  { label: 'Funding', href: '/funding' },
]

const dataLinks = [
  { label: 'Research Hub', href: '/research' },
  { label: 'Glossary', href: '/glossary' },
  { label: 'Newsletter', href: '/newsletter' },
  { label: 'About', href: '/about' },
]

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-panel)',
        padding: '24px 16px 0',
        fontSize: 12,
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
          paddingBottom: 24,
        }}
      >
        {/* Left: Brand + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                backgroundColor: 'var(--accent-positive)',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
              }}
            >
              HUMANOID.INTEL
            </span>
          </div>
          <p
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 240,
            }}
          >
            The definitive intelligence platform for humanoid robotics.
          </p>
        </div>

        {/* Center: Nav columns */}
        <div style={{ display: 'flex', gap: 40 }}>
          {/* Site */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                marginBottom: 4,
              }}
            >
              Site
            </span>
            {siteLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                marginBottom: 4,
              }}
            >
              Data
            </span>
            {dataLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Newsletter CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-tertiary)',
            }}
          >
            Intelligence Briefing
          </span>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Weekly dispatch on humanoid robotics funding, launches, and research.
          </p>
          <form
            action="https://buttondown.email/api/emails/embed-subscribe/humanoidintel"
            method="post"
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email address for newsletter"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                fontSize: 12,
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
                padding: '8px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                letterSpacing: '0.03em',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 0',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-tertiary)',
          fontSize: 11,
          fontFamily: 'var(--font-data)',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>© 2026 humanoidintel.ai</span>
          <span>Built for the intelligence age</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/about" style={{ color: 'var(--text-tertiary)' }}>
            About
          </Link>
          <Link href="/privacy" style={{ color: 'var(--text-tertiary)' }}>
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
