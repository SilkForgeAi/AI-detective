import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'
import DisclaimerBanner from '@/components/DisclaimerBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Detective - Cold Case Solver',
  description: 'Solving cold cases with artificial intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DisclaimerBanner />
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
