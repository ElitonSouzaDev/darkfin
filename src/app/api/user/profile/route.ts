import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatar: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // ─── Avatar update ────────────────────────────────────────────
  if ('avatar' in body) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: body.avatar },
    })
    return NextResponse.json({ success: true })
  }

  // ─── Password update ──────────────────────────────────────────
  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const ok = await bcrypt.compare(body.currentPassword, user.password)
    if (!ok) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })

    if (body.newPassword.length < 4) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 4 caracteres' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(body.newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Nenhuma alteração fornecida' }, { status: 400 })
}
