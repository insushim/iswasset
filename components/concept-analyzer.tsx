'use client'

import { useState } from 'react'
import {
  Loader2, Sparkles, Brain, Trash2, Play,
  CheckCircle2, XCircle, Clock, Download, Gamepad2,
  Globe, RefreshCw, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useAppStore } from '@/lib/store'
import type { AnalyzedAsset, GeneratedAsset, GameConceptAnalysis } from '@/types'

const sampleConcepts = [
  '중세 판타지 RPG - 용과 마법사가 등장하는 턴제 전투 게임. 다양한 몬스터와 던전, 마을이 있고 주인공이 세계를 구하는 스토리',
  '우주 탐험 로그라이크 - 랜덤 생성 행성들을 탐험하고 외계 생물과 싸우며 우주선을 업그레이드하는 게임',
  '귀여운 농장 시뮬레이션 - 캐릭터가 농작물을 키우고 동물을 돌보며 마을 사람들과 친해지는 힐링 게임',
]

const sampleUrls = [
  'https://www.notion.so',
  'https://vercel.com',
  'https://github.com',
]

export function ConceptAnalyzer() {
  const [activeTab, setActiveTab] = useState<'concept' | 'url'>('concept')
  const [concept, setConcept] = useState('')
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<GameConceptAnalysis | null>(null)
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set())
  const [autoGenerateAfterAnalysis, setAutoGenerateAfterAnalysis] = useState(false)
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set())
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)

  const {
    analyzedAssets,
    setAnalyzedAssets,
    updateAnalyzedAsset,
    clearAnalyzedAssets,
    isAnalyzing,
    setIsAnalyzing,
    isBatchGenerating,
    setIsBatchGenerating,
    batchProgress,
    setBatchProgress,
    addGeneratedAsset,
  } = useAppStore()

  // 게임 컨셉 분석
  const handleAnalyzeConcept = async () => {
    if (!concept.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysis(null)
    clearAnalyzedAssets()
    setSourceUrl(null)

    try {
      const response = await fetch('/api/analyze-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다')
      }

      if (data.analysis) {
        setAnalysis(data.analysis)
        setAnalyzedAssets(data.analysis.assets)
        setSelectedAssetIds(new Set(data.analysis.assets.map((a: AnalyzedAsset) => a.id)))

        // 자동 생성 옵션 확인
        if (autoGenerateAfterAnalysis) {
          setTimeout(() => handleBatchGenerate(data.analysis.assets), 500)
        }
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // URL 분석
  const handleAnalyzeUrl = async () => {
    if (!url.trim() || isAnalyzing) return

    // URL 유효성 검사
    try {
      new URL(url)
    } catch {
      alert('유효한 URL을 입력해주세요 (https://example.com)')
      return
    }

    setIsAnalyzing(true)
    setAnalysis(null)
    clearAnalyzedAssets()

    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'URL 분석 중 오류가 발생했습니다')
      }

      if (data.analysis) {
        setAnalysis(data.analysis)
        setAnalyzedAssets(data.analysis.assets)
        setSelectedAssetIds(new Set(data.analysis.assets.map((a: AnalyzedAsset) => a.id)))
        setSourceUrl(data.sourceUrl)

        // 자동 생성 옵션 확인
        if (autoGenerateAfterAnalysis) {
          setTimeout(() => handleBatchGenerate(data.analysis.assets), 500)
        }
      }
    } catch (error) {
      console.error('URL Analysis error:', error)
      alert(error instanceof Error ? error.message : 'URL 분석 중 오류가 발생했습니다')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 선택된 에셋 일괄 생성
  const handleBatchGenerate = async (assetsOverride?: AnalyzedAsset[]) => {
    const assetsToUse = assetsOverride || analyzedAssets
    const selectedAssets = assetsToUse.filter(a =>
      selectedAssetIds.has(a.id) && a.status === 'pending'
    )

    if (selectedAssets.length === 0) {
      alert('생성할 에셋을 선택해주세요')
      return
    }

    setIsBatchGenerating(true)
    setBatchProgress({
      total: selectedAssets.length,
      completed: 0,
      failed: 0,
      current: selectedAssets[0]?.nameKo || ''
    })

    let completedCount = 0
    let failedCount = 0

    for (let i = 0; i < selectedAssets.length; i++) {
      const asset = selectedAssets[i]

      setBatchProgress({
        total: selectedAssets.length,
        completed: completedCount,
        failed: failedCount,
        current: asset.nameKo
      })

      updateAnalyzedAsset(asset.id, { status: 'generating' })

      try {
        const response = await fetch('/api/generate-batch', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset }),
        })

        const data = await response.json()

        if (data.success && data.imageUrl) {
          updateAnalyzedAsset(asset.id, {
            status: 'completed',
            imageUrl: data.imageUrl,
            enhancedPrompt: data.enhancedPrompt
          })
          completedCount++

          const newAsset: GeneratedAsset = {
            id: `gen-${Date.now()}-${i}`,
            prompt: asset.prompt,
            style: asset.style,
            imageUrl: data.imageUrl,
            createdAt: new Date().toISOString(),
            aspectRatio: asset.aspectRatio,
          }
          addGeneratedAsset(newAsset)
        } else {
          updateAnalyzedAsset(asset.id, { status: 'failed' })
          failedCount++
        }
      } catch {
        updateAnalyzedAsset(asset.id, { status: 'failed' })
        failedCount++
      }
    }

    setBatchProgress({
      total: selectedAssets.length,
      completed: completedCount,
      failed: failedCount,
      current: '완료'
    })

    setIsBatchGenerating(false)
  }

  // 개별 에셋 재생성
  const handleRegenerateAsset = async (asset: AnalyzedAsset) => {
    setRegeneratingIds(prev => new Set(prev).add(asset.id))
    updateAnalyzedAsset(asset.id, { status: 'generating' })

    try {
      const response = await fetch('/api/generate-batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset }),
      })

      const data = await response.json()

      if (data.success && data.imageUrl) {
        updateAnalyzedAsset(asset.id, {
          status: 'completed',
          imageUrl: data.imageUrl,
          enhancedPrompt: data.enhancedPrompt
        })

        const newAsset: GeneratedAsset = {
          id: `gen-${Date.now()}`,
          prompt: asset.prompt,
          style: asset.style,
          imageUrl: data.imageUrl,
          createdAt: new Date().toISOString(),
          aspectRatio: asset.aspectRatio,
        }
        addGeneratedAsset(newAsset)
      } else {
        updateAnalyzedAsset(asset.id, { status: 'failed' })
      }
    } catch {
      updateAnalyzedAsset(asset.id, { status: 'failed' })
    } finally {
      setRegeneratingIds(prev => {
        const next = new Set(prev)
        next.delete(asset.id)
        return next
      })
    }
  }

  // 실패한 모든 에셋 재시도
  const handleRetryAllFailed = async () => {
    const failedAssets = analyzedAssets.filter(a => a.status === 'failed')
    if (failedAssets.length === 0) return

    setIsBatchGenerating(true)
    setBatchProgress({
      total: failedAssets.length,
      completed: 0,
      failed: 0,
      current: failedAssets[0]?.nameKo || ''
    })

    let completedCount = 0
    let failedCount = 0

    for (const asset of failedAssets) {
      setBatchProgress({
        total: failedAssets.length,
        completed: completedCount,
        failed: failedCount,
        current: asset.nameKo
      })

      updateAnalyzedAsset(asset.id, { status: 'generating' })

      try {
        const response = await fetch('/api/generate-batch', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset }),
        })

        const data = await response.json()

        if (data.success && data.imageUrl) {
          updateAnalyzedAsset(asset.id, {
            status: 'completed',
            imageUrl: data.imageUrl,
            enhancedPrompt: data.enhancedPrompt
          })
          completedCount++

          const newAsset: GeneratedAsset = {
            id: `gen-retry-${Date.now()}`,
            prompt: asset.prompt,
            style: asset.style,
            imageUrl: data.imageUrl,
            createdAt: new Date().toISOString(),
            aspectRatio: asset.aspectRatio,
          }
          addGeneratedAsset(newAsset)
        } else {
          updateAnalyzedAsset(asset.id, { status: 'failed' })
          failedCount++
        }
      } catch {
        updateAnalyzedAsset(asset.id, { status: 'failed' })
        failedCount++
      }
    }

    setBatchProgress({
      total: failedAssets.length,
      completed: completedCount,
      failed: failedCount,
      current: '재시도 완료'
    })

    setIsBatchGenerating(false)
  }

  // 에셋 선택 토글
  const toggleAssetSelection = (id: string) => {
    const newSelected = new Set(selectedAssetIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAssetIds(newSelected)
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedAssetIds.size === analyzedAssets.length) {
      setSelectedAssetIds(new Set())
    } else {
      setSelectedAssetIds(new Set(analyzedAssets.map(a => a.id)))
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      essential: 'bg-red-500/20 text-red-400 border-red-500/30',
      recommended: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      optional: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    }
    const labels: Record<string, string> = {
      essential: '필수',
      recommended: '권장',
      optional: '선택',
    }
    return (
      <Badge className={`${colors[priority] || colors.optional} border text-xs`}>
        {labels[priority] || priority}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'generating':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const pendingCount = analyzedAssets.filter(a =>
    selectedAssetIds.has(a.id) && a.status === 'pending'
  ).length

  const completedCount = analyzedAssets.filter(a => a.status === 'completed').length
  const failedCount = analyzedAssets.filter(a => a.status === 'failed').length

  return (
    <div className="space-y-6">
      {/* 입력 탭 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI 에셋 분석
          </CardTitle>
          <CardDescription>
            게임 컨셉이나 웹사이트 URL을 입력하면 AI가 필요한 모든 에셋을 분석합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'concept' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="concept" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                게임 컨셉
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                웹사이트 URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="concept" className="space-y-4 mt-4">
              <Textarea
                placeholder="게임의 장르, 스토리, 분위기, 주요 요소 등을 자세히 설명해주세요...&#10;&#10;예: 중세 판타지 RPG - 용과 마법사가 등장하는 턴제 전투 게임..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isAnalyzing}
              />

              <div className="flex flex-wrap gap-2">
                {sampleConcepts.map((sample, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                    onClick={() => setConcept(sample)}
                  >
                    {sample.slice(0, 30)}...
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-generate-concept"
                  checked={autoGenerateAfterAnalysis}
                  onCheckedChange={(checked) => setAutoGenerateAfterAnalysis(checked === true)}
                />
                <label htmlFor="auto-generate-concept" className="text-sm text-muted-foreground cursor-pointer">
                  분석 후 자동으로 모든 에셋 생성
                </label>
              </div>

              <Button
                onClick={handleAnalyzeConcept}
                disabled={!concept.trim() || isAnalyzing}
                className="w-full h-12"
                variant="gradient"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI가 분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    컨셉 분석하기
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-4">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12"
                disabled={isAnalyzing}
              />

              <div className="flex flex-wrap gap-2">
                {sampleUrls.map((sample, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                    onClick={() => setUrl(sample)}
                  >
                    {sample}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-generate-url"
                  checked={autoGenerateAfterAnalysis}
                  onCheckedChange={(checked) => setAutoGenerateAfterAnalysis(checked === true)}
                />
                <label htmlFor="auto-generate-url" className="text-sm text-muted-foreground cursor-pointer">
                  분석 후 자동으로 모든 에셋 생성
                </label>
              </div>

              <Button
                onClick={handleAnalyzeUrl}
                disabled={!url.trim() || isAnalyzing}
                className="w-full h-12"
                variant="gradient"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    웹사이트 분석 중...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-5 w-5" />
                    URL 분석하기
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {analysis && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {analysis.gameName}
                </CardTitle>
                <CardDescription className="mt-1">
                  {analysis.genre} · {analysis.artStyle} · {analysis.totalCount}개 에셋
                  {sourceUrl && (
                    <span className="block text-xs mt-1">
                      출처: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{sourceUrl}</a>
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedAssetIds.size === analyzedAssets.length ? '전체 해제' : '전체 선택'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearAnalyzedAssets()
                    setAnalysis(null)
                    setSourceUrl(null)
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 진행 상황 요약 */}
            {(completedCount > 0 || failedCount > 0) && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{completedCount}개 완료</span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>{failedCount}개 실패</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{pendingCount}개 대기</span>
                </div>
              </div>
            )}

            {/* 일괄 생성 진행 상황 */}
            {batchProgress && isBatchGenerating && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>생성 진행 중: {batchProgress.current}</span>
                  <span>{batchProgress.completed} / {batchProgress.total}</span>
                </div>
                <Progress
                  value={(batchProgress.completed / batchProgress.total) * 100}
                  className="h-2"
                />
              </div>
            )}

            {/* 에셋 목록 */}
            <Accordion type="multiple" className="space-y-2">
              {['essential', 'recommended', 'optional'].map(priority => {
                const priorityAssets = analyzedAssets.filter(a => a.priority === priority)
                if (priorityAssets.length === 0) return null

                return (
                  <AccordionItem key={priority} value={priority} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(priority)}
                        <span className="text-sm">{priorityAssets.length}개</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-2 py-2">
                        {priorityAssets.map(asset => (
                          <div
                            key={asset.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              selectedAssetIds.has(asset.id)
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-muted/30 border-border'
                            }`}
                          >
                            <Checkbox
                              checked={selectedAssetIds.has(asset.id)}
                              onCheckedChange={() => toggleAssetSelection(asset.id)}
                              disabled={asset.status === 'generating' || regeneratingIds.has(asset.id)}
                            />

                            {asset.imageUrl ? (
                              <img
                                src={`data:image/png;base64,${asset.imageUrl}`}
                                alt={asset.nameKo}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                {getStatusIcon(asset.status)}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{asset.nameKo}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {asset.style}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {asset.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* 완료된 에셋: 다운로드 + 재생성 버튼 */}
                              {asset.status === 'completed' && asset.imageUrl && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = `data:image/png;base64,${asset.imageUrl}`
                                      link.download = `${asset.name}.png`
                                      link.click()
                                    }}
                                    title="다운로드"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRegenerateAsset(asset)}
                                    disabled={isBatchGenerating || regeneratingIds.has(asset.id)}
                                    title="재생성"
                                    className="text-orange-500 hover:text-orange-600"
                                  >
                                    {regeneratingIds.has(asset.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}

                              {/* 대기/실패 에셋: 생성 버튼 */}
                              {(asset.status === 'pending' || asset.status === 'failed') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRegenerateAsset(asset)}
                                  disabled={isBatchGenerating || regeneratingIds.has(asset.id)}
                                  title={asset.status === 'failed' ? '재시도' : '생성'}
                                  className={asset.status === 'failed' ? 'text-red-500 hover:text-red-600' : ''}
                                >
                                  {regeneratingIds.has(asset.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : asset.status === 'failed' ? (
                                    <RefreshCw className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              )}

                              {/* 생성 중 표시 */}
                              {asset.status === 'generating' && !regeneratingIds.has(asset.id) && (
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

            {/* 액션 버튼들 */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleBatchGenerate()}
                disabled={pendingCount === 0 || isBatchGenerating}
                className="flex-1 h-12 min-w-[200px]"
                variant="gradient"
              >
                {isBatchGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    선택한 {pendingCount}개 에셋 생성
                  </>
                )}
              </Button>

              {failedCount > 0 && (
                <Button
                  onClick={handleRetryAllFailed}
                  disabled={isBatchGenerating}
                  variant="outline"
                  className="h-12"
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  실패 {failedCount}개 재시도
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
