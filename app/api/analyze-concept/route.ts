import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import type { AnalyzedAsset, GameConceptAnalysis, AssetStyleId, AspectRatio } from '@/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' })

// 게임 컨셉을 분석하여 필요한 에셋 목록 생성
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const { concept } = body

    if (!concept || concept.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: '게임 컨셉을 10자 이상 입력해주세요'
      }, { status: 400 })
    }

    const systemInstruction = `You are an expert game designer and art director. Analyze the given game concept and create a comprehensive list of visual assets needed for the game.

For each asset, determine:
1. Asset name (English) and nameKo (Korean)
2. Best fitting style from: icon, character, item, weapon, armor, environment, ui_element, tile, pixel_art, vfx, creature, vehicle, building, prop, portrait, logo, texture, spritesheet
3. Detailed prompt for AI image generation (in English, professional game art terminology)
4. Priority: essential (must-have), recommended (should-have), optional (nice-to-have)
5. Category for grouping
6. Best aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "gameName": "Game Name",
  "genre": "Genre",
  "artStyle": "Overall art style description",
  "assets": [
    {
      "name": "asset_name_english",
      "nameKo": "에셋 이름 한글",
      "description": "Brief description of this asset",
      "style": "character",
      "prompt": "Detailed professional prompt for image generation",
      "priority": "essential",
      "category": "Characters",
      "aspectRatio": "1:1"
    }
  ],
  "totalCount": 10,
  "estimatedTime": "약 5분"
}

Include 8-20 assets covering:
- Main characters (2-4)
- Enemies/creatures (2-4)
- Items/weapons (2-4)
- UI elements/icons (2-4)
- Environment/backgrounds (2-4)
- Props/decorations (1-3)

Be creative but practical. Focus on assets that would actually be needed for a playable game.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: `Analyze this game concept and create asset list:\n\n"${concept}"`,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 4000,
      }
    })

    const responseText = response.text?.trim() || ''

    // JSON 파싱 시도
    let analysis: GameConceptAnalysis
    try {
      // 마크다운 코드 블록 제거
      let jsonText = responseText
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
      }

      const parsed = JSON.parse(jsonText)

      // 에셋에 ID와 상태 추가
      const assets: AnalyzedAsset[] = parsed.assets.map((asset: Omit<AnalyzedAsset, 'id' | 'status'>, index: number) => ({
        ...asset,
        id: `asset-${Date.now()}-${index}`,
        status: 'pending' as const,
        style: validateStyle(asset.style),
        aspectRatio: validateAspectRatio(asset.aspectRatio),
        priority: validatePriority(asset.priority),
      }))

      analysis = {
        gameName: parsed.gameName || '분석된 게임',
        genre: parsed.genre || '미정',
        artStyle: parsed.artStyle || '2D 게임 아트',
        assets,
        totalCount: assets.length,
        estimatedTime: `약 ${Math.ceil(assets.length * 0.5)}분`,
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, '\nResponse:', responseText)
      return NextResponse.json({
        success: false,
        error: 'AI 응답 파싱 실패. 다시 시도해주세요.',
        rawResponse: responseText.substring(0, 500)
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error: unknown) {
    console.error('Analyze API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: `분석 실패: ${errorMessage}`
    }, { status: 500 })
  }
}

// 유효한 스타일인지 확인
function validateStyle(style: string): AssetStyleId {
  const validStyles: AssetStyleId[] = [
    'icon', 'character', 'item', 'weapon', 'armor', 'environment',
    'ui_element', 'tile', 'pixel_art', 'vfx', 'creature', 'vehicle',
    'building', 'prop', 'portrait', 'logo', 'texture', 'spritesheet'
  ]
  return validStyles.includes(style as AssetStyleId) ? (style as AssetStyleId) : 'icon'
}

// 유효한 비율인지 확인
function validateAspectRatio(ratio: string): AspectRatio {
  const validRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4']
  return validRatios.includes(ratio as AspectRatio) ? (ratio as AspectRatio) : '1:1'
}

// 유효한 우선순위인지 확인
function validatePriority(priority: string): 'essential' | 'recommended' | 'optional' {
  const validPriorities = ['essential', 'recommended', 'optional']
  return validPriorities.includes(priority) ? (priority as 'essential' | 'recommended' | 'optional') : 'recommended'
}
