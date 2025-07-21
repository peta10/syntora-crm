'use client';

import React, { useState } from 'react';
import { ProjectManager } from '@/app/components/projects/ProjectManager';
import useStore from '@/app/store/slices/todoSlice';
import { Project } from '@/app/types/todo';

export default function ProjectsPage() {
  const { todos } = useStore();
  const [projects, setProjects] = useState<Project[]>([
    // Sample project for demonstration
    {
      id: '1',
      title: 'Syntora Todo App',
      description: 'Building the ultimate productivity application',
      color: '#6E86FF',
      icon: '🚀',
      status: 'active',
      progress_percentage: 75,
      total_tasks: 12,
      completed_tasks: 9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'Development',
      tags: ['productivity', 'app', 'nextjs']
    }
  ]);

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setProjects(prev => [...prev, newProject]);
    console.log('Created project:', newProject);
    // Implementation would save to your Supabase backend
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
    console.log('Updated project:', id, updates);
    // Implementation would update in your Supabase backend
  };

  const handleDeleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    console.log('Deleted project:', id);
    // Implementation would delete from your Supabase backend
  };

  const handleAssignTaskToProject = async (taskId: string, projectId: string) => {
    console.log('Assigning task to project:', taskId, projectId);
    // Implementation would update task with project_id in your Supabase backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <ProjectManager
        projects={projects}
        todos={todos}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onAssignTaskToProject={handleAssignTaskToProject}
      />
    </div>
  );
} 