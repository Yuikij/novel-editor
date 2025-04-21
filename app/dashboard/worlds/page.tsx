"use client"

export const runtime = 'edge';

import { useState } from "react"
import Link from "next/link"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import WorldForm from "@/app/components/novel-editor/world-form"
import type { WorldBuilding, WorldElement } from "@/app/types"

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
  const [worlds, setWorlds] = useState<WorldBuilding[]>(initialWorlds)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add"
  })

  const handleAddWorld = () => {
    setModalState({
      isOpen: true,
      mode: "add"
    })
  }

  const handleEditWorld = (world: WorldBuilding) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      world
    })
  }

  const handleDeleteWorld = (world: WorldBuilding) => {
    setModalState({
      isOpen: true,
      mode: "delete",
      world
    })
  }

  const handleSaveWorld = (world: WorldBuilding) => {
    if (modalState.mode === "add") {
      setWorlds([...worlds, world])
    } else if (modalState.mode === "edit") {
      setWorlds(worlds.map(w => w.id === world.id ? world : w))
    }
    setModalState({ isOpen: false, mode: "add" })
  }

  const handleConfirmDelete = () => {
    if (modalState.world) {
      setWorlds(worlds.filter(w => w.id !== modalState.world?.id))
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
                <Link
                  href="/dashboard/plots"
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
              World Building
            </h1>
            <Button className="flex items-center gap-2" onClick={handleAddWorld}>
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
              New World
            </Button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world) => (
              <div
                key={world.id}
                className="flex flex-col rounded-lg border bg-card transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-center rounded-t-lg bg-accent/30 p-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="text-xl font-semibold">{world.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {world.description}
                  </p>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Elements:</h4>
                    <div className="mt-2 space-y-1">
                      {world.elements.map((element) => (
                        <div 
                          key={element.id} 
                          className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5"
                        >
                          <span className={`h-2 w-2 rounded-full ${
                            element.type === 'location' ? 'bg-blue-500' :
                            element.type === 'culture' ? 'bg-purple-500' :
                            element.type === 'magic' ? 'bg-amber-500' :
                            element.type === 'technology' ? 'bg-green-500' :
                            element.type === 'history' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{element.name}</span>
                              <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                                {element.type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {element.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end border-t p-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditWorld(world)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive/80" 
                      onClick={() => handleDeleteWorld(world)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div 
              onClick={handleAddWorld}
              className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center hover:border-primary/50 hover:bg-accent/10 transition-colors cursor-pointer"
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Create New World</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Define locations, cultures, and lore for your novel
              </p>
            </div>
          </div>
        </main>
      </div>

      {modalState.isOpen && (modalState.mode === "add" || modalState.mode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
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