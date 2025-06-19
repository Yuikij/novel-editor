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
  templateId?: string
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

// Entry Types
export interface Entry {
  id: string
  name: string
  tags: string
  description: string
}

// Template Types
export interface Template {
  id: string
  name: string
  tags: string
  content: string
  // 向量化相关字段
  vectorStatus?: VectorStatus
  vectorProgress?: number
  vectorStartTime?: string
  vectorEndTime?: string
  vectorErrorMessage?: string
  canChat?: boolean
}

// Template List DTO - 用于列表查询，不包含content字段以提升性能
export interface TemplateListDTO {
  id: string
  name: string
  tags: string
  // 向量化相关字段
  vectorStatus?: VectorStatus
  vectorProgress?: number
  vectorStartTime?: string
  vectorEndTime?: string
  vectorErrorMessage?: string
  canChat?: boolean
}

// 向量化状态枚举
export type VectorStatus = 'NOT_INDEXED' | 'INDEXING' | 'INDEXED' | 'FAILED'

// 模板向量化进度DTO
export interface TemplateVectorProgressDTO {
  templateId: string
  templateName: string
  vectorStatus: VectorStatus
  vectorProgress: number
  vectorStartTime?: string
  vectorEndTime?: string
  vectorErrorMessage?: string
  canChat: boolean
}

// 模板对话请求
export interface TemplateChatRequest {
  templateId: string
  message: string
  conversationId?: string
  maxResults?: number
  similarityThreshold?: number
}

// 模板对话响应
export interface TemplateChatResponse {
  content: string
  conversationId?: string
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
  templateId?: string
}

// Chapter List DTO - 用于列表查询，不包含content和historyContent字段以提升性能
export interface ChapterListDTO {
  id: string
  projectId?: string
  templateId?: string
  title: string
  sortOrder: number
  status: ChapterStatus
  summary?: string
  notes?: string
  wordCountGoal?: number
  wordCount: number
  type?: string
  createdAt: string
  updatedAt: string
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
  sortOrder: number
  chapterId?: string
  status: string
  characterIds?: string[]
  itemIds?: string[]
  type?: string
  templateId?: string
  completionPercentage?: number
  wordCountGoal?: number
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