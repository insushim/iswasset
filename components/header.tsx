'use client'

import { Sparkles, Github, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function Header() {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 blur-lg opacity-50" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">ISW Asset</h1>
            <p className="text-[10px] text-muted-foreground -mt-1">AI Game Asset Generator</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            생성하기
          </a>
          <a href="#styles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            스타일
          </a>
          <a href="#gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            갤러리
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            asChild
          >
            <a href="https://github.com/insushim/iswasset" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
