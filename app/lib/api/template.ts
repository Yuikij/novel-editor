import { API_BASE_URL } from "../config/env"
import type { Template } from "@/app/types"

// 获取模板列表（分页）
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

// 高级搜索模板（使用请求体）
export async function searchTemplates(params: {
  page?: number
  size?: number
  id?: string
  name?: string
  tags?: string
  content?: string
  ids?: string[]
}) {
  const res = await fetch(`${API_BASE_URL}/templates/search`, {
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

// 获取单个模板
export async function fetchTemplate(id: string) {
  const res = await fetch(`${API_BASE_URL}/templates/${id}`)
  if (!res.ok) throw new Error('模板详情获取失败')
  const data = await res.json()
  return data.data
}

// 根据标签获取模板
export async function fetchTemplatesByTag(tag: string) {
  const res = await fetch(`${API_BASE_URL}/templates/tag/${tag}`)
  if (!res.ok) throw new Error('根据标签获取模板失败')
  const data = await res.json()
  return data.data
}

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