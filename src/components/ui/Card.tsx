'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function Card({ children, className, delay = 0, hover = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'bg-dark-card border border-dark-border rounded-2xl p-5',
        hover && 'hover:border-emerald-500/40 hover:bg-dark-hover transition-colors duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
