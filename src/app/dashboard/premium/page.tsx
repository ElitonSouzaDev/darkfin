'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Crown, Zap, TrendingUp, Bell, Infinity, Shield, Star, ArrowRight, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { usePlan } from '@/hooks/usePlan'

const FREE_FEATURES = [
  { label: 'Até 10 transações', ok: true },
  { label: 'Dashboard completo', ok: true },
  { label: 'Controle mensal', ok: true },
  { label: 'Cadastro de categorias', ok: true },
  { label: 'Previsão financeira', ok: false },
  { label: 'Transações ilimitadas', ok: false },
  { label: 'Notificações de vencimento', ok: false },
  { label: 'Suporte prioritário', ok: false },
]

const PREMIUM_FEATURES = [
  { label: 'Transações ilimitadas', icon: Infinity },
  { label: 'Dashboard completo', icon: Zap },
  { label: 'Previsão financeira avançada', icon: TrendingUp },
  { label: 'Notificações de vencimento', icon: Bell },
  { label: 'Controle mensal detalhado', icon: Shield },
  { label: 'Suporte prioritário', icon: Star },
]

export default function PremiumPage() {
  const [loading, setLoading] = useState(false)
  const plan = usePlan()
  const isPremium = plan === 'premium'

  async function handleCheckout() {
    setLoading(true)
    try {
      const r = await fetch('/api/checkout', { method: 'POST' })
      const data = await r.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title={isPremium ? 'Você é Premium!' : 'Upgrade para Premium'}
        subtitle={isPremium ? 'Aproveite todos os recursos sem limite' : 'Desbloqueie o potencial completo do Darkfin'}
      />

      {isPremium ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-amber-500/10 via-dark-card to-emerald-500/10 border border-amber-500/30 rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Assinatura ativa</h2>
          <p className="text-gray-400">Você tem acesso completo a todos os recursos do Darkfin Premium.</p>
        </motion.div>
      ) : (
        <>
          {/* Hero badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Oferta de lançamento · R$&nbsp;9,99/mês</span>
            </div>
          </motion.div>

          {/* Comparison cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Free card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-card border border-dark-border rounded-3xl p-6"
            >
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plano atual</p>
                <h3 className="text-2xl font-bold text-white">Gratuito</h3>
                <p className="text-3xl font-black text-gray-400 mt-2">
                  R$&nbsp;0
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </p>
              </div>
              <ul className="space-y-3">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {f.ok
                      ? <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div>
                      : <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0"><X className="w-3 h-3 text-red-500/60" /></div>
                    }
                    <span className={`text-sm ${f.ok ? 'text-gray-300' : 'text-gray-600 line-through'}`}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Premium card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="relative bg-gradient-to-br from-dark-card via-dark-card to-amber-500/5 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10"
            >
              {/* Recommended badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  RECOMENDADO
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Premium</p>
                </div>
                <h3 className="text-2xl font-bold text-white">Completo</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$&nbsp;9,99</span>
                  <span className="text-sm font-normal text-gray-400">/mês</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cancele quando quiser</p>
              </div>

              <ul className="space-y-3 mb-8">
                {PREMIUM_FEATURES.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-sm text-gray-200">{f.label}</span>
                  </motion.li>
                ))}
              </ul>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    Assinar Premium agora
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Shield, title: 'Pagamento seguro', desc: 'Processado pelo Stripe com criptografia SSL' },
              { icon: Zap, title: 'Acesso imediato', desc: 'Ativação automática após o pagamento' },
              { icon: Star, title: 'Sem fidelidade', desc: 'Cancele quando quiser, sem multa' },
            ].map((item, i) => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-4 text-center">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-white mb-1">{item.title}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4"
          >
            <h4 className="text-sm font-semibold text-gray-300 mb-4">Perguntas frequentes</h4>
            {[
              { q: 'Como funciona o pagamento?', a: 'Você é redirecionado para o Stripe, plataforma segura que aceita cartão de crédito e débito. Seus dados financeiros nunca passam pelo Darkfin.' },
              { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem fidelidade mínima. Ao cancelar, seu acesso premium continua até o fim do período pago.' },
              { q: 'Meus dados ficam salvos no plano free?', a: 'Sim. Se você cancelar, as transações já cadastradas continuam salvas. Apenas novas adições ficam limitadas às 10 do plano gratuito.' },
            ].map((faq, i) => (
              <div key={i} className="border-b border-dark-border/50 last:border-0 pb-4 last:pb-0">
                <p className="text-sm font-medium text-white mb-1">{faq.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
