'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export type Plan = 'free' | 'premium'

export function usePlan() {
  const { data: session } = useSession()
  const [plan, setPlan] = useState<Plan | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/plan')
      .then(r => r.json())
      .then(d => setPlan(d.plan ?? 'free'))
      .catch(() => setPlan('free'))
  }, [session?.user?.id])

  return plan
}
