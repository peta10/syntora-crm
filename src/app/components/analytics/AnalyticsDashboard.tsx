'use client';

import React, { useState, useEffect } from 'react';
import { WeeklyAnalytics, MonthlyAnalytics, Achievement } from '@/app/lib/api/gaming-stats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { useGaming } from '@/app/contexts/GamingContext';
import { BarChart, Trophy } from 'lucide-react';

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
    getAnalytics,
    isPublicMode
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Public Mode Notice */}
        {isPublicMode && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Demo Mode</h3>
            <p className="text-gray-300">
              You are viewing demo analytics data. Sign in to track your own progress and achievements!
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'weekly' 
                    ? 'bg-blue-600/80 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'monthly' 
                    ? 'bg-blue-600/80 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Monthly
              </button>
            </div>
            {!isPublicMode && (
              <button
                onClick={triggerReset}
                className="px-4 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Trigger Daily Reset
              </button>
            )}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Level</h3>
            <div className="text-3xl font-bold text-white">{level}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total XP</h3>
            <div className="text-3xl font-bold text-blue-400">{xp}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Today's Points</h3>
            <div className="text-3xl font-bold text-green-400">{todayPoints}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Streak</h3>
            <div className="text-3xl font-bold text-orange-400">{streakCount}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Points Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
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
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              {period === 'weekly' ? 'Weekly' : 'Monthly'} Tasks
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={analytics}>
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
                <Bar 
                  dataKey="total_tasks" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity & Activity Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
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
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Achievements */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Achievements</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-colors"
                  >
                    <span className="text-2xl">{achievement.achievement_icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{achievement.achievement_name}</p>
                      <p className="text-sm text-gray-400">{achievement.achievement_description}</p>
                      <p className="text-xs text-blue-400 mt-1">+{achievement.points_awarded} points</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No recent achievements</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {analytics.reduce((sum: number, item: any) => sum + item.total_points, 0)}
              </p>
              <p className="text-sm text-gray-400 mt-2">Total Points</p>
            </div>
            <div className="text-center p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {analytics.reduce((sum: number, item: any) => sum + item.total_tasks, 0)}
              </p>
              <p className="text-sm text-gray-400 mt-2">Total Tasks</p>
            </div>
            <div className="text-center p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <p className="text-2xl font-bold text-orange-400">
                {Math.round(
                  analytics.reduce((sum: number, item: any) => sum + (item.average_productivity || 0), 0) / 
                  analytics.length
                ) || 0}%
              </p>
              <p className="text-sm text-gray-400 mt-2">Avg Productivity</p>
            </div>
            <div className="text-center p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {analytics.reduce((sum: number, item: any) => sum + item.days_active, 0)}
              </p>
              <p className="text-sm text-gray-400 mt-2">Active Days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 