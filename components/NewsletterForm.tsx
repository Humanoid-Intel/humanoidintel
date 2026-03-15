'use client'

interface Props {
  label?: string
}

export function NewsletterForm({ label = 'Subscribe' }: Props) {
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="your@email.com"
        aria-label="Email address"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          padding: '9px 12px',
          fontSize: 13,
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
          padding: '9px 12px',
          fontSize: 12,
          fontFamily: 'var(--font-head)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          border: 'none',
          cursor: 'pointer',
          textTransform: 'uppercase',
          width: '100%',
        }}
      >
        {label}
      </button>
    </form>
  )
}
