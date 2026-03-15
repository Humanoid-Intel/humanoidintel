'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import SearchModal from './SearchModal'

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
  const [searchOpen, setSearchOpen] = useState(false)

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
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

        {/* Right: X link + Search + Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* X / Twitter */}
          <a
            href="https://x.com/HumanoidIntelAI"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow @HumanoidIntelAI on X"
            className="hidden md:flex items-center"
            style={{ color: 'var(--text-secondary)', lineHeight: 1 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Search button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
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
    </>
  )
}
