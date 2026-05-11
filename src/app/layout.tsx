import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Darkfin — Controle Financeiro',
  description: 'Gerencie suas finanças com inteligência e estilo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Darkfin',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
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
