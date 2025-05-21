"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import type { Template } from '@/app/types'

interface TemplateFormProps {
  template?: Template
  onSave: (template: Omit<Template, 'id'>, file?: File) => void
  onCancel: () => void
}

export default function TemplateForm({ 
  template, 
  onSave, 
  onCancel 
}: TemplateFormProps) {
  const [form, setForm] = useState<Omit<Template, 'id'>>({
    name: '',
    tags: '',
    content: ''
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        tags: template.tags,
        content: template.content
      })
    }
  }, [template])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      
      // 如果选择了文件，尝试读取文件内容
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          // 更新内容字段为文件内容
          setForm(prev => ({
            ...prev,
            content: event.target?.result as string
          }))
        }
      }
      reader.readAsText(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form, selectedFile || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          名称
        </label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleFormChange}
          placeholder="模板名称"
          required
        />
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          标签
        </label>
        <Input
          id="tags"
          name="tags"
          value={form.tags}
          onChange={handleFormChange}
          placeholder="标签，用逗号分隔"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          多个标签请用逗号分隔，例如：人物,地点,指南
        </p>
      </div>
      
      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          文件上传 (可选)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="file"
          accept=".txt,.md,.json"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          支持上传 .txt, .md, .json 文件作为模板内容
        </p>
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          内容
        </label>
        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleFormChange}
          placeholder="模板内容..."
          rows={12}
          className="w-full min-h-[200px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm font-mono"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          取消
        </Button>
        <Button type="submit">
          {template ? '更新模板' : '创建模板'}
        </Button>
      </div>
    </form>
  )
} 