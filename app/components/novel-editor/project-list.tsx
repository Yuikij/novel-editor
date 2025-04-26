"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { Button } from "@/app/components/ui/button";
import type { NovelProject } from '@/app/types';

interface ProjectListProps {
  projects: NovelProject[];
  onEdit: (project: NovelProject) => void;
  onDelete: (project: NovelProject) => void;
  onCreateNew?: () => void;
}

export default function ProjectList({ projects, onEdit, onDelete, onCreateNew }: ProjectListProps) {
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 hover:border-primary transition-colors h-full flex flex-col">
            <Link href={`/dashboard/project/${project.id}`} className="block flex-1">
              <h3 className="text-xl font-medium">{project.title}</h3>
              {project.metadata?.synopsis && (
                <p className="text-muted-foreground mt-2 line-clamp-3 flex-grow">
                  {project.metadata.synopsis}
                </p>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>创建于: {formatDate(project.createdAt)}</p>
                <p>更新于: {formatDate(project.updatedAt)}</p>
              </div>
            </Link>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>编辑</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(project)}>删除</Button>
            </div>
          </div>
        ))}
        <div className="border border-dashed rounded-lg flex items-center justify-center h-full">
          <Button 
            variant="outline"
            size="lg"
            className="w-full h-full flex flex-col items-center justify-center p-8 gap-2 hover:bg-accent hover:text-accent-foreground"
            onClick={onCreateNew}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            <p className="font-medium">创建新项目</p>
          </Button>
        </div>
      </div>
    </div>
  );
} 