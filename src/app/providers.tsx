'use client'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1526',
            color: '#fff',
            border: '1px solid #1a2744',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0d1526' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0d1526' } },
        }}
      />
    </SessionProvider>
  )
}
