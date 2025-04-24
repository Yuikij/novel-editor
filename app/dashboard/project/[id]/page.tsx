"use client"

export const runtime = 'edge';

import { useState } from "react"
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

// Sample chapter data
const demoChapters = [
  {
    id: "1",
    title: "江南烟雨",
    wordCount: 789,
    status: "completed" as const,
    summary: "主角林雨荷在江南小镇上与陈明辉初次相遇。",
    content: "",
    order: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    notes: ""
  },
  {
    id: "2",
    title: "画卷之谜",
    wordCount: 1250,
    status: "completed" as const,
    summary: "陈明辉展示祖传画卷，引起林雨荷的兴趣。",
    content: "",
    order: 2,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    notes: ""
  },
  {
    id: "3",
    title: "家族阻挠",
    wordCount: 980,
    status: "in-progress" as const,
    summary: "陈家反对陈明辉与平民交往，周世豪登场。",
    content: "",
    order: 3,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    notes: ""
  },
  {
    id: "4",
    title: "设计比赛",
    wordCount: 324,
    status: "draft" as const,
    summary: "林雨荷参加设计比赛，遭遇对手刁难。",
    content: "",
    order: 4,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    notes: ""
  }
]

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<string>("write")
  const [chapters, setChapters] = useState<Chapter[]>(demoChapters)
  const [activeChapterId, setActiveChapterId] = useState<string>("1")
  const [showChapterSidebar, setShowChapterSidebar] = useState<boolean>(true)
  const [characters, setCharacters] = useState<Character[]>([])
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete';
    character?: Character;
  }>({
    isOpen: false,
    mode: 'add',
  })
  const [plots, setPlots] = useState<PlotElement[]>([])
  const [plotModalState, setPlotModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete';
    plot?: PlotElement;
  }>({
    isOpen: false,
    mode: 'add',
  })
  const [outlines, setOutlines] = useState<PlotElement[]>([])
  const [outlineModalState, setOutlineModalState] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; outline?: PlotElement }>({
    isOpen: false,
    mode: 'add',
  })
  const [chapterModalState, setChapterModalState] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; chapter?: Chapter }>({
    isOpen: false,
    mode: 'add',
  })
  const [deleteChapterState, setDeleteChapterState] = useState<{ isOpen: boolean; chapter?: Chapter }>({ isOpen: false })

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

  const handleSaveCharacter = (character: Character) => {
    if (modalState.mode === 'add') {
      setCharacters([...characters, character])
    } else if (modalState.mode === 'edit') {
      setCharacters(characters.map(c => c.id === character.id ? character : c))
    }
    setModalState({ isOpen: false, mode: 'add' })
  }

  const handleCancelModal = () => {
    setModalState({ isOpen: false, mode: 'add' })
  }

  const handleEditCharacter = (character: Character) => {
    setModalState({ isOpen: true, mode: 'edit', character })
  }

  const handleDeleteCharacter = (character: Character) => {
    setModalState({ isOpen: true, mode: 'delete', character })
  }

  const handleConfirmDelete = () => {
    if (modalState.character) {
      setCharacters(characters.filter(c => c.id !== modalState.character?.id))
      setModalState({ isOpen: false, mode: 'add' })
    }
  }

  const handleAddPlot = () => {
    setPlotModalState({ isOpen: true, mode: 'add' })
  }

  const handleSavePlot = (plot: PlotElement) => {
    if (plotModalState.mode === 'add') {
      setPlots([...plots, plot])
    } else if (plotModalState.mode === 'edit') {
      setPlots(plots.map(p => p.id === plot.id ? plot : p))
    }
    setPlotModalState({ isOpen: false, mode: 'add' })
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

  const handleConfirmDeletePlot = () => {
    if (plotModalState.plot) {
      setPlots(plots.filter(p => p.id !== plotModalState.plot?.id))
      setPlotModalState({ isOpen: false, mode: 'add' })
    }
  }

  const handleAddOutline = () => {
    setOutlineModalState({ isOpen: true, mode: 'add' })
  }

  const handleSaveOutline = (outline: PlotElement) => {
    if (outlineModalState.mode === 'add') {
      setOutlines([...outlines, outline])
    } else if (outlineModalState.mode === 'edit') {
      setOutlines(outlines.map(o => o.id === outline.id ? outline : o))
    }
    setOutlineModalState({ isOpen: false, mode: 'add' })
  }

  const handleCancelOutlineModal = () => {
    setOutlineModalState({ isOpen: false, mode: 'add' })
  }

  const handleAddChapter = () => {
    setChapterModalState({ isOpen: true, mode: 'add' })
  }

  const handleSaveChapter = (chapter: Chapter) => {
    if (chapterModalState.mode === 'add') {
      setChapters([...chapters, chapter])
    } else if (chapterModalState.mode === 'edit') {
      setChapters(chapters.map(c => c.id === chapter.id ? chapter : c))
    }
    setChapterModalState({ isOpen: false, mode: 'add' })
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

  const handleConfirmDeleteChapter = () => {
    if (deleteChapterState.chapter) {
      setChapters(chapters.filter(c => c.id !== deleteChapterState.chapter?.id))
      setDeleteChapterState({ isOpen: false })
    }
  }

  const handleCancelDeleteChapter = () => {
    setDeleteChapterState({ isOpen: false })
  }

  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const idx = chapters.findIndex(c => c.id === chapterId)
    if (idx === -1) return
    let newChapters = [...chapters]
    if (direction === 'up' && idx > 0) {
      [newChapters[idx - 1], newChapters[idx]] = [newChapters[idx], newChapters[idx - 1]]
    } else if (direction === 'down' && idx < newChapters.length - 1) {
      [newChapters[idx], newChapters[idx + 1]] = [newChapters[idx + 1], newChapters[idx]]
    }
    // 重新设置order
    newChapters = newChapters.map((c, i) => ({ ...c, order: i + 1 }))
    setChapters(newChapters)
  }

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
          <h1 className="text-2xl font-bold tracking-tight">江南纯爱小说</h1>
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
                  onChapterSelect={setActiveChapterId}
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
                    {chapters.find(c => c.id === activeChapterId)?.title || "Chapter"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
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
              {chapters.sort((a, b) => a.order - b.order).map((chapter, idx) => (
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
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">故事总览</h3>
                <textarea 
                  className="w-full h-32 border rounded-md p-2 text-sm resize-none" 
                  placeholder="输入故事总体概要..."
                  defaultValue="这是一个发生在江南水乡的纯爱故事。天才设计师林雨荷与富商之子陈明辉在一次偶然相遇中结缘，但两人之间的爱情面临家族与阶级的阻挠。故事将围绕两人如何克服身份差距，实现爱情与梦想展开。"
                ></textarea>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">情节发展</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start border-l-4 border-blue-400 pl-3 py-1">
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium">起始</span>
                    </div>
                    <div>
                      <h4 className="font-medium">初次相遇</h4>
                      <p className="text-sm text-muted-foreground">林雨荷在江南小镇遇见陈明辉，被其手中古画吸引</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start border-l-4 border-green-400 pl-3 py-1">
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium">发展</span>
                    </div>
                    <div>
                      <h4 className="font-medium">情感萌芽</h4>
                      <p className="text-sm text-muted-foreground">陈明辉发现林雨荷的设计天赋，两人共同研究古画中的图案</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start border-l-4 border-amber-400 pl-3 py-1">
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium">冲突</span>
                    </div>
                    <div>
                      <h4 className="font-medium">家族阻挠</h4>
                      <p className="text-sm text-muted-foreground">陈家得知陈明辉与平民女子交往，百般阻挠，周世豪出场</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start border-l-4 border-purple-400 pl-3 py-1">
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium">高潮</span>
                    </div>
                    <div>
                      <h4 className="font-medium">设计比赛</h4>
                      <p className="text-sm text-muted-foreground">林雨荷参加全国设计大赛，遭周世豪暗中破坏，但依靠实力获胜</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start border-l-4 border-red-400 pl-3 py-1">
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium">解决</span>
                    </div>
                    <div>
                      <h4 className="font-medium">身世之谜</h4>
                      <p className="text-sm text-muted-foreground">林雨荷身世之谜揭晓，与陈家有渊源，两人重获自由</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            <PlotForm
              plot={outlineModalState.outline}
              onSave={handleSaveOutline}
              onCancel={handleCancelOutlineModal}
              chapters={chapters}
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
    </div>
  )
} 