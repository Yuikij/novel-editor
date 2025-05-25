"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/app/components/ui/button"
import { fetchProjectDraft, saveProjectDraft } from "@/app/lib/api/project"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"
import { Loader2, Save, Plus, Trash2, FileText, BrainCircuit, Eye, Edit2, Split } from "lucide-react"
import { toast } from "react-hot-toast"

interface DraftEditorProps {
  projectId: string
}

interface DraftSection {
  id: string
  title: string
  content: string
}

type ViewMode = "edit" | "preview" | "split"

export function DraftEditor({ projectId }: DraftEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [sections, setSections] = useState<DraftSection[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("edit")
  const textareaRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({})
  const savedSectionsRef = useRef<DraftSection[]>([])
  
  useEffect(() => {
    loadDraft()
  }, [projectId])

  // 页面离开前的确认对话框
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // 只显示确认对话框，不自动保存
        e.preventDefault()
        e.returnValue = '你有未保存的草稿更改，确定要离开吗？'
        return '你有未保存的草稿更改，确定要离开吗？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Adjust the height of the textarea based on its content
  const adjustTextareaHeight = (id: string) => {
    const textarea = textareaRefs.current[id]
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }
  
  // Initialize height adjustment for all textareas when tabs change
  useEffect(() => {
    const activeSection = sections.find(s => s.id === activeTab)
    if (activeSection) {
      setTimeout(() => {
        adjustTextareaHeight(activeSection.id)
      }, 10)
    }
  }, [activeTab, sections])
  
  const loadDraft = async () => {
    setLoading(true)
    setError(null)
    try {
      const draft = await fetchProjectDraft(projectId)
      if (draft && draft.sections && Array.isArray(draft.sections)) {
        setSections(draft.sections)
        savedSectionsRef.current = JSON.parse(JSON.stringify(draft.sections))
        if (draft.sections.length > 0) {
          setActiveTab(draft.sections[0].id)
        }
      } else {
        // Initialize with empty section if no draft exists
        const initialSection = {
          id: generateId(),
          title: "头脑风暴",
          content: ""
        }
        setSections([initialSection])
        savedSectionsRef.current = [initialSection]
        setActiveTab(initialSection.id)
      }
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error("加载草稿失败:", err)
      // Initialize with empty section on error
      const initialSection = {
        id: generateId(),
        title: "头脑风暴",
        content: ""
      }
      setSections([initialSection])
      savedSectionsRef.current = [initialSection]
      setActiveTab(initialSection.id)
      setError("无法加载草稿，已创建新的空白草稿")
      setHasUnsavedChanges(false)
    } finally {
      setLoading(false)
    }
  }
  
  const saveDraft = async (updatedSections: DraftSection[]) => {
    setSaving(true)
    try {
      await saveProjectDraft(projectId, { sections: updatedSections })
      savedSectionsRef.current = JSON.parse(JSON.stringify(updatedSections))
      setHasUnsavedChanges(false)
      toast.success("草稿已保存")
    } catch (err) {
      console.error("保存草稿失败:", err)
      toast.error("保存草稿失败，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  // 手动保存
  const handleManualSave = async () => {
    if (!hasUnsavedChanges) return
    await saveDraft(sections)
  }

  // 检查是否有未保存的更改
  const checkForUnsavedChanges = (updatedSections: DraftSection[]) => {
    const hasChanges = JSON.stringify(updatedSections) !== JSON.stringify(savedSectionsRef.current)
    setHasUnsavedChanges(hasChanges)
  }
  
  const handleContentChange = (id: string, content: string) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, content } : section
    )
    setSections(updatedSections)
    checkForUnsavedChanges(updatedSections)
    adjustTextareaHeight(id)
  }
  
  const handleTitleChange = (id: string, title: string) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, title } : section
    )
    setSections(updatedSections)
    checkForUnsavedChanges(updatedSections)
  }
  
  const addSection = () => {
    const newSection = {
      id: generateId(),
      title: `想法 ${sections.length + 1}`,
      content: ""
    }
    const updatedSections = [...sections, newSection]
    setSections(updatedSections)
    setActiveTab(newSection.id)
    checkForUnsavedChanges(updatedSections)
  }
  
  const deleteSection = (id: string) => {
    if (sections.length <= 1) {
      toast.error("至少保留一个草稿区域")
      return
    }
    
    // Find an adjacent tab to switch to
    const currentIndex = sections.findIndex(s => s.id === id)
    const newActiveIndex = currentIndex === 0 ? 1 : currentIndex - 1
    
    const updatedSections = sections.filter(section => section.id !== id)
    setSections(updatedSections)
    setActiveTab(updatedSections[newActiveIndex].id)
    checkForUnsavedChanges(updatedSections)
  }
  
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  const toggleViewMode = (newMode: ViewMode) => {
    setViewMode(newMode)
  }

  // Enhanced markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    if (!markdown) return ""
    
    // Convert headers: # Header, ## Header, etc.
    markdown = markdown.replace(/^(#{1,6})\s+(.*?)$/gm, (_, level, text) => {
      const hLevel = level.length
      return `<h${hLevel}>${text}</h${hLevel}>`
    })
    
    // Convert bold: **text**
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert italic: *text*
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Convert code blocks: ```code```
    markdown = markdown.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    
    // Convert inline code: `code`
    markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Convert links: [text](url)
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Convert unordered lists: - item
    let isInList = false
    let listItems = []
    
    const lines = markdown.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^- (.*?)$/)) {
        if (!isInList) {
          lines[i] = '<ul>' + lines[i].replace(/^- (.*?)$/, '<li>$1</li>')
          isInList = true
        } else {
          lines[i] = lines[i].replace(/^- (.*?)$/, '<li>$1</li>')
        }
        
        // Check if next line is not a list item
        if (i === lines.length - 1 || !lines[i + 1].match(/^- (.*?)$/)) {
          lines[i] = lines[i] + '</ul>'
          isInList = false
        }
      }
    }
    
    markdown = lines.join('\n')
    
    // Convert blockquotes: > quote
    markdown = markdown.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    
    // Convert line breaks
    markdown = markdown.replace(/\n/g, '<br />')
    
    return markdown
  }
  
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="rounded-lg border p-4 mb-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-2" onClick={loadDraft}>重试</Button>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="flex items-center justify-between bg-muted/40 p-3 border-b">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">草稿与头脑风暴</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="border rounded-md flex items-center mr-2">
            <Button 
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm" 
              className="px-2 py-1 h-8"
              onClick={() => toggleViewMode("edit")}
              title="编辑模式"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">编辑</span>
            </Button>
            <Button 
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm" 
              className="px-2 py-1 h-8"
              onClick={() => toggleViewMode("preview")}
              title="预览模式"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">预览</span>
            </Button>
            <Button 
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm" 
              className="px-2 py-1 h-8"
              onClick={() => toggleViewMode("split")}
              title="分屏模式"
            >
              <Split className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">分屏</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={addSection} title="添加新区域" className="flex gap-1 items-center">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">添加区域</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => loadDraft()}
            title="重新加载草稿"
            className="flex gap-1 items-center"
          >
            <div className="h-4 w-4 flex items-center justify-center">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              )}
            </div>
            <span className="hidden sm:inline">刷新</span>
          </Button>
          <Button 
            variant={hasUnsavedChanges ? "default" : "ghost"}
            size="sm" 
            onClick={handleManualSave}
            disabled={saving || !hasUnsavedChanges}
            title={hasUnsavedChanges ? "保存草稿更改" : "没有未保存的更改"}
            className="flex gap-1 items-center"
          >
            <div className="h-4 w-4 flex items-center justify-center">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </div>
            <span className="hidden sm:inline">
              {saving ? "保存中..." : hasUnsavedChanges ? "保存" : "已保存"}
            </span>
          </Button>
          <div className="flex items-center gap-1">
            {hasUnsavedChanges && !saving && (
              <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" title="有未保存的更改" />
            )}
            <span className="text-xs text-muted-foreground">
              {saving 
                ? "保存中..." 
                : hasUnsavedChanges 
                  ? "有未保存更改" 
                  : "手动保存"
              }
            </span>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 h-auto border-b">
          {sections.map(section => (
            <div key={section.id} className="flex items-center gap-1">
              <TabsTrigger 
                value={section.id} 
                className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                {section.title}
              </TabsTrigger>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSection(section.id)
                }}
                title="删除此草稿区域"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </TabsList>
        
        {sections.map(section => (
          <TabsContent key={section.id} value={section.id} className="p-0 mt-0">
            <div className="p-4 space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="区域标题"
                  value={section.title}
                  onChange={(e) => handleTitleChange(section.id, e.target.value)}
                  className="text-lg font-medium bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div className={`markdown-editor ${viewMode === "split" ? "grid grid-cols-2 gap-4" : "block"}`}>
                {(viewMode === "edit" || viewMode === "split") && (
                  <div className="markdown-input">
                    <textarea
                      ref={(el) => {
                        textareaRefs.current[section.id] = el;
                        return undefined;
                      }}
                      placeholder="在这里记录你的想法、灵感、情节点子或任何创作素材..."
                      value={section.content}
                      onChange={(e) => handleContentChange(section.id, e.target.value)}
                      className="w-full min-h-[300px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                      style={{ 
                        lineHeight: 1.6, 
                        overflowY: 'hidden'
                      }}
                    />
                  </div>
                )}
                
                {(viewMode === "preview" || viewMode === "split") && (
                  <div className="markdown-preview border rounded-md p-4 bg-background min-h-[300px] prose prose-sm max-w-none dark:prose-invert overflow-y-auto">
                    {section.content ? (
                      <div dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }} />
                    ) : (
                      <div className="text-muted-foreground italic">无内容预览</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded border border-dashed">
                <p className="font-medium mb-2">Markdown 格式指南：</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  <div><code># 标题1</code></div>
                  <div><code>## 标题2</code></div>
                  <div><code>**粗体**</code></div>
                  <div><code>*斜体*</code></div>
                  <div><code>- 列表项</code></div>
                  <div><code>{`>`} 引用文本</code></div>
                  <div><code>`代码`</code></div>
                  <div><code>[链接](URL)</code></div>
                  <div><code>```代码块```</code></div>
                </div>
                <p className="mt-2 text-xs">使用 Markdown 格式可以轻松排版你的笔记和草稿内容。在编辑模式下输入格式标记，然后切换到预览模式查看效果。</p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 