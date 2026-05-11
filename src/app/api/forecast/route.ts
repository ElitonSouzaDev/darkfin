import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shouldIncludeTransaction } from '@/lib/utils'
import { addMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') ?? '12')

  const transactions = await prisma.transaction.findMany({ where: { userId: session.user.id } })

  // Get current balance from this month's done entries
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const doneEntries = await prisma.monthlyEntry.findMany({
    where: { userId: session.user.id, year: currentYear, month: currentMonth, isDone: true },
    include: { transaction: true },
  })

  let runningBalance = doneEntries.reduce((sum, e) => {
    return sum + (e.transaction.type === 'income' ? e.amount : -e.amount)
  }, 0)

  const forecast = []

  for (let i = 1; i <= months; i++) {
    const date = addMonths(now, i)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    let income = 0
    let expenses = 0

    for (const tx of transactions) {
      if (!shouldIncludeTransaction(tx, year, month)) continue
      if (tx.type === 'income') income += tx.amount
      else expenses += tx.amount
    }

    runningBalance += income - expenses

    forecast.push({
      label: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
      fullLabel: date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      year,
      month,
      income,
      expenses,
      balance: income - expenses,
      runningBalance,
    })
  }

  return NextResponse.json({ forecast })
}
