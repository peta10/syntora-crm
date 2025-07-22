import React from 'react';
import { Project } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import {
  Building,
  Calendar,
  Clock,
  Target,
  Tag,
  Users,
  AlertTriangle,
  Briefcase,
  DollarSign,
  Activity,
  Shield
} from 'lucide-react';

interface ProjectOverviewProps {
  project: Project;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  onUpdateProject
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'completed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'on_hold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'archived': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="bg-gray-900/50 border-gray-700/50 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
        
        {project.description && (
          <p className="text-gray-300 mb-6">{project.description}</p>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <Target className="w-5 h-5 text-[#6E86FF]" />
              <div>
                <div className="font-medium">Status</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {project.category && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Briefcase className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Category</div>
                  <div className="text-sm">{project.category}</div>
                </div>
              </div>
            )}

            {project.project_type && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Building className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Project Type</div>
                  <div className="text-sm">{project.project_type}</div>
                </div>
              </div>
            )}

            {project.start_date && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Calendar className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Start Date</div>
                  <div className="text-sm">{formatDate(project.start_date)}</div>
                </div>
              </div>
            )}

            {project.due_date && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Calendar className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Due Date</div>
                  <div className="text-sm">{formatDate(project.due_date)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {project.estimated_hours && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Clock className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Time Estimate</div>
                  <div className="text-sm">{project.estimated_hours} hours</div>
                </div>
              </div>
            )}

            {project.actual_hours !== undefined && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Clock className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Time Spent</div>
                  <div className="text-sm">{project.actual_hours} hours</div>
                </div>
              </div>
            )}

            {project.contract_value && (
              <div className="flex items-center space-x-3 text-gray-300">
                <DollarSign className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Contract Value</div>
                  <div className="text-sm">
                    {project.currency} {project.contract_value.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {project.billing_type && (
              <div className="flex items-center space-x-3 text-gray-300">
                <DollarSign className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Billing Type</div>
                  <div className="text-sm">
                    {project.billing_type.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Tag className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Tags</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Progress and Health */}
      <Card className="bg-gray-900/50 border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Progress & Health</h3>
        
        <div className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Completion</span>
              <span className="text-white font-medium">{project.progress_percentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-full"
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{project.completed_tasks}</div>
              <div className="text-xs text-gray-400">Completed Tasks</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{project.total_tasks}</div>
              <div className="text-xs text-gray-400">Total Tasks</div>
            </div>
          </div>

          {/* Health Status */}
          {project.health_status && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#6E86FF]" />
                  <span className="text-gray-300">Health Status</span>
                </div>
                <span className={`text-sm font-medium ${
                  project.health_status === 'on_track' ? 'text-green-400' :
                  project.health_status === 'at_risk' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {project.health_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {project.health_notes && (
                <p className="text-sm text-gray-400 mt-2">{project.health_notes}</p>
              )}
              {project.last_health_check_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Last checked: {formatDate(project.last_health_check_at)}
                </p>
              )}
            </div>
          )}

          {/* Risk Level */}
          {project.risk_level && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#6E86FF]" />
                  <span className="text-gray-300">Risk Level</span>
                </div>
                <span className={`text-sm font-medium ${getRiskLevelColor(project.risk_level)}`}>
                  {project.risk_level.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Success Criteria */}
      {project.success_criteria && project.success_criteria.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Success Criteria</h3>
          <ul className="space-y-2">
            {project.success_criteria.map((criteria, index) => (
              <li key={index} className="flex items-start space-x-2 text-gray-300">
                <span className="text-[#6E86FF]">•</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Assumptions & Constraints */}
      {((project.assumptions && project.assumptions.length > 0) || 
        (project.constraints && project.constraints.length > 0)) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Assumptions & Constraints</h3>
          
          {/* Assumptions */}
          {project.assumptions && project.assumptions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Assumptions</h4>
              <ul className="list-disc list-inside space-y-2">
                {project.assumptions.map((assumption, index) => (
                  <li key={index} className="text-gray-300">{assumption}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Constraints */}
          {project.constraints && project.constraints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Constraints</h4>
              <ul className="list-disc list-inside space-y-2">
                {project.constraints.map((constraint, index) => (
                  <li key={index} className="text-gray-300">{constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}; 