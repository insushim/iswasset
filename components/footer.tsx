'use client'

import { Sparkles, Heart, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">ISW Asset</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              세계 최고 수준의 AI 게임 에셋 생성 도구.
              18가지 스타일의 게임 에셋을 Google Imagen 3 기술로 즉시 생성하세요.
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="font-semibold mb-3">빠른 링크</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#generator" className="hover:text-foreground transition-colors">
                  에셋 생성
                </a>
              </li>
              <li>
                <a href="#styles" className="hover:text-foreground transition-colors">
                  스타일 가이드
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-foreground transition-colors">
                  갤러리
                </a>
              </li>
            </ul>
          </div>

          {/* 소셜 */}
          <div>
            <h4 className="font-semibold mb-3">커뮤니티</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/insushim/iswasset"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 ISW Asset. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> using Google Imagen 3
          </p>
        </div>
      </div>
    </footer>
  )
}
