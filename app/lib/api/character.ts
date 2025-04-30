import { API_BASE_URL } from "../config/env"

export interface Character {
  id: string
  projectId?: string
  name: string
  role?: string
  personality?: string[]
  background?: string
  goals?: string[]
  avatarUrl?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  age?: number
  gender?: string
  description?: string
}

function mapFromBackend(character: any) {
  return character
}

function mapToBackend(character: any) {
  return character
}

// 获取角色列表（分页）
export async function fetchCharactersPage(params: {
  page?: number
  pageSize?: number
  projectId?: string
  name?: string
  role?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.projectId ? { projectId: params.projectId } : {}),
    ...(params.name ? { name: params.name } : {}),
    ...(params.role ? { role: params.role } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/characters/page?${search}`)
  if (!res.ok) throw new Error('角色分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map(mapFromBackend),
    },
  }
}

// 获取单个角色
export async function fetchCharacter(id: string) {
  const res = await fetch(`${API_BASE_URL}/characters/${id}`)
  if (!res.ok) throw new Error('角色详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 新建角色
export async function createCharacter(character: Character) {
  const res = await fetch(`${API_BASE_URL}/characters/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(character)),
  })
  if (!res.ok) throw new Error('角色创建失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 更新角色
export async function updateCharacter(id: string, character: Character) {
  const res = await fetch(`${API_BASE_URL}/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(character)),
  })
  if (!res.ok) throw new Error('角色更新失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 删除角色
export async function deleteCharacter(id: string) {
  const res = await fetch(`${API_BASE_URL}/characters/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('角色删除失败')
  return true
}

// 获取项目下所有角色
export async function fetchCharactersByProject(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/characters/project/${projectId}`)
  if (!res.ok) throw new Error('获取项目角色失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
} 