import React, { useState } from 'react';
import { Project, ProjectRisk } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertOctagon,
  Plus,
  Calendar,
  Users2,
  AlertTriangle,
  Shield,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface ProjectRisksProps {
  project: Project;
}

export const ProjectRisks: React.FC<ProjectRisksProps> = ({
  project
}) => {
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ProjectRisk | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'probability' | 'impact' | 'date'>('probability');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRiskTypeColor = (type: ProjectRisk['risk_type']) => {
    switch (type) {
      case 'technical': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'schedule': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'cost': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'resource': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'scope': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'quality': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityColor = (probability: string, impact: string) => {
    const severityScore = {
      high: 3,
      medium: 2,
      low: 1
    };
    const score = severityScore[probability as keyof typeof severityScore] * 
                 severityScore[impact as keyof typeof severityScore];
    
    if (score >= 6) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (score >= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  const getStatusColor = (status: ProjectRisk['status']) => {
    switch (status) {
      case 'identified': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'analyzing': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'mitigating': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'monitoring': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'resolved': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleAddRisk = () => {
    // TODO: Implement risk addition
    setShowAddRisk(false);
  };

  const handleEditRisk = (risk: ProjectRisk) => {
    // TODO: Implement risk editing
    setEditingRisk(null);
  };

  const handleDeleteRisk = (id: string) => {
    // TODO: Implement risk deletion
  };

  const filteredRisks = risks
    .filter(risk => {
      if (filterStatus === 'all') return true;
      return filterStatus === 'resolved' ? risk.status === 'resolved' : risk.status !== 'resolved';
    })
    .sort((a, b) => {
      const severityScore = (risk: ProjectRisk) => {
        const scores = { high: 3, medium: 2, low: 1 };
        return scores[risk.probability as keyof typeof scores] * scores[risk.impact as keyof typeof scores];
      };

      switch (sortBy) {
        case 'probability':
          return severityScore(b) - severityScore(a);
        case 'impact':
          const impactScores = { high: 3, medium: 2, low: 1 };
          return impactScores[b.impact as keyof typeof impactScores] - 
                 impactScores[a.impact as keyof typeof impactScores];
        case 'date':
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

  const activeRisks = risks.filter(risk => risk.status !== 'resolved');
  const highRisks = activeRisks.filter(risk => risk.probability === 'high' && risk.impact === 'high');
  const resolvedRisks = risks.filter(risk => risk.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Risks</h2>
          <p className="text-gray-400">Identify and manage project risks</p>
        </div>
        <Button
          onClick={() => setShowAddRisk(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Risk
        </Button>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <AlertOctagon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{risks.length}</div>
              <div className="text-sm text-gray-400">Total Risks</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeRisks.length}</div>
              <div className="text-sm text-gray-400">Active Risks</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{highRisks.length}</div>
              <div className="text-sm text-gray-400">High Severity</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{resolvedRisks.length}</div>
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
              <option value="all">All Risks</option>
              <option value="active">Active</option>
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
              <option value="probability">Severity</option>
              <option value="impact">Impact</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search risks..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* Risk List */}
      <div className="grid gap-4">
        {filteredRisks.map((risk) => (
          <Card
            key={risk.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${getRiskTypeColor(risk.risk_type)}`}>
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{risk.title}</h3>
                  {risk.description && (
                    <p className="text-sm text-gray-400 mt-1">{risk.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getRiskTypeColor(risk.risk_type)}`}>
                      {risk.risk_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(risk.probability, risk.impact)}`}>
                      {`${risk.probability.toUpperCase()} PROBABILITY / ${risk.impact.toUpperCase()} IMPACT`}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(risk.status)}`}>
                      {risk.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {risk.due_date && (
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Due {formatDate(risk.due_date)}</span>
                      </div>
                    )}
                    {risk.owner_id && (
                      <div className="flex items-center text-gray-400">
                        <Users2 className="w-4 h-4 mr-1" />
                        <span>Owner: {risk.owner_id}</span>
                      </div>
                    )}
                  </div>
                  {(risk.mitigation_plan || risk.contingency_plan) && (
                    <div className="mt-3 space-y-2">
                      {risk.mitigation_plan && (
                        <div className="text-sm">
                          <span className="text-gray-400">Mitigation Plan:</span>
                          <p className="text-gray-300 mt-1">{risk.mitigation_plan}</p>
                        </div>
                      )}
                      {risk.contingency_plan && (
                        <div className="text-sm">
                          <span className="text-gray-400">Contingency Plan:</span>
                          <p className="text-gray-300 mt-1">{risk.contingency_plan}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingRisk(risk)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRisk(risk.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredRisks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No risks found</h3>
            <p className="text-gray-400 mb-4">
              {filterStatus === 'all'
                ? 'Start by identifying project risks'
                : `No ${filterStatus} risks found`}
            </p>
            <Button
              onClick={() => setShowAddRisk(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Risk
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddRisk || editingRisk) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingRisk ? 'Edit Risk' : 'Add Risk'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddRisk(false);
                setEditingRisk(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingRisk ? handleEditRisk(editingRisk) : handleAddRisk()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingRisk ? 'Update Risk' : 'Add Risk'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 