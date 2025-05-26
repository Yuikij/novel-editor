import { API_BASE_URL } from "../config/env"
import type { Template, TemplateListDTO } from "@/app/types"

// ============ 新的优化接口（推荐使用） ============

// 获取模板列表（分页，不包含content字段）- 推荐
export async function fetchTemplatesList(params: {
  page?: number
  size?: number
  name?: string
  tag?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.size ?? 10),
    ...(params.name ? { name: params.name } : {}),
    ...(params.tag ? { tag: params.tag } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/templates/list?${search}`)
  if (!res.ok) throw new Error('模板列表获取失败')
  const data = await res.json()
  return data
}

// 高级搜索模板列表（不包含content字段）- 推荐
export async function searchTemplatesList(params: {
  page?: number
  size?: number
  name?: string
  tags?: string
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.size ?? 10),
    ...(params.name ? { name: params.name } : {}),
    ...(params.tags ? { tags: params.tags } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/templates/search?${search}`)
  if (!res.ok) throw new Error('模板搜索失败')
  const data = await res.json()
  return data
}

// 根据标签获取模板列表（不包含content字段）- 推荐
export async function fetchTemplatesListByTag(tag: string) {
  const res = await fetch(`${API_BASE_URL}/templates/tag/${encodeURIComponent(tag)}/list`)
  if (!res.ok) throw new Error('根据标签获取模板列表失败')
  const data = await res.json()
  return data
}

// 获取模板详情（包含完整信息）- 推荐
export async function fetchTemplateDetail(id: string) {
  const res = await fetch(`${API_BASE_URL}/templates/${id}/detail`)
  if (!res.ok) throw new Error('模板详情获取失败')
  const data = await res.json()
  return data.data
}

// 创建模板并自动向量化
export async function createTemplateWithAutoIndex(template: {
  name: string
  tags: string
  content: string
}, autoIndex: boolean = false) {
  const res = await fetch(`${API_BASE_URL}/templates/with-auto-index?autoIndex=${autoIndex}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  })
  if (!res.ok) throw new Error('创建模板失败')
  const data = await res.json()
  return data.data
}

// 文件上传创建模板并自动向量化
export async function uploadTemplateWithAutoIndex(formData: FormData, autoIndex: boolean = false) {
  const res = await fetch(`${API_BASE_URL}/templates/upload?autoIndex=${autoIndex}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('上传模板失败')
  const data = await res.json()
  return data.data
}

// ============ 旧接口（已废弃，保留兼容性） ============

// 获取模板列表（分页）- 已废弃，建议使用 fetchTemplatesList
export async function fetchTemplatesPage(params: {
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
  const res = await fetch(`${API_BASE_URL}/templates/page?${search}`)
  if (!res.ok) throw new Error('模板分页获取失败')
  const data = await res.json()
  return data
}

// 高级搜索模板（使用请求体）- 已废弃，建议使用 searchTemplatesList
export async function searchTemplates(params: {
  page?: number
  size?: number
  id?: string
  name?: string
  tags?: string
  content?: string
  ids?: string[]
}) {
  const res = await fetch(`${API_BASE_URL}/templates/search-full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: params.page ?? 1,
      size: params.size ?? 10,
      ...(params.id ? { id: params.id } : {}),
      ...(params.name ? { name: params.name } : {}),
      ...(params.tags ? { tags: params.tags } : {}),
      ...(params.content ? { content: params.content } : {}),
      ...(params.ids ? { ids: params.ids } : {}),
    }),
  })
  if (!res.ok) throw new Error('模板搜索失败')
  const data = await res.json()
  return data
}

// 获取单个模板 - 已废弃，建议使用 fetchTemplateDetail
export async function fetchTemplate(id: string) {
  const res = await fetch(`${API_BASE_URL}/templates/${id}`)
  if (!res.ok) throw new Error('模板详情获取失败')
  const data = await res.json()
  return data.data
}

// 根据标签获取模板 - 已废弃，建议使用 fetchTemplatesListByTag
export async function fetchTemplatesByTag(tag: string) {
  const res = await fetch(`${API_BASE_URL}/templates/tag/${tag}`)
  if (!res.ok) throw new Error('根据标签获取模板失败')
  const data = await res.json()
  return data.data
}

// ============ 其他接口（保持不变） ============

// 新建模板
export async function createTemplate(template: Omit<Template, 'id'>) {
  const res = await fetch(`${API_BASE_URL}/templates/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  })
  if (!res.ok) throw new Error('模板创建失败')
  const data = await res.json()
  return data.data
}

// 通过文件上传创建模板
export async function createTemplateWithFile(formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/templates/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('模板文件上传创建失败')
  const data = await res.json()
  return data.data
}

// 批量创建模板
export async function batchCreateTemplates(templates: Omit<Template, 'id'>[]) {
  const res = await fetch(`${API_BASE_URL}/templates/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templates),
  })
  if (!res.ok) throw new Error('批量创建模板失败')
  const data = await res.json()
  return data.data
}

// 更新模板
export async function updateTemplate(id: string, template: Template) {
  const res = await fetch(`${API_BASE_URL}/templates/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...template, id }),
  })
  if (!res.ok) throw new Error('模板更新失败')
  return true
}

// 通过文件上传更新模板
export async function updateTemplateWithFile(formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/templates/upload`, {
    method: 'PUT',
    body: formData,
  })
  if (!res.ok) throw new Error('模板文件上传更新失败')
  return true
}

// 删除模板
export async function deleteTemplate(id: string) {
  const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
    method: 'DELETE' 
  })
  if (!res.ok) throw new Error('模板删除失败')
  return true
}

// 批量删除模板
export async function batchDeleteTemplates(params: {
  id?: string
  name?: string
  tags?: string
  content?: string
  ids?: string[]
}) {
  const res = await fetch(`${API_BASE_URL}/templates/batch`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('批量删除模板失败')
  return true
} 