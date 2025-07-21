'use client';

import React, { useState, useMemo } from 'react';
import { 
  List, 
  Grid3X3, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Target,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff,
  Plus,
  BarChart2,
  Users,
  Folder,
  Play,
  Pause,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Project, Todo } from '@/app/types/todo';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';

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
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

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

    // Apply search filter
    if (searchQuery) {
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
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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

  const handleCreateProjectSubmit = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    await onCreateProject(projectData);
  };

  const handleUpdateProjectSubmit = async (id: string, updates: Partial<Project>) => {
    await onUpdateProject(id, updates);
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const isExpanded = expandedProjects.has(project.id);
    const projectTodos = todos.filter(t => t.project_id === project.id);
    const completedTodos = projectTodos.filter(t => t.completed);
    const progress = projectTodos.length > 0 
      ? (completedTodos.length / projectTodos.length) * 100 
      : 0;

    return (
      <Card className={`bg-gray-800/50 border-gray-700/50 backdrop-blur-sm transition-all duration-200 ${
        viewMode === 'grid' ? 'hover:scale-[1.02]' : ''
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-lg"
              style={{ backgroundColor: project.color + '20', color: project.color }}
            >
              {project.icon}
            </div>
            <CardTitle className="text-lg font-semibold text-white">
              {project.title}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setEditingProject(project)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400"
              onClick={() => onDeleteProject(project.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <CardDescription className="text-gray-400 mt-1">
              {project.description}
            </CardDescription>
          )}
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {project.estimated_hours ? `${project.estimated_hours}h estimated` : 'No time estimate'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={`
                  ${project.status === 'active' ? 'border-green-500/30 text-green-400' : ''}
                  ${project.status === 'completed' ? 'border-blue-500/30 text-blue-400' : ''}
                  ${project.status === 'on_hold' ? 'border-yellow-500/30 text-yellow-400' : ''}
                  ${project.status === 'archived' ? 'border-gray-500/30 text-gray-400' : ''}
                `}
              >
                {project.status}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-300">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>

            {project.category && (
              <div className="flex items-center space-x-2 text-sm">
                <Folder className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{project.category}</span>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="bg-gray-700/50 text-gray-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-gray-400 mt-1">Manage your projects and track progress</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* View Toggle */}
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

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-[#6E86FF]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="progress">Progress</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-[#6E86FF]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-[#6E86FF]"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
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
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProjectSubmit}
      />

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={() => setEditingProject(null)}
          onUpdateProject={handleUpdateProjectSubmit}
        />
      )}
    </div>
  );
} 