'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { LayoutDashboard, ArrowLeftRight, CalendarCheck, TrendingUp, LogOut, Zap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileModal } from '@/components/ui/ProfileModal'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/dashboard/monthly', label: 'Mês Atual', icon: CalendarCheck },
  { href: '/dashboard/forecast', label: 'Previsão', icon: TrendingUp },
]

function Avatar({ src, name, size = 'md' }: { src: string | null; name: string; size?: 'sm' | 'md' }) {
  const initials = name?.[0]?.toUpperCase() ?? 'U'
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${dim} bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [profileOpen, setProfileOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  // Load avatar from server on mount
  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => setAvatar(d.avatar ?? null))
      .catch(() => null)
  }, [session?.user?.id])

  function handleAvatarChange(newAvatar: string | null) {
    setAvatar(newAvatar)
  }

  const userName = session?.user?.name ?? ''
  const userEmail = session?.user?.email ?? ''

  return (
    <>
      {/* ─── Desktop sidebar ──────────────────────────────────── */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:flex flex-col w-64 min-h-screen bg-dark-card border-r border-dark-border fixed left-0 top-0 z-40"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-dark-border">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Dark<span className="text-emerald-400">fin</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'text-emerald-400')} />
                {label}
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-dark-border space-y-1">
          {/* Clickable user card → opens ProfileModal */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-hover transition-all duration-200 group"
          >
            <Avatar src={avatar} name={userName} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
          </button>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </motion.aside>

      {/* ─── Mobile bottom nav ────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-card border-t border-dark-border flex items-center justify-around px-2 py-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                active ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
        {/* Mobile profile button */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-500 hover:text-emerald-400 transition-all duration-200"
        >
          <Avatar src={avatar} name={userName} size="sm" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>

      {/* Profile modal */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onAvatarChange={handleAvatarChange}
      />
    </>
  )
}
