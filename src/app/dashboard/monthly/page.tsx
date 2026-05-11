'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { formatCurrency, getCategoryLabel, getCurrentYearMonth, capitalizeFirst, formatMonth } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Entry {
  id: string
  amount: number
  isDone: boolean
  installmentNumber?: number
  transaction: {
    name: string
    type: string
    category: string
    dueDay: number
    recurrenceType: string
    totalInstallments?: number
  }
}

export default function MonthlyPage() {
  const now = getCurrentYearMonth()
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  async function load(y: number, m: number) {
    setLoading(true)
    const r = await fetch(`/api/monthly-entries?year=${y}&month=${m}`)
    setEntries(await r.json())
    setLoading(false)
  }

  useEffect(() => { load(year, month) }, [year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const n = getCurrentYearMonth()
    if (year > n.year || (year === n.year && month >= n.month)) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  async function toggle(entry: Entry) {
    setToggling(entry.id)
    try {
      const r = await fetch(`/api/monthly-entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: !entry.isDone }),
      })
      if (!r.ok) { toast.error('Erro ao atualizar'); return }
      const updated = await r.json()
      setEntries(prev => prev.map(e => e.id === entry.id ? updated : e))
      toast.success(updated.isDone
        ? (entry.transaction.type === 'income' ? '✅ Recebimento confirmado!' : '✅ Pagamento confirmado!')
        : 'Marcado como pendente'
      )
    } finally {
      setToggling(null)
    }
  }

  const income = entries.filter(e => e.transaction.type === 'income')
  const expenses = entries.filter(e => e.transaction.type === 'expense')
  const totalIncome = income.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const doneIncome = income.filter(e => e.isDone).reduce((s, e) => s + e.amount, 0)
  const doneExpenses = expenses.filter(e => e.isDone).reduce((s, e) => s + e.amount, 0)
  const doneCount = entries.filter(e => e.isDone).length
  const total = entries.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const isCurrentMonth = year === now.year && month === now.month
  const isFuture = year > now.year || (year === now.year && month > now.month)

  function EntryRow({ entry }: { entry: Entry }) {
    const isIncome = entry.transaction.type === 'income'
    const isToggling = toggling === entry.id

    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${
          entry.isDone ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-dark-bg/40 border border-transparent hover:bg-dark-hover'
        }`}
      >
        <button
          onClick={() => toggle(entry)}
          disabled={isToggling || isFuture}
          className={`flex-shrink-0 transition-all duration-200 ${isToggling ? 'opacity-50' : ''} ${isFuture ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
        >
          {entry.isDone
            ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            : <Circle className={`w-6 h-6 ${isIncome ? 'text-gray-600 hover:text-emerald-400' : 'text-gray-600 hover:text-red-400'}`} />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium transition-all ${entry.isDone ? 'text-gray-400 line-through' : 'text-white'}`}>
              {entry.transaction.name}
            </span>
            {entry.transaction.recurrenceType === 'installment' && entry.installmentNumber && (
              <Badge variant="blue" className="text-[10px]">
                {entry.installmentNumber}/{entry.transaction.totalInstallments}
              </Badge>
            )}
            {entry.transaction.recurrenceType === 'monthly' && (
              <Badge variant="gray" className="text-[10px]">Mensal</Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {getCategoryLabel(entry.transaction.category)} · dia {entry.transaction.dueDay}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'} ${entry.isDone ? 'opacity-60' : ''}`}>
            {isIncome ? '+' : '-'}{formatCurrency(entry.amount)}
          </p>
          {entry.isDone && (
            <p className="text-[10px] text-emerald-500 font-medium">
              {isIncome ? 'Recebido' : 'Pago'}
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      <Header title="Mês Atual" subtitle="Gerencie os pagamentos e recebimentos do mês" />

      {/* Month selector */}
      <Card delay={0} className="mb-6">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-dark-hover transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">
              {capitalizeFirst(formatMonth(year, month))}
            </h2>
            {isCurrentMonth && <span className="text-xs text-emerald-400 font-medium">Mês atual</span>}
            {isFuture && <span className="text-xs text-yellow-400 font-medium">Mês futuro (somente leitura)</span>}
          </div>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-dark-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Summary — card único responsivo */}
      <Card delay={0.05} className="mb-6">
        <div className="grid grid-cols-3 divide-x divide-dark-border mb-4">
          <div className="text-center pr-4">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-xs text-gray-500">Receitas</p>
            </div>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(doneIncome)}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">de {formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <p className="text-xs text-gray-500">Despesas</p>
            </div>
            <p className="text-sm font-bold text-red-400">{formatCurrency(doneExpenses)}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">de {formatCurrency(totalExpenses)}</p>
          </div>
          <div className="text-center pl-4">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs text-gray-500">Progresso</p>
            </div>
            <p className="text-sm font-bold text-white">{pct}%</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{doneCount}/{total} itens</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span>{doneCount} concluídos</span>
          <span>{total - doneCount} pendentes</span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-gray-600">
            <p className="font-medium">Nenhum lançamento neste mês</p>
            <a href="/dashboard/transactions" className="text-emerald-400 text-sm mt-2 block hover:underline">
              Adicionar transações →
            </a>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Income */}
          {income.length > 0 && (
            <Card delay={0.25}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Receitas</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(doneIncome)}</span>
                  <span className="text-xs text-gray-600"> / {formatCurrency(totalIncome)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {income.map(e => <EntryRow key={e.id} entry={e} />)}
                </AnimatePresence>
              </div>
            </Card>
          )}

          {/* Expenses */}
          {expenses.length > 0 && (
            <Card delay={0.3}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Despesas</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-400">{formatCurrency(doneExpenses)}</span>
                  <span className="text-xs text-gray-600"> / {formatCurrency(totalExpenses)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {expenses.map(e => <EntryRow key={e.id} entry={e} />)}
                </AnimatePresence>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
