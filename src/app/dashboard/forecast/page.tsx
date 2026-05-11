'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, ArrowDown, Crown, Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { ForecastLine } from '@/components/charts/ForecastLine'
import { formatCurrency } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'

interface ForecastItem {
  label: string
  fullLabel: string
  year: number
  month: number
  income: number
  expenses: number
  balance: number
  expenseDiff: number
  ending: { name: string; amount: number; endLabel: string }[]
}

interface ForecastData {
  baseExpenses: number
  baseIncome: number
  milestones: { name: string; amount: number; endLabel: string; endYear: number; endMonth: number }[]
  forecast: ForecastItem[]
}

function PremiumGate() {
  const router = useRouter()
  return (
    <div className="relative">
      {/* Blurred fake content */}
      <div className="blur-sm pointer-events-none select-none opacity-40">
        <div className="flex gap-2 mb-6">
          {[3, 6, 12].map(p => (
            <div key={p} className="px-4 py-2 rounded-xl bg-dark-card border border-dark-border text-sm text-gray-400">{p} meses</div>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {['Despesa atual/mês', 'Despesa em 6 meses', 'Parcelas encerrando', 'Saldo mensal'].map(label => (
            <div key={label} className="bg-dark-card border border-dark-border rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <div className="h-6 w-24 bg-dark-border rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6 h-64" />
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-48" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-card/95 border border-amber-500/30 rounded-3xl px-8 py-10 text-center max-w-sm mx-4 shadow-2xl shadow-amber-500/10"
        >
          <div className="w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Recurso Premium</h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            A Previsão Financeira mostra como suas dívidas evoluem nos próximos meses à medida que parcelas encerram.
          </p>
          <button
            onClick={() => router.push('/dashboard/premium')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-500/20"
          >
            <Crown className="w-4 h-4" />
            Ver planos — R$&nbsp;9,99/mês
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default function ForecastPage() {
  const [period, setPeriod] = useState(6)
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const plan = usePlan()

  useEffect(() => {
    if (plan !== 'premium') return
    setLoading(true)
    fetch(`/api/forecast?months=${period}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [period, plan])

  return (
    <div>
      <Header title="Previsão Financeira" subtitle="Como suas dívidas evoluem ao longo do tempo" />

      {/* Plan still loading */}
      {plan === null && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Free user — show gate */}
      {plan === 'free' && <PremiumGate />}

      {/* Premium user */}
      {plan === 'premium' && (
        <>
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data ? null : (
            <>
              {(() => {
                const lastItem = data.forecast[data.forecast.length - 1]
                const milestonesInPeriod = data.milestones.filter(m =>
                  data.forecast.some(f => f.year === m.endYear && f.month === m.endMonth)
                )
                return (
                  <>
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

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card delay={0}>
                        <p className="text-xs text-gray-500 mb-1">Despesa atual/mês</p>
                        <p className="text-xl font-bold text-red-400">{formatCurrency(data.baseExpenses)}</p>
                        <p className="text-xs text-gray-600 mt-0.5">ponto de partida</p>
                      </Card>
                      <Card delay={0.05}>
                        <p className="text-xs text-gray-500 mb-1">Despesa em {period} meses</p>
                        <p className={`text-xl font-bold ${lastItem && lastItem.expenses < data.baseExpenses ? 'text-emerald-400' : 'text-red-400'}`}>
                          {lastItem ? formatCurrency(lastItem.expenses) : '—'}
                        </p>
                        {lastItem && lastItem.expenses < data.baseExpenses && (
                          <p className="text-xs text-emerald-500 mt-0.5 flex items-center gap-1">
                            <ArrowDown className="w-3 h-3" />
                            economia de {formatCurrency(data.baseExpenses - lastItem.expenses)}/mês
                          </p>
                        )}
                      </Card>
                      <Card delay={0.1}>
                        <p className="text-xs text-gray-500 mb-1">Parcelas encerrando</p>
                        <p className="text-xl font-bold text-blue-400">{milestonesInPeriod.length}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {milestonesInPeriod.length > 0
                            ? `até ${data.forecast[data.forecast.length - 1]?.label}`
                            : 'nenhuma neste período'}
                        </p>
                      </Card>
                      <Card delay={0.15}>
                        <p className="text-xs text-gray-500 mb-1">Saldo mensal em {period}m</p>
                        <p className={`text-xl font-bold ${lastItem && lastItem.balance > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {lastItem ? formatCurrency(lastItem.balance) : '—'}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">receita − despesa</p>
                      </Card>
                    </div>

                    {/* Chart */}
                    <Card delay={0.2} className="mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <h3 className="text-sm font-semibold text-gray-300">Evolução das despesas mensais</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-emerald-500" /><span className="text-xs text-gray-500">Receita</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-red-500" /><span className="text-xs text-gray-500">Despesa</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-5 border-t-2 border-dashed border-yellow-500" /><span className="text-xs text-gray-500">Hoje</span></div>
                        </div>
                      </div>
                      <ForecastLine data={data.forecast} baseExpenses={data.baseExpenses} />
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-4 mb-6">
                      {data.milestones.length > 0 && (
                        <Card delay={0.25}>
                          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Quando cada parcela encerra
                          </h3>
                          <div className="space-y-2">
                            {data.milestones.map((m, i) => {
                              const isInPeriod = data.forecast.some(f => f.year === m.endYear && f.month === m.endMonth)
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + i * 0.05 }}
                                  className={`flex items-center justify-between p-3 rounded-xl ${
                                    isInPeriod ? 'bg-emerald-500/8 border border-emerald-500/15' : 'bg-dark-bg/50'
                                  }`}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-white">{m.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{m.endLabel}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-400">-{formatCurrency(m.amount)}/mês</p>
                                    {isInPeriod
                                      ? <p className="text-[10px] text-emerald-500">neste período ✓</p>
                                      : <p className="text-[10px] text-gray-600">além do período</p>
                                    }
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </Card>
                      )}

                      <Card delay={0.3}>
                        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          Detalhe mês a mês
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-500 border-b border-dark-border">
                                <th className="text-left pb-2 font-medium">Mês</th>
                                <th className="text-right pb-2 font-medium">Despesa</th>
                                <th className="text-right pb-2 font-medium">vs Hoje</th>
                                <th className="text-right pb-2 font-medium">Saldo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border/40">
                              {data.forecast.map((item, i) => {
                                const hasEnding = item.ending.length > 0
                                return (
                                  <motion.tr
                                    key={`${item.year}-${item.month}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.35 + i * 0.03 }}
                                    className={`hover:bg-dark-hover/50 transition-colors ${hasEnding ? 'bg-emerald-500/5' : ''}`}
                                  >
                                    <td className="py-2.5">
                                      <p className="text-gray-300 font-medium capitalize text-xs">{item.fullLabel}</p>
                                      {hasEnding && (
                                        <p className="text-[10px] text-emerald-400">✓ {item.ending.map(e => e.name).join(', ')} encerra</p>
                                      )}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <span className={`text-sm font-semibold ${item.expenses < data.baseExpenses ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(item.expenses)}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <span className={`text-xs font-medium ${item.expenseDiff < 0 ? 'text-emerald-400' : item.expenseDiff > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                                        {item.expenseDiff === 0 ? '—' : `${item.expenseDiff > 0 ? '+' : ''}${formatCurrency(item.expenseDiff)}`}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <span className={`text-sm font-bold ${item.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                        {formatCurrency(item.balance)}
                                      </span>
                                    </td>
                                  </motion.tr>
                                )
                              })}
                            </tbody>
                          </table>
                          {data.forecast.length === 0 && (
                            <p className="text-center text-gray-600 py-6 text-sm">
                              Nenhuma transação ativa.{' '}
                              <a href="/dashboard/transactions" className="text-emerald-400 hover:underline">Adicionar →</a>
                            </p>
                          )}
                        </div>
                      </Card>
                    </div>
                  </>
                )
              })()}
            </>
          )}
        </>
      )}
    </div>
  )
}
