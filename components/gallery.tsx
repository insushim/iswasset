'use client'

import { useState } from 'react'
import { Download, Trash2, Copy, ExternalLink, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import type { GeneratedAsset, StyleConfig } from '@/types'

interface GalleryProps {
  styles: StyleConfig[]
}

export function Gallery({ styles }: GalleryProps) {
  const { generatedAssets, removeGeneratedAsset, clearAllAssets } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null)

  const getStyleName = (styleId: string) => {
    const style = styles.find(s => s.id === styleId)
    return style?.name || styleId
  }

  const handleDownload = (asset: GeneratedAsset) => {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${asset.imageUrl}`
    link.download = `isw-asset-${asset.style}-${Date.now()}.png`
    link.click()
  }

  const handleCopyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (generatedAssets.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <ImageOff className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            아직 생성된 에셋이 없습니다
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            위의 생성기에서 에셋을 만들어보세요
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>내 에셋 갤러리</CardTitle>
              <CardDescription>
                생성한 에셋 {generatedAssets.length}개
              </CardDescription>
            </div>
            {generatedAssets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllAssets}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                전체 삭제
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {generatedAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted/50 border border-border cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                onClick={() => setSelectedAsset(asset)}
              >
                <img
                  src={`data:image/png;base64,${asset.imageUrl}`}
                  alt={asset.prompt}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {getStyleName(asset.style)}
                    </Badge>
                    <p className="text-[10px] text-white/80 mt-1 line-clamp-2">
                      {asset.prompt}
                    </p>
                  </div>
                </div>
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeGeneratedAsset(asset.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 상세 모달 */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-3xl">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge>{getStyleName(selectedAsset.style)}</Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatDate(selectedAsset.createdAt)}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-left">
                  {selectedAsset.prompt}
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted/50">
                <img
                  src={`data:image/png;base64,${selectedAsset.imageUrl}`}
                  alt={selectedAsset.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPrompt(selectedAsset.prompt)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  프롬프트 복사
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(selectedAsset)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
