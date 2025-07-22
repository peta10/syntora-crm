import React, { useState } from 'react';
import { Project, ProjectKPI } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  Plus,
  Calendar,
  Target,
  Activity,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface ProjectKPIsProps {
  project: Project;
}

export const ProjectKPIs: React.FC<ProjectKPIsProps> = ({
  project
}) => {
  const [kpis, setKPIs] = useState<ProjectKPI[]>([]);
  const [showAddKPI, setShowAddKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState<ProjectKPI | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectKPI['status']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'date'>('progress');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMetricTypeIcon = (type: ProjectKPI['metric_type']) => {
    switch (type) {
      case 'number': return <BarChart2 className="w-4 h-4" />;
      case 'percentage': return <Activity className="w-4 h-4" />;
      case 'currency': return <BarChart2 className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'boolean': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getMetricTypeColor = (type: ProjectKPI['metric_type']) => {
    switch (type) {
      case 'number': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'percentage': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'currency': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'time': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'boolean': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: ProjectKPI['status']) => {
    switch (status) {
      case 'on_track': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'at_risk': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'off_track': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getProgressPercentage = (kpi: ProjectKPI) => {
    if (kpi.metric_type === 'boolean') {
      return kpi.actual_value ? 100 : 0;
    }
    return ((kpi.actual_value || 0) / kpi.target_value) * 100;
  };

  const handleAddKPI = () => {
    // TODO: Implement KPI addition
    setShowAddKPI(false);
  };

  const handleEditKPI = (kpi: ProjectKPI) => {
    // TODO: Implement KPI editing
    setEditingKPI(null);
  };

  const handleDeleteKPI = (id: string) => {
    // TODO: Implement KPI deletion
  };

  const filteredKPIs = kpis
    .filter(kpi => {
      if (filterStatus === 'all') return true;
      return kpi.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return getProgressPercentage(b) - getProgressPercentage(a);
        case 'date':
          if (!a.last_measured_at) return 1;
          if (!b.last_measured_at) return -1;
          return new Date(b.last_measured_at).getTime() - new Date(a.last_measured_at).getTime();
        default:
          return 0;
      }
    });

  const onTrackKPIs = kpis.filter(kpi => kpi.status === 'on_track');
  const atRiskKPIs = kpis.filter(kpi => kpi.status === 'at_risk');
  const offTrackKPIs = kpis.filter(kpi => kpi.status === 'off_track');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project KPIs</h2>
          <p className="text-gray-400">Track key performance indicators</p>
        </div>
        <Button
          onClick={() => setShowAddKPI(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add KPI
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{kpis.length}</div>
              <div className="text-sm text-gray-400">Total KPIs</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{onTrackKPIs.length}</div>
              <div className="text-sm text-gray-400">On Track</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{atRiskKPIs.length}</div>
              <div className="text-sm text-gray-400">At Risk</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{offTrackKPIs.length}</div>
              <div className="text-sm text-gray-400">Off Track</div>
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
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="off_track">Off Track</option>
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
              <option value="progress">Progress</option>
              <option value="date">Last Updated</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search KPIs..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* KPI List */}
      <div className="grid gap-4">
        {filteredKPIs.map((kpi) => (
          <Card
            key={kpi.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${getMetricTypeColor(kpi.metric_type)}`}>
                  {getMetricTypeIcon(kpi.metric_type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{kpi.name}</h3>
                  {kpi.description && (
                    <p className="text-sm text-gray-400 mt-1">{kpi.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getMetricTypeColor(kpi.metric_type)}`}>
                      {kpi.metric_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(kpi.status)}`}>
                      {kpi.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <Target className="w-4 h-4 mr-1" />
                      <span>Target: {kpi.target_value}{kpi.unit}</span>
                    </div>
                    {kpi.actual_value !== undefined && (
                      <div className="flex items-center text-gray-400">
                        <Activity className="w-4 h-4 mr-1" />
                        <span>Actual: {kpi.actual_value}{kpi.unit}</span>
                      </div>
                    )}
                    {kpi.last_measured_at && (
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Last Updated: {formatDate(kpi.last_measured_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{getProgressPercentage(kpi).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          kpi.status === 'on_track'
                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                            : kpi.status === 'at_risk'
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                            : 'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${Math.min(getProgressPercentage(kpi), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingKPI(kpi)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteKPI(kpi.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredKPIs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No KPIs found</h3>
            <p className="text-gray-400 mb-4">
              {filterStatus === 'all'
                ? 'Start by adding project KPIs'
                : `No ${filterStatus} KPIs found`}
            </p>
            <Button
              onClick={() => setShowAddKPI(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First KPI
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddKPI || editingKPI) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingKPI ? 'Edit KPI' : 'Add KPI'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddKPI(false);
                setEditingKPI(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingKPI ? handleEditKPI(editingKPI) : handleAddKPI()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingKPI ? 'Update KPI' : 'Add KPI'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 