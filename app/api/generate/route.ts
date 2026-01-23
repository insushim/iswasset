import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getStyleConfig } from '@/lib/styles-config'
import type { AssetStyleId } from '@/types'

// Initialize Google GenAI with Imagen 3
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' })

// AI 프롬프트 강화 함수 - 간단한 한국어를 전문 프롬프트로 변환
async function enhancePromptWithAI(userPrompt: string, styleConfig: { promptPrefix: string; nameKo: string }): Promise<string> {
  try {
    const systemInstruction = `You are an expert game artist prompt engineer. Transform simple Korean descriptions into detailed, professional image generation prompts.

Rules:
1. Keep the core concept from user input
2. Add artistic details: lighting, composition, texture, color palette
3. Add game art specific terms: game ready, clean edges, stylized, professional
4. Output in English only
5. Be concise but descriptive (max 150 words)
6. Focus on visual elements, not story

Style context: ${styleConfig.nameKo} (${styleConfig.promptPrefix})`

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this into a professional game art prompt: "${userPrompt}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    })

    return response.text?.trim() || userPrompt
  } catch (error) {
    console.error('Prompt enhancement failed:', error)
    // Fallback: basic enhancement
    return `${styleConfig.promptPrefix} ${userPrompt}, high quality, detailed, professional game art`
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const { prompt, style, aspectRatio = '1:1', numberOfImages = 1 } = body

    // Validate required fields
    if (!prompt || !style) {
      return NextResponse.json({
        success: false,
        error: 'prompt와 style은 필수입니다'
      }, { status: 400 })
    }

    // Get style configuration
    const styleConfig = getStyleConfig(style as AssetStyleId)
    if (!styleConfig) {
      return NextResponse.json({
        success: false,
        error: `잘못된 스타일: ${style}`
      }, { status: 400 })
    }

    // AI로 프롬프트 강화
    const enhancedPrompt = await enhancePromptWithAI(prompt, styleConfig)
    console.log('Original prompt:', prompt)
    console.log('Enhanced prompt:', enhancedPrompt)

    // Imagen 4 모델로 이미지 생성 (imagen-3.0은 2025.11.10 deprecated)
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: Math.min(numberOfImages, 4),
        aspectRatio: aspectRatio,
        outputMimeType: 'image/png',
      },
    })

    // 생성된 이미지 추출
    const images: string[] = []

    if (response.generatedImages && response.generatedImages.length > 0) {
      for (const img of response.generatedImages) {
        if (img.image?.imageBytes) {
          // base64 인코딩된 이미지 데이터
          images.push(img.image.imageBytes)
        }
      }
    }

    if (images.length === 0) {
      return NextResponse.json({
        success: false,
        error: '이미지 생성에 실패했습니다. 다른 프롬프트로 시도해주세요.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      images,
      enhancedPrompt, // 클라이언트에 강화된 프롬프트도 전달
    })

  } catch (error: unknown) {
    console.error('Generate API Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      success: false,
      error: `생성 실패: ${errorMessage}`
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'ISW Game Asset Generator API',
    version: '2.1.0',
    model: 'imagen-4.0-generate-001',
    features: ['AI prompt enhancement', '18 game asset styles']
  })
}
