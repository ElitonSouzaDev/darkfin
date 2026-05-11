import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Admin user ───────────────────────────────────────────────
  const hashed = await bcrypt.hash('admin', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: { name: 'Administrador', email: 'admin', password: hashed },
  })
  console.log('✅ Usuário admin OK')

  // ─── Skip if transactions already exist ───────────────────────
  const existing = await prisma.transaction.count({ where: { userId: admin.id } })
  if (existing > 0) {
    console.log(`ℹ️  ${existing} transações já existem. Pulando seed de transações.`)
    return
  }

  // ─── Start from current month (May 2026) ─────────────────────
  const startDate = new Date('2026-05-01')

  type TxInput = {
    name: string
    category: string
    amount: number
    recurrenceType: string
    totalInstallments?: number
    dueDay: number
    description?: string
  }

  const transactions: TxInput[] = [
    // ── Parcelados ──────────────────────────────────────────────
    {
      name: 'Refinanciamento do Carro',
      category: 'vehicle',
      amount: 2105,
      recurrenceType: 'installment',
      totalInstallments: 27,
      dueDay: 10,
      description: 'Parcelas restantes do financiamento',
    },
    {
      name: 'Empréstimo — Tia',
      category: 'loans',
      amount: 1205,
      recurrenceType: 'installment',
      totalInstallments: 3,
      dueDay: 15,
      description: 'Empréstimo pessoal',
    },
    {
      name: 'Parcela Celular',
      category: 'electronics',
      amount: 422,
      recurrenceType: 'installment',
      totalInstallments: 5,
      dueDay: 1,
    },
    {
      name: 'Cabana Aniversário Namoro',
      category: 'entertainment',
      amount: 160,
      recurrenceType: 'installment',
      totalInstallments: 3,
      dueDay: 20,
    },
    {
      name: 'Curso YouTube',
      category: 'education',
      amount: 160,
      recurrenceType: 'installment',
      totalInstallments: 3,
      dueDay: 15,
    },
    {
      name: 'Advogado — Mãe',
      category: 'legal',
      amount: 250,
      recurrenceType: 'installment',
      totalInstallments: 3,
      dueDay: 5,
    },

    // ── Mensais fixos ────────────────────────────────────────────
    {
      name: 'Aluguel Apartamento',
      category: 'housing',
      amount: 850,
      recurrenceType: 'monthly',
      dueDay: 5,
    },
    {
      name: 'Condomínio',
      category: 'housing',
      amount: 250,
      recurrenceType: 'monthly',
      dueDay: 10,
    },
    {
      name: 'Energia Elétrica',
      category: 'utilities',
      amount: 500,
      recurrenceType: 'monthly',
      dueDay: 15,
    },
    {
      name: 'Internet',
      category: 'utilities',
      amount: 100,
      recurrenceType: 'monthly',
      dueDay: 5,
    },
    {
      name: 'Ajuda de Custo — Mãe',
      category: 'family',
      amount: 700,
      recurrenceType: 'monthly',
      dueDay: 5,
    },
    {
      name: 'Mercado Mensal',
      category: 'food',
      amount: 1500,
      recurrenceType: 'monthly',
      dueDay: 10,
    },
    {
      name: 'Gasolina',
      category: 'transport',
      amount: 400,
      recurrenceType: 'monthly',
      dueDay: 15,
    },

    // ── Assinaturas Tech ─────────────────────────────────────────
    {
      name: 'Assinatura Claude',
      category: 'subscriptions',
      amount: 100,
      recurrenceType: 'monthly',
      dueDay: 1,
    },
    {
      name: 'Assinatura ChatGPT',
      category: 'subscriptions',
      amount: 100,
      recurrenceType: 'monthly',
      dueDay: 1,
    },
    {
      name: 'Rateio VEO3',
      category: 'subscriptions',
      amount: 120,
      recurrenceType: 'monthly',
      dueDay: 10,
    },
    {
      name: 'Dottiflow',
      category: 'subscriptions',
      amount: 160,
      recurrenceType: 'monthly',
      dueDay: 5,
    },

    // ── Saúde & Bem-estar ────────────────────────────────────────
    {
      name: 'Academia',
      category: 'health_fitness',
      amount: 90,
      recurrenceType: 'monthly',
      dueDay: 1,
    },
    {
      name: 'Mensalidade Futebol',
      category: 'entertainment',
      amount: 30,
      recurrenceType: 'monthly',
      dueDay: 5,
    },

    // ── Empresa ──────────────────────────────────────────────────
    {
      name: 'DAS + DARF (Impostos Empresa)',
      category: 'business',
      amount: 1100,
      recurrenceType: 'monthly',
      dueDay: 20,
      description: 'Impostos mensais da empresa',
    },
    {
      name: 'Contabilidade Mensal',
      category: 'business',
      amount: 100,
      recurrenceType: 'monthly',
      dueDay: 5,
    },

    // ── Outros ───────────────────────────────────────────────────
    {
      name: 'Cartão de Crédito',
      category: 'credit_card',
      amount: 2000,
      recurrenceType: 'monthly',
      dueDay: 10,
      description: 'Fatura estimada mensal',
    },
    {
      name: 'Gastos Extras / Lazer / Alimentação',
      category: 'entertainment',
      amount: 500,
      recurrenceType: 'monthly',
      dueDay: 25,
      description: 'Reserva para imprevistos e lazer',
    },
  ]

  let count = 0
  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: admin.id,
        name: tx.name,
        description: tx.description ?? null,
        type: 'expense',
        category: tx.category,
        amount: tx.amount,
        recurrenceType: tx.recurrenceType,
        totalInstallments: tx.totalInstallments ?? null,
        dueDay: tx.dueDay,
        startDate,
        isActive: true,
      },
    })
    count++
    process.stdout.write(`  → [${count}/${transactions.length}] ${tx.name}\n`)
  }

  const totalMensal = transactions
    .filter(t => t.recurrenceType === 'monthly')
    .reduce((s, t) => s + t.amount, 0)

  const totalParcelado = transactions
    .filter(t => t.recurrenceType === 'installment')
    .reduce((s, t) => s + t.amount, 0)

  console.log('\n✅ Seed concluído!')
  console.log(`   ${transactions.length} transações criadas`)
  console.log(`   Despesas mensais fixas: R$ ${totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   Parcelas do mês: R$ ${totalParcelado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   Total do mês: R$ ${(totalMensal + totalParcelado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
