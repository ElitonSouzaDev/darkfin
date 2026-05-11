import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Find user by any Stripe identifier available
async function findUserByStripe(opts: { customerId?: string; subscriptionId?: string; userId?: string }) {
  const { customerId, subscriptionId, userId } = opts

  if (userId) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (u) return u.id
  }
  if (subscriptionId) {
    const u = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId }, select: { id: true } })
    if (u) return u.id
  }
  if (customerId) {
    const u = await prisma.user.findFirst({ where: { stripeCustomerId: customerId }, select: { id: true } })
    if (u) return u.id
  }
  return null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[webhook] Event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session
        const subId = cs.subscription as string | null
        const customerId = cs.customer as string | null

        let sub: Stripe.Subscription | null = null
        if (subId) sub = await stripe.subscriptions.retrieve(subId)

        const userId = await findUserByStripe({
          userId: sub?.metadata?.userId ?? cs.metadata?.userId,
          subscriptionId: subId ?? undefined,
          customerId: customerId ?? undefined,
        })

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: 'premium', planExpiresAt: null, stripeSubscriptionId: subId },
          })
          console.log(`[webhook] Upgraded user ${userId} to premium`)
        } else {
          console.warn('[webhook] checkout.session.completed: user not found', { subId, customerId })
        }
        break
      }

      // Handles cancellation and any status change (active → canceled, past_due, etc.)
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const userId = await findUserByStripe({
          userId: sub.metadata?.userId,
          subscriptionId: sub.id,
          customerId,
        })

        if (userId) {
          const isActive = ['active', 'trialing'].includes(sub.status)
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: isActive ? 'premium' : 'free',
              stripeSubscriptionId: isActive ? sub.id : null,
            },
          })
          console.log(`[webhook] User ${userId} plan → ${isActive ? 'premium' : 'free'} (status: ${sub.status})`)
        } else {
          console.warn(`[webhook] ${event.type}: user not found`, { subId: sub.id, customerId })
        }
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        const customerId = inv.customer as string | null
        if (customerId) {
          const userId = await findUserByStripe({ customerId })
          if (userId) console.warn(`[webhook] Payment failed for user ${userId}`)
        }
        break
      }
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
