import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owns = await prisma.transaction.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owns) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  try {
    const body = await req.json()
    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...body,
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        totalInstallments: body.totalInstallments !== undefined ? (body.totalInstallments ? parseInt(body.totalInstallments) : null) : undefined,
        dueDay: body.dueDay !== undefined ? parseInt(body.dueDay) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owns = await prisma.transaction.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owns) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.transaction.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
