import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getStyleConfig } from '@/lib/styles-config'
import type { AssetStyleId, AnalyzedAsset } from '@/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' })

// AI 프롬프트 강화
async function enhancePrompt(prompt: string, style: AssetStyleId): Promise<string> {
  try {
    const styleConfig = getStyleConfig(style)
    if (!styleConfig) return prompt

    const systemInstruction = `You are an expert game artist prompt engineer. Enhance the given prompt for professional game art generation.
Keep it concise (max 100 words), add artistic details, output in English only.
Style: ${styleConfig.nameKo} (${styleConfig.promptPrefix})`

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Enhance: "${prompt}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    })

    return response.text?.trim() || prompt
  } catch {
    return prompt
  }
}

// 단일 에셋 생성
async function generateSingleAsset(asset: AnalyzedAsset): Promise<{
  id: string
  success: boolean
  imageUrl?: string
  enhancedPrompt?: string
  error?: string
}> {
  try {
    // 프롬프트 강화
    const enhancedPrompt = await enhancePrompt(asset.prompt, asset.style)

    // 이미지 생성 (Imagen 4 모델 사용)
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: asset.aspectRatio || '1:1',
        outputMimeType: 'image/png',
      },
    })

    if (response.generatedImages && response.generatedImages.length > 0) {
      const img = response.generatedImages[0]
      if (img.image?.imageBytes) {
        return {
          id: asset.id,
          success: true,
          imageUrl: img.image.imageBytes,
          enhancedPrompt
        }
      }
    }

    return {
      id: asset.id,
      success: false,
      error: '이미지 생성 실패'
    }
  } catch (error: unknown) {
    return {
      id: asset.id,
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}

// 일괄 생성 API
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const { assets } = body as { assets: AnalyzedAsset[] }

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json({
        success: false,
        error: '생성할 에셋을 선택해주세요'
      }, { status: 400 })
    }

    // 최대 10개까지 한 번에 생성 (API 제한 고려)
    const assetsToGenerate = assets.slice(0, 10)

    // 순차적으로 생성 (병렬 시 API 제한에 걸릴 수 있음)
    const results: Array<{
      id: string
      success: boolean
      imageUrl?: string
      enhancedPrompt?: string
      error?: string
    }> = []

    for (const asset of assetsToGenerate) {
      const result = await generateSingleAsset(asset)
      results.push(result)

      // API 레이트 리밋 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: assetsToGenerate.length,
        successful,
        failed,
        remaining: assets.length - assetsToGenerate.length
      }
    })

  } catch (error: unknown) {
    console.error('Batch Generate Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: `일괄 생성 실패: ${errorMessage}`
    }, { status: 500 })
  }
}

// 개별 에셋 생성용 (스트리밍 대안)
export async function PUT(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const { asset } = body as { asset: AnalyzedAsset }

    if (!asset) {
      return NextResponse.json({
        success: false,
        error: '에셋 정보가 필요합니다'
      }, { status: 400 })
    }

    const result = await generateSingleAsset(asset)

    return NextResponse.json(result)

  } catch (error: unknown) {
    console.error('Single Generate Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: `생성 실패: ${errorMessage}`
    }, { status: 500 })
  }
}
