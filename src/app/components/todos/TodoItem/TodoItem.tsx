import React, { useState, useCallback } from 'react';
import { Check, Trash2, Clock, Zap, Target, Edit2 } from 'lucide-react';
import { Todo } from '@/app/types/todo';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationWrapper } from '../utils/NotificationWrapper';

interface TodoItemProps {
  todo: Todo;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onComplete, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [isHovered, setIsHovered] = useState(false);
  const [notify, setNotify] = useState<((title: string, body: string) => Promise<void>) | null>(null);

  const handleNotify = useCallback((notifyFn: (title: string, body: string) => Promise<void>) => {
    setNotify(() => notifyFn);
  }, []);

  const handleComplete = async () => {
    onComplete(todo.id);
    if (!todo.completed && notify) {
      const notificationTitle = '✨ Task Completed!';
      const body = `Completed: ${todo.title}`;
      try {
        await notify(notificationTitle, body);
      } catch (error) {
        console.warn('Failed to send notification:', error);
      }
    }
  };

  const handleSave = () => {
    if (title.trim() !== todo.title) {
      onUpdate(todo.id, { title: title.trim() });
    }
    setIsEditing(false);
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    const colors = {
      high: 'bg-red-100 border-red-300 text-red-800',
      medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      low: 'bg-blue-100 border-blue-300 text-blue-800'
    } as const;
    return colors[priority] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getPriorityIcon = (priority: Todo['priority']) => {
    if (priority === 'high') return <Zap className="w-3 h-3" />;
    if (priority === 'medium') return <Target className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  return (
    <>
      <NotificationWrapper onNotify={handleNotify} />
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all duration-300 
          hover:shadow-lg border
          ${todo.completed ? 'opacity-75' : ''}
          ${todo.show_gratitude ? 'border-spiritual-300 bg-gradient-to-r from-spiritual-50 to-blue-50 dark:from-spiritual-900/20 dark:to-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-4">
          {/* Completion Button */}
          <button
            onClick={handleComplete}
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center 
              transition-all duration-200 transform hover:scale-110
              ${todo.completed
                ? 'bg-green-500 border-green-500 text-white'
                : todo.show_gratitude
                ? 'border-spiritual-400 hover:border-spiritual-500'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {todo.completed && <Check className="w-4 h-4" />}
          </button>

          {/* Todo Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                  className="flex-1 px-2 py-1 border border-spiritual-300 rounded-lg 
                           focus:ring-2 focus:ring-spiritual-500 focus:border-transparent
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  autoFocus
                />
              ) : (
                <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                  {todo.title}
                </span>
              )}
              
              {/* Priority Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getPriorityColor(todo.priority)}`}>
                  {getPriorityIcon(todo.priority)}
                <span className="capitalize">{todo.priority}</span>
              </span>
            </div>
            
            {/* Meta Information */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
              {todo.category && <span className="capitalize">{todo.category}</span>}
              {todo.estimated_duration && <span>• {todo.estimated_duration}m</span>}
              {todo.show_gratitude && <span>• ✨ Spiritual/Gratitude</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {(isHovered || isEditing) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex space-x-1"
              >
            <button
              onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Edit todo"
            >
                  <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete todo"
            >
                  <Trash2 className="w-4 h-4" />
            </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default TodoItem; 