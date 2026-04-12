import type { Metadata } from 'next'
import { Anton, Space_Mono, DM_Sans } from 'next/font/google'
import '@/styles/globals.css'

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-mono' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'GameVault — Private Game Library',
  description: 'Your personal, password-protected game collection manager. Browse, search, and organize your games with style.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <body className="bg-canvas text-text-primary font-body min-h-screen">
        {children}
      </body>
    </html>
  )
}
