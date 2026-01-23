import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import type { AnalyzedAsset, GameConceptAnalysis, AssetStyleId, AspectRatio } from '@/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' })

// URL에서 웹사이트 콘텐츠 가져오기
async function fetchWebsiteContent(url: string): Promise<{ content: string; isSPA: boolean; metadata: Record<string, string> }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // 메타데이터 추출
    const metadata: Record<string, string> = {}
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) metadata.title = titleMatch[1].trim()

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (descMatch) metadata.description = descMatch[1].trim()

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    if (ogTitleMatch) metadata.ogTitle = ogTitleMatch[1].trim()

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (ogDescMatch) metadata.ogDescription = ogDescMatch[1].trim()

    // SPA 감지 (React, Vue, Angular 등)
    const isSPA = html.includes('__NEXT_DATA__') ||
                  html.includes('__NUXT__') ||
                  html.includes('ng-app') ||
                  html.includes('data-reactroot') ||
                  html.includes('id="root"') ||
                  html.includes('id="app"') ||
                  (html.match(/<script/gi)?.length || 0) > 5

    // HTML에서 텍스트 추출
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 스크립트 제거
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 스타일 제거
      .replace(/<[^>]+>/g, ' ') // HTML 태그 제거
      .replace(/\s+/g, ' ') // 여러 공백을 하나로
      .trim()
      .slice(0, 8000) // 최대 8000자

    return { content: textContent, isSPA, metadata }
  } catch (error) {
    console.error('Website fetch error:', error)
    throw new Error(`웹사이트를 불러올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// URL인지 확인
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// 웹사이트 분석하여 필요한 에셋 목록 생성
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const { url } = body

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({
        success: false,
        error: '유효한 URL을 입력해주세요 (https://example.com)'
      }, { status: 400 })
    }

    // 웹사이트 콘텐츠 가져오기
    const { content: websiteContent, isSPA, metadata } = await fetchWebsiteContent(url)

    // URL에서 정보 추출
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    const urlInfo = `Domain: ${urlObj.hostname}, Path: ${urlObj.pathname}, Path segments: ${pathParts.join(', ')}`

    // SPA나 콘텐츠가 부족한 경우 URL과 메타데이터 기반으로 분석
    let contentForAnalysis = websiteContent
    if (websiteContent.length < 50 || isSPA) {
      // 메타데이터와 URL 정보 조합
      const metaInfo = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      contentForAnalysis = `
URL Information:
${urlInfo}

Metadata:
${metaInfo || 'No metadata available'}

Detected as: ${isSPA ? 'Single Page Application (SPA/JavaScript-rendered site)' : 'Static website'}

Available text content:
${websiteContent || 'Minimal content (JavaScript-rendered)'}
      `.trim()

      // 여전히 정보가 없으면 에러
      if (!metadata.title && !metadata.ogTitle && pathParts.length === 0 && websiteContent.length < 20) {
        return NextResponse.json({
          success: false,
          error: '웹사이트에서 충분한 정보를 추출할 수 없습니다. URL을 확인하거나 다른 페이지를 시도해주세요.'
        }, { status: 400 })
      }
    }

    const systemInstruction = `You are an expert game designer and visual asset consultant. Analyze the given website content and determine what visual assets would be needed if this website/service were to have game-like elements, illustrations, or enhanced visual design.

For each asset, determine:
1. Asset name (English) and nameKo (Korean)
2. Best fitting style from: icon, character, item, weapon, armor, environment, ui_element, tile, pixel_art, vfx, creature, vehicle, building, prop, portrait, logo, texture, spritesheet
3. Detailed prompt for AI image generation (in English, professional art terminology)
4. Priority: essential (must-have for the site), recommended (would improve UX), optional (nice enhancement)
5. Category for grouping (e.g., "브랜딩", "UI 요소", "일러스트", "아이콘", "배경")
6. Best aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4

Consider these asset types based on website purpose:
- E-commerce: Product icons, category illustrations, promotional banners, mascot characters
- Blog/Content: Header illustrations, category icons, author avatars, decorative elements
- SaaS/App: Feature icons, onboarding illustrations, empty state graphics, mascot
- Game site: Characters, items, backgrounds, UI elements, logos
- Corporate: Brand mascot, service icons, infographic elements, team avatars
- Education: Subject icons, character guides, achievement badges, progress indicators

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "siteName": "Detected site name or title",
  "siteType": "e-commerce/blog/saas/game/corporate/education/other",
  "siteDescription": "Brief description of what this site does",
  "recommendedStyle": "Overall recommended art style for consistency",
  "assets": [
    {
      "name": "asset_name_english",
      "nameKo": "에셋 이름 한글",
      "description": "Brief description and purpose of this asset",
      "style": "icon",
      "prompt": "Detailed professional prompt for image generation",
      "priority": "essential",
      "category": "브랜딩",
      "aspectRatio": "1:1"
    }
  ],
  "totalCount": 12,
  "estimatedTime": "약 6분"
}

Include 10-20 assets covering various needs:
- Brand identity (logo variations, mascot) - 2-3
- Navigation/UI icons - 3-5
- Feature/service illustrations - 3-5
- Decorative/enhancement elements - 2-4
- Social/engagement elements - 2-3

Be creative and practical. Focus on assets that would genuinely improve the website's visual appeal and user experience.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Analyze this website and create a list of visual assets it would benefit from:\n\nURL: ${url}\n\nWebsite Content:\n${contentForAnalysis}`,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 4000,
      }
    })

    const responseText = response.text?.trim() || ''

    // JSON 파싱 시도
    let analysis: GameConceptAnalysis & { siteType?: string; siteDescription?: string; recommendedStyle?: string }
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
        id: `url-asset-${Date.now()}-${index}`,
        status: 'pending' as const,
        style: validateStyle(asset.style),
        aspectRatio: validateAspectRatio(asset.aspectRatio),
        priority: validatePriority(asset.priority),
      }))

      analysis = {
        gameName: parsed.siteName || new URL(url).hostname,
        genre: parsed.siteType || '웹사이트',
        artStyle: parsed.recommendedStyle || '모던 일러스트',
        siteType: parsed.siteType,
        siteDescription: parsed.siteDescription,
        recommendedStyle: parsed.recommendedStyle,
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
      analysis,
      sourceUrl: url
    })

  } catch (error: unknown) {
    console.error('URL Analyze API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: `URL 분석 실패: ${errorMessage}`
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
