"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/app/lib/utils';
import { FaPlus } from 'react-icons/fa';
import { Button } from "@/app/components/ui/button";

export interface Project {
  id: string;
  title: string;
  synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectListProps {
  onCreateNew?: () => void;
}

export default function ProjectList({ onCreateNew }: ProjectListProps) {
  // Sample data - would be fetched from API in production
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: '龙与魔法的世界',
      synopsis: '一个关于龙与魔法的奇幻冒险故事...',
      createdAt: new Date('2023-04-10'),
      updatedAt: new Date('2023-05-15'),
    },
    {
      id: '2',
      title: '未来都市',
      synopsis: '在2150年的未来都市中发生的科幻故事...',
      createdAt: new Date('2023-03-22'),
      updatedAt: new Date('2023-05-10'),
    },
    {
      id: '3',
      title: '神秘岛屿',
      synopsis: '一群探险家在一个神秘岛屿上的冒险...',
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2023-04-28'),
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/project/${project.id}`}
            className="block"
          >
            <div className="border rounded-lg p-4 hover:border-primary transition-colors h-full flex flex-col">
              <h3 className="text-xl font-medium">{project.title}</h3>
              {project.synopsis && (
                <p className="text-muted-foreground mt-2 line-clamp-3 flex-grow">
                  {project.synopsis}
                </p>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>创建于: {formatDate(project.createdAt)}</p>
                <p>更新于: {formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </Link>
        ))}

        <div className="border border-dashed rounded-lg flex items-center justify-center h-full">
          <Button 
            variant="outline"
            size="lg"
            className="w-full h-full flex flex-col items-center justify-center p-8 gap-2 hover:bg-accent hover:text-accent-foreground"
            onClick={onCreateNew}
          >
            <FaPlus className="h-6 w-6" />
            <p className="font-medium">创建新项目</p>
          </Button>
        </div>
      </div>
    </div>
  );
} 