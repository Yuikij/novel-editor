"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { Button } from "@/app/components/ui/button";
import { fetchProjectsPage, deleteProject, Project } from '@/app/lib/api/project';
import { useRouter } from 'next/navigation';
import NovelSettingsForm from '@/app/components/novel-editor/novel-settings-form';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const fetchList = () => {
    setIsLoading(true);
    fetchProjectsPage({ page: 1, pageSize: 20 })
      .then(res => setProjects(res.data.records))
      .catch(err => setHasError(err.message || '加载失败'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`确定要删除项目「${project.title}」吗？`)) return;
    setIsLoading(true);
    try {
      await deleteProject(project.id);
      setProjects(projects => projects.filter(p => p.id !== project.id));
    } catch (err: any) {
      setHasError(err.message || '删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = () => {
    setShowForm(false);
    fetchList();
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));

  if (isLoading) return <div className="p-8 text-center">加载中...</div>;
  if (hasError) return <div className="p-8 text-center text-red-500">{hasError}</div>;

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">创建新项目</h2>
            {/* 这里假设有 worlds 数据可用，实际可根据你的数据流调整 */}
            <NovelSettingsForm 
              onSave={handleProjectCreated}
              onCancel={() => setShowForm(false)}
              worlds={[]}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 hover:border-primary transition-colors h-full flex flex-col">
            <Link href={`/dashboard/project/${project.id}`} className="block flex-1">
              <h3 className="text-xl font-medium">{project.title}</h3>
              {project.synopsis && (
                <p className="text-muted-foreground mt-2 line-clamp-3 flex-grow">
                  {project.synopsis}
                </p>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>创建于: {formatDate(project.createdAt || '')}</p>
                <p>更新于: {formatDate(project.updatedAt || '')}</p>
              </div>
            </Link>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => {/* 跳转到编辑页 */}}>编辑</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(project)}>删除</Button>
            </div>
          </div>
        ))}
        <div className="border border-dashed rounded-lg flex items-center justify-center h-full">
          <Button 
            variant="outline"
            size="lg"
            className="w-full h-full flex flex-col items-center justify-center p-8 gap-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowForm(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            <p className="font-medium">创建新项目</p>
          </Button>
        </div>
      </div>
    </div>
  );
} 