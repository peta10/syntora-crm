"use client";

import React, { useState } from 'react';
import { PlusCircle, Calendar, Clock, Tag, AlertCircle, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Todo } from '@/app/types/todo';

interface TodoFormProps {
  onSubmit: (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [showGratitude, setShowGratitude] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      completed: false,
      show_gratitude: showGratitude,
      priority,
      category: category || undefined,
      due_date: dueDate || undefined,
      estimated_duration: estimatedDuration || undefined,
      tags: [],
      description: undefined,
      from_reflection: false,
      reflection_date: undefined,
      order: undefined
    });

    // Reset form
    setTitle('');
    setShowGratitude(false);
    setPriority('medium');
    setCategory('');
    setDueDate('');
    setEstimatedDuration('');
    setShowAdvanced(false);
  };

  const priorityColors = {
    high: 'bg-red-500 hover:bg-red-600',
    medium: 'bg-yellow-500 hover:bg-yellow-600',
    low: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <motion.form 
      layout
      onSubmit={handleSubmit} 
      className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
    >
      {/* Main Input Row */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full p-3 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
          />
          {showGratitude && (
            <Star 
              size={18} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-spiritual-500" 
            />
          )}
        </div>
        
        <button
          type="submit"
          className={`
            px-6 py-3 rounded-lg flex items-center space-x-2 
            text-white font-medium transition-all duration-300
            ${showGratitude 
              ? 'bg-spiritual-500 hover:bg-spiritual-600' 
              : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600'
            }
          `}
        >
          <PlusCircle size={20} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Quick Options Row */}
      <div className="flex items-center mt-3 space-x-6">
        {/* Gratitude Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showGratitude}
            onChange={(e) => setShowGratitude(e.target.checked)}
            className="form-checkbox h-5 w-5 text-spiritual-500 rounded 
                     focus:ring-spiritual-500 border-gray-300 dark:border-gray-600
                     transition-all duration-300 group-hover:border-spiritual-400"
          />
          <span className="text-gray-600 dark:text-gray-300 group-hover:text-spiritual-500 transition-colors">
            Spiritual/Gratitude Task
          </span>
        </label>

        {/* Advanced Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                   flex items-center space-x-1 transition-colors"
        >
          <span>Advanced Options</span>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </button>
      </div>

      {/* Advanced Options Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            {/* Priority Selection */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24">Priority:</span>
              <div className="flex space-x-2">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium text-white 
                      transition-all duration-200
                      ${priority === p 
                        ? priorityColors[p] + ' shadow-md transform scale-105' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }
                    `}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Input */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24">Category:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Work, Personal, Health"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent"
                />
                <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Due Date Input */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24">Due Date:</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Estimated Duration Input */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24">Duration:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Estimated minutes"
                  min="1"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent"
                />
                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default TodoForm; 