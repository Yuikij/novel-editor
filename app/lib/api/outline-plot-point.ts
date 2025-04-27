import { API_BASE_URL } from "../config/env"

export interface OutlinePlotPoint {
  id: string
  projectId?: string
  title: string
  type?: string
  order?: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

function mapFromBackend(point: any) {
  return point
}

function mapToBackend(point: any) {
  return point
}

// 获取大纲情节点列表（分页）
export async function fetchOutlinePlotPointsPage(params: {
  page?: number
  pageSize?: number
  projectId?: string
  type?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.projectId ? { projectId: params.projectId } : {}),
    ...(params.type ? { type: params.type } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/outline-plot-points/page?${search}`)
  if (!res.ok) throw new Error('大纲情节点分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map(mapFromBackend),
    },
  }
}

// 获取单个大纲情节点
export async function fetchOutlinePlotPoint(id: string) {
  const res = await fetch(`${API_BASE_URL}/outline-plot-points/${id}`)
  if (!res.ok) throw new Error('大纲情节点详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 新建大纲情节点
export async function createOutlinePlotPoint(point: OutlinePlotPoint) {
  const res = await fetch(`${API_BASE_URL}/outline-plot-points/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(point)),
  })
  if (!res.ok) throw new Error('大纲情节点创建失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 更新大纲情节点
export async function updateOutlinePlotPoint(id: string, point: OutlinePlotPoint) {
  const res = await fetch(`${API_BASE_URL}/outline-plot-points/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(point)),
  })
  if (!res.ok) throw new Error('大纲情节点更新失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 删除大纲情节点
export async function deleteOutlinePlotPoint(id: string) {
  const res = await fetch(`${API_BASE_URL}/outline-plot-points/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('大纲情节点删除失败')
  return true
} 