'use client';

import React from 'react';
import { AnalyticsDashboard } from '@/app/components/analytics/AnalyticsDashboard';
import useStore from '@/app/store/slices/todoSlice';

export default function AnalyticsPage() {
  const { todos } = useStore();

  const handleGenerateReport = async (year: number) => {
    // Generate comprehensive year-end report
    console.log(`Generating report for ${year}`);
    // Implementation would connect to your Supabase backend
    
    // Return mock report for now
    return {
      year,
      total_tasks_completed: todos.filter(t => t.completed).length,
      total_hours_focused: 0,
      top_categories: [],
      achievements_unlocked: [],
      best_streak: 0,
      most_productive_month: 'January',
      growth_highlights: [],
      goals_achieved: 0,
      gratitude_tasks_completed: todos.filter(t => t.show_gratitude && t.completed).length,
      average_productivity_score: 85,
      key_insights: []
    };
  };

  const handleExportData = async (format: 'pdf' | 'csv' | 'json') => {
    // Export data in specified format
    console.log(`Exporting data as ${format}`);
    // Implementation would generate and download the file
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <AnalyticsDashboard
        todos={todos}
        onGenerateReport={handleGenerateReport}
        onExportData={handleExportData}
      />
    </div>
  );
} 