'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Lightbulb, Target, TrendingUp, Calendar, Clock, Zap, Brain,
  AlertCircle, CheckCircle2, Star, Settings, MessageSquare, Send,
  Sparkles, Award, Coffee, Flame, Heart, Activity, ArrowRight, Plus
} from 'lucide-react';
import { Todo, TaskSuggestion, WeeklyInsight, Project } from '@/app/types/todo';

interface ProductivityAssistantProps {
  todos: Todo[];
  projects: Project[];
  onCreateTodo: (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
}

interface AIInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'celebration' | 'optimization';
  title: string;
  description: string;
  action?: {
    label: string;
    handler: () => void;
  };
  priority: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: TaskSuggestion[];
}

export const ProductivityAssistant: React.FC<ProductivityAssistantProps> = ({
  todos,
  projects,
  onCreateTodo,
  onUpdateTodo
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'suggestions' | 'chat'>('insights');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);

  // Generate AI insights based on user data
  const aiInsights = useMemo(() => {
    const insights: AIInsight[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Overdue task warning
    const overdueTasks = todos.filter(todo => 
      todo.due_date && 
      new Date(todo.due_date) < today && 
      !todo.completed
    );

    if (overdueTasks.length > 0) {
      insights.push({
        id: 'overdue-tasks',
        type: 'warning',
        title: 'Overdue Tasks Need Attention',
        description: `You have ${overdueTasks.length} overdue tasks. Consider rescheduling or breaking them into smaller pieces.`,
        action: {
          label: 'Review Overdue',
          handler: () => {
            // Would navigate to overdue tasks view
            console.log('Navigate to overdue tasks');
          }
        },
        priority: 'high',
        icon: <AlertCircle className="w-5 h-5 text-red-400" />
      });
    }

    // High productivity celebration
    const completedToday = todos.filter(todo => 
      todo.completed && 
      new Date(todo.updated_at).toDateString() === today.toDateString()
    );

    if (completedToday.length >= 5) {
      insights.push({
        id: 'high-productivity',
        type: 'celebration',
        title: 'Outstanding Productivity!',
        description: `You&apos;ve completed ${completedToday.length} tasks today. You&apos;re on fire! 🔥`,
        priority: 'medium',
        icon: <Award className="w-5 h-5 text-yellow-400" />
      });
    }

    // Work-life balance suggestion
    const workTasks = todos.filter(todo => 
      todo.category?.toLowerCase().includes('work') && 
      todo.completed &&
      new Date(todo.updated_at).toDateString() === today.toDateString()
    );
    
    const personalTasks = todos.filter(todo => 
      todo.category?.toLowerCase().includes('personal') && 
      todo.completed &&
      new Date(todo.updated_at).toDateString() === today.toDateString()
    );

    if (workTasks.length > 0 && personalTasks.length === 0) {
      insights.push({
        id: 'work-life-balance',
        type: 'suggestion',
        title: 'Consider Personal Time',
        description: 'You&apos;ve been focused on work tasks. How about adding a personal or wellness activity?',
        action: {
          label: 'Add Personal Task',
          handler: () => {
            onCreateTodo({
              title: 'Take a 15-minute walk',
              category: 'Personal',
              priority: 'medium',
              completed: false,
              show_gratitude: false
            });
          }
        },
        priority: 'medium',
        icon: <Heart className="w-5 h-5 text-pink-400" />
      });
    }

    // Pomodoro session suggestion
    const highPriorityTasks = todos.filter(todo => 
      !todo.completed && 
      todo.priority === 'high'
    );

    if (highPriorityTasks.length >= 2) {
      insights.push({
        id: 'focus-session',
        type: 'optimization',
        title: 'Time for Deep Work',
        description: 'You have multiple high-priority tasks. Consider starting a focused work session.',
        action: {
          label: 'Start Focus Session',
          handler: () => {
            // Would open focus timer with high-priority tasks
            console.log('Start focus session');
          }
        },
        priority: 'medium',
        icon: <Brain className="w-5 h-5 text-purple-400" />
      });
    }

    // Empty calendar suggestion
    const todayTasks = todos.filter(todo => 
      todo.due_date && 
      new Date(todo.due_date).toDateString() === today.toDateString()
    );

    if (todayTasks.length === 0 && new Date().getHours() < 12) {
      insights.push({
        id: 'plan-day',
        type: 'suggestion',
        title: 'Plan Your Day',
        description: 'Your schedule looks light today. Consider adding some important tasks or goals.',
        action: {
          label: 'Quick Planning',
          handler: () => {
            generateDailyPlan();
          }
        },
        priority: 'medium',
        icon: <Calendar className="w-5 h-5 text-blue-400" />
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [todos, projects, onCreateTodo]);

  // Generate smart task suggestions
  const taskSuggestions = useMemo(() => {
    const suggestions: TaskSuggestion[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based suggestions
    if (hour >= 6 && hour <= 9) {
      suggestions.push({
        id: 'morning-routine',
        title: 'Morning Planning Session',
        description: 'Review your goals and plan the day ahead',
        category: 'Planning',
        priority: 'medium',
        estimated_duration: 15,
        reasoning: 'Morning is ideal for planning and setting intentions',
        confidence_score: 0.85,
        tags: ['planning', 'routine'],
        suggested_time: '08:00'
      });
    }

    if (hour >= 14 && hour <= 16) {
      suggestions.push({
        id: 'afternoon-energy',
        title: 'Tackle High-Priority Task',
        description: 'Use your afternoon energy peak for important work',
        category: 'Work',
        priority: 'high',
        estimated_duration: 60,
        reasoning: 'Afternoon is typically when energy and focus are highest',
        confidence_score: 0.9,
        tags: ['focus', 'productivity']
      });
    }

    if (hour >= 18 && hour <= 21) {
      suggestions.push({
        id: 'evening-reflection',
        title: 'Daily Reflection',
        description: 'Reflect on accomplishments and plan for tomorrow',
        category: 'Personal',
        priority: 'medium',
        estimated_duration: 10,
        reasoning: 'Evening reflection improves learning and planning',
        confidence_score: 0.8,
        tags: ['reflection', 'gratitude']
      });
    }

    // Category-based suggestions
    const categories = todos.reduce((acc, todo) => {
      if (todo.category) {
        acc[todo.category] = (acc[todo.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostCommonCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (mostCommonCategory && Math.random() > 0.7) {
      suggestions.push({
        id: 'category-continuation',
        title: `Continue ${mostCommonCategory} Tasks`,
        description: `You&apos;ve been productive with ${mostCommonCategory} tasks`,
        category: mostCommonCategory,
        priority: 'medium',
        estimated_duration: 30,
        reasoning: `You have momentum in ${mostCommonCategory} category`,
        confidence_score: 0.75,
        tags: [mostCommonCategory.toLowerCase()]
      });
    }

    // Project-based suggestions
    const activeProjects = projects.filter(p => p.status === 'active');
    activeProjects.forEach(project => {
      const projectTasks = todos.filter(t => t.project_id === project.id && !t.completed);
      if (projectTasks.length > 0) {
        suggestions.push({
          id: `project-${project.id}`,
          title: `Work on ${project.title}`,
          description: `Continue progress on ${project.title} project`,
          category: project.category || 'Project',
          priority: 'medium',
          estimated_duration: 45,
          reasoning: `Keep momentum on active project with ${projectTasks.length} remaining tasks`,
          confidence_score: 0.8,
          tags: ['project', project.title.toLowerCase()]
        });
      }
    });

    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }, [todos, projects]);

  const generateDailyPlan = async () => {
    const planningTasks = [
      'Review yesterday&apos;s accomplishments',
      'Set 3 main priorities for today',
      'Schedule time blocks for important tasks',
      'Check calendar for meetings and deadlines'
    ];

    for (const task of planningTasks) {
      await onCreateTodo({
        title: task,
        category: 'Planning',
        priority: 'medium',
        completed: false,
        show_gratitude: false,
        due_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(currentMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): { content: string; suggestions?: TaskSuggestion[] } => {
    const input = userInput.toLowerCase();

    if (input.includes('productive') || input.includes('focus')) {
      return {
        content: "I can help you boost your productivity! Based on your patterns, I&apos;d recommend starting with your high-priority tasks when your energy is highest. Would you like me to suggest some focus techniques or create a time-blocked schedule?",
        suggestions: taskSuggestions.filter(s => s.tags?.includes('focus')).slice(0, 2)
      };
    }

    if (input.includes('plan') || input.includes('organize')) {
      return {
        content: "Great idea to plan ahead! I notice you&apos;re most productive when you have a clear structure. Let me suggest some planning tasks that align with your goals and current projects.",
        suggestions: taskSuggestions.filter(s => s.category === 'Planning').slice(0, 2)
      };
    }

    if (input.includes('stress') || input.includes('overwhelm')) {
      return {
        content: "I understand that feeling. Let&apos;s break things down into manageable pieces. Consider starting with one small task to build momentum, and don&apos;t forget to include some wellness activities in your day.",
        suggestions: [
          {
            id: 'stress-relief',
            title: 'Take a 5-minute breathing break',
            description: 'Quick mindfulness exercise to reduce stress',
            category: 'Wellness',
            priority: 'high',
            estimated_duration: 5,
            reasoning: 'Immediate stress relief',
            confidence_score: 0.95,
            tags: ['wellness', 'mindfulness']
          }
        ]
      };
    }

    if (input.includes('habit') || input.includes('routine')) {
      return {
        content: "Building consistent habits is key to long-term success! I see you&apos;re working on some great habits already. Small, consistent actions compound over time. What specific habit would you like to develop or strengthen?"
      };
    }

    // Generic helpful response
    return {
      content: "I&apos;m here to help optimize your productivity! I can analyze your patterns, suggest tasks, help with planning, or provide insights about your work habits. What would you like to focus on today?",
      suggestions: taskSuggestions.slice(0, 2)
    };
  };

  return (
    <AnimatePresence>
      {showAssistant && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-gray-400">Your productivity companion</p>
              </div>
            </div>
            <button
              onClick={() => setShowAssistant(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'insights', label: 'Insights', icon: Lightbulb },
              { id: 'suggestions', label: 'Tasks', icon: Target },
              { id: 'chat', label: 'Chat', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'insights' | 'suggestions' | 'chat')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'insights' && (
              <div className="p-4 space-y-3 h-full overflow-y-auto">
                {aiInsights.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2" />
                    <p>You&apos;re doing great! No urgent insights right now.</p>
                  </div>
                ) : (
                  aiInsights.map(insight => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border-l-4 ${
                        insight.type === 'warning' ? 'bg-red-900/20 border-red-500' :
                        insight.type === 'celebration' ? 'bg-green-900/20 border-green-500' :
                        insight.type === 'optimization' ? 'bg-purple-900/20 border-purple-500' :
                        'bg-blue-900/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {insight.icon}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                          {insight.action && (
                            <button
                              onClick={insight.action.handler}
                              className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                            >
                              <span>{insight.action.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="p-4 space-y-3 h-full overflow-y-auto">
                {taskSuggestions.map(suggestion => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => onCreateTodo({
                      title: suggestion.title,
                      description: suggestion.description,
                      category: suggestion.category,
                      priority: suggestion.priority,
                      estimated_duration: suggestion.estimated_duration,
                      completed: false,
                      show_gratitude: false,
                      tags: suggestion.tags
                    })}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span>{suggestion.category}</span>
                          <span>•</span>
                          <span>{suggestion.estimated_duration}m</span>
                          <span>•</span>
                          <span className="capitalize">{suggestion.priority}</span>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="mt-2 text-xs text-blue-300">
                      💡 {suggestion.reasoning}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                      <p>Ask me anything about productivity!</p>
                    </div>
                  )}
                  {chatMessages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {message.content}
                        {message.suggestions && (
                          <div className="mt-2 space-y-2">
                            {message.suggestions.map(suggestion => (
                              <button
                                key={suggestion.id}
                                onClick={() => onCreateTodo({
                                  title: suggestion.title,
                                  description: suggestion.description,
                                  category: suggestion.category,
                                  priority: suggestion.priority,
                                  estimated_duration: suggestion.estimated_duration,
                                  completed: false,
                                  show_gratitude: false
                                })}
                                className="block w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                              >
                                + {suggestion.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-200 p-3 rounded-lg text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Floating Assistant Button */}
      {!showAssistant && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowAssistant(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow z-50"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}; 