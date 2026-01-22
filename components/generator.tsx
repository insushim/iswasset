'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Download, Copy, RefreshCw, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import type { StyleConfig, GeneratedAsset } from '@/types'

interface GeneratorProps {
  styles: StyleConfig[]
  selectedStyle: string
}

const aspectRatios = [
  { value: '1:1', label: '1:1 (정사각형)' },
  { value: '16:9', label: '16:9 (와이드)' },
  { value: '9:16', label: '9:16 (세로)' },
  { value: '4:3', label: '4:3 (표준)' },
  { value: '3:4', label: '3:4 (세로 표준)' },
]

const samplePrompts: Record<string, string[]> = {
  character: [
    '중세 기사, 은색 갑옷, 검을 들고 있는',
    '귀여운 마법사 소녀, 파란 로브, 지팡이',
    '사이버펑크 해커, 네온 조명, 미래적',
  ],
  weapon: [
    '불꽃이 타오르는 전설의 검',
    '고대 룬이 새겨진 마법 지팡이',
    '기계식 크로스보우, 스팀펑크',
  ],
  icon: [
    '황금빛 체력 물약',
    '번개 마법 스킬 아이콘',
    '보라색 희귀 보석',
  ],
  monster: [
    '불을 뿜는 드래곤, 거대한 날개',
    '숲의 정령, 녹색 빛, 신비로운',
    '기계 골렘, 녹슨 금속, 증기',
  ],
  environment: [
    '마법의 숲, 빛나는 버섯들',
    '고대 던전 입구, 어두운 분위기',
    '하늘 위 떠 있는 섬, 폭포',
  ],
}

export function Generator({ styles, selectedStyle }: GeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [numberOfImages, setNumberOfImages] = useState(1)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const { isGenerating, setIsGenerating, addGeneratedAsset } = useAppStore()

  const currentStyle = styles.find(s => s.id === selectedStyle)
  const currentPrompts = samplePrompts[selectedStyle] || samplePrompts.character

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio,
          numberOfImages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '생성 중 오류가 발생했습니다')
      }

      if (data.images && data.images.length > 0) {
        const imageData = data.images[0]
        setGeneratedImage(imageData)

        const newAsset: GeneratedAsset = {
          id: crypto.randomUUID(),
          prompt,
          style: selectedStyle,
          imageUrl: imageData,
          createdAt: new Date().toISOString(),
          aspectRatio,
        }
        addGeneratedAsset(newAsset)
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert(error instanceof Error ? error.message : '에셋 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${generatedImage}`
    link.download = `isw-asset-${selectedStyle}-${Date.now()}.png`
    link.click()
  }

  const handleCopyPrompt = (samplePrompt: string) => {
    setPrompt(samplePrompt)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* 입력 패널 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            에셋 생성
          </CardTitle>
          <CardDescription>
            {currentStyle ? (
              <>
                <span className="font-medium text-foreground">{currentStyle.nameKo}</span> 스타일로 생성합니다
              </>
            ) : (
              '스타일을 선택하고 프롬프트를 입력하세요'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">프롬프트</label>
            <Textarea
              placeholder="생성할 에셋을 설명하세요..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex flex-wrap gap-1">
              {currentPrompts.map((sample, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                  onClick={() => handleCopyPrompt(sample)}
                >
                  {sample.slice(0, 20)}...
                </Badge>
              ))}
            </div>
          </div>

          {/* 옵션 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">비율</label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map(ratio => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">생성 개수</label>
              <Select
                value={numberOfImages.toString()}
                onValueChange={(v) => setNumberOfImages(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}개
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 생성 버튼 */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-12"
            variant="gradient"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                에셋 생성하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 결과 패널 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            생성 결과
          </CardTitle>
          <CardDescription>
            AI가 생성한 게임 에셋입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 border border-border">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 blur-xl opacity-50 animate-pulse" />
                  <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                  AI가 에셋을 생성하고 있습니다...
                </p>
              </div>
            ) : generatedImage ? (
              <>
                <img
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated asset"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    저장
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleGenerate()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재생성
                  </Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="h-12 w-12 opacity-20" />
                <p className="text-sm">생성된 이미지가 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
