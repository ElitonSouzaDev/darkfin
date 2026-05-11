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

  // ── 1. Busca transações e garante entradas do mês atual (2 queries) ──────
  const transactions = await prisma.transaction.findMany({ where: { userId: session.user.id } })

  const upserts = transactions
    .filter(tx => shouldIncludeTransaction(tx, year, month))
    .map(tx => {
      const installmentNumber = tx.recurrenceType === 'installment'
        ? calculateInstallmentNumber(tx.startDate, year, month) : null
      return prisma.monthlyEntry.upsert({
        where: { transactionId_year_month: { transactionId: tx.id, year, month } },
        create: { userId: session.user.id, transactionId: tx.id, year, month, amount: tx.amount, installmentNumber },
        update: {},
      })
    })
  await Promise.all(upserts)

  // ── 2. Busca entradas do mês atual + histórico dos últimos 6 meses EM UMA query ──
  const historyMonths = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }) }
  })

  const [currentEntries, historyEntries] = await Promise.all([
    prisma.monthlyEntry.findMany({
      where: { userId: session.user.id, year, month },
      include: { transaction: true },
    }),
    prisma.monthlyEntry.findMany({
      where: {
        userId: session.user.id,
        OR: historyMonths.map(m => ({ year: m.year, month: m.month })),
      },
      include: { transaction: { select: { type: true } } },
    }),
  ])

  // ── 3. Processa em memória (zero queries adicionais) ─────────────────────
  const totalIncome = currentEntries.filter(e => e.transaction.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = currentEntries.filter(e => e.transaction.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const pendingIncome = currentEntries.filter(e => e.transaction.type === 'income' && !e.isDone).reduce((s, e) => s + e.amount, 0)
  const pendingExpenses = currentEntries.filter(e => e.transaction.type === 'expense' && !e.isDone).reduce((s, e) => s + e.amount, 0)
  const pendingCount = currentEntries.filter(e => !e.isDone).length
  const doneCount = currentEntries.filter(e => e.isDone).length

  const monthlyHistory = historyMonths.map(({ year: y, month: m, label }) => {
    const entries = historyEntries.filter(e => e.year === y && e.month === m)
    return {
      label,
      income: entries.filter(e => e.transaction.type === 'income').reduce((s, e) => s + e.amount, 0),
      expenses: entries.filter(e => e.transaction.type === 'expense').reduce((s, e) => s + e.amount, 0),
    }
  })

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
