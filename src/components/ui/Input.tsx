'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-300">{label}</label>
        )}
        <input
          ref={ref}
          {...props}
          className={cn(
            'w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white',
            'placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30',
            'transition-all duration-200',
            error && 'border-red-500/50',
            className
          )}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        {...props}
        className={cn(
          'w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white',
          'focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30',
          'transition-all duration-200',
          error && 'border-red-500/50',
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-dark-card">
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
