'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const buttonStyle: React.CSSProperties = {
    fontFamily: 'var(--font-data)',
    fontSize: 11,
    color: 'var(--text-tertiary)',
    background: 'none',
    border: '1px solid var(--border-subtle)',
    padding: '3px 8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.15s, border-color 0.15s',
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span
        className="font-data"
        style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 4 }}
      >
        SHARE:
      </span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
        style={buttonStyle}
      >
        X / Twitter
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
        style={buttonStyle}
      >
        LinkedIn
      </a>
      <button
        onClick={handleCopy}
        className="share-btn"
        style={buttonStyle}
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <style>{`
        .share-btn:hover {
          color: var(--text-primary) !important;
          border-color: var(--border-strong) !important;
        }
      `}</style>
    </div>
  )
}
