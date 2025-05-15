import { API_BASE_URL } from "../config/env"

export interface Project {
  id: string
  title: string
  genre: string
  style?: string
  type?: string // 结构类型
  synopsis?: string
  tags?: string[]
  targetAudience?: string
  wordCountGoal?: number
  highlights?: string[]
  writingRequirements?: string[]
  status?: string
  worldId?: string
  createdAt?: string
  updatedAt?: string
  draft?: Record<string, any>
}

// 获取项目列表（分页）
export async function fetchProjectsPage(params: {
  page?: number
  pageSize?: number
  title?: string
  genre?: string
  status?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.title ? { title: params.title } : {}),
    ...(params.genre ? { genre: params.genre } : {}),
    ...(params.status ? { status: params.status } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/projects/page?${search}`)
  if (!res.ok) throw new Error('项目分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records,
    },
  }
}

// 获取单个项目
export async function fetchProject(id: string) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`)
  if (!res.ok) throw new Error('项目详情获取失败')
  const data = await res.json()
  return data.data as Project
}

// 新建项目
export async function createProject(project: Project) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
  if (!res.ok) throw new Error('项目创建失败')
  const data = await res.json()
  return data.data as Project
}

// 更新项目
export async function updateProject(id: string, project: Project) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
  if (!res.ok) throw new Error('项目更新失败')
  const data = await res.json()
  return data.data as Project
}

// 删除项目
export async function deleteProject(id: string) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('项目删除失败')
  return true
}

// 获取项目草稿
export async function fetchProjectDraft(id: string) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}/draft`)
  if (!res.ok) throw new Error('获取项目草稿失败')
  const data = await res.json()
  return data.data as Record<string, any>
}

// 保存项目草稿
export async function saveProjectDraft(id: string, draft: Record<string, any>) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
  if (!res.ok) throw new Error('保存项目草稿失败')
  const data = await res.json()
  return data.data as Project
}

// 获取项目地图
export async function fetchProjectMap(id: string) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}/map`)
  if (!res.ok) throw new Error('获取项目地图失败')
  const data = await res.json()
  return data.data as Record<string, any>
}

// 保存项目地图
export async function saveProjectMap(id: string, map: Record<string, any>) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}/map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(map),
  })
  if (!res.ok) throw new Error('保存项目地图失败')
  const data = await res.json()
  return data.data as Project
} 