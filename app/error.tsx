'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 16px',
        background: 'var(--bg-base)',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginBottom: 8,
            lineHeight: 1.6,
          }}
        >
          A runtime error occurred while rendering this page.
        </p>

        {error.digest && (
          <p
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginBottom: 24,
            }}
          >
            Digest: {error.digest}
          </p>
        )}

        <button
          type="button"
          onClick={() => reset()}
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--accent-positive)',
            background: 'none',
            border: '1px solid var(--accent-positive)',
            borderRadius: 4,
            padding: '10px 24px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          Retry
        </button>
      </div>
    </main>
  )
}
