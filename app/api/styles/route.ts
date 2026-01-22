import { NextResponse } from 'next/server'
import { STYLE_CONFIGS, STYLE_CATEGORIES, getAllStyles, getStylesByCategory } from '@/lib/styles-config'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  if (category) {
    const styles = getStylesByCategory(category)
    const styleConfigs = styles.map(style => STYLE_CONFIGS[style])

    return NextResponse.json({
      category,
      styles: styleConfigs
    })
  }

  // Convert STYLE_CONFIGS object to array for frontend components
  const stylesArray = Object.values(STYLE_CONFIGS)

  return NextResponse.json({
    categories: STYLE_CATEGORIES,
    styles: stylesArray,
    allStyles: getAllStyles()
  })
}
