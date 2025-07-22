import React, { useState } from 'react';
import { Project, ProjectResource } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Box,
  Plus,
  Calendar,
  DollarSign,
  Users2,
  Laptop,
  Wrench,
  Building,
  Package,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';

interface ProjectResourcesProps {
  project: Project;
}

export const ProjectResources: React.FC<ProjectResourcesProps> = ({
  project
}) => {
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState<ProjectResource | null>(null);
  const [filterType, setFilterType] = useState<'all' | ProjectResource['resource_type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'in_use' | 'unavailable'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'date'>('name');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResourceTypeIcon = (type: ProjectResource['resource_type']) => {
    switch (type) {
      case 'human': return <Users2 className="w-4 h-4" />;
      case 'equipment': return <Wrench className="w-4 h-4" />;
      case 'software': return <Laptop className="w-4 h-4" />;
      case 'facility': return <Building className="w-4 h-4" />;
      case 'material': return <Package className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  const getResourceTypeColor = (type: ProjectResource['resource_type']) => {
    switch (type) {
      case 'human': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'equipment': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'software': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'facility': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'material': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: ProjectResource['status']) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_use': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'unavailable': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleAddResource = () => {
    // TODO: Implement resource addition
    setShowAddResource(false);
  };

  const handleEditResource = (resource: ProjectResource) => {
    // TODO: Implement resource editing
    setEditingResource(null);
  };

  const handleDeleteResource = (id: string) => {
    // TODO: Implement resource deletion
  };

  const filteredResources = resources
    .filter(resource => {
      if (filterType !== 'all' && resource.resource_type !== filterType) return false;
      if (filterStatus !== 'all' && resource.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return (b.total_cost || 0) - (a.total_cost || 0);
        case 'date':
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

  const totalCost = resources.reduce((acc, resource) => acc + (resource.total_cost || 0), 0);
  const availableResources = resources.filter(r => r.status === 'available');
  const inUseResources = resources.filter(r => r.status === 'in_use');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Resources</h2>
          <p className="text-gray-400">Manage project resources and assets</p>
        </div>
        <Button
          onClick={() => setShowAddResource(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Resource Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Box className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{resources.length}</div>
              <div className="text-sm text-gray-400">Total Resources</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{availableResources.length}</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{inUseResources.length}</div>
              <div className="text-sm text-gray-400">In Use</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                ${totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Cost</div>
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="all">All Types</option>
              <option value="human">Human</option>
              <option value="equipment">Equipment</option>
              <option value="software">Software</option>
              <option value="facility">Facility</option>
              <option value="material">Material</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="name">Name</option>
              <option value="cost">Cost</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* Resource List */}
      <div className="grid gap-4">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${getResourceTypeColor(resource.resource_type)}`}>
                  {getResourceTypeIcon(resource.resource_type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{resource.name}</h3>
                  {resource.description && (
                    <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getResourceTypeColor(resource.resource_type)}`}>
                      {resource.resource_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(resource.status)}`}>
                      {resource.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <Box className="w-4 h-4 mr-1" />
                      <span>Quantity: {resource.quantity}</span>
                    </div>
                    {resource.total_cost && (
                      <div className="flex items-center text-gray-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${resource.total_cost.toLocaleString()}</span>
                      </div>
                    )}
                    {resource.allocation_start_date && (
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {formatDate(resource.allocation_start_date)}
                          {resource.allocation_end_date && ` - ${formatDate(resource.allocation_end_date)}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingResource(resource)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteResource(resource.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Box className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No resources found</h3>
            <p className="text-gray-400 mb-4">
              {filterType === 'all' && filterStatus === 'all'
                ? 'Start by adding project resources'
                : 'No resources match the selected filters'}
            </p>
            <Button
              onClick={() => setShowAddResource(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Resource
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddResource || editingResource) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingResource ? 'Edit Resource' : 'Add Resource'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddResource(false);
                setEditingResource(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingResource ? handleEditResource(editingResource) : handleAddResource()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingResource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 