"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/app/components/ui/button"
import { IconRobot, IconDeviceFloppy, IconEye, IconEdit, IconMaximize, IconMinimize } from "@tabler/icons-react"
import { FaFont } from "react-icons/fa"
import { fetchChapterDetail, updateChapter, fetchChapterHistory, fetchChapterHistoryVersion, restoreChapterFromHistory, deleteChapterHistoryVersion } from "@/app/lib/api/chapter"
import { fetchFirstIncompletePlot, updatePlot, Plot } from "@/app/lib/api/plot"
import { fetchCharactersByProject, Character } from "@/app/lib/api/character"
import { fetchTemplatesList } from "@/app/lib/api/template"
import { fetchEntriesPage } from "@/app/lib/api/entry"
import type { Template, Entry, TemplateListDTO } from "@/app/types"
import debounce from "lodash.debounce"
import dynamic from "next/dynamic"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"
import { API_BASE_URL } from "@/app/lib/config/env"
import { toast } from 'react-hot-toast'

// 动态导入 MDEditor 以避免 SSR 问题
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
)

interface NovelEditorProps {
  projectId: string
  chapterId?: string
}

export default function NovelEditor({ projectId, chapterId }: NovelEditorProps) {
  const [content, setContent] = useState<string>("")
  const contentRef = useRef<string>("")
  const [chapter, setChapter] = useState<any>(null)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(true)
  const [wordCount, setWordCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('novel-editor-font-size')
      return saved ? Number(saved) : 16
    }
    return 16
  })
  const [showGenOptions, setShowGenOptions] = useState(false)
  const [genPrompt, setGenPrompt] = useState("")
  const [genWordCount, setGenWordCount] = useState("")
  const [genFreedom, setGenFreedom] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationMessage, setGenerationMessage] = useState("")
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [pollingTimestamp, setPollingTimestamp] = useState<number>(0)
  const [lastGeneratedContentId, setLastGeneratedContentId] = useState<string>("")
  const [incompletePlot, setIncompletePlot] = useState<Plot | null>(null)
  const [isEditingPlot, setIsEditingPlot] = useState(false)
  const [plotTitle, setPlotTitle] = useState("")
  const [plotDescription, setPlotDescription] = useState("")
  const [plotType, setPlotType] = useState("")
  const [plotTemplateId, setPlotTemplateId] = useState("")
  const [plotCharacterIds, setPlotCharacterIds] = useState<string[]>([])
  const [plotItemIds, setPlotItemIds] = useState<string[]>([])
  const [plotWordCountGoal, setPlotWordCountGoal] = useState<number | undefined>(undefined)
  const [characters, setCharacters] = useState<Character[]>([])
  const [templates, setTemplates] = useState<TemplateListDTO[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyVersions, setHistoryVersions] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedHistoryVersion, setSelectedHistoryVersion] = useState<any>(null)
  const [showHistoryPreview, setShowHistoryPreview] = useState(false)

  // 通知后端内容已消费完成
  const notifyContentConsumed = async (planId: string) => {
    try {
      const notifyUrl = `${API_BASE_URL}/chapters/generate/content/completed?planId=${planId}`;
      console.log('[DEBUG] notifyContentConsumed - 开始通知后端内容已消费, URL:', notifyUrl);
      const response = await fetch(notifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`[ERROR] notifyContentConsumed - 通知内容消费完成失败: ${response.status}`);
      } else {
        console.log('[SUCCESS] notifyContentConsumed - 内容消费通知成功, 状态码:', response.status);
      }
    } catch (error) {
      console.error('[ERROR] notifyContentConsumed - 通知内容消费异常:', error);
    }
  };
  
  // 获取生成内容并立即标记完成
  const getContentAndNotifyCompletion = async (planId: string) => {
    try {
      // 获取生成的内容
      const contentUrl = `${API_BASE_URL}/chapters/generate/content?planId=${planId}`;
      console.log('[DEBUG] getContentAndNotifyCompletion - 开始获取内容, URL:', contentUrl);
      const contentRes = await fetch(contentUrl);
      
      if (!contentRes.ok) {
        console.error(`[ERROR] getContentAndNotifyCompletion - 获取内容失败: ${contentRes.status}`);
        throw new Error(`获取内容失败: ${contentRes.status}`);
      }
      
      // 检查响应类型并处理内容
      const contentType = contentRes.headers.get('content-type');
      console.log('[DEBUG] getContentAndNotifyCompletion - 内容响应类型:', contentType);
      
      let contentProcessed = false;
      
      // 处理JSON响应
      if (contentType && contentType.includes('application/json')) {
        console.log('[DEBUG] getContentAndNotifyCompletion - 处理JSON内容响应');
        const contentData = await contentRes.json();
        
        if (contentData.code !== 200 || !contentData.data) {
          console.error('[ERROR] getContentAndNotifyCompletion - 无效的JSON内容响应:', contentData);
          throw new Error("获取内容失败: " + (contentData.message || "未知错误"));
        }
        
        const generatedContent = contentData.data;
        console.log('[DEBUG] 生成内容长度:', generatedContent.length);
        setContent(prev => {
          const next = prev + generatedContent;
          countWords(next);
          contentRef.current = next;
          return next;
        });
        
        contentProcessed = true;
        toast.success("内容生成完成");
      } 
      // 处理流式响应
      else if (contentRes.body) {
        console.log('[DEBUG] 处理流式内容响应');
        const reader = contentRes.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let totalContent = ""; // 记录总内容长度，用于日志
        
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            console.log('[DEBUG] 接收到内容块, 长度:', chunk.length);
            
            // 立即将每个块添加到内容中，实现逐字显示
            setContent(prev => {
              const next = prev + chunk;
              countWords(next);
              contentRef.current = next;
              return next;
            });
            
            totalContent += chunk; // 累计总内容，仅用于日志
          }
          done = doneReading;
        }
        
        // 流处理完成
        if (totalContent.length > 0) {
          console.log('[DEBUG] 流式内容接收完成, 总长度:', totalContent.length);
          contentProcessed = true;
          
          // 记录当前内容的状态，确保内容已被更新到state
          console.log('[DEBUG CONTENT] 流处理完成 - 处理前内容长度:', content.length);
          console.log('[DEBUG CONTENT] 流处理完成 - 本次新增内容长度:', totalContent.length);
          console.log('[DEBUG CONTENT] 流处理完成 - 预期总内容长度:', content.length + totalContent.length);
          
          toast.success("已获取生成内容");
        }
      }
      
      if (contentProcessed) {
        // 立即调用completed - 关键修改，确保在处理完内容后立即调用
        console.log('[IMPORTANT] getContentAndNotifyCompletion - 内容处理成功, 立即调用completed API');
        await notifyContentConsumed(planId);
        
        // 新增：内容处理完成后，自动保存内容
        console.log('[IMPORTANT] getContentAndNotifyCompletion - 内容处理完成后自动保存');
        console.log('[DEBUG CONTENT] getContentAndNotifyCompletion - 当前内容长度:', content.length);
        console.log('[DEBUG CONTENT] getContentAndNotifyCompletion - contentRef当前内容长度:', contentRef.current.length);
        debouncedSave.cancel(); // 取消任何待处理的自动保存
        // 使用当前state中的最新内容
        const latestContent = contentRef.current; // Use ref for most up-to-date value
        console.log('[DEBUG CONTENT] getContentAndNotifyCompletion - 保存时的内容长度:', latestContent.length);
        await saveContent(latestContent); // 直接调用保存，确保包含所有生成的内容
      } else {
        console.error('[ERROR] getContentAndNotifyCompletion - 内容未能成功处理');
      }
      
    } catch (error: any) {
      console.error('[ERROR] getContentAndNotifyCompletion - 获取内容异常:', error);
      toast.error(error.message || "获取内容失败");
    }
  };

  // 加载章节内容
  useEffect(() => {
    if (!chapterId) return

    const loadChapter = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchChapterDetail(chapterId)
        setChapter(data)
        const chapterContent = data.content || ""
        setContent(chapterContent)
        contentRef.current = chapterContent // 同步更新ref
        countWords(chapterContent)
      } catch (err: any) {
        setError(err.message || "加载章节失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadChapter()
  }, [chapterId])

  // 加载未完成的情节
  useEffect(() => {
    if (!chapterId) return

    const loadIncompletePlot = async () => {
      try {
        const plot = await fetchFirstIncompletePlot(chapterId)
        setIncompletePlot(plot)
        if (plot) {
          setPlotTitle(plot.title || "")
          setPlotDescription(plot.description || "")
          setPlotType(plot.type || "")
          setPlotTemplateId(plot.templateId || "")
          setPlotCharacterIds(plot.characterIds || [])
          setPlotItemIds(plot.itemIds || [])
          setPlotWordCountGoal(plot.wordCountGoal)
        }
      } catch (err: any) {
        console.error("加载未完成情节失败:", err)
        // 不显示错误，因为可能没有未完成的情节
      }
    }

    loadIncompletePlot()
  }, [chapterId])

  // 加载角色、模板和条目数据
  useEffect(() => {
    if (!projectId) return

    const loadData = async () => {
      setIsLoadingData(true)
      try {
        // 并行加载所有数据
        const [charactersRes, templatesRes, entriesRes] = await Promise.all([
          fetchCharactersByProject(projectId),
          fetchTemplatesList({ page: 1, size: 100 }),
          fetchEntriesPage({ page: 1, pageSize: 100 })
        ])
        
        setCharacters(charactersRes)
        setTemplates(templatesRes.data?.records || [])
        setEntries(entriesRes.data?.records || [])
      } catch (err: any) {
        console.error("加载数据失败:", err)
        toast.error("加载数据失败")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [projectId])

  // 统计字数
  const countWords = (text: string) => {
    // 移除 Markdown 标记、空格和标点符号后计算字数
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "") // 移除代码块
      .replace(/`.*?`/g, "") // 移除内联代码
      .replace(/\[.*?\]\(.*?\)/g, "") // 移除链接
      .replace(/\*\*(.*?)\*\*/g, "$1") // 移除粗体标记但保留内容
      .replace(/\*(.*?)\*/g, "$1") // 移除斜体标记但保留内容
      .replace(/\s+/g, "") // 移除空格
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "") // 移除非中英文数字字符
    
    setWordCount(cleanText.length)
  }

  // 内容变更处理
  const handleChange = useCallback((value: string | undefined) => {
    const newContent = value || ""
    setContent(newContent)
    contentRef.current = newContent
    countWords(newContent)
    debouncedSave(newContent)
  }, [])

  // 处理键盘输入
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const INDENT = "    " // 4个空格
    // Tab/Shift+Tab 缩进处理
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const { selectionStart, selectionEnd, value } = textarea
      // 多行选中时
      if (selectionStart !== selectionEnd && value.slice(selectionStart, selectionEnd).includes('\n')) {
        const lines = value.slice(selectionStart, selectionEnd).split('\n')
        if (e.shiftKey) {
          // Shift+Tab: 删除每行开头的缩进
          const newLines = lines.map(line => line.startsWith(INDENT) ? line.slice(INDENT.length) : line)
          const newValue = value.slice(0, selectionStart) + newLines.join('\n') + value.slice(selectionEnd)
          setContent(newValue)
          contentRef.current = newValue // 同步更新ref
          countWords(newValue)
          debouncedSave(newValue)
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart, selectionEnd - (lines.length - newLines.filter((l, i) => lines[i].startsWith(INDENT)).length) * INDENT.length)
          }, 0)
        } else {
          // Tab: 每行前加缩进
          const newLines = lines.map(line => INDENT + line)
          const newValue = value.slice(0, selectionStart) + newLines.join('\n') + value.slice(selectionEnd)
          setContent(newValue)
          contentRef.current = newValue // 同步更新ref
          countWords(newValue)
          debouncedSave(newValue)
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart, selectionEnd + lines.length * INDENT.length)
          }, 0)
        }
      } else {
        // 单行或无选中
        if (e.shiftKey) {
          // Shift+Tab: 删除光标前的缩进
          const before = value.substring(0, selectionStart)
          if (before.endsWith(INDENT)) {
            const newValue = value.substring(0, selectionStart - INDENT.length) + value.substring(selectionStart)
            setContent(newValue)
            contentRef.current = newValue // 同步更新ref
            countWords(newValue)
            debouncedSave(newValue)
            setTimeout(() => {
              textarea.setSelectionRange(selectionStart - INDENT.length, selectionStart - INDENT.length)
            }, 0)
          }
        } else {
          // Tab: 插入缩进
          const newValue = value.substring(0, selectionStart) + INDENT + value.substring(selectionEnd)
          setContent(newValue)
          contentRef.current = newValue // 同步更新ref
          countWords(newValue)
          debouncedSave(newValue)
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart + INDENT.length, selectionStart + INDENT.length)
          }, 0)
        }
      }
      return
    }
    // Enter 自动段落与首行缩进
    if (e.key === 'Enter') {
      e.preventDefault()
      const textarea = e.currentTarget
      const { selectionStart, selectionEnd, value } = textarea
      const textBeforeCursor = value.substring(0, selectionStart)
      const textAfterCursor = value.substring(selectionEnd)
      // 检查光标前的文本是否已经有两个换行符
      const hasDoubleNewline = textBeforeCursor.endsWith('\n\n')
      const hasNewline = textBeforeCursor.endsWith('\n') && !hasDoubleNewline
      // 每次新段落都插入4个空格缩进
      let insertText = ''
      if (hasDoubleNewline) {
        insertText = '\n' + INDENT
      } else if (hasNewline) {
        insertText = '\n' + INDENT
      } else {
        insertText = '\n\n' + INDENT
      }
      const newText = textBeforeCursor + insertText + textAfterCursor
      setContent(newText)
      contentRef.current = newText // 同步更新ref
      countWords(newText)
      debouncedSave(newText)
      // 设置新的光标位置
      setTimeout(() => {
        const newPosition = selectionStart + insertText.length
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
      return
    }
  }, [])

  // 保存章节内容
  const saveContent = async (text: string) => {
    if (!chapterId || !chapter) return
    
    console.log('[DEBUG SAVE] saveContent 开始执行')
    console.log('[DEBUG SAVE] 传入的text长度:', text.length)
    console.log('[DEBUG SAVE] 传入的text前100字符:', text.substring(0, 100))
    console.log('[DEBUG SAVE] chapterId:', chapterId)
    console.log('[DEBUG SAVE] chapter对象:', chapter)
    
    setIsSaving(true)
    try {
      // 计算实际字数（排除 Markdown 标记）
      const wordCount = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`.*?`/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\s+/g, "")
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")
        .length
        
      console.log('[DEBUG SAVE] 计算的字数:', wordCount)
        
      const updatedChapter = {
        ...chapter,
        content: text,
        wordCount: wordCount
      }
      
      console.log('[DEBUG SAVE] 准备发送的章节数据:', {
        id: updatedChapter.id,
        title: updatedChapter.title,
        contentLength: updatedChapter.content?.length || 0,
        wordCount: updatedChapter.wordCount
      })
      
      await updateChapter(chapterId, updatedChapter)
      setLastSaved(new Date())
      console.log('[DEBUG SAVE] 保存成功')
    } catch (err) {
      console.error("[DEBUG SAVE] 保存失败:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // 使用 debounce 延迟保存，避免频繁请求
  const debouncedSave = useCallback(
    debounce((text: string) => saveContent(text), 1500),
    [chapterId, chapter]
  )

  // 手动保存
  const handleManualSave = async () => {
    if (!chapterId || !chapter) return
    
    console.log('[DEBUG MANUAL SAVE] 手动保存开始')
    console.log('[DEBUG MANUAL SAVE] chapterId:', chapterId)
    console.log('[DEBUG MANUAL SAVE] chapter存在:', !!chapter)
    
    // 取消任何待处理的自动保存
    debouncedSave.cancel()
    console.log('[DEBUG MANUAL SAVE] 当前content状态长度:', content.length);
    console.log('[DEBUG MANUAL SAVE] contentRef当前长度:', contentRef.current.length);
    console.log('[DEBUG MANUAL SAVE] content前100字符:', content.substring(0, 100));
    console.log('[DEBUG MANUAL SAVE] contentRef前100字符:', contentRef.current.substring(0, 100));
    
    await saveContent(contentRef.current) // Use ref for most up-to-date value
    console.log('[DEBUG MANUAL SAVE] 手动保存完成')
  }

  // 保存情节
  const savePlot = async () => {
    if (!incompletePlot) return
    
    try {
      const updatedPlot = {
        ...incompletePlot,
        title: plotTitle,
        description: plotDescription,
        type: plotType,
        templateId: plotTemplateId || undefined,
        characterIds: plotCharacterIds,
        itemIds: plotItemIds,
        wordCountGoal: plotWordCountGoal,
      }
      await updatePlot(incompletePlot.id, updatedPlot)
      setIncompletePlot(updatedPlot)
      setIsEditingPlot(false)
      toast.success("情节已保存")
    } catch (err: any) {
      console.error("保存情节失败:", err)
      toast.error("保存情节失败")
    }
  }

  // 取消编辑情节
  const cancelEditPlot = () => {
    if (incompletePlot) {
      setPlotTitle(incompletePlot.title || "")
      setPlotDescription(incompletePlot.description || "")
      setPlotType(incompletePlot.type || "")
      setPlotTemplateId(incompletePlot.templateId || "")
      setPlotCharacterIds(incompletePlot.characterIds || [])
      setPlotItemIds(incompletePlot.itemIds || [])
      setPlotWordCountGoal(incompletePlot.wordCountGoal)
    }
    setIsEditingPlot(false)
  }

  // 加载历史记录
  const loadHistory = async () => {
    if (!chapterId) return
    
    setIsLoadingHistory(true)
    try {
      const history = await fetchChapterHistory(chapterId)
      // 确保history是数组类型
      const historyArray = Array.isArray(history) ? history : (history ? [history] : [])
      setHistoryVersions(historyArray)
      setShowHistory(true)
    } catch (err: any) {
      console.error("加载历史记录失败:", err)
      toast.error("加载历史记录失败")
      // 出错时设置为空数组
      setHistoryVersions([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 预览历史版本
  const previewHistoryVersion = async (version: any) => {
    if (!chapterId) return
    
    try {
      // 如果版本对象中已经有内容，直接使用
      if (version.content) {
        setSelectedHistoryVersion(version)
        setShowHistoryPreview(true)
      } else {
        // 否则从API获取内容
        const fetchedContent = await fetchChapterHistoryVersion(chapterId, version.timestamp)
        setSelectedHistoryVersion({
          ...version,
          content: fetchedContent
        })
        setShowHistoryPreview(true)
      }
    } catch (err: any) {
      console.error("预览历史版本失败:", err)
      toast.error("预览历史版本失败")
    }
  }

  // 恢复历史版本
  const restoreHistoryVersion = async (version: any) => {
    if (!chapterId || !chapter) return
    
    try {
      // 如果版本对象中已经有内容，直接恢复
      if (version.content) {
        const restoredContent = version.content
        setContent(restoredContent)
        contentRef.current = restoredContent // 同步更新ref
        countWords(restoredContent)
        
        // 更新章节对象
        const updatedChapter = {
          ...chapter,
          content: restoredContent,
          wordCount: version.wordCount || restoredContent.length
        }
        setChapter(updatedChapter)
        
        setShowHistoryPreview(false)
        setShowHistory(false)
        toast.success("历史版本已恢复")
        
        // 保存恢复的内容
        await saveContent(restoredContent)
      } else {
        // 否则调用API恢复
        const restoredChapter = await restoreChapterFromHistory(chapterId, version.timestamp)
        setChapter(restoredChapter)
        const restoredContent = restoredChapter.content || ""
        setContent(restoredContent)
        contentRef.current = restoredContent // 同步更新ref
        countWords(restoredContent)
        setShowHistoryPreview(false)
        setShowHistory(false)
        toast.success("历史版本已恢复")
      }
    } catch (err: any) {
      console.error("恢复历史版本失败:", err)
      toast.error("恢复历史版本失败")
    }
  }

  // 删除历史版本
  const deleteHistoryVersion = async (version: any) => {
    if (!chapterId) return
    
    try {
      await deleteChapterHistoryVersion(chapterId, version.timestamp)
      // 重新加载历史记录
      await loadHistory()
      toast.success("历史版本已删除")
    } catch (err: any) {
      console.error("删除历史版本失败:", err)
      toast.error("删除历史版本失败")
    }
  }

  // 设置编辑器引用
  const setEditorReference = useCallback((textarea: HTMLTextAreaElement | null) => {
    editorRef.current = textarea
  }, [])

  // 持久化字体大小
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('novel-editor-font-size', String(fontSize))
    }
  }, [fontSize])

  // 你的内容生成处理函数（如无则需实现）
  const handleGenerateContent = async ({ prompt, wordCount, freedom }: { prompt?: string; wordCount?: string; freedom?: boolean }) => {
    if (!chapterId || !projectId) return;
    console.log('Start content generation process');
    setIsGenerating(true);
    setGenerationProgress(0);
    setLastGeneratedContentId(""); // 重置上一次生成的内容ID
    
    try {
      const params = new URLSearchParams({
        chapterId,
        projectId,
        freedom: String(freedom || false), // 添加freedom参数，默认为false
        ...(prompt ? { promptSuggestion: prompt } : {}),
        ...(wordCount ? { wordCountSuggestion: wordCount } : {}),
      });
      
      console.log('Execute params:', params.toString());
      
      // 1. 调用 execute 接口获取 planId
      const executeUrl = `${API_BASE_URL}/chapters/generate/execute?${params.toString()}`;
      console.log('Calling execute API:', executeUrl);
      const executeRes = await fetch(executeUrl);
      const executeData = await executeRes.json();
      console.log('Execute response:', executeData);
      
      if (executeData.code !== 200 || !executeData.data) {
        throw new Error("启动生成失败: " + (executeData.message || "未知错误"));
      }
      
      const planId = executeData.data; // planId直接在data字段中
      console.log('Got planId:', planId);
      toast.success("已开始生成内容，请稍候...");
      
      // 存储planId到状态中，这样useEffect可以监听它
      console.log('Setting localStorage items');
      localStorage.setItem('current_generation_plan_id', planId);
      localStorage.setItem('generation_polling_active', 'true');
      console.log('localStorage set complete');
      
      // 强制触发 useEffect 重新运行
      setPollingTimestamp(Date.now());
      console.log('Polling timestamp updated to trigger effect');
      
    } catch (err: any) {
      console.error("生成失败:", err);
      toast.error(err.message || "生成失败");
      setIsGenerating(false);
      localStorage.removeItem('current_generation_plan_id');
      localStorage.removeItem('generation_polling_active');
    }
  }
  
  // 使用useEffect来处理轮询逻辑
  useEffect(() => {
    // 只在isGenerating为true且有计划ID时才启动轮询
    console.log('[DEBUG] 轮询useEffect触发, isGenerating:', isGenerating, 'timestamp:', pollingTimestamp);
    if (!isGenerating && pollingTimestamp === 0) {
      console.log('[DEBUG] 未处于生成状态且无强制检查, 跳过轮询设置');
      return;
    }
    
    const planId = localStorage.getItem('current_generation_plan_id');
    console.log('[DEBUG] 从localStorage获取planId:', planId);
    if (!planId) {
      console.log('[DEBUG] 未找到planId, 跳过轮询设置');
      return;
    }
    
    const isPollingActive = localStorage.getItem('generation_polling_active') === 'true';
    console.log('[DEBUG] 轮询状态:', isPollingActive);
    if (!isPollingActive) {
      console.log('[DEBUG] 轮询未激活, 跳过轮询设置');
      return;
    }
    
    console.log('[DEBUG] 为planId设置轮询:', planId);
    
    // 标记是否正在获取内容
    const isFetchingContentRef = { current: false };
    
    // 立即执行一次检查
    const checkProgress = async () => {
      console.log('[DEBUG] 为planId执行进度检查:', planId);
      try {
        // 如果当前正在获取内容，则跳过进度检查
        if (isFetchingContentRef.current) {
          console.log('[DEBUG] 当前正在获取内容流, 跳过进度检查');
          return;
        }
        
        const progressUrl = `${API_BASE_URL}/chapters/generate/progress?planId=${planId}`;
        console.log('[DEBUG] 检查进度URL:', progressUrl);
        const progressRes = await fetch(progressUrl);
        const progressData = await progressRes.json();
        
        console.log('[DEBUG] 进度响应:', JSON.stringify(progressData));
        
        // 显示进度信息
        if (progressData.data?.progress) {
          const progress = parseInt(progressData.data.progress);
          console.log('[DEBUG] 进度值:', progress);
          setGenerationProgress(progress);
          // 不用每次都显示toast，避免过多提示
          if (progress % 20 === 0) { // 每增加20%显示一次
            toast.success(`生成进度: ${progress}%`);
          }
        }
        
        // 根据返回的状态码显示不同的状态信息
        if (progressData.data?.stateMessage) {
          console.log('[DEBUG] 状态消息:', progressData.data.stateMessage);
        }
        
        // 保存消息内容
        if (progressData.data?.message) {
          console.log('[DEBUG] 详细消息:', progressData.data.message);
          setGenerationMessage(progressData.data.message);
        }
        
        // 根据API响应，判断生成状态
        // 状态枚举： 0-计划中，1-执行中，2-生成中，3-已完成
        if (progressData.code === 200) {
          // 接收到完成状态，直接保存当前内容
          if (progressData.data?.state === 3 && 
              progressData.data?.progress === 100 && 
              progressData.data?.stateMessage === "已完成") {
            console.log('[CRITICAL] 接收到完成状态响应，确保内容已保存');
            console.log('[DEBUG CONTENT] 当前内容长度:', content.length);
            console.log('[DEBUG CONTENT] contentRef当前内容长度:', contentRef.current.length);
            // 自动保存所有生成的内容
            debouncedSave.cancel(); // 取消任何待处理的自动保存
            // 使用当前state中的content，确保保存最新内容
            const currentContent = contentRef.current; // Use ref for most up-to-date value
            console.log('[DEBUG CONTENT] 保存时的内容长度:', currentContent.length);
            await saveContent(currentContent); // 直接调用保存，确保包含所有流式生成的内容
            
            // 重新执行之前的清理工作和状态更新
            localStorage.removeItem('generation_polling_active');
            localStorage.removeItem('current_generation_plan_id');
            setPollingTimestamp(0);
            setLastGeneratedContentId("");
            setGenerationProgress(100);
            setGenerationMessage("");
            toast.success("生成完成并已保存！");
            setIsGenerating(false);
            return; // 直接返回，不再进入switch
          }
          
          // 显示对应的状态描述
          switch (progressData.data?.state) {
            case 0:
              console.log('[DEBUG] 状态: 计划阶段');
              break;
            case 1:
              console.log('[DEBUG] 状态: 执行中阶段');
              break;
            case 2:
              console.log('[IMPORTANT] 状态: 内容生成中, hasContent:', progressData.data?.hasContent);
              // 新的需求实现：
              // 1. 在/generate/content生成中的时候，不需要调用progress和content
              // 2. 当前/generate/content结束的时候，必须立马调用completed
              // 3. completed之后继续progress，当progress发现"state": 2时，需要重新调用generate/content

              // 当有新内容时，获取内容并立即调用completed
              if (progressData.data?.hasContent && !isFetchingContentRef.current) {
                console.log('[IMPORTANT] 有可用内容, 获取内容');
                
                // 检查是否有唯一标识符，避免重复获取相同内容
                const contentId = progressData.data?.contentId || '';
                console.log('[DEBUG] 内容ID:', contentId);
                
                // 如果已经获取过这部分内容，则跳过
                if (contentId && contentId === lastGeneratedContentId) {
                  console.log('[DEBUG] 已获取此内容批次, 跳过');
                  break;
                }
                
                // 记录当前内容ID，避免重复处理
                if (contentId) {
                  console.log('[DEBUG] 记录当前内容ID:', contentId);
                  setLastGeneratedContentId(contentId);
                }
                
                try {
                  // 标记正在获取内容，防止重复请求
                  isFetchingContentRef.current = true;
                  console.log('[IMPORTANT] 已标记正在获取内容, 跳过后续progress调用');
                  
                  // 获取生成的内容
                  const contentUrl = `${API_BASE_URL}/chapters/generate/content?planId=${planId}`;
                  console.log('[IMPORTANT] 获取内容, URL:', contentUrl);
                  const contentRes = await fetch(contentUrl);
                  
                  if (!contentRes.ok) {
                    console.error(`[ERROR] 获取内容失败, 状态码: ${contentRes.status}`);
                    throw new Error(`获取内容失败: ${contentRes.status}`);
                  }
                  
                  const contentType = contentRes.headers.get('content-type');
                  console.log('[DEBUG] 内容响应类型:', contentType);
                  let contentProcessed = false;
                  
                  // 处理JSON响应
                  if (contentType && contentType.includes('application/json')) {
                    console.log('[DEBUG] 处理JSON内容响应');
                    const contentData = await contentRes.json();
                    
                    if (contentData.code !== 200 || !contentData.data) {
                      console.error('[ERROR] 无效的JSON内容响应:', contentData);
                      throw new Error("获取内容失败: " + (contentData.message || "未知错误"));
                    }
                    
                    const generatedContent = contentData.data;
                    console.log('[DEBUG] 生成内容长度:', generatedContent.length);
                    setContent(prev => {
                      const next = prev + generatedContent;
                      countWords(next);
                      contentRef.current = next;
                      return next;
                    });
                    
                    contentProcessed = true;
                    toast.success("内容生成完成");
                  } 
                  // 处理流式响应
                  else if (contentRes.body) {
                    console.log('[DEBUG] 处理流式内容响应');
                    const reader = contentRes.body.getReader();
                    const decoder = new TextDecoder();
                    let done = false;
                    let totalContent = ""; // 记录总内容长度，用于日志
                    
                    while (!done) {
                      const { value, done: doneReading } = await reader.read();
                      if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        console.log('[DEBUG] 接收到内容块, 长度:', chunk.length);
                        
                        // 立即将每个块添加到内容中，实现逐字显示
                        setContent(prev => {
                          const next = prev + chunk;
                          countWords(next);
                          contentRef.current = next;
                          return next;
                        });
                        
                        totalContent += chunk; // 累计总内容，仅用于日志
                      }
                      done = doneReading;
                    }
                    
                    // 流处理完成
                    if (totalContent.length > 0) {
                      console.log('[DEBUG] 流式内容接收完成, 总长度:', totalContent.length);
                      contentProcessed = true;
                      
                      // 记录当前内容的状态，确保内容已被更新到state
                      console.log('[DEBUG CONTENT] 流处理完成 - 处理前内容长度:', content.length);
                      console.log('[DEBUG CONTENT] 流处理完成 - 本次新增内容长度:', totalContent.length);
                      console.log('[DEBUG CONTENT] 流处理完成 - 预期总内容长度:', content.length + totalContent.length);
                      
                      toast.success("已获取生成内容");
                    }
                  }
                  
                  // 内容处理完成后立即调用completed
                  if (contentProcessed) {
                    console.log('[CRITICAL] 内容处理完成, 立即调用completed API');
                    const notifyUrl = `${API_BASE_URL}/chapters/generate/content/completed?planId=${planId}`;
                    console.log('[CRITICAL] 通知内容已消费, URL:', notifyUrl);
                    const response = await fetch(notifyUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    if (!response.ok) {
                      console.error(`[ERROR] 通知内容消费完成失败: ${response.status}`);
                    } else {
                      console.log('[CRITICAL] 内容消费通知成功, 将继续轮询');
                      // 通知成功后，不需要停止轮询，会继续下一次progress检查
                      // 如果state仍然为2，将会再次获取新的内容
                      
                      // 新增：每次成功获取内容后自动保存当前内容
                      console.log('[IMPORTANT] 内容块处理完成后自动保存');
                      console.log('[DEBUG CONTENT] 完成通知后 - 当前内容长度:', content.length);
                      
                      // 捕获当前content确保是最新的
                      setTimeout(() => {
                        console.log('[DEBUG CONTENT] 延迟保存 - 当前内容长度:', content.length);
                        console.log('[DEBUG CONTENT] 延迟保存 - contentRef长度:', contentRef.current.length);
                        debouncedSave(contentRef.current); // 使用contentRef的值确保最新内容
                      }, 100);
                    }
                  } else {
                    console.error('[ERROR] 内容未能成功处理');
                  }
                  
                } catch (partialError) {
                  console.error('[ERROR] 获取内容错误:', partialError);
                } finally {
                  // 完成内容获取，无论成功失败，重置标记
                  console.log('[IMPORTANT] 内容获取流程结束, 解除获取标记');
                  isFetchingContentRef.current = false;
                }
              } else {
                if (isFetchingContentRef.current) {
                  console.log('[DEBUG] 已有内容获取进行中, 跳过');
                } else {
                  console.log('[DEBUG] 目前没有新内容可获取');
                }
              }
              break;
            case 3:
              console.log('[IMPORTANT] 生成完成, 停止轮询');
              // 已完成：停止轮询
              localStorage.removeItem('generation_polling_active');
              localStorage.removeItem('current_generation_plan_id');
              setPollingTimestamp(0); // 重置时间戳
              setLastGeneratedContentId(""); // 重置内容ID
              
              // 设置进度为100%
              setGenerationProgress(100);
              setGenerationMessage(""); // 清除消息
              toast.success("生成完成！");
              
              // 完成内容生成标记（不再继续轮询）
              setIsGenerating(false);
              
              // 新增：生成完成时自动保存当前内容
              console.log('[IMPORTANT] 生成完成后自动保存内容');
              console.log('[DEBUG CONTENT] case 3 - 当前内容长度:', content.length);
              console.log('[DEBUG CONTENT] case 3 - contentRef当前内容长度:', contentRef.current.length);
              // 取消任何待处理的自动保存
              debouncedSave.cancel();
              // 获取当前最新content并保存
              const latestContent = contentRef.current; // Use ref for most up-to-date value
              console.log('[DEBUG CONTENT] case 3 - 保存时的内容长度:', latestContent.length);
              // 直接调用保存函数，确保包含所有流式生成的内容
              await saveContent(latestContent);
              break;
            default:
              console.log('[DEBUG] 未知状态:', progressData.data?.state);
              if (progressData.data?.state > 3) {
                // 未知或错误状态，停止轮询
                console.log('[DEBUG] 由于未知/错误状态停止轮询');
                localStorage.removeItem('generation_polling_active');
                localStorage.removeItem('current_generation_plan_id');
                setPollingTimestamp(0);
                setLastGeneratedContentId(""); // 重置内容ID
                const errorMessage = progressData.data?.message || "未知错误";
                toast.error(`生成过程异常: ${errorMessage}`);
                setIsGenerating(false);
                setGenerationMessage(""); // 清除消息
              }
              break;
          }
        } else {
          // API 请求本身出错
          console.log('[ERROR] API错误响应:', progressData);
          throw new Error("获取进度失败: " + (progressData.message || "未知错误"));
        }
      } catch (error: any) {
        console.error('[ERROR] 进度检查错误:', error);
        toast.error(error.message || "生成过程中出错");
        localStorage.removeItem('generation_polling_active');
        localStorage.removeItem('current_generation_plan_id');
        setPollingTimestamp(0); // 重置时间戳
        setLastGeneratedContentId(""); // 重置内容ID
        setIsGenerating(false);
        setGenerationMessage(""); // 清除消息
        // 出现错误时复位标记
        isFetchingContentRef.current = false;
      }
    };
    
    // 立即执行一次
    console.log('[DEBUG] 执行初始进度检查');
    checkProgress();
    
    // 设置定时器定期检查
    console.log('[DEBUG] 设置轮询间隔定时器');
    const intervalId = setInterval(() => {
      console.log('[DEBUG] 轮询触发, 检查进度...');
      checkProgress();
    }, 2000);
    
    // 清理函数
    return () => {
      console.log('[DEBUG] 清理轮询定时器');
      clearInterval(intervalId);
      // 重置时间戳但不清除状态，让状态由业务逻辑处理
      setPollingTimestamp(0);
      setLastGeneratedContentId(""); // 重置内容ID
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, pollingTimestamp]);

  // 监听 Esc 键退出全屏
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isGenerating) return;
    setTimeout(() => {
      if (viewMode === "edit" && editorRef.current) {
        editorRef.current.scrollTop = editorRef.current.scrollHeight;
      } else if (viewMode === "preview" && editorContainerRef.current) {
        editorContainerRef.current.scrollTo({ top: editorContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 0);
  }, [content, isGenerating, viewMode]);

  // 清理函数，确保组件卸载时清除所有状态
  useEffect(() => {
    return () => {
      // 组件卸载时清除生成状态
      localStorage.removeItem('current_generation_plan_id');
      localStorage.removeItem('generation_polling_active');
      setLastGeneratedContentId(""); // 重置内容ID
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-muted-foreground">加载章节中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-md bg-red-50 p-4 text-center dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  if (!chapterId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">请选择一个章节开始编辑</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${isAiPanelOpen ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1'} ${isFullscreen ? 'fixed inset-0 z-[9999] bg-background rounded-none shadow-none !p-0' : ''}`}>
      <div className="flex flex-col rounded-lg border">
        <div className="flex items-center border-b p-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium">{chapter?.title || "未命名章节"}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{chapter?.status || "草稿"}</span>
              {lastSaved && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    上次保存: {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              )}
              {isSaving && (
                <span className="ml-2 text-xs text-muted-foreground">
                  正在保存...
                </span>
              )}
            </div>
          </div>
          {/* 字体大小下拉菜单 */}
          <div className="flex items-center gap-2 ml-2">
            <FaFont className="text-muted-foreground mr-1" />
            <select
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="rounded border px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ minWidth: 90 }}
              aria-label="字体大小"
            >
              <option value={14}>较小（14px）</option>
              <option value={16}>标准（16px）</option>
              <option value={18}>较大（18px）</option>
              <option value={20}>大（20px）</option>
              <option value={24}>超大（24px）</option>
            </select>
          </div>
          {/* 全屏按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setIsFullscreen(f => !f)}
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            {isFullscreen ? <IconMinimize className="h-4 w-4" /> : <IconMaximize className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === "edit" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("edit")}
              >
                <IconEdit className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button 
                variant={viewMode === "preview" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("preview")}
              >
                <IconEye className="h-4 w-4 mr-1" />
                预览
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              <IconDeviceFloppy className="mr-1 h-4 w-4" />
              保存
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadHistory}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? "加载中..." : "历史记录"}
            </Button>
          </div>
        </div>
        
        <div data-color-mode="light" className="flex-1 w-full">
          {viewMode === "edit" && (
            <div className="w-full">
              <textarea
                ref={setEditorReference}
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-[75vh] p-4 resize-none border-none bg-transparent focus:outline-none focus:ring-0"
                placeholder="开始写作您的小说内容..."
                spellCheck={false}
                style={{ fontSize: fontSize, lineHeight: 1.8 }}
              />
            </div>
          )}
          {viewMode === "preview" && (
            <div
              className="h-[75vh] p-4 overflow-auto prose prose-sm max-w-none"
              style={{ fontSize: fontSize, lineHeight: 1.8, textIndent: 24 }}
              ref={editorContainerRef}
            >
              <MDPreview
                source={content.replace(/^( {4})/gm, "")}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between border-t p-3">
          <div className="text-sm text-muted-foreground">
            字数：{wordCount}
            {chapter?.targetWordCount && (
              <span className="ml-2">
                / 目标：{chapter.targetWordCount}
                {wordCount >= (chapter.targetWordCount || 0) && (
                  <span className="ml-1 text-green-500">✓</span>
                )}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            >
              <IconRobot className="mr-2 h-4 w-4" />
              {isAiPanelOpen ? "隐藏AI助手" : "显示AI助手"}
            </Button>
            <Button 
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "保存内容"}
            </Button>
          </div>
        </div>
      </div>

      {isAiPanelOpen && (
        <div className="rounded-lg border">
          <div className="border-b p-3">
            <h3 className="font-semibold">AI 写作助手</h3>
          </div>
          <div className="space-y-4 p-4">
            {/* 历史记录 */}
            <div className="rounded-md bg-accent/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">章节历史</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadHistory}
                  disabled={isLoadingHistory}
                >
                  {isLoadingHistory ? "加载中..." : "查看历史"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                查看和恢复章节的历史版本。
              </p>
            </div>
            
            {/* 未完成的情节 */}
            {incompletePlot && (
              <div className="rounded-md bg-accent/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">当前需要创作的情节</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingPlot(!isEditingPlot)}
                  >
                    {isEditingPlot ? "取消" : "编辑"}
                  </Button>
                </div>
                
                {isEditingPlot ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                      placeholder="情节标题"
                      value={plotTitle}
                      onChange={e => setPlotTitle(e.target.value)}
                    />
                    
                    <textarea
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                      rows={3}
                      placeholder="情节描述"
                      value={plotDescription}
                      onChange={e => setPlotDescription(e.target.value)}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">类型</label>
                        <select
                          className="w-full rounded border bg-background px-2 py-1 text-sm"
                          value={plotType}
                          onChange={e => setPlotType(e.target.value)}
                        >
                          <option value="">选择类型</option>
                          <option value="开端">开端</option>
                          <option value="发展">发展</option>
                          <option value="高潮">高潮</option>
                          <option value="结局">结局</option>
                          <option value="转折">转折</option>
                          <option value="冲突">冲突</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground">字数目标</label>
                        <input
                          type="number"
                          className="w-full rounded border bg-background px-2 py-1 text-sm"
                          placeholder="字数目标"
                          value={plotWordCountGoal || ""}
                          onChange={e => setPlotWordCountGoal(e.target.value ? Number(e.target.value) : undefined)}
                          min={0}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">模板</label>
                      <select
                        className="w-full rounded border bg-background px-2 py-1 text-sm"
                        value={plotTemplateId}
                        onChange={e => setPlotTemplateId(e.target.value)}
                        disabled={isLoadingData}
                      >
                        <option value="">选择模板</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">关联角色</label>
                      <select
                        multiple
                        className="w-full rounded border bg-background px-2 py-1 text-sm min-h-[60px]"
                        value={plotCharacterIds}
                        onChange={e => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setPlotCharacterIds(selected)
                        }}
                        disabled={isLoadingData}
                      >
                        {characters.map(character => (
                          <option key={character.id} value={character.id}>
                            {character.name} ({character.role || "未知角色"})
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-muted-foreground mt-1">
                        按住Ctrl/Cmd键可多选
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">关联条目</label>
                      <select
                        multiple
                        className="w-full rounded border bg-background px-2 py-1 text-sm min-h-[60px]"
                        value={plotItemIds}
                        onChange={e => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setPlotItemIds(selected)
                        }}
                        disabled={isLoadingData}
                      >
                        {entries.map(entry => (
                          <option key={entry.id} value={entry.id}>
                            {entry.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-muted-foreground mt-1">
                        按住Ctrl/Cmd键可多选
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" onClick={savePlot} disabled={isLoadingData}>
                        {isLoadingData ? "加载中..." : "保存"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditPlot}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{incompletePlot.title || "未命名情节"}</div>
                    <div className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                      <div className="break-words">
                        {incompletePlot.description || "暂无描述"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">类型: </span>
                        <span>{incompletePlot.type || "未设置"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">字数目标: </span>
                        <span>{incompletePlot.wordCountGoal || "未设置"}</span>
                      </div>
                    </div>
                    
                    {incompletePlot.templateId && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">模板: </span>
                        <span className="break-words">
                          {templates.find(t => t.id === incompletePlot.templateId)?.name || "未知模板"}
                        </span>
                      </div>
                    )}
                    
                    {incompletePlot.characterIds && incompletePlot.characterIds.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">关联角色: </span>
                        <div className="break-words mt-1">
                          {incompletePlot.characterIds
                            .map(id => characters.find(c => c.id === id)?.name)
                            .filter(Boolean)
                            .join(", ") || "未找到角色"}
                        </div>
                      </div>
                    )}
                    
                    {incompletePlot.itemIds && incompletePlot.itemIds.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">关联条目: </span>
                        <div className="break-words mt-1">
                          {incompletePlot.itemIds
                            .map(id => entries.find(e => e.id === id)?.name)
                            .filter(Boolean)
                            .join(", ") || "未找到条目"}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      完成度: {incompletePlot.completionPercentage || 0}%
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="rounded-md bg-accent/50 p-3">
              <h4 className="font-medium">情感节奏</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                分析当前章节的情感起伏和节奏变化，提供优化建议。
              </p>
              <Button size="sm" className="mt-2 w-full" onClick={() => toast('情感节奏功能开发中，敬请期待')}>分析情感节奏</Button>
            </div>
            <div className="rounded-md bg-accent/50 p-3">
              <h4 className="font-medium">内容生成</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                根据现有内容，自动生成后续情节。
              </p>
              {isGenerating ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">生成进度：{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  {generationMessage && (
                    <div className="mt-2 mb-3 max-h-32 overflow-y-auto bg-muted/30 p-2 rounded text-xs whitespace-pre-wrap">
                      {generationMessage}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      正在生成中，请稍候...
                    </p>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        // 取消生成
                        localStorage.removeItem('current_generation_plan_id');
                        localStorage.removeItem('generation_polling_active');
                        setIsGenerating(false);
                        setGenerationMessage(""); // 清除消息
                        toast.success("已取消内容生成");
                      }}
                    >
                      取消生成
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" className="mt-2 w-full" onClick={() => setShowGenOptions(true)}>生成内容</Button>
              )}
              {showGenOptions && !isGenerating && (
                <div className="mt-3 space-y-2">
                  {/* 创作模式选择 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">创作模式</label>
                    <div className="space-y-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="freedom"
                          checked={!genFreedom}
                          onChange={() => setGenFreedom(false)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">按照未完成的情节创作（推荐）</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="freedom"
                          checked={genFreedom}
                          onChange={() => setGenFreedom(true)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">自由创作</span>
                      </label>
                    </div>
                  </div>
                  
                  <textarea
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    rows={2}
                    placeholder="可选：写作提示建议（如风格、情节方向等）"
                    value={genPrompt}
                    onChange={e => setGenPrompt(e.target.value)}
                  />
                  
                  {/* 只有在自由创作模式下才显示字数建议 */}
                  {genFreedom && (
                    <input
                      type="number"
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                      placeholder="可选：字数建议（如500）"
                      value={genWordCount}
                      onChange={e => setGenWordCount(e.target.value)}
                      min={0}
                    />
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleGenerateContent({ 
                          prompt: genPrompt, 
                          wordCount: genFreedom ? genWordCount : undefined, // 只有自由创作时才传递字数建议
                          freedom: genFreedom 
                        })
                        setShowGenOptions(false)
                        setGenPrompt("")
                        setGenWordCount("")
                        setGenFreedom(false) // 重置为默认值
                      }}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "生成中..." : "确认生成"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowGenOptions(false)
                        setGenPrompt("")
                        setGenWordCount("")
                        setGenFreedom(false) // 重置为默认值
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-md bg-accent/50 p-3">
              <h4 className="font-medium">插入模板</h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 场景描写\n\n阳光透过窗帘洒在木地板上，形成一片温暖的光斑。房间里弥漫着咖啡的香气，墙上的挂钟滴答作响，标记着时间的流逝。'
                    const newContent = content + '\n\n' + template
                    setContent(newContent)
                    contentRef.current = newContent // 同步更新ref
                    countWords(newContent)
                    debouncedSave(newContent) // 触发保存
                  }}
                >
                  场景描写
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 人物对话\n\n"你真的决定要走了吗？" 她轻声问道，眼睛里含着泪水。\n\n他深吸一口气，"我必须这么做，为了我们两个人。"\n\n"但是..." 她的声音哽咽了。'
                    const newContent = content + '\n\n' + template
                    setContent(newContent)
                    contentRef.current = newContent // 同步更新ref
                    countWords(newContent)
                    debouncedSave(newContent) // 触发保存
                  }}
                >
                  人物对话
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 内心独白\n\n我站在窗前，看着外面的雨滴敲打着玻璃。为什么每次做出决定都如此艰难？也许是因为我太在乎后果，太担心失败。但人生不就是一系列选择和冒险吗？'
                    const newContent = content + '\n\n' + template
                    setContent(newContent)
                    contentRef.current = newContent // 同步更新ref
                    countWords(newContent)
                    debouncedSave(newContent) // 触发保存
                  }}
                >
                  内心独白
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 转场\n\n---\n\n三个月后，当春天的第一缕阳光照耀着城市。'
                    const newContent = content + '\n\n' + template
                    setContent(newContent)
                    contentRef.current = newContent // 同步更新ref
                    countWords(newContent)
                    debouncedSave(newContent) // 触发保存
                  }}
                >
                  时间转场
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 历史记录弹窗 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">章节历史记录</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {!Array.isArray(historyVersions) || historyVersions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  暂无历史记录
                </div>
              ) : (
                <div className="space-y-3">
                  {historyVersions.map((version, index) => (
                    <div key={version.timestamp || index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          版本 {index + 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {version.createdAt ? new Date(version.createdAt).toLocaleString() : version.timestamp}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        字数: {version.wordCount || "未知"}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewHistoryVersion(version)}
                        >
                          预览
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => restoreHistoryVersion(version)}
                        >
                          恢复
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteHistoryVersion(version)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 历史版本预览弹窗 */}
      {showHistoryPreview && selectedHistoryVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">
                历史版本预览 - {selectedHistoryVersion.createdAt ? 
                  new Date(selectedHistoryVersion.createdAt).toLocaleString() : 
                  selectedHistoryVersion.timestamp}
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => restoreHistoryVersion(selectedHistoryVersion)}
                >
                  恢复此版本
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistoryPreview(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="mb-4 text-sm text-muted-foreground">
                字数: {selectedHistoryVersion.wordCount || "未知"}
              </div>
              
              <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {selectedHistoryVersion.content || "内容为空"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 