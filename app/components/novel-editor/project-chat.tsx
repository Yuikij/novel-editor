"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { toast } from 'react-hot-toast'
import type { ProjectChatMessage, ProjectChatContext } from '@/app/types'
import { 
  streamChatWithProject,
  getProjectChatContext,
  clearProjectChatContext,
  getProjectChatHistory
} from '@/app/lib/api/project-chat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ProjectChatProps {
  projectId: string
  projectName?: string
  onClose?: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
  vectorResults?: any[]
}

const CHAT_MODES = [
  { value: 'CREATIVE', label: '创作模式' },
  { value: 'ANALYSIS', label: '分析模式' },
  { value: 'PLANNING', label: '规划模式' },
  { value: 'REVIEW', label: '评审模式' },
] as const

export default function ProjectChat({
  projectId,
  projectName,
  onClose
}: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<'CREATIVE' | 'ANALYSIS' | 'PLANNING' | 'REVIEW'>('CREATIVE')
  const [enableVectorSearch, setEnableVectorSearch] = useState(true)
  const [temperature, setTemperature] = useState(0.8)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 加载历史对话
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const context = await getProjectChatContext(projectId)
        if (context && context.messages.length > 0) {
          const convertedMessages: ChatMessage[] = context.messages.map((msg, index) => ({
            id: `${msg.role}-${index}-${Date.now()}`,
            type: msg.role === 'USER' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            tokens: msg.tokens,
            vectorResults: msg.vectorResults
          }))
          setMessages(convertedMessages)
        }
      } catch (error) {
        console.log('No chat history found or error loading history')
      }
    }
    
    loadHistory()
  }, [projectId])

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    // 创建助手消息
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      await streamChatWithProject(
        projectId,
        userMessage.content,
        (chunk) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        },
        {
          enableVectorSearch,
          maxVectorResults: 10,
          similarityThreshold: 0.7,
          mode: chatMode,
          temperature,
          maxTokens
        },
        () => {
          setIsLoading(false)
          inputRef.current?.focus()
        },
        (error) => {
          setError(error.message)
          setIsLoading(false)
          // 移除失败的助手消息
          setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
          toast.error(error.message)
        }
      )
    } catch (err: any) {
      setError(err.message || '发送消息失败')
      setIsLoading(false)
      // 移除失败的助手消息
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
      toast.error(err.message || '发送消息失败')
    }
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 清空对话
  const clearChat = async () => {
    try {
      await clearProjectChatContext(projectId)
      setMessages([])
      setError(null)
      toast.success('对话历史已清除')
    } catch (error) {
      toast.error('清除对话历史失败')
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] border rounded-lg bg-white shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">AI 写作助手</h3>
          {projectName && (
            <p className="text-sm text-gray-600">{projectName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={chatMode} onValueChange={(value: any) => setChatMode(value)}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue placeholder="选择模式" />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODES.map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            title="设置"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6"/>
              <path d="m21 12-6-6-6 6-6-6"/>
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={clearChat} title="清空对话">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} title="关闭">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="p-4 border-b bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              启用向量检索
            </label>
            <input
              type="checkbox"
              checked={enableVectorSearch}
              onChange={(e) => setEnableVectorSearch(e.target.checked)}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              创造性 ({temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              最大长度
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-20 px-2 py-1 text-xs border rounded"
            />
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">开始与AI对话</p>
            <p className="text-sm">我可以帮助您创作、分析和优化您的小说</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className={`text-xs mt-1 opacity-70 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center text-red-500 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 