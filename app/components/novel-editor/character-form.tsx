"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import type { Character, CharacterRelationship } from "@/app/types"
import { generateCharacterInfo } from "@/app/lib/api/character"
import { Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"

interface CharacterFormProps {
  character?: Character
  onSave: (character: Character) => void
  onCancel: () => void
  existingCharacters?: Character[]
  projectId: string
}

// Helper to sanitize relationships before saving
/**
 * Removes id and sourceCharacterId from each relationship object.
 * This ensures the backend generates these fields as needed.
 */
function sanitizeRelationships(relationships: CharacterRelationship[]) {
  return relationships.map(({ id, sourceCharacterId, ...rest }) => rest)
}

// 角色类型、性别、关系类型选项（中文）
const roleOptions = ["主角", "反派", "配角", "次要角色", "路人", "龙套", "其他"];
const genderOptions = ["男", "女", "其他"];
const relationshipTypeOptions = ["朋友", "敌人", "恋人", "家人", "对手", "导师", "同事", "同学", "邻居", "其他"];

export default function CharacterForm({
  character,
  onSave,
  onCancel,
  existingCharacters = [],
  projectId
}: CharacterFormProps) {
  const isEditing = !!character
  
  const [form, setForm] = useState<
    Omit<Character, "id" | "relationships" | "age"> & { age: string }
  >({
    name: character?.name || "",
    role: character?.role || "",
    personality: character?.personality || [],
    background: character?.background || "",
    goals: character?.goals || [],
    imageUrl: character?.imageUrl || "",
    notes: character?.notes || "",
    age: character?.age !== undefined && character?.age !== null ? String(character.age) : "",
    gender: character?.gender || "",
    description: character?.description || ""
  })
  
  const [personalityInput, setPersonalityInput] = useState("")
  const [goalInput, setGoalInput] = useState("")
  const [relationships, setRelationships] = useState<CharacterRelationship[]>(
    character?.relationships || []
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const characterIdForRelationship = character?.id || `temp-${Date.now()}`
  const projectIdForRelationship = projectId
  const [relationshipForm, setRelationshipForm] = useState<{
    targetCharacterId: string
    relationshipType: Exclude<CharacterRelationship["relationshipType"], null>
    description: string
  }>({
    targetCharacterId: "",
    relationshipType: "朋友",
    description: ""
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const addPersonality = () => {
    if (!personalityInput.trim()) return
    setForm({
      ...form,
      personality: [...form.personality, personalityInput.trim()]
    })
    setPersonalityInput("")
  }

  const removePersonality = (index: number) => {
    setForm({
      ...form,
      personality: form.personality.filter((_, i) => i !== index)
    })
  }

  const addGoal = () => {
    if (!goalInput.trim()) return
    setForm({
      ...form,
      goals: [...form.goals, goalInput.trim()]
    })
    setGoalInput("")
  }

  const removeGoal = (index: number) => {
    setForm({
      ...form,
      goals: form.goals.filter((_, i) => i !== index)
    })
  }

  const addRelationship = () => {
    if (!relationshipForm.targetCharacterId || !relationshipForm.relationshipType || !characterIdForRelationship) return
    setRelationships([
      ...relationships,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `rel-${Date.now()}`,
        projectId: projectIdForRelationship,
        sourceCharacterId: characterIdForRelationship,
        targetCharacterId: relationshipForm.targetCharacterId,
        characterId: null,
        type: null,
        relationshipType: relationshipForm.relationshipType,
        description: relationshipForm.description,
        createdAt: undefined,
        updatedAt: undefined
      }
    ])
    setRelationshipForm({ targetCharacterId: "", relationshipType: "朋友", description: "" })
  }

  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      // 准备要发送的角色数据
      const characterData = {
        id: character?.id,
        projectId,
        name: form.name,
        description: form.description,
        role: form.role,
        gender: form.gender,
        age: form.age ? Number(form.age) : undefined,
        personality: form.personality,
        goals: form.goals,
        background: form.background,
        notes: form.notes,
        relationships: relationships
      }
      
      // 调用API生成角色信息
      const generatedCharacter = await generateCharacterInfo(characterData)
      
      // 更新表单状态
      setForm({
        name: generatedCharacter.name || form.name,
        description: generatedCharacter.description || form.description,
        role: generatedCharacter.role || form.role,
        gender: generatedCharacter.gender || form.gender,
        age: generatedCharacter.age !== undefined ? String(generatedCharacter.age) : form.age,
        personality: generatedCharacter.personality || form.personality,
        goals: generatedCharacter.goals || form.goals,
        background: generatedCharacter.background || form.background,
        notes: generatedCharacter.notes || form.notes,
        imageUrl: generatedCharacter.imageUrl || form.imageUrl
      })
      
      // 如果有生成的关系数据，更新关系
      if (generatedCharacter.relationships && generatedCharacter.relationships.length > 0) {
        setRelationships(generatedCharacter.relationships)
      }
    } catch (error) {
      console.error("生成角色信息失败:", error)
      alert("生成角色信息失败，请稍后重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const base = {
      ...form,
      age: form.age === "" ? undefined : Number(form.age),
      // Strip id and sourceCharacterId from relationships before saving
      relationships: sanitizeRelationships(relationships) as CharacterRelationship[]
    }
    if (isEditing && character?.id) {
      onSave({ id: character.id, ...base })
    } else {
      onSave(base as any)
    }
  }

  const filteredCharacters = existingCharacters.filter(char => 
    character ? char.id !== character.id : true
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{isEditing ? "编辑角色" : "创建角色"}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isGenerating ? "生成中..." : "AI自动补全角色信息"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>使用AI自动生成角色信息。<br />如果已填写部分信息，AI会根据已有信息进行补全。</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              名称
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="角色名称"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium">角色类型</label>
            <input
              id="role"
              name="role"
              list="role-options"
              value={form.role}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="选择或输入角色类型"
            />
            <datalist id="role-options">
              {roleOptions.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium">年龄</label>
            <input
              id="age"
              name="age"
              type="number"
              min={0}
              value={form.age}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="年龄"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium">性别</label>
            <input
              id="gender"
              name="gender"
              list="gender-options"
              value={form.gender}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="选择或输入性别"
            />
            <datalist id="gender-options">
              {genderOptions.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label htmlFor="background" className="block text-sm font-medium">
            背景故事
          </label>
          <textarea
            id="background"
            name="background"
            rows={3}
            value={form.background}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="角色背景故事..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">性格特点</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={personalityInput}
              onChange={(e) => setPersonalityInput(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="温柔, 坚韧, 善良..."
            />
            <Button type="button" onClick={addPersonality} size="sm">
              添加
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.personality.map((trait, index) => (
              <div
                key={index}
                className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {trait}
                <button
                  type="button"
                  onClick={() => removePersonality(index)}
                  className="ml-2 text-primary hover:text-primary/70"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">目标</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="成为知名设计师, 找到真爱..."
            />
            <Button type="button" onClick={addGoal} size="sm">
              添加
            </Button>
          </div>
          <div className="mt-2 space-y-1">
            {form.goals.map((goal, index) => (
              <div key={index} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5">
                <span className="text-sm">{goal}</span>
                <button
                  type="button"
                  onClick={() => removeGoal(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {filteredCharacters.length > 0 && (
          <div>
            <label className="block text-sm font-medium">关系</label>
            <div className="mt-1 space-y-2 rounded-md border border-border p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label htmlFor="targetCharacterId" className="block text-xs text-muted-foreground">
                    相关角色
                  </label>
                  <select
                    id="targetCharacterId"
                    value={relationshipForm.targetCharacterId}
                    onChange={(e) => setRelationshipForm({ ...relationshipForm, targetCharacterId: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="">选择角色</option>
                    {filteredCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="relationshipType" className="block text-xs text-muted-foreground">关系类型</label>
                  <input
                    id="relationshipType"
                    list="relationship-type-options"
                    value={relationshipForm.relationshipType}
                    onChange={e => setRelationshipForm({ ...relationshipForm, relationshipType: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    placeholder="选择或输入关系类型"
                  />
                  <datalist id="relationship-type-options">
                    {relationshipTypeOptions.map(option => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="relationshipDescription" className="block text-xs text-muted-foreground">
                    关系描述
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="relationshipDescription"
                      value={relationshipForm.description}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, description: e.target.value })}
                      className="block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      placeholder="描述关系..."
                    />
                    <Button type="button" onClick={addRelationship} size="sm" className="shrink-0">
                      添加
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                {relationships.map((relationship, index) => {
                  const relatedChar = existingCharacters.find(c => c.id === relationship.targetCharacterId)
                  return (
                    <div key={relationship.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{relatedChar?.name || relationship.targetCharacterId}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {relationship.relationshipType}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{relationship.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRelationship(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
                {relationships.length === 0 && (
                  <p className="text-sm text-muted-foreground">暂无角色关系</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            备注
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            value={form.notes || ""}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="其他备注信息..."
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">描述</label>
          <textarea
            id="description"
            name="description"
            rows={2}
            value={form.description || ""}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="简要描述角色..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {isEditing ? "保存修改" : "创建角色"}
        </Button>
      </div>
    </form>
  )
} 