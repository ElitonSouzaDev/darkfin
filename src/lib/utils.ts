import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: Date | string) {
  // Parse "YYYY-MM-DD" strings as local date to avoid UTC offset shifting the day
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [y, m, d] = date.slice(0, 10).split('-').map(Number)
    return format(new Date(y, m - 1, d), 'dd/MM/yyyy', { locale: ptBR })
  }
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonth(year: number, month: number) {
  return format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: ptBR })
}

export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getCurrentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function getPreviousMonths(count: number) {
  const result = []
  for (let i = count - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: capitalizeFirst(format(date, 'MMM/yy', { locale: ptBR })),
    })
  }
  return result
}

export function getNextMonths(count: number) {
  const result = []
  for (let i = 1; i <= count; i++) {
    const date = addMonths(new Date(), i)
    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: capitalizeFirst(format(date, 'MMMM/yyyy', { locale: ptBR })),
    })
  }
  return result
}

export function calculateInstallmentNumber(startDate: Date | string, year: number, month: number) {
  const start = new Date(startDate)
  return (year - start.getFullYear()) * 12 + (month - (start.getMonth() + 1)) + 1
}

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investimento' },
  { value: 'bonus', label: 'Bônus' },
  { value: 'rental', label: 'Aluguel Recebido' },
  { value: 'other_income', label: 'Outros Rendimentos' },
]

export const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Moradia' },
  { value: 'vehicle', label: 'Veículo' },
  { value: 'loans', label: 'Empréstimos/Financ.' },
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'utilities', label: 'Serviços/Contas' },
  { value: 'subscriptions', label: 'Assinaturas Tech' },
  { value: 'health_fitness', label: 'Saúde & Fitness' },
  { value: 'entertainment', label: 'Lazer' },
  { value: 'education', label: 'Educação' },
  { value: 'family', label: 'Família' },
  { value: 'business', label: 'Empresa/Negócio' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'legal', label: 'Jurídico' },
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'clothing', label: 'Vestuário' },
  { value: 'other_expense', label: 'Outros Gastos' },
  // Legacy (backward compat)
  { value: 'rent', label: 'Aluguel' },
  { value: 'health', label: 'Saúde' },
  { value: 'subscription', label: 'Assinatura' },
]

export function getCategoryLabel(value: string) {
  return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].find((c) => c.value === value)?.label ?? value
}

export function getRecurrenceLabel(type: string) {
  const labels: Record<string, string> = {
    'one-time': 'Avulso',
    monthly: 'Mensal',
    installment: 'Parcelado',
  }
  return labels[type] ?? type
}

export const CATEGORY_COLORS: Record<string, string> = {
  // Income
  salary: '#10b981',
  freelance: '#34d399',
  investment: '#6ee7b7',
  bonus: '#a7f3d0',
  rental: '#059669',
  other_income: '#047857',
  // Expense
  housing: '#ef4444',
  vehicle: '#f97316',
  loans: '#dc2626',
  food: '#eab308',
  transport: '#84cc16',
  utilities: '#a855f7',
  subscriptions: '#06b6d4',
  health_fitness: '#ec4899',
  entertainment: '#8b5cf6',
  education: '#3b82f6',
  family: '#f43f5e',
  business: '#d97706',
  credit_card: '#7c3aed',
  legal: '#db2777',
  electronics: '#0891b2',
  clothing: '#be185d',
  other_expense: '#6b7280',
  // Legacy compat
  rent: '#ef4444',
  health: '#ec4899',
  subscription: '#06b6d4',
}

export function shouldIncludeTransaction(
  transaction: { recurrenceType: string; startDate: Date | string; totalInstallments?: number | null; isActive: boolean },
  year: number,
  month: number
): boolean {
  if (!transaction.isActive) return false

  const startDate = new Date(transaction.startDate)
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth() + 1

  if (startYear > year || (startYear === year && startMonth > month)) return false

  if (transaction.recurrenceType === 'one-time') {
    return startYear === year && startMonth === month
  }

  if (transaction.recurrenceType === 'monthly') return true

  if (transaction.recurrenceType === 'installment') {
    const num = calculateInstallmentNumber(startDate, year, month)
    return num >= 1 && num <= (transaction.totalInstallments ?? 0)
  }

  return false
}
