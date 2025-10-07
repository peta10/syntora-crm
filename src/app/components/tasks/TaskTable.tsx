'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Star, 
  Check, 
  Trash2, 
  Edit3, 
  Play, 
  Square,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Filter,
  Wifi,
  WifiOff,
  RefreshCw,
  Save,
  X,
  Info
} from 'lucide-react';
import { Todo } from '@/app/types/todo';
import OfflineTaskManager, { OfflineTask } from '@/app/lib/offline/OfflineTaskManager';
import { useGaming } from '@/app/contexts/GamingContext';
import ChicagoTime from '@/app/utils/timezone';
import TimeTrackingManager, { TimeTrackingState } from '@/app/lib/time-tracking/TimeTrackingManager';

type SortField = 'title' | 'priority' | 'category' | 'date' | 'created_at' | 'estimated_duration';
type SortDirection = 'asc' | 'desc';

interface TaskTableProps {
  filter: string;
  searchQuery: string;
}

export const TaskTable: React.FC<TaskTableProps> = ({ filter, searchQuery }) => {
  const [tasks, setTasks] = useState<OfflineTask[]>([]);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    duration: '',
    isSpiritual: false,
    description: ''
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeTrackingState, setTimeTrackingState] = useState<TimeTrackingState | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const {
    incrementCombo,
    resetCombo,
    triggerConfetti,
    playSound,
    addPoints,
    addXP
  } = useGaming();

  // Initialize and subscribe to task manager
  useEffect(() => {
    const taskManager = OfflineTaskManager;
    
    const unsubscribe = taskManager.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      setIsLoading(false);
    });

    // Initial load
    taskManager.getAllTasks().then(setTasks).finally(() => setIsLoading(false));

    // Subscribe to time tracking updates
    const timeTrackingUnsubscribe = TimeTrackingManager.subscribe(setTimeTrackingState);

    // Update network status and current time for live timers
    const statusInterval = setInterval(() => {
      setNetworkStatus(taskManager.getNetworkStatus());
      setPendingSyncCount(taskManager.getPendingSyncCount());
      setCurrentTime(Date.now()); // Update current time for live timer calculations
    }, 1000);

    return () => {
      unsubscribe();
      timeTrackingUnsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleComplete = async (task: OfflineTask) => {
    const newCompleted = !task.completed;
    await OfflineTaskManager.updateTask(task.id, { completed: newCompleted });

    if (newCompleted) {
      incrementCombo();
      if (task.show_gratitude) {
        triggerConfetti('spiritual');
        playSound('spiritual');
        addPoints(25);
        addXP(35);
      } else {
        triggerConfetti('normal');
        playSound('complete');
        const priorityNum = typeof task.priority === 'string' ? 
          (task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1) : 
          task.priority;
        const basePoints = priorityNum === 5 ? 20 : priorityNum >= 3 ? 15 : 10;
        addPoints(basePoints);
        addXP(Math.floor(basePoints * 1.5));
      }
    } else {
      resetCombo();
    }
  };

  const handleStartEdit = (task: OfflineTask) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      category: task.category || '',
      priority: typeof task.priority === 'string' ? task.priority : 
        (task.priority >= 4 ? 'high' : task.priority >= 2 ? 'medium' : 'low'),
      dueDate: task.due_date || task.date || '',
      duration: task.estimated_duration ? task.estimated_duration.toString() : '',
      isSpiritual: task.show_gratitude,
      description: task.description || ''
    });
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm.title.trim()) {
      const updates = {
        title: editForm.title.trim(),
        category: editForm.category || undefined,
        priority: editForm.priority,
        due_date: editForm.dueDate || undefined,
        estimated_duration: editForm.duration ? parseInt(editForm.duration) : undefined,
        show_gratitude: editForm.isSpiritual,
        description: editForm.description.trim() || undefined
      };
      
      await OfflineTaskManager.updateTask(editingId, updates);
      setEditingId(null);
      playSound('default');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      duration: '',
      isSpiritual: false,
      description: ''
    });
  };

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredTasks.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleBulkComplete = async () => {
    for (const taskId of selectedRows) {
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        await OfflineTaskManager.updateTask(taskId, { completed: true });
      }
    }
    setSelectedRows(new Set());
  };

  const handleBulkDelete = async () => {
    for (const taskId of selectedRows) {
      await OfflineTaskManager.deleteTask(taskId);
    }
    setSelectedRows(new Set());
  };

  const handleForceSync = async () => {
    try {
      await OfflineTaskManager.forceSyncNow();
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('refresh')) {
        alert('Session expired. Please refresh the page and sign in again.');
      } else {
        alert('Sync failed. Please check your internet connection and try again.');
      }
    }
  };

  const handleTimeTrackingToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      if (task.is_currently_tracking) {
        console.log('⏹️ Stopping tracking for:', task.title);
        const result = await OfflineTaskManager.stopTimeTracking(taskId);
        console.log('⏹️ Stop result:', result);
        
        // Force refresh all tasks to ensure we get the latest data
        setTimeout(async () => {
          const refreshedTasks = await OfflineTaskManager.getAllTasks();
          setTasks(refreshedTasks);
          console.log('🔄 Refreshed tasks after stop tracking');
        }, 500);
        
      } else {
        console.log('▶️ Starting tracking for:', task.title);
        await OfflineTaskManager.startTimeTracking(taskId);
      }
      playSound('default');
    } catch (error) {
      console.error('Time tracking toggle failed:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return ChicagoTime.formatDate(dateString);
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low' | number) => {
    let level: 'high' | 'medium' | 'low';
    
    if (typeof priority === 'string') {
      level = priority;
    } else {
      level = priority >= 4 ? 'high' : priority >= 2 ? 'medium' : 'low';
    }
    
    const styles = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[level]} capitalize`}>
        {level}
      </span>
    );
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    const styles = {
      Work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      Personal: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      Spiritual: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      Health: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    
    const style = styles[category as keyof typeof styles] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${style}`}>
        {category}
      </span>
    );
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      // Apply filter logic
      if (filter === 'All') return true;
      if (filter === 'Active') return !task.completed;
      if (filter === 'Completed') return task.completed;
      if (filter === 'Spiritual') return task.show_gratitude;
      if (filter === 'Personal') return task.category?.toLowerCase() === 'personal';
      if (filter === 'Work') return task.category?.toLowerCase() === 'work';
      if (filter === 'Today') {
        if (!task.due_date && !task.date) return false;
        const taskDate = task.due_date || task.date;
        return taskDate ? ChicagoTime.isToday(taskDate) : false;
      }
      return true;
    })
    .filter(task => 
      searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'priority':
          const aPriority = typeof a.priority === 'string' ? 
            (a.priority === 'high' ? 5 : a.priority === 'medium' ? 3 : 1) : 
            (a.priority || 0);
          const bPriority = typeof b.priority === 'string' ? 
            (b.priority === 'high' ? 5 : b.priority === 'medium' ? 3 : 1) : 
            (b.priority || 0);
          aValue = aPriority;
          bValue = bPriority;
          break;
        case 'date':
          aValue = a.due_date || a.date || '9999-12-31';
          bValue = b.due_date || b.date || '9999-12-31';
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'estimated_duration':
          aValue = a.estimated_duration || 0;
          bValue = b.estimated_duration || 0;
          break;
        case 'created_at':
        default:
          aValue = a.created_at;
          bValue = b.created_at;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = '' 
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 text-left font-medium text-gray-300 hover:text-white transition-colors ${className}`}
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
        <ChevronUp className="w-4 h-4" /> : 
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Connection Status Bar */}
      <div className={`px-6 py-2 border-b border-gray-700/50 flex items-center justify-between text-sm ${
        networkStatus === 'offline' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'
      }`}>
        <div className="flex items-center space-x-2">
          {networkStatus === 'offline' ? (
            <WifiOff className="w-4 h-4 text-red-400" />
          ) : (
            <Wifi className="w-4 h-4 text-green-400" />
          )}
          <span className={networkStatus === 'offline' ? 'text-red-400' : 'text-green-400'}>
            {networkStatus === 'offline' ? 'Offline Mode' : 'Online'}
          </span>
          {pendingSyncCount > 0 && (
            <span className="text-yellow-400">
              ({pendingSyncCount} pending sync)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {networkStatus === 'online' && pendingSyncCount > 0 && (
            <button
              onClick={handleForceSync}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Now</span>
            </button>
          )}
          <button
            onClick={async () => {
              const refreshedTasks = await OfflineTaskManager.getAllTasks();
              setTasks(refreshedTasks);
              console.log('🔄 Manual refresh completed');
            }}
            className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-400 text-sm font-medium">
              {selectedRows.size} task{selectedRows.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleBulkComplete}
                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition-colors"
              >
                Mark Complete
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setSelectedRows(new Set())}
                className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-800/50 border-b border-gray-700/50">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredTasks.length && filteredTasks.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#6E86FF] bg-gray-800 border-gray-600 rounded focus:ring-[#6E86FF]"
                />
              </th>
              <th className="text-left p-4 min-w-0 flex-1">
                <SortableHeader field="title">Task</SortableHeader>
              </th>
              <th className="text-left p-4 w-24">
                <SortableHeader field="priority">Priority</SortableHeader>
              </th>
              <th className="text-left p-4 w-28">
                <SortableHeader field="category">Category</SortableHeader>
              </th>
              <th className="text-left p-4 w-24">
                <SortableHeader field="date">Due</SortableHeader>
              </th>
              <th className="text-left p-4 w-20">
                <SortableHeader field="estimated_duration">Est.</SortableHeader>
              </th>
              <th className="text-left p-4 w-24">Tracked</th>
              <th className="text-left p-4 w-32">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <tr
                  className={`border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors group ${
                    task.completed ? 'opacity-60' : ''
                  } ${task.is_currently_tracking ? 'bg-green-500/5 border-green-500/20' : ''} ${
                    task._needsSync ? 'bg-yellow-500/5 border-yellow-500/20' : ''
                  } ${editingId === task.id ? 'bg-blue-500/5 border-blue-500/20' : ''}`}
                >
                {/* Checkbox */}
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(task.id)}
                    onChange={() => handleRowSelect(task.id)}
                    className="w-4 h-4 text-[#6E86FF] bg-gray-800 border-gray-600 rounded focus:ring-[#6E86FF]"
                  />
                </td>

                {/* Task Title */}
                <td className="p-4 min-w-0">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                          : 'border-gray-500 hover:border-[#6E86FF]'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-medium ${
                            task.completed ? 'text-gray-400 line-through' : 
                            task.is_currently_tracking ? 'text-green-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.is_currently_tracking && (
                          <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse">
                            Tracking
                          </span>
                        )}
                        {task.show_gratitude && (
                          <Star className="w-4 h-4 text-amber-400" />
                        )}
                        {task._needsSync && (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Needs sync" />
                        )}
                        {task.description && (
                          <div className="relative group">
                            <Info className="w-3 h-3 text-gray-500 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 whitespace-nowrap z-10 max-w-xs">
                              {task.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Priority */}
                <td className="p-4">
                  {getPriorityBadge(task.priority || 3)}
                </td>

                {/* Category */}
                <td className="p-4">
                  {getCategoryBadge(task.category)}
                </td>

                {/* Due Date */}
                <td className="p-4">
                  {(task.due_date || task.date) && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.due_date || task.date || '')}</span>
                    </div>
                  )}
                </td>

                {/* Estimated Time */}
                <td className="p-4">
                  {task.estimated_duration && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimated_duration}m</span>
                    </div>
                  )}
                </td>

                {/* Tracked Time */}
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {task.is_currently_tracking && task.time_started_at ? (
                      <div className="flex items-center space-x-1 text-green-400 font-medium">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm">
                          {(() => {
                            const startTime = new Date(task.time_started_at);
                            const elapsedSeconds = Math.floor((currentTime - startTime.getTime()) / 1000);
                            const hours = Math.floor(elapsedSeconds / 3600);
                            const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                            const secs = elapsedSeconds % 60;
                            
                            if (hours > 0) {
                              return `${hours}h ${minutes}m ${secs}s`;
                            } else if (minutes > 0) {
                              return `${minutes}m ${secs}s`;
                            } else {
                              return `${secs}s`;
                            }
                          })()}
                        </span>
                      </div>
                    ) : task.total_time_spent && task.total_time_spent > 0 ? (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">
                          {(() => {
                            console.log(`📊 Displaying time for ${task.title}: ${task.total_time_spent} minutes`);
                            const hours = Math.floor(task.total_time_spent / 60);
                            const mins = task.total_time_spent % 60;
                            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500" title={`Total time: ${task.total_time_spent || 0} minutes`}>
                        --
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Time Tracking Button */}
                    {!task.completed && (
                      <button
                        onClick={() => handleTimeTrackingToggle(task.id)}
                        className={`p-1.5 rounded transition-colors ${
                          task.is_currently_tracking
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                            : 'hover:bg-green-500/20 text-green-400'
                        }`}
                        title={task.is_currently_tracking ? 'Stop tracking' : 'Start tracking'}
                      >
                        {task.is_currently_tracking ? (
                          <Square className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="p-1.5 rounded hover:bg-gray-700/50 transition-colors text-gray-400"
                      title="Edit task"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => OfflineTaskManager.deleteTask(task.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-400"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Editing Row */}
              {editingId === task.id && (
                <tr className="bg-gray-800/50 border-b border-gray-700/50">
                  <td className="p-4"></td>
                  <td className="p-4" colSpan={7}>
                    <div className="space-y-4">
                      {/* Title and Description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full p-2 rounded bg-gray-700/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] outline-none"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            placeholder="Optional description..."
                            className="w-full p-2 rounded bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-500 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] outline-none"
                          />
                        </div>
                      </div>

                      {/* Priority, Category, Date, Duration */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
                          <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm({...editForm, priority: e.target.value as 'high' | 'medium' | 'low'})}
                            className="w-full p-2 rounded bg-gray-700/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] outline-none"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                            placeholder="Work, Personal..."
                            className="w-full p-2 rounded bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-500 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={editForm.dueDate}
                            onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                            className="w-full p-2 rounded bg-gray-700/50 border border-gray-600/50 text-white focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Duration (min)</label>
                          <input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                            placeholder="30"
                            className="w-full p-2 rounded bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-500 focus:border-[#6E86FF] focus:ring-1 focus:ring-[#6E86FF] outline-none"
                          />
                        </div>
                      </div>

                      {/* Spiritual checkbox and actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`spiritual-edit-${task.id}`}
                            checked={editForm.isSpiritual}
                            onChange={(e) => setEditForm({...editForm, isSpiritual: e.target.checked})}
                            className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                          />
                          <label htmlFor={`spiritual-edit-${task.id}`} className="text-xs text-gray-300 flex items-center">
                            <Star className="w-3 h-3 text-amber-500 mr-1" />
                            Spiritual/Gratitude Task (+25 pts)
                          </label>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition-colors flex items-center space-x-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
          <p className="text-gray-400">
            {searchQuery ? `No tasks match "${searchQuery}"` : 'Create your first task to get started!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
