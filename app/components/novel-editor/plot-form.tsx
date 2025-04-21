"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { PlotStructure, PlotElement } from "@/app/types"

interface PlotFormProps {
  plot?: PlotStructure
  onSave: (plot: PlotStructure) => void
  onCancel: () => void
}

export default function PlotForm({
  plot,
  onSave,
  onCancel
}: PlotFormProps) {
  const isEditing = !!plot
  
  const [form, setForm] = useState<Omit<PlotStructure, "id" | "elements">>({
    title: plot?.title || "",
    type: plot?.type || "three-act"
  })
  
  const [elements, setElements] = useState<PlotElement[]>(
    plot?.elements ? 
    [...plot.elements].sort((a, b) => a.position - b.position) : 
    []
  )
  
  const [elementForm, setElementForm] = useState<Omit<PlotElement, "id">>({
    title: "",
    description: "",
    position: elements.length > 0 ? Math.max(...elements.map(e => e.position)) + 1 : 1,
    status: "planned"
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!elementForm.title || !elementForm.description) return
    
    const newElement: PlotElement = {
      id: `element-${Date.now()}`,
      ...elementForm
    }
    
    const newElements = [...elements, newElement].sort((a, b) => a.position - b.position)
    setElements(newElements)
    setElementForm({
      title: "",
      description: "",
      position: Math.max(...newElements.map(e => e.position)) + 1,
      status: "planned"
    })
  }

  const removeElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: plot?.id || `plot-${Date.now()}`,
      ...form,
      elements: elements.sort((a, b) => a.position - b.position)
    })
  }

  const moveElement = (index: number, direction: "up" | "down") => {
    const newElements = [...elements]
    const currentElement = newElements[index]
    
    if (direction === "up" && index > 0) {
      // Swap positions with previous element
      const prevElement = newElements[index - 1]
      const tempPosition = currentElement.position
      currentElement.position = prevElement.position
      prevElement.position = tempPosition
      
      // Swap array positions
      newElements[index] = prevElement
      newElements[index - 1] = currentElement
    } else if (direction === "down" && index < newElements.length - 1) {
      // Swap positions with next element
      const nextElement = newElements[index + 1]
      const tempPosition = currentElement.position
      currentElement.position = nextElement.position
      nextElement.position = tempPosition
      
      // Swap array positions
      newElements[index] = nextElement
      newElements[index + 1] = currentElement
    }
    
    setElements(newElements)
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
              placeholder="剧情线名称"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium">
              结构类型
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="three-act">三幕剧结构</option>
              <option value="hero-journey">英雄之旅</option>
              <option value="save-the-cat">救猫咪结构</option>
              <option value="custom">自定义结构</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            情节元素
          </label>
          <div className="rounded-md border border-border p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="elementTitle" className="block text-xs text-muted-foreground">
                  标题
                </label>
                <input
                  id="elementTitle"
                  name="title"
                  type="text"
                  value={elementForm.title}
                  onChange={handleElementFormChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="情节标题"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="elementPosition" className="block text-xs text-muted-foreground">
                    顺序
                  </label>
                  <input
                    id="elementPosition"
                    name="position"
                    type="number"
                    min="1"
                    value={elementForm.position}
                    onChange={handleElementFormChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="elementStatus" className="block text-xs text-muted-foreground">
                    状态
                  </label>
                  <select
                    id="elementStatus"
                    name="status"
                    value={elementForm.status}
                    onChange={handleElementFormChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="planned">计划中</option>
                    <option value="drafted">已起草</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="elementDescription" className="block text-xs text-muted-foreground">
                描述
              </label>
              <textarea
                id="elementDescription"
                name="description"
                rows={2}
                value={elementForm.description}
                onChange={handleElementFormChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="情节描述..."
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={addElement}
                disabled={!elementForm.title || !elementForm.description}
              >
                添加情节
              </Button>
            </div>
          </div>
          
          <div className="mt-2 space-y-2">
            {elements.length > 0 && (
              <div className="rounded-md border">
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted"></div>
                  <div className="space-y-4 py-4 relative">
                    {elements.map((element, index) => (
                      <div key={element.id} className="flex items-start gap-3 pl-6 pr-4 relative">
                        <div className={`absolute left-0 top-2 h-4 w-4 rounded-full ${
                          element.status === 'completed' ? 'bg-green-500' :
                          element.status === 'drafted' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1 rounded-lg border p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{element.position}. {element.title}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                element.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                element.status === 'drafted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                              }`}>
                                {element.status === 'completed' ? '已完成' : 
                                element.status === 'drafted' ? '已起草' : '计划中'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => moveElement(index, "up")}
                                disabled={index === 0}
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
                                >
                                  <path d="m18 15-6-6-6 6"/>
                                </svg>
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => moveElement(index, "down")}
                                disabled={index === elements.length - 1}
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
                                >
                                  <path d="m6 9 6 6 6-6"/>
                                </svg>
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeElement(index)}
                                className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
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
                                >
                                  <path d="M3 6h18"/>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                  <line x1="10" x2="10" y1="11" y2="17"/>
                                  <line x1="14" x2="14" y1="11" y2="17"/>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {element.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {elements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无情节元素，请使用上方表单添加
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {isEditing ? "保存修改" : "创建剧情"}
        </Button>
      </div>
    </form>
  )
} 