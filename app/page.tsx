'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Zap, Shield, Palette, ArrowRight, Brain } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { StyleSelector } from '@/components/style-selector'
import { Generator } from '@/components/generator'
import { Gallery } from '@/components/gallery'
import { ConceptAnalyzer } from '@/components/concept-analyzer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { StyleConfig, StyleCategory } from '@/types'

const features = [
  {
    icon: Sparkles,
    title: 'AI 기반 생성',
    description: 'Google Imagen 3 기술로 고품질 게임 에셋을 즉시 생성',
  },
  {
    icon: Palette,
    title: '18가지 스타일',
    description: '캐릭터, 무기, 아이콘, 환경 등 다양한 에셋 스타일 지원',
  },
  {
    icon: Zap,
    title: '빠른 생성',
    description: '몇 초 만에 상용화 수준의 게임 에셋 생성',
  },
  {
    icon: Shield,
    title: '상업적 사용',
    description: '생성된 에셋은 상업적 프로젝트에 자유롭게 사용 가능',
  },
]

export default function HomePage() {
  const [styles, setStyles] = useState<StyleConfig[]>([])
  const [categories, setCategories] = useState<StyleCategory[]>([])
  const { selectedStyle, setSelectedStyle } = useAppStore()

  useEffect(() => {
    async function fetchStyles() {
      try {
        const res = await fetch('/api/styles')
        const data = await res.json()
        setStyles(data.styles || [])
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Failed to fetch styles:', error)
      }
    }
    fetchStyles()
  }, [])

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Google Imagen 3
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="gradient-text">AI 게임 에셋</span>
                <br />
                <span className="text-foreground">생성의 새로운 기준</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                세계 최고 수준의 AI 기술로 캐릭터, 무기, 아이콘, 환경 등
                18가지 스타일의 게임 에셋을 몇 초 만에 생성하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="gradient" className="h-12 px-8" asChild>
                  <a href="#concept">
                    <Brain className="mr-2 h-4 w-4" />
                    컨셉으로 자동 생성
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <a href="#generator">
                    개별 에셋 생성
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-4 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles Section */}
        <section id="styles" className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">
                다양한 <span className="gradient-text">에셋 스타일</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                게임 개발에 필요한 모든 종류의 에셋을 지원합니다.
                원하는 스타일을 선택하고 프롬프트를 입력하세요.
              </p>
            </div>

            {styles.length > 0 && (
              <StyleSelector
                styles={styles}
                categories={categories}
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
              />
            )}
          </div>
        </section>

        {/* Concept Analyzer Section */}
        <section id="concept" className="py-16 border-b border-border/40 bg-gradient-to-b from-violet-500/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">
                <Brain className="h-3 w-3 mr-1" />
                AI 자동 분석
              </Badge>
              <h2 className="text-3xl font-bold mb-3">
                게임 컨셉 <span className="gradient-text">자동 분석</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                게임 컨셉만 입력하면 AI가 필요한 모든 에셋을 자동으로 분석하고 한 번에 생성합니다.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ConceptAnalyzer />
            </div>
          </div>
        </section>

        {/* Generator Section */}
        <section id="generator" className="py-16 border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">
                개별 에셋 <span className="gradient-text">생성하기</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                특정 에셋만 추가로 생성하고 싶다면 직접 프롬프트를 입력하세요.
              </p>
            </div>

            {styles.length > 0 && (
              <Generator styles={styles} selectedStyle={selectedStyle} />
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">
                내 <span className="gradient-text">갤러리</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                생성한 에셋들을 확인하고 다운로드하세요.
              </p>
            </div>

            <Gallery styles={styles} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
