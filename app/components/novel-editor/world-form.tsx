"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { WorldBuilding, WorldElement } from "@/app/types"

interface WorldFormProps {
  world?: WorldBuilding
  onSave: (world: WorldBuilding) => void
  onCancel: () => void
}

export default function WorldForm({
  world,
  onSave,
  onCancel
}: WorldFormProps) {
  const isEditing = !!world
  
  const [form, setForm] = useState<Omit<WorldBuilding, "id" | "elements">>({
    name: world?.name || "",
    description: world?.description || "",
    notes: world?.notes || ""
  })
  
  const [elements, setElements] = useState<WorldElement[]>(
    world?.elements || []
  )
  
  const [elementForm, setElementForm] = useState<Omit<WorldElement, "id">>({
    type: "location",
    name: "",
    description: "",
    details: ""
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleElementFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setElementForm({
      ...elementForm,
      [e.target.name]: e.target.value
    })
  }

  const addElement = () => {
    if (!elementForm.name || !elementForm.description) return
    
    const newElement: WorldElement = {
      id: `${elementForm.type}-${Date.now()}`,
      ...elementForm
    }
    
    setElements([...elements, newElement])
    setElementForm({
      type: "location",
      name: "",
      description: "",
      details: ""
    })
  }

  const removeElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && world) {
      onSave({
        id: world.id,
        ...form,
        elements
      })
    } else {
      onSave({
        ...form,
        elements
      } as Omit<WorldBuilding, 'id'>)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            名称
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="世界名称"
          />
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
            placeholder="世界描述..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            世界元素
          </label>
          <div className="rounded-md border border-border p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="elementType" className="block text-xs text-muted-foreground">
                  类型
                </label>
                <select
                  id="elementType"
                  name="type"
                  value={elementForm.type}
                  onChange={handleElementFormChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="location">地点</option>
                  <option value="culture">文化</option>
                  <option value="magic">魔法</option>
                  <option value="technology">科技</option>
                  <option value="history">历史</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label htmlFor="elementName" className="block text-xs text-muted-foreground">
                  名称
                </label>
                <input
                  id="elementName"
                  name="name"
                  type="text"
                  value={elementForm.name}
                  onChange={handleElementFormChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="元素名称"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="elementDescription" className="block text-xs text-muted-foreground">
                描述
              </label>
              <input
                id="elementDescription"
                name="description"
                type="text"
                value={elementForm.description}
                onChange={handleElementFormChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="简短描述"
              />
            </div>
            
            <div>
              <label htmlFor="elementDetails" className="block text-xs text-muted-foreground">
                详细信息 (可选)
              </label>
              <textarea
                id="elementDetails"
                name="details"
                rows={2}
                value={elementForm.details || ""}
                onChange={handleElementFormChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="更多详细信息..."
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addElement}
                disabled={!elementForm.name || !elementForm.description}
              >
                添加元素
              </Button>
            </div>
          </div>
          
          <div className="mt-2 space-y-2">
            {elements.map((element, index) => (
              <div 
                key={element.id} 
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    element.type === 'location' ? 'bg-blue-500' :
                    element.type === 'culture' ? 'bg-purple-500' :
                    element.type === 'magic' ? 'bg-amber-500' :
                    element.type === 'technology' ? 'bg-green-500' :
                    element.type === 'history' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{element.name}</span>
                      <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                        {element.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{element.description}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  删除
                </Button>
              </div>
            ))}
            {elements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无世界元素，请使用上方表单添加
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            备注 (可选)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            value={form.notes || ""}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="其他备注信息..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {isEditing ? "保存修改" : "创建世界"}
        </Button>
      </div>
    </form>
  )
} 