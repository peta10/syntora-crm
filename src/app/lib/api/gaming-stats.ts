import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface GamingStats {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  xp_to_next: number;
  today_points: number;
  streak_count: number;
  combo: number;
  all_day_complete: boolean;
  achievements: string[];
  sound_enabled: boolean;
  volume: number;
  animations_enabled: boolean;
  last_active_date: string;
  total_days_active: number;
  best_streak: number;
  total_achievements_unlocked: number;
  weekly_xp_goal: number;
  monthly_xp_goal: number;
}

export interface DailyStatsHistory {
  id: string;
  user_id: string;
  date: string;
  points_earned: number;
  tasks_completed: number;
  max_combo: number;
  all_day_completed: boolean;
  xp_gained: number;
  productivity_score: number;
  energy_level: number;
  created_at: string;
}

export interface Achievement {
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  points_awarded: number;
  unlocked_at: string;
}

export interface WeeklyAnalytics {
  week_start: string;
  total_points: number;
  total_tasks: number;
  average_productivity: number;
  days_active: number;
  week_number: number;
}

export interface MonthlyAnalytics {
  month_start: string;
  total_points: number;
  total_tasks: number;
  average_productivity: number;
  days_active: number;
  best_day_points: number;
}

export class GamingStatsAPI {
  private static supabase = createClientComponentClient();

  static async getCurrentStats(): Promise<GamingStats | null> {
    try {
      const { data, error } = await this.supabase
        .from('gaming_stats')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching gaming stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get gaming stats:', error);
      return null;
    }
  }

  static async initializeStats(): Promise<GamingStats | null> {
    try {
      const defaultStats = {
        user_id: crypto.randomUUID(),
        level: 1,
        xp: 0,
        xp_to_next: 100,
        today_points: 0,
        streak_count: 0,
        combo: 0,
        all_day_complete: false,
        achievements: [],
        sound_enabled: true,
        volume: 75,
        animations_enabled: true,
        last_active_date: new Date().toISOString().split('T')[0],
        total_days_active: 0,
        best_streak: 0,
        total_achievements_unlocked: 0,
        weekly_xp_goal: 500,
        monthly_xp_goal: 2000
      };

      const { data, error } = await this.supabase
        .from('gaming_stats')
        .insert([defaultStats])
        .select()
        .single();

      if (error) {
        console.error('Error initializing gaming stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to initialize gaming stats:', error);
      return null;
    }
  }

  static async updateStats(updates: Partial<GamingStats>): Promise<GamingStats | null> {
    try {
      const { data, error } = await this.supabase
        .from('gaming_stats')
        .update(updates)
        .select()
        .single();

      if (error) {
        console.error('Error updating gaming stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update gaming stats:', error);
      return null;
    }
  }

  static async triggerDailyReset(): Promise<any> {
    try {
      const response = await fetch('/api/supabase/functions/daily-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger daily reset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering daily reset:', error);
      throw error;
    }
  }

  static async getAnalytics(period: 'weekly' | 'monthly' = 'weekly', lookback: number = 12): Promise<{
    analytics: WeeklyAnalytics[] | MonthlyAnalytics[];
    achievements: Achievement[];
    currentStats: GamingStats;
  } | null> {
    try {
      const response = await fetch(`/api/supabase/functions/get-analytics?period=${period}&lookback=${lookback}`);
      
      if (!response.ok) {
        throw new Error('Failed to get analytics');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }

  static async addPoints(points: number, source: string = 'task_completion'): Promise<void> {
    try {
      const currentStats = await this.getCurrentStats();
      if (!currentStats) return;

      const newTodayPoints = currentStats.today_points + points;
      const newCombo = currentStats.combo + 1;

      await this.updateStats({
        today_points: newTodayPoints,
        combo: newCombo,
        last_active_date: new Date().toISOString().split('T')[0]
      });

      await this.checkAchievements();
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  }

  static async checkAchievements(): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('check_and_unlock_achievements', {
        user_uuid: crypto.randomUUID()
      });

      if (error) {
        console.error('Error checking achievements:', error);
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }

  static async getDailyHistory(days: number = 30): Promise<DailyStatsHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('daily_stats_history')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching daily history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get daily history:', error);
      return [];
    }
  }

  static async getRecentAchievements(days: number = 30): Promise<Achievement[]> {
    try {
      const { data, error } = await this.supabase
        .from('achievement_history')
        .select('*')
        .gte('unlocked_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }
} 