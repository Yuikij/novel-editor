"use client"

export const runtime = 'edge';

import { useState, useRef } from "react"
import Link from "next/link"
import { 
  LogoIcon, 
  CharacterIcon, 
  DocumentIcon, 
  WorldIcon, 
  PlotIcon, 
  AnalysisIcon 
} from "@/app/components/ui/icons"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import ProjectList from "@/app/components/novel-editor/project-list"
import { Button } from "@/app/components/ui/button"
import NovelSettingsForm from "@/app/components/novel-editor/novel-settings-form"
import type { NovelProject, WorldBuilding } from "@/app/types"
import { useLanguage } from "@/app/lib/i18n/language-context"

const initialProjects: NovelProject[] = [
  {
    id: "1",
    title: "江南纯爱小说",
    genre: "现代言情",
    style: "甜宠",
    createdAt: "2023-10-05T10:12:35Z",
    updatedAt: "2023-10-20T14:23:47Z",
    coverGradient: ["#4f46e5", "#818cf8"],
    metadata: {
      synopsis: "这是一个发生在江南水乡的纯爱故事。天才设计师林雨荷与富商之子陈明辉在一次偶然相遇中结缘，但两人之间的爱情面临家族与阶级的阻挠。",
      tags: ["纯爱", "设计", "家族", "坚持"],
      targetAudience: "女性读者",
      wordCountGoal: 150000,
      status: "in-progress",
      highlights: [
        "女主角获得设计大赛冠军",
        "男主角为爱与家族决裂",
        "意外发现女主角身世之谜"
      ],
      writingRequirements: [
        "甜宠为主，虐恋为辅",
        "多描写江南水乡风情",
        "展现传统艺术魅力"
      ]
    }
  },
  {
    id: "2",
    title: "修真奇缘",
    genre: "仙侠",
    style: "轻松",
    createdAt: "2023-09-15T08:45:12Z",
    updatedAt: "2023-10-18T11:30:22Z",
    coverGradient: ["#047857", "#34d399"],
    metadata: {
      synopsis: "平凡少年意外获得古老传承，踏上修真之路。在这个充满神秘与危险的世界，他需要不断变强，寻找身世之谜，同时守护身边重要的人。",
      tags: ["修真", "奇遇", "成长", "冒险"],
      targetAudience: "通用",
      wordCountGoal: 300000,
      status: "draft",
      highlights: [
        "获得上古传承",
        "与神秘组织对抗",
        "发现自己特殊血脉"
      ],
      writingRequirements: [
        "轻松流畅的叙事风格",
        "详细描写修真世界",
        "注重角色情感发展"
      ]
    }
  }
]

const initialWorlds: WorldBuilding[] = [
  {
    id: "1",
    name: "江南水乡",
    description: "位于中国东南部的传统水乡，有着悠久的历史和独特的文化风貌。",
    elements: [],
    notes: ""
  },
  {
    id: "2",
    name: "现代都市",
    description: "繁华的现代大都市，科技与传统并存，是故事冲突与成长的重要场景。",
    elements: [],
    notes: ""
  }
]

export default function DashboardPage() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState<NovelProject[]>(initialProjects)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<NovelProject | undefined>(undefined)
  const [worlds, setWorlds] = useState<WorldBuilding[]>(initialWorlds)
  const projectListRef = useRef<() => void>()

  const handleOpenCreateModal = () => {
    setEditingProject(undefined)
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (project: NovelProject) => {
    setEditingProject(project)
    setIsCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingProject(undefined)
  }

  const handleSaveProject = (project: NovelProject) => {
    handleCloseModal()
    // 自动刷新 ProjectList
    if (projectListRef.current) projectListRef.current()
  }

  const handleDeleteProject = (project: NovelProject) => {
    if (confirm(t('dashboard.confirm.delete'))) {
      setProjects(projects.filter(p => p.id !== project.id))
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  }

  // Helper function to get status text and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "draft":
        return { text: t('status.draft'), class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100" }
      case "in-progress":
        return { text: t('status.in_progress'), class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" }
      case "completed":
        return { text: t('status.completed'), class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" }
      case "published":
        return { text: t('status.published'), class: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" }
      default:
        return { text: t('status.unknown'), class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100" }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start py-6 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="h-full py-6 pl-8 pr-6">
            <div className="flex flex-col gap-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                {t('editor.title')}
              </h2>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
                >
                  <DocumentIcon className="h-5 w-5" />
                  {t('nav.projects')}
                </Link>
                <Link
                  href="/dashboard/worlds"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <WorldIcon className="h-5 w-5" />
                  {t('nav.worlds')}
                </Link>
                {/* <Link
                  href="/dashboard/analysis"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <AnalysisIcon className="h-5 w-5" />
                  {t('nav.analysis')}
                </Link> */}
              </nav>
            </div>
          </div>
        </aside>
        <main className="w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{t('nav.projects')}</h1>
            {/* <Button className="flex items-center gap-2" onClick={handleOpenCreateModal}>
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
              {t('dashboard.new_project')}
            </Button> */}
          </div>
          <div className="mt-6">
            <ProjectList onRefetch={fn => (projectListRef.current = fn)} onCreateNew={handleOpenCreateModal} />
          </div>
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {editingProject ? t('dashboard.edit_project') : t('dashboard.create_project')}
            </h2>
            <NovelSettingsForm
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={handleCloseModal}
              worlds={worlds}
            />
          </div>
        </div>
      )}
    </div>
  )
} 