import { API_BASE_URL } from "../config/env"
import type { TemplateChatRequest, TemplateChatResponse } from '@/app/types'

// ============ 模板对话功能接口 ============

// 与模板对话
export async function chatWithTemplate(request: TemplateChatRequest): Promise<TemplateChatResponse> {
  const res = await fetch(`${API_BASE_URL}/templates/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error('对话失败')
  const data = await res.json()
  return { content: data.data, conversationId: request.conversationId }
}

// 流式对话
export async function streamChatWithTemplate(
  request: TemplateChatRequest,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/templates/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!res.ok) throw new Error('流式对话失败')

    const reader = res.body?.getReader()
    if (!reader) throw new Error('无法获取响应流')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 处理 Server-Sent Events 格式
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个可能不完整的行
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const content = line.slice(5) // 移除 'data:' 前缀
          if (content.trim()) {
            onChunk(content)
          }
        }
      }
    }

    onComplete?.()
  } catch (error) {
    onError?.(error as Error)
  }
}

// 检查对话可用性
export async function checkTemplateChatAvailable(templateId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/templates/chat/${templateId}/can-chat`)
  if (!res.ok) throw new Error('检查对话可用性失败')
  const data = await res.json()
  return data.data
}

// 简化对话接口
export async function simpleChatWithTemplate(
  templateId: string,
  message: string,
  conversationId?: string,
  maxResults?: number,
  similarityThreshold?: number
): Promise<TemplateChatResponse> {
  const params = new URLSearchParams({
    message,
    ...(conversationId ? { conversationId } : {}),
    ...(maxResults ? { maxResults: String(maxResults) } : {}),
    ...(similarityThreshold ? { similarityThreshold: String(similarityThreshold) } : {}),
  })

  const res = await fetch(`${API_BASE_URL}/templates/chat/${templateId}?${params}`)
  if (!res.ok) throw new Error('对话失败')
  const data = await res.json()
  return { content: data.data, conversationId }
}

// 简化流式对话接口
export async function simpleStreamChatWithTemplate(
  templateId: string,
  message: string,
  onChunk: (chunk: string) => void,
  conversationId?: string,
  maxResults?: number,
  similarityThreshold?: number,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const params = new URLSearchParams({
      message,
      ...(conversationId ? { conversationId } : {}),
      ...(maxResults ? { maxResults: String(maxResults) } : {}),
      ...(similarityThreshold ? { similarityThreshold: String(similarityThreshold) } : {}),
    })

    const res = await fetch(`${API_BASE_URL}/templates/chat/${templateId}/stream?${params}`)
    if (!res.ok) throw new Error('流式对话失败')

    const reader = res.body?.getReader()
    if (!reader) throw new Error('无法获取响应流')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 处理 Server-Sent Events 格式
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个可能不完整的行
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const content = line.slice(5) // 移除 'data:' 前缀
          if (content.trim()) {
            onChunk(content)
          }
        }
      }
    }

    onComplete?.()
  } catch (error) {
    onError?.(error as Error)
  }
} 