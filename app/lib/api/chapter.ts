import { API_BASE_URL } from "../config/env"
import type { ChapterStatus } from '@/app/types'

export interface Chapter {
  id: string
  projectId?: string
  title: string
  sortOrder: number
  status: ChapterStatus
  summary?: string
  notes?: string
  wordCountGoal?: number
  wordCount?: number
  templateId?: string
  createdAt?: string
  updatedAt?: string
  content?: string // 前端本地用，后端无
}

// 字段映射：前端 targetWordCount <-> 后端 wordCountGoal
function mapToBackend(chapter: any) {
  const { targetWordCount, order, ...rest } = chapter
  return {
    ...rest,
    sortOrder: chapter.sortOrder,
    wordCountGoal: targetWordCount,
  }
}

function mapFromBackend(chapter: any) {
  return {
    ...chapter,
    order: chapter.sortOrder,
    status: (chapter.status === 'draft' || chapter.status === 'in-progress' || chapter.status === 'completed' || chapter.status === 'edited') ? chapter.status : 'draft',
    targetWordCount: chapter.wordCountGoal,
  } as Chapter
}

// 获取章节列表（分页）
export async function fetchChaptersPage(params: {
  page?: number
  pageSize?: number
  projectId?: string
  title?: string
  status?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.projectId ? { projectId: params.projectId } : {}),
    ...(params.title ? { title: params.title } : {}),
    ...(params.status ? { status: params.status } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/chapters/page?${search}`)
  if (!res.ok) throw new Error('章节分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map(mapFromBackend),
    },
  }
}

// 获取单个章节
export async function fetchChapter(id: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}`)
  if (!res.ok) throw new Error('章节详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 新建章节
export async function createChapter(chapter: Omit<Chapter, 'id'>) {
  const res = await fetch(`${API_BASE_URL}/chapters/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(chapter)),
  })
  if (!res.ok) throw new Error('章节创建失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 更新章节
export async function updateChapter(id: string, chapter: Chapter) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(chapter)),
  })
  if (!res.ok) throw new Error('章节更新失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 删除章节
export async function deleteChapter(id: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('章节删除失败')
  return true
}

// 批量删除章节
export async function batchDeleteChapters(ids: string[]) {
  const res = await fetch(`${API_BASE_URL}/chapters/batch`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids),
  })
  if (!res.ok) throw new Error('章节批量删除失败')
  return true
}

// 自动扩展章节到目标数量
export async function autoExpandChapters(projectId: string, targetCount: number = 12) {
  const res = await fetch(`${API_BASE_URL}/chapters/auto-expand/${projectId}?targetCount=${targetCount}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('章节自动扩展失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
}

// 获取项目下所有章节
export async function fetchChaptersByProject(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/project/${projectId}`)
  if (!res.ok) throw new Error('获取项目章节失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
} 