import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, GeneratedAsset, AnalyzedAsset, BatchProgress } from '@/types'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isGenerating: false,
      generatedAssets: [],
      selectedStyle: 'character',
      prompt: '',
      error: null,
      // 게임 컨셉 관련
      gameConcept: '',
      analyzedAssets: [],
      isAnalyzing: false,
      isBatchGenerating: false,
      batchProgress: null,

      setGenerating: (isGenerating: boolean) => set({ isGenerating }),
      setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),

      addGeneratedAsset: (asset: GeneratedAsset) =>
        set((state) => ({
          generatedAssets: [asset, ...state.generatedAssets]
        })),

      removeGeneratedAsset: (id: string) =>
        set((state) => ({
          generatedAssets: state.generatedAssets.filter((a) => a.id !== id)
        })),

      clearAllAssets: () => set({ generatedAssets: [] }),

      setSelectedStyle: (styleId: string) => set({ selectedStyle: styleId }),

      setPrompt: (prompt: string) => set({ prompt }),

      setError: (error: string | null) => set({ error }),

      // 게임 컨셉 관련
      setGameConcept: (concept: string) => set({ gameConcept: concept }),

      setAnalyzedAssets: (assets: AnalyzedAsset[]) => set({ analyzedAssets: assets }),

      addAnalyzedAsset: (asset: AnalyzedAsset) =>
        set((state) => ({
          analyzedAssets: [...state.analyzedAssets, asset]
        })),

      removeAnalyzedAsset: (id: string) =>
        set((state) => ({
          analyzedAssets: state.analyzedAssets.filter((a) => a.id !== id)
        })),

      updateAnalyzedAsset: (id: string, updates: Partial<AnalyzedAsset>) =>
        set((state) => ({
          analyzedAssets: state.analyzedAssets.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          )
        })),

      setIsAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),

      setIsBatchGenerating: (isBatchGenerating: boolean) => set({ isBatchGenerating }),

      setBatchProgress: (progress: BatchProgress | null) => set({ batchProgress: progress }),

      clearAnalyzedAssets: () => set({ analyzedAssets: [], gameConcept: '' }),
    }),
    {
      name: 'isw-asset-store',
      partialize: (state) => ({
        generatedAssets: state.generatedAssets.slice(0, 50),
        selectedStyle: state.selectedStyle,
        analyzedAssets: state.analyzedAssets.slice(0, 30),
        gameConcept: state.gameConcept,
      }),
    }
  )
)
