'use client';

import { useState, useEffect } from 'react';
import { Project, Todo } from '@/app/types/todo';
import { projectsService } from '@/app/lib/supabase/projects';
import { ProjectManager } from '@/app/components/projects/ProjectManager';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading projects...');
      const data = await projectsService.getProjects();
      console.log('Projects loaded:', data);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating project with data:', projectData);
      
      const newProject = await projectsService.createProject(projectData);
      console.log('Project created successfully:', newProject);
      
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
      throw error; // Re-throw to let the dialog handle it
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      console.log('Updating project:', id, updates);
      const updatedProject = await projectsService.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to update project');
      throw error;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      console.log('Deleting project:', id);
      await projectsService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete project');
      throw error;
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
        <p className="text-gray-400">Manage your projects and track progress</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
          <button
            onClick={loadProjects}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ProjectManager
          projects={projects}
          todos={todos}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          loading={loading}
        />
      )}
    </div>
  );
} 