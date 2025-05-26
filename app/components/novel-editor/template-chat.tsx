"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import type { TemplateChatResponse } from '@/app/types'
import { 
  checkTemplateChatAvailable,
  simpleStreamChatWithTemplate 
} from '@/app/lib/api/template-chat'

interface TemplateChatProps {
  templateId: string
  templateName: string
  onClose?: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function TemplateChat({
  templateId,
  templateName,
  onClose
}: TemplateChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canChat, setCanChat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId] = useState(() => `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 检查对话可用性
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await checkTemplateChatAvailable(templateId)
        setCanChat(available)
        if (!available) {
          setError('模板尚未完成向量化，无法进行对话')
        }
      } catch (err: any) {
        setError(err.message || '检查对话可用性失败')
      }
    }
    
    checkAvailability()
  }, [templateId])

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !canChat) return

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
      await simpleStreamChatWithTemplate(
        templateId,
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
        conversationId,
        5, // maxResults
        0.7, // similarityThreshold
        () => {
          setIsLoading(false)
          inputRef.current?.focus()
        },
        (error) => {
          setError(error.message)
          setIsLoading(false)
        }
      )
    } catch (err: any) {
      setError(err.message || '发送消息失败')
      setIsLoading(false)
      // 移除失败的助手消息
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
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
  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] border rounded-lg bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h3 className="font-semibold">与模板对话</h3>
          <p className="text-sm text-gray-600">{templateName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearChat}>
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
              className="w-4 h-4"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
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
                className="w-4 h-4"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!canChat && (
          <div className="text-center text-gray-500 py-8">
            <p>模板尚未完成向量化，无法进行对话</p>
            <p className="text-sm">请先在模板管理页面完成向量化</p>
          </div>
        )}

        {canChat && messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>开始与模板对话吧！</p>
            <p className="text-sm">你可以询问关于这个模板的任何问题</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={canChat ? "输入你的问题..." : "模板未向量化，无法对话"}
            disabled={!canChat || isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!canChat || !inputMessage.trim() || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                className="w-4 h-4"
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