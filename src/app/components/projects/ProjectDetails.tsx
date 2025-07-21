'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Project, Todo } from '@/app/types/todo';

interface ProjectDetailsProps {
  project: Project & {
    total_tasks: number;
    completed_tasks: number;
    progress_percentage: number;
    actual_hours?: number;
    is_overdue?: boolean;
  };
  tasks: Todo[];
  onBack: () => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAssignTask: (taskId: string, projectId: string) => Promise<void>;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  tasks,
  onBack,
  onUpdateProject,
  onDeleteProject,
  onAssignTask
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-white">{project.title}</h1>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl p-6">
        <p className="text-gray-400">Project details view coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Tasks: {project.completed_tasks}/{project.total_tasks} • 
          Progress: {project.progress_percentage}%
        </p>
      </div>
    </div>
  );
}; 