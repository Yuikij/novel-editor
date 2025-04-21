"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { IconRobot, IconEdit, IconPlus } from "@tabler/icons-react"

interface NovelEditorProps {
  projectId: string
  chapterId?: string
}

export default function NovelEditor({ projectId, chapterId }: NovelEditorProps) {
  const [content, setContent] = useState<string>(
    "江南村落，烟雨蒙蒙。\n\n一座青瓦小楼前，少女撑着油纸伞，轻声吟唱着不知名的小调。她眉眼如画，长发如瀑，一袭淡蓝色旗袍勾勒出窈窕的身姿。\n\n就在此时，一名身着西装的年轻男子从远处走来，他手中拿着一幅画卷，眼神中满是期待。"
  )

  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const analyzeText = () => {
    setIsAiPanelOpen(true)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col rounded-lg border">
        <div className="flex items-center border-b p-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium">第一章</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">江南纯爱小说</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
            >
              <IconRobot className="mr-2 h-4 w-4" />
              AI Analysis
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit Information
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <textarea
            className="h-[60vh] w-full resize-none rounded-md border-0 bg-transparent p-2 text-lg leading-relaxed focus:outline-none"
            value={content}
            onChange={handleChange}
            placeholder="开始写作您的小说内容..."
          ></textarea>
        </div>
        <div className="flex items-center justify-between border-t p-3">
          <div className="text-sm text-muted-foreground">
            字数：{content.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
            <Button 
              size="sm"
            >
              Generate with AI
            </Button>
          </div>
        </div>
      </div>

      {isAiPanelOpen && (
        <div className="rounded-lg border">
          <div className="border-b p-3">
            <h3 className="font-semibold">AI 分析与建议</h3>
          </div>
          <div className="space-y-4 p-4">
            <div className="rounded-md bg-accent/50 p-3">
              <h4 className="font-medium">情感节奏</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                开篇设定了江南烟雨的氛围，描绘了女主角的形象，通过意外的相遇埋下情感伏笔。建议在下文中增加角色之间的互动对话，展示性格特点。
              </p>
            </div>
            <div className="rounded-md bg-accent/50 p-3">
              <h4 className="font-medium">场景描写</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                江南水乡的烟雨氛围描绘得比较简洁，可以增加一些细节，如雨滴落在青石板上的声音，远处的小桥流水，增强沉浸感。
              </p>
            </div>
            <div className="rounded-md bg-accent/50 p-3">
              <h4 className="font-medium">人物塑造</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                女主角的外貌描写具体，但可以增加些许性格特点的暗示。男主角的描写相对简单，可以补充一些细节，如表情、眼神等。
              </p>
            </div>
            <Button className="w-full">生成更多建议</Button>
          </div>
        </div>
      )}
    </div>
  )
} 