'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Target, Trophy, CheckCircle2, Clock } from 'lucide-react';
import { useGaming } from '@/app/contexts/GamingContext';
import { GamingStats } from '@/app/components/gaming/GamingStats';
import { BibleVerseToast } from '@/app/components/todos/utils/BibleVerseToast';
import TaskTable from '@/app/components/tasks/TaskTable';
import AddTaskModal from '@/app/components/tasks/AddTaskModal';
import OfflineTaskManager from '@/app/lib/offline/OfflineTaskManager';
import Image from 'next/image';

export default function TasksPage() {
  const { allDayComplete } = useGaming();
  const [filter, setFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize task manager
  useEffect(() => {
    const taskManager = OfflineTaskManager;
    
    const unsubscribe = taskManager.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      setIsLoading(false);
    });

    // Initial load
    taskManager.getAllTasks().then(setTasks).finally(() => setIsLoading(false));

    return unsubscribe;
  }, []);

  // Stats calculations
  const todayTasks = tasks.filter(task => {
    if (!task.date) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.date === today;
  });

  const completedToday = todayTasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const activeTasks = tasks.filter(t => t.is_currently_tracking).length;

  const getProductivityInsight = () => {
    if (completedToday >= 5) return { text: "🔥 You're on fire!", color: "text-red-400" };
    if (completedToday >= 3) return { text: "💪 Great momentum!", color: "text-green-400" };
    if (completedToday >= 1) return { text: "✨ Good start!", color: "text-blue-400" };
    return { text: "", color: "text-purple-400" };
  };

  const insight = getProductivityInsight();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
              <Image
                src="/FinalFavicon.webp"
                alt="Syntora Logo"
                width={48}
                height={48}
                className="rounded-xl"
              />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Task Management
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-gray-400">Personal Productivity Engine</p>
                <span className={`text-sm font-medium ${insight.color}`} 
                      dangerouslySetInnerHTML={{ __html: insight.text }} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
          <GamingStats />
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-3 min-w-[180px] justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

        {/* All day complete celebration */}
        {allDayComplete && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
                🎉 All Tasks Complete! You're unstoppable! 🎉
              </h2>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
                  {['All', 'Today', 'Active', 'Completed', 'Personal', 'Work', 'Spiritual'].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-4 py-2 rounded-md font-medium transition-all ${
                        filter === filterOption
                          ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {filterOption}
                                  </button>
                                ))}
                              </div>
                              
                              <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none w-64"
                  />
                </div>
              </div>

        {/* Task Table */}
        <TaskTable filter={filter} searchQuery={searchQuery} />
              </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <BibleVerseToast />
    </div>
  );
}
