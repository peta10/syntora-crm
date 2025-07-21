"use client";

import React, { useState } from 'react';
import { PlusCircle, Calendar, Clock, Tag, Star, ChevronDown, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/app/types/todo';
import useStore from '@/app/store/slices/todoSlice';

const EnhancedTodoForm: React.FC = () => {
  const { addTodo } = useStore();
  const [title, setTitle] = useState('');
  const [showGratitude, setShowGratitude] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'> = {
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
    };

    await addTodo(todo);

    // Reset form
    setTitle('');
    setShowGratitude(false);
    setPriority('medium');
    setCategory('');
    setDueDate('');
    setEstimatedDuration('');
    setShowAdvanced(false);
  };

  return (
    <motion.form 
      layout
      onSubmit={handleSubmit} 
      className="max-w-7xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
    >
      {/* Main Input Row */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full p-4 pr-10 rounded-xl border border-gray-700/50 
                     bg-gray-900/50 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent
                     transition-all duration-300"
          />
          {showGratitude && (
            <Star 
              size={18} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-spiritual-500" 
            />
          )}
        </div>
        
        <button
          type="submit"
          className={`
            px-6 py-4 rounded-xl flex items-center space-x-2 
            text-white font-medium transition-all duration-300
            ${showGratitude 
              ? 'bg-gradient-to-r from-spiritual-500 to-blue-500 hover:shadow-lg hover:shadow-spiritual-500/20' 
              : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:shadow-lg hover:shadow-gray-700/20'
            }
          `}
        >
          <PlusCircle size={20} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Quick Options Row */}
      <div className="flex items-center justify-between mt-4 px-1">
        {/* Gratitude Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showGratitude}
            onChange={(e) => setShowGratitude(e.target.checked)}
            className="form-checkbox h-5 w-5 text-spiritual-500 rounded 
                     focus:ring-spiritual-500 border-gray-600
                     transition-all duration-300 group-hover:border-spiritual-400
                     bg-gray-900/50"
          />
          <span className="text-gray-300 group-hover:text-spiritual-400 transition-colors flex items-center space-x-1">
            <Star size={16} className="text-spiritual-500" />
            <span>Spiritual/Gratitude Task (+25 pts)</span>
          </span>
        </label>

        {/* Advanced Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 mt-6 pt-4 border-t border-gray-700/50">
              {/* Priority Selection */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-24">Priority:</span>
                <div className="flex space-x-2">
                  {[
                    { value: 'high', icon: Zap, color: 'from-red-500 to-red-600' },
                    { value: 'medium', icon: Target, color: 'from-yellow-500 to-yellow-600' },
                    { value: 'low', icon: Clock, color: 'from-blue-500 to-blue-600' }
                  ].map(({ value, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPriority(value as 'high' | 'medium' | 'low')}
                      className={`
                        px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2
                        ${priority === value
                          ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105`
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span className="capitalize">{value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Input */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-24">Category:</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Work, Personal, Health"
                    className="w-full p-3 rounded-xl border border-gray-700/50
                             bg-gray-900/50 text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent"
                  />
                  <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Due Date Input */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-24">Due Date:</span>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-700/50
                             bg-gray-900/50 text-white
                             focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent"
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Estimated Duration Input */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-24">Duration:</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="Estimated minutes"
                    min="1"
                    className="w-full p-3 rounded-xl border border-gray-700/50
                             bg-gray-900/50 text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-spiritual-500 focus:border-transparent"
                  />
                  <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default EnhancedTodoForm; 