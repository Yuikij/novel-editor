import { API_BASE_URL } from "../config/env"
import type { TemplateVectorProgressDTO } from '@/app/types'

// ============ 模板向量化管理接口 ============

// 查询向量化进度
export async function fetchTemplateVectorProgress(templateId: string): Promise<TemplateVectorProgressDTO> {
  const res = await fetch(`${API_BASE_URL}/templates/vector/${templateId}/progress`)
  if (!res.ok) throw new Error('查询向量化进度失败')
  const data = await res.json()
  return data.data
}

// 流式获取向量化进度
export function streamTemplateVectorProgress(templateId: string, onProgress: (progress: TemplateVectorProgressDTO) => void, onError?: (error: Error) => void) {
  const eventSource = new EventSource(`${API_BASE_URL}/templates/vector/${templateId}/progress/stream`)
  
  eventSource.onmessage = function(event) {
    try {
      const progress = JSON.parse(event.data)
      onProgress(progress)
      
      // 如果向量化完成或失败，关闭连接
      if (progress.vectorStatus === 'INDEXED' || progress.vectorStatus === 'FAILED') {
        eventSource.close()
      }
    } catch (error) {
      console.error('解析进度数据失败:', error)
      onError?.(error as Error)
    }
  }
  
  eventSource.onerror = function(event) {
    console.error('向量化进度流连接错误:', event)
    onError?.(new Error('向量化进度流连接错误'))
    eventSource.close()
  }
  
  return eventSource
}

// 手动导入向量数据库
export async function indexTemplateVector(templateId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/templates/vector/${templateId}/index`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('向量化失败')
  const data = await res.json()
  return data.data
}

// 异步导入向量数据库
export async function indexTemplateVectorAsync(templateId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/templates/vector/${templateId}/index/async`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('启动向量化任务失败')
  const data = await res.json()
  return data.data
}

// 删除向量索引
export async function deleteTemplateVectorIndex(templateId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/templates/vector/${templateId}/index`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('删除向量索引失败')
  const data = await res.json()
  return data.data
}

// 批量导入向量数据库
export async function batchIndexTemplateVector(templateIds: string[]): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/templates/vector/batch/index`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: templateIds }),
  })
  if (!res.ok) throw new Error('批量向量化失败')
  const data = await res.json()
  return data.data
} 