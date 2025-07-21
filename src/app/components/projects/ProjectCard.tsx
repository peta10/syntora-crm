'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle, Target, MoreVertical, Edit3, 
  Trash2, Play, Pause, Archive, AlertTriangle 
} from 'lucide-react';
import { Project } from '@/app/types/todo';

interface ProjectCardProps {
  project: Project & {
    total_tasks: number;
    completed_tasks: number;
    progress_percentage: number;
    actual_hours?: number;
    is_overdue?: boolean;
  };
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Project['status']) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onClick,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      active: 'text-green-400 bg-green-400/20 border-green-400/30',
      completed: 'text-blue-400 bg-blue-400/20 border-blue-400/30',
      on_hold: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30',
      archived: 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    };
    return colors[status] || colors.active;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 
          transition-all duration-300 cursor-pointer
          ${project.is_overdue ? 'border-red-500/30 bg-red-900/10' : ''}
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Project Icon and Info */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `${project.color}30`, color: project.color }}
              >
                {project.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{project.title}</h3>
                <p className="text-sm text-gray-400">{project.description}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </div>

            {/* Progress */}
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress_percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm text-gray-400 w-12">{project.progress_percentage}%</span>
            </div>

            {/* Task Count */}
            <div className="text-sm text-gray-400">
              {project.completed_tasks}/{project.total_tasks} tasks
            </div>

            {/* Due Date */}
            {project.due_date && (
              <div className={`text-sm flex items-center space-x-1 ${
                project.is_overdue ? 'text-red-400' : 'text-gray-400'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.due_date)}</span>
                {project.is_overdue && <AlertTriangle className="w-4 h-4" />}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                <button
                  onClick={() => { onEdit(); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => { onDelete(); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`
        bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 
        transition-all duration-300 cursor-pointer relative overflow-hidden
        ${project.is_overdue ? 'border-red-500/30 bg-red-900/10' : ''}
      `}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${project.color}20, transparent)`
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${project.color}30`, color: project.color }}
          >
            {project.icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{project.title}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)} inline-block`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 min-w-32">
              <button
                onClick={() => { onEdit(); setShowDropdown(false); }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => { onDelete(); setShowDropdown(false); }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 relative z-10">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mb-4 relative z-10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">{project.progress_percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress_percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{project.total_tasks}</div>
          <div className="text-xs text-gray-400">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{project.completed_tasks}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-400 relative z-10">
        {project.due_date ? (
          <div className={`flex items-center space-x-1 ${project.is_overdue ? 'text-red-400' : ''}`}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(project.due_date)}</span>
            {project.is_overdue && <AlertTriangle className="w-4 h-4" />}
          </div>
        ) : (
          <div>No due date</div>
        )}

        {project.actual_hours && (
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{Math.round(project.actual_hours)}h</span>
          </div>
        )}
      </div>

      {/* Overdue indicator */}
      {project.is_overdue && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10" />
      )}
    </motion.div>
  );
}; 