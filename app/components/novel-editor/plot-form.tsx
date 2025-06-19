"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import type { PlotElement, ChapterListDTO, Character, Entry, Template, TemplateListDTO } from "@/app/types"
import { z } from "zod"
import { fetchCharactersPage } from "@/app/lib/api/character"
import { fetchEntriesPage } from "@/app/lib/api/entry"
import { fetchTemplatesList, fetchTemplateDetail } from "@/app/lib/api/template"
import { useLanguage } from '@/app/lib/i18n/language-context'

interface PlotFormProps {
  plot?: PlotElement
  onSave: (plot: PlotElement) => void
  onCancel: () => void
  chapters: ChapterListDTO[]
  projectId?: string
}

export const plotSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  sortOrder: z.number().min(1),
  status: z.string().min(1, "状态不能为空"),
  chapterId: z.string().optional(),
  characterIds: z.array(z.string()).optional(),
  itemIds: z.array(z.string()).optional(),
  templateId: z.string().optional(),
  type: z.string().optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  wordCountGoal: z.number().min(0).optional(),
})

export default function PlotForm({
  plot,
  onSave,
  onCancel,
  chapters,
  projectId
}: PlotFormProps) {
  const { t } = useLanguage();
  const isEditing = !!plot

  // 角色列表相关 state
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false)
  const [characterError, setCharacterError] = useState<string | null>(null)

  // 条目列表相关 state
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [entriesError, setEntriesError] = useState<string | null>(null)

  // 模板列表相关 state
  const [templates, setTemplates] = useState<TemplateListDTO[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)

  // 表单 state，包含 characterIds, itemIds 和 templateId
  const [form, setForm] = useState<PlotElement>({
    id: plot?.id || `plot-${Date.now()}`,
    title: plot?.title || "",
    description: plot?.description || "",
    sortOrder: plot?.sortOrder || 1,
    status: plot?.status || "未开始",
    chapterId: plot?.chapterId || (chapters[0]?.id ?? ""),
    characterIds: plot?.characterIds || [],
    itemIds: plot?.itemIds || [],
    templateId: plot?.templateId || "",
    type: plot?.type || "",
    completionPercentage: plot?.completionPercentage || 0,
    wordCountGoal: plot?.wordCountGoal || 0,
  })

  const typeOptions = [
    "三幕式", "英雄之旅", "五幕式", "多线叙事", "框架结构", "循环结构", "弗雷塔格金字塔", "起承转合", "非线性"
  ]

  const statusOptions = [
    "未开始", "进行中", "已完成", "已暂停", "待修改", "已修改"
  ]

  // 获取角色列表
  useEffect(() => {
    setIsLoadingCharacters(true)
    fetchCharactersPage({ 
      page: 1, 
      pageSize: 100, 
      ...(projectId ? { projectId } : {})
    })
      .then(res => setCharacters(res.data.records))
      .catch(err => setCharacterError(err.message || "角色加载失败"))
      .finally(() => setIsLoadingCharacters(false))
  }, [projectId])

  // 获取条目列表
  useEffect(() => {
    setIsLoadingEntries(true)
    fetchEntriesPage({ 
      page: 1, 
      pageSize: 100 
    })
      .then(res => setEntries(res.data.records))
      .catch(err => setEntriesError(err.message || "条目加载失败"))
      .finally(() => setIsLoadingEntries(false))
  }, [])

  // 获取模板列表
  useEffect(() => {
    setIsLoadingTemplates(true)
    fetchTemplatesList({ 
      page: 1, 
      size: 100 
    })
      .then(res => setTemplates(res.data.records))
      .catch(err => setTemplatesError(err.message || "模板加载失败"))
      .finally(() => setIsLoadingTemplates(false))
  }, [])

  // 通用表单变更
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, multiple, options } = e.target as HTMLInputElement & HTMLSelectElement
    if ((name === "characterIds" || name === "itemIds") && multiple) {
      // 多选下拉处理
      const selected = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value)
      setForm({ ...form, [name]: selected })
    } else if (e.target instanceof HTMLInputElement && e.target.type === "number") {
      setForm({ ...form, [name]: Number(value) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  // 选择模板后填充模板内容
  const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setForm(prev => ({ ...prev, templateId }));

    if (templateId) {
      try {
        setIsLoadingTemplate(true)
        // 获取完整的模板详情
        const fullTemplate = await fetchTemplateDetail(templateId);
        
        // 根据模板内容填充表单 (可以根据需要调整填充的字段)
        try {
          // 尝试解析模板内容
          const templateData = JSON.parse(fullTemplate.content);
          setForm(prev => ({
            ...prev,
            type: templateData.type || prev.type,
            description: templateData.description || prev.description,
            // 可以添加其他你希望从模板中获取的字段
          }));
        } catch (e) {
          // 如果内容不是JSON, 可能是纯文本模板，直接设置为描述
          setForm(prev => ({
            ...prev,
            description: fullTemplate.content || prev.description
          }));
        }
      } catch (err) {
        setTemplatesError(err instanceof Error ? err.message : '获取模板详情失败')
      } finally {
        setIsLoadingTemplate(false)
      }
    }
  };

  // 提交
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div>
            <label htmlFor="templateId" className="block text-sm font-medium">
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          <label htmlFor="characterIds" className="block text-sm font-medium">
            {t('project.plot.related_characters')}
          </label>
          {isLoadingCharacters ? (
            <div className="text-sm text-muted-foreground">角色加载中...</div>
          ) : characterError ? (
            <div className="text-sm text-destructive">{characterError}</div>
          ) : (
            <select
              id="characterIds"
              name="characterIds"
              multiple
              value={form.characterIds || []}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-32"
            >
              {characters.map((char) => (
                <option key={char.id} value={char.id}>{char.name}</option>
              ))}
            </select>
          )}
          <div className="text-xs text-muted-foreground mt-1">按住 Ctrl/Command 可多选</div>
        </div>
        <div>
          <label htmlFor="itemIds" className="block text-sm font-medium">
            {t('project.plot.related_entries')}
          </label>
          {isLoadingEntries ? (
            <div className="text-sm text-muted-foreground">条目加载中...</div>
          ) : entriesError ? (
            <div className="text-sm text-destructive">{entriesError}</div>
          ) : (
            <select
              id="itemIds"
              name="itemIds"
              multiple
              value={form.itemIds || []}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-32"
            >
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.name}</option>
              ))}
            </select>
          )}
          <div className="text-xs text-muted-foreground mt-1">按住 Ctrl/Command 可多选</div>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium">
              顺序
            </label>
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
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              状态
            </label>
            <input
              id="status"
              name="status"
              list="status-options"
              value={form.status}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="选择或输入状态"
              required
            />
            <datalist id="status-options">
              {statusOptions.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="completionPercentage" className="block text-sm font-medium">
              完成百分比
            </label>
            <input
              id="completionPercentage"
              name="completionPercentage"
              type="number"
              min="0"
              max="100"
              value={form.completionPercentage}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="text-xs text-muted-foreground mt-1">0-100</div>
          </div>
        </div>
        <div>
          <label htmlFor="wordCountGoal" className="block text-sm font-medium">
            字数目标
          </label>
          <input
            id="wordCountGoal"
            name="wordCountGoal"
            type="number"
            min="0"
            value={form.wordCountGoal}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="目标字数 (可选)"
          />
          <div className="text-xs text-muted-foreground mt-1">情节的目标字数</div>
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