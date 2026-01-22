export type AssetStyleId =
  | 'icon'
  | 'character'
  | 'item'
  | 'weapon'
  | 'armor'
  | 'environment'
  | 'ui_element'
  | 'tile'
  | 'pixel_art'
  | 'vfx'
  | 'creature'
  | 'vehicle'
  | 'building'
  | 'prop'
  | 'portrait'
  | 'logo'
  | 'texture'
  | 'spritesheet'

export type AssetCategoryId =
  | '2d'
  | '3d'
  | 'ui'
  | 'effects'
  | 'audio'
  | 'character'
  | 'item'
  | 'environment'

// Style object from API
export interface AssetStyle {
  id: string
  name: string
  nameEn: string
  description: string
  category: string
  promptPrefix: string
  examples: string[]
  tags: string[]
}

export interface StyleCategory {
  id: string
  name: string
  styles: string[]
}

export type ImageSize = '256' | '512' | '1024' | '2048'

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4'

export interface StyleConfig {
  id: string
  name: string
  nameKo: string
  description: string
  descriptionKo: string
  category: string
  icon: string
  promptPrefix: string
  examples: string[]
  tags: string[]
  color: string
}

export interface GenerateRequest {
  prompt: string
  style: string
  size?: ImageSize
  aspectRatio?: AspectRatio
  count?: number
  negativePrompt?: string
  seed?: number
  enhancePrompt?: boolean
}


export interface GenerateResponse {
  success: boolean
  images?: string[]
  error?: string
  remainingCredits?: number
}

export interface BatchGenerateRequest {
  prompts: string[]
  style: string
  size?: ImageSize
}


export interface GeneratedAsset {
  id: string
  prompt: string
  style: string
  imageUrl: string
  createdAt: string
  aspectRatio?: string
}

export interface AppState {
  isGenerating: boolean
  generatedAssets: GeneratedAsset[]
  selectedStyle: string
  prompt: string
  error: string | null
  // 게임 컨셉 관련
  gameConcept: string
  analyzedAssets: AnalyzedAsset[]
  isAnalyzing: boolean
  isBatchGenerating: boolean
  batchProgress: BatchProgress | null
  setGenerating: (isGenerating: boolean) => void
  setIsGenerating: (isGenerating: boolean) => void
  addGeneratedAsset: (asset: GeneratedAsset) => void
  removeGeneratedAsset: (id: string) => void
  clearAllAssets: () => void
  setSelectedStyle: (styleId: string) => void
  setPrompt: (prompt: string) => void
  setError: (error: string | null) => void
  // 게임 컨셉 관련
  setGameConcept: (concept: string) => void
  setAnalyzedAssets: (assets: AnalyzedAsset[]) => void
  addAnalyzedAsset: (asset: AnalyzedAsset) => void
  removeAnalyzedAsset: (id: string) => void
  updateAnalyzedAsset: (id: string, updates: Partial<AnalyzedAsset>) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setIsBatchGenerating: (isBatchGenerating: boolean) => void
  setBatchProgress: (progress: BatchProgress | null) => void
  clearAnalyzedAssets: () => void
}

// 게임 컨셉 분석 결과
export interface AnalyzedAsset {
  id: string
  name: string
  nameKo: string
  description: string
  style: AssetStyleId
  prompt: string
  enhancedPrompt?: string
  priority: 'essential' | 'recommended' | 'optional'
  category: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  imageUrl?: string
  aspectRatio: AspectRatio
}

export interface GameConceptAnalysis {
  gameName: string
  genre: string
  artStyle: string
  assets: AnalyzedAsset[]
  totalCount: number
  estimatedTime: string
}

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  current: string
}
