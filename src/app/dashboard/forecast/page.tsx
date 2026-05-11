'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { ForecastLine } from '@/components/charts/ForecastLine'
import { formatCurrency } from '@/lib/utils'

interface ForecastItem {
  label: string
  fullLabel: string
  year: number
  month: number
  income: number
  expenses: number
  balance: number
  runningBalance: number
}

export default function ForecastPage() {
  const [period, setPeriod] = useState(6)
  const [data, setData] = useState<ForecastItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/forecast?months=${period}`)
      .then(r => r.json())
      .then(d => setData(d.forecast ?? []))
      .finally(() => setLoading(false))
  }, [period])

  const lastItem = data[data.length - 1]
  const totalProjectedIncome = data.reduce((s, d) => s + d.income, 0)
  const totalProjectedExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const positiveMonths = data.filter(d => d.balance >= 0).length
  const negativeMonths = data.filter(d => d.balance < 0).length

  return (
    <div>
      <Header title="Previsão Financeira" subtitle="Projeção baseada nas suas transações ativas" />

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {[3, 6, 12].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              period === p
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-emerald-500/30'
            }`}
          >
            {p} meses
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card delay={0} className="text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">Receita Projetada</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalProjectedIncome)}</p>
            </Card>
            <Card delay={0.05} className="text-center">
              <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">Despesa Projetada</p>
              <p className="text-lg font-bold text-red-400">{formatCurrency(totalProjectedExpenses)}</p>
            </Card>
            <Card delay={0.1} className="text-center">
              <Wallet className={`w-5 h-5 mx-auto mb-2 ${(lastItem?.runningBalance ?? 0) >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
              <p className="text-xs text-gray-500 mb-1">Saldo Final ({period}m)</p>
              <p className={`text-lg font-bold ${(lastItem?.runningBalance ?? 0) >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                {formatCurrency(lastItem?.runningBalance ?? 0)}
              </p>
            </Card>
            <Card delay={0.15} className="text-center">
              <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">Meses positivos</p>
              <p className="text-lg font-bold text-white">{positiveMonths}<span className="text-sm font-normal text-gray-500">/{data.length}</span></p>
              {negativeMonths > 0 && <p className="text-xs text-orange-400">{negativeMonths} negativos ⚠</p>}
            </Card>
          </div>

          {/* Chart */}
          <Card delay={0.2} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Projeção para os próximos {period} meses</h3>
            <ForecastLine data={data} />
            <div className="flex items-center gap-6 mt-3 justify-center">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-emerald-500" /><span className="text-xs text-gray-500">Receita</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-red-500" /><span className="text-xs text-gray-500">Despesa</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-yellow-500" /><span className="text-xs text-gray-500">Saldo acumulado</span></div>
            </div>
          </Card>

          {/* Table */}
          <Card delay={0.25}>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Detalhe mês a mês</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-dark-border">
                    <th className="text-left pb-3 font-medium">Mês</th>
                    <th className="text-right pb-3 font-medium">Receita</th>
                    <th className="text-right pb-3 font-medium">Despesa</th>
                    <th className="text-right pb-3 font-medium">Saldo Mês</th>
                    <th className="text-right pb-3 font-medium">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                  {data.map((item, i) => (
                    <motion.tr
                      key={`${item.year}-${item.month}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="hover:bg-dark-hover/50 transition-colors"
                    >
                      <td className="py-3 text-gray-300 font-medium capitalize">{item.fullLabel}</td>
                      <td className="py-3 text-right text-emerald-400">{formatCurrency(item.income)}</td>
                      <td className="py-3 text-right text-red-400">{formatCurrency(item.expenses)}</td>
                      <td className={`py-3 text-right font-semibold ${item.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.balance >= 0 ? '+' : ''}{formatCurrency(item.balance)}
                      </td>
                      <td className={`py-3 text-right font-bold ${item.runningBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        {formatCurrency(item.runningBalance)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {data.length === 0 && (
                <p className="text-center text-gray-600 py-8">
                  Nenhuma transação ativa para projetar.{' '}
                  <a href="/dashboard/transactions" className="text-emerald-400 hover:underline">
                    Adicionar transações →
                  </a>
                </p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
