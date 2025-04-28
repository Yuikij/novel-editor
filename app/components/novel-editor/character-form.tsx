"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import type { Character, CharacterRelationship } from "@/app/types"

interface CharacterFormProps {
  character?: Character
  onSave: (character: Character) => void
  onCancel: () => void
  existingCharacters?: Character[]
}

export default function CharacterForm({
  character,
  onSave,
  onCancel,
  existingCharacters = []
}: CharacterFormProps) {
  const isEditing = !!character
  
  const [form, setForm] = useState<
    Omit<Character, "id" | "relationships" | "age"> & { age: string }
  >({
    name: character?.name || "",
    role: character?.role || "supporting",
    personality: character?.personality || [],
    background: character?.background || "",
    goals: character?.goals || [],
    imageUrl: character?.imageUrl || "",
    notes: character?.notes || "",
    age: character?.age !== undefined && character?.age !== null ? String(character.age) : "",
    gender: character?.gender || "other",
    description: character?.description || ""
  })
  
  const [personalityInput, setPersonalityInput] = useState("")
  const [goalInput, setGoalInput] = useState("")
  const [relationships, setRelationships] = useState<CharacterRelationship[]>(
    character?.relationships || []
  )
  const [relationshipForm, setRelationshipForm] = useState({
    characterId: "",
    type: "friend" as CharacterRelationship["type"],
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
    if (!relationshipForm.characterId || !relationshipForm.description) return
    setRelationships([...relationships, { ...relationshipForm }])
    setRelationshipForm({
      characterId: "",
      type: "friend",
      description: ""
    })
  }

  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const base = {
      ...form,
      age: form.age === "" ? undefined : Number(form.age),
      relationships
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
            <label htmlFor="role" className="block text-sm font-medium">
              角色类型
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="protagonist">主角</option>
              <option value="antagonist">反派</option>
              <option value="supporting">配角</option>
              <option value="minor">次要角色</option>
            </select>
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
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
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
                  <label htmlFor="characterId" className="block text-xs text-muted-foreground">
                    相关角色
                  </label>
                  <select
                    id="characterId"
                    value={relationshipForm.characterId}
                    onChange={(e) => setRelationshipForm({ ...relationshipForm, characterId: e.target.value })}
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
                  <label htmlFor="relationshipType" className="block text-xs text-muted-foreground">
                    关系类型
                  </label>
                  <select
                    id="relationshipType"
                    value={relationshipForm.type}
                    onChange={(e) => setRelationshipForm({ ...relationshipForm, type: e.target.value as CharacterRelationship["type"] })}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="friend">友人</option>
                    <option value="enemy">敌人</option>
                    <option value="love">恋人</option>
                    <option value="family">家人</option>
                    <option value="rival">竞争对手</option>
                    <option value="mentor">导师</option>
                    <option value="other">其他</option>
                  </select>
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
                  const relatedChar = existingCharacters.find(c => c.id === relationship.characterId)
                  return (
                    <div key={index} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{relatedChar?.name || relationship.characterId}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {relationship.type}
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