'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong!</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>{error.message || "Unknown error"}</p>
                    <button type="button"
                        onClick={() => reset()}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: '#fff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
