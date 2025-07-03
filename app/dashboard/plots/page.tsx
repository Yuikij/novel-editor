"use client"

export const runtime = 'edge';

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import PlotForm from "@/app/components/novel-editor/plot-form"
import type { Plot } from "@/app/lib/api/plot"
import type { PlotElement } from "@/app/types"
import { fetchPlotsPage, createPlot, updatePlot, deletePlot, batchDeletePlots, autoExpandPlots, fetchPlot } from "@/app/lib/api/plot"
import { useLanguage } from '@/app/lib/i18n/language-context'

// Helper to map Plot to PlotElement
function mapPlotToPlotElement(plot?: Plot): PlotElement | undefined {
  if (!plot) return undefined;
  return {
    id: plot.id,
    title: plot.title,
    description: plot.description ?? "",
    sortOrder: typeof plot.sortOrder === "number" ? plot.sortOrder : 1,
    chapterId: plot.chapterId,
    characterIds: plot.characterIds,
    itemIds: plot.itemIds,
    templateId: plot.templateId,
    status: plot.status || "planned",
    completionPercentage: plot.completionPercentage,
    wordCountGoal: plot.wordCountGoal,
    type: plot.type,
  };
}

export default function PlotsPage() {
  const { t } = useLanguage();
  const [plots, setPlots] = useState<Plot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: "add" | "edit" | "delete"
    plot?: Plot
  }>({ isOpen: false, mode: "add" })
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  
  // 批量删除相关状态
  const [selectedPlots, setSelectedPlots] = useState<string[]>([])
  const [batchDeleteState, setBatchDeleteState] = useState<{
    isOpen: boolean
  }>({ isOpen: false })

  const fetchList = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Get the active project ID from localStorage if available
      const activeProjectId = localStorage.getItem('activeProjectId')
      const res = await fetchPlotsPage({ 
        page: 1, 
        pageSize: 100,
        ...(activeProjectId ? { projectId: activeProjectId } : {})
      })
      setPlots(res.data.records)
    } catch (err: any) {
      setError(err.message || "加载失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleAddPlot = () => {
    setModalState({ isOpen: true, mode: "add" })
  }

  const handleEditPlot = async (plot: Plot) => {
    setIsFetchingDetails(true)
    setError(null)
    try {
      // 获取情节的完整详情信息
      const plotDetails = await fetchPlot(plot.id)
      setModalState({ isOpen: true, mode: "edit", plot: plotDetails })
    } catch (err: any) {
      const msg = err?.message || '获取情节详情失败'
      setError(msg)
      window.alert(msg)
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const handleDeletePlot = (plot: Plot) => {
    setModalState({ isOpen: true, mode: "delete", plot })
  }

  const handleSavePlot = async (plotElement: PlotElement) => {
    setIsLoading(true)
    setError(null)
    try {
      // Convert PlotElement to Plot format for API
      const plotData: Plot = {
        ...plotElement,
        // Get the active project ID from localStorage if available
        projectId: localStorage.getItem('activeProjectId') || undefined,
      }
      
      if (modalState.mode === "add") {
        await createPlot(plotData)
      } else if (modalState.mode === "edit" && plotElement.id) {
        await updatePlot(plotElement.id, plotData)
      }
      await fetchList()
      setModalState({ isOpen: false, mode: "add" })
    } catch (err: any) {
      setError(err.message || "保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!modalState.plot) return
    setIsLoading(true)
    try {
      await deletePlot(modalState.plot.id)
      await fetchList()
      setModalState({ isOpen: false, mode: "add" })
    } catch (err: any) {
      setError(err.message || "删除情节失败")
    } finally {
      setIsLoading(false)
    }
  }

  // 批量删除处理程序
  const handleBatchDeleteConfirm = async () => {
    if (selectedPlots.length === 0) return
    
    setIsLoading(true)
    try {
      await batchDeletePlots(selectedPlots)
      await fetchList()
      setBatchDeleteState({ isOpen: false })
      setSelectedPlots([])
    } catch (err: any) {
      setError(err.message || '批量删除情节失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchDeleteCancel = () => {
    setBatchDeleteState({ isOpen: false })
  }

  const handleOpenBatchDelete = () => {
    if (selectedPlots.length === 0) {
      alert('请先选择要删除的情节')
      return
    }
    setBatchDeleteState({ isOpen: true })
  }

  const toggleSelectPlot = (id: string) => {
    setSelectedPlots(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id) 
        : [...prev, id]
    )
  }

  const toggleSelectAllPlots = (checked: boolean) => {
    if (checked) {
      setSelectedPlots(plots.map(p => p.id))
    } else {
      setSelectedPlots([])
    }
  }

  const handleCancelModal = () => {
    setModalState({ isOpen: false, mode: "add" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start py-6 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="h-full py-6 pl-8 pr-6">
            <div className="flex flex-col gap-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Novel Editor
              </h2>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                    className="h-5 w-5"
                  >
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                    <path d="M12 3v6" />
                  </svg>
                  Projects
                </Link>
                <Link
                  href="/dashboard/characters"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                    className="h-5 w-5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Characters
                </Link>
                <Link
                  href="/dashboard/worlds"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  Worlds
                </Link>
                <Link
                  href="/dashboard/plots"
                  className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
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
                    className="h-5 w-5"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                  Plots
                </Link>
                <Link
                  href="/dashboard/analysis"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                    className="h-5 w-5"
                  >
                    <path d="M2 11h7v9H2zm7-9h7v18H9zm7 3h7v6h-7z" />
                  </svg>
                  Analysis
                </Link>
              </nav>
            </div>
          </div>
        </aside>
        <main className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Story Outline
              </h1>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => fetchList()}
                disabled={isLoading}
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
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                <span className="sr-only">刷新</span>
              </Button>
            </div>
            <div className="flex gap-2">
              {selectedPlots.length > 0 && (
                <Button variant="destructive" onClick={handleOpenBatchDelete} disabled={isLoading} className="flex items-center gap-2">
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
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  批量删除 ({selectedPlots.length})
                </Button>
              )}
              <Button onClick={handleAddPlot} className="flex items-center gap-2">
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
                  className="h-4 w-4"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                New Plot Line
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {isLoading && <div className="p-8 text-center">加载中...</div>}
            {error && <div className="p-8 text-center text-red-500">{error}</div>}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  className="flex flex-col rounded-lg border bg-card transition-all hover:shadow-md"
                >
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <input
                          type="checkbox"
                          id={`select-plot-${plot.id}`}
                          checked={selectedPlots.includes(plot.id)}
                          onChange={() => toggleSelectPlot(plot.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/80"
                        />
                      </div>
                      <h3 className="text-xl font-semibold">{plot.title}</h3>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{plot.description}</div>
                    <div className="mt-2 text-xs text-muted-foreground">类型: {plot.type ?? '-'}</div>
                    
                    {plot.characterIds && plot.characterIds.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t('project.plot.related_characters_count', { count: String(plot.characterIds.length) })}
                      </div>
                    )}
                    
                    {plot.itemIds && plot.itemIds.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t('project.plot.related_entries_count', { count: String(plot.itemIds.length) })}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 p-4 pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditPlot(plot)}
                      disabled={isFetchingDetails}
                    >
                      {isFetchingDetails ? '加载中...' : '编辑'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePlot(plot)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>

            <div 
              onClick={handleAddPlot}
              className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center hover:border-primary/50 hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Create New Plot</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Plan your story structure and key plot elements
              </p>
            </div>
          </div>
        </main>
      </div>

      {modalState.isOpen && (modalState.mode === "add" || modalState.mode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {modalState.mode === "add" ? "Create New Plot" : "Edit Plot"}
            </h2>
            <PlotForm
              plot={mapPlotToPlotElement(modalState.plot)}
              onSave={handleSavePlot}
              onCancel={handleCancelModal}
              chapters={[]}
              projectId={localStorage.getItem('activeProjectId') || undefined}
            />
          </div>
        </div>
      )}

      {modalState.isOpen && modalState.mode === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">Delete Plot</h2>
            <p className="mb-4 text-muted-foreground">
              Are you sure you want to delete the plot structure "{modalState.plot?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelModal}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {batchDeleteState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">批量删除情节</h2>
            <p className="mb-4 text-muted-foreground">
              确定要删除选中的 {selectedPlots.length} 个情节吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBatchDeleteCancel}>取消</Button>
              <Button variant="destructive" onClick={handleBatchDeleteConfirm}>删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 