'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Crown, CheckCircle2, ArrowRight } from 'lucide-react'

export default function PremiumSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.push('/dashboard'), 6000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-500/30 to-orange-500/20 rounded-full flex items-center justify-center"
          >
            <Crown className="w-12 h-12 text-amber-400" />
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: 20, y: -10 }}
            animate={{ scale: 1, x: 20, y: -10 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute top-0 right-1/2"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-400 bg-dark-bg rounded-full" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black text-white mb-3"
        >
          Bem-vindo ao Premium!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          Sua assinatura foi ativada com sucesso. Agora você tem acesso ilimitado a todos os recursos do Darkfin.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/30"
        >
          Ir para o Dashboard
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-gray-600 mt-6"
        >
          Redirecionando automaticamente em alguns segundos...
        </motion.p>
      </motion.div>
    </div>
  )
}
