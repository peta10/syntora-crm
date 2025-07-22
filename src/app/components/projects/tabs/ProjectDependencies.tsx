import React, { useState } from 'react';
import { Project } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  Plus,
  Calendar,
  ArrowRight,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Link
} from 'lucide-react';

interface ProjectDependenciesProps {
  project: Project;
}

interface ProjectDependency {
  id: string;
  project_id: string;
  dependent_project_id: string;
  dependency_type: 'blocks' | 'required_by' | 'related_to';
  status: 'active' | 'resolved' | 'blocked';
  description?: string;
  created_at: string;
  updated_at: string;
  resolution_date?: string;
}

export const ProjectDependencies: React.FC<ProjectDependenciesProps> = ({
  project
}) => {
  const [dependencies, setDependencies] = useState<ProjectDependency[]>([]);
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [editingDependency, setEditingDependency] = useState<ProjectDependency | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectDependency['status']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status'>('date');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDependencyTypeColor = (type: ProjectDependency['dependency_type']) => {
    switch (type) {
      case 'blocks': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'required_by': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'related_to': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: ProjectDependency['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'resolved': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'blocked': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleAddDependency = () => {
    // TODO: Implement dependency addition
    setShowAddDependency(false);
  };

  const handleEditDependency = (dependency: ProjectDependency) => {
    // TODO: Implement dependency editing
    setEditingDependency(null);
  };

  const handleDeleteDependency = (id: string) => {
    // TODO: Implement dependency deletion
  };

  const handleResolveDependency = (id: string) => {
    // TODO: Implement dependency resolution
  };

  const filteredDependencies = dependencies
    .filter(dep => {
      if (filterStatus === 'all') return true;
      return dep.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'type':
          return a.dependency_type.localeCompare(b.dependency_type);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const activeDependencies = dependencies.filter(d => d.status === 'active');
  const blockedDependencies = dependencies.filter(d => d.status === 'blocked');
  const resolvedDependencies = dependencies.filter(d => d.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Dependencies</h2>
          <p className="text-gray-400">Manage project dependencies and blockers</p>
        </div>
        <Button
          onClick={() => setShowAddDependency(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dependency
        </Button>
      </div>

      {/* Dependency Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <GitBranch className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{dependencies.length}</div>
              <div className="text-sm text-gray-400">Total Dependencies</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Link className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeDependencies.length}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{blockedDependencies.length}</div>
              <div className="text-sm text-gray-400">Blocked</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{resolvedDependencies.length}</div>
              <div className="text-sm text-gray-400">Resolved</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dependencies..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* Dependencies List */}
      <div className="grid gap-4">
        {filteredDependencies.map((dependency) => (
          <Card
            key={dependency.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${getDependencyTypeColor(dependency.dependency_type)}`}>
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white">Project {dependency.dependent_project_id}</h3>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-white">Project {dependency.project_id}</h3>
                  </div>
                  {dependency.description && (
                    <p className="text-sm text-gray-400 mt-1">{dependency.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getDependencyTypeColor(dependency.dependency_type)}`}>
                      {dependency.dependency_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(dependency.status)}`}>
                      {dependency.status.toUpperCase()}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Created {formatDate(dependency.created_at)}</span>
                    </div>
                    {dependency.resolution_date && (
                      <div className="flex items-center text-gray-400">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span>Resolved {formatDate(dependency.resolution_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {dependency.status !== 'resolved' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolveDependency(dependency.id)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingDependency(dependency)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDependency(dependency.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredDependencies.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No dependencies found</h3>
            <p className="text-gray-400 mb-4">
              {filterStatus === 'all'
                ? 'Start by adding project dependencies'
                : `No ${filterStatus} dependencies found`}
            </p>
            <Button
              onClick={() => setShowAddDependency(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Dependency
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddDependency || editingDependency) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingDependency ? 'Edit Dependency' : 'Add Dependency'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDependency(false);
                setEditingDependency(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingDependency ? handleEditDependency(editingDependency) : handleAddDependency()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingDependency ? 'Update Dependency' : 'Add Dependency'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 