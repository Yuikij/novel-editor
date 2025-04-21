"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { NovelProject, NovelMetadata } from "@/app/types"
import AiTitleGenerator from "./ai-title-generator"

interface NovelSettingsFormProps {
  project?: NovelProject
  onSave: (project: NovelProject) => void
  onCancel: () => void
}

export default function NovelSettingsForm({
  project,
  onSave,
  onCancel
}: NovelSettingsFormProps) {
  const isEditing = !!project
  
  const [form, setForm] = useState<Omit<NovelProject, "id" | "createdAt" | "updatedAt">>({
    title: project?.title || "",
    genre: project?.genre || "",
    style: project?.style || "",
    coverGradient: project?.coverGradient || ["#4f46e5", "#818cf8"],
    metadata: {
      synopsis: project?.metadata?.synopsis || "",
      tags: project?.metadata?.tags || [],
      targetAudience: project?.metadata?.targetAudience || "",
      wordCountGoal: project?.metadata?.wordCountGoal || 50000,
      status: project?.metadata?.status || "draft",
      highlights: project?.metadata?.highlights || [],
      writingRequirements: project?.metadata?.writingRequirements || []
    }
  })
  
  const [tagInput, setTagInput] = useState("")
  const [highlightInput, setHighlightInput] = useState("")
  const [highlights, setHighlights] = useState<string[]>(project?.metadata?.highlights || [])
  const [writingRequirements, setWritingRequirements] = useState<string[]>(project?.metadata?.writingRequirements || [])
  const [requirementInput, setRequirementInput] = useState("")

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    isMetadata = false
  ) => {
    if (isMetadata) {
      setForm({
        ...form,
        metadata: {
          ...form.metadata,
          [e.target.name]: e.target.value
        }
      })
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value
      })
    }
  }

  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setForm({
      ...form,
      metadata: {
        ...form.metadata,
        wordCountGoal: isNaN(value) ? 0 : value
      }
    })
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    
    const updatedTags = [...(form.metadata.tags || []), tagInput.trim()]
    
    setForm({
      ...form,
      metadata: {
        ...form.metadata,
        tags: updatedTags
      }
    })
    setTagInput("")
  }

  const removeTag = (index: number) => {
    const currentTags = form.metadata.tags || []
    
    setForm({
      ...form,
      metadata: {
        ...form.metadata,
        tags: currentTags.filter((_, i) => i !== index)
      }
    })
  }

  const addHighlight = () => {
    if (!highlightInput.trim()) return
    setHighlights([...highlights, highlightInput.trim()])
    setHighlightInput("")
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const addRequirement = () => {
    if (!requirementInput.trim()) return
    setWritingRequirements([...writingRequirements, requirementInput.trim()])
    setRequirementInput("")
  }

  const removeRequirement = (index: number) => {
    setWritingRequirements(writingRequirements.filter((_, i) => i !== index))
  }

  // Add this handler for setting title from suggestions
  const handleSetTitle = (title: string) => {
    setForm({
      ...form,
      title
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Add the custom fields to metadata
    const enhancedMetadata: NovelMetadata & { 
      highlights?: string[],
      writingRequirements?: string[] 
    } = {
      ...form.metadata,
      highlights,
      writingRequirements
    }
    
    onSave({
      id: project?.id || `project-${Date.now()}`,
      createdAt: project?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...form,
      metadata: enhancedMetadata
    })
  }

  const genreOptions = [
    "言情", "玄幻", "武侠", "科幻", "悬疑", "历史", "都市", "奇幻", 
    "游戏", "轻小说", "同人", "青春", "古言", "现代言情", "仙侠", "其他"
  ]

  const styleOptions = [
    "轻松欢快", "虐心", "甜宠", "恐怖", "治愈", "搞笑", 
    "轻松", "正剧", "温馨", "励志", "黑暗", "其他"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            小说名称
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => handleFormChange(e)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="作品名称"
          />
          
          {/* Replace with the imported AiTitleGenerator */}
          <AiTitleGenerator 
            genre={form.genre}
            style={form.style}
            tags={form.metadata.tags}
            onSelectTitle={handleSetTitle}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium">
              小说类型
            </label>
            <select
              id="genre"
              name="genre"
              value={form.genre}
              onChange={(e) => handleFormChange(e)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">选择类型</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="style" className="block text-sm font-medium">
              写作风格
            </label>
            <select
              id="style"
              name="style"
              value={form.style || ""}
              onChange={(e) => handleFormChange(e)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">选择风格</option>
              {styleOptions.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="synopsis" className="block text-sm font-medium">
            简介
          </label>
          <textarea
            id="synopsis"
            name="synopsis"
            rows={3}
            value={form.metadata.synopsis || ""}
            onChange={(e) => handleFormChange(e, true)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="小说简介..."
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium">
            标签
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="恋爱, 成长, 冒险..."
            />
            <Button 
              type="button" 
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              添加
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(form.metadata.tags || []).map((tag, index) => (
              <div
                key={index}
                className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-2 text-primary hover:text-primary/70"
                >
                  ×
                </button>
              </div>
            ))}
            {(form.metadata.tags || []).length === 0 && (
              <p className="text-sm text-muted-foreground">暂无标签</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium">
            目标读者
          </label>
          <input
            id="targetAudience"
            name="targetAudience"
            type="text"
            value={form.metadata.targetAudience || ""}
            onChange={(e) => handleFormChange(e, true)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="青少年, 女性, 男性, 儿童..."
          />
        </div>

        <div>
          <label htmlFor="wordCountGoal" className="block text-sm font-medium">
            目标字数
          </label>
          <input
            id="wordCountGoal"
            name="wordCountGoal"
            type="number"
            min="0"
            value={form.metadata.wordCountGoal || ""}
            onChange={handleWordCountChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            故事爆点
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="特别吸引人的情节点..."
            />
            <Button 
              type="button" 
              onClick={addHighlight}
              disabled={!highlightInput.trim()}
            >
              添加
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {highlights.map((highlight, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between rounded-md bg-accent/50 px-3 py-2"
              >
                <span className="text-sm">{highlight}</span>
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
            {highlights.length === 0 && (
              <p className="text-sm text-muted-foreground">暂无故事爆点</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            写作要求
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="特定文风, 叙事手法, 禁止内容..."
            />
            <Button 
              type="button" 
              onClick={addRequirement}
              disabled={!requirementInput.trim()}
            >
              添加
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {writingRequirements.map((requirement, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between rounded-md bg-accent/50 px-3 py-2"
              >
                <span className="text-sm">{requirement}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
            {writingRequirements.length === 0 && (
              <p className="text-sm text-muted-foreground">暂无写作要求</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            项目状态
          </label>
          <select
            id="status"
            name="status"
            value={form.metadata.status}
            onChange={(e) => handleFormChange(e, true)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">草稿</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          onClick={onCancel}
        >
          取消
        </Button>
        <Button type="submit">
          {isEditing ? "保存设置" : "创建项目"}
        </Button>
      </div>
    </form>
  )
} 