"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import type { NovelProject, NovelMetadata, WorldBuilding, Template } from "@/app/types"
import { createProject, updateProject, Project } from '@/app/lib/api/project'
import { API_BASE_URL } from '@/app/lib/config/env'
import { fetchTemplatesPage } from '@/app/lib/api/template'

// Define the structure for the AI name suggestion
interface NameSuggestion {
  name: string;
  explanation: string;
}

// Define the structure for the API response
interface ApiResponse {
  code: number; // Changed to number based on typical API responses
  message: string;
  data: {
    names: NameSuggestion[];
  };
}

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
  
  // 模板列表相关 state
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  // 获取模板列表
  useEffect(() => {
    setIsLoadingTemplates(true)
    fetchTemplatesPage({ 
      page: 1, 
      pageSize: 100 
    })
      .then(res => setTemplates(res.data.records))
      .catch(err => setTemplatesError(err.message || "模板加载失败"))
      .finally(() => setIsLoadingTemplates(false))
  }, [])
  
  // 添加 useEffect 来检查编辑时的项目数据
  useEffect(() => {
    // 只在编辑模式且项目存在时处理
    if (isEditing && project) {
      console.log("正在检查项目数据...", project);
      
      // 检查顶层字段 tags, highlights, writingRequirements 是否存在
      // 如果存在但不在 metadata 中，则更新 form 状态
      const needsUpdate = (
        ('tags' in project && (!project.metadata?.tags || project.metadata.tags.length === 0)) ||
        ('highlights' in project && (!project.metadata?.highlights || project.metadata.highlights.length === 0)) ||
        ('writingRequirements' in project && (!project.metadata?.writingRequirements || project.metadata.writingRequirements.length === 0))
      );
      
      if (needsUpdate) {
        console.log("正在更新表单数据结构...");
        
        // 更新 form 状态，确保这些字段在 metadata 对象中
        setForm(prev => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            // 优先使用 metadata 中的值，如果不存在则使用顶层值
            tags: (prev.metadata.tags?.length || 0) > 0 ? prev.metadata.tags || [] : ((project as any).tags || []),
            highlights: (prev.metadata.highlights?.length || 0) > 0 ? prev.metadata.highlights || [] : ((project as any).highlights || []),
            writingRequirements: (prev.metadata.writingRequirements?.length || 0) > 0 ? prev.metadata.writingRequirements || [] : ((project as any).writingRequirements || []),
          }
        }));
        
        // 同时更新独立状态变量
        if ((project as any).highlights && (!project.metadata?.highlights || project.metadata.highlights.length === 0)) {
          setHighlights((project as any).highlights || []);
        }
        
        if ((project as any).writingRequirements && (!project.metadata?.writingRequirements || project.metadata.writingRequirements.length === 0)) {
          setWritingRequirements((project as any).writingRequirements || []);
        }
      }
    }
  }, [project, isEditing]); // 依赖于 project 和 isEditing
  
  const [form, setForm] = useState<Omit<NovelProject, "id" | "createdAt" | "updatedAt"> & { worldId?: string, templateId?: string }>(() => {
    const initialMetadata: NovelMetadata = {
      synopsis: project?.metadata?.synopsis || "",
      tags: project?.metadata?.tags || [],
      targetAudience: project?.metadata?.targetAudience || "",
      wordCountGoal: project?.metadata?.wordCountGoal || 50000,
      status: project?.metadata?.status || "draft",
      highlights: project?.metadata?.highlights || [],
      writingRequirements: project?.metadata?.writingRequirements || []
    };
    
    return {
      title: project?.title || "",
      genre: project?.genre || "",
      style: project?.style || "",
      type: project?.type || "",
      coverGradient: project?.coverGradient || ["#4f46e5", "#818cf8"],
      metadata: initialMetadata,
      worldId: project?.worldId || (worlds[0]?.id ?? ""),
      templateId: project?.templateId || ""
    };
  })
  
  const [tagInput, setTagInput] = useState("")
  const [highlightInput, setHighlightInput] = useState("")
  const [highlights, setHighlights] = useState<string[]>(project?.metadata?.highlights || [])
  const [writingRequirements, setWritingRequirements] = useState<string[]>(project?.metadata?.writingRequirements || [])
  const [requirementInput, setRequirementInput] = useState("")
  
  // AI Title generation state
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    isMetadata = false
  ) => {
    const { name, value } = e.target;
    if (isMetadata) {
      setForm(prevForm => ({
        ...prevForm,
        metadata: {
          ...prevForm.metadata,
          [name]: value
        }
      }));
    } else {
      setForm(prevForm => ({
        ...prevForm,
        [name]: value
      }));
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
    const trimmedInput = tagInput.trim()
    if (!trimmedInput) return
    
    setForm({
      ...form,
      metadata: {
        ...form.metadata,
        tags: [...(form.metadata.tags || []), trimmedInput]
      }
    })
    setTagInput("")
  }

  const removeTag = (index: number) => {
    setForm({
      ...form,
      metadata: {
        ...form.metadata,
        tags: (form.metadata.tags || []).filter((_, i) => i !== index)
      }
    })
  }

  const addHighlight = () => {
    const trimmedInput = highlightInput.trim()
    if (!trimmedInput) return
    setHighlights([...highlights, trimmedInput])
    setHighlightInput("")
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const addRequirement = () => {
    const trimmedInput = requirementInput.trim()
    if (!trimmedInput) return
    setWritingRequirements([...writingRequirements, trimmedInput])
    setRequirementInput("")
  }

  const removeRequirement = (index: number) => {
    setWritingRequirements(writingRequirements.filter((_, i) => i !== index))
  }

  const handleSetTitle = (title: string) => {
    setForm({
      ...form,
      title
    })
    setShowSuggestions(false)
  }

  const generateTitles = async () => {
    if (!form.genre) {
      setAiError("请先选择小说类型")
      return
    }

    setIsLoading(true)
    setAiError(null)
    setShowSuggestions(false)

    try {
      const params = new URLSearchParams()
      if (form.genre) params.append("genre", form.genre)
      if (form.style) params.append("style", form.style)
      const theme = form.metadata.tags?.join(",") || ""
      if (theme) params.append("theme", theme)

      const response = await fetch(`${API_BASE_URL}/naming/novel?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }

      const result: ApiResponse = await response.json()

      if (result.code !== 200 || !result.data || !result.data.names) {
        throw new Error(result.message || "未能获取标题建议")
      }
      
      const validSuggestions = result.data.names.filter(s => s.name && s.name.trim())
      
      if (validSuggestions.length === 0) {
        setAiError("未能生成有效的标题建议")
      } else {
        setSuggestions(validSuggestions)
        setShowSuggestions(true)
      }

    } catch (error) {
      console.error("Error generating titles:", error)
      setAiError(error instanceof Error ? error.message : "获取标题建议时发生未知错误")
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // 选择模板后填充模板内容
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setForm(prev => ({ ...prev, templateId }));

    if (templateId) {
      const selectedTemplate = templates.find(t => t.id === templateId);
      if (selectedTemplate) {
        // 根据模板内容填充表单
        try {
          // 尝试解析模板内容
          const templateData = JSON.parse(selectedTemplate.content);
          setForm(prev => ({
            ...prev,
            type: templateData.type || prev.type,
            // 更新其他字段
            metadata: {
              ...prev.metadata,
              synopsis: templateData.synopsis || prev.metadata.synopsis,
              // 可以添加其他你希望从模板中获取的字段
            }
          }));
        } catch (e) {
          // 如果内容不是JSON, 可能是纯文本模板
          setForm(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              synopsis: selectedTemplate.content || prev.metadata.synopsis
            }
          }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)
    try {
      const metadataToSave: NovelMetadata = {
        ...form.metadata,
        highlights,
        writingRequirements,
      }

      const apiProject: Partial<Project> = {
        id: project?.id,
        title: form.title,
        genre: form.genre,
        style: form.style,
        type: form.type,
        synopsis: metadataToSave.synopsis,
        tags: metadataToSave.tags,
        targetAudience: metadataToSave.targetAudience,
        wordCountGoal: metadataToSave.wordCountGoal,
        highlights: metadataToSave.highlights,
        writingRequirements: metadataToSave.writingRequirements,
        status: metadataToSave.status,
        worldId: form.worldId,
        templateId: form.templateId,
        createdAt: project?.createdAt,
        updatedAt: project?.updatedAt,
      }

      let saved: Project
      if (project?.id) {
        saved = await updateProject(project.id, apiProject as Omit<Project, 'createdAt' | 'updatedAt'> & { id: string })
      } else {
        saved = await createProject(apiProject as Project)
      }

      const novelProject: NovelProject = {
        id: saved.id,
        title: saved.title,
        genre: saved.genre || '',
        style: saved.style || '',
        type: saved.type || '',
        createdAt: saved.createdAt || new Date().toISOString(),
        updatedAt: saved.updatedAt || new Date().toISOString(),
        coverGradient: form.coverGradient,
        metadata: {
          synopsis: saved.synopsis || '',
          tags: saved.tags || [],
          targetAudience: saved.targetAudience || '',
          wordCountGoal: saved.wordCountGoal || 0,
          status: saved.status as NovelMetadata['status'] || 'draft',
          highlights: saved.highlights || [],
          writingRequirements: saved.writingRequirements || [],
        },
        worldId: saved.worldId || '',
        templateId: saved.templateId || ''
      }
      onSave(novelProject)
    } catch (err: any) {
      console.error("Failed to save project:", err)
      setSubmitError(err.message || '保存项目失败')
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

  const typeOptions = [
    "三幕式", "英雄之旅", "五幕式", "多线叙事", "框架结构", "循环结构", "弗雷塔格金字塔", "起承转合", "非线性"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow">
      <div className="space-y-4 border-b pb-6 mb-6">
        <h2 className="text-lg font-semibold leading-tight">基本设置</h2>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            小说名称 <span className="text-destructive">*</span>
          </label>
          <div className="flex items-stretch gap-2">
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => handleFormChange(e)}
              className="flex-grow block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="给你的大作起个名字吧"
            />
            <Button
              type="button"
              onClick={generateTitles}
              disabled={isLoading || !form.genre}
              className="flex-shrink-0"
              variant="outline"
              aria-label="使用 AI 智能取名"
              title="使用 AI 智能取名"
            >
              {isLoading ? (
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
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
                  <path d="m15 5 4 4" />
                  <path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13" />
                  <path d="m8 6 2-2" />
                  <path d="M17 11 7 21" />
                  <path d="M14 14 9 19" />
                </svg>
              )}
              {isLoading ? "生成中..." : "AI 取名"}
            </Button>
          </div>
          {aiError && (
            <p className="mt-2 text-sm text-destructive">{aiError}</p>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-3 rounded-md border border-border bg-muted/40 p-3">
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">智能标题建议：</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
                    onClick={() => handleSetTitle(suggestion.name)}
                    title={suggestion.explanation || `选择 "${suggestion.name}" 作为标题`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSetTitle(suggestion.name); }}
                  >
                    <span className="truncate flex-grow pr-2">{suggestion.name}</span>
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
                      className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setShowSuggestions(false)}
              >
                关闭建议
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-1">
              小说类型 <span className="text-destructive">*</span>
            </label>
            <input
              id="genre"
              name="genre"
              required
              list="genre-options"
              value={form.genre}
              onChange={handleFormChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="选择或输入类型"
            />
            <datalist id="genre-options">
              {genreOptions.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
            {!form.genre && <p className="mt-1 text-xs text-muted-foreground">选择类型后可使用 AI 取名</p>}
          </div>
          <div>
            <label htmlFor="style" className="block text-sm font-medium mb-1">
              写作风格
            </label>
            <input
              id="style"
              name="style"
              list="style-options"
              value={form.style}
              onChange={handleFormChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="选择或输入风格 (可选)"
            />
            <datalist id="style-options">
              {styleOptions.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              结构类型
            </label>
            <input
              id="type"
              name="type"
              list="type-options"
              value={form.type}
              onChange={handleFormChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="选择或输入结构类型 (可选)"
            />
            <datalist id="type-options">
              {typeOptions.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="templateId" className="block text-sm font-medium mb-1">
              使用模板
            </label>
            {isLoadingTemplates ? (
              <div className="text-sm text-muted-foreground">模板加载中...</div>
            ) : templatesError ? (
              <div className="text-sm text-destructive">{templatesError}</div>
            ) : (
              <select
                id="templateId"
                name="templateId"
                value={form.templateId || ""}
                onChange={handleTemplateChange}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">-- 选择模板 --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            )}
            <div className="text-xs text-muted-foreground mt-1">选择模板后将自动填充部分内容</div>
          </div>
        </div>

        <div>
          <label htmlFor="worldId" className="block text-sm font-medium mb-1">
            关联世界观
          </label>
          <select
            id="worldId"
            name="worldId"
            value={(form.worldId as string | undefined) || ""}
            onChange={(e) => handleFormChange(e)}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">无 (不关联)</option>
            {worlds.length === 0 && <option disabled>没有可用的世界观设定</option>}
            {worlds.map(world => (
              <option key={world.id} value={world.id||""}>{world.name}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">将小说与已创建的世界观设定关联。</p>
        </div>
      </div>

      <div className="space-y-4 border-b pb-6 mb-6">
        <h2 className="text-lg font-semibold leading-tight">元数据设置</h2>
        <div>
          <label htmlFor="synopsis" className="block text-sm font-medium mb-1">
            故事简介
          </label>
          <textarea
            id="synopsis"
            name="synopsis"
            rows={4}
            value={form.metadata.synopsis}
            onChange={(e) => handleFormChange(e, true)}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="简要描述你的故事核心内容..."
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            标签 (用于分类和搜索)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-grow block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="输入标签后按回车添加"
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>添加标签</Button>
          </div>
          {form.metadata.tags && form.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.metadata.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1.5 inline-flex text-secondary-foreground hover:text-destructive"
                    aria-label={`移除标签 ${tag}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">添加的标签会影响 AI 取名建议。</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium mb-1">
              目标读者
            </label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              value={form.metadata.targetAudience}
              onChange={(e) => handleFormChange(e, true)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="例如：青少年、职场女性..."
            />
          </div>
          <div>
            <label htmlFor="wordCountGoal" className="block text-sm font-medium mb-1">
              目标字数
            </label>
            <input
              id="wordCountGoal"
              name="wordCountGoal"
              type="number"
              min="0"
              step="1000"
              value={form.metadata.wordCountGoal}
              onChange={handleWordCountChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="例如：100000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            创作状态
          </label>
          <select
            id="status"
            name="status"
            value={form.metadata.status}
            onChange={(e) => handleFormChange(e, true)}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="draft">草稿</option>
            <option value="writing">连载中</option>
            <option value="completed">已完结</option>
            <option value="on_hold">暂停</option>
            <option value="archived">已归档</option>
          </select>
        </div>

        <div>
          <label htmlFor="highlights" className="block text-sm font-medium mb-1">
            作品亮点 (卖点)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              id="highlights"
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
              className="flex-grow block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="输入亮点后按回车添加"
            />
            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>添加亮点</Button>
          </div>
          {highlights.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{highlight}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="ml-2 text-xs text-destructive hover:underline"
                    aria-label={`移除亮点 ${highlight}`}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="writingRequirements" className="block text-sm font-medium mb-1">
            写作要求 (AI 辅助)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              id="writingRequirements"
              type="text"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              className="flex-grow block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="例如：避免过多心理描写，按回车添加"
            />
            <Button type="button" variant="outline" size="sm" onClick={addRequirement}>添加要求</Button>
          </div>
          {writingRequirements.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {writingRequirements.map((req, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="ml-2 text-xs text-destructive hover:underline"
                    aria-label={`移除要求 ${req}`}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-xs text-muted-foreground">这些要求将用于指导 AI 续写、润色等功能。</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {submitError && (
          <p className="text-sm text-destructive mr-auto self-center">{submitError}</p>
        )}
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitLoading}>
          取消
        </Button>
        <Button type="submit" disabled={submitLoading || !form.title || !form.genre}>
          {submitLoading ? '保存中...' : (isEditing ? '保存修改' : '创建项目')}
        </Button>
      </div>
    </form>
  )
} 