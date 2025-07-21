'use client';

import React, { useState, useEffect } from 'react';
import { WeeklyAnalytics, MonthlyAnalytics, Achievement } from '@/app/lib/api/gaming-stats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useGaming } from '@/app/contexts/GamingContext';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const { 
    level,
    xp,
    todayPoints,
    streakCount,
    loading,
    error,
    triggerReset,
    getAnalytics
  } = useGaming();

  const [analytics, setAnalytics] = useState<WeeklyAnalytics[] | MonthlyAnalytics[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics(period, period === 'weekly' ? 12 : 6);
      
      if (data) {
        setAnalytics(data.analytics);
        setAchievements(data.achievements);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-900/20 border border-red-500/30 rounded-lg ${className}`}>
        <p className="text-red-400">{error}</p>
        <button 
          onClick={loadAnalytics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded transition-colors ${
                period === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded transition-colors ${
                period === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={triggerReset}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Trigger Daily Reset
          </button>
        </div>
      </div>

      {/* Current Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Level</h3>
          <p className="text-2xl font-bold text-white">{level}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total XP</h3>
          <p className="text-2xl font-bold text-blue-400">{xp}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Today's Points</h3>
          <p className="text-2xl font-bold text-green-400">{todayPoints}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Streak</h3>
          <p className="text-2xl font-bold text-orange-400">{streakCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            {period === 'weekly' ? 'Weekly' : 'Monthly'} Points
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={period === 'weekly' ? 'week_start' : 'month_start'} 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="total_points" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            {period === 'weekly' ? 'Weekly' : 'Monthly'} Tasks
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={period === 'weekly' ? 'week_start' : 'month_start'} 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="total_tasks" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productivity & Activity Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Average Productivity Score
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={period === 'weekly' ? 'week_start' : 'month_start'} 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="average_productivity" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Achievements */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {achievements.length > 0 ? (
              achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <span className="text-2xl">{achievement.achievement_icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{achievement.achievement_name}</p>
                    <p className="text-sm text-gray-400">{achievement.achievement_description}</p>
                    <p className="text-xs text-blue-400">+{achievement.points_awarded} points</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No recent achievements</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {analytics.reduce((sum: number, item: any) => sum + item.total_points, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {analytics.reduce((sum: number, item: any) => sum + item.total_tasks, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">
              {Math.round(
                analytics.reduce((sum: number, item: any) => sum + (item.average_productivity || 0), 0) / 
                analytics.length
              ) || 0}%
            </p>
            <p className="text-sm text-gray-400">Avg Productivity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {analytics.reduce((sum: number, item: any) => sum + item.days_active, 0)}
            </p>
            <p className="text-sm text-gray-400">Active Days</p>
          </div>
        </div>
      </div>
    </div>
  );
} 