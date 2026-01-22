'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <title>ISW Asset Generator - AI 게임 에셋 생성기</title>
        <meta name="description" content="세계 최고 수준의 AI 게임 에셋 생성 도구. 캐릭터, 아이콘, 무기, 배경 등 18가지 스타일의 게임 에셋을 즉시 생성하세요." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  )
}
