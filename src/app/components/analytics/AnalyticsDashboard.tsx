'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Calendar, Clock, Target, Star, BarChart3, PieChart,
  Download, Filter, Award, Zap, Brain, Heart, ArrowUp, ArrowDown,
  CheckCircle2, Coffee, Moon, Sun, Activity, Sparkles
} from 'lucide-react';
import { Todo, ProductivityMetrics, YearlyReport, WeeklyInsight } from '@/app/types/todo';

interface AnalyticsDashboardProps {
  todos: Todo[];
  onGenerateReport?: (year: number) => Promise<YearlyReport>;
  onExportData?: (format: 'pdf' | 'csv' | 'json') => Promise<void>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  todos,
  onGenerateReport,
  onExportData
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showInsights, setShowInsights] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights' | 'report'>('overview');

  const getStartOfPeriod = (date: Date, period: string) => {
    const start = new Date(date);
    switch (period) {
      case 'week':
        start.setDate(date.getDate() - 7);
        break;
      case 'month':
        start.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(date.getFullYear() - 1);
        break;
    }
    return start;
  };

  const calculateStreak = (todos: Todo[]) => {
    const completedDates = todos
      .filter(todo => todo.completed)
      .map(todo => new Date(todo.updated_at).toDateString())
      .sort();
    
    const uniqueDates = [...new Set(completedDates)];
    let currentStreak = 0;
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const calculateProductivityScore = (completedTodos: Todo[]) => {
    if (completedTodos.length === 0) return 0;
    
    const highPriorityWeight = 3;
    const mediumPriorityWeight = 2;
    const lowPriorityWeight = 1;
    const spiritualBonus = 1.5;
    
    const score = completedTodos.reduce((sum, todo) => {
      let taskScore = 0;
      switch (todo.priority) {
        case 'high': taskScore = highPriorityWeight; break;
        case 'medium': taskScore = mediumPriorityWeight; break;
        case 'low': taskScore = lowPriorityWeight; break;
      }
      
      if (todo.show_gratitude) taskScore *= spiritualBonus;
      return sum + taskScore;
    }, 0);
    
    return Math.min(100, Math.round((score / completedTodos.length) * 20));
  };

  const generateInsights = (
    todos: Todo[], 
    period: string,
    completionRate: number,
    spiritualTasksCount: number,
    dailyStats: { day: string; count: number; avgDuration: number }[]
  ): WeeklyInsight[] => {
    const insights: WeeklyInsight[] = [];
    
    // Most productive day insight
    const mostProductiveDay = dailyStats.reduce((prev, current) => 
      current.count > prev.count ? current : prev
    );
    
    insights.push({
      id: 'productive-day',
      week_start: new Date().toISOString(),
      insight_type: 'pattern',
      title: 'Peak Productivity Day',
      description: `You're most productive on ${mostProductiveDay.day}s with ${mostProductiveDay.count} tasks completed on average.`,
      data: { day: mostProductiveDay.day, count: mostProductiveDay.count },
      importance: 'medium'
    });

    // Completion rate trend
    if (completionRate > 80) {
      insights.push({
        id: 'high-completion',
        week_start: new Date().toISOString(),
        insight_type: 'celebration',
        title: 'Excellent Completion Rate!',
        description: `You're completing ${Math.round(completionRate)}% of your tasks. Keep up the amazing work!`,
        data: { rate: completionRate },
        importance: 'high'
      });
    }

    // Spiritual task insight
    if (spiritualTasksCount > 0) {
      insights.push({
        id: 'mindfulness',
        week_start: new Date().toISOString(),
        insight_type: 'achievement',
        title: 'Mindful Productivity',
        description: `You've completed ${spiritualTasksCount} mindfulness/gratitude tasks this ${period}.`,
        data: { count: spiritualTasksCount },
        importance: 'medium'
      });
    }

    return insights;
  };

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(now, selectedPeriod);
    const periodTodos = todos.filter(todo => 
      new Date(todo.created_at) >= startOfPeriod && new Date(todo.created_at) <= now
    );

    const completedTodos = periodTodos.filter(todo => todo.completed);
    const spiritualTodos = completedTodos.filter(todo => todo.show_gratitude);
    const highPriorityTodos = completedTodos.filter(todo => todo.priority === 'high');

    // Category analysis
    const categoryStats = todos.reduce((acc, todo) => {
      const category = todo.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 };
      }
      acc[category].total++;
      if (todo.completed) acc[category].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Time analysis
    const hourlyStats = completedTodos.reduce((acc, todo) => {
      const hour = new Date(todo.updated_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Daily completion pattern
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const dayTodos = completedTodos.filter(todo => 
        new Date(todo.updated_at).getDay() === i
      );
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        count: dayTodos.length,
        avgDuration: dayTodos.reduce((sum, todo) => sum + (todo.actual_duration || 0), 0) / dayTodos.length || 0
      };
    });

    // Monthly trends
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const monthTodos = todos.filter(todo => {
        const todoDate = new Date(todo.created_at);
        return todoDate.getFullYear() === selectedYear && todoDate.getMonth() === i;
      });
      const completed = monthTodos.filter(todo => todo.completed);
      
      return {
        month: new Date(selectedYear, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        total: monthTodos.length,
        completed: completed.length,
        completionRate: monthTodos.length > 0 ? (completed.length / monthTodos.length) * 100 : 0,
        spiritual: completed.filter(todo => todo.show_gratitude).length
      };
    });

    // Calculate completion rate for insights
    const completionRate = periodTodos.length > 0 ? (completedTodos.length / periodTodos.length) * 100 : 0;
    
    // Productivity insights
    const insights = generateInsights(todos, selectedPeriod, completionRate, spiritualTodos.length, dailyStats);

    return {
      overview: {
        totalTasks: periodTodos.length,
        completedTasks: completedTodos.length,
        completionRate: periodTodos.length > 0 ? (completedTodos.length / periodTodos.length) * 100 : 0,
        spiritualTasks: spiritualTodos.length,
        highPriorityCompleted: highPriorityTodos.length,
        averageDuration: completedTodos.reduce((sum, todo) => sum + (todo.actual_duration || 0), 0) / completedTodos.length || 0,
        totalTimeSpent: completedTodos.reduce((sum, todo) => sum + (todo.actual_duration || 0), 0),
        streak: calculateStreak(todos),
        productivityScore: calculateProductivityScore(completedTodos)
      },
      categoryStats,
      hourlyStats,
      dailyStats,
      monthlyTrends,
      insights
    };
  }, [todos, selectedPeriod, selectedYear]);

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    if (onExportData) {
      await onExportData(format);
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{analytics.overview.completedTasks}</div>
              <div className="text-sm text-blue-300">Tasks Completed</div>
              <div className="text-xs text-gray-400">
                {analytics.overview.completionRate.toFixed(1)}% completion rate
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30"
        >
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{analytics.overview.productivityScore}</div>
              <div className="text-sm text-green-300">Productivity Score</div>
              <div className="text-xs text-gray-400">
                {analytics.overview.streak} day streak
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30"
        >
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{analytics.overview.spiritualTasks}</div>
              <div className="text-sm text-purple-300">Mindful Tasks</div>
              <div className="text-xs text-gray-400">
                Wellness focused
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(analytics.overview.totalTimeSpent / 60)}h
              </div>
              <div className="text-sm text-orange-300">Time Focused</div>
              <div className="text-xs text-gray-400">
                {Math.round(analytics.overview.averageDuration)}m avg
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Activity Pattern */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Weekly Activity Pattern</span>
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {analytics.dailyStats.map((day, index) => (
            <div key={day.day} className="text-center">
              <div className="text-xs text-gray-400 mb-2">{day.day}</div>
              <div 
                className="h-24 bg-gradient-to-t from-blue-500/20 to-blue-500/40 rounded-lg flex items-end justify-center p-2"
                style={{ 
                  height: `${Math.max(24, (day.count / Math.max(...analytics.dailyStats.map(d => d.count))) * 100)}px` 
                }}
              >
                <span className="text-sm font-medium text-white">{day.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Category Performance</span>
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.categoryStats)
            .sort(([,a], [,b]) => b.completed - a.completed)
            .slice(0, 5)
            .map(([category, stats]) => {
              const completion = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{category}</span>
                    <span className="text-gray-400">{stats.completed}/{stats.total} ({completion.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const TrendsTab = () => (
    <div className="space-y-6">
      {/* Monthly Trends Chart */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Monthly Completion Trends ({selectedYear})</span>
        </h3>
        <div className="grid grid-cols-12 gap-2 h-48">
          {analytics.monthlyTrends.map((month, index) => {
            const maxCompleted = Math.max(...analytics.monthlyTrends.map(m => m.completed));
            const height = maxCompleted > 0 ? (month.completed / maxCompleted) * 100 : 0;
            
            return (
              <div key={month.month} className="flex flex-col items-center">
                <div className="flex-1 flex items-end w-full">
                  <motion.div
                    className="w-full bg-gradient-to-t from-green-500/60 to-green-400/80 rounded-t-lg min-h-[4px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2 transform -rotate-45">{month.month}</div>
                <div className="text-xs text-green-400 font-medium">{month.completed}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Activity Heatmap */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Sun className="w-5 h-5" />
          <span>Peak Performance Hours</span>
        </h3>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = analytics.hourlyStats[hour] || 0;
            const maxCount = Math.max(...Object.values(analytics.hourlyStats));
            const intensity = maxCount > 0 ? count / maxCount : 0;
            
            return (
              <div key={hour} className="text-center">
                <div
                  className={`w-8 h-8 rounded-lg mb-1 ${
                    intensity > 0.7 ? 'bg-yellow-400' :
                    intensity > 0.4 ? 'bg-yellow-500/60' :
                    intensity > 0.1 ? 'bg-yellow-600/40' : 'bg-gray-700'
                  }`}
                  title={`${hour}:00 - ${count} tasks`}
                />
                <div className="text-xs text-gray-400">{hour}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-6">
      {analytics.insights.map((insight, index) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gray-800/50 rounded-xl p-6 border-l-4 ${
            insight.importance === 'high' ? 'border-green-500' :
            insight.importance === 'medium' ? 'border-yellow-500' : 'border-blue-500'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${
              insight.insight_type === 'celebration' ? 'bg-green-500/20 text-green-400' :
              insight.insight_type === 'achievement' ? 'bg-purple-500/20 text-purple-400' :
              insight.insight_type === 'pattern' ? 'bg-blue-500/20 text-blue-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {insight.insight_type === 'celebration' ? <Sparkles className="w-6 h-6" /> :
               insight.insight_type === 'achievement' ? <Award className="w-6 h-6" /> :
               insight.insight_type === 'pattern' ? <Brain className="w-6 h-6" /> :
               <Target className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-2">{insight.title}</h4>
              <p className="text-gray-300 mb-3">{insight.description}</p>
              {insight.action_suggested && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm text-blue-300">💡 Suggestion: {insight.action_suggested}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const ReportTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Year-End Report Generator</h3>
        <p className="text-gray-300 mb-6">
          Generate a comprehensive report of your productivity journey, achievements, and insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => onGenerateReport?.(selectedYear)}
              className="w-full px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Generate Report
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          {(['pdf', 'csv', 'json'] as const).map(format => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="uppercase">{format}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Deep insights into your productivity patterns and achievements</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 mb-8">
        {([
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'report', label: 'Reports', icon: Download }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'trends' && <TrendsTab />}
          {activeTab === 'insights' && <InsightsTab />}
          {activeTab === 'report' && <ReportTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 