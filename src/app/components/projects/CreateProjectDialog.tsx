import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/app/types/todo';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const PRESET_COLORS = [
  '#6E86FF', '#FF6BBA', '#B279DB', '#34D399', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#EC4899', '#6366F1'
];

// Fixed: Use unique IDs instead of emoji values for keys
const PRESET_ICONS = [
  { id: 'rocket', emoji: '🚀' },
  { id: 'folder', emoji: '📁' },
  { id: 'briefcase', emoji: '💼' },
  { id: 'target', emoji: '🎯' },
  { id: 'bolt', emoji: '⚡' },
  { id: 'fire', emoji: '🔥' },
  { id: 'bulb', emoji: '💡' },
  { id: 'star', emoji: '🌟' },
  { id: 'palette', emoji: '🎨' },
  { id: 'wrench', emoji: '🔧' },
  { id: 'chart', emoji: '📊' },
  { id: 'trophy', emoji: '🏆' },
  { id: 'note', emoji: '📝' },
  { id: 'laptop', emoji: '💻' },
  { id: 'globe', emoji: '🌐' },
  { id: 'phone', emoji: '📱' },
  { id: 'star2', emoji: '⭐' },
  { id: 'circus', emoji: '🎪' },
  { id: 'masks', emoji: '🎭' },
  { id: 'art', emoji: '🖼️' },
  { id: 'game', emoji: '🎮' },
  { id: 'guitar', emoji: '🎸' },
  { id: 'music', emoji: '🎵' },
  { id: 'camera', emoji: '📷' }
];

export default function CreateProjectDialog({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6E86FF');
  const [icon, setIcon] = useState('🚀');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
        title: title.trim(),
        description: description.trim(),
        color,
        icon,
        status: 'active',
        progress_percentage: 0,
        total_tasks: 0,
        completed_tasks: 0,
        category: category.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        owner_id: '', // This will be set by the service
        is_public: false,
        actual_hours: 0
      };

      await onCreateProject(projectData);
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setColor('#6E86FF');
      setIcon('🚀');
      setCategory('');
      setTags('');
      setEstimatedHours('');
      setError(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
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
            <h2 className="text-xl font-semibold text-white">Create New Project</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
                        key={presetIcon.id} // Fixed: Use unique ID instead of emoji
                        type="button"
                        onClick={() => setIcon(presetIcon.emoji)}
                        className={`w-8 h-8 rounded border text-sm hover:bg-gray-700 transition-colors ${
                          icon === presetIcon.emoji ? 'bg-gray-600 border-gray-400' : 'bg-gray-800 border-gray-600'
                        }`}
                      >
                        {presetIcon.emoji}
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
                  {PRESET_COLORS.map((presetColor, index) => (
                    <button
                      key={`color-${index}-${presetColor}`} // Fixed: Use unique key
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        color === presetColor ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: presetColor }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-2 w-16 h-8 rounded border border-gray-600 bg-gray-800"
                />
              </div>
            </div>

            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project title..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project description..."
                disabled={isSubmitting}
              />
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Work, Personal"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 