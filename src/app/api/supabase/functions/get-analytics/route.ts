import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const lookback = parseInt(searchParams.get('lookback') || '12');

    // Get current stats
    const { data: currentStats, error: statsError } = await supabase
      .from('gaming_stats')
      .select('*')
      .limit(1)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    // Get historical data
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'weekly') {
      startDate.setDate(endDate.getDate() - (lookback * 7));
    } else {
      startDate.setMonth(endDate.getMonth() - lookback);
    }

    const { data: historyData, error: historyError } = await supabase
      .from('daily_stats_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Don't throw error if history table doesn't exist
    if (historyError && !historyError.message.includes('does not exist')) {
      console.error('History error:', historyError);
    }

    // Get recent achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievement_history')
      .select('*')
      .gte('unlocked_at', startDate.toISOString())
      .order('unlocked_at', { ascending: false });

    // Don't throw error if achievements table doesn't exist
    if (achievementsError && !achievementsError.message.includes('does not exist')) {
      console.error('Achievements error:', achievementsError);
    }

    // Process analytics based on period
    let analytics;
    
    if (period === 'weekly') {
      analytics = processWeeklyAnalytics(historyData || [], lookback);
    } else {
      analytics = processMonthlyAnalytics(historyData || [], lookback);
    }

    return NextResponse.json({
      analytics,
      achievements: achievements || [],
      currentStats: currentStats || null
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

function processWeeklyAnalytics(historyData: any[], lookback: number) {
  const weeks = [];
  const now = new Date();

  for (let i = 0; i < lookback; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekData = historyData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    weeks.unshift({
      week_start: weekStart.toISOString().split('T')[0],
      total_points: weekData.reduce((sum, entry) => sum + (entry.points_earned || 0), 0),
      total_tasks: weekData.reduce((sum, entry) => sum + (entry.tasks_completed || 0), 0),
      average_productivity: weekData.length > 0 
        ? weekData.reduce((sum, entry) => sum + (entry.productivity_score || 0), 0) / weekData.length 
        : 0,
      days_active: weekData.length,
      week_number: i + 1
    });
  }

  return weeks;
}

function processMonthlyAnalytics(historyData: any[], lookback: number) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < lookback; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthData = historyData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    const bestDayPoints = monthData.length > 0 
      ? Math.max(...monthData.map(entry => entry.points_earned || 0))
      : 0;

    months.unshift({
      month_start: monthStart.toISOString().split('T')[0],
      total_points: monthData.reduce((sum, entry) => sum + (entry.points_earned || 0), 0),
      total_tasks: monthData.reduce((sum, entry) => sum + (entry.tasks_completed || 0), 0),
      average_productivity: monthData.length > 0 
        ? monthData.reduce((sum, entry) => sum + (entry.productivity_score || 0), 0) / monthData.length 
        : 0,
      days_active: monthData.length,
      best_day_points: bestDayPoints
    });
  }

  return months;
} 