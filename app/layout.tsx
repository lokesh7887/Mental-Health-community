import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Header from "@/components/Header"  
import './globals.css'

export const metadata: Metadata = {
  title: 'Mental Health App',
  description: 'A safe space for mental health support and community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        {children}</body>
    </html>
  )
}




