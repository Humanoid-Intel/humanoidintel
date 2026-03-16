'use client'

import { useState } from 'react'

// Buttondown username — must match account at buttondown.email
const BD_USERNAME = 'humanoidintel'
const BD_EMBED_URL = `https://buttondown.email/api/emails/embed-subscribe/${BD_USERNAME}`

interface Props {
  label?: string
}

export function NewsletterForm({ label = 'Subscribe' }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const body = new URLSearchParams({ email })
      const res = await fetch(BD_EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      // Buttondown embed returns 200/201 on success; 422 = already subscribed (treat as success)
      if (res.ok || res.status === 201 || res.status === 422) {
        setStatus('success')
        setEmail('')
      } else {
        setErrorMsg('Something went wrong. Try again or email info@humanoidintel.ai')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--accent-positive)',
          fontSize: 13,
          color: 'var(--accent-positive)',
          fontFamily: 'var(--font-data)',
        }}
      >
        ✓ You&apos;re on the list. First issue coming your way.
      </div>
    )
  }

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address"
        required
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
        disabled={status === 'loading'}
        style={{
          backgroundColor: 'var(--accent-positive)',
          color: '#050608',
          padding: '9px 12px',
          fontSize: 12,
          fontFamily: 'var(--font-head)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          border: 'none',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          textTransform: 'uppercase',
          width: '100%',
          opacity: status === 'loading' ? 0.7 : 1,
          transition: 'opacity 0.1s',
        }}
      >
        {status === 'loading' ? 'Subscribing…' : label}
      </button>
      {status === 'error' && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--accent-negative)',
            fontFamily: 'var(--font-data)',
            marginTop: 2,
          }}
        >
          {errorMsg}
        </div>
      )}
    </form>
  )
}
