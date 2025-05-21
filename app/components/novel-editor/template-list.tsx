"use client"

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaTags, FaFile, FaDownload, FaEdit, FaTrash } from 'react-icons/fa'
import { Button } from "@/app/components/ui/button"
import { 
  fetchTemplatesPage, 
  deleteTemplate, 
  createTemplate, 
  updateTemplate,
  createTemplateWithFile,
  updateTemplateWithFile
} from '@/app/lib/api/template'
import type { Template } from '@/app/types'
import TemplateForm from './template-form'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'

export default function TemplateList({ 
  onRefetch, 
  onCreateNew 
}: { 
  onRefetch?: (refetch: () => void) => void, 
  onCreateNew?: () => void 
}) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTag, setSearchTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [previewContent, setPreviewContent] = useState<{ id: string, content: string } | null>(null)
  const pageSize = 10

  const fetchList = (page = 1, name = searchTerm, tag = searchTag) => {
    setIsLoading(true)
    setCurrentPage(page)
    
    fetchTemplatesPage({ 
      page, 
      pageSize, 
      name: name || undefined, 
      tag: tag || undefined 
    })
      .then(res => {
        setTemplates(res.data.records)
        setTotalPages(Math.ceil(res.data.total / pageSize))
      })
      .catch(err => setHasError(err.message || '加载失败'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchList()
    if (onRefetch) onRefetch(fetchList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditClick = (template: Template) => {
    setEditingTemplate(template)
    setEditModalOpen(true)
    setEditError(null)
  }

  const handleUpdateTemplate = async (updatedTemplate: Omit<Template, 'id'>, file?: File) => {
    if (!editingTemplate) return
    
    try {
      if (file) {
        const formData = new FormData()
        formData.append('id', editingTemplate.id)
        formData.append('name', updatedTemplate.name)
        formData.append('tags', updatedTemplate.tags)
        formData.append('file', file)
        
        await updateTemplateWithFile(formData)
      } else {
        await updateTemplate(editingTemplate.id, {
          id: editingTemplate.id,
          ...updatedTemplate
        })
      }
      setEditModalOpen(false)
      fetchList(currentPage)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : '更新失败')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('确定要删除此模板吗？')) return
    
    try {
      await deleteTemplate(id)
      fetchList(currentPage)
    } catch (err) {
      setHasError(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleCreateTemplate = async (template: Omit<Template, 'id'>, file?: File) => {
    try {
      if (file) {
        const formData = new FormData()
        formData.append('name', template.name)
        formData.append('tags', template.tags)
        formData.append('file', file)
        
        await createTemplateWithFile(formData)
      } else {
        await createTemplate(template)
      }
      setCreateModalOpen(false)
      fetchList(1) // Go back to first page after creating
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '创建失败')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchList(1, searchTerm, searchTag)
  }

  const handleTagClick = (tag: string) => {
    setSearchTag(tag)
    fetchList(1, searchTerm, tag)
  }

  const handlePreviewClick = (template: Template) => {
    if (previewContent && previewContent.id === template.id) {
      setPreviewContent(null)
    } else {
      setPreviewContent({ id: template.id, content: template.content })
    }
  }

  const handleDownloadTemplate = (template: Template) => {
    const blob = new Blob([template.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Parse and display tags as badges
  const renderTags = (tagString: string) => {
    if (!tagString) return null
    
    const tags = tagString.split(',').map(tag => tag.trim()).filter(Boolean)
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">模板管理</h2>
        <Button onClick={() => setCreateModalOpen(true)}>
          <FaPlus className="mr-2" /> 新建模板
        </Button>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2">
        <div className="flex-grow flex gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="搜索模板名称"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="按标签筛选"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="pl-10"
            />
            <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        
        <Button type="submit">搜索</Button>
      </form>

      {hasError && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
          {hasError}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-slate-50">
          <p className="text-muted-foreground mb-4">暂无模板</p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <FaPlus className="mr-2" /> 新建第一个模板
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{template.name}</h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      title="预览内容"
                      onClick={() => handlePreviewClick(template)}
                    >
                      <FaFile className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      title="下载模板"
                      onClick={() => handleDownloadTemplate(template)}
                    >
                      <FaDownload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {renderTags(template.tags)}
                
                {previewContent && previewContent.id === template.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border overflow-auto max-h-[200px]">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{previewContent.content}</pre>
                  </div>
                )}
                
                <div className="flex mt-4 space-x-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(template)}
                  >
                    <FaEdit className="mr-1 h-3 w-3" /> 编辑
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <FaTrash className="mr-1 h-3 w-3" /> 删除
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={() => fetchList(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              
              <span className="flex items-center px-4">
                {currentPage} / {totalPages}
              </span>
              
              <Button 
                variant="outline" 
                onClick={() => fetchList(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">编辑模板</h2>
            <TemplateForm
              template={editingTemplate || undefined}
              onSave={handleUpdateTemplate}
              onCancel={() => setEditModalOpen(false)}
            />
            {editError && <div className="text-red-500 mt-2">{editError}</div>}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">新建模板</h2>
            <TemplateForm
              onSave={handleCreateTemplate}
              onCancel={() => setCreateModalOpen(false)}
            />
            {createError && <div className="text-red-500 mt-2">{createError}</div>}
          </div>
        </div>
      )}
    </div>
  )
} 