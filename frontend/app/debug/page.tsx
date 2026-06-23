'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

export default function DebugPage() {
  const [status, setStatus] = useState<Record<string, any>>({})

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const isInitialized = posthog.has_loaded?.()

    setStatus({
      api_key: apiKey ? `${apiKey.slice(0, 10)}...` : 'MISSING',
      is_initialized: isInitialized,
      posthog_instance: typeof posthog,
      window_posthog: typeof (window as any).posthog,
    })

    // Try to capture test event
    console.log('[DEBUG] Attempting to capture test event')
    posthog.capture('debug_test_event', { timestamp: new Date().toISOString() })
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>PostHog Debug</h1>
      <pre>{JSON.stringify(status, null, 2)}</pre>
      <button
        onClick={() => {
          posthog.capture('debug_manual_event', { clicked_at: new Date().toISOString() })
          alert('Event sent! Check PostHog dashboard')
        }}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Send Test Event
      </button>
    </div>
  )
}
