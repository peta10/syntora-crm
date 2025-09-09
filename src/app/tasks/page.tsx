'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, Star, Check, Trash2, Edit3, Target, Trophy, ChevronDown, ChevronUp, Save, X, Play, Square, RotateCcw } from 'lucide-react';
import { Todo } from '@/app/types/todo';
import useStore from '@/app/store/slices/todoSlice';
import { useGaming } from '@/app/contexts/GamingContext';
import { GamingStats } from '@/app/components/gaming/GamingStats';
import { BibleVerseToast } from '@/app/components/todos/utils/BibleVerseToast';
import Image from 'next/image';

export default function TasksPage() {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, deleteTodo, startTimeTracking, stopTimeTracking } = useStore();
  const {
    level,
    todayPoints,
    allDayComplete,
    combo,
    addXP,
    addPoints,
    incrementCombo,
    resetCombo,
    triggerConfetti,
    triggerScratchEffect,
    playSound,
    checkAchievements,
  } = useGaming();
  
  const [filter, setFilter] = useState('Today'); // Changed default to 'Today'
  const [isAddTaskExpanded, setIsAddTaskExpanded] = useState(false);
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    duration: '',
    isSpiritual: false,
    difficulty: 3,
    energy: 'medium'
  });
  const [editTask, setEditTask] = useState({
    title: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    duration: '',
    isSpiritual: false
  });
  const [trackingTime, setTrackingTime] = useState<{ [key: string]: number }>({});

  // Real-time time tracking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackingTime(prev => {
        const newTracking = { ...prev };
        Object.keys(newTracking).forEach(taskId => {
          newTracking[taskId] += 1; // Increment by 1 second
        });
        return newTracking;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize tracking time for currently tracking tasks
  useEffect(() => {
    const currentlyTracking = todos.find(todo => todo.is_currently_tracking);
    if (currentlyTracking) {
      const startTime = new Date(currentlyTracking.time_started_at || '').getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      setTrackingTime({ [currentlyTracking.id]: elapsedSeconds });
    } else {
      setTrackingTime({});
    }
  }, [todos]);

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Time tracking functions
  const handleStartTimeTracking = async (id: string) => {
    try {
      await startTimeTracking(id);
      playSound('default');
    } catch (error) {
      console.error('Failed to start time tracking:', error);
    }
  };

  const handleStopTimeTracking = async (id: string) => {
    try {
      await stopTimeTracking(id);
      playSound('default');
    } catch (error) {
      console.error('Failed to stop time tracking:', error);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTotalTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  // Format date without timezone conversion issues
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // Parse the date string and format it as MM/DD/YYYY
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  // Compare dates without timezone issues
  const isSameDate = (dateString1: string, dateString2: string): boolean => {
    if (!dateString1 || !dateString2) return false;
    
    // Parse dates and compare year, month, day only
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    
    const result = (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
    
    // Debug logging
    console.log('Date comparison:', {
      date1: dateString1,
      date2: dateString2,
      parsed1: `${date1.getFullYear()}-${date1.getMonth() + 1}-${date1.getDate()}`,
      parsed2: `${date2.getFullYear()}-${date2.getMonth() + 1}-${date2.getDate()}`,
      result
    });
    
    return result;
  };

  // Get today's date as YYYY-MM-DD string (no timezone issues)
  const getTodayString = (): string => {
    // Use a more reliable method to get today's date
    const now = new Date();
    // Get the date in the local timezone
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Debug logging
    console.log('Today calculation:', {
      now: now.toISOString(),
      localDate: `${year}-${month}-${day}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    return `${year}-${month}-${day}`;
  };

  // Alternative method to get today's date using local timezone
  const getTodayStringLocal = (): string => {
    const now = new Date();
    // Use toLocaleDateString to get the date in local timezone, then parse it
    const localDateString = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    console.log('Local today calculation:', {
      now: now.toISOString(),
      localDateString,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    return localDateString;
  };

  // Get currently tracking task
  const currentlyTracking = todos.find(todo => todo.is_currently_tracking);

  const checkAllDayComplete = (updatedTodos: Todo[]) => {
    const todayTodos = updatedTodos.filter(todo => {
      if (!todo.due_date) return false;
      const today = new Date();
      const todoDate = new Date(todo.due_date);
      return (
        todoDate.getFullYear() === today.getFullYear() &&
        todoDate.getMonth() === today.getMonth() &&
        todoDate.getDate() === today.getDate()
      );
    });
    const allComplete = todayTodos.length > 0 && todayTodos.every(todo => todo.completed);
    
    if (allComplete && !allDayComplete) {
      triggerConfetti('allday');
      playSound('allday');
      
      const bonusXP = 100;
      addXP(bonusXP);
    }
    
    return allComplete;
  };

  const checkTaskAchievements = (updatedTodos: Todo[]) => {
    const completedToday = updatedTodos.filter(t => {
      if (!t.completed) return false;
      const today = new Date();
      const completedDate = new Date(t.updated_at);
      return (
        completedDate.getFullYear() === today.getFullYear() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getDate() === today.getDate()
      );
    });
    
    const newAchievements: string[] = [];
    
    if (completedToday.length === 1) {
      newAchievements.push('first_task');
    }
    
    const spiritualCompleted = completedToday.filter(t => t.show_gratitude).length;
    if (spiritualCompleted >= 3) {
      newAchievements.push('spiritual_master');
    }
    
    if (allDayComplete) {
      newAchievements.push('perfect_day');
    }
    
    if (combo >= 5) {
      newAchievements.push('combo_master');
    }
    
    if (newAchievements.length > 0) {
      checkAchievements(newAchievements);
    }
  };

  const toggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const newCompleted = !todo.completed;
      await updateTodo(id, { completed: newCompleted });
      
      const updatedTodos = todos.map(t => 
        t.id === id ? { ...t, completed: newCompleted } : t
      );
      
      if (newCompleted) {
        incrementCombo();
        triggerScratchEffect(id);
        
        if (todo.show_gratitude) {
          triggerConfetti('spiritual');
          playSound('spiritual');
        } else {
          triggerConfetti('normal');
          playSound('complete');
        }
        
        const basePoints = todo.show_gratitude ? 25 : 
                         (todo.priority === 'high' ? 20 : 
                          todo.priority === 'medium' ? 15 : 10);
        const difficultyBonus = 6; // Default difficulty bonus
        const comboBonus = combo >= 3 ? 5 : 0;
        const totalPoints = basePoints + difficultyBonus + comboBonus;
        
        addPoints(totalPoints);
        
        const xpGain = Math.floor(totalPoints * 1.5);
        addXP(xpGain);
        
      } else {
        resetCombo();
        const points = todo.show_gratitude ? 25 : (todo.priority === 'high' ? 20 : todo.priority === 'medium' ? 15 : 10);
        addPoints(-points); // Subtract points when uncompleting
      }
      
      checkAllDayComplete(updatedTodos);
      checkTaskAchievements(updatedTodos);
    }
  };

  const addTask = async () => {
    if (newTask.title.trim()) {
      const todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'> = {
        title: newTask.title.trim(),
        completed: false,
        show_gratitude: newTask.isSpiritual,
        priority: newTask.priority,
        category: newTask.category || undefined,
        due_date: newTask.dueDate || undefined,
        estimated_duration: newTask.duration ? parseInt(newTask.duration) : undefined
      };
      
      await addTodo(todo);
      setNewTask({
        title: '',
        category: '',
        priority: 'medium',
        dueDate: '',
        duration: '',
        isSpiritual: false,
        difficulty: 3,
        energy: 'medium'
      });
      
      // Close the add task form on mobile after successful addition
      setIsAddTaskExpanded(false);
      setIsMobileOverlayOpen(false);
      
      playSound('default');
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTaskId(todo.id);
    setEditTask({
      title: todo.title,
      category: todo.category || '',
      priority: todo.priority,
      dueDate: todo.due_date || '',
      duration: todo.estimated_duration ? todo.estimated_duration.toString() : '',
      isSpiritual: todo.show_gratitude
    });
  };

  const saveEdit = async () => {
    if (editingTaskId && editTask.title.trim()) {
      const updates = {
        title: editTask.title.trim(),
        category: editTask.category || undefined,
        priority: editTask.priority,
        due_date: editTask.dueDate || undefined,
        estimated_duration: editTask.duration ? parseInt(editTask.duration) : undefined,
        show_gratitude: editTask.isSpiritual
      };
      
      await updateTodo(editingTaskId, updates);
      setEditingTaskId(null);
      playSound('default');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTask({
      title: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      duration: '',
      isSpiritual: false
    });
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Work': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Personal': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Spiritual': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Health': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !todo.completed;
    if (filter === 'Completed') return todo.completed;
    if (filter === 'Spiritual') return todo.show_gratitude;
    if (filter === 'Personal') return todo.category?.toLowerCase() === 'personal';
    if (filter === 'Work') return todo.category?.toLowerCase() === 'work';
    if (filter === 'Today') {
      if (!todo.due_date) return false;
      
      // Use the local timezone method for more accurate today calculation
      return isSameDate(todo.due_date, getTodayStringLocal());
    }
    return true;
  });

  const todayProgress = todos.filter(t => {
    if (!t.due_date) return false;
    return isSameDate(t.due_date, getTodayStringLocal());
  });
  const completedToday = todayProgress.filter(t => t.completed).length;

  const getProductivityInsight = () => {
    if (completedToday >= 5) return { text: "🔥 You&#39;re on fire!", color: "text-red-400" };
    if (completedToday >= 3) return { text: "💪 Great momentum!", color: "text-green-400" };
    if (completedToday >= 1) return { text: "✨ Good start!", color: "text-blue-400" };
    return { text: "", color: "text-purple-400" };
  };

  const insight = getProductivityInsight();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center relative">
              <Image
                src="/FinalFavicon.webp"
                alt="Syntora Logo"
                width={48}
                height={48}
                className="rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Task Management</h1>
              <div className="flex items-center space-x-4">
                <p className="text-gray-400 flex items-center space-x-2">
                  <span>Personal Productivity Engine</span>
                </p>
                <span className={`text-sm font-medium ${insight.color}`} dangerouslySetInnerHTML={{ __html: insight.text }} />
              </div>
            </div>
          </div>
          
          {/* Gaming stats */}
          <GamingStats />
        </div>

        {/* All day complete celebration */}
        {allDayComplete && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
                🎉 All Tasks Complete! You&#39;re unstoppable! 🎉
              </h2>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Mobile: Floating Action Buttons */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
          {!isMobileOverlayOpen ? (
            <button
              onClick={() => setIsMobileOverlayOpen(true)}
              className="w-14 h-14 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
              aria-label="Add new task"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          ) : (
            <button
              onClick={() => setIsMobileOverlayOpen(false)}
              className="w-12 h-12 bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 border border-gray-600/50"
              aria-label="Close add task form"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
        </div>

        {/* Mobile: Tasks List */}
        <div className="lg:hidden space-y-6">
          {/* Tasks List - Mobile First */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            {/* Filter Tabs */}
            <div className="border-b border-gray-700/50 p-4 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Tasks</h2>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-2 py-1 text-sm text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none w-20"
                  />
                </div>
              </div>
              
              <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 overflow-x-auto">
                {['All', 'Today', 'Active', 'Personal', 'Work', 'Spiritual'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-2 rounded-md font-medium transition-all whitespace-nowrap text-sm ${
                      filter === filterOption
                        ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                  <p className="text-gray-400">Add a task below to get started on your productivity journey!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTodos.map((todo) => (
                                            <div
                          key={todo.id}
                          className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                            todo.completed
                              ? 'bg-gray-800/30 border-gray-600/30 opacity-75'
                              : todo.is_currently_tracking
                              ? 'bg-green-500/10 border-green-500/50 hover:border-green-500/70 hover:shadow-green-500/20'
                              : 'bg-gray-800/50 border-gray-600/50 hover:border-[#6E86FF]/50 hover:shadow-[#6E86FF]/20'
                          }`}
                        >
                      {/* Scratch effect overlay */}
                      {todo.completed && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl pointer-events-none" />
                      )}
                      
                      {editingTaskId === todo.id ? (
                        // Edit mode
                        <div className="space-y-4 relative z-10">
                          <div>
                            <input
                              type="text"
                              value={editTask.title}
                              onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                              className="w-full p-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                              placeholder="Task title"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editTask.category}
                              onChange={(e) => setEditTask({...editTask, category: e.target.value})}
                              className="p-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                              placeholder="Category"
                            />
                            <input
                              type="number"
                              value={editTask.duration}
                              onChange={(e) => setEditTask({...editTask, duration: e.target.value})}
                              className="p-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                              placeholder="Duration (min)"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              {(['high', 'medium', 'low'] as const).map((priority) => (
                                <button
                                  key={priority}
                                  onClick={() => setEditTask({...editTask, priority})}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all capitalize text-xs ${
                                    editTask.priority === priority
                                      ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg scale-105`
                                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                  }`}
                                >
                                  {priority}
                                </button>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`spiritual-edit-${todo.id}`}
                                checked={editTask.isSpiritual}
                                onChange={(e) => setEditTask({...editTask, isSpiritual: e.target.checked})}
                                className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                              />
                              <label htmlFor={`spiritual-edit-${todo.id}`} className="text-xs text-gray-300">
                                <Star className="w-3 h-3 text-amber-500 inline" />
                              </label>
                            </div>
                          </div>
                          
                          <input
                            type="date"
                            value={editTask.dueDate}
                            onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                            className="w-full p-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                            <button
                              onClick={saveEdit}
                              className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                            >
                              <Save className="w-4 h-4 text-green-400" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Normal view
                        <div className="flex items-start space-x-4 relative z-10">
                          <button
                            onClick={() => toggleComplete(todo.id)}
                            className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              todo.completed
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 scale-110'
                                : 'border-gray-500 hover:border-[#6E86FF] hover:scale-110'
                            }`}
                          >
                            {todo.completed && (
                              <Check className="w-4 h-4 text-white animate-in fade-in zoom-in duration-300" />
                            )}
                            
                            {/* Ripple effect on click */}
                            <div className={`absolute inset-0 rounded-full ${
                              todo.completed ? 'animate-ping bg-green-400/20' : ''
                            }`} />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`font-medium transition-all duration-300 ${
                                todo.completed
                                  ? 'text-gray-400 line-through'
                                  : todo.is_currently_tracking
                                  ? 'text-green-400'
                                  : 'text-white'
                              }`}>
                                {todo.title}
                                {todo.is_currently_tracking && (
                                  <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                    Tracking
                                  </span>
                                )}
                              </h3>
                              
                              {todo.show_gratitude && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs text-amber-400 font-medium">+25 pts</span>
                                </div>
                              )}
                              
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityColor(todo.priority)}`} />
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              {todo.category && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(todo.category)}`}>
                                  {todo.category}
                                </span>
                              )}
                              
                              {todo.due_date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(todo.due_date)}</span>
                                </div>
                              )}
                              
                                                              {todo.estimated_duration && todo.estimated_duration > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{todo.estimated_duration}m</span>
                                  </div>
                                )}
                                
                                {todo.total_time_spent && todo.total_time_spent > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <RotateCcw className="w-4 h-4" />
                                    <span>{formatTotalTime(todo.total_time_spent)}</span>
                                  </div>
                                )}
                                
                                {todo.is_currently_tracking && trackingTime[todo.id] !== undefined && (
                                  <div className="flex items-center space-x-1 text-green-400 font-medium">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(trackingTime[todo.id])}</span>
                                  </div>
                                )}
                              
                              {todo.total_time_spent && todo.total_time_spent > 0 && (
                                <div className="flex items-center space-x-1">
                                  <RotateCcw className="w-4 h-4" />
                                  <span>{formatTotalTime(todo.total_time_spent)}</span>
                                </div>
                              )}
                              
                              {todo.is_currently_tracking && trackingTime[todo.id] !== undefined && (
                                <div className="flex items-center space-x-1 text-green-400 font-medium">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(trackingTime[todo.id])}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                                                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Time tracking button */}
                              {!todo.completed && (
                                <button
                                  onClick={() => todo.is_currently_tracking 
                                    ? handleStopTimeTracking(todo.id)
                                    : handleStartTimeTracking(todo.id)
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    todo.is_currently_tracking
                                      ? 'bg-red-500/20 hover:bg-red-500/30'
                                      : 'hover:bg-green-500/20'
                                  }`}
                                  disabled={currentlyTracking && !todo.is_currently_tracking}
                                  title={todo.is_currently_tracking ? 'Stop tracking' : 'Start tracking'}
                                >
                                  {todo.is_currently_tracking ? (
                                    <Square className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <Play className="w-4 h-4 text-green-400" />
                                  )}
                                </button>
                              )}
                              
                              <button 
                                onClick={() => startEditing(todo)}
                                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                              >
                                <Edit3 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Desktop: Original layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* Add Task Form - Desktop */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-[#6E86FF]" />
                Add New Task
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="What needs to be done?"
                    className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="spiritual-desktop"
                    checked={newTask.isSpiritual}
                    onChange={(e) => setNewTask({...newTask, isSpiritual: e.target.checked})}
                    className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="spiritual-desktop" className="text-sm text-gray-300 flex items-center">
                    <Star className="w-4 h-4 text-amber-500 mr-1" />
                    Spiritual/Gratitude Task (+25 pts)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <div className="flex space-x-2">
                    {(['high', 'medium', 'low'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewTask({...newTask, priority})}
                        className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                          newTask.priority === priority
                            ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg scale-105`
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      placeholder="e.g., Work, Personal"
                      className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({...newTask, duration: e.target.value})}
                      placeholder="30"
                      className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                  />
                </div>

                <button
                  onClick={addTask}
                  className="w-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List - Desktop */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              {/* Filter Tabs */}
              <div className="border-b border-gray-700/50 p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Tasks</h2>
                  <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                    />
                  </div>
                </div>
                
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
              </div>

              {/* Tasks */}
              <div className="p-6">
                {filteredTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                    <p className="text-gray-400">Add a task above to get started on your productivity journey!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          todo.completed
                            ? 'bg-gray-800/30 border-gray-600/30 opacity-75'
                            : todo.is_currently_tracking
                            ? 'bg-green-500/10 border-green-500/50 hover:border-green-500/70 hover:shadow-green-500/20'
                            : 'bg-gray-800/50 border-gray-600/50 hover:border-[#6E86FF]/50 hover:shadow-[#6E86FF]/20'
                        }`}
                      >
                        {/* Scratch effect overlay */}
                        {todo.completed && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl pointer-events-none" />
                        )}
                        
                        {editingTaskId === todo.id ? (
                          // Edit mode
                          <div className="space-y-4 relative z-10">
                            <div>
                              <input
                                type="text"
                                value={editTask.title}
                                onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                                placeholder="Task title"
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <input
                                type="text"
                                value={editTask.category}
                                onChange={(e) => setEditTask({...editTask, category: e.target.value})}
                                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                                placeholder="Category"
                              />
                              <input
                                type="number"
                                value={editTask.duration}
                                onChange={(e) => setEditTask({...editTask, duration: e.target.value})}
                                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                                placeholder="Duration (min)"
                              />
                              <input
                                type="date"
                                value={editTask.dueDate}
                                onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] transition-all outline-none"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                {(['high', 'medium', 'low'] as const).map((priority) => (
                                  <button
                                    key={priority}
                                    onClick={() => setEditTask({...editTask, priority})}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                                      editTask.priority === priority
                                        ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg scale-105`
                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                    }`}
                                  >
                                    {priority}
                                  </button>
                                ))}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`spiritual-edit-desktop-${todo.id}`}
                                  checked={editTask.isSpiritual}
                                  onChange={(e) => setEditTask({...editTask, isSpiritual: e.target.checked})}
                                  className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                                />
                                <label htmlFor={`spiritual-edit-desktop-${todo.id}`} className="text-sm text-gray-300 flex items-center">
                                  <Star className="w-4 h-4 text-amber-500 mr-1" />
                                  Spiritual/Gratitude Task (+25 pts)
                                </label>
                              </div>
                              
                              <div className="flex space-x-2">
                                <button
                                  onClick={cancelEdit}
                                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                                <button
                                  onClick={saveEdit}
                                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                  <Save className="w-4 h-4" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Normal view
                          <div className="flex items-start space-x-4 relative z-10">
                            <button
                              onClick={() => toggleComplete(todo.id)}
                              className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                todo.completed
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 scale-110'
                                  : 'border-gray-500 hover:border-[#6E86FF] hover:scale-110'
                              }`}
                            >
                              {todo.completed && (
                                <Check className="w-4 h-4 text-white animate-in fade-in zoom-in duration-300" />
                              )}
                              
                              {/* Ripple effect on click */}
                              <div className={`absolute inset-0 rounded-full ${
                                todo.completed ? 'animate-ping bg-green-400/20' : ''
                              }`} />
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className={`font-medium transition-all duration-300 ${
                                  todo.completed
                                    ? 'text-gray-400 line-through'
                                    : todo.is_currently_tracking
                                    ? 'text-green-400'
                                    : 'text-white'
                                }`}>
                                  {todo.title}
                                  {todo.is_currently_tracking && (
                                    <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                      Tracking
                                    </span>
                                  )}
                                </h3>
                                
                                {todo.show_gratitude && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-amber-400 font-medium">+25 pts</span>
                                  </div>
                                )}
                                
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityColor(todo.priority)}`} />
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                {todo.category && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(todo.category)}`}>
                                    {todo.category}
                                  </span>
                                )}
                                
                                {todo.due_date && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(todo.due_date)}</span>
                                  </div>
                                )}
                                
                                {todo.estimated_duration && todo.estimated_duration > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{todo.estimated_duration}m</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Time tracking button */}
                              {!todo.completed && (
                                <button
                                  onClick={() => todo.is_currently_tracking 
                                    ? handleStopTimeTracking(todo.id)
                                    : handleStartTimeTracking(todo.id)
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    todo.is_currently_tracking
                                      ? 'bg-red-500/20 hover:bg-red-500/30'
                                      : 'hover:bg-green-500/20'
                                  }`}
                                  disabled={currentlyTracking && !todo.is_currently_tracking}
                                  title={todo.is_currently_tracking ? 'Stop tracking' : 'Start tracking'}
                                >
                                  {todo.is_currently_tracking ? (
                                    <Square className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <Play className="w-4 h-4 text-green-400" />
                                  )}
                                </button>
                              )}
                              
                              <button 
                                onClick={() => startEditing(todo)}
                                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                              >
                                <Edit3 className="w-4 h-4 text-gray-400" />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay for Add Task */}
      {isMobileOverlayOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileOverlayOpen(false)}>
          <div className="fixed inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl border-t border-gray-700/50 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6 text-[#6E86FF]" />
                <h2 className="text-2xl font-semibold text-white">Add New Task</h2>
              </div>
              <button
                onClick={() => setIsMobileOverlayOpen(false)}
                className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="What needs to be done?"
                  className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none text-lg"
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <input
                  type="checkbox"
                  id="spiritual-mobile-overlay"
                  checked={newTask.isSpiritual}
                  onChange={(e) => setNewTask({...newTask, isSpiritual: e.target.checked})}
                  className="w-5 h-5 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="spiritual-mobile-overlay" className="text-base text-gray-300 flex items-center">
                  <Star className="w-5 h-5 text-amber-500 mr-2" />
                  Spiritual/Gratitude Task (+25 pts)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewTask({...newTask, priority})}
                      className={`p-4 rounded-xl font-medium transition-all capitalize text-base ${
                        newTask.priority === priority
                          ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg scale-105`
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    placeholder="e.g., Work, Personal"
                    className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({...newTask, duration: e.target.value})}
                    placeholder="30"
                    className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-2 focus:ring-[#6E86FF]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={addTask}
                  className="w-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  <Plus className="w-6 h-6" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BibleVerseToast />
    </div>
  );
}