'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { label: 'Terminal', href: '/' },
  { label: 'Newsfeed', href: '/news' },
  { label: 'Robot DB', href: '/robots' },
  { label: 'Companies', href: '/companies' },
  { label: 'Funding', href: '/funding' },
  { label: 'Research', href: '/research' },
  { label: 'Glossary', href: '/glossary' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-strong)',
      }}
    >
      {/* Main header row */}
      <div
        style={{ padding: '12px 16px' }}
        className="flex items-center justify-between gap-4"
      >
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: 'var(--accent-positive)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            HUMANOID.INTEL
          </span>
        </Link>

        {/* Center: Nav — desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: isActive(link.href)
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color =
                  'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = isActive(
                  link.href,
                )
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search button */}
          <button
            type="button"
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⌘K Search
          </button>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden flex flex-col gap-1 p-1"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            style={{ cursor: 'pointer' }}
          >
            <span
              style={{
                display: 'block',
                width: 18,
                height: 1.5,
                backgroundColor: mobileOpen
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                transition: 'background-color 0.15s',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 18,
                height: 1.5,
                backgroundColor: mobileOpen
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                transition: 'background-color 0.15s',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 18,
                height: 1.5,
                backgroundColor: mobileOpen
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                transition: 'background-color 0.15s',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav
          className="md:hidden"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: isActive(link.href)
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
