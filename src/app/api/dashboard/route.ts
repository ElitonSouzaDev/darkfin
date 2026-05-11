import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shouldIncludeTransaction, calculateInstallmentNumber, CATEGORY_COLORS } from '@/lib/utils'
import { subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const transactions = await prisma.transaction.findMany({ where: { userId: session.user.id } })

  // Ensure current month entries exist
  for (const tx of transactions) {
    if (!shouldIncludeTransaction(tx, year, month)) continue
    const installmentNumber = tx.recurrenceType === 'installment'
      ? calculateInstallmentNumber(tx.startDate, year, month) : null
    await prisma.monthlyEntry.upsert({
      where: { transactionId_year_month: { transactionId: tx.id, year, month } },
      create: { userId: session.user.id, transactionId: tx.id, year, month, amount: tx.amount, installmentNumber },
      update: {},
    })
  }

  const currentEntries = await prisma.monthlyEntry.findMany({
    where: { userId: session.user.id, year, month },
    include: { transaction: true },
  })

  const totalIncome = currentEntries.filter(e => e.transaction.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = currentEntries.filter(e => e.transaction.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const pendingIncome = currentEntries.filter(e => e.transaction.type === 'income' && !e.isDone).reduce((s, e) => s + e.amount, 0)
  const pendingExpenses = currentEntries.filter(e => e.transaction.type === 'expense' && !e.isDone).reduce((s, e) => s + e.amount, 0)
  const pendingCount = currentEntries.filter(e => !e.isDone).length
  const doneCount = currentEntries.filter(e => e.isDone).length

  // Last 6 months history
  const monthlyHistory = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const entries = await prisma.monthlyEntry.findMany({
      where: { userId: session.user.id, year: y, month: m },
      include: { transaction: true },
    })
    monthlyHistory.push({
      label: d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
      income: entries.filter(e => e.transaction.type === 'income').reduce((s, e) => s + e.amount, 0),
      expenses: entries.filter(e => e.transaction.type === 'expense').reduce((s, e) => s + e.amount, 0),
    })
  }

  // Expense by category (current month)
  const categoryMap: Record<string, number> = {}
  currentEntries.filter(e => e.transaction.type === 'expense').forEach(e => {
    categoryMap[e.transaction.category] = (categoryMap[e.transaction.category] ?? 0) + e.amount
  })
  const categoryData = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    color: CATEGORY_COLORS[category] ?? '#6b7280',
  }))

  return NextResponse.json({
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    pendingIncome,
    pendingExpenses,
    pendingCount,
    doneCount,
    totalItems: currentEntries.length,
    monthlyHistory,
    categoryData,
    recentEntries: currentEntries.slice(0, 8).map(e => ({
      id: e.id,
      name: e.transaction.name,
      type: e.transaction.type,
      category: e.transaction.category,
      amount: e.amount,
      isDone: e.isDone,
      dueDay: e.transaction.dueDay,
    })),
  })
}
