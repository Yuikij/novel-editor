"use client"

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaTags, FaFile, FaDownload, FaEdit, FaTrash, FaComments, FaDatabase } from 'react-icons/fa'
import { Button } from "@/app/components/ui/button"
import { 
  fetchTemplatesList, 
  fetchTemplateDetail,
  deleteTemplate, 
  createTemplate, 
  updateTemplate,
  createTemplateWithFile,
  updateTemplateWithFile,
  createTemplateWithAutoIndex,
  uploadTemplateWithAutoIndex
} from '@/app/lib/api/template'
import { batchIndexTemplateVector } from '@/app/lib/api/template-vector'
import type { Template, TemplateListDTO, VectorStatus } from '@/app/types'
import TemplateForm from './template-form'
import TemplateVectorProgress from './template-vector-progress'
import TemplateChat from './template-chat'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'

export default function TemplateList({ 
  onRefetch, 
  onCreateNew 
}: { 
  onRefetch?: (refetch: () => void) => void, 
  onCreateNew?: () => void 
}) {
  const [templates, setTemplates] = useState<TemplateListDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [showVectorProgress, setShowVectorProgress] = useState<string | null>(null)
  const [showChat, setShowChat] = useState<{ templateId: string; templateName: string } | null>(null)
  const [autoIndex, setAutoIndex] = useState(false)

  // 获取模板列表
  const fetchTemplates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchTemplatesList({
        page: 1,
        size: 100,
        name: searchTerm || undefined,
        tag: selectedTag || undefined
      })
      setTemplates(response.data?.records || [])
    } catch (err: any) {
      setError(err.message || '获取模板列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [searchTerm, selectedTag])

  useEffect(() => {
    onRefetch?.(fetchTemplates)
  }, [onRefetch])

  // 获取所有标签
  const allTags = Array.from(
    new Set(
      templates
        .flatMap(template => template.tags?.split(',') || [])
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    )
  )

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = !selectedTag || 
      template.tags?.split(',').map(t => t.trim()).includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  // 处理创建模板
  const handleCreate = () => {
    setEditingTemplate(null)
    setShowForm(true)
    onCreateNew?.()
  }

  // 处理编辑模板
  const handleEdit = async (template: TemplateListDTO) => {
    try {
      const fullTemplate = await fetchTemplateDetail(template.id)
      setEditingTemplate(fullTemplate)
      setShowForm(true)
    } catch (err: any) {
      setError(err.message || '获取模板详情失败')
    }
  }

  // 处理预览模板
  const handlePreview = async (template: TemplateListDTO) => {
    try {
      const fullTemplate = await fetchTemplateDetail(template.id)
      setPreviewTemplate(fullTemplate)
      setShowPreview(true)
    } catch (err: any) {
      setError(err.message || '获取模板详情失败')
    }
  }

  // 处理保存模板（统一处理文件和非文件情况）
  const handleSave = async (templateData: Omit<Template, 'id'>, file?: File) => {
    try {
      if (editingTemplate) {
        if (file) {
          const formData = new FormData()
          formData.append('id', editingTemplate.id)
          formData.append('name', templateData.name)
          formData.append('tags', templateData.tags)
          formData.append('file', file)
          await updateTemplateWithFile(formData)
        } else {
          await updateTemplate(editingTemplate.id, { ...templateData, id: editingTemplate.id })
        }
      } else {
        if (file) {
          const formData = new FormData()
          formData.append('name', templateData.name)
          formData.append('tags', templateData.tags)
          formData.append('file', file)
          if (autoIndex) {
            await uploadTemplateWithAutoIndex(formData, true)
          } else {
            await createTemplateWithFile(formData)
          }
        } else {
          if (autoIndex) {
            await createTemplateWithAutoIndex(templateData, true)
          } else {
            await createTemplate(templateData)
          }
        }
      }
      await fetchTemplates()
      setShowForm(false)
      setEditingTemplate(null)
    } catch (err: any) {
      setError(err.message || '保存模板失败')
    }
  }

  // 处理删除模板
  const handleDelete = async (template: TemplateListDTO) => {
    if (!confirm(`确定要删除模板"${template.name}"吗？`)) return
    
    try {
      await deleteTemplate(template.id)
      await fetchTemplates()
    } catch (err: any) {
      setError(err.message || '删除模板失败')
    }
  }

  // 处理批量向量化
  const handleBatchVectorize = async () => {
    if (selectedTemplates.length === 0) {
      alert('请先选择要向量化的模板')
      return
    }

    if (!confirm(`确定要对选中的 ${selectedTemplates.length} 个模板进行向量化吗？`)) return

    try {
      await batchIndexTemplateVector(selectedTemplates)
      alert('批量向量化任务已启动')
      setSelectedTemplates([])
      await fetchTemplates()
    } catch (err: any) {
      setError(err.message || '批量向量化失败')
    }
  }

  // 获取向量化状态显示
  const getVectorStatusDisplay = (status?: VectorStatus, progress?: number) => {
    if (!status) return null
    
    switch (status) {
      case 'NOT_INDEXED':
        return <Badge variant="secondary">未索引</Badge>
      case 'INDEXING':
        return <Badge variant="outline" className="text-blue-600">索引中 {progress}%</Badge>
      case 'INDEXED':
        return <Badge variant="default" className="bg-green-600">已索引</Badge>
      case 'FAILED':
        return <Badge variant="destructive">索引失败</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          {selectedTemplates.length > 0 && (
            <Button onClick={handleBatchVectorize} variant="outline">
              <FaDatabase className="mr-2" />
              批量向量化 ({selectedTemplates.length})
            </Button>
          )}
          <Button onClick={handleCreate}>
            <FaPlus className="mr-2" />
            新建模板
          </Button>
        </div>
      </div>

      {/* 自动向量化选项 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoIndex"
          checked={autoIndex}
          onChange={(e) => setAutoIndex(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="autoIndex" className="text-sm text-gray-600">
          创建模板时自动向量化
        </label>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 模板列表 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedTag ? '没有找到匹配的模板' : '暂无模板'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTemplates([...selectedTemplates, template.id])
                      } else {
                        setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                      }
                    }}
                    className="rounded"
                  />
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                </div>
                {getVectorStatusDisplay(template.vectorStatus, template.vectorProgress)}
              </div>
              
              {template.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  title="预览"
                >
                  <FaFile />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  title="编辑"
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVectorProgress(template.id)}
                  title="向量化管理"
                >
                  <FaDatabase />
                </Button>
                {template.canChat && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat({ templateId: template.id, templateName: template.name })}
                    title="对话"
                  >
                    <FaComments />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template)}
                  className="text-red-600 hover:text-red-700"
                  title="删除"
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 模板表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? '编辑模板' : '新建模板'}
            </h2>
            <TemplateForm
              template={editingTemplate || undefined}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingTemplate(null)
              }}
            />
          </div>
        </div>
      )}

      {/* 模板预览弹窗 */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{previewTemplate.name}</h2>
              <Button
                variant="ghost"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </Button>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {previewTemplate.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 向量化进度弹窗 */}
      {showVectorProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">向量化管理</h2>
              <Button
                variant="ghost"
                onClick={() => setShowVectorProgress(null)}
              >
                ✕
              </Button>
            </div>
            <TemplateVectorProgress
              templateId={showVectorProgress}
              templateName={templates.find(t => t.id === showVectorProgress)?.name || ''}
              onStatusChange={(status, progress) => {
                // 更新本地状态
                setTemplates(prev => prev.map(t => 
                  t.id === showVectorProgress 
                    ? { ...t, vectorStatus: status, vectorProgress: progress, canChat: status === 'INDEXED' }
                    : t
                ))
              }}
            />
          </div>
        </div>
      )}

      {/* 对话弹窗 */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] m-4">
            <TemplateChat
              templateId={showChat.templateId}
              templateName={showChat.templateName}
              onClose={() => setShowChat(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 