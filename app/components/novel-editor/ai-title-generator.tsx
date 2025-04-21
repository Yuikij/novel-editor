"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"

interface TitleGeneratorProps {
  genre: string
  style?: string
  tags?: string[]
  onSelectTitle: (title: string) => void
}

export default function AiTitleGenerator({
  genre,
  style,
  tags,
  onSelectTitle
}: TitleGeneratorProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const generateTitles = () => {
    if (!genre) return
    
    setIsLoading(true)
    
    // Simulate API call - in a real application, this would call a backend service
    setTimeout(() => {
      // Generate sample titles based on genre and style
      let titleSuggestions: string[] = []
      
      // Romance genre titles
      if (genre === "言情" || genre === "现代言情") {
        titleSuggestions = [
          "心动时刻：都市爱恋",
          "江南雨季",
          "心之所向",
          "春风十里",
          "相遇在雨季",
          "浮世绘爱恋"
        ]
      } 
      // Fantasy genre titles
      else if (genre === "玄幻" || genre === "仙侠") {
        titleSuggestions = [
          "九天神帝",
          "修真世界",
          "仙途问道",
          "万古神王",
          "剑道独尊",
          "灵气复苏"
        ]
      }
      // Mystery genre titles
      else if (genre === "悬疑") {
        titleSuggestions = [
          "隐秘真相",
          "迷雾之谜",
          "暗夜追踪",
          "谜城",
          "深渊之眼",
          "无人知晓"
        ]
      }
      // Historical titles
      else if (genre === "历史") {
        titleSuggestions = [
          "大明风华",
          "朝代崛起",
          "王朝霸业",
          "盛唐传奇",
          "江山如画",
          "帝国的黄昏"
        ]
      }
      // Sci-fi titles
      else if (genre === "科幻") {
        titleSuggestions = [
          "星际迷航",
          "量子危机",
          "超维度",
          "未来战场",
          "星辰大海",
          "时空裂隙"
        ]
      }
      // Default titles
      else {
        titleSuggestions = [
          "时光之旅",
          "未知世界",
          "命运交织",
          "人生旅途",
          "心之所向",
          "万里长空"
        ]
      }
      
      // Add style-based modifiers
      if (style === "甜宠") {
        titleSuggestions = [...titleSuggestions, "甜蜜约定", "暖爱时光", "蜜糖日记", "心动瞬间"]
      } else if (style === "虐心") {
        titleSuggestions = [...titleSuggestions, "泪之痕", "伤逝", "暗夜倾城", "心碎时刻"]
      } else if (style === "轻松") {
        titleSuggestions = [...titleSuggestions, "欢乐时光", "轻松日记", "悠闲生活", "都市闲情"]
      } else if (style === "治愈") {
        titleSuggestions = [...titleSuggestions, "心灵疗愈", "温暖时光", "阳光小巷", "微风拂面"]
      }
      
      // Add tag-based suggestions if available
      if (tags && tags.length > 0) {
        const tagBasedSuggestions = tags.map(tag => {
          if (tag.includes("爱情") || tag.includes("恋爱")) return `${tag}物语`
          if (tag.includes("冒险")) return `${tag}征途`
          if (tag.includes("成长")) return `${tag}之路`
          return `${tag}传说`
        })
        titleSuggestions = [...titleSuggestions, ...tagBasedSuggestions]
      }
      
      // Filter out duplicates and limit to 6 suggestions
      const uniqueSuggestions = Array.from(new Set(titleSuggestions))
      setSuggestions(uniqueSuggestions.slice(0, 6))
      
      setIsLoading(false)
      setShowSuggestions(true)
    }, 1000)
  }
  
  return (
    <div className="mt-2">
      <div className="flex justify-end">
        <Button 
          onClick={generateTitles}
          disabled={isLoading || !genre}
          className="text-sm h-9 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            <>
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
                className="mr-2 h-4 w-4"
              >
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
              </svg>
              AI 智能取名
            </>
          )}
        </Button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-3 rounded-md border p-3 bg-accent/20">
          <h3 className="text-sm font-medium mb-2">智能标题建议</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestions.map((title, index) => (
              <div 
                key={index}
                className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/30"
                onClick={() => {
                  onSelectTitle(title)
                  setShowSuggestions(false)
                }}
              >
                <span>{title}</span>
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
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 