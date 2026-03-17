'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 16px',
          background: '#050608',
          color: '#f2f5f8',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#f2f5f8',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: 13,
              color: '#8a9ba8',
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            A critical error occurred. The application could not recover
            automatically.
          </p>

          {error.digest && (
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#5a6a78',
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
              fontFamily: 'monospace',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#cde0d5',
              background: 'none',
              border: '1px solid #cde0d5',
              borderRadius: 4,
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  )
}
