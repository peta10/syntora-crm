'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Palette, Target } from 'lucide-react';
import { Project } from '@/app/types/todo';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const PROJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const PROJECT_ICONS = [
  '📋', '🎯', '💼', '🚀', '⚡', '🔥', '💡', '🎨', '🔧', '📊',
  '🏆', '🌟', '💎', '🎪', '🎭', '🎮', '🎬', '🎲', '🎸', '🎺'
];

const PROJECT_CATEGORIES = [
  'Work', 'Personal', 'Health', 'Learning', 'Creative', 'Finance', 
  'Home', 'Travel', 'Fitness', 'Business', 'Side Project', 'Other'
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    color: project?.color || PROJECT_COLORS[0],
    icon: project?.icon || PROJECT_ICONS[0],
    status: project?.status || 'active' as Project['status'],
    due_date: project?.due_date || '',
    estimated_hours: project?.estimated_hours?.toString() || '',
    category: project?.category || '',
    tags: project?.tags || [],
    is_public: project?.is_public || false,
    owner_id: project?.owner_id || '' // This should be set to the current user's ID
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.due_date && new Date(formData.due_date) < new Date()) {
      newErrors.due_date = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
             await onSubmit({
         ...formData,
         estimated_hours: typeof formData.estimated_hours === 'string' 
           ? parseFloat(formData.estimated_hours) || undefined 
           : formData.estimated_hours,
         progress_percentage: project?.progress_percentage || 0,
         total_tasks: project?.total_tasks || 0,
         completed_tasks: project?.completed_tasks || 0,
         actual_hours: project?.actual_hours || 0,
         is_public: formData.is_public,
         owner_id: formData.owner_id
       });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                         ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Enter project title..."
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none
                         ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Describe your project..."
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category...</option>
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                         ${errors.due_date ? 'border-red-500' : 'border-gray-600'}`}
              />
              {errors.due_date && (
                <p className="text-red-400 text-sm mt-1">{errors.due_date}</p>
              )}
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours || ''}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Visual Customization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Visual Customization</h3>
            
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Icon
              </label>
              <div className="grid grid-cols-10 gap-2">
                {PROJECT_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-3 rounded-lg border-2 transition-all text-xl hover:scale-110
                             ${formData.icon === icon 
                               ? 'border-blue-500 bg-blue-500/20' 
                               : 'border-gray-600 hover:border-gray-500'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Color
              </label>
              <div className="grid grid-cols-10 gap-2">
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110
                             ${formData.color === color 
                               ? 'border-white' 
                               : 'border-gray-600'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30 
                           flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="text-blue-300 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a tag and press Enter..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleTagAdd(value);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>

          {/* Preview */}
          <div className="border border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Preview</h4>
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${formData.color}30`, color: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{formData.title || 'Project Title'}</h3>
                <p className="text-sm text-gray-400">{formData.description || 'Project description...'}</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg 
                       hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>{project ? 'Update Project' : 'Create Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}; 