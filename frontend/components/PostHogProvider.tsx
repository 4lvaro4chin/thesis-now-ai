'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
      console.log('[PostHog] Initializing with key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'MISSING')

      posthog.init(apiKey || '', {
        capture_pageview: false,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: { password: true, email: false },
        },
      })

      console.log('[PostHog] Initialized:', posthog)
    }
  }, [])

  useEffect(() => {
    if (pathname) {
      const url = `${pathname}${searchParams?.toString() ? '?' + searchParams.toString() : ''}`
      console.log('[PostHog] Capturing pageview:', url)
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
