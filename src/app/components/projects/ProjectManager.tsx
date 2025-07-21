'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Calendar, Clock, CheckCircle, 
  Target, Folder, BarChart3, Users, Star, Archive,
  Play, Pause, MoreVertical, TrendingUp
} from 'lucide-react';
import { Project, Todo } from '@/app/types/todo';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectDetails } from './ProjectDetails';

interface ProjectManagerProps {
  projects: Project[];
  todos: Todo[];
  onCreateProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAssignTaskToProject: (taskId: string, projectId: string) => Promise<void>;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  todos,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onAssignTaskToProject
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'created' | 'due_date'>('created');

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    overdue: projects.filter(p => 
      p.due_date && 
      new Date(p.due_date) < new Date() && 
      p.status !== 'completed'
    ).length
  };

  // Enhanced projects with calculated progress and task counts
  const enhancedProjects = projects.map(project => {
    const projectTasks = todos.filter(todo => todo.project_id === project.id);
    const completedTasks = projectTasks.filter(todo => todo.completed);
    const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
    
    return {
      ...project,
      total_tasks: projectTasks.length,
      completed_tasks: completedTasks.length,
      progress_percentage: Math.round(progress),
      actual_hours: projectTasks.reduce((sum, task) => sum + (task.actual_duration || 0), 0) / 60,
      is_overdue: project.due_date && new Date(project.due_date) < new Date() && project.status !== 'completed'
    };
  });

  // Filter and sort projects
  const filteredProjects = enhancedProjects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'progress':
        return b.progress_percentage - a.progress_percentage;
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case 'created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    await onCreateProject(projectData);
    setShowCreateForm(false);
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    await onUpdateProject(id, updates);
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await onDeleteProject(id);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      active: 'text-green-400 bg-green-400/20',
      completed: 'text-blue-400 bg-blue-400/20',
      on_hold: 'text-yellow-400 bg-yellow-400/20',
      archived: 'text-gray-400 bg-gray-400/20'
    };
    return colors[status] || colors.active;
  };

  if (selectedProject) {
    const project = enhancedProjects.find(p => p.id === selectedProject);
    if (project) {
      return (
        <ProjectDetails
          project={project}
          tasks={todos.filter(t => t.project_id === selectedProject)}
          onBack={() => setSelectedProject(null)}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onAssignTask={onAssignTaskToProject}
        />
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Project Manager</h1>
          <p className="text-gray-400">Organize your tasks into meaningful projects and track progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                     text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Folder className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{projectStats.total}</div>
              <div className="text-sm text-gray-400">Total Projects</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Play className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{projectStats.active}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{projectStats.completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Pause className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{projectStats.onHold}</div>
              <div className="text-sm text-gray-400">On Hold</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">{projectStats.overdue}</div>
              <div className="text-sm text-gray-400">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed' | 'on_hold')}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'progress' | 'created' | 'due_date')}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">Sort by Created</option>
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="due_date">Sort by Due Date</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {sortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">Create your first project to get started organizing your tasks</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          <AnimatePresence>
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
                onClick={() => setSelectedProject(project.id)}
                onEdit={() => setEditingProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
                onStatusChange={(status: Project['status']) => handleUpdateProject(project.id, { status })}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <ProjectForm
            onSubmit={handleCreateProject}
            onClose={() => setShowCreateForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {editingProject && (
          <ProjectForm
            project={editingProject}
            onSubmit={(data: Partial<Project>) => handleUpdateProject(editingProject.id, data)}
            onClose={() => setEditingProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 