'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { IncomeExpenseBar } from '@/components/charts/IncomeExpenseBar'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import {
  formatCurrency, getCategoryLabel, getCurrentYearMonth,
  capitalizeFirst, formatMonth, CATEGORY_COLORS,
} from '@/lib/utils'

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  pendingIncome: number
  pendingExpenses: number
  pendingCount: number
  doneCount: number
  totalItems: number
  monthlyHistory: { label: string; income: number; expenses: number }[]
  categoryData: { category: string; amount: number; color: string }[]
  recentEntries: {
    id: string; name: string; type: string
    category: string; amount: number; isDone: boolean; dueDay: number
  }[]
}

function StatCard({ title, value, icon: Icon, color, sub, delay }: any) {
  return (
    <Card delay={delay} className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-white truncate">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

function CategoryBar({ category, amount, total, color, delay }: {
  category: string; amount: number; total: number; color: string; delay: number
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-gray-300 font-medium">{getCategoryLabel(category)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{pct.toFixed(1)}%</span>
          <span className="font-semibold text-red-400 w-24 text-right">{formatCurrency(amount)}</span>
        </div>
      </div>
      <div className="w-full bg-dark-border rounded-full h-1.5 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: delay + 0.1 }}
          className="h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { year, month } = getCurrentYearMonth()

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const progressPct = data.totalItems > 0 ? Math.round((data.doneCount / data.totalItems) * 100) : 0

  // Sort categories by amount desc
  const sortedCategories = [...data.categoryData].sort((a, b) => b.amount - a.amount)
  const top5 = sortedCategories.slice(0, 5)
  const rest = sortedCategories.slice(5)
  const restTotal = rest.reduce((s, c) => s + c.amount, 0)

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Visão geral de ${capitalizeFirst(formatMonth(year, month))}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(data.totalIncome)}
          icon={TrendingUp}
          color="bg-emerald-500/15 text-emerald-400"
          sub={`${formatCurrency(data.pendingIncome)} a receber`}
          delay={0}
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(data.totalExpenses)}
          icon={TrendingDown}
          color="bg-red-500/15 text-red-400"
          sub={`${formatCurrency(data.pendingExpenses)} a pagar`}
          delay={0.05}
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(data.balance)}
          icon={Wallet}
          color={data.balance >= 0 ? 'bg-blue-500/15 text-blue-400' : 'bg-orange-500/15 text-orange-400'}
          sub={data.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
          delay={0.1}
        />
        <StatCard
          title="Pendências"
          value={String(data.pendingCount)}
          icon={Clock}
          color="bg-yellow-500/15 text-yellow-400"
          sub={`${data.doneCount}/${data.totalItems} concluídos`}
          delay={0.15}
        />
      </div>

      {/* Progress bar */}
      <Card delay={0.2} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-gray-300">Progresso do mês</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">{progressPct}%</span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{data.doneCount} concluídos</span>
          <span>{data.pendingCount} pendentes</span>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4 mb-6">
        <Card delay={0.25} className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Histórico — Últimos 6 meses</h3>
          <IncomeExpenseBar data={data.monthlyHistory} />
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-xs text-gray-500">Receita</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500" /><span className="text-xs text-gray-500">Despesa</span></div>
          </div>
        </Card>
        <Card delay={0.3} className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Gastos por categoria</h3>
          <CategoryDonut data={data.categoryData} />
        </Card>
      </div>

      {/* Category breakdown */}
      {sortedCategories.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <Card delay={0.35}>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Maiores gastos do mês</h3>
            {top5.map((c, i) => (
              <CategoryBar
                key={c.category}
                category={c.category}
                amount={c.amount}
                total={data.totalExpenses}
                color={c.color}
                delay={0.4 + i * 0.06}
              />
            ))}
            {rest.length > 0 && (
              <CategoryBar
                category="other_expense"
                amount={restTotal}
                total={data.totalExpenses}
                color={CATEGORY_COLORS.other_expense}
                delay={0.4 + top5.length * 0.06}
              />
            )}
          </Card>

          {/* Recent entries */}
          <Card delay={0.4}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300">Lançamentos recentes</h3>
              <a href="/dashboard/monthly" className="text-xs text-emerald-400 hover:text-emerald-300">
                Ver todos →
              </a>
            </div>
            {data.recentEntries.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-600">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-sm">Nenhum lançamento neste mês</p>
                <a href="/dashboard/transactions" className="text-emerald-400 text-sm mt-2 hover:underline">
                  Adicionar transações →
                </a>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[280px]">
                {data.recentEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-dark-bg/50 hover:bg-dark-hover transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.isDone ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{entry.name}</p>
                      <p className="text-xs text-gray-500">{getCategoryLabel(entry.category)} · dia {entry.dueDay}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${entry.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </p>
                      <Badge variant={entry.isDone ? 'green' : 'gray'} className="text-[10px]">
                        {entry.isDone ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* All entries table (when no category data) */}
      {sortedCategories.length === 0 && (
        <Card delay={0.35}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Lançamentos do mês</h3>
            <a href="/dashboard/monthly" className="text-xs text-emerald-400 hover:text-emerald-300">Ver todos →</a>
          </div>
          <div className="flex flex-col items-center py-8 text-gray-600">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">Nenhum lançamento neste mês</p>
            <a href="/dashboard/transactions" className="text-emerald-400 text-sm mt-2 hover:underline">Adicionar transações →</a>
          </div>
        </Card>
      )}
    </div>
  )
}
