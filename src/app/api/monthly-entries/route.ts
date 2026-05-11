import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shouldIncludeTransaction, calculateInstallmentNumber } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
  })

  // Lazy-generate MonthlyEntry records for this month
  for (const tx of transactions) {
    if (!shouldIncludeTransaction(tx, year, month)) continue

    const installmentNumber =
      tx.recurrenceType === 'installment'
        ? calculateInstallmentNumber(tx.startDate, year, month)
        : null

    await prisma.monthlyEntry.upsert({
      where: { transactionId_year_month: { transactionId: tx.id, year, month } },
      create: {
        userId: session.user.id,
        transactionId: tx.id,
        year,
        month,
        amount: tx.amount,
        installmentNumber,
      },
      update: {},
    })
  }

  const entries = await prisma.monthlyEntry.findMany({
    where: { userId: session.user.id, year, month },
    include: { transaction: true },
    orderBy: [{ transaction: { type: 'desc' } }, { transaction: { name: 'asc' } }],
  })

  return NextResponse.json(entries)
}
