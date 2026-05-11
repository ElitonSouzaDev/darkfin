import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPremium } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const isActive = searchParams.get('isActive')

  const where: Record<string, unknown> = { userId: session.user.id }
  if (type) where.type = type
  if (isActive !== null && isActive !== '') where.isActive = isActive === 'true'

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Enforce free-tier limit
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })
  if (user && !isPremium(user)) {
    const count = await prisma.transaction.count({ where: { userId: session.user.id } })
    if (count >= 10) {
      return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 403 })
    }
  }

  try {
    const body = await req.json()
    const { name, description, type, category, amount, recurrenceType, totalInstallments, dueDay, startDate } = body

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        type,
        category,
        amount: parseFloat(amount),
        recurrenceType,
        totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
        dueDay: parseInt(dueDay),
        startDate: new Date(startDate),
      },
    })

    return NextResponse.json(transaction)
  } catch {
    return NextResponse.json({ error: 'Erro ao criar transação' }, { status: 500 })
  }
}
