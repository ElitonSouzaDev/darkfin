'use client'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, Zap } from 'lucide-react'
import { capitalizeFirst, formatMonth, getCurrentYearMonth } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()
  const { year, month } = getCurrentYearMonth()

  return (
    <header className="flex items-center justify-between mb-6 lg:mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs text-gray-500">{capitalizeFirst(formatMonth(year, month))}</p>
          <p className="text-sm font-medium text-gray-300">{session?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
