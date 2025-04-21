"use client"

import { useState } from "react"
import Link from "next/link"
import { CharacterIcon } from "@/app/components/ui/icons"
import DashboardHeader from "@/app/components/layout/dashboard-header"
import { Button } from "@/app/components/ui/button"
import CharacterForm from "@/app/components/novel-editor/character-form"
import type { Character } from "@/app/types"

const initialCharacters: Character[] = [
  {
    id: "1",
    name: "林雨荷",
    role: "protagonist",
    personality: ["温柔", "坚韧", "善良"],
    background: "江南设计师，出身普通家庭，但有才华横溢的设计天赋。",
    goals: ["成为知名设计师", "找到真爱"],
    relationships: [],
  },
  {
    id: "2",
    name: "陈明辉",
    role: "protagonist",
    personality: ["沉稳", "专注", "略带神秘"],
    background: "知名艺术收藏家，出身豪门，但不喜欢世俗的纷争。",
    goals: ["寻找真正的艺术", "摆脱家族束缚"],
    relationships: [
      {
        characterId: "1",
        type: "love",
        description: "对林雨荷一见钟情，被她的才华和纯真所吸引。",
      },
    ],
  },
  {
    id: "3",
    name: "周世豪",
    role: "antagonist",
    personality: ["傲慢", "精明", "势利"],
    background: "商业巨子的独子，从小被宠溺长大，习惯了得到一切。",
    goals: ["扩大家族势力", "追求林雨荷"],
    relationships: [
      {
        characterId: "1",
        type: "rival",
        description: "觊觎林雨荷多时，想要占有她。",
      },
      {
        characterId: "2",
        type: "enemy",
        description: "家族世交，但暗中较劲，视陈明辉为情敌。",
      },
    ],
  },
]

type ModalState = {
  isOpen: boolean;
  mode: "add" | "edit" | "delete";
  character?: Character;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add"
  })

  const handleAddCharacter = () => {
    setModalState({
      isOpen: true,
      mode: "add"
    })
  }

  const handleEditCharacter = (character: Character) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      character
    })
  }

  const handleDeleteCharacter = (character: Character) => {
    setModalState({
      isOpen: true,
      mode: "delete",
      character
    })
  }

  const handleSaveCharacter = (character: Character) => {
    if (modalState.mode === "add") {
      setCharacters([...characters, character])
    } else if (modalState.mode === "edit") {
      setCharacters(characters.map(c => c.id === character.id ? character : c))
    }
    setModalState({ isOpen: false, mode: "add" })
  }

  const handleConfirmDelete = () => {
    if (modalState.character) {
      setCharacters(characters.filter(c => c.id !== modalState.character?.id))
      setModalState({ isOpen: false, mode: "add" })
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
                    {character.personality.map((trait, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {character.background}
                  </p>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Goals:</h4>
                    <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                      {character.goals.map((goal, i) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  {character.relationships.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium">Relationships:</h4>
                      <div className="mt-1 space-y-1">
                        {character.relationships.map((rel, i) => {
                          const relatedChar = characters.find(c => c.id === rel.characterId);
                          return (
                            <div key={i} className="flex items-center gap-1 text-sm text-muted-foreground">
                              <span className="font-medium">{relatedChar?.name || rel.characterId}</span>
                              <span>({rel.type})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      character.role === "protagonist"
                        ? "bg-primary/10 text-primary"
                        : character.role === "antagonist"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {character.role.charAt(0).toUpperCase() +
                      character.role.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditCharacter(character)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive/80" 
                      onClick={() => handleDeleteCharacter(character)}
                    >
                      Delete
                    </Button>
                  </div>
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
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
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