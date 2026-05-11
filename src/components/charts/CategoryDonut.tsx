'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, getCategoryLabel } from '@/lib/utils'

interface DataPoint {
  category: string
  amount: number
  color: string
}

interface Props {
  data: DataPoint[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 shadow-xl text-sm z-50">
      <p className="text-gray-400 mb-1">{getCategoryLabel(d.name)}</p>
      <p style={{ color: d.payload.color }} className="font-semibold">{formatCurrency(d.value)}</p>
    </div>
  )
}

export function CategoryDonut({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[160px] text-gray-600 text-sm">
        Sem despesas no período
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="flex flex-col gap-3">
      {/* Donut — tamanho fixo, sem Legend do recharts */}
      <div className="flex justify-center">
        <div className="relative w-full" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={sorted}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {sorted.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Total no centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-sm font-bold text-white leading-tight">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* Legenda compacta em grade */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-[120px] overflow-y-auto pr-1">
        {sorted.slice(0, 8).map((d) => (
          <div key={d.category} className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[11px] text-gray-400 truncate">{getCategoryLabel(d.category)}</span>
          </div>
        ))}
        {sorted.length > 8 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-600 flex-shrink-0" />
            <span className="text-[11px] text-gray-500">+{sorted.length - 8} outros</span>
          </div>
        )}
      </div>
    </div>
  )
}
