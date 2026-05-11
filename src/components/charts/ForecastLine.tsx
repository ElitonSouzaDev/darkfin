'use client'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DataPoint {
  label: string
  income: number
  expenses: number
  balance: number
}

interface Props {
  data: DataPoint[]
  baseExpenses: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 shadow-xl text-sm space-y-1 z-50">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke ?? p.fill }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function ForecastLine({ data, baseExpenses }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 8, right: 8 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* Linha de referência: despesa atual */}
        <ReferenceLine
          y={baseExpenses}
          stroke="#f59e0b"
          strokeDasharray="5 3"
          label={{ value: 'Hoje', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Receita"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#incomeGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#10b981' }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Despesa"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#expenseGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#ef4444' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
