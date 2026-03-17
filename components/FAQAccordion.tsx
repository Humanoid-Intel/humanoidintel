'use client'

import { useState } from 'react'

interface FAQ {
  q: string
  a: string
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {faqs.map((faq, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            style={{
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '12px 0',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                }}
              >
                {faq.q}
              </span>
              <span
                className="font-data"
                style={{
                  fontSize: 10,
                  color: 'var(--accent-positive)',
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}
              >
                ▶
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  paddingBottom: 14,
                  paddingRight: 24,
                }}
              >
                {faq.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
