'use client';

import React, { useState, useMemo } from 'react';
import { 
  List, Grid3X3, Search, Filter, Target, 
  Users, Plus, Calendar, Clock, CheckCircle2,
  Star, Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project, Todo } from '@/app/types/todo';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';
import { ProjectCard } from './ProjectCard';
import { ProjectDetails } from './ProjectDetails';

interface ProjectManagerProps {
  projects: Project[];
  todos: Todo[];
  onCreateProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  onDeleteProject: (id: string) => Promise<void>;
  loading: boolean;
}

type ViewMode = 'list' | 'grid';
type SortMode = 'newest' | 'oldest' | 'alphabetical' | 'progress';
type FilterMode = 'all' | 'active' | 'completed' | 'on_hold' | 'archived';

export function ProjectManager({ 
  projects, 
  todos, 
  onCreateProject, 
  onUpdateProject, 
  onDeleteProject,
  loading
}: ProjectManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // Get unique categories from projects
  const categories = useMemo(() => {
    const cats = projects
      .map(p => p.category)
      .filter(Boolean)
      .filter((cat, index, arr) => arr.indexOf(cat) === index);
    return ['all', ...cats];
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(p => p.status === filterMode);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply sorting
    switch (sortMode) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress':
        filtered.sort((a, b) => b.progress_percentage - a.progress_percentage);
        break;
    }

    return filtered;
  }, [projects, searchQuery, filterMode, selectedCategory, sortMode]);

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const avgProgress = Math.round(
      projects.reduce((sum, p) => sum + p.progress_percentage, 0) / (projects.length || 1)
    );

    return { totalProjects, activeProjects, completedProjects, avgProgress };
  };

  const stats = getProjectStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Projects Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your projects and track progress
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
              <div className="text-sm text-blue-300">Total Projects</div>
              <div className="text-xs text-gray-400">All projects</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
              <div className="text-sm text-green-300">Active Projects</div>
              <div className="text-xs text-gray-400">In progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.completedProjects}</div>
              <div className="text-sm text-purple-300">Completed</div>
              <div className="text-xs text-gray-400">Finished projects</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.avgProgress}%</div>
              <div className="text-sm text-orange-300">Avg Progress</div>
              <div className="text-xs text-gray-400">Overall completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center ${
                viewMode === 'list' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center ${
                viewMode === 'grid' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as FilterMode)}
          className="px-3 py-2 bg-gray-800/50 border-gray-700/50 rounded-lg text-gray-300 focus:outline-none focus:border-[#6E86FF]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-gray-800/50 border-gray-700/50 rounded-lg text-gray-300 focus:outline-none focus:border-[#6E86FF]"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="px-3 py-2 bg-gray-800/50 border-gray-700/50 rounded-lg text-gray-300 focus:outline-none focus:border-[#6E86FF]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="progress">Progress</option>
        </select>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery || filterMode !== 'all' || selectedCategory !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Create your first project to get started'
            }
          </p>
          {!searchQuery && filterMode === 'all' && selectedCategory === 'all' && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onClick={() => {
                setSelectedProject(project);
                setShowProjectDetails(true);
              }}
              onEdit={() => {
                setEditingProject(project);
                setShowProjectDetails(false);
              }}
              onDelete={() => onDeleteProject(project.id)}
              onStatusChange={(status) => onUpdateProject(project.id, { status })}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={onCreateProject}
      />

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={() => setEditingProject(null)}
          onUpdateProject={onUpdateProject}
        />
      )}

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          isOpen={showProjectDetails}
          onClose={() => {
            setShowProjectDetails(false);
            setSelectedProject(null);
          }}
          onEdit={() => {
            setEditingProject(selectedProject);
            setShowProjectDetails(false);
          }}
          onDelete={onDeleteProject}
          onUpdateProject={onUpdateProject}
        />
      )}
    </div>
  );
} 