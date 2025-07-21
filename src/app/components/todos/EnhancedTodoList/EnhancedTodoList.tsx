"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Calendar, Clock, Star, Check, Trash2, Edit3, Zap, Target, Trophy, Flame, Volume2, VolumeX, Sparkles, Award, TrendingUp, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/app/types/todo';
import useStore from '@/app/store/slices/todoSlice';
import { NotificationWrapper } from '../utils/NotificationWrapper';
import { EnhancedTodoForm } from '..';

type FilterType = 'all' | 'active' | 'completed' | 'spiritual' | 'today';
type SortType = 'priority' | 'date' | 'category';

const EnhancedTodoList: React.FC = () => {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, deleteTodo } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [showPointsBurst, setShowPointsBurst] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  // Audio context for sound effects
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContext.current) {
      try {
        // @ts-expect-error - Safari support for webkitAudioContext
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.log('Audio not supported');
      }
    }
  }, [soundEnabled]);

  // Play sound effect
  const playSound = (type: 'complete' | 'spiritual' | 'combo' | 'default') => {
    if (!soundEnabled || !audioContext.current) return;

    try {
      const ctx = audioContext.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      switch (type) {
        case 'complete':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          break;
          
        case 'spiritual':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1047, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(523, ctx.currentTime + 0.5);
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
          break;
          
        case 'combo':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1200 + (combo * 100), ctx.currentTime);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          break;
          
        default:
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      }

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.log('Audio playback failed');
    }
  };

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Handle todo completion
  const handleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
      
      if (!todo.completed) {
        setCombo((prev) => {
          const newCombo = prev + 1;
          if (newCombo > 1) {
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 1500);
            playSound('combo');
          }
          return newCombo;
        });

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);

        if (todo.show_gratitude) {
          playSound('spiritual');
        } else {
          playSound('complete');
        }

        // Calculate points
        const basePoints = todo.show_gratitude ? 25 : 
                         (todo.priority === 'high' ? 20 : 
                          todo.priority === 'medium' ? 15 : 10);
        const comboBonus = combo >= 3 ? 5 : 0;
        const totalPoints = basePoints + comboBonus;
        
        setTodayPoints((prev) => prev + totalPoints);
        setShowPointsBurst(true);
        setTimeout(() => setShowPointsBurst(false), 2000);
      } else {
        setCombo(0);
        const points = todo.show_gratitude ? 25 : 
                      (todo.priority === 'high' ? 20 : 
                       todo.priority === 'medium' ? 15 : 10);
        setTodayPoints((prev) => Math.max(0, prev - points));
      }
    }
  };

  // Filter and sort todos
  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      case 'spiritual':
        return todo.show_gratitude;
      case 'today':
        return todo.due_date && new Date(todo.due_date).toDateString() === new Date().toDateString();
      default:
        return true;
    }
  });

  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sort) {
      case 'priority':
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Calculate progress
  const todayTodos = todos.filter(t => 
    t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()
  );
  const completedToday = todayTodos.filter(t => t.completed).length;
  const progressPercentage = todayTodos.length > 0 ? (completedToday / todayTodos.length) * 100 : 0;

  const getProductivityInsight = () => {
    if (completedToday >= 5) return { text: "🔥 You're on fire!", color: "text-red-400" };
    if (completedToday >= 3) return { text: "💪 Great momentum!", color: "text-green-400" };
    if (completedToday >= 1) return { text: "✨ Good start!", color: "text-blue-400" };
    return { text: "🚀 Ready to begin?", color: "text-purple-400" };
  };

  const insight = getProductivityInsight();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-spiritual-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Syntora Tasks
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-gray-400 flex items-center space-x-2">
                  <span>Personal Productivity Engine</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="ml-2 p-1 rounded hover:bg-gray-700/50 transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </p>
                <span className={`text-sm font-medium ${insight.color}`}>{insight.text}</span>
              </div>
            </div>
          </div>

          {/* Stats dashboard */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Combo counter */}
            {combo > 1 && (
              <div className={`relative flex items-center space-x-2 px-3 py-2 rounded-full 
                             bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 
                             ${showCombo ? 'animate-pulse scale-110' : ''} transition-all duration-500`}>
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-purple-300">{combo}x combo!</span>
                {showCombo && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-purple-400 font-bold animate-bounce">
                    🔥 COMBO!
                  </div>
                )}
              </div>
            )}

            {/* Points display */}
            <div className={`relative flex items-center space-x-2 px-4 py-2 rounded-full 
                           bg-gradient-to-r from-spiritual-500/20 to-blue-500/20 border border-spiritual-500/30 
                           ${showPointsBurst ? 'animate-pulse scale-110' : ''} transition-all duration-500`}>
              <Zap className="w-5 h-5 text-spiritual-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Today</span>
                <span className="font-bold bg-gradient-to-r from-spiritual-500 to-blue-500 bg-clip-text text-transparent">
                  {todayPoints} pts
                </span>
              </div>
              {showPointsBurst && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                               bg-gradient-to-r from-spiritual-500 to-blue-500 bg-clip-text text-transparent 
                               font-bold animate-bounce">
                  +{combo > 1 ? combo * 5 : 15}
                </div>
              )}
            </div>

            {/* Progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-700"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-spiritual-500 transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercentage}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ filter: progressPercentage === 100 ? 'drop-shadow(0 0 8px #6E86FF)' : 'none' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-2">
            {(['all', 'today', 'active', 'completed', 'spiritual'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${filter === f 
                    ? 'bg-spiritual-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spiritual-500"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Todo Form */}
      <EnhancedTodoForm />

      {/* Todo List */}
      <div className="max-w-7xl mx-auto">
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : sortedTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No todos found. Add one to get started!
              </div>
            ) : (
              sortedTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`
                    bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300
                    ${todo.completed ? 'border-gray-700/50 opacity-75' : 'border-gray-600/50'}
                    ${todo.show_gratitude ? 'bg-gradient-to-r from-spiritual-900/50 to-blue-900/50' : ''}
                    hover:border-spiritual-500/50 hover:shadow-lg hover:shadow-spiritual-500/10
                  `}
                >
                  <div className="flex items-center space-x-4">
                    {/* Completion Button */}
                    <button
                      onClick={() => handleComplete(todo.id)}
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center 
                        transition-all duration-200 transform hover:scale-110
                        ${todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : todo.show_gratitude
                          ? 'border-spiritual-400 hover:border-spiritual-500'
                          : 'border-gray-500 hover:border-gray-400'
                        }
                      `}
                    >
                      {todo.completed && <Check className="w-4 h-4" />}
                    </button>

                    {/* Todo Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {todo.title}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1
                                     ${todo.priority === 'high' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                                       todo.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
                                       'bg-blue-500/20 border-blue-500/30 text-blue-300'}`}>
                          {todo.priority === 'high' ? <Zap className="w-3 h-3" /> :
                           todo.priority === 'medium' ? <Target className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          <span className="capitalize">{todo.priority}</span>
                        </span>
                      </div>
                      
                      {/* Meta Information */}
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        {todo.category && (
                          <span className="px-2 py-1 rounded-full bg-gray-700/50 border border-gray-600/50">
                            {todo.category}
                          </span>
                        )}
                        {todo.estimated_duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{todo.estimated_duration}m</span>
                          </span>
                        )}
                        {todo.show_gratitude && (
                          <span className="flex items-center space-x-1 text-spiritual-400">
                            <Star className="w-3 h-3" />
                            <span>Spiritual/Gratitude</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`confetti-${Date.now()}-${Math.random()}-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  backgroundColor: ['#6E86FF', '#FF6BBA', '#B279DB', '#4F46E5', '#EC4899'][Math.floor(Math.random() * 5)],
                }}
                initial={{ y: -10, rotate: 0, opacity: 1 }}
                animate={{ y: window.innerHeight + 10, rotate: 720, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1 + Math.random(),
                  delay: Math.random(),
                  ease: "linear"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedTodoList; 