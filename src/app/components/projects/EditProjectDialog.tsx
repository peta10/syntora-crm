import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/app/types/todo';

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
}

const PRESET_COLORS = [
  '#6E86FF', '#FF6BBA', '#B279DB', '#34D399', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#EC4899', '#6366F1'
];

const PRESET_ICONS = [
  '🚀', '📁', '💼', '🎯', '⚡', '🔥', '💡', '🌟', '🎨', '🔧', '📊', '🏆',
  '📝', '💻', '🌐', '📱', '⭐', '🎪', '🎭', '🎨', '🎯', '🎮', '🎸', '🎵'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'text-green-400' },
  { value: 'completed', label: 'Completed', color: 'text-blue-400' },
  { value: 'on_hold', label: 'On Hold', color: 'text-yellow-400' },
  { value: 'archived', label: 'Archived', color: 'text-gray-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' }
];

export default function EditProjectDialog({ project, open, onOpenChange, onUpdateProject }: EditProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6E86FF');
  const [icon, setIcon] = useState('🚀');
  const [status, setStatus] = useState<'active' | 'completed' | 'on_hold' | 'archived' | 'cancelled'>('active');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setColor(project.color || '#6E86FF');
      setIcon(project.icon || '🚀');
      setStatus(project.status);
      setCategory(project.category || '');
      setTags(project.tags?.join(', ') || '');
      setEstimatedHours(project.estimated_hours?.toString() || '');
      setActualHours(project.actual_hours?.toString() || '');
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const updates: Partial<Project> = {
        title: title.trim(),
        description: description.trim(),
        color,
        icon,
        status,
        category: category.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        actual_hours: actualHours ? parseFloat(actualHours) : undefined,
      };

      const updatedProject = await onUpdateProject(project.id, updates);
      onOpenChange(false);
      // Optionally, you might want to update the project state in the parent component
      // if the parent component manages the list of projects.
      // For now, we just close the dialog.
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Edit Project</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Icon and Color */}
            <div className="flex items-center space-x-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl cursor-pointer"
                    style={{ 
                      backgroundColor: color + '20', 
                      borderColor: color + '40',
                      color: color 
                    }}
                  >
                    {icon}
                  </div>
                  <div className="grid grid-cols-6 gap-1 max-w-xs">
                    {PRESET_ICONS.map((presetIcon) => (
                      <button
                        key={presetIcon}
                        type="button"
                        onClick={() => setIcon(presetIcon)}
                        className={`w-8 h-8 rounded border text-sm hover:bg-gray-700 transition-colors ${
                          icon === presetIcon ? 'bg-gray-600 border-gray-500' : 'bg-gray-800 border-gray-600'
                        }`}
                      >
                        {presetIcon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === presetColor ? 'border-white scale-110' : 'border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: presetColor }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Project Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none"
                placeholder="Enter project title..."
                required
              />
            </div>

            {/* Project Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none resize-none"
                placeholder="Describe your project..."
              />
            </div>

            {/* Status and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#6E86FF] focus:outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none"
                  placeholder="e.g., Development, Design, Marketing"
                />
              </div>
            </div>

            {/* Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  id="estimatedHours"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="actualHours" className="block text-sm font-medium text-gray-300 mb-2">
                  Actual Hours
                </label>
                <input
                  type="number"
                  id="actualHours"
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#6E86FF] focus:outline-none"
                placeholder="tag1, tag2, tag3..."
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
            </div>

            {/* Project Stats (Read-only) */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Project Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{project.progress_percentage}%</div>
                  <div className="text-xs text-gray-400">Progress</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{project.completed_tasks}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{project.total_tasks}</div>
                  <div className="text-xs text-gray-400">Total Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400">Created</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
                disabled={!title.trim() || isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 