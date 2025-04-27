import { API_BASE_URL } from "../config/env"

export interface CharacterRelationship {
  id: string
  projectId?: string
  sourceCharacterId: string
  targetCharacterId: string
  relationshipType?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

function mapFromBackend(rel: any) {
  return rel
}

function mapToBackend(rel: any) {
  return rel
}

// 获取角色关系列表（分页）
export async function fetchCharacterRelationshipsPage(params: {
  page?: number
  pageSize?: number
  projectId?: string
  characterId?: string
  relationshipType?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
    ...(params.projectId ? { projectId: params.projectId } : {}),
    ...(params.characterId ? { characterId: params.characterId } : {}),
    ...(params.relationshipType ? { relationshipType: params.relationshipType } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/character-relationships/page?${search}`)
  if (!res.ok) throw new Error('角色关系分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map(mapFromBackend),
    },
  }
}

// 获取单个角色关系
export async function fetchCharacterRelationship(id: string) {
  const res = await fetch(`${API_BASE_URL}/character-relationships/${id}`)
  if (!res.ok) throw new Error('角色关系详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 新建角色关系
export async function createCharacterRelationship(rel: CharacterRelationship) {
  const res = await fetch(`${API_BASE_URL}/character-relationships/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(rel)),
  })
  if (!res.ok) throw new Error('角色关系创建失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 更新角色关系
export async function updateCharacterRelationship(id: string, rel: CharacterRelationship) {
  const res = await fetch(`${API_BASE_URL}/character-relationships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToBackend(rel)),
  })
  if (!res.ok) throw new Error('角色关系更新失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 删除角色关系
export async function deleteCharacterRelationship(id: string) {
  const res = await fetch(`${API_BASE_URL}/character-relationships/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('角色关系删除失败')
  return true
} 