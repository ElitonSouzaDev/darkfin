import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Darkfin — Controle Financeiro',
  description: 'Gerencie suas finanças com inteligência e estilo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-dark-bg text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
