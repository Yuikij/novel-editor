import { API_BASE_URL } from "../config/env"
import type { ChapterStatus, ChapterListDTO } from '@/app/types'

export interface Chapter {
  id: string
  projectId?: string
  title: string
  sortOrder: number
  status: ChapterStatus
  summary?: string
  notes?: string
  wordCountGoal?: number
  wordCount?: number
  templateId?: string
  createdAt?: string
  updatedAt?: string
  content?: string // 前端本地用，后端无
}

// 字段映射：前端 targetWordCount <-> 后端 wordCountGoal
function mapToBackend(chapter: any) {
  const { targetWordCount, order, historyContent, ...rest } = chapter
  return {
    ...rest,
    sortOrder: chapter.sortOrder,
    wordCountGoal: targetWordCount,
  }
}

function mapFromBackend(chapter: any) {
  const { wordCountGoal, ...rest } = chapter
  return {
    ...rest,
    targetWordCount: wordCountGoal,
  }
}

// ============ 新的优化接口（推荐使用） ============

// 获取章节列表（不包含content和historyContent字段）- 推荐
export async function fetchChaptersList(params?: {
  projectId?: string
  title?: string
  status?: string
}) {
  const search = new URLSearchParams({
    ...(params?.projectId ? { projectId: params.projectId } : {}),
    ...(params?.title ? { title: params.title } : {}),
    ...(params?.status ? { status: params.status } : {}),
  })
  const res = await fetch(`${API_BASE_URL}/chapters/list?${search}`)
  if (!res.ok) throw new Error('章节列表获取失败')
  const data = await res.json()
  return data.data.map((chapter: any) => ({
    ...chapter,
    targetWordCount: chapter.wordCountGoal,
  }))
}

// 根据项目ID获取章节列表（不包含content和historyContent字段）- 推荐
export async function fetchChaptersListByProject(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/project/${projectId}/list`)
  if (!res.ok) throw new Error('获取项目章节列表失败')
  const data = await res.json()
  return data.data.map((chapter: any) => ({
    ...chapter,
    targetWordCount: chapter.wordCountGoal,
  }))
}

// 分页查询章节列表（不包含content和historyContent字段）- 推荐
export async function fetchChaptersListPage(params: {
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
  const res = await fetch(`${API_BASE_URL}/chapters/list/page?${search}`)
  if (!res.ok) throw new Error('章节列表分页获取失败')
  const data = await res.json()
  return {
    ...data,
    data: {
      ...data.data,
      records: data.data.records.map((chapter: any) => ({
        ...chapter,
        targetWordCount: chapter.wordCountGoal,
      })),
    },
  }
}

// 获取章节详情（包含完整信息）- 新增
export async function fetchChapterDetail(id: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}/detail`)
  if (!res.ok) throw new Error('章节详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// ============ 旧接口（已废弃，保留兼容性） ============

// 获取章节列表（分页）- 已废弃，建议使用 fetchChaptersListPage
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

// 获取单个章节 - 已废弃，建议使用 fetchChapterDetail
export async function fetchChapter(id: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}`)
  if (!res.ok) throw new Error('章节详情获取失败')
  const data = await res.json()
  return mapFromBackend(data.data)
}

// 获取项目下所有章节 - 已废弃，建议使用 fetchChaptersListByProject
export async function fetchChaptersByProject(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/project/${projectId}`)
  if (!res.ok) throw new Error('获取项目章节失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
}

// ============ 其他接口（保持不变） ============

// 新建章节
export async function createChapter(chapter: Omit<Chapter, 'id'>) {
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
  const backendData = mapToBackend(chapter)
  console.log('[DEBUG API] updateChapter 原始数据:', {
    id: chapter.id,
    title: chapter.title,
    contentLength: chapter.content?.length || 0,
    wordCount: chapter.wordCount
  })
  console.log('[DEBUG API] updateChapter 映射后数据:', {
    id: backendData.id,
    title: backendData.title,
    contentLength: backendData.content?.length || 0,
    wordCount: backendData.wordCount,
    hasContent: 'content' in backendData
  })
  
  const res = await fetch(`${API_BASE_URL}/chapters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendData),
  })
  
  console.log('[DEBUG API] updateChapter 响应状态:', res.status)
  
  if (!res.ok) throw new Error('章节更新失败')
  const data = await res.json()
  
  console.log('[DEBUG API] updateChapter 响应数据:', {
    code: data.code,
    message: data.message,
    dataContentLength: data.data?.content?.length || 0
  })
  
  return mapFromBackend(data.data)
}

// 删除章节
export async function deleteChapter(id: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}`, {
    method: 'DELETE' })
  if (!res.ok) throw new Error('章节删除失败')
  return true
}

// 批量删除章节
export async function batchDeleteChapters(ids: string[]) {
  const res = await fetch(`${API_BASE_URL}/chapters/batch`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids),
  })
  if (!res.ok) throw new Error('章节批量删除失败')
  return true
}

// 自动扩展章节到目标数量
export async function autoExpandChapters(projectId: string, targetCount: number = 12) {
  const res = await fetch(`${API_BASE_URL}/chapters/auto-expand/${projectId}?targetCount=${targetCount}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('章节自动扩展失败')
  const data = await res.json()
  return data.data.map(mapFromBackend)
}

// 获取章节历史记录
export async function fetchChapterHistory(chapterId: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}/history`)
  if (!res.ok) {
    if (res.status === 404) {
      return [] // 没有历史记录时返回空数组
    }
    throw new Error('获取章节历史记录失败')
  }
  const data = await res.json()
  
  console.log('[DEBUG HISTORY] 原始历史数据:', data)
  
  // 确保返回的数据是数组格式
  if (data.code === 200 || data.code === 1) {
    const historyData = data.data
    console.log('[DEBUG HISTORY] 历史数据类型:', typeof historyData, historyData)
    
    if (Array.isArray(historyData)) {
      return historyData
    } else if (historyData && typeof historyData === 'object') {
      // 如果data是对象，可能包含历史记录数组
      if (Array.isArray(historyData.records)) {
        return historyData.records
      } else if (Array.isArray(historyData.history)) {
        return historyData.history
      } else {
        // 处理 { "timestamp": "content" } 格式的数据
        const historyArray = Object.entries(historyData).map(([timestamp, content]) => ({
          timestamp,
          content,
          createdAt: new Date(parseInt(timestamp)).toISOString(),
          wordCount: typeof content === 'string' ? content.length : 0
        }))
        
        // 按时间戳排序，最新的在前
        historyArray.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
        
        console.log('[DEBUG HISTORY] 转换后的历史数组:', historyArray)
        return historyArray
      }
    }
  }
  
  return [] // 默认返回空数组
}

// 根据时间戳获取特定版本的章节内容
export async function fetchChapterHistoryVersion(chapterId: string, timestamp: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}/history/${timestamp}`)
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('历史版本不存在')
    }
    throw new Error('获取历史版本内容失败')
  }
  const data = await res.json()
  
  // 返回内容数据
  if (data.code === 200 || data.code === 1) {
    return data.data || ""
  }
  
  throw new Error(data.message || '获取历史版本内容失败')
}

// 从历史版本恢复章节内容
export async function restoreChapterFromHistory(chapterId: string, timestamp: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}/history/${timestamp}/restore`, {
    method: 'POST',
  })
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('历史版本不存在')
    }
    throw new Error('恢复历史版本失败')
  }
  const data = await res.json()
  
  // 返回恢复后的章节数据
  if (data.code === 200 || data.code === 1) {
    return mapFromBackend(data.data)
  }
  
  throw new Error(data.message || '恢复历史版本失败')
}

// 删除特定版本的历史记录
export async function deleteChapterHistoryVersion(chapterId: string, timestamp: string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}/history/${timestamp}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('历史版本不存在')
    }
    throw new Error('删除历史版本失败')
  }
  const data = await res.json()
  
  // 检查删除是否成功
  if (data.code === 200 || data.code === 1) {
    return true
  }
  
  throw new Error(data.message || '删除历史版本失败')
} 