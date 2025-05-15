"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/app/components/ui/button"
import { IconRobot, IconDeviceFloppy, IconEye, IconEdit, IconMaximize, IconMinimize } from "@tabler/icons-react"
import { FaFont } from "react-icons/fa"
import { fetchChapter, updateChapter } from "@/app/lib/api/chapter"
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
  const [chapter, setChapter] = useState<any>(null)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(false)
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [pollingTimestamp, setPollingTimestamp] = useState<number>(0)
  const [lastGeneratedContentId, setLastGeneratedContentId] = useState<string>("")

  // 通知后端内容已消费完成
  const notifyContentConsumed = async (planId: string) => {
    try {
      const notifyUrl = `${API_BASE_URL}/chapters/generate/content/completed?planId=${planId}`;
      console.log('Notifying content consumed, URL:', notifyUrl);
      const response = await fetch(notifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`通知内容消费完成失败: ${response.status}`);
      } else {
        console.log('Content consumption notification successful');
      }
    } catch (error) {
      console.error('Error notifying content consumption:', error);
    }
  };
  
  // 获取生成内容并立即标记完成
  const getContentAndNotifyCompletion = async (planId: string) => {
    try {
      // 获取生成的内容
      const contentUrl = `${API_BASE_URL}/chapters/generate/content?planId=${planId}`;
      console.log('Fetching content, URL:', contentUrl);
      const contentRes = await fetch(contentUrl);
      
      if (!contentRes.ok) {
        throw new Error(`获取内容失败: ${contentRes.status}`);
      }
      
      // 检查响应类型并处理内容
      const contentType = contentRes.headers.get('content-type');
      console.log('Content response type:', contentType);
      
      let contentProcessed = false;
      
      // 处理JSON响应
      if (contentType && contentType.includes('application/json')) {
        console.log('Processing JSON content response');
        const contentData = await contentRes.json();
        
        if (contentData.code !== 200 || !contentData.data) {
          throw new Error("获取内容失败: " + (contentData.message || "未知错误"));
        }
        
        const generatedContent = contentData.data;
        console.log('Generated content length:', generatedContent.length);
        setContent(prev => {
          const next = prev + generatedContent;
          countWords(next);
          return next;
        });
        
        contentProcessed = true;
        toast.success("内容生成完成");
      } 
      // 处理流式响应
      else if (contentRes.body) {
        console.log('Processing stream content response');
        const reader = contentRes.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            console.log('Received content chunk, length:', chunk.length);
            setContent(prev => {
              const next = prev + chunk;
              countWords(next);
              return next;
            });
          }
          done = doneReading;
        }
        
        contentProcessed = true;
        console.log('Stream content complete');
        toast.success("内容生成完成");
      }
      
      if (contentProcessed) {
        // 立即调用completed - 关键修改，确保在处理完内容后立即调用
        console.log('Content processed successfully, immediately calling completed API');
        await notifyContentConsumed(planId);
      }
      
    } catch (error: any) {
      console.error('Error fetching content:', error);
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
        const data = await fetchChapter(chapterId)
        setChapter(data)
        setContent(data.content || "")
        countWords(data.content || "")
      } catch (err: any) {
        setError(err.message || "加载章节失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadChapter()
  }, [chapterId])

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
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart, selectionEnd - (lines.length - newLines.filter((l, i) => lines[i].startsWith(INDENT)).length) * INDENT.length)
          }, 0)
        } else {
          // Tab: 每行前加缩进
          const newLines = lines.map(line => INDENT + line)
          const newValue = value.slice(0, selectionStart) + newLines.join('\n') + value.slice(selectionEnd)
          setContent(newValue)
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
            setTimeout(() => {
              textarea.setSelectionRange(selectionStart - INDENT.length, selectionStart - INDENT.length)
            }, 0)
          }
        } else {
          // Tab: 插入缩进
          const newValue = value.substring(0, selectionStart) + INDENT + value.substring(selectionEnd)
          setContent(newValue)
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
        
      const updatedChapter = {
        ...chapter,
        content: text,
        wordCount: wordCount
      }
      await updateChapter(chapterId, updatedChapter)
      setLastSaved(new Date())
    } catch (err) {
      console.error("保存失败:", err)
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
    
    // 取消任何待处理的自动保存
    debouncedSave.cancel()
    await saveContent(content)
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
  const handleGenerateContent = async ({ prompt, wordCount }: { prompt?: string; wordCount?: string }) => {
    if (!chapterId || !projectId) return;
    console.log('Start content generation process');
    setIsGenerating(true);
    setGenerationProgress(0);
    setLastGeneratedContentId(""); // 重置上一次生成的内容ID
    
    try {
      const params = new URLSearchParams({
        chapterId,
        projectId,
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
    console.log('Polling useEffect triggered, isGenerating:', isGenerating, 'timestamp:', pollingTimestamp);
    if (!isGenerating && pollingTimestamp === 0) {
      console.log('Not generating and no forced check, skipping polling setup');
      return;
    }
    
    const planId = localStorage.getItem('current_generation_plan_id');
    console.log('planId from localStorage:', planId);
    if (!planId) {
      console.log('No planId found, skipping polling setup');
      return;
    }
    
    const isPollingActive = localStorage.getItem('generation_polling_active') === 'true';
    console.log('isPollingActive:', isPollingActive);
    if (!isPollingActive) {
      console.log('Polling not active, skipping polling setup');
      return;
    }
    
    console.log('Setting up polling for planId:', planId);
    
    // 立即执行一次检查
    const checkProgress = async () => {
      console.log('Running progress check for planId:', planId);
      try {
        const progressUrl = `${API_BASE_URL}/chapters/generate/progress?planId=${planId}`;
        console.log('Checking progress URL:', progressUrl);
        const progressRes = await fetch(progressUrl);
        const progressData = await progressRes.json();
        
        console.log('Progress response:', progressData);
        
        // 显示进度信息
        if (progressData.data?.progress) {
          const progress = parseInt(progressData.data.progress);
          console.log('Progress value:', progress);
          setGenerationProgress(progress);
          // 不用每次都显示toast，避免过多提示
          if (progress % 20 === 0) { // 每增加20%显示一次
            toast.success(`生成进度: ${progress}%`);
          }
        }
        
        // 根据返回的状态码显示不同的状态信息
        if (progressData.data?.stateMessage) {
          console.log('State message:', progressData.data.stateMessage);
        }
        
        // 根据API响应，判断生成状态
        // 状态枚举： 0-计划中，1-执行中，2-生成中，3-已完成
        if (progressData.code === 200) {
          // 显示对应的状态描述
          switch (progressData.data?.state) {
            case 0:
              console.log('Planning stage');
              break;
            case 1:
              console.log('In progress stage');
              break;
            case 2:
              console.log('Generating content');
              // 根据新的需求：
              // 1. 在/generate/content生成中的时候，不需要调用progress和content
              // 2. 当content完成后必须立即调用completed
              // 3. 完成后继续progress，state为2时继续生成

              // 当有新内容时，获取内容并立即调用completed
              if (progressData.data?.hasContent) {
                console.log('Has content available, getting content and calling completed immediately');
                
                // 检查是否有唯一标识符，避免重复获取相同内容
                const contentId = progressData.data?.contentId || '';
                
                // 如果已经获取过这部分内容，则跳过
                if (contentId && contentId === lastGeneratedContentId) {
                  console.log('Already fetched this content batch, skipping');
                  break;
                }
                
                // 记录当前内容ID，避免重复处理
                if (contentId) {
                  setLastGeneratedContentId(contentId);
                }
                
                try {
                  // 直接获取内容
                  const contentUrl = `${API_BASE_URL}/chapters/generate/content?planId=${planId}`;
                  console.log('Directly fetching content, URL:', contentUrl);
                  const contentRes = await fetch(contentUrl);
                  
                  if (!contentRes.ok) {
                    throw new Error(`获取内容失败: ${contentRes.status}`);
                  }
                  
                  const contentType = contentRes.headers.get('content-type');
                  let contentProcessed = false;
                  
                  // 处理JSON响应
                  if (contentType && contentType.includes('application/json')) {
                    console.log('Processing JSON content response');
                    const contentData = await contentRes.json();
                    
                    if (contentData.code !== 200 || !contentData.data) {
                      throw new Error("获取内容失败: " + (contentData.message || "未知错误"));
                    }
                    
                    const generatedContent = contentData.data;
                    console.log('Generated content length:', generatedContent.length);
                    setContent(prev => {
                      const next = prev + generatedContent;
                      countWords(next);
                      return next;
                    });
                    
                    contentProcessed = true;
                    toast.success("内容生成完成");
                  } 
                  // 处理流式响应
                  else if (contentRes.body) {
                    console.log('Processing stream content response');
                    const reader = contentRes.body.getReader();
                    const decoder = new TextDecoder();
                    let done = false;
                    let partialChunk = "";
                    
                    while (!done) {
                      const { value, done: doneReading } = await reader.read();
                      if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        partialChunk += chunk;
                        console.log('Received content chunk, length:', chunk.length);
                      }
                      done = doneReading;
                    }
                    
                    if (partialChunk) {
                      setContent(prev => {
                        const next = prev + partialChunk;
                        countWords(next);
                        return next;
                      });
                      
                      contentProcessed = true;
                      toast.success("已获取生成内容");
                    }
                  }
                  
                  // 内容处理完成后立即调用completed
                  if (contentProcessed) {
                    console.log('Content processed, immediately calling completed API');
                    const notifyUrl = `${API_BASE_URL}/chapters/generate/content/completed?planId=${planId}`;
                    console.log('Notifying content consumed, URL:', notifyUrl);
                    const response = await fetch(notifyUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    if (!response.ok) {
                      console.error(`通知内容消费完成失败: ${response.status}`);
                    } else {
                      console.log('Content consumption notification successful');
                    }
                  }
                  
                } catch (partialError) {
                  console.error('Error fetching content:', partialError);
                }
              }
              break;
            case 3:
              console.log('Generation completed, stopping polling');
              // 已完成：停止轮询并获取内容
              localStorage.removeItem('generation_polling_active');
              localStorage.removeItem('current_generation_plan_id');
              setPollingTimestamp(0); // 重置时间戳
              setLastGeneratedContentId(""); // 重置内容ID
              
              // 设置进度为100%
              setGenerationProgress(100);
              toast.success("生成完成，正在获取内容...");
              
              // 直接获取内容并立即调用completed
              try {
                // 获取生成的内容
                const contentUrl = `${API_BASE_URL}/chapters/generate/content?planId=${planId}`;
                console.log('Fetching final content, URL:', contentUrl);
                const contentRes = await fetch(contentUrl);
                
                if (!contentRes.ok) {
                  throw new Error(`获取内容失败: ${contentRes.status}`);
                }
                
                const contentType = contentRes.headers.get('content-type');
                let contentProcessed = false;
                
                // 处理JSON响应
                if (contentType && contentType.includes('application/json')) {
                  console.log('Processing JSON final content response');
                  const contentData = await contentRes.json();
                  
                  if (contentData.code !== 200 || !contentData.data) {
                    throw new Error("获取内容失败: " + (contentData.message || "未知错误"));
                  }
                  
                  const generatedContent = contentData.data;
                  console.log('Final generated content length:', generatedContent.length);
                  setContent(prev => {
                    const next = prev + generatedContent;
                    countWords(next);
                    return next;
                  });
                  
                  contentProcessed = true;
                  toast.success("内容生成完成");
                } 
                // 处理流式响应
                else if (contentRes.body) {
                  console.log('Processing stream content response for final content');
                  const reader = contentRes.body.getReader();
                  const decoder = new TextDecoder();
                  let done = false;
                  let finalContent = "";
                  
                  while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    if (value) {
                      const chunk = decoder.decode(value, { stream: true });
                      finalContent += chunk;
                      console.log('Received final content chunk, length:', chunk.length);
                    }
                    done = doneReading;
                  }
                  
                  if (finalContent) {
                    setContent(prev => {
                      const next = prev + finalContent;
                      countWords(next);
                      return next;
                    });
                    
                    contentProcessed = true;
                    toast.success("内容生成完成");
                  }
                }
                
                // 内容处理完成后立即调用completed
                if (contentProcessed) {
                  console.log('Final content processed, immediately calling completed API');
                  const notifyUrl = `${API_BASE_URL}/chapters/generate/content/completed?planId=${planId}`;
                  console.log('Notifying content consumed, URL:', notifyUrl);
                  const response = await fetch(notifyUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (!response.ok) {
                    console.error(`通知内容消费完成失败: ${response.status}`);
                  } else {
                    console.log('Content consumption notification successful');
                  }
                }
              } catch (error: any) {
                console.error('Error fetching final content:', error);
                toast.error(error.message || "获取最终内容失败");
              }
              
              // 完成内容生成标记（不再继续轮询）
              setIsGenerating(false);
              break;
            default:
              console.log('Unknown state:', progressData.data?.state);
              if (progressData.data?.state > 3) {
                // 未知或错误状态，停止轮询
                console.log('Stopping polling due to unknown/error state');
                localStorage.removeItem('generation_polling_active');
                localStorage.removeItem('current_generation_plan_id');
                setPollingTimestamp(0);
                setLastGeneratedContentId(""); // 重置内容ID
                const errorMessage = progressData.data?.message || "未知错误";
                toast.error(`生成过程异常: ${errorMessage}`);
                setIsGenerating(false);
              }
              break;
          }
        } else {
          // API 请求本身出错
          console.log('API error response:', progressData);
          throw new Error("获取进度失败: " + (progressData.message || "未知错误"));
        }
      } catch (error: any) {
        console.error('Progress check error:', error);
        toast.error(error.message || "生成过程中出错");
        localStorage.removeItem('generation_polling_active');
        localStorage.removeItem('current_generation_plan_id');
        setPollingTimestamp(0); // 重置时间戳
        setLastGeneratedContentId(""); // 重置内容ID
        setIsGenerating(false);
      }
    };
    
    // 立即执行一次
    console.log('Executing initial progress check');
    checkProgress();
    
    // 设置定时器定期检查
    console.log('Setting up interval timer');
    const intervalId = setInterval(() => {
      console.log('Interval triggered, checking progress...');
      checkProgress();
    }, 2000);
    
    // 清理函数
    return () => {
      console.log('Cleaning up interval timer');
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
                  <textarea
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    rows={2}
                    placeholder="可选：写作提示建议（如风格、情节方向等）"
                    value={genPrompt}
                    onChange={e => setGenPrompt(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    placeholder="可选：字数建议（如500）"
                    value={genWordCount}
                    onChange={e => setGenWordCount(e.target.value)}
                    min={0}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleGenerateContent({ prompt: genPrompt, wordCount: genWordCount })
                        setShowGenOptions(false)
                        setGenPrompt("")
                        setGenWordCount("")
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
                    setContent(content + '\n\n' + template)
                    countWords(content + '\n\n' + template)
                  }}
                >
                  场景描写
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 人物对话\n\n"你真的决定要走了吗？" 她轻声问道，眼睛里含着泪水。\n\n他深吸一口气，"我必须这么做，为了我们两个人。"\n\n"但是..." 她的声音哽咽了。'
                    setContent(content + '\n\n' + template)
                    countWords(content + '\n\n' + template)
                  }}
                >
                  人物对话
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 内心独白\n\n我站在窗前，看着外面的雨滴敲打着玻璃。为什么每次做出决定都如此艰难？也许是因为我太在乎后果，太担心失败。但人生不就是一系列选择和冒险吗？'
                    setContent(content + '\n\n' + template)
                    countWords(content + '\n\n' + template)
                  }}
                >
                  内心独白
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = '## 转场\n\n---\n\n三个月后，当春天的第一缕阳光照耀着城市。'
                    setContent(content + '\n\n' + template)
                    countWords(content + '\n\n' + template)
                  }}
                >
                  时间转场
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 