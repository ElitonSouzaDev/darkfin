'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 shadow-xl text-sm">
      <p className="text-gray-400 mb-1">{getCategoryLabel(d.name)}</p>
      <p style={{ color: d.payload.color }} className="font-semibold">{formatCurrency(d.value)}</p>
    </div>
  )
}

export function CategoryDonut({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">
        Sem despesas no período
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-gray-400">{getCategoryLabel(value)}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
