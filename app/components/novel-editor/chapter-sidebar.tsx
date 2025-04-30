import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import type { ChapterStatus } from "@/app/types"

interface Chapter {
  id: string
  title: string
  wordCount: number
  status: ChapterStatus
  summary?: string
  sortOrder: number
  targetWordCount?: number
}

interface ChapterSidebarProps {
  chapters: Chapter[]
  activeChapterId: string
  onChapterSelect: (chapterId: string) => void
}

export default function ChapterSidebar({
  chapters,
  activeChapterId,
  onChapterSelect,
}: ChapterSidebarProps) {
  const [filter, setFilter] = useState<"all" | ChapterStatus>("all")

  const filteredChapters = filter === "all" 
    ? chapters 
    : chapters.filter(chapter => chapter.status === filter)

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-medium mb-2">章节列表</h3>
        <div className="flex gap-1">
          <Button 
            variant={filter === "all" ? "default" : "secondary"}
            size="sm" 
            className="px-2 py-1 text-xs h-auto"
            onClick={() => setFilter("all")}
          >
            全部
          </Button>
          <Button 
            variant={filter === "completed" ? "default" : "secondary"}
            size="sm" 
            className="px-2 py-1 text-xs h-auto"
            onClick={() => setFilter("completed")}
          >
            已完成
          </Button>
          <Button 
            variant={filter === "in-progress" ? "default" : "secondary"}
            size="sm" 
            className="px-2 py-1 text-xs h-auto"
            onClick={() => setFilter("in-progress")}
          >
            进行中
          </Button>
          <Button 
            variant={filter === "edited" ? "default" : "secondary"}
            size="sm" 
            className="px-2 py-1 text-xs h-auto"
            onClick={() => setFilter("edited")}
          >
            已编辑
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredChapters.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            没有符合条件的章节
          </div>
        ) : (
          <div className="divide-y">
            {filteredChapters.map((chapter) => (
              <button
                key={chapter.id}
                className={`w-full text-left p-3 hover:bg-secondary transition-colors ${
                  chapter.id === activeChapterId ? "bg-secondary" : ""
                }`}
                onClick={() => onChapterSelect(chapter.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{chapter.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {chapter.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {chapter.wordCount} 字
                      </span>
                      {chapter.targetWordCount && (
                        <span className="text-xs text-muted-foreground">
                          / 目标字数：{chapter.targetWordCount}
                        </span>
                      )}
                      <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${
                        chapter.status === "completed" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                          : chapter.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" 
                          : chapter.status === "edited"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                      }`}>
                        {chapter.status === "completed" ? "已完成" : chapter.status === "in-progress" ? "进行中" : chapter.status === "edited" ? "已编辑" : "草稿"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* <div className="p-3 border-t">
        <Button variant="default" size="sm" className="w-full justify-center">
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
          添加新章节
        </Button>
      </div> */}
    </div>
  )
} 