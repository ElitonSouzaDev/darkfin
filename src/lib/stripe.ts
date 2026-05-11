import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export function isPremium(user: { plan: string; planExpiresAt: Date | null }): boolean {
  if (user.plan !== 'premium') return false
  if (user.planExpiresAt && user.planExpiresAt < new Date()) return false
  return true
}
