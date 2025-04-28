"use client"

export const runtime = 'edge';

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import WorldForm from "@/app/components/novel-editor/world-form"
import type { WorldBuilding, WorldElement } from "@/app/types"
import { fetchWorldsPage, createWorld, updateWorld, deleteWorld, World } from '@/app/lib/api/world';

const initialWorlds: WorldBuilding[] = [
  {
    id: "1",
    name: "江南水乡",
    description: "位于中国东南部的传统水乡，有着悠久的历史和独特的文化风貌。",
    elements: [
      {
        id: "location-1",
        type: "location",
        name: "青石小镇",
        description: "被水渠环绕的传统小镇，石板路和木质建筑保留着古老的风貌。"
      },
      {
        id: "culture-1",
        type: "culture",
        name: "江南艺术",
        description: "以水墨画、刺绣和园林设计为代表的传统艺术，影响了故事中的设计元素。"
      },
      {
        id: "history-1",
        type: "history",
        name: "世家传承",
        description: "当地几大家族的百年恩怨，影响着现代人物的关系和互动。"
      }
    ]
  },
  {
    id: "2",
    name: "现代都市",
    description: "繁华的现代大都市，科技与传统并存，是故事冲突与成长的重要场景。",
    elements: [
      {
        id: "location-2",
        type: "location",
        name: "星辉大厦",
        description: "城市中心的现代建筑，是大型设计比赛的举办地点。"
      },
      {
        id: "technology-1",
        type: "technology",
        name: "数字设计技术",
        description: "现代设计领域使用的高科技手段，与传统艺术形成对比。"
      }
    ]
  }
]

type ModalState = {
  isOpen: boolean;
  mode: "add" | "edit" | "delete";
  world?: WorldBuilding;
}

export default function WorldsPage() {
  const [worlds, setWorlds] = useState<World[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add"
  })
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchList = () => {
    setIsLoading(true)
    fetchWorldsPage({ page: 1, pageSize: 50 })
      .then(res => setWorlds(res.data.records))
      .catch(err => setHasError(err.message || '加载失败'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleAddWorld = () => {
    setModalState({ isOpen: true, mode: "add" })
  }

  const handleEditWorld = (world: World) => {
    setModalState({ isOpen: true, mode: "edit", world })
  }

  const handleDeleteWorld = (world: World) => {
    setModalState({ isOpen: true, mode: "delete", world })
  }

  const handleSaveWorld = async (world: Partial<World>) => {
    setIsLoading(true)
    try {
      if (modalState.mode === "add") {
        const { id, ...rest } = world
        const payload = {
          ...rest,
          elements: (world.elements ?? []) as WorldElement[]
        } as Omit<World, 'id'>
        await createWorld(payload)
        setSuccessMsg('世界观创建成功')
      } else if (modalState.mode === "edit" && world.id) {
        const payload = {
          ...world,
          elements: (world.elements ?? []) as WorldElement[]
        } as World
        await updateWorld(world.id, payload)
        setSuccessMsg('世界观更新成功')
      }
      setModalState({ isOpen: false, mode: "add" })
      fetchList()
    } catch (err: any) {
      setHasError(err.message || '保存失败')
    } finally {
      setIsLoading(false)
      setTimeout(() => setSuccessMsg(null), 2000)
    }
  }

  const handleConfirmDelete = async () => {
    if (modalState.world) {
      setIsLoading(true)
      try {
        await deleteWorld(modalState.world.id)
        setSuccessMsg('世界观删除成功')
        setModalState({ isOpen: false, mode: "add" })
        fetchList()
      } catch (err: any) {
        setHasError(err.message || '删除失败')
      } finally {
        setIsLoading(false)
        setTimeout(() => setSuccessMsg(null), 2000)
      }
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
                  href="/dashboard/worlds"
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  Worlds
                </Link>
                {/* <Link
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
                </Link> */}
              </nav>
            </div>
          </div>
        </aside>
        <main className="w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              World Building
            </h1>
            <Button className="flex items-center gap-2" onClick={handleAddWorld} disabled={isLoading}>
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
              新建世界观
            </Button>
          </div>
          {isLoading && <div className="p-8 text-center">加载中...</div>}
          {hasError && <div className="p-8 text-center text-red-500">{hasError}</div>}
          {successMsg && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded shadow">{successMsg}</div>}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map(world => (
              <div key={world.id} className="border rounded-lg p-4 hover:border-primary transition-colors h-full flex flex-col">
                <h3 className="text-xl font-medium">{world.name}</h3>
                <p className="text-muted-foreground mt-2 line-clamp-3 flex-grow">{world.description || ''}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEditWorld(world)}>编辑</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteWorld(world)}>删除</Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {modalState.isOpen && (modalState.mode === "add" || modalState.mode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {modalState.mode === "add" ? "Create New World" : "Edit World"}
            </h2>
            <WorldForm
              world={modalState.world}
              onSave={handleSaveWorld}
              onCancel={handleCancelModal}
            />
          </div>
        </div>
      )}

      {modalState.isOpen && modalState.mode === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">Delete World</h2>
            <p className="mb-4 text-muted-foreground">
              Are you sure you want to delete the world "{modalState.world?.name}"? This action cannot be undone.
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