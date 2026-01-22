import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, GeneratedAsset } from '@/types'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isGenerating: false,
      generatedAssets: [],
      selectedStyle: 'character',
      prompt: '',
      error: null,

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
    }),
    {
      name: 'isw-asset-store',
      partialize: (state) => ({
        generatedAssets: state.generatedAssets.slice(0, 50),
        selectedStyle: state.selectedStyle,
      }),
    }
  )
)
