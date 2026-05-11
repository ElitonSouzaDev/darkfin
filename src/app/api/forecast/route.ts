import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shouldIncludeTransaction, calculateInstallmentNumber } from '@/lib/utils'
import { addMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') ?? '12')

  const transactions = await prisma.transaction.findMany({ where: { userId: session.user.id } })

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Base: despesas e receitas do mês atual
  let baseExpenses = 0
  let baseIncome = 0
  for (const tx of transactions) {
    if (!shouldIncludeTransaction(tx, currentYear, currentMonth)) continue
    if (tx.type === 'income') baseIncome += tx.amount
    else baseExpenses += tx.amount
  }

  // Marcos: quando cada parcela encerra
  const milestones: { name: string; amount: number; endLabel: string; endYear: number; endMonth: number }[] = []
  for (const tx of transactions) {
    if (tx.recurrenceType !== 'installment' || !tx.isActive || !tx.totalInstallments) continue
    const startDate = new Date(tx.startDate)
    const lastInstallment = addMonths(startDate, tx.totalInstallments - 1)
    const endYear = lastInstallment.getFullYear()
    const endMonth = lastInstallment.getMonth() + 1
    milestones.push({
      name: tx.name,
      amount: tx.amount,
      endYear,
      endMonth,
      endLabel: lastInstallment.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
    })
  }
  milestones.sort((a, b) => (a.endYear * 12 + a.endMonth) - (b.endYear * 12 + b.endMonth))

  // Projeção mês a mês
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

    // Parcelas encerrando NESTE mês específico
    const ending = milestones.filter(m => m.endYear === year && m.endMonth === month)

    forecast.push({
      label: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
      fullLabel: date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      year,
      month,
      income,
      expenses,
      balance: income - expenses,
      expenseDiff: expenses - baseExpenses, // negativo = economia vs hoje
      ending,
    })
  }

  return NextResponse.json({ baseExpenses, baseIncome, milestones, forecast })
}
