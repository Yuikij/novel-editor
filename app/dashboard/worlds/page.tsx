"use client"

export const runtime = 'edge';

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import WorldForm from "@/app/components/novel-editor/world-form"
import type { WorldBuilding, WorldElement } from "@/app/types"
import { fetchWorldsPage, createWorld, updateWorld, deleteWorld, fetchWorld, World } from '@/app/lib/api/world';
import { useLanguage } from "@/app/lib/i18n/language-context"
import DashboardSidebar from "@/app/components/layout/dashboard-sidebar"

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
  const { t } = useLanguage()
  const [worlds, setWorlds] = useState<World[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add"
  })
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  const fetchList = () => {
    setIsLoading(true)
    fetchWorldsPage({ page: 1, pageSize: 50 })
      .then(res => setWorlds(res.data.records))
      .catch(err => setHasError(err.message || t('error.load')))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleAddWorld = () => {
    setModalState({ isOpen: true, mode: "add" })
  }

  const handleEditWorld = async (world: World) => {
    setIsFetchingDetails(true)
    setHasError(null)
    try {
      // 获取世界的完整详情信息
      const worldDetails = await fetchWorld(world.id)
      setModalState({ isOpen: true, mode: "edit", world: worldDetails })
    } catch (err: any) {
      const msg = err?.message || '获取世界详情失败'
      setHasError(msg)
      window.alert(msg)
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const handleDeleteWorld = (world: World) => {
    setModalState({ isOpen: true, mode: "delete", world })
  }

  const handleSaveWorld = async (world: WorldBuilding) => {
    setIsLoading(true)
    try {
      if (modalState.mode === "add") {
        const { id, ...rest } = world
        const payload = {
          ...rest,
          elements: (world.elements ?? []) as WorldElement[]
        } as Omit<World, 'id'>
        await createWorld(payload)
        setSuccessMsg(t('worlds.success.create'))
      } else if (modalState.mode === "edit" && world.id) {
        const payload = {
          ...world,
          elements: (world.elements ?? []) as WorldElement[]
        } as World
        await updateWorld(world.id, payload)
        setSuccessMsg(t('worlds.success.update'))
      }
      setModalState({ isOpen: false, mode: "add" })
      fetchList()
    } catch (err: any) {
      setHasError(err.message || t('error.save'))
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
        setSuccessMsg(t('worlds.success.delete'))
        setModalState({ isOpen: false, mode: "add" })
        fetchList()
      } catch (err: any) {
        setHasError(err.message || t('error.delete'))
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
        <DashboardSidebar />
        <main className="w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('worlds.title')}
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
              {t('worlds.create')}
            </Button>
          </div>
          {isLoading && <div className="p-8 text-center">{t('worlds.loading')}</div>}
          {hasError && <div className="p-8 text-center text-red-500">{hasError}</div>}
          {successMsg && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded shadow">{successMsg}</div>}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map(world => (
              <div key={world.id} className="border rounded-lg p-4 hover:border-primary transition-colors h-full flex flex-col">
                <h3 className="text-xl font-medium">{world.name}</h3>
                <p className="text-muted-foreground mt-2 line-clamp-3 flex-grow">{world.description || ''}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditWorld(world)}
                    disabled={isFetchingDetails}
                  >
                    {isFetchingDetails ? '加载中...' : t('worlds.edit')}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteWorld(world)}>{t('worlds.delete')}</Button>
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
              {modalState.mode === "add" ? t('worlds.modal.create') : t('worlds.modal.edit')}
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
            <h2 className="mb-2 text-xl font-bold">{t('worlds.modal.delete.title')}</h2>
            <p className="mb-4 text-muted-foreground">
              {t('worlds.modal.delete.message', { name: modalState.world?.name || '' })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelModal}>
                {t('worlds.modal.cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                {t('worlds.modal.confirm.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 