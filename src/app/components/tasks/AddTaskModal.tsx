'use client';

import React, { useState } from 'react';
import { Plus, X, Star, Calendar, Clock, Tag } from 'lucide-react';
import { Todo } from '@/app/types/todo';
import OfflineTaskManager from '@/app/lib/offline/OfflineTaskManager';
import ChicagoTime from '@/app/utils/timezone';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    duration: '',
    isSpiritual: false,
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    
    try {
      const taskData: Omit<Todo, 'id' | 'created_at' | 'updated_at'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        completed: false,
        show_gratitude: formData.isSpiritual,
        priority: formData.priority,
        category: formData.category || undefined,
        due_date: formData.dueDate || undefined,
        estimated_duration: formData.duration ? parseInt(formData.duration) : undefined,
        // Default values for required fields
        tags: undefined,
        from_reflection: false,
        reflection_date: undefined,
        order: 0,
        time_tracking_enabled: false,
        time_started_at: undefined,
        time_stopped_at: undefined,
        total_time_spent: 0,
        is_currently_tracking: false
      };

      await OfflineTaskManager.createTask(taskData);
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        priority: 'medium',
        dueDate: '',
        duration: '',
        isSpiritual: false,
        description: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const mapPriorityToNumber = (priority: 'high' | 'medium' | 'low'): number => {
    switch (priority) {
      case 'high': return 5;
      case 'medium': return 3;
      case 'low': return 1;
      default: return 3;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Add New Task</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="What needs to be done?"
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none text-lg"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Add more details about this task..."
              rows={3}
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({...formData, priority})}
                  className={`p-3 rounded-xl font-medium transition-all text-sm capitalize ${
                    formData.priority === priority
                      ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg scale-105`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {formData.priority}
            </p>
          </div>

          {/* Category and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Work, Personal, etc."
                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="30"
                min="1"
                max="480"
                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              min={ChicagoTime.getTodayString()}
              className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Today is {ChicagoTime.formatDate(ChicagoTime.getTodayString())} (Chicago Time)
            </p>
          </div>

          {/* Spiritual/Gratitude Task */}
          <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <input
              type="checkbox"
              id="spiritual"
              checked={formData.isSpiritual}
              onChange={(e) => setFormData({...formData, isSpiritual: e.target.checked})}
              className="w-5 h-5 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="spiritual" className="text-base text-gray-300 flex items-center">
              <Star className="w-5 h-5 text-amber-500 mr-2" />
              Spiritual/Gratitude Task
              <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                +25 pts
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
