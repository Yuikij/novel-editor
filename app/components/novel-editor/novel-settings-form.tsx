"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { NovelProject, NovelMetadata, WorldBuilding } from "@/app/types"
import AiTitleGenerator from "./ai-title-generator"
import { createProject, updateProject, Project } from '@/app/lib/api/project'

interface NovelSettingsFormProps {
  project?: NovelProject
  onSave: (project: NovelProject) => void
  onCancel: () => void
  worlds: WorldBuilding[]
}

export default function NovelSettingsForm({
  project,
  onSave,
  onCancel,
  worlds
}: NovelSettingsFormProps) {
  const isEditing = !!project
  
  const [form, setForm] = useState<Omit<NovelProject, "id" | "createdAt" | "updatedAt"> & { worldId?: string }>({
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
    },
    worldId: project?.worldId || (worlds[0]?.id ?? "")
  })
  
  const [tagInput, setTagInput] = useState("")
  const [highlightInput, setHighlightInput] = useState("")
  const [highlights, setHighlights] = useState<string[]>(project?.metadata?.highlights || [])
  const [writingRequirements, setWritingRequirements] = useState<string[]>(project?.metadata?.writingRequirements || [])
  const [requirementInput, setRequirementInput] = useState("")
  
  // AI Title generation state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const generateTitles = () => {
    if (!form.genre) return
    
    setIsLoading(true)
    
    // Simulate API call - in a real application, this would call a backend service
    setTimeout(() => {
      // Generate sample titles based on genre and style
      let titleSuggestions: string[] = []
      
      // Romance genre titles
      if (form.genre === "言情" || form.genre === "现代言情") {
        titleSuggestions = [
          "心动时刻：都市爱恋",
          "江南雨季",
          "心之所向",
          "春风十里",
          "相遇在雨季",
          "浮世绘爱恋"
        ]
      } 
      // Fantasy genre titles
      else if (form.genre === "玄幻" || form.genre === "仙侠") {
        titleSuggestions = [
          "九天神帝",
          "修真世界",
          "仙途问道",
          "万古神王",
          "剑道独尊",
          "灵气复苏"
        ]
      }
      // Mystery genre titles
      else if (form.genre === "悬疑") {
        titleSuggestions = [
          "隐秘真相",
          "迷雾之谜",
          "暗夜追踪",
          "谜城",
          "深渊之眼",
          "无人知晓"
        ]
      }
      // Historical titles
      else if (form.genre === "历史") {
        titleSuggestions = [
          "大明风华",
          "朝代崛起",
          "王朝霸业",
          "盛唐传奇",
          "江山如画",
          "帝国的黄昏"
        ]
      }
      // Sci-fi titles
      else if (form.genre === "科幻") {
        titleSuggestions = [
          "星际迷航",
          "量子危机",
          "超维度",
          "未来战场",
          "星辰大海",
          "时空裂隙"
        ]
      }
      // Default titles
      else {
        titleSuggestions = [
          "时光之旅",
          "未知世界",
          "命运交织",
          "人生旅途",
          "心之所向",
          "万里长空"
        ]
      }
      
      // Add style-based modifiers
      if (form.style === "甜宠") {
        titleSuggestions = [...titleSuggestions, "甜蜜约定", "暖爱时光", "蜜糖日记", "心动瞬间"]
      } else if (form.style === "虐心") {
        titleSuggestions = [...titleSuggestions, "泪之痕", "伤逝", "暗夜倾城", "心碎时刻"]
      } else if (form.style === "轻松") {
        titleSuggestions = [...titleSuggestions, "欢乐时光", "轻松日记", "悠闲生活", "都市闲情"]
      } else if (form.style === "治愈") {
        titleSuggestions = [...titleSuggestions, "心灵疗愈", "温暖时光", "阳光小巷", "微风拂面"]
      }
      
      // Add tag-based suggestions if available
      if (form.metadata.tags && form.metadata.tags.length > 0) {
        const tagBasedSuggestions = form.metadata.tags.map(tag => {
          if (tag.includes("爱情") || tag.includes("恋爱")) return `${tag}物语`
          if (tag.includes("冒险")) return `${tag}征途`
          if (tag.includes("成长")) return `${tag}之路`
          return `${tag}传说`
        })
        titleSuggestions = [...titleSuggestions, ...tagBasedSuggestions]
      }
      
      // Filter out duplicates and limit to 6 suggestions
      const uniqueSuggestions = Array.from(new Set(titleSuggestions))
      setSuggestions(uniqueSuggestions.slice(0, 6))
      
      setIsLoading(false)
      setShowSuggestions(true)
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)
    try {
      // 构造API Project类型
      const apiProject: Partial<Project> = {
        id: project?.id,
        title: form.title,
        genre: form.genre,
        style: form.style,
        synopsis: form.metadata.synopsis,
        tags: form.metadata.tags,
        targetAudience: form.metadata.targetAudience,
        wordCountGoal: form.metadata.wordCountGoal,
        highlights,
        writingRequirements,
        status: form.metadata.status,
        worldId: form.worldId,
        createdAt: project?.createdAt,
        updatedAt: project?.updatedAt,
      }
      let saved: Project
      if (project?.id) {
        saved = await updateProject(project.id, apiProject as Project)
      } else {
        saved = await createProject(apiProject as Project)
      }
      // 转换为 NovelProject 类型
      const novelProject = {
        id: saved.id,
        title: saved.title,
        genre: saved.genre || '',
        style: saved.style,
        createdAt: saved.createdAt || new Date().toISOString(),
        updatedAt: saved.updatedAt || new Date().toISOString(),
        coverGradient: project?.coverGradient || ["#4f46e5", "#818cf8"],
        metadata: {
          synopsis: saved.synopsis,
          tags: saved.tags,
          targetAudience: saved.targetAudience,
          wordCountGoal: saved.wordCountGoal,
          status: saved.status as any,
          highlights: saved.highlights,
          writingRequirements: saved.writingRequirements,
        },
        worldId: saved.worldId,
      }
      onSave(novelProject)
    } catch (err: any) {
      setSubmitError(err.message || '保存失败')
    } finally {
      setSubmitLoading(false)
    }
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
          <div className="mt-1 flex items-center gap-2">
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => handleFormChange(e)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="作品名称"
            />
            <Button 
              type="button"
              onClick={generateTitles}
              disabled={isLoading || !form.genre}
              className="flex-shrink-0"
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
                className="mr-2 h-4 w-4"
              >
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
              </svg>
              AI 智能取名
            </Button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-3 rounded-md border p-3 bg-accent/20">
              <h3 className="text-sm font-medium mb-2">智能标题建议</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((title, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/30"
                    onClick={() => {
                      handleSetTitle(title);
                      setShowSuggestions(false);
                    }}
                  >
                    <span>{title}</span>
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
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        <div>
          <label htmlFor="worldId" className="block text-sm font-medium">世界观</label>
          <select
            id="worldId"
            name="worldId"
            value={form.worldId || ""}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">无</option>
            {worlds.map((world) => (
              <option key={world.id} value={world.id}>{world.name}</option>
            ))}
          </select>
        </div>
      </div>

      {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={submitLoading}>{submitLoading ? '保存中...' : isEditing ? '保存修改' : '创建项目'}</Button>
      </div>
    </form>
  )
} 