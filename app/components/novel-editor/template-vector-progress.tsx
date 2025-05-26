"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Progress } from "../ui/progress"
import type { VectorStatus, TemplateVectorProgressDTO } from '@/app/types'
import { 
  fetchTemplateVectorProgress, 
  streamTemplateVectorProgress, 
  indexTemplateVectorAsync,
  deleteTemplateVectorIndex 
} from '@/app/lib/api/template-vector'

interface TemplateVectorProgressProps {
  templateId: string
  templateName: string
  initialStatus?: VectorStatus
  initialProgress?: number
  onStatusChange?: (status: VectorStatus, progress: number) => void
}

export default function TemplateVectorProgress({
  templateId,
  templateName,
  initialStatus = 'NOT_INDEXED',
  initialProgress = 0,
  onStatusChange
}: TemplateVectorProgressProps) {
  const [progress, setProgress] = useState<TemplateVectorProgressDTO>({
    templateId,
    templateName,
    vectorStatus: initialStatus,
    vectorProgress: initialProgress,
    canChat: initialStatus === 'INDEXED'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取向量化状态显示文本
  const getStatusText = (status: VectorStatus) => {
    switch (status) {
      case 'NOT_INDEXED': return '未索引'
      case 'INDEXING': return '索引中'
      case 'INDEXED': return '已索引'
      case 'FAILED': return '索引失败'
      default: return '未知状态'
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: VectorStatus) => {
    switch (status) {
      case 'NOT_INDEXED': return 'text-gray-500'
      case 'INDEXING': return 'text-blue-500'
      case 'INDEXED': return 'text-green-500'
      case 'FAILED': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // 刷新进度
  const refreshProgress = async () => {
    try {
      setError(null)
      const progressData = await fetchTemplateVectorProgress(templateId)
      setProgress(progressData)
      onStatusChange?.(progressData.vectorStatus, progressData.vectorProgress)
    } catch (err: any) {
      setError(err.message || '获取进度失败')
    }
  }

  // 开始向量化
  const startIndexing = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await indexTemplateVectorAsync(templateId)
      
      // 开始流式监听进度
      const eventSource = streamTemplateVectorProgress(
        templateId,
        (progressData) => {
          setProgress(progressData)
          onStatusChange?.(progressData.vectorStatus, progressData.vectorProgress)
        },
        (error) => {
          setError(error.message)
        }
      )

      // 组件卸载时清理
      return () => eventSource.close()
    } catch (err: any) {
      setError(err.message || '启动向量化失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除索引
  const deleteIndex = async () => {
    if (!confirm('确定要删除向量索引吗？删除后将无法进行对话。')) return
    
    setIsLoading(true)
    setError(null)
    try {
      await deleteTemplateVectorIndex(templateId)
      setProgress(prev => ({
        ...prev,
        vectorStatus: 'NOT_INDEXED',
        vectorProgress: 0,
        canChat: false
      }))
      onStatusChange?.('NOT_INDEXED', 0)
    } catch (err: any) {
      setError(err.message || '删除索引失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化时获取进度
  useEffect(() => {
    refreshProgress()
  }, [templateId])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">向量化状态:</span>
          <span className={`text-sm ${getStatusColor(progress.vectorStatus)}`}>
            {getStatusText(progress.vectorStatus)}
          </span>
          {progress.vectorStatus === 'INDEXING' && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-500">{progress.vectorProgress}%</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshProgress}
            disabled={isLoading}
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
              className="w-4 h-4"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </Button>
          
          {progress.vectorStatus === 'NOT_INDEXED' && (
            <Button
              size="sm"
              onClick={startIndexing}
              disabled={isLoading}
            >
              开始向量化
            </Button>
          )}
          
          {progress.vectorStatus === 'INDEXED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteIndex}
              disabled={isLoading}
            >
              删除索引
            </Button>
          )}
        </div>
      </div>

      {progress.vectorStatus === 'INDEXING' && (
        <Progress value={progress.vectorProgress} className="w-full" />
      )}

      {progress.vectorStatus === 'FAILED' && progress.vectorErrorMessage && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          错误: {progress.vectorErrorMessage}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 