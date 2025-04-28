"use client"

export const runtime = 'edge';

import { useState, useEffect } from "react"
import Link from "next/link"
import { CharacterIcon } from "@/app/components/ui/icons"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import CharacterForm from "@/app/components/novel-editor/character-form"
import type { Character } from "@/app/types"
import { fetchCharactersPage, createCharacter, updateCharacter, deleteCharacter } from "@/app/lib/api/character"

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit" | "delete";
    character?: Character;
  }>({
    isOpen: false,
    mode: "add"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchCharactersPage({ page: 1, pageSize: 100 })
      setCharacters(res.data.records)
    } catch (err: any) {
      setError(err.message || "加载失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleAddCharacter = () => {
    setModalState({ isOpen: true, mode: "add" })
  }

  const handleEditCharacter = (character: Character) => {
    setModalState({ isOpen: true, mode: "edit", character })
  }

  const handleDeleteCharacter = (character: Character) => {
    setModalState({ isOpen: true, mode: "delete", character })
  }

  const handleSaveCharacter = async (character: Character) => {
    setIsLoading(true)
    setError(null)
    try {
      if (modalState.mode === "add") {
        await createCharacter(character)
      } else if (modalState.mode === "edit" && character.id) {
        await updateCharacter(character.id, character)
      }
      await fetchList()
      setModalState({ isOpen: false, mode: "add" })
    } catch (err: any) {
      setError(err.message || "保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!modalState.character) return
    setIsLoading(true)
    setError(null)
    try {
      await deleteCharacter(modalState.character.id)
      await fetchList()
      setModalState({ isOpen: false, mode: "add" })
    } catch (err: any) {
      setError(err.message || "删除失败")
    } finally {
      setIsLoading(false)
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
                  className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
                >
                  <CharacterIcon className="h-5 w-5" />
                  Characters
                </Link>
                <Link
                  href="/dashboard/worlds"
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
              Character Management
            </h1>
            <Button className="flex items-center gap-2" onClick={handleAddCharacter}>
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
              New Character
            </Button>
          </div>

          {isLoading && <div className="p-8 text-center">加载中...</div>}
          {error && <div className="p-8 text-center text-red-500">{error}</div>}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <div
                key={character.id}
                className="flex flex-col rounded-lg border bg-card transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-center rounded-t-lg bg-accent/30 p-6">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full 
                    ${
                      character.role === "protagonist"
                        ? "bg-primary/20"
                        : character.role === "antagonist"
                        ? "bg-destructive/20"
                        : "bg-muted"
                    }`}
                  >
                    <span className="text-2xl font-bold">
                      {character.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="text-xl font-semibold">{character.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {character.personality?.map((trait, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {character.background}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    年龄: {character.age ?? "-"} ｜ 性别: {character.gender === "male" ? "男" : character.gender === "female" ? "女" : "其他"}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {character.description}
                  </div>
                </div>
                <div className="flex justify-end gap-2 p-4 pt-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCharacter(character)}>编辑</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteCharacter(character)}>删除</Button>
                </div>
              </div>
            ))}

            <div 
              onClick={handleAddCharacter}
              className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center hover:border-primary/50 hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <CharacterIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Create New Character</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add detailed character profiles with AI-powered suggestions
              </p>
            </div>
          </div>
        </main>
      </div>

      {modalState.isOpen && (modalState.mode === "add" || modalState.mode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              {modalState.mode === "add" ? "Create New Character" : "Edit Character"}
            </h2>
            <CharacterForm
              character={modalState.character}
              onSave={handleSaveCharacter}
              onCancel={handleCancelModal}
              existingCharacters={characters}
            />
          </div>
        </div>
      )}

      {modalState.isOpen && modalState.mode === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">Delete Character</h2>
            <p className="mb-4 text-muted-foreground">
              Are you sure you want to delete the character "{modalState.character?.name}"? This action cannot be undone.
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