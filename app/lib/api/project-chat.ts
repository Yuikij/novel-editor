import { API_BASE_URL } from '@/app/lib/config/env'
import type { ProjectChatRequest, ProjectChatContext, ProjectChatResponse } from '@/app/types/'

// 项目流式对话
export async function streamChatWithProject(
  projectId: string,
  message: string,
  onChunk: (chunk: string) => void,
  options: {
    enableVectorSearch?: boolean
    maxVectorResults?: number
    similarityThreshold?: number
    mode?: 'CREATIVE' | 'ANALYSIS' | 'PLANNING' | 'REVIEW'
    temperature?: number
    maxTokens?: number
  } = {},
  onComplete?: () => void,
  onError?: (error: Error) => void
) {
  try {
    const requestBody: ProjectChatRequest = {
      message,
      enableVectorSearch: options.enableVectorSearch ?? true,
      maxVectorResults: options.maxVectorResults ?? 10,
      similarityThreshold: options.similarityThreshold ?? 0.7,
      mode: options.mode ?? 'CREATIVE',
      temperature: options.temperature ?? 0.8,
      maxTokens: options.maxTokens ?? 2000
    }

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        
        // 处理可能的多个数据块
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.trim()) {
            onChunk(line)
          }
        }
      }
      
      onComplete?.()
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('Stream chat error:', error)
    onError?.(error as Error)
  }
}

// 获取项目对话上下文
export async function getProjectChatContext(projectId: string): Promise<ProjectChatContext | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat/context`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ProjectChatResponse = await response.json()
    
    if (result.code === 200 && result.data) {
      return result.data
    }
    
    throw new Error(result.message || 'Failed to get chat context')
  } catch (error) {
    console.error('Get chat context error:', error)
    throw error
  }
}

// 清除项目对话上下文
export async function clearProjectChatContext(projectId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat/context`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.code === 200
  } catch (error) {
    console.error('Clear chat context error:', error)
    throw error
  }
}

// 获取项目对话历史
export async function getProjectChatHistory(projectId: string, limit: number = 20): Promise<ProjectChatContext | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat/history?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ProjectChatResponse = await response.json()
    
    if (result.code === 200 && result.data) {
      return result.data
    }
    
    throw new Error(result.message || 'Failed to get chat history')
  } catch (error) {
    console.error('Get chat history error:', error)
    throw error
  }
} 