"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

interface PlotAutoExpandProps {
  onSubmit: (targetCount: number) => Promise<void>
  onCancel: () => void
  currentCount: number
  isLoading?: boolean
}

export default function PlotAutoExpand({
  onSubmit,
  onCancel,
  currentCount,
  isLoading = false
}: PlotAutoExpandProps) {
  const [targetCount, setTargetCount] = useState(currentCount + 5)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(targetCount)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">自动扩展情节</h2>
        <p className="text-sm text-muted-foreground mb-4">
          系统将根据当前章节内容，自动生成合适的情节点。
          当前已有 {currentCount} 个情节，请设置目标数量。
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="targetCount">目标情节数量</Label>
        <Input
          id="targetCount"
          type="number"
          min={currentCount > 0 ? currentCount : 1}
          value={targetCount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetCount(parseInt(e.target.value))}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          将生成 {targetCount - currentCount} 个新情节
        </p>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading || targetCount <= currentCount}>
          {isLoading ? "生成中..." : "开始生成"}
        </Button>
      </div>
    </form>
  )
} 