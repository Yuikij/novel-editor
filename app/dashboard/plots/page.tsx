"use client"

import { useState } from "react"
import Link from "next/link"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import PlotForm from "@/app/components/novel-editor/plot-form"
import type { PlotStructure, PlotElement } from "@/app/types"

const initialPlots: PlotStructure[] = [
  {
    id: "1",
    title: "主线剧情",
    type: "three-act",
    elements: [
      {
        id: "act1-1",
        title: "初次相遇",
        description: "林雨荷在江南小镇遇见陈明辉，被其手中古画吸引",
        position: 1,
        status: "completed"
      },
      {
        id: "act1-2",
        title: "情感萌芽",
        description: "陈明辉发现林雨荷的设计天赋，两人共同研究古画中的图案",
        position: 2,
        status: "completed"
      },
      {
        id: "act2-1",
        title: "家族阻挠",
        description: "陈家得知陈明辉与平民女子交往，百般阻挠，周世豪出场",
        position: 3,
        status: "drafted"
      },
      {
        id: "act2-2",
        title: "设计比赛",
        description: "林雨荷参加全国设计大赛，遭周世豪暗中破坏，但依靠实力获胜",
        position: 4,
        status: "planned"
      },
      {
        id: "act3-1",
        title: "身世之谜",
        description: "林雨荷身世之谜揭晓，与陈家有渊源",
        position: 5,
        status: "planned"
      },
      {
        id: "act3-2",
        title: "圆满结局",
        description: "两人最终冲破阻碍，实现自己的设计梦想，收获真爱",
        position: 6,
        status: "planned"
      }
    ]
  },
  {
    id: "2",
    title: "设计师梦想线",
    type: "hero-journey",
    elements: [
      {
        id: "journey-1",
        title: "平凡生活",
        description: "林雨荷作为普通设计师的日常生活",
        position: 1,
        status: "completed"
      },
      {
        id: "journey-2",
        title: "机遇与召唤",
        description: "发现古老图案中隐藏的设计灵感，决定参加比赛",
        position: 2,
        status: "drafted"
      },
      {
        id: "journey-3",
        title: "挑战与成长",
        description: "在比赛中遭遇困难，学会融合传统与现代设计",
        position: 3,
        status: "planned"
      }
    ]
  }
]

type ModalState = {
  isOpen: boolean;
  mode: "add" | "edit" | "delete";
  plot?: PlotStructure;
}

export default function PlotsPage() {
  const [plots, setPlots] = useState<PlotStructure[]>(initialPlots)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add"
  })

  const handleAddPlot = () => {
    setModalState({
      isOpen: true,
      mode: "add"
    })
  }

  const handleEditPlot = (plot: PlotStructure) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      plot
    })
  }

  const handleDeletePlot = (plot: PlotStructure) => {
    setModalState({
      isOpen: true,
      mode: "delete",
      plot
    })
  }

  const handleSavePlot = (plot: PlotStructure) => {
    if (modalState.mode === "add") {
      setPlots([...plots, plot])
    } else if (modalState.mode === "edit") {
      setPlots(plots.map(p => p.id === plot.id ? plot : p))
    }
    setModalState({ isOpen: false, mode: "add" })
  }

  const handleConfirmDelete = () => {
    if (modalState.plot) {
      setPlots(plots.filter(p => p.id !== modalState.plot?.id))
      setModalState({ isOpen: false, mode: "add" })
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
            <h1 className="text-2xl font-bold tracking-tight">
              Story Outline
            </h1>
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

          <div className="mt-6 space-y-6">
            {plots.map((plot) => (
              <div
                key={plot.id}
                className="rounded-lg border bg-card transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      plot.type === 'three-act' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      plot.type === 'hero-journey' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                      plot.type === 'save-the-cat' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
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
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{plot.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plot.type === 'three-act' ? '三幕剧结构' :
                         plot.type === 'hero-journey' ? '英雄之旅' :
                         plot.type === 'save-the-cat' ? '猫猫结构' : '自定义结构'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEditPlot(plot)}
                      variant="outline"
                      size="sm"
                    >
                      编辑
                    </Button>
                    <Button 
                      onClick={() => handleDeletePlot(plot)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted"></div>
                    <div className="space-y-4 relative">
                      {plot.elements.map((element) => (
                        <div key={element.id} className="flex items-start gap-4 pl-6 relative">
                          <div className={`absolute left-0 top-2 h-4 w-4 rounded-full ${
                            element.status === 'completed' ? 'bg-green-500' :
                            element.status === 'drafted' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1 rounded-lg border p-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h4 className="font-medium">{element.title}</h4>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                element.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                element.status === 'drafted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                              }`}>
                                {element.status === 'completed' ? '已完成' : 
                                 element.status === 'drafted' ? '已起草' : '计划中'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {element.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">
              {modalState.mode === "add" ? "Create New Plot" : "Edit Plot"}
            </h2>
            <PlotForm
              plot={modalState.plot}
              onSave={handleSavePlot}
              onCancel={handleCancelModal}
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
    </div>
  )
} 