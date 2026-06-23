'use client'

import { useCallback } from 'react'
import posthog from 'posthog-js'

export function useTracking() {
  const track = useCallback((event: string, props?: Record<string, unknown>) => {
    try {
      posthog.capture(event, props)
    } catch (error) {
      console.warn('[Analytics] Failed to track event:', event, error)
    }
  }, [])

  const identify = useCallback((userId: string, traits?: Record<string, unknown>) => {
    try {
      posthog.identify(userId, traits || {})
    } catch (error) {
      console.warn('[Analytics] Failed to identify user:', userId, error)
    }
  }, [])

  return { track, identify }
}
