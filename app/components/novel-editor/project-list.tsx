"use client"

import { useState } from "react"
import Link from "next/link"
import { DocumentIcon } from "@/app/components/ui/icons"

interface Project {
  id: string
  title: string
  genre: string
  updatedAt: string
  coverGradient: string[]
}

interface ProjectListProps {
  onCreateNew?: () => void
}

const demoProjects: Project[] = [
  {
    id: "1",
    title: "江南纯爱小说",
    genre: "纯爱",
    updatedAt: "2023-07-12",
    coverGradient: ["#FFD1DC", "#E0BBE4"],
  },
  {
    id: "2",
    title: "龙吟剑歌",
    genre: "玄幻",
    updatedAt: "2023-08-03",
    coverGradient: ["#A0E7E5", "#B4F8C8"],
  },
  {
    id: "3",
    title: "都市谜情",
    genre: "悬疑",
    updatedAt: "2023-09-18",
    coverGradient: ["#FBE7C6", "#B4F8C8"],
  },
]

export default function ProjectList({ onCreateNew }: ProjectListProps) {
  const [projects] = useState<Project[]>(demoProjects)

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/project/${project.id}`}
          className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
        >
          <div
            className="h-32 w-full"
            style={{
              background: `linear-gradient(to right, ${project.coverGradient[0]}, ${project.coverGradient[1]})`,
            }}
          >
            <div className="flex h-full items-center justify-center">
              <DocumentIcon className="h-12 w-12 text-background opacity-70" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {project.genre}
              </span>
              <span className="text-xs text-muted-foreground">
                最后更新: {project.updatedAt}
              </span>
            </div>
          </div>
        </Link>
      ))}
      <div 
        className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 p-4 transition-colors hover:border-primary/50 hover:bg-card/80 cursor-pointer"
        onClick={onCreateNew}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          创建新项目
        </p>
      </div>
    </div>
  )
} 