import { API_BASE_URL } from "../config/env"
import type { Entry } from "@/app/types"

// 获取条目列表（分页）
export async function fetchEntriesPage(params: {
  page?: number
  pageSize?: number
  name?: string
  tag?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 10),
    ...(params.name ? { name: params.name } : {}),
    ...(params.tag ? { tag: params.tag } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/items/page?${search}`)
  if (!res.ok) throw new Error('条目分页获取失败')
  const data = await res.json()
  return data
}

// 高级搜索条目（使用请求体）
export async function searchEntries(params: {
  page?: number
  size?: number
  id?: string
  name?: string
  tags?: string
  description?: string
  ids?: string[]
}) {
  const res = await fetch(`${API_BASE_URL}/items/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: params.page ?? 1,
      size: params.size ?? 10,
      ...(params.id ? { id: params.id } : {}),
      ...(params.name ? { name: params.name } : {}),
      ...(params.tags ? { tags: params.tags } : {}),
      ...(params.description ? { description: params.description } : {}),
      ...(params.ids ? { ids: params.ids } : {}),
    }),
  })
  if (!res.ok) throw new Error('条目搜索失败')
  const data = await res.json()
  return data
}

// 获取单个条目
export async function fetchEntry(id: string) {
  const res = await fetch(`${API_BASE_URL}/items/${id}`)
  if (!res.ok) throw new Error('条目详情获取失败')
  const data = await res.json()
  return data.data
}

// 根据标签获取条目
export async function fetchEntriesByTag(tag: string) {
  const res = await fetch(`${API_BASE_URL}/items/tag/${tag}`)
  if (!res.ok) throw new Error('根据标签获取条目失败')
  const data = await res.json()
  return data.data
}

// 新建条目
export async function createEntry(entry: Omit<Entry, 'id'>) {
  const res = await fetch(`${API_BASE_URL}/items/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
  if (!res.ok) throw new Error('条目创建失败')
  const data = await res.json()
  return data.data
}

// 批量创建条目
export async function batchCreateEntries(entries: Omit<Entry, 'id'>[]) {
  const res = await fetch(`${API_BASE_URL}/items/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entries),
  })
  if (!res.ok) throw new Error('批量创建条目失败')
  const data = await res.json()
  return data.data
}

// 更新条目
export async function updateEntry(id: string, entry: Entry) {
  const res = await fetch(`${API_BASE_URL}/items/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...entry, id }),
  })
  if (!res.ok) throw new Error('条目更新失败')
  return true
}

// 删除条目
export async function deleteEntry(id: string) {
  const res = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'DELETE' 
  })
  if (!res.ok) throw new Error('条目删除失败')
  return true
}

// 批量删除条目
export async function batchDeleteEntries(params: {
  id?: string
  name?: string
  tags?: string
  description?: string
  ids?: string[]
}) {
  const res = await fetch(`${API_BASE_URL}/items/batch`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('批量删除条目失败')
  return true
} 