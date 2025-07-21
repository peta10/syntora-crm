'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Star, 
  Check, 
  Phone, 
  Mail, 
  Users, 
  Target, 
  Building,
  User,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Todo } from '@/app/types/todo';
import { ActivityWithRelations } from '@/app/types/crm';
import { ActivitiesAPI } from '@/app/lib/api/crm-activities';
import useStore from '@/app/store/slices/todoSlice';
import { useGaming } from '@/app/contexts/GamingContext';

// Combined task type for unified display
interface UnifiedTask {
  id: string;
  title: string;
  description?: string;
  type: 'personal' | 'crm_activity';
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  dueDate?: string;
  category?: string;
  tags?: string[];
  
  // Personal todo specific
  isSpiritual?: boolean;
  estimatedDuration?: number;
  
  // CRM activity specific
  activityType?: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow_up';
  contactName?: string;
  companyName?: string;
  dealName?: string;
  outcome?: string;
  
  // Unified fields
  createdAt: string;
  updatedAt: string;
}

interface TaskSectionProps {
  title: string;
  tasks: UnifiedTask[];
  icon: React.ReactNode;
  onToggleComplete: (task: UnifiedTask) => void;
  onEdit?: (task: UnifiedTask) => void;
  onDelete?: (task: UnifiedTask) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({ 
  title, 
  tasks, 
  icon, 
  onToggleComplete, 
  onEdit, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getActivityIcon = (activityType?: string) => {
    switch (activityType) {
      case 'call': return <Phone className="w-4 h-4 text-blue-400" />;
      case 'email': return <Mail className="w-4 h-4 text-green-400" />;
      case 'meeting': return <Users className="w-4 h-4 text-purple-400" />;
      case 'task': return <Target className="w-4 h-4 text-orange-400" />;
      default: return null;
    }
  };

  const completedTasks = tasks.filter(t => t.isCompleted);
  const pendingTasks = tasks.filter(t => !t.isCompleted);

  return (
    <Card className="bg-gray-900/50 border-gray-700/50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <CardTitle className="text-white text-lg">{title}</CardTitle>
              <CardDescription className="text-gray-400">
                {pendingTasks.length} pending, {completedTasks.length} completed
              </CardDescription>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {/* Pending Tasks */}
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="group relative p-4 rounded-xl border bg-gray-800/50 border-gray-600/50 hover:border-[#6E86FF]/50 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => onToggleComplete(task)}
                  className="relative w-6 h-6 rounded-full border-2 border-gray-500 hover:border-[#6E86FF] hover:scale-110 transition-all duration-300 flex items-center justify-center"
                >
                  {task.isCompleted && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-white">{task.title}</h3>
                    
                    {task.type === 'crm_activity' && task.activityType && (
                      <div className="flex items-center space-x-1">
                        {getActivityIcon(task.activityType)}
                        <span className="text-xs text-gray-400 capitalize">
                          {task.activityType}
                        </span>
                      </div>
                    )}
                    
                    {task.isSpiritual && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">+25 pts</span>
                      </div>
                    )}
                    
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityColor(task.priority)}`} />
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {task.contactName && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{task.contactName}</span>
                      </div>
                    )}
                    
                    {task.companyName && (
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{task.companyName}</span>
                      </div>
                    )}
                    
                    {task.dealName && (
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{task.dealName}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {task.estimatedDuration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimatedDuration}m</span>
                      </div>
                    )}
                  </div>
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{task.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="pt-4 border-t border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Completed ({completedTasks.length})
              </h4>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/30 opacity-75"
                  >
                    <button
                      onClick={() => onToggleComplete(task)}
                      className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </button>
                    <div className="flex-1">
                      <span className="text-sm text-gray-400 line-through">{task.title}</span>
                      {task.outcome && (
                        <p className="text-xs text-gray-500 mt-1">{task.outcome}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No tasks in this category</div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface EnhancedTasksViewProps {
  selectedDate?: Date;
  showFilters?: boolean;
}

export const EnhancedTasksView: React.FC<EnhancedTasksViewProps> = ({ 
  selectedDate = new Date(),
  showFilters = true 
}) => {
  const { todos, fetchTodos, updateTodo } = useStore();
  const [crmActivities, setCrmActivities] = useState<ActivityWithRelations[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { 
    addXP, 
    addPoints, 
    incrementCombo, 
    resetCombo, 
    triggerConfetti, 
    playSound 
  } = useGaming();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchTodos();
        const activities = await ActivitiesAPI.getTodayActivities();
        setCrmActivities(activities);
      } catch (error) {
        console.error('Error loading tasks data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDate, fetchTodos]);

  // Convert todos to unified tasks
  const personalTasks: UnifiedTask[] = todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    type: 'personal' as const,
    priority: todo.priority,
    isCompleted: todo.completed,
    dueDate: todo.due_date,
    category: todo.category,
    tags: todo.tags,
    isSpiritual: todo.show_gratitude,
    estimatedDuration: todo.estimated_duration,
    createdAt: todo.created_at,
    updatedAt: todo.updated_at
  }));

  // Convert CRM activities to unified tasks
  const crmTasks: UnifiedTask[] = crmActivities.map(activity => ({
    id: activity.id,
    title: activity.subject,
    description: activity.description,
    type: 'crm_activity' as const,
    priority: activity.priority,
    isCompleted: activity.is_completed,
    dueDate: activity.activity_date,
    activityType: activity.activity_type,
    contactName: activity.contact ? `${activity.contact.first_name} ${activity.contact.last_name}` : undefined,
    companyName: activity.contact?.company,
    dealName: activity.deal?.deal_name,
    outcome: activity.outcome,
    createdAt: activity.created_at,
    updatedAt: activity.updated_at
  }));

  // Filter tasks
  const getFilteredTasks = (tasks: UnifiedTask[]) => {
    switch (filter) {
      case 'pending':
        return tasks.filter(t => !t.isCompleted);
      case 'completed':
        return tasks.filter(t => t.isCompleted);
      case 'high-priority':
        return tasks.filter(t => t.priority === 'high');
      case 'spiritual':
        return tasks.filter(t => t.isSpiritual);
      default:
        return tasks;
    }
  };

  const filteredPersonalTasks = getFilteredTasks(personalTasks);
  const filteredCrmTasks = getFilteredTasks(crmTasks);

  // Handle task completion
  const handleToggleComplete = async (task: UnifiedTask) => {
    try {
      if (task.type === 'personal') {
        await updateTodo(task.id, { completed: !task.isCompleted });
        
        if (!task.isCompleted) {
          // Task is being completed
          incrementCombo();
          triggerConfetti(task.isSpiritual ? 'spiritual' : 'normal');
          playSound(task.isSpiritual ? 'spiritual' : 'complete');
          
          const basePoints = task.isSpiritual ? 25 : 
                           (task.priority === 'high' ? 20 : 
                            task.priority === 'medium' ? 15 : 10);
          const totalPoints = basePoints + 6; // difficulty bonus
          addPoints(totalPoints);
          addXP(Math.floor(totalPoints * 1.5));
        } else {
          resetCombo();
        }
      } else if (task.type === 'crm_activity') {
        await ActivitiesAPI.markCompleted(task.id, task.outcome);
        
        // Refresh CRM activities
        const activities = await ActivitiesAPI.getTodayActivities();
        setCrmActivities(activities);
        
        if (!task.isCompleted) {
          // Activity is being completed
          triggerConfetti('normal');
          playSound('complete');
          addPoints(15); // CRM activity points
          addXP(20);
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-spiritual-500/30 border-t-spiritual-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All Tasks' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'high-priority', label: 'High Priority' },
                  { value: 'spiritual', label: 'Spiritual' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      filter === filterOption.value
                        ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Sections */}
      <div className="space-y-6">
        <TaskSection
          title="Personal Tasks"
          tasks={filteredPersonalTasks}
          icon={<Star className="w-5 h-5 text-purple-400" />}
          onToggleComplete={handleToggleComplete}
        />
        
        <TaskSection
          title="CRM Activities"
          tasks={filteredCrmTasks}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          onToggleComplete={handleToggleComplete}
        />
      </div>

      {/* Summary */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Today&#39;s Summary</CardTitle>
          <CardDescription className="text-gray-400">
            Your productivity overview for {selectedDate.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {personalTasks.filter(t => !t.isCompleted).length + crmTasks.filter(t => !t.isCompleted).length}
              </div>
              <p className="text-sm text-gray-400">Pending Tasks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {personalTasks.filter(t => t.isCompleted).length + crmTasks.filter(t => t.isCompleted).length}
              </div>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {personalTasks.filter(t => t.isSpiritual).length}
              </div>
              <p className="text-sm text-gray-400">Spiritual Tasks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {crmTasks.length}
              </div>
              <p className="text-sm text-gray-400">CRM Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTasksView; 