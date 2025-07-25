"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { Button } from "@/app/components/ui/button";
import { fetchProjectsPage, deleteProject, Project, updateProject, fetchProject, createProject } from '@/app/lib/api/project';
import NovelSettingsForm from './novel-settings-form';
import type { NovelProject, NovelMetadata, WorldBuilding } from '@/app/types';
import { fetchWorldsPage } from '@/app/lib/api/world';

export default function ProjectList({ onRefetch, onCreateNew }: { onRefetch?: (refetch: () => void) => void, onCreateNew?: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [worlds, setWorlds] = useState<WorldBuilding[]>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchList = () => {
    setIsLoading(true);
    fetchProjectsPage({ page: 1, pageSize: 20 })
      .then(res => setProjects(res.data.records))
      .catch(err => setHasError(err.message || '加载失败'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchList();
    fetchWorldsPage({ page: 1, pageSize: 50 })
      .then(res => setWorlds(res.data.records))
      .catch(() => setWorlds([]));
    if (onRefetch) onRefetch(fetchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`确定要删除项目「${project.title}」吗？`)) return;
    setIsLoading(true);
    setHasError(null);
    try {
      await deleteProject(project.id);
      fetchList();
    } catch (err: any) {
      let msg = err?.message || '删除失败';
      if (err?.response) {
        try {
          const data = await err.response.json();
          if (data?.message) msg = data.message;
        } catch {}
      }
      setHasError(msg);
      window.alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (project: Project) => {
    setIsFetchingDetails(true);
    setEditError(null);
    try {
      // 获取项目的完整详情信息
      const projectDetails = await fetchProject(project.id);
      
      // 转换为NovelProject格式，确保synopsis正确映射
      const novelProject: NovelProject = {
        id: projectDetails.id,
        title: projectDetails.title,
        genre: projectDetails.genre || '',
        style: projectDetails.style || '',
        type: projectDetails.type || '',
        createdAt: projectDetails.createdAt || new Date().toISOString(),
        updatedAt: projectDetails.updatedAt || new Date().toISOString(),
        coverGradient: ["#4f46e5", "#818cf8"], // 默认渐变色
        metadata: {
          synopsis: projectDetails.synopsis || '', // 从Project.synopsis映射到metadata.synopsis
          tags: projectDetails.tags || [],
          targetAudience: projectDetails.targetAudience || '',
          wordCountGoal: projectDetails.wordCountGoal || 0,
          status: projectDetails.status as NovelMetadata['status'] || 'draft',
          highlights: projectDetails.highlights || [],
          writingRequirements: projectDetails.writingRequirements || [],
        },
        worldId: projectDetails.worldId || '',
        templateId: projectDetails.templateId || ''
      };
      
      setEditingProject(novelProject as any);
      setEditModalOpen(true);
    } catch (err: any) {
      const msg = err?.message || '获取项目详情失败';
      setEditError(msg);
      window.alert(msg);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleEditSave = async (novelProject: NovelProject) => {
    setEditError(null);
    setIsLoading(true);
    try {
      await updateProject(novelProject.id, {
        ...novelProject,
        synopsis: novelProject.metadata.synopsis,
        tags: novelProject.metadata.tags,
        targetAudience: novelProject.metadata.targetAudience,
        wordCountGoal: novelProject.metadata.wordCountGoal,
        highlights: novelProject.metadata.highlights,
        writingRequirements: novelProject.metadata.writingRequirements,
        status: novelProject.metadata.status,
      });
      setEditModalOpen(false);
      setEditingProject(null);
      fetchList();
      setEditSuccessMsg('项目更新成功');
      setTimeout(() => setEditSuccessMsg(null), 2000);
    } catch (err: any) {
      let msg = err?.message || '保存失败';
      if (err?.response) {
        try {
          const data = await err.response.json();
          if (data?.message) msg = data.message;
        } catch {}
      }
      setEditError(msg);
      window.alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingProject(null);
    setEditError(null);
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));

  const handleCreateProject = async (novelProject: NovelProject) => {
    setCreateError(null);
    setIsLoading(true);
    try {
      // 将NovelProject转换为Project API格式
      const apiProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        title: novelProject.title,
        genre: novelProject.genre,
        style: novelProject.style,
        type: novelProject.type,
        synopsis: novelProject.metadata.synopsis, // 从metadata.synopsis映射到Project.synopsis
        tags: novelProject.metadata.tags,
        targetAudience: novelProject.metadata.targetAudience,
        wordCountGoal: novelProject.metadata.wordCountGoal,
        highlights: novelProject.metadata.highlights,
        writingRequirements: novelProject.metadata.writingRequirements,
        status: novelProject.metadata.status,
        worldId: novelProject.worldId,
        templateId: novelProject.templateId,
      };

      await createProject(apiProject as Project);
      setCreateModalOpen(false);
      fetchList();
    } catch (err: any) {
      let msg = err?.message || '创建项目失败';
      if (err?.response) {
        try {
          const data = await err.response.json();
          if (data?.message) msg = data.message;
        } catch {}
      }
      setCreateError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">加载中...</div>;
  if (hasError) return <div className="p-8 text-center text-red-500">{hasError}</div>;

  return (
    <div className="space-y-6">
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEdit(project)}
                disabled={isFetchingDetails}
              >
                {isFetchingDetails ? '加载中...' : '编辑'}
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(project)}>删除</Button>
            </div>
          </div>
        ))}
        <div className="border border-dashed rounded-lg flex items-center justify-center h-full">
          <Button 
            variant="outline"
            size="lg"
            className="w-full h-full flex flex-col items-center justify-center p-8 gap-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setCreateModalOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            <p className="font-medium">创建新项目</p>
          </Button>
        </div>
      </div>
      {editModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">编辑项目</h2>
            <NovelSettingsForm
              project={editingProject as any}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
              worlds={worlds}
            />
            {editError && <div className="text-red-500 text-sm mt-2">{editError}</div>}
          </div>
        </div>
      )}
      {editSuccessMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded shadow">
          {editSuccessMsg}
        </div>
      )}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">新建项目</h2>
            <NovelSettingsForm
              onSave={handleCreateProject}
              onCancel={() => setCreateModalOpen(false)}
              worlds={worlds}
            />
            {createError && <div className="text-red-500 text-sm mt-2">{createError}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 