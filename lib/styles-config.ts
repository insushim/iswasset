import { StyleConfig, AssetStyleId } from '@/types'

export interface StyleCategoryConfig {
  id: string
  name: string
  nameKo: string
  icon: string
  styles: AssetStyleId[]
}

export const STYLE_CONFIGS: Record<AssetStyleId, StyleConfig> = {
  icon: {
    id: 'icon',
    name: 'Game Icon',
    nameKo: '게임 아이콘',
    description: 'App icons, skill icons, inventory icons',
    descriptionKo: '앱 아이콘, 스킬 아이콘, 인벤토리 아이콘',
    category: 'ui',
    icon: '🎯',
    color: '#8B5CF6',
    promptPrefix: 'game icon design, centered composition, clean edges, vibrant colors, professional game art, icon style,',
    examples: ['health potion', 'fire spell', 'gold coin', 'magic sword'],
    tags: ['icon', 'skill', 'ability', 'inventory']
  },
  character: {
    id: 'character',
    name: 'Character',
    nameKo: '캐릭터',
    description: 'Player characters, NPCs, heroes, villains',
    descriptionKo: '플레이어 캐릭터, NPC, 영웅, 악당',
    category: '2d',
    icon: '🧙',
    color: '#3B82F6',
    promptPrefix: 'game character design, full body, dynamic pose, detailed art, game ready,',
    examples: ['warrior knight', 'fire mage', 'elf archer', 'dark assassin'],
    tags: ['hero', 'npc', 'player', 'avatar']
  },
  item: {
    id: 'item',
    name: 'Item',
    nameKo: '아이템',
    description: 'Consumables, collectibles, treasures',
    descriptionKo: '소모품, 수집품, 보물',
    category: '2d',
    icon: '💎',
    color: '#06B6D4',
    promptPrefix: 'game item design, detailed rendering, fantasy style, collectible item,',
    examples: ['healing potion', 'magic scroll', 'ancient key', 'enchanted gem'],
    tags: ['consumable', 'collectible', 'treasure', 'loot']
  },
  weapon: {
    id: 'weapon',
    name: 'Weapon',
    nameKo: '무기',
    description: 'Swords, guns, bows, magic weapons',
    descriptionKo: '검, 총, 활, 마법 무기',
    category: '2d',
    icon: '⚔️',
    color: '#EF4444',
    promptPrefix: 'game weapon design, detailed weapon art, fantasy weapon, epic quality,',
    examples: ['legendary sword', 'frost bow', 'thunder staff', 'dark dagger'],
    tags: ['melee', 'ranged', 'magic', 'legendary']
  },
  armor: {
    id: 'armor',
    name: 'Armor',
    nameKo: '방어구',
    description: 'Helmets, shields, chest plates, accessories',
    descriptionKo: '투구, 방패, 흉갑, 악세서리',
    category: '2d',
    icon: '🛡️',
    color: '#F59E0B',
    promptPrefix: 'game armor design, detailed armor art, fantasy equipment, protective gear,',
    examples: ['dragon helmet', 'royal shield', 'mithril armor', 'magic ring'],
    tags: ['helmet', 'shield', 'chest', 'accessory']
  },
  environment: {
    id: 'environment',
    name: 'Environment',
    nameKo: '환경/배경',
    description: 'Landscapes, dungeons, cities, backgrounds',
    descriptionKo: '풍경, 던전, 도시, 배경',
    category: '2d',
    icon: '🏰',
    color: '#10B981',
    promptPrefix: 'game environment art, detailed background, atmospheric lighting, game scenery,',
    examples: ['dark dungeon', 'magical forest', 'floating castle', 'volcanic wasteland'],
    tags: ['landscape', 'dungeon', 'city', 'nature']
  },
  ui_element: {
    id: 'ui_element',
    name: 'UI Element',
    nameKo: 'UI 요소',
    description: 'Buttons, frames, panels, HUD elements',
    descriptionKo: '버튼, 프레임, 패널, HUD 요소',
    category: 'ui',
    icon: '🖼️',
    color: '#EC4899',
    promptPrefix: 'game UI design, clean interface element, stylized UI, game menu asset,',
    examples: ['play button', 'health bar', 'inventory frame', 'dialog box'],
    tags: ['button', 'frame', 'panel', 'hud']
  },
  tile: {
    id: 'tile',
    name: 'Tile / Tileset',
    nameKo: '타일 / 타일셋',
    description: 'Floor tiles, wall tiles, seamless patterns',
    descriptionKo: '바닥 타일, 벽 타일, 이음새 없는 패턴',
    category: '2d',
    icon: '🧱',
    color: '#F97316',
    promptPrefix: 'game tileset design, seamless tile pattern, top-down view, tileable texture,',
    examples: ['grass tile', 'stone floor', 'water surface', 'lava ground'],
    tags: ['floor', 'wall', 'seamless', 'pattern']
  },
  pixel_art: {
    id: 'pixel_art',
    name: 'Pixel Art',
    nameKo: '픽셀 아트',
    description: '8-bit, 16-bit, retro game style',
    descriptionKo: '8비트, 16비트, 레트로 게임 스타일',
    category: '2d',
    icon: '👾',
    color: '#8B5CF6',
    promptPrefix: 'pixel art style, retro game graphics, 16-bit, clean pixels, no anti-aliasing,',
    examples: ['pixel hero', 'pixel monster', 'pixel sword', 'pixel treasure'],
    tags: ['retro', '8bit', '16bit', 'sprite']
  },
  vfx: {
    id: 'vfx',
    name: 'VFX / Effects',
    nameKo: 'VFX / 이펙트',
    description: 'Explosions, magic effects, particles',
    descriptionKo: '폭발, 마법 효과, 파티클',
    category: 'effects',
    icon: '✨',
    color: '#F59E0B',
    promptPrefix: 'game vfx design, particle effect, magical glow, dynamic effect,',
    examples: ['fire explosion', 'healing aura', 'lightning strike', 'smoke cloud'],
    tags: ['particle', 'explosion', 'magic', 'glow']
  },
  creature: {
    id: 'creature',
    name: 'Creature / Monster',
    nameKo: '크리처 / 몬스터',
    description: 'Monsters, beasts, bosses, enemies',
    descriptionKo: '몬스터, 야수, 보스, 적',
    category: '2d',
    icon: '🐉',
    color: '#EF4444',
    promptPrefix: 'game creature design, monster art, fantasy beast, detailed creature,',
    examples: ['fire dragon', 'undead skeleton', 'forest troll', 'shadow demon'],
    tags: ['monster', 'boss', 'enemy', 'beast']
  },
  vehicle: {
    id: 'vehicle',
    name: 'Vehicle',
    nameKo: '탈것',
    description: 'Cars, ships, spaceships, mounts',
    descriptionKo: '자동차, 배, 우주선, 탈것',
    category: '2d',
    icon: '🚀',
    color: '#3B82F6',
    promptPrefix: 'game vehicle design, detailed transport, fantasy vehicle,',
    examples: ['dragon mount', 'pirate ship', 'sci-fi fighter', 'magic carpet'],
    tags: ['mount', 'ship', 'aircraft', 'transport']
  },
  building: {
    id: 'building',
    name: 'Building',
    nameKo: '건물',
    description: 'Houses, castles, shops, structures',
    descriptionKo: '집, 성, 상점, 구조물',
    category: '2d',
    icon: '🏛️',
    color: '#10B981',
    promptPrefix: 'game building design, architectural art, fantasy structure, detailed building,',
    examples: ['medieval castle', 'magic tower', 'blacksmith shop', 'tavern inn'],
    tags: ['castle', 'house', 'shop', 'tower']
  },
  prop: {
    id: 'prop',
    name: 'Prop',
    nameKo: '소품',
    description: 'Furniture, decorations, objects',
    descriptionKo: '가구, 장식, 오브젝트',
    category: '2d',
    icon: '🪑',
    color: '#F97316',
    promptPrefix: 'game prop design, detailed object art, fantasy furniture, decorative item,',
    examples: ['treasure chest', 'ancient bookshelf', 'magic mirror', 'stone statue'],
    tags: ['furniture', 'decoration', 'object', 'interactive']
  },
  portrait: {
    id: 'portrait',
    name: 'Portrait',
    nameKo: '초상화',
    description: 'Character portraits, avatars, profile images',
    descriptionKo: '캐릭터 초상화, 아바타, 프로필 이미지',
    category: '2d',
    icon: '🖼️',
    color: '#EC4899',
    promptPrefix: 'game character portrait, detailed face, expressive portrait, high quality,',
    examples: ['knight portrait', 'witch avatar', 'king portrait', 'villain face'],
    tags: ['avatar', 'face', 'profile', 'headshot']
  },
  logo: {
    id: 'logo',
    name: 'Logo / Title',
    nameKo: '로고 / 타이틀',
    description: 'Game logos, title screens, branding',
    descriptionKo: '게임 로고, 타이틀 화면, 브랜딩',
    category: 'ui',
    icon: '🎮',
    color: '#8B5CF6',
    promptPrefix: 'game logo design, epic title art, stylized typography, professional branding,',
    examples: ['fantasy logo', 'sci-fi title', 'adventure emblem', 'RPG badge'],
    tags: ['logo', 'title', 'emblem', 'brand']
  },
  texture: {
    id: 'texture',
    name: 'Texture',
    nameKo: '텍스처',
    description: 'PBR textures, materials, surfaces',
    descriptionKo: 'PBR 텍스처, 재질, 표면',
    category: '3d',
    icon: '🎨',
    color: '#06B6D4',
    promptPrefix: 'seamless texture, tileable pattern, PBR material, detailed surface,',
    examples: ['stone wall', 'metal plate', 'wood grain', 'fabric cloth'],
    tags: ['pbr', 'material', 'surface', 'seamless']
  },
  spritesheet: {
    id: 'spritesheet',
    name: 'Spritesheet',
    nameKo: '스프라이트시트',
    description: 'Animation frames, character sheets',
    descriptionKo: '애니메이션 프레임, 캐릭터 시트',
    category: '2d',
    icon: '🎬',
    color: '#F59E0B',
    promptPrefix: 'game sprite design, animation frame, character pose, game ready sprite,',
    examples: ['walk cycle', 'attack animation', 'idle pose', 'death sequence'],
    tags: ['animation', 'frame', 'sprite', 'sheet']
  }
}

export const STYLE_CATEGORIES: StyleCategoryConfig[] = [
  {
    id: '2d',
    name: '2D Art',
    nameKo: '2D 아트',
    icon: '🎨',
    styles: ['character', 'item', 'weapon', 'armor', 'environment', 'tile', 'pixel_art', 'creature', 'vehicle', 'building', 'prop', 'portrait', 'spritesheet']
  },
  {
    id: 'ui',
    name: 'UI/UX',
    nameKo: 'UI/UX',
    icon: '🖼️',
    styles: ['icon', 'ui_element', 'logo']
  },
  {
    id: '3d',
    name: '3D / Texture',
    nameKo: '3D / 텍스처',
    icon: '🧊',
    styles: ['texture']
  },
  {
    id: 'effects',
    name: 'Effects',
    nameKo: '이펙트',
    icon: '✨',
    styles: ['vfx']
  }
]

export function getStyleConfig(styleId: AssetStyleId): StyleConfig {
  return STYLE_CONFIGS[styleId]
}

export function getAllStyles(): AssetStyleId[] {
  return Object.keys(STYLE_CONFIGS) as AssetStyleId[]
}

export function getStylesByCategory(category: string): AssetStyleId[] {
  const cat = STYLE_CATEGORIES.find(c => c.id === category)
  return cat ? cat.styles : []
}
