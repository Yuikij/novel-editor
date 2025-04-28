import { API_BASE_URL } from "../config/env"
import type { WorldElement } from '@/app/types'

export interface WorldBase {
  name: string
  description: string
  elements: WorldElement[]
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface World extends WorldBase {
  id: string
}

function mapFromBackend(world: any) {
  return world
}

function mapToBackend(world: any) {
  return world
}

// 获取世界观列表（分页）
export async function fetchWorldsPage(params: {
  page?: number
  pageSize?: number
  name?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.name ? { name: params.name } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/worlds/page?${search}`)
  if (!res.ok) throw new Error('世界观分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map(mapFromBackend),
    },
  }
}

// 获取单个世界观
export async function fetchWorld(id: string) {
  const res = await fetch(`${API_BASE_URL}/worlds/${id}`)
  if (!res.ok) throw new Error('世界观详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 新建世界观
export async function createWorld(world: Omit<World, 'id'>) {
  const res = await fetch(`${API_BASE_URL}/worlds/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(world)),
  })
  if (!res.ok) throw new Error('世界观创建失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 更新世界观
export async function updateWorld(id: string, world: World) {
  const res = await fetch(`${API_BASE_URL}/worlds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(world)),
  })
  if (!res.ok) throw new Error('世界观更新失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 删除世界观
export async function deleteWorld(id: string) {
  const res = await fetch(`${API_BASE_URL}/worlds/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('世界观删除失败')
  return true
} 