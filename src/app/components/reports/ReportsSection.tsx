'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, Filter, TrendingUp, TrendingDown,
  Clock, Target, Zap, Heart, Briefcase, User, BarChart3,
  PieChart, Activity, Award, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownRight, Minus, Printer, Share2, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Todo, Achievement } from '@/app/types/todo';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { ReportCharts } from './ReportCharts';

interface ReportsSectionProps {
  todos: Todo[];
  userAchievements: Achievement[];
}

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';
type ReportType = 'productivity' | 'categories' | 'achievements' | 'trends' | 'detailed';

interface ProductivityReport {
  period: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTasksPerDay: number;
  highPriorityCompleted: number;
  spiritualTasksCompleted: number;
  totalTimeSpent: number;
  averageTimePerTask: number;
  timeTrackingEnabled: number;
  currentlyTracking: number;
  mostProductiveDay: string;
  topCategories: { category: string; count: number; percentage: number; timeSpent: number }[];
  weeklyTrend: { week: string; completed: number; created: number; timeSpent: number }[];
  timeByCategory: { category: string; totalMinutes: number; averageMinutes: number }[];
  timeByPriority: { priority: string; totalMinutes: number; taskCount: number }[];
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({ todos, userAchievements }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [selectedReport, setSelectedReport] = useState<ReportType>('productivity');

  // Calculate comprehensive productivity report
  const productivityReport = useMemo((): ProductivityReport => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (selectedPeriod) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'quarter':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = startOfMonth(now);
    }

    const periodTodos = todos.filter(todo => {
      const todoDate = new Date(todo.created_at);
      return todoDate >= startDate && todoDate <= endDate;
    });

    const completedTodos = periodTodos.filter(todo => todo.completed);
    const completionRate = periodTodos.length > 0 ? (completedTodos.length / periodTodos.length) * 100 : 0;
    
    // Calculate days in period
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageTasksPerDay = daysDiff > 0 ? completedTodos.length / daysDiff : 0;

    // Category analysis with time tracking
    const categoryData = periodTodos.reduce((acc, todo) => {
      const category = todo.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, timeSpent: 0 };
      }
      acc[category].count += 1;
      acc[category].timeSpent += todo.total_time_spent || 0;
      return acc;
    }, {} as Record<string, { count: number; timeSpent: number }>);

    const topCategories = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        count: data.count,
        percentage: (data.count / periodTodos.length) * 100,
        timeSpent: data.timeSpent
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Time tracking analysis
    const timeTrackingEnabled = periodTodos.filter(t => t.time_tracking_enabled).length;
    const currentlyTracking = periodTodos.filter(t => t.is_currently_tracking).length;
    const totalTimeSpent = periodTodos.reduce((sum, t) => sum + (t.total_time_spent || 0), 0);
    const averageTimePerTask = completedTodos.length > 0 ? 
      completedTodos.reduce((sum, t) => sum + (t.total_time_spent || 0), 0) / completedTodos.length : 0;

    // Time by category
    const timeByCategory = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        totalMinutes: data.timeSpent,
        averageMinutes: data.count > 0 ? data.timeSpent / data.count : 0
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    // Time by priority
    const priorityTimeData = periodTodos.reduce((acc, todo) => {
      if (!acc[todo.priority]) {
        acc[todo.priority] = { totalMinutes: 0, taskCount: 0 };
      }
      acc[todo.priority].totalMinutes += todo.total_time_spent || 0;
      acc[todo.priority].taskCount += 1;
      return acc;
    }, {} as Record<string, { totalMinutes: number; taskCount: number }>);

    const timeByPriority = Object.entries(priorityTimeData)
      .map(([priority, data]) => ({
        priority,
        totalMinutes: data.totalMinutes,
        taskCount: data.taskCount
      }));

    // Weekly trend (last 8 weeks) with time tracking
    const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
      const weekStart = subWeeks(now, 7 - i);
      const weekEnd = endOfWeek(weekStart);
      const weekTodos = todos.filter(todo => {
        const todoDate = new Date(todo.created_at);
        return todoDate >= weekStart && todoDate <= weekEnd;
      });
      
      return {
        week: format(weekStart, 'MMM dd'),
        completed: weekTodos.filter(t => t.completed).length,
        created: weekTodos.length,
        timeSpent: weekTodos.reduce((sum, t) => sum + (t.total_time_spent || 0), 0)
      };
    });

    // Most productive day analysis
    const dailyCompletion = completedTodos.reduce((acc, todo) => {
      const day = format(new Date(todo.updated_at), 'EEEE');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostProductiveDay = Object.entries(dailyCompletion)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      period: format(startDate, 'MMM dd') + ' - ' + format(endDate, 'MMM dd, yyyy'),
      totalTasks: periodTodos.length,
      completedTasks: completedTodos.length,
      completionRate,
      averageTasksPerDay,
      highPriorityCompleted: completedTodos.filter(t => t.priority === 'high').length,
      spiritualTasksCompleted: completedTodos.filter(t => t.show_gratitude).length,
      totalTimeSpent,
      averageTimePerTask,
      timeTrackingEnabled,
      currentlyTracking,
      mostProductiveDay,
      topCategories,
      weeklyTrend,
      timeByCategory,
      timeByPriority
    };
  }, [todos, selectedPeriod]);

  const handleExportReport = (format: 'json' | 'csv' = 'json') => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      report: productivityReport,
      achievements: userAchievements.filter(a => a.unlocked),
      rawData: todos
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `syntora-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      // Create CSV format for tasks with comprehensive time tracking
      const csvHeader = 'Title,Category,Priority,Completed,Created Date,Due Date,Time Spent (min),Time Tracking Enabled,Currently Tracking,Time Started,Time Stopped\n';
      const csvData = todos.map(todo => [
        `"${todo.title.replace(/"/g, '""')}"`,
        todo.category || 'Uncategorized',
        todo.priority,
        todo.completed ? 'Yes' : 'No',
        new Date(todo.created_at).toISOString().split('T')[0],
        todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '',
        todo.total_time_spent || 0,
        todo.time_tracking_enabled ? 'Yes' : 'No',
        todo.is_currently_tracking ? 'Yes' : 'No',
        todo.time_started_at ? new Date(todo.time_started_at).toISOString() : '',
        todo.time_stopped_at ? new Date(todo.time_stopped_at).toISOString() : ''
      ].join(',')).join('\n');
      
      const csvContent = csvHeader + csvData;
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `syntora-tasks-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'productivity':
        return <ProductivityReportView report={productivityReport} />;
      case 'categories':
        return <CategoryReportView report={productivityReport} />;
      case 'achievements':
        return <AchievementReportView achievements={userAchievements} />;
      case 'trends':
        return (
          <div className="space-y-6">
            <ReportCharts todos={todos} period={selectedPeriod} />
            <TrendsReportView report={productivityReport} />
          </div>
        );
      case 'detailed':
        return <DetailedReportView todos={todos} report={productivityReport} />;
      default:
        return <ProductivityReportView report={productivityReport} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <div className="flex bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as ReportPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  selectedPeriod === period 
                    ? 'bg-blue-600/80 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Report Type Selector */}
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="productivity">Productivity Overview</option>
            <option value="categories">Category Analysis</option>
            <option value="achievements">Achievement Progress</option>
            <option value="trends">Trend Analysis</option>
            <option value="detailed">Detailed Report</option>
          </select>
        </div>

        {/* Export Options */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleExportReport('json')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={() => handleExportReport('csv')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedReport}-${selectedPeriod}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderReportContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Individual Report Components
const ProductivityReportView: React.FC<{ report: ProductivityReport }> = ({ report }) => {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (current < previous) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{report.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {report.completedTasks} of {report.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Time Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {Math.floor(report.totalTimeSpent / 60)}h {report.totalTimeSpent % 60}m
            </div>
            <p className="text-xs text-gray-400 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              across all tasks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Time/Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{Math.round(report.averageTimePerTask)}m</div>
            <p className="text-xs text-gray-400 flex items-center mt-1">
              <Target className="w-3 h-3 mr-1" />
              per completed task
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{report.timeTrackingEnabled}</div>
            <p className="text-xs text-gray-400 flex items-center mt-1">
              <Zap className="w-3 h-3 mr-1" />
              tasks with tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Time by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.timeByCategory.slice(0, 5).map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-400' :
                      index === 1 ? 'bg-green-400' :
                      index === 2 ? 'bg-purple-400' :
                      index === 3 ? 'bg-orange-400' :
                      'bg-pink-400'
                    }`} />
                    <span className="text-white font-medium">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {Math.floor(cat.totalMinutes / 60)}h {cat.totalMinutes % 60}m
                    </div>
                    <div className="text-xs text-gray-400">
                      avg {Math.round(cat.averageMinutes)}m/task
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Time by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.timeByPriority.map((priority, index) => (
                <div key={priority.priority} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      priority.priority === 'high' ? 'bg-red-400' :
                      priority.priority === 'medium' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`} />
                    <span className="text-white font-medium capitalize">{priority.priority}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {Math.floor(priority.totalMinutes / 60)}h {priority.totalMinutes % 60}m
                    </div>
                    <div className="text-xs text-gray-400">
                      {priority.taskCount} tasks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Most Productive Day</h4>
              <p className="text-2xl font-bold text-blue-400">{report.mostProductiveDay}</p>
              <p className="text-sm text-gray-400">Best day for task completion</p>
            </div>
            
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Time Investment</h4>
              <p className="text-2xl font-bold text-green-400">
                {Math.floor(report.totalTimeSpent / 60)}h {report.totalTimeSpent % 60}m
              </p>
              <p className="text-sm text-gray-400">
                Total tracked • Avg {Math.round(report.averageTimePerTask)}m/task
              </p>
            </div>

            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Tracking Status</h4>
              <p className="text-2xl font-bold text-blue-400">{report.timeTrackingEnabled}</p>
              <p className="text-sm text-gray-400">
                tasks enabled • {report.currentlyTracking} active
              </p>
            </div>
          </div>

          {/* Top Categories with Time */}
          <div>
            <h4 className="font-semibold text-white mb-3">Top Categories</h4>
            <div className="space-y-2">
              {report.topCategories.slice(0, 3).map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-yellow-400' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-orange-400'
                    }`} />
                    <span className="text-white font-medium">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{cat.count} tasks</div>
                    <div className="text-xs text-gray-400">
                      {cat.percentage.toFixed(1)}% • {Math.floor(cat.timeSpent / 60)}h {cat.timeSpent % 60}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CategoryReportView: React.FC<{ report: ProductivityReport }> = ({ report }) => (
  <div className="space-y-6">
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-400" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {report.topCategories.map((category, index) => (
            <div key={category.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{category.category}</span>
                <span className="text-gray-400">{category.count} tasks ({category.percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' :
                    'bg-pink-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const AchievementReportView: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.reduce((sum, a) => sum + (a.unlocked ? a.xp_reward : 0), 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{unlockedCount}</div>
            <div className="text-sm text-gray-400">Achievements Unlocked</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalXP}</div>
            <div className="text-sm text-gray-400">Total XP Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements
              .filter(a => a.unlocked)
              .slice(0, 5)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">+{achievement.xp_reward} XP</div>
                    <div className="text-xs text-gray-500">
                      {achievement.unlocked_at && format(new Date(achievement.unlocked_at), 'MMM dd')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TrendsReportView: React.FC<{ report: ProductivityReport }> = ({ report }) => (
  <div className="space-y-6">
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Weekly Trends with Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {report.weeklyTrend.map((week, index) => (
            <div key={week.week} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
              <span className="text-white font-medium">{week.week}</span>
              <div className="flex items-center space-x-4">
                <div className="text-green-400">
                  <span className="text-sm">Completed: </span>
                  <span className="font-semibold">{week.completed}</span>
                </div>
                <div className="text-blue-400">
                  <span className="text-sm">Created: </span>
                  <span className="font-semibold">{week.created}</span>
                </div>
                <div className="text-orange-400">
                  <span className="text-sm">Time: </span>
                  <span className="font-semibold">
                    {Math.floor(week.timeSpent / 60)}h {week.timeSpent % 60}m
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const DetailedReportView: React.FC<{ todos: Todo[]; report: ProductivityReport }> = ({ todos, report }) => (
  <div className="space-y-6">
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">Detailed Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{report.totalTasks}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{report.completedTasks}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{report.highPriorityCompleted}</div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{report.spiritualTasksCompleted}</div>
            <div className="text-sm text-gray-400">Spiritual</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {Math.floor(report.totalTimeSpent / 60)}h
            </div>
            <div className="text-sm text-gray-400">Time Tracked</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">{report.timeTrackingEnabled}</div>
            <div className="text-sm text-gray-400">Tracking Enabled</div>
          </div>
        </div>

        {/* Period Information */}
        <div className="p-4 bg-gray-700/20 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Report Period</h4>
          <p className="text-gray-300">{report.period}</p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Most Productive Day: </span>
              <span className="text-white font-medium">{report.mostProductiveDay}</span>
            </div>
            <div>
              <span className="text-gray-400">Average Daily Tasks: </span>
              <span className="text-white font-medium">{report.averageTasksPerDay.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Export Information */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">Export Options</h4>
          <p className="text-gray-300 text-sm mb-3">
            Export comprehensive reports including time tracking data for analysis and backup.
          </p>
          <div className="text-xs text-gray-400">
            Includes: Task data, completion metrics, time tracking details, category analysis, achievement progress, and productivity insights
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
