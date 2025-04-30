"use client"

export const runtime = 'edge';

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import NovelEditor from "@/app/components/novel-editor/novel-editor"
import ChapterSidebar from "@/app/components/novel-editor/chapter-sidebar"
import { CharacterIcon } from "@/app/components/ui/icons"
import CharacterForm from "@/app/components/novel-editor/character-form"
import type { Character } from "@/app/types"
import PlotForm from "@/app/components/novel-editor/plot-form"
import type { PlotElement, Chapter } from "@/app/types"
import ChapterForm from "@/app/components/novel-editor/chapter-form"
import OutlineForm, { OutlineNode } from "@/app/components/novel-editor/outline-form"
import { fetchProject, Project } from "@/app/lib/api/project"
import { fetchChaptersPage, createChapter, updateChapter, deleteChapter } from '@/app/lib/api/chapter'
import { fetchCharactersByProject, createCharacter, updateCharacter, deleteCharacter as deleteCharacterApi } from '@/app/lib/api/character'
import { deletePlot, fetchPlotsPage, createPlot, updatePlot } from '@/app/lib/api/plot'
import { fetchOutlinePlotPointsPage, createOutlinePlotPoint, updateOutlinePlotPoint, deleteOutlinePlotPoint } from '@/app/lib/api/outline-plot-point'
import { fetchCharacter } from '@/app/lib/api/character'
import { toast } from 'react-hot-toast'

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<string>("write")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeChapterId, setActiveChapterId] = useState<string>("")
  const [showChapterSidebar, setShowChapterSidebar] = useState<boolean>(true)
  const [characters, setCharacters] = useState<Character[]>([])
  const [isCharactersLoading, setIsCharactersLoading] = useState(false)
  const [charactersError, setCharactersError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete';
    character?: Character;
  }>({
    isOpen: false,
    mode: 'add',
  })
  const [plots, setPlots] = useState<PlotElement[]>([])
  const [isPlotsLoading, setIsPlotsLoading] = useState(false)
  const [plotsError, setPlotsError] = useState<string | null>(null)
  const [plotModalState, setPlotModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete';
    plot?: PlotElement;
  }>({
    isOpen: false,
    mode: 'add',
  })
  const [outlines, setOutlines] = useState<OutlineNode[]>([])
  const [isOutlinesLoading, setIsOutlinesLoading] = useState(false)
  const [outlinesError, setOutlinesError] = useState<string | null>(null)
  const [outlineModalState, setOutlineModalState] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; outline?: OutlineNode }>({
    isOpen: false,
    mode: 'add',
  })
  const [chapterModalState, setChapterModalState] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; chapter?: Chapter }>({
    isOpen: false,
    mode: 'add',
  })
  const [deleteChapterState, setDeleteChapterState] = useState<{ isOpen: boolean; chapter?: Chapter }>({ isOpen: false })
  const [deleteOutlineState, setDeleteOutlineState] = useState<{ isOpen: boolean; outline?: OutlineNode }>({ isOpen: false })
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState<string | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchProject(params.id)
      .then(setProject)
      .catch(err => setHasError(err.message || '加载失败'))
    // 加载章节列表
    fetchChapters()
  }, [params.id])

  const fetchChapters = async () => {
    setIsLoading(true)
    try {
      const res = await fetchChaptersPage({ projectId: params.id, page: 1, pageSize: 100 })
      setChapters(res.data.records)
    } catch (err: any) {
      setHasError(err.message || '章节加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 拉取角色列表
  const fetchCharacters = async () => {
    setIsCharactersLoading(true)
    setCharactersError(null)
    try {
      const data = await fetchCharactersByProject(params.id)
      setCharacters(data)
    } catch (err: any) {
      setCharactersError(err.message || '角色加载失败')
    } finally {
      setIsCharactersLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacters()
  }, [params.id])

  const toggleChapterSidebar = () => {
    setShowChapterSidebar(!showChapterSidebar)
  }

  const handleCharacterClick = () => {
    // Implement character management dialog
    alert("Opening character management")
  }

  const handleWorldClick = () => {
    // Implement world building dialog
    alert("Opening world building")
  }

  const handleAnalysisClick = () => {
    // Implement analysis dialog
    alert("Opening analysis tools")
  }

  const handleSave = () => {
    // Implement save functionality
    alert("Content saved successfully")
  }

  const handleAddCharacter = () => {
    setModalState({ isOpen: true, mode: 'add' })
  }

  const handleSaveCharacter = async (character: Character) => {
    setIsCharactersLoading(true)
    setCharactersError(null)
    try {
      if (modalState.mode === 'add') {
        await createCharacter({ ...character, projectId: params.id })
      } else if (modalState.mode === 'edit' && character.id) {
        await updateCharacter(character.id, { ...character, projectId: params.id })
      }
      await fetchCharacters()
      setModalState({ isOpen: false, mode: 'add' })
    } catch (err: any) {
      setCharactersError(err.message || '保存角色失败')
    } finally {
      setIsCharactersLoading(false)
    }
  }

  const handleCancelModal = () => {
    setModalState({ isOpen: false, mode: 'add' })
  }

  const handleEditCharacter = async (character: Character) => {
    setIsFetchingDetails(true)
    try {
      const detailedCharacter = await fetchCharacter(character.id)
      setModalState({ isOpen: true, mode: 'edit', character: detailedCharacter })
    } catch (error) {
      console.error("Failed to fetch character details:", error)
      toast.error('获取角色详情失败，请稍后再试。')
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const handleDeleteCharacter = (character: Character) => {
    setModalState({ isOpen: true, mode: 'delete', character })
  }

  const handleConfirmDelete = async () => {
    if (!modalState.character) return
    setIsCharactersLoading(true)
    setCharactersError(null)
    try {
      await deleteCharacterApi(modalState.character.id)
      await fetchCharacters()
      setModalState({ isOpen: false, mode: 'add' })
    } catch (err: any) {
      setCharactersError(err.message || '删除角色失败')
    } finally {
      setIsCharactersLoading(false)
    }
  }

  const handleAddPlot = () => {
    setPlotModalState({ isOpen: true, mode: 'add' })
  }

  const fetchPlots = async () => {
    setIsPlotsLoading(true)
    setPlotsError(null)
    try {
      const res = await fetchPlotsPage({ projectId: params.id, page: 1, pageSize: 100 })
      setPlots(res.data.records)
    } catch (err: any) {
      setPlotsError(err.message || '情节加载失败')
    } finally {
      setIsPlotsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlots()
  }, [params.id])

  const handleSavePlot = async (plot: PlotElement) => {
    setIsPlotsLoading(true)
    setPlotsError(null)
    try {
      if (plotModalState.mode === 'add') {
        await createPlot({ ...plot, projectId: params.id })
      } else if (plotModalState.mode === 'edit' && plot.id) {
        await updatePlot(plot.id, { ...plot, projectId: params.id })
      }
      await fetchPlots()
      setPlotModalState({ isOpen: false, mode: 'add' })
    } catch (err: any) {
      setPlotsError(err.message || '保存情节失败')
    } finally {
      setIsPlotsLoading(false)
    }
  }

  const handleCancelPlotModal = () => {
    setPlotModalState({ isOpen: false, mode: 'add' })
  }

  const handleEditPlot = (plot: PlotElement) => {
    setPlotModalState({ isOpen: true, mode: 'edit', plot })
  }

  const handleDeletePlot = (plot: PlotElement) => {
    setPlotModalState({ isOpen: true, mode: 'delete', plot })
  }

  const handleConfirmDeletePlot = async () => {
    if (!plotModalState.plot) return
    setIsPlotsLoading(true)
    setPlotsError(null)
    try {
      await deletePlot(plotModalState.plot.id)
      await fetchPlots()
      setPlotModalState({ isOpen: false, mode: 'add' })
    } catch (err: any) {
      setPlotsError(err.message || '删除情节失败')
    } finally {
      setIsPlotsLoading(false)
    }
  }

  const fetchOutlines = async () => {
    setIsOutlinesLoading(true)
    setOutlinesError(null)
    try {
      const res = await fetchOutlinePlotPointsPage({ projectId: params.id, page: 1, pageSize: 100 })
      setOutlines(res.data.records)
    } catch (err: any) {
      setOutlinesError(err.message || '大纲加载失败')
    } finally {
      setIsOutlinesLoading(false)
    }
  }

  useEffect(() => {
    fetchOutlines()
  }, [params.id])

  const handleSaveOutline = async (outline: OutlineNode) => {
    setIsOutlinesLoading(true)
    setOutlinesError(null)
    try {
      if (outlineModalState.mode === 'add') {
        await createOutlinePlotPoint({ ...outline, projectId: params.id })
      } else if (outlineModalState.mode === 'edit' && outline.id) {
        await updateOutlinePlotPoint(outline.id, { ...outline, projectId: params.id })
      }
      await fetchOutlines()
      setOutlineModalState({ isOpen: false, mode: 'add' })
    } catch (err: any) {
      setOutlinesError(err.message || '保存大纲失败')
    } finally {
      setIsOutlinesLoading(false)
    }
  }

  const handleConfirmDeleteOutline = async () => {
    if (!deleteOutlineState.outline) return
    setIsOutlinesLoading(true)
    setOutlinesError(null)
    try {
      await deleteOutlinePlotPoint(deleteOutlineState.outline.id)
      await fetchOutlines()
      setDeleteOutlineState({ isOpen: false })
    } catch (err: any) {
      setOutlinesError(err.message || '删除大纲失败')
    } finally {
      setIsOutlinesLoading(false)
    }
  }

  const handleAddOutline = () => {
    setOutlineModalState({ isOpen: true, mode: 'add' })
  }

  const handleEditOutline = (outline: OutlineNode) => {
    setOutlineModalState({ isOpen: true, mode: 'edit', outline })
  }

  const handleCancelOutlineModal = () => {
    setOutlineModalState({ isOpen: false, mode: 'add' })
  }

  const handleDeleteOutline = (outline: OutlineNode) => {
    setDeleteOutlineState({ isOpen: true, outline })
  }

  const handleCancelDeleteOutline = () => {
    setDeleteOutlineState({ isOpen: false })
  }

  const handleMoveOutline = (outlineId: string, direction: 'up' | 'down') => {
    const idx = outlines.findIndex(o => o.id === outlineId)
    if (idx === -1) return
    let newOutlines = [...outlines]
    if (direction === 'up' && idx > 0) {
      [newOutlines[idx - 1], newOutlines[idx]] = [newOutlines[idx], newOutlines[idx - 1]]
    } else if (direction === 'down' && idx < newOutlines.length - 1) {
      [newOutlines[idx], newOutlines[idx + 1]] = [newOutlines[idx + 1], newOutlines[idx]]
    }
    newOutlines = newOutlines.map((o, i) => ({ ...o, order: i + 1 }))
    setOutlines(newOutlines)
  }

  const handleAddChapter = () => {
    setChapterModalState({ isOpen: true, mode: 'add' })
  }

  const handleSaveChapter = async (chapter: Partial<Chapter>) => {
    setIsLoading(true)
    try {
      if (chapterModalState.mode === 'add') {
        const { id, createdAt, updatedAt, ...rest } = chapter
        await createChapter({ ...rest, projectId: params.id, summary: chapter.summary ?? '' } as Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>)
      } else if (chapterModalState.mode === 'edit' && chapter.id) {
        await updateChapter(chapter.id, { ...chapter, summary: chapter.summary ?? '' } as Chapter)
      }
      await fetchChapters()
      setChapterModalState({ isOpen: false, mode: 'add' })
    } catch (err: any) {
      setHasError(err.message || '保存章节失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelChapterModal = () => {
    setChapterModalState({ isOpen: false, mode: 'add' })
  }

  const handleEditChapter = (chapter: Chapter) => {
    setChapterModalState({ isOpen: true, mode: 'edit', chapter })
  }

  const handleDeleteChapter = (chapter: Chapter) => {
    setDeleteChapterState({ isOpen: true, chapter })
  }

  const handleConfirmDeleteChapter = async () => {
    if (deleteChapterState.chapter) {
      setIsLoading(true)
      try {
        await deleteChapter(deleteChapterState.chapter.id)
        await fetchChapters()
        setDeleteChapterState({ isOpen: false })
      } catch (err: any) {
        setHasError(err.message || '删除章节失败')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCancelDeleteChapter = () => {
    setDeleteChapterState({ isOpen: false })
  }

  const handleMoveChapter = async (chapterId: string, direction: 'up' | 'down') => {
    const idx = chapters.findIndex(c => c.id === chapterId)
    if (idx === -1) return

    let newChapters = [...chapters]
    let swapIdx: number = -1
    
    if (direction === 'up' && idx > 0) {
      swapIdx = idx - 1
    } else if (direction === 'down' && idx < newChapters.length - 1) {
      swapIdx = idx + 1
    }
    
    if (swapIdx === -1) return
    
    // 仅交换两个章节的 sortOrder 值
    const currentChapter = { ...newChapters[idx] }
    const swapChapter = { ...newChapters[swapIdx] }
    
    console.log('[章节移动] 操作前:', {
      current: { id: currentChapter.id, sortOrder: currentChapter.sortOrder },
      swap: { id: swapChapter.id, sortOrder: swapChapter.sortOrder },
      direction
    })
    
    const tempSortOrder = currentChapter.sortOrder
    currentChapter.sortOrder = swapChapter.sortOrder
    swapChapter.sortOrder = tempSortOrder
    
    console.log('[章节移动] 操作后:', {
      current: { id: currentChapter.id, sortOrder: currentChapter.sortOrder },
      swap: { id: swapChapter.id, sortOrder: swapChapter.sortOrder }
    })
    
    // 更新数组顺序（仅用于 UI 显示）
    newChapters[idx] = swapChapter
    newChapters[swapIdx] = currentChapter
    
    setChapters(newChapters)
    setIsLoading(true)
    try {
      console.log('[章节移动] 提交到后端:', [
        { id: currentChapter.id, sortOrder: currentChapter },
        { id: swapChapter.id, sortOrder: swapChapter }
      ])
      await updateChapter(currentChapter.id, currentChapter)
      await updateChapter(swapChapter.id, swapChapter)
      await fetchChapters()
    } catch (err: any) {
      setHasError(err.message || '章节顺序更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 自动选中第一个章节
  useEffect(() => {
    if (activeTab !== "write") return;
    if (chapters.length > 0) {
      // 检查当前 activeChapterId 是否在章节列表中
      const exists = chapters.some(c => c.id === activeChapterId)
      if (!activeChapterId || !exists) {
        // 选中 sortOrder 最小的章节
        const sorted = [...chapters].sort((a, b) => a.sortOrder - b.sortOrder)
        setActiveChapterId(sorted[0].id)
      }
    }
  }, [chapters, activeTab])

  if (isLoading) return <div className="p-8 text-center">加载中...</div>
  if (hasError) return <div className="p-8 text-center text-red-500">{hasError}</div>
  if (!project) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container my-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
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
                className="mr-1 h-4 w-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              返回
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAnalysisClick}>
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
              className="mr-1 h-4 w-4"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            分析
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
      <div className="container mb-8 flex gap-4 rounded-lg border p-1">
        <Button
          variant={activeTab === "write" ? "default" : "ghost"}
          onClick={() => setActiveTab("write")}
          className="flex-1"
        >
          写作
        </Button>
        <Button
          variant={activeTab === "chapter" ? "default" : "ghost"}
          onClick={() => setActiveTab("chapter")}
          className="flex-1"
        >
          章节
        </Button>
        <Button
          variant={activeTab === "characters" ? "default" : "ghost"}
          onClick={() => setActiveTab("characters")}
          className="flex-1"
        >
          角色
        </Button>
        <Button
          variant={activeTab === "plots" ? "default" : "ghost"}
          onClick={() => setActiveTab("plots")}
          className="flex-1"
        >
          情节
        </Button>
        <Button
          variant={activeTab === "outline" ? "default" : "ghost"}
          onClick={() => setActiveTab("outline")}
          className="flex-1"
        >
          大纲
        </Button>
      </div>

      <div className="container flex-1 pb-8">
        {activeTab === "write" && (
          <div className="flex flex-col sm:flex-row gap-6">
            {showChapterSidebar && (
              <div className="w-full sm:w-64 lg:w-72 flex-shrink-0 border rounded-lg overflow-hidden">
                <ChapterSidebar 
                  chapters={chapters}
                  activeChapterId={activeChapterId}
                  onChapterSelect={(id) => {
                    setActiveChapterId(id)
                    // 当章节改变时，重置错误状态
                    setHasError(null)
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={toggleChapterSidebar}
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
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <line x1="9" x2="9" y1="3" y2="21" />
                    </svg>
                    <span className="sr-only">Toggle Chapter Sidebar</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {chapters.find(c => c.id === activeChapterId)?.title || "请选择章节"}
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
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
                      className="mr-1 h-4 w-4"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                    保存章节
                  </Button>
                </div> */}
              </div>
              <NovelEditor projectId={params.id} chapterId={activeChapterId} />
            </div>
          </div>
        )}
        {activeTab === "chapter" && (
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">章节管理</h2>
              <Button onClick={handleAddChapter}>
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
                  className="mr-1 h-4 w-4"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                新增章节
              </Button>
            </div>
            <div className="space-y-3">
              {chapters.sort((a, b) => a.sortOrder - b.sortOrder).map((chapter, idx) => (
                <div key={chapter.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{chapter.title}</h3>
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                        chapter.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : chapter.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                      }`}>
                        {chapter.status === "completed" ? "已完成" : chapter.status === "in-progress" ? "进行中" : chapter.status === "draft" ? "草稿" : "已编辑"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{chapter.summary}</p>
                    <span className="text-xs text-muted-foreground mt-1">字数: {chapter.wordCount}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleMoveChapter(chapter.id, 'up')} disabled={idx === 0}>上移</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleMoveChapter(chapter.id, 'down')} disabled={idx === chapters.length - 1}>下移</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditChapter(chapter)}>编辑</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteChapter(chapter)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "characters" && (
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">角色管理</h2>
              <Button onClick={handleAddCharacter}>
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
                  className="mr-1 h-4 w-4"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                添加角色
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <div key={character.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {character.name.substring(0, 1)}
                    </span>
                    <div>
                      <h3 className="font-medium">{character.name}</h3>
                      <p className="text-xs text-muted-foreground">{character.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{character.background}</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCharacter(character)}>编辑</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteCharacter(character)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
            {isCharactersLoading && <div className="p-8 text-center">加载中...</div>}
            {charactersError && <div className="p-8 text-center text-red-500">{charactersError}</div>}
          </div>
        )}
        {activeTab === "plots" && (
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">情节管理</h2>
              <Button onClick={handleAddPlot}>
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
                  className="mr-1 h-4 w-4"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                添加情节
              </Button>
            </div>
            {chapters.map((chapter) => (
              <div key={chapter.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{chapter.title}</h3>
                <div className="space-y-4">
                  {plots.filter(p => p.chapterId === chapter.id).map((plot) => (
                    <div key={plot.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{plot.title}</span>
                        <span className="text-xs rounded-full bg-muted px-2 py-0.5">{plot.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{plot.description}</p>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPlot(plot)}>编辑</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePlot(plot)}>删除</Button>
                      </div>
                    </div>
                  ))}
                  {plots.filter(p => p.chapterId === chapter.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">暂无情节</p>
                  )}
                </div>
              </div>
            ))}
            {isPlotsLoading && <div className="p-8 text-center">加载中...</div>}
            {plotsError && <div className="p-8 text-center text-red-500">{plotsError}</div>}
          </div>
        )}
        {activeTab === "outline" && (
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">故事大纲</h2>
              <Button onClick={handleAddOutline}>
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
                  className="mr-1 h-4 w-4"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                添加情节点
              </Button>
            </div>
            <div className="space-y-3">
              {outlines.sort((a, b) => a.order - b.order).map((outline, idx) => (
                <div key={outline.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{outline.title}</h3>
                      <span className="text-xs rounded-full bg-muted px-2 py-0.5">{outline.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{outline.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleMoveOutline(outline.id, 'up')} disabled={idx === 0}>上移</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleMoveOutline(outline.id, 'down')} disabled={idx === outlines.length - 1}>下移</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditOutline(outline)}>编辑</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteOutline(outline)}>删除</Button>
                  </div>
                </div>
              ))}
              {outlines.length === 0 && <p className="text-sm text-muted-foreground">暂无情节点</p>}
            </div>
            {isOutlinesLoading && <div className="p-8 text-center">加载中...</div>}
            {outlinesError && <div className="p-8 text-center text-red-500">{outlinesError}</div>}
          </div>
        )}
      </div>
      {modalState.isOpen && (modalState.mode === 'add' || modalState.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {modalState.mode === "add" ? "创建新角色" : "编辑角色"}
            </h2>
            <CharacterForm
              character={modalState.character}
              onSave={handleSaveCharacter}
              onCancel={handleCancelModal}
              existingCharacters={characters}
              projectId={params.id}
            />
          </div>
        </div>
      )}
      {modalState.isOpen && modalState.mode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">删除角色</h2>
            <p className="mb-4 text-muted-foreground">
              确定要删除角色"{modalState.character?.name}"吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelModal}>取消</Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>删除</Button>
            </div>
          </div>
        </div>
      )}
      {plotModalState.isOpen && (plotModalState.mode === 'add' || plotModalState.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {plotModalState.mode === "add" ? "创建新情节" : "编辑情节"}
            </h2>
            <PlotForm
              plot={plotModalState.plot}
              onSave={handleSavePlot}
              onCancel={handleCancelPlotModal}
              chapters={chapters}
            />
          </div>
        </div>
      )}
      {plotModalState.isOpen && plotModalState.mode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">删除情节</h2>
            <p className="mb-4 text-muted-foreground">
              确定要删除情节"{plotModalState.plot?.title}"吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelPlotModal}>取消</Button>
              <Button variant="destructive" onClick={handleConfirmDeletePlot}>删除</Button>
            </div>
          </div>
        </div>
      )}
      {outlineModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {outlineModalState.mode === "add" ? "创建新情节点" : "编辑情节点"}
            </h2>
            <OutlineForm
              outline={outlineModalState.outline}
              onSave={handleSaveOutline}
              onCancel={handleCancelOutlineModal}
            />
          </div>
        </div>
      )}
      {chapterModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {chapterModalState.mode === "add" ? "创建新章节" : "编辑章节"}
            </h2>
            <ChapterForm
              chapter={chapterModalState.chapter}
              onSave={handleSaveChapter}
              onCancel={handleCancelChapterModal}
            />
          </div>
        </div>
      )}
      {deleteChapterState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">删除章节</h2>
            <p className="mb-4 text-muted-foreground">
              确定要删除章节"{deleteChapterState.chapter?.title}"吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDeleteChapter}>取消</Button>
              <Button variant="destructive" onClick={handleConfirmDeleteChapter}>删除</Button>
            </div>
          </div>
        </div>
      )}
      {deleteOutlineState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">删除情节点</h2>
            <p className="mb-4 text-muted-foreground">
              确定要删除情节点"{deleteOutlineState.outline?.title}"吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDeleteOutline}>取消</Button>
              <Button variant="destructive" onClick={handleConfirmDeleteOutline}>删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 