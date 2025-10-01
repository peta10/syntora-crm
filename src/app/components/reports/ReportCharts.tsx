'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Todo } from '@/app/types/todo';

interface ReportChartsProps {
  todos: Todo[];
  period: 'week' | 'month' | 'quarter' | 'year';
}

export const ReportCharts: React.FC<ReportChartsProps> = ({ todos, period }) => {
  // Color palette for charts
  const colors = ['#6E86FF', '#FF6BBA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  // Prepare data for different chart types
  const categoryData = React.useMemo(() => {
    const categoryCount = todos.reduce((acc, todo) => {
      const category = todo.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: (count / todos.length) * 100
    }));
  }, [todos]);

  const priorityData = React.useMemo(() => {
    const priorityCount = todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCount).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      completed: todos.filter(t => t.priority === priority && t.completed).length
    }));
  }, [todos]);

  const completionTrendData = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayTodos = todos.filter(todo => 
        todo.created_at.split('T')[0] === dateStr
      );
      const completedTodos = dayTodos.filter(todo => todo.completed);
      const timeSpent = dayTodos.reduce((sum, todo) => sum + (todo.total_time_spent || 0), 0);

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created: dayTodos.length,
        completed: completedTodos.length,
        completionRate: dayTodos.length > 0 ? (completedTodos.length / dayTodos.length) * 100 : 0,
        timeSpent: Math.round(timeSpent / 60 * 10) / 10 // Convert to hours with 1 decimal
      };
    });
  }, [todos]);

  return (
    <div className="space-y-6">
      {/* Completion Trend Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Task Completion Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completionTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <YAxis yAxisId="time" orientation="right" stroke="#F59E0B" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="#6E86FF" 
              strokeWidth={2}
              dot={{ fill: '#6E86FF', r: 3 }}
              name="Created"
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 3 }}
              name="Completed"
            />
            <Line 
              type="monotone" 
              dataKey="timeSpent" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 3 }}
              name="Time (hours)"
              yAxisId="time"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ category, percentage }) => `${category} (${(percentage as number).toFixed(1)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Analysis */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="priority" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#6E86FF"
                radius={[4, 4, 0, 0]}
                name="Total"
              />
              <Bar 
                dataKey="completed" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
