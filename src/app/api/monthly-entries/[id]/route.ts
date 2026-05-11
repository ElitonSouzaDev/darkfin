import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owns = await prisma.monthlyEntry.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owns) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const { isDone } = await req.json()

  const updated = await prisma.monthlyEntry.update({
    where: { id: params.id },
    data: {
      isDone,
      doneAt: isDone ? new Date() : null,
    },
    include: { transaction: true },
  })

  return NextResponse.json(updated)
}
