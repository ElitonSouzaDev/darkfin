import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Auto-create admin on first login attempt
        if (!user && credentials.email === 'admin') {
          const hashed = await bcrypt.hash('admin', 10)
          user = await prisma.user.create({
            data: { name: 'Administrador', email: 'admin', password: hashed },
          })
        }

        if (!user) return null

        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) return null

        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
