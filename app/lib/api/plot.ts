import { API_BASE_URL } from "../config/env"

export interface Plot {
  id: string
  projectId?: string
  title: string
  type?: string
  description?: string
  plotOrder?: number
  createdAt?: string
  updatedAt?: string
  chapterId?: string
  characterIds?: string[]
}

function mapFromBackend(plot: any) {
  return plot
}

function mapToBackend(plot: any) {
  return plot
}

// 获取情节列表（分页）
export async function fetchPlotsPage(params: {
  page?: number
  pageSize?: number
  projectId?: string
  chapterId?: string
  type?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.projectId ? { projectId: params.projectId } : {}),
    ...(params.chapterId ? { chapterId: params.chapterId } : {}),
    ...(params.type ? { type: params.type } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/plots/page?${search}`)
  if (!res.ok) throw new Error('情节分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map(mapFromBackend),
    },
  }
}

// 获取单个情节
export async function fetchPlot(id: string) {
  const res = await fetch(`${API_BASE_URL}/plots/${id}`)
  if (!res.ok) throw new Error('情节详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 新建情节
export async function createPlot(plot: Plot) {
  const res = await fetch(`${API_BASE_URL}/plots/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(plot)),
  })
  if (!res.ok) throw new Error('情节创建失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 更新情节
export async function updatePlot(id: string, plot: Plot) {
  const res = await fetch(`${API_BASE_URL}/plots/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(plot)),
  })
  if (!res.ok) throw new Error('情节更新失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 删除情节
export async function deletePlot(id: string) {
  const res = await fetch(`${API_BASE_URL}/plots/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('情节删除失败')
  return true
}

// 批量删除情节
export async function batchDeletePlots(ids: string[]) {
  const res = await fetch(`${API_BASE_URL}/plots/batch`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids),
  })
  if (!res.ok) throw new Error('情节批量删除失败')
  return true
}

// 自动扩展情节到目标数量
export async function autoExpandPlots(chapterId: string, targetCount: number = 5) {
  const res = await fetch(`${API_BASE_URL}/plots/auto-expand/${chapterId}?targetCount=${targetCount}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('情节自动扩展失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
} 