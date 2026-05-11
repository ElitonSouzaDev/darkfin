'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export type Plan = 'free' | 'premium'

export function usePlan() {
  const { data: session } = useSession()
  const [plan, setPlan] = useState<Plan | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    // First get local plan immediately, then sync with Stripe in background
    fetch('/api/user/plan')
      .then(r => r.json())
      .then(d => setPlan(d.plan ?? 'free'))
      .catch(() => setPlan('free'))

    // Sync with Stripe to catch any webhook-missed changes
    fetch('/api/user/sync-plan', { method: 'POST' })
      .then(r => r.json())
      .then(d => { if (d.plan) setPlan(d.plan) })
      .catch(() => null)
  }, [session?.user?.id])

  return plan
}
