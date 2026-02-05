import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import clsx from 'clsx'
import { Providers } from './providers'
import { Shell } from '@/components/layout/Shell'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Cyclop Finance',
  description: 'Gestão Financeira Inteligente do Futuro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={clsx(outfit.className, "antialiased")}>
        <Providers>
          <Shell>
            {children}
          </Shell>
        </Providers>
      </body>
    </html>
  )
}
