import { useState } from "react"
import { Button } from "@/app/components/ui/button"

export interface OutlineNode {
  id: string
  title: string
  type: '起始' | '发展' | '高潮' | '结局' | '其他'
  order: number
  description?: string
}

interface OutlineFormProps {
  outline?: OutlineNode
  onSave: (outline: OutlineNode) => void
  onCancel: () => void
}

export default function OutlineForm({ outline, onSave, onCancel }: OutlineFormProps) {
  const isEditing = !!outline
  const [form, setForm] = useState<OutlineNode>({
    id: outline?.id || `outline-${Date.now()}`,
    title: outline?.title || "",
    type: outline?.type || "起始",
    order: outline?.order || 1,
    description: outline?.description || ""
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

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
              placeholder="情节点标题"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium">类型</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="起始">起始</option>
              <option value="发展">发展</option>
              <option value="高潮">高潮</option>
              <option value="结局">结局</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="order" className="block text-sm font-medium">顺序</label>
          <input
            id="order"
            name="order"
            type="number"
            min="1"
            value={form.order}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">描述</label>
          <textarea
            id="description"
            name="description"
            rows={2}
            value={form.description}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="情节点描述..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">{isEditing ? "保存修改" : "创建情节点"}</Button>
      </div>
    </form>
  )
} 