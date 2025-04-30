import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { Chapter } from "@/app/types"

interface ChapterFormProps {
  chapter?: Chapter
  onSave: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function ChapterForm({ chapter, onSave, onCancel }: ChapterFormProps) {
  const isEditing = !!chapter
  const [form, setForm] = useState<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>>({
    title: chapter?.title || "",
    content: chapter?.content || "",
    summary: chapter?.summary || "",
    sortOrder: chapter?.sortOrder || 1,
    status: chapter?.status || "draft",
    wordCount: chapter?.wordCount || 0,
    targetWordCount: chapter?.targetWordCount || undefined,
    notes: chapter?.notes || "",
    type: chapter?.type || "",
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && chapter) {
      onSave({
        id: chapter.id,
        ...form,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt
      } as Chapter)
    } else {
      onSave(form as Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>)
    }
  }

  const typeOptions = [
    "三幕式", "英雄之旅", "五幕式", "多线叙事", "框架结构", "循环结构", "弗雷塔格金字塔", "起承转合", "非线性"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">标题</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="章节标题"
            />
          </div>
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium">顺序</label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="1"
              value={form.sortOrder}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium">结构类型</label>
          <input
            id="type"
            name="type"
            list="type-options"
            value={form.type}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="选择或输入结构类型 (可选)"
          />
          <datalist id="type-options">
            {typeOptions.map(option => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="block text-sm font-medium">状态</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="edited">已编辑</option>
            </select>
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium">摘要</label>
            <input
              id="summary"
              name="summary"
              type="text"
              value={form.summary}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="章节摘要"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="targetWordCount" className="block text-sm font-medium">目标字数</label>
            <input
              id="targetWordCount"
              name="targetWordCount"
              type="number"
              min="0"
              value={form.targetWordCount ?? ""}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="章节目标字数"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium">备注</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="章节备注..."
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">{isEditing ? "保存修改" : "创建章节"}</Button>
      </div>
    </form>
  )
} 