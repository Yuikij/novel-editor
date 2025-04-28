"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { PlotElement, Chapter } from "@/app/types"

interface PlotFormProps {
  plot?: PlotElement
  onSave: (plot: PlotElement) => void
  onCancel: () => void
  chapters: Chapter[]
}

export default function PlotForm({
  plot,
  onSave,
  onCancel,
  chapters
}: PlotFormProps) {
  const isEditing = !!plot

  const [form, setForm] = useState<PlotElement>({
    id: plot?.id || `plot-${Date.now()}`,
    title: plot?.title || "",
    description: plot?.description || "",
    position: plot?.position || 1,
    status: plot?.status || "planned",
    chapterId: plot?.chapterId || (chapters[0]?.id ?? "")
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && plot?.id) {
      onSave({ ...form, id: plot.id })
    } else {
      const { id, ...rest } = form
      onSave(rest as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              标题
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="情节标题"
            />
          </div>
          <div>
            <label htmlFor="chapterId" className="block text-sm font-medium">
              所属章节
            </label>
            <select
              id="chapterId"
              name="chapterId"
              value={form.chapterId}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            描述
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="情节描述..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="position" className="block text-sm font-medium">
              顺序
            </label>
            <input
              id="position"
              name="position"
              type="number"
              min="1"
              value={form.position}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              状态
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="planned">计划中</option>
              <option value="drafted">已起草</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {isEditing ? "保存修改" : "创建情节"}
        </Button>
      </div>
    </form>
  )
} 