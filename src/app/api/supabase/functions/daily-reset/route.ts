import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    
    // Get current stats
    const { data: currentStats, error: fetchError } = await supabase
      .from('gaming_stats')
      .select('*')
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!currentStats) {
      return NextResponse.json({ error: 'No gaming stats found' }, { status: 404 });
    }

    // Check if already reset today
    if (currentStats.last_active_date === today) {
      return NextResponse.json({ 
        message: 'Already reset today', 
        stats: currentStats 
      });
    }

    // Save yesterday's stats to history if we have points
    if (currentStats.today_points > 0) {
      const historyEntry = {
        user_id: currentStats.user_id,
        date: currentStats.last_active_date,
        points_earned: currentStats.today_points,
        tasks_completed: Math.floor(currentStats.today_points / 15), // Estimate
        max_combo: currentStats.combo,
        all_day_completed: currentStats.all_day_complete,
        xp_gained: currentStats.today_points * 2, // XP calculation
        productivity_score: Math.min(10, Math.floor(currentStats.today_points / 10)),
        energy_level: 5, // Default
      };

      const { error: historyError } = await supabase
        .from('daily_stats_history')
        .insert([historyEntry]);

      if (historyError) {
        console.error('Error saving history:', historyError);
        // Continue with reset even if history save fails
      }
    }

    // Reset daily stats
    const resetUpdates: {
      today_points: number;
      combo: number;
      all_day_complete: boolean;
      last_active_date: string;
      total_days_active: number;
      streak_count?: number;
      best_streak?: number;
    } = {
      today_points: 0,
      combo: 0,
      all_day_complete: false,
      last_active_date: today,
      total_days_active: currentStats.total_days_active + 1,
    };

    // Update streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (currentStats.last_active_date === yesterdayStr && currentStats.today_points > 0) {
      // Continue streak
      const newStreakCount = (currentStats.streak_count || 0) + 1;
      resetUpdates.streak_count = newStreakCount;
      resetUpdates.best_streak = Math.max(currentStats.best_streak || 0, newStreakCount);
    } else if (currentStats.last_active_date !== yesterdayStr) {
      // Break streak
      resetUpdates.streak_count = 0;
    }

    const { data: updatedStats, error: updateError } = await supabase
      .from('gaming_stats')
      .update(resetUpdates)
      .eq('id', currentStats.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: 'Daily reset completed successfully',
      stats: updatedStats,
      previousDayPoints: currentStats.today_points
    });

  } catch (error) {
    console.error('Daily reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset daily stats' },
      { status: 500 }
    );
  }
} 