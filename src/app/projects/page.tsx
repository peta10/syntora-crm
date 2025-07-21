'use client';

import React, { useState, useEffect } from 'react';
import { ProjectManager } from '@/app/components/projects/ProjectManager';
import useStore from '@/app/store/slices/todoSlice';
import { Project } from '@/app/types/todo';
import { projectsService, CreateProjectData, UpdateProjectData } from '@/app/lib/supabase/projects';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { todos } = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects from database on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsData = await projectsService.getProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const createData: CreateProjectData = {
        title: projectData.title,
        description: projectData.description || '',
        color: projectData.color || '#6E86FF',
        icon: projectData.icon || '📁',
        status: projectData.status || 'active',
        category: projectData.category,
        tags: projectData.tags,
        estimated_hours: projectData.estimated_hours,
        is_public: false, // Default to private
      };

      const newProject = await projectsService.createProject(createData);
      setProjects(prev => [newProject, ...prev]); // Add to beginning for newest first
      toast.success('Project created successfully!');
      
      console.log('Created project:', newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updateData: UpdateProjectData = {
        title: updates.title,
        description: updates.description,
        color: updates.color,
        icon: updates.icon,
        status: updates.status,
        category: updates.category,
        tags: updates.tags,
        estimated_hours: updates.estimated_hours,
        actual_hours: updates.actual_hours,
      };

      const updatedProject = await projectsService.updateProject(id, updateData);
      setProjects(prev => prev.map(p => 
        p.id === id ? updatedProject : p
      ));
      toast.success('Project updated successfully!');
      
      console.log('Updated project:', id, updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectsService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted successfully!');
      
      console.log('Deleted project:', id);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleAssignTaskToProject = async (taskId: string, projectId: string) => {
    try {
      await projectsService.assignTaskToProject(taskId, projectId);
      
      // Refresh the specific project to update task counts
      const updatedProject = await projectsService.getProjectById(projectId);
      if (updatedProject) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? updatedProject : p
        ));
      }
      
      toast.success('Task assigned to project successfully!');
      console.log('Assigned task to project:', taskId, projectId);
    } catch (error) {
      console.error('Error assigning task to project:', error);
      toast.error('Failed to assign task to project');
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const duplicatedProject = await projectsService.duplicateProject(id);
      setProjects(prev => [duplicatedProject, ...prev]);
      toast.success('Project duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast.error('Failed to duplicate project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center bg-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadProjects}
            className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <ProjectManager
        projects={projects}
        todos={todos}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onAssignTaskToProject={handleAssignTaskToProject}
        onDuplicateProject={handleDuplicateProject}
        defaultView="list" // Always start in list view
        defaultSort="newest" // Show newest projects first
      />
    </div>
  );
} 