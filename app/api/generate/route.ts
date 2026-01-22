import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getStyleConfig } from '@/lib/styles-config'
import { generateId } from '@/lib/utils'
import type { AssetStyleId, GenerateRequest, GenerateResponse } from '@/types'

// Internal type for API response assets (different from client-side GeneratedAsset)
interface ApiGeneratedAsset {
  id: string
  imageData: string
  prompt: string
  enhancedPrompt?: string
  style: string
  size: string
  timestamp: number
}

// Server-side only - API key is never exposed to client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    // Validate API key exists
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured. Please set GOOGLE_API_KEY in environment variables.'
      }, { status: 500 })
    }

    const body: GenerateRequest = await request.json()
    const { prompt, style, size = '1024', count = 1, negativePrompt, enhancePrompt = true } = body

    // Validate required fields
    if (!prompt || !style) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and style are required'
      }, { status: 400 })
    }

    // Get style configuration
    const styleConfig = getStyleConfig(style as AssetStyleId)
    if (!styleConfig) {
      return NextResponse.json({
        success: false,
        error: `Invalid style: ${style}`
      }, { status: 400 })
    }

    // Build enhanced prompt
    let finalPrompt = prompt
    if (enhancePrompt) {
      finalPrompt = `${styleConfig.promptPrefix} ${prompt}`

      // Add quality boosters
      finalPrompt += ', high quality, detailed, professional game art, masterpiece'

      // Add negative prompt if provided
      if (negativePrompt) {
        finalPrompt += `. Avoid: ${negativePrompt}`
      }
    }

    // Use Gemini Flash for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation'
    })

    const generatedAssets: ApiGeneratedAsset[] = []

    // Generate images
    for (let i = 0; i < Math.min(count, 4); i++) {
      try {
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: finalPrompt }]
          }],
          generationConfig: {
            candidateCount: 1,
          }
        })

        const response = result.response

        // Check if image was generated
        if (response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0]

          // For Imagen, the response includes inline data
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if ('inlineData' in part && part.inlineData) {
                const asset: ApiGeneratedAsset = {
                  id: generateId(),
                  imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                  prompt: prompt,
                  enhancedPrompt: enhancePrompt ? finalPrompt : undefined,
                  style: style,
                  size: size,
                  timestamp: Date.now(),
                }
                generatedAssets.push(asset)
              }
            }
          }
        }
      } catch (genError: unknown) {
        console.error(`Generation ${i + 1} failed:`, genError)
        // Continue with other generations
      }
    }

    if (generatedAssets.length === 0) {
      // Fallback: Try with Gemini Pro Vision for text-to-image description
      try {
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        const descriptionResult = await geminiModel.generateContent({
          contents: [{
            role: 'user',
            parts: [{
              text: `You are a professional game artist. Describe in vivid detail how this game asset would look: "${finalPrompt}". Include colors, style, composition, and artistic details.`
            }]
          }]
        })

        const description = descriptionResult.response.text()

        // Return description as a fallback
        return NextResponse.json({
          success: true,
          assets: [{
            id: generateId(),
            imageData: '', // No actual image
            prompt: prompt,
            enhancedPrompt: description,
            style: style,
            size: size,
            timestamp: Date.now(),
          }],
          error: 'Image generation not available. Returned detailed description instead.'
        })
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Failed to generate assets. Please try again with a different prompt.'
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      assets: generatedAssets,
    })

  } catch (error: unknown) {
    console.error('Generate API Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json({
      success: false,
      error: `Generation failed: ${errorMessage}`
    }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'ISW Game Asset Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate': 'Generate game assets',
      'GET /api/styles': 'Get available styles'
    }
  })
}
