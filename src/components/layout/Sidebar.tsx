'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { LayoutDashboard, ArrowLeftRight, CalendarCheck, TrendingUp, LogOut, Zap, ChevronRight, Crown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileModal } from '@/components/ui/ProfileModal'
import { usePlan } from '@/hooks/usePlan'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, premium: false },
  { href: '/dashboard/transactions', label: 'Transações', icon: ArrowLeftRight, premium: false },
  { href: '/dashboard/monthly', label: 'Mês Atual', icon: CalendarCheck, premium: false },
  { href: '/dashboard/forecast', label: 'Previsão', icon: TrendingUp, premium: true },
]

function Avatar({ src, name, size = 'md' }: { src: string | null; name: string; size?: 'sm' | 'md' }) {
  const initials = name?.[0]?.toUpperCase() ?? 'U'
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  if (src) {
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0`} />
  }
  return (
    <div className={`${dim} bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [profileOpen, setProfileOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const plan = usePlan()

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => setAvatar(d.avatar ?? null))
      .catch(() => null)
  }, [session?.user?.id])

  const userName = session?.user?.name ?? ''
  const userEmail = session?.user?.email ?? ''
  const isPremium = plan === 'premium'

  function NavLink({ href, label, icon: Icon, premium: requiresPremium }: typeof navItems[0]) {
    const active = pathname === href
    const locked = requiresPremium && !isPremium && plan !== null

    if (locked) {
      return (
        <button
          onClick={() => router.push('/dashboard/premium')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-dark-hover hover:text-amber-400 transition-all duration-200 group"
        >
          <Icon className="w-5 h-5" />
          {label}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5" />
            PRO
          </span>
        </button>
      )
    }

    return (
      <Link
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
        {active && <motion.div layoutId="sidebar-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
      </Link>
    )
  }

  return (
    <>
      {/* ─── Desktop sidebar ──────────────────────────────── */}
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
          {isPremium && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Crown className="w-2.5 h-2.5" /> PRO
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>

        {/* Upgrade banner for free users */}
        {plan === 'free' && (
          <div className="px-3 pb-3">
            <button
              onClick={() => router.push('/dashboard/premium')}
              className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-left hover:border-amber-500/40 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Seja Premium</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">Desbloqueie previsões e acesso ilimitado por R$&nbsp;9,99/mês</p>
            </button>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t border-dark-border space-y-1">
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
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </motion.aside>

      {/* ─── Mobile bottom nav ────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-card border-t border-dark-border flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon, premium: requiresPremium }) => {
          const active = pathname === href
          const locked = requiresPremium && !isPremium && plan !== null

          if (locked) {
            return (
              <button
                key={href}
                onClick={() => router.push('/dashboard/premium')}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-amber-500/60 hover:text-amber-400 transition-all duration-200 relative"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
                <Lock className="w-2 h-2 absolute top-1 right-1" />
              </button>
            )
          }

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
        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-500 hover:text-emerald-400 transition-all duration-200"
        >
          <Avatar src={avatar} name={userName} size="sm" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onAvatarChange={setAvatar}
      />
    </>
  )
}
