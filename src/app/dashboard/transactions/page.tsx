'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import {
  formatCurrency, formatDate, getCategoryLabel, getRecurrenceLabel,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from '@/lib/utils'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  name: string
  description?: string
  type: string
  category: string
  amount: number
  recurrenceType: string
  totalInstallments?: number
  dueDay: number
  startDate: string
  isActive: boolean
}

const emptyForm = {
  name: '', description: '', type: 'expense', category: 'rent',
  amount: '', recurrenceType: 'monthly', totalInstallments: '',
  dueDay: '1', startDate: new Date().toISOString().slice(0, 10),
}

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  async function load() {
    setLoading(true)
    const r = await fetch('/api/transactions')
    setItems(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setForm({
      name: t.name,
      description: t.description ?? '',
      type: t.type,
      category: t.category,
      amount: String(t.amount),
      recurrenceType: t.recurrenceType,
      totalInstallments: t.totalInstallments ? String(t.totalInstallments) : '',
      dueDay: String(t.dueDay),
      startDate: String(t.startDate).slice(0, 10),
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? `/api/transactions/${editing.id}` : '/api/transactions'
      const method = editing ? 'PATCH' : 'POST'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) { toast.error('Erro ao salvar'); return }
      toast.success(editing ? 'Atualizado!' : 'Transação criada!')
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const r = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('Removido!'); load() } else toast.error('Erro ao remover')
    setDeleteId(null)
  }

  async function toggleActive(t: Transaction) {
    await fetch(`/api/transactions/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    })
    load()
  }

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const filtered = items.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    return matchSearch && matchType
  })

  return (
    <div>
      <Header title="Transações" subtitle="Gerencie suas receitas e despesas" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/60 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <Button onClick={openAdd} className="whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nova
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-gray-600">
            <Filter className="w-10 h-10 mb-3" />
            <p className="font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm mt-1">Clique em &quot;Nova&quot; para adicionar</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-dark-card border rounded-2xl p-4 transition-colors ${
                  t.isActive ? 'border-dark-border hover:border-emerald-500/20' : 'border-dark-border/50 opacity-60'
                }`}
              >
                {/* Linha principal */}
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base mt-0.5 ${
                    t.type === 'income' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {t.type === 'income' ? '↑' : '↓'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white leading-tight">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getCategoryLabel(t.category)} · dia {t.dueDay}
                      <span className="hidden sm:inline"> · desde {formatDate(t.startDate)}</span>
                    </p>
                    {/* Badges numa linha separada */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      <Badge variant={t.type === 'income' ? 'green' : 'red'}>
                        {t.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <Badge variant="gray">{getRecurrenceLabel(t.recurrenceType)}</Badge>
                      {t.recurrenceType === 'installment' && (
                        <Badge variant="blue">{t.totalInstallments}x</Badge>
                      )}
                      {!t.isActive && <Badge variant="gray">Inativo</Badge>}
                    </div>
                  </div>

                  {/* Valor + ações */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className={`text-base font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(t.amount)}
                    </p>
                    {t.recurrenceType === 'installment' && (
                      <p className="text-[10px] text-gray-600 -mt-1.5">/parcela</p>
                    )}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => toggleActive(t)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
                        title={t.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {t.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Transação' : 'Nova Transação'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Nome" placeholder="Ex: Salário, Aluguel..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <Select
              label="Tipo"
              value={form.type}
              onChange={(e) => {
                const type = e.target.value
                const cat = type === 'income' ? INCOME_CATEGORIES[0].value : EXPENSE_CATEGORIES[0].value
                setForm({ ...form, type, category: cat })
              }}
              options={[{ value: 'income', label: '↑ Receita' }, { value: 'expense', label: '↓ Despesa' }]}
            />
            <Select
              label="Categoria"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={categories}
            />
            <Input label="Valor (R$)" type="number" min="0.01" step="0.01" placeholder="0,00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Select
              label="Recorrência"
              value={form.recurrenceType}
              onChange={(e) => setForm({ ...form, recurrenceType: e.target.value })}
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'installment', label: 'Parcelado' },
                { value: 'one-time', label: 'Avulso' },
              ]}
            />
            {form.recurrenceType === 'installment' && (
              <Input label="Nº de parcelas" type="number" min="2" placeholder="Ex: 12" value={form.totalInstallments} onChange={(e) => setForm({ ...form, totalInstallments: e.target.value })} required />
            )}
            <Input label="Dia de vencimento" type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} required />
            <Input label="Data de início" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <div className="col-span-2">
              <Input label="Descrição (opcional)" placeholder="Observações..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1 justify-center">Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1 justify-center">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar exclusão" maxWidth="max-w-sm">
        <p className="text-gray-400 text-sm mb-6">Tem certeza? Todos os pagamentos mensais desta transação também serão removidos.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1 justify-center">Cancelar</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 justify-center">Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
