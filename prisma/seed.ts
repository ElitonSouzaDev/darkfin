import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Todos os usuários existentes recebem premium gratuito até dez/2026
  const premiumUntil = new Date('2026-12-31T23:59:59Z')
  const result = await prisma.user.updateMany({
    data: { plan: 'premium', planExpiresAt: premiumUntil },
  })
  console.log(`✅ ${result.count} usuário(s) atualizados para premium até dez/2026`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
