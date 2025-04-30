// Novel Project Types
export interface NovelProject {
  id: string
  title: string
  genre: string
  style?: string
  type?: string
  createdAt: string
  updatedAt: string
  coverGradient: string[]
  metadata: NovelMetadata
  worldId?: string
}

export interface NovelMetadata {
  synopsis?: string
  tags?: string[]
  targetAudience?: string
  wordCountGoal?: number
  status: 'draft' | 'in-progress' | 'completed' | 'published'
  highlights?: string[]
  writingRequirements?: string[]
}
 
// Character Types
export interface Character {
  id: string
  name: string
  role: string
  personality: string[]
  background: string
  goals: string[]
  imageUrl?: string
  relationships: CharacterRelationship[]
  notes?: string
  age?: number
  gender?: string
  description?: string
}

export interface CharacterRelationship {
  id: string| null
  projectId: string
  sourceCharacterId: string| null
  targetCharacterId: string
  characterId: string | null
  type: string | null
  relationshipType: string | null
  description: string
  createdAt?: string
  updatedAt?: string
}

// World Building Types
export interface WorldBuilding {
  id: string| null
  name: string
  description: string
  elements: WorldElement[]
  notes?: string
}

export interface WorldElement {
  id: string
  type: string
  name: string
  description: string
  details?: string
}

// Chapter Types
export type ChapterStatus = 'draft' | 'in-progress' | 'completed' | 'edited'
export interface Chapter {
  id: string
  title: string
  content: string
  summary?: string
  sortOrder: number
  status: ChapterStatus
  createdAt: string
  updatedAt: string
  wordCount: number
  targetWordCount?: number
  notes?: string
  type?: string
}

// Plot and Outline Types
export interface PlotStructure {
  id: string
  title: string
  type: 'three-act' | 'hero-journey' | 'save-the-cat' | 'custom'
  elements: PlotElement[]
}

export interface PlotElement {
  id: string
  title: string
  description: string
  position: number
  chapterId?: string
  status: 'planned' | 'drafted' | 'completed'
  characterIds?: string[]
  type?: string
}

// Analysis Types
export interface NovelAnalysis {
  id: string
  type: 'pace' | 'emotion' | 'character-arc' | 'theme' | 'style'
  chapterId?: string
  fullText?: boolean
  results: AnalysisResult[]
  createdAt: string
}

export interface AnalysisResult {
  id: string
  title: string
  description: string
  suggestions: string[]
  score?: number
} 