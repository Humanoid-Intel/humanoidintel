import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const NAV_LINKS = [
  { label: 'News', href: '/news' },
  { label: 'Companies', href: '/companies' },
  { label: 'Robots', href: '/robots' },
  { label: 'Funding', href: '/funding' },
]

export default function NotFound() {
  return (
    <>
      <Header />

      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 16px',
          background: 'var(--bg-base)',
        }}
      >
        <h1
          className="font-head"
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          404 // Page Not Found
        </h1>

        <p
          className="font-data"
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 32,
            textAlign: 'center',
            maxWidth: 440,
          }}
        >
          The requested endpoint returned no data. Try searching or navigate to a
          known section below.
        </p>

        {/* Search prompt aesthetic */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 36,
            padding: '10px 16px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 4,
            background: 'var(--bg-panel)',
            maxWidth: 400,
            width: '100%',
          }}
        >
          <span
            className="font-data"
            style={{ fontSize: 12, color: 'var(--accent-positive)', flexShrink: 0 }}
          >
            $&gt;
          </span>
          <span
            className="font-data"
            style={{ fontSize: 12, color: 'var(--text-tertiary)' }}
          >
            navigate to a section below...
          </span>
        </div>

        {/* Navigation links */}
        <nav
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-data"
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--accent-positive)',
                textDecoration: 'none',
                padding: '8px 16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                transition: 'border-color 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </main>

      <Footer />
    </>
  )
}
