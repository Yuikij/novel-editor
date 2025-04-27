import { API_BASE_URL } from "../config/env"

export interface Chapter {
  id: string
  projectId?: string
  title: string
  order: number
  status: string
  summary: string
  notes?: string
  wordCountGoal?: number
  wordCount?: number
  createdAt?: string
  updatedAt?: string
  content?: string // 前端本地用，后端无
}

// 字段映射：前端 targetWordCount <-> 后端 wordCountGoal
function mapToBackend(chapter: any) {
  const { targetWordCount, ...rest } = chapter
  return {
    ...rest,
    wordCountGoal: targetWordCount,
  }
}

function mapFromBackend(chapter: any) {
  return {
    ...chapter,
    targetWordCount: chapter.wordCountGoal,
  }
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
export async function createChapter(chapter: Chapter) {
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

// 获取项目下所有章节
export async function fetchChaptersByProject(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/project/${projectId}`)
  if (!res.ok) throw new Error('获取项目章节失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
} 