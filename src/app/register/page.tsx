'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('As senhas não coincidem')
      return
    }
    if (form.password.length < 4) {
      toast.error('A senha deve ter pelo menos 4 caracteres')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao cadastrar')
        return
      }
      toast.success('Conta criada! Faça login.')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-4">
              <Zap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Dark<span className="text-emerald-400">fin</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Crie sua conta gratuitamente</p>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome completo"
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Usuário / E-mail"
                type="text"
                placeholder="usuario ou email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="Repita a senha"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
              <Button type="submit" size="lg" loading={loading} className="w-full justify-center mt-2">
                Criar conta
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Já tem conta?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
