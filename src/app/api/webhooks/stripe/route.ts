import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const cs = event.data.object as Stripe.Checkout.Session
      let userId: string | undefined

      if (cs.subscription) {
        const sub = await stripe.subscriptions.retrieve(cs.subscription as string)
        userId = sub.metadata?.userId
      }
      userId = userId ?? (cs.metadata?.userId as string | undefined)

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'premium',
            planExpiresAt: null,
            stripeSubscriptionId: cs.subscription as string | null,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: 'free', stripeSubscriptionId: null },
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      const subId = (inv as unknown as { subscription?: string }).subscription
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.userId
        if (userId) console.warn(`Payment failed for user ${userId}`)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
