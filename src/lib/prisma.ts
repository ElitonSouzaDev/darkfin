import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

// Em dev, reutiliza a mesma instância entre hot-reloads (evita muitas conexões)
// Em prod (serverless), cada invocação cria uma nova mas o pool do Neon gerencia
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
