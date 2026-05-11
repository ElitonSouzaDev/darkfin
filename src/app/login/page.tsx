'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (res?.ok) {
        toast.success('Bem-vindo ao Darkfin!')
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error('Usuário ou senha inválidos')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-4"
            >
              <Zap className="w-9 h-9 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">
              Dark<span className="text-emerald-400">fin</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Controle financeiro inteligente</p>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Entrar na conta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Usuário"
                type="text"
                placeholder="admin"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="username"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" size="lg" loading={loading} className="w-full justify-center mt-2">
                Entrar
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Não tem conta?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Cadastrar
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            Login padrão: <span className="text-gray-500">admin</span> / <span className="text-gray-500">admin</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
