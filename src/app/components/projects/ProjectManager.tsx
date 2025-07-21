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
  onCreateProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAssignTaskToProject: (taskId: string, projectId: string) => Promise<void>;
  onDuplicateProject?: (id: string) => Promise<void>;
  defaultView?: 'list' | 'grid';
  defaultSort?: 'newest' | 'oldest' | 'alphabetical' | 'progress';
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
  onAssignTaskToProject,
  onDuplicateProject,
  defaultView = 'list',
  defaultSort = 'newest'
}: ProjectManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [sortMode, setSortMode] = useState<SortMode>(defaultSort);
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
    let filtered = projects;

    // Apply status filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(p => p.status === filterMode);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

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

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortMode) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'progress':
          return (b.progress_percentage || 0) - (a.progress_percentage || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, filterMode, selectedCategory, searchQuery, sortMode]);

  const handleToggleExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getProjectTasks = (projectId: string) => {
    return todos.filter(todo => todo.project_id === projectId);
  };

  const getStatusColor = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'bg-red-500/20 text-red-400 border-red-500/30';
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const projectTasks = getProjectTasks(project.id);
    const isExpanded = expandedProjects.has(project.id);

    return (
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: project.color + '20', border: `1px solid ${project.color}40` }}
              >
                {project.icon}
              </div>
              <div>
                <CardTitle className="text-white group-hover:text-white/90 transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {project.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(project.status, project.is_overdue)}>
                {project.is_overdue ? 'Overdue' : project.status.replace('_', ' ')}
              </Badge>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProject(project)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onDuplicateProject && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateProject(project.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteProject(project.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-white">{project.progress_percentage}%</span>
              </div>
              <Progress 
                value={project.progress_percentage} 
                className="h-2"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{project.completed_tasks}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{project.total_tasks}</div>
                <div className="text-xs text-gray-400">Total Tasks</div>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs bg-gray-800/50 text-gray-300 border-gray-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Category */}
            {project.category && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Category:</span>
                <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-600">
                  {project.category}
                </Badge>
              </div>
            )}

            {/* Expandable Tasks Section */}
            {projectTasks.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleExpanded(project.id)}
                  className="w-full justify-between text-gray-400 hover:text-white"
                >
                  <span>Tasks ({projectTasks.length})</span>
                  {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                
                {isExpanded && (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {projectTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded border border-gray-700/30"
                      >
                        <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className={`text-sm flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </span>
                        {task.priority && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'high' ? 'border-red-500/50 text-red-400' :
                              task.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                              'border-green-500/50 text-green-400'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="text-xs text-gray-500">
              Created: {new Date(project.created_at).toLocaleDateString()}
              {project.updated_at !== project.created_at && (
                <> • Updated: {new Date(project.updated_at).toLocaleDateString()}</>
              )}
            </div>
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

        <div className="flex items-center space-x-4">
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-[#6E86FF] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-[#6E86FF] focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-[#6E86FF] focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="progress">By Progress</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-gray-800/50 border border-gray-600/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
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
    </div>
  );
} 