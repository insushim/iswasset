'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sword, User, Shield, Wand2, Mountain,
  Gem, Heart, Zap, Target, Palette,
  Gamepad2, Box, Sparkles, Crown, Flame
} from 'lucide-react'
import type { StyleConfig, StyleCategory } from '@/types'

const iconMap: Record<string, React.ReactNode> = {
  icon: <Box className="h-5 w-5" />,
  character: <User className="h-5 w-5" />,
  weapon: <Sword className="h-5 w-5" />,
  armor: <Shield className="h-5 w-5" />,
  spell: <Wand2 className="h-5 w-5" />,
  environment: <Mountain className="h-5 w-5" />,
  item: <Gem className="h-5 w-5" />,
  ui: <Palette className="h-5 w-5" />,
  monster: <Flame className="h-5 w-5" />,
  npc: <Crown className="h-5 w-5" />,
  vehicle: <Gamepad2 className="h-5 w-5" />,
  building: <Box className="h-5 w-5" />,
  effect: <Sparkles className="h-5 w-5" />,
  portrait: <User className="h-5 w-5" />,
  tile: <Target className="h-5 w-5" />,
  prop: <Gem className="h-5 w-5" />,
  creature: <Heart className="h-5 w-5" />,
  logo: <Zap className="h-5 w-5" />,
}

interface StyleSelectorProps {
  styles: StyleConfig[]
  categories: StyleCategory[]
  selectedStyle: string
  onStyleSelect: (styleId: string) => void
}

export function StyleSelector({
  styles,
  categories,
  selectedStyle,
  onStyleSelect
}: StyleSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredStyles = activeCategory === 'all'
    ? styles
    : styles.filter(s => s.category === activeCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">에셋 스타일</h3>
        <Badge variant="secondary">{styles.length}개 스타일</Badge>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {filteredStyles.map(style => (
          <Tooltip key={style.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStyleSelect(style.id)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200',
                  'hover:border-primary/50 hover:bg-accent/50',
                  selectedStyle === style.id
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-border bg-card'
                )}
              >
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                  selectedStyle === style.id
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                )}>
                  {iconMap[style.id] || <Box className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium truncate max-w-full">{style.nameKo}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-full">{style.name}</p>
                </div>
                {selectedStyle === style.id && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">{style.nameKo}</p>
              <p className="text-xs text-muted-foreground mt-1">{style.descriptionKo || style.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {style.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
