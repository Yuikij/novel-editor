"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
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

interface FloatingChatBotProps {
  projectId: string
  projectName?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
  vectorResults?: any[]
}

interface Position {
  x: number
  y: number
}

const CHAT_MODES = [
  { value: 'CREATIVE', label: '创作模式' },
  { value: 'ANALYSIS', label: '分析模式' },
  { value: 'PLANNING', label: '规划模式' },
  { value: 'REVIEW', label: '评审模式' },
] as const

export default function FloatingChatBot({
  projectId,
  projectName
}: FloatingChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<'CREATIVE' | 'ANALYSIS' | 'PLANNING' | 'REVIEW'>('CREATIVE')
  const [enableVectorSearch, setEnableVectorSearch] = useState(true)
  const [temperature, setTemperature] = useState(0.8)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [showSettings, setShowSettings] = useState(false)
  
  // 位置状态 - 使用一个组合位置来让机器人和聊天框一起移动
  const [groupPosition, setGroupPosition] = useState<Position>(() => {
    // 计算右上角位置
    if (typeof window !== 'undefined') {
      return { 
        x: window.innerWidth - 80, // 距离右边80px
        y: 20 // 距离顶部20px
      }
    }
    return { x: 20, y: 20 } // 服务端渲染时的默认值
  })
  const [isDragging, setIsDragging] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 监听窗口大小变化，调整机器人位置
  useEffect(() => {
    const handleResize = () => {
      setGroupPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 80)
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 加载历史对话
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [projectId, isOpen])

  // 拖拽处理
  const handleDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
    setGroupPosition({ x: data.x, y: data.y })
  }, [])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragStop = useCallback(() => {
    setIsDragging(false)
  }, [])

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
          setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
          toast.error(error.message)
        }
      )
    } catch (err: any) {
      setError(err.message || '发送消息失败')
      setIsLoading(false)
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
      toast.error(err.message || '发送消息失败')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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

  const toggleChat = () => {
    if (!isDragging) { // 只有在非拖拽状态下才切换
      setIsOpen(!isOpen)
      setIsMinimized(false)
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  return (
    <Draggable
      position={groupPosition}
      onDrag={handleDrag}
      onStart={handleDragStart}
      onStop={handleDragStop}
      bounds="body"
      handle=".drag-handle"
    >
      <div className="fixed z-50">
        {/* 常驻小机器人 */}
        <div
          className={`drag-handle w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 cursor-move ${
            isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'
          } ${isOpen ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          onClick={toggleChat}
        >
          {isOpen ? (
            // 对话中的图标
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          ) : (
            // 待机状态的图标
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8"/>
              <rect width="16" height="12" x="4" y="8" rx="2"/>
              <path d="M2 14h2"/>
              <path d="M20 14h2"/>
              <path d="M15 13v2"/>
              <path d="M9 13v2"/>
            </svg>
          )}
          
          {/* 机器人状态指示 */}
          {isLoading && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          )}
          {messages.length > 0 && !isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {messages.filter(m => m.type === 'assistant').length}
            </div>
          )}
        </div>

        {/* 对话窗口 - 相对于机器人定位 */}
        {isOpen && (
          <div
            className="absolute bg-white rounded-lg shadow-2xl border transition-all duration-200"
            style={{
              left: '80px', // 相对于机器人右侧
              top: '0px',
              width: '400px',
              height: isMinimized ? '50px' : '500px',
              pointerEvents: 'auto' // 确保对话框可以交互
            }}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-3 border-b bg-blue-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  AI
                </div>
                <h3 className="font-semibold text-sm">AI 写作助手</h3>
                {isLoading && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Select value={chatMode} onValueChange={(value: any) => setChatMode(value)}>
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue />
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
                  className="h-7 w-7 p-0"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={isMinimized ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  onClick={closeChat}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18"/>
                    <path d="M6 6l12 12"/>
                  </svg>
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* 设置面板 */}
                {showSettings && (
                  <div className="p-3 border-b bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label>向量检索</label>
                      <input
                        type="checkbox"
                        checked={enableVectorSearch}
                        onChange={(e) => setEnableVectorSearch(e.target.checked)}
                        className="w-3 h-3"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <label>创造性 ({temperature})</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-16"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <label>清空历史</label>
                      <Button size="sm" variant="outline" onClick={clearChat} className="h-6 text-xs">
                        清空
                      </Button>
                    </div>
                  </div>
                )}

                {/* 消息列表 */}
                <div className="overflow-y-auto p-3 space-y-3" style={{ height: showSettings ? '320px' : '360px' }}>
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">开始对话</p>
                      <p className="text-xs">我来帮助您创作</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 opacity-70`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {error && (
                    <div className="text-center text-red-500 text-xs">
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息..."
                      disabled={isLoading}
                      className="flex-1 text-sm h-8"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {isLoading ? (
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2 11 13"/>
                          <path d="M22 2 15 22 11 13 2 9z"/>
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Draggable>
  )
} 