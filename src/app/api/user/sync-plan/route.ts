import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// Syncs the user's plan by querying Stripe directly
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, stripeCustomerId: true, stripeSubscriptionId: true, planExpiresAt: true },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // If plan expires at a fixed date (manually granted), don't override
    if (user.planExpiresAt) {
      const isPremium = user.planExpiresAt > new Date()
      return NextResponse.json({ plan: isPremium ? 'premium' : 'free', synced: false })
    }

    // No Stripe customer → free
    if (!user.stripeCustomerId) {
      return NextResponse.json({ plan: 'free', synced: false })
    }

    // Query Stripe for active subscriptions
    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    })

    const hasActive = subs.data.length > 0
    const activeSub = subs.data[0] ?? null

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: hasActive ? 'premium' : 'free',
        stripeSubscriptionId: hasActive ? activeSub.id : null,
      },
    })

    return NextResponse.json({ plan: hasActive ? 'premium' : 'free', synced: true })
  } catch (err) {
    console.error('[sync-plan]', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
