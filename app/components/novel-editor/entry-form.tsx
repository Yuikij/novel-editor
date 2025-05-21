"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import type { Entry } from '@/app/types'

interface EntryFormProps {
  entry?: Entry
  onSave: (entry: Omit<Entry, 'id'>) => void
  onCancel: () => void
}

export default function EntryForm({ 
  entry, 
  onSave, 
  onCancel 
}: EntryFormProps) {
  const [form, setForm] = useState<Omit<Entry, 'id'>>({
    name: '',
    tags: '',
    description: ''
  })
  
  useEffect(() => {
    if (entry) {
      setForm({
        name: entry.name,
        tags: entry.tags,
        description: entry.description
      })
    }
  }, [entry])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
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
          placeholder="条目名称"
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
          多个标签请用逗号分隔，例如：人物,地点,道具
        </p>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleFormChange}
          placeholder="条目详细描述"
          rows={6}
          className="w-full min-h-[120px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm"
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
          {entry ? '更新条目' : '创建条目'}
        </Button>
      </div>
    </form>
  )
} 