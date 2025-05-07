"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"

interface ChapterAutoExpandProps {
  onSubmit: (targetCount: number) => Promise<void>
  onCancel: () => void
  currentCount: number
  isLoading?: boolean
  maxCount?: number
}

export default function ChapterAutoExpand({
  onSubmit,
  onCancel,
  currentCount,
  isLoading = false,
  maxCount = 30
}: ChapterAutoExpandProps) {
  const [targetCount, setTargetCount] = useState<number>(Math.min(currentCount + 5, maxCount))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (targetCount <= currentCount) {
      return // Cannot reduce or keep the same count
    }
    await onSubmit(targetCount)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">自动扩展章节</h2>
        <p className="text-sm text-muted-foreground mb-4">
          将根据现有章节自动生成新的章节，扩展到指定数量。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            目标数量（当前：{currentCount}）
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min={currentCount + 1}
              max={maxCount}
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{currentCount + 1}</span>
              <span className="text-sm font-medium">{targetCount}</span>
              <span className="text-sm text-muted-foreground">{maxCount}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isLoading || targetCount <= currentCount}
          >
            {isLoading ? "处理中..." : "自动扩展"}
          </Button>
        </div>
      </form>
    </div>
  )
} 