import { supabase } from '@/app/lib/supabase/client';

export interface GamingStats {
  id: string;
  user_id: string; // UUID in your schema
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
  created_at: string;
  updated_at: string;
}

export interface DailyStatsHistory {
  id: string;
  user_id: string; // UUID in your schema
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
  id: string;
  user_id: string; // UUID in your schema
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  points_awarded: number;
  unlocked_at: string;
  unlock_condition: string;
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
  private static supabase = supabase;

  static async getCurrentStats(): Promise<GamingStats | null> {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user found for gaming stats');
        return null;
      }

      // Get gaming stats for THIS specific user only
      const { data, error } = await this.supabase
        .from('gaming_stats')
        .select('*')
        .eq('user_id', user.id)  // FIXED: Filter by actual user ID
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No gaming stats found for user:', user.email);
          return null;
        }
        console.error('Error fetching user gaming stats:', error);
        return null;
      }

      console.log('✅ Loaded gaming stats for user:', user.email, 'Level:', data.level);
      return data;
    } catch (error) {
      console.error('Failed to get gaming stats:', error);
      return null;
    }
  }

  static async initializeStats(): Promise<GamingStats | null> {
    try {
      // First check if stats already exist
      const existingStats = await this.getCurrentStats();
      if (existingStats) {
        return existingStats;
      }

      // Check if we have auth - if not, return null to trigger public mode
      const { data: { session }, error: authError } = await this.supabase.auth.getSession();
      if (authError || !session) {
        return null;
      }

      // Create new stats record with the authenticated user's ID
      const defaultStats = {
        user_id: session.user.id,  // FIXED: Use actual authenticated user ID
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
      // Check if we have auth - if not, return null
      const { data: { session }, error: authError } = await this.supabase.auth.getSession();
      if (authError || !session) {
        return null;
      }

      // Get current stats to find the record to update
      const currentStats = await this.getCurrentStats();
      if (!currentStats) {
        console.error('No gaming stats found to update');
        return null;
      }

      // Add updated_at timestamp
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('gaming_stats')
        .update(updatesWithTimestamp)
        .eq('id', currentStats.id)
        .eq('user_id', session.user.id)  // SAFETY: Double-check user ID
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
      // Check if we have auth - if not, return mock response
      const { data: { session }, error: authError } = await this.supabase.auth.getSession();
      if (authError || !session) {
        return { message: 'Daily reset not available in public mode' };
      }

      // Try calling the Supabase function first
      const { data, error } = await this.supabase.rpc('smart_daily_reset');

      if (error) {
        console.error('Error calling smart_daily_reset function:', error);
        // Fallback: try API endpoint
        return this.triggerDailyResetViaAPI();
      }

      return data;
    } catch (error) {
      console.error('Error triggering daily reset:', error);
      // Fallback: try API endpoint
      return this.triggerDailyResetViaAPI();
    }
  }

  private static async triggerDailyResetViaAPI(): Promise<any> {
    try {
      // Check if we have auth - if not, return mock response
      const { data: { session }, error: authError } = await this.supabase.auth.getSession();
      if (authError || !session) {
        return { message: 'Daily reset not available in public mode' };
      }

      const response = await fetch('/api/supabase/functions/daily-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the endpoint doesn't exist, just return a mock response
        if (response.status === 404) {
          console.log('Daily reset endpoint not found, using fallback');
          return { message: 'Daily reset not available' };
        }
        throw new Error('Failed to trigger daily reset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering daily reset via API:', error);
      // Return a fallback response instead of throwing
      return { message: 'Daily reset failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getAnalytics(period: 'weekly' | 'monthly' = 'weekly', lookback: number = 12): Promise<{
    analytics: WeeklyAnalytics[] | MonthlyAnalytics[];
    achievements: Achievement[];
    currentStats: GamingStats;
  } | null> {
    try {
      // Check if we have auth - if not, return null to trigger demo data
      const { data: { session }, error: authError } = await this.supabase.auth.getSession();
      if (authError || !session) {
        return null;
      }

      // Try calling the Supabase functions first
      const functionName = period === 'weekly' ? 'get_weekly_analytics' : 'get_monthly_analytics';
      const { data: analyticsData, error: analyticsError } = await this.supabase.rpc(functionName, {
        lookback_weeks: period === 'weekly' ? lookback : undefined,
        lookback_months: period === 'monthly' ? lookback : undefined
      });

      if (analyticsError) {
        console.error(`Error calling ${functionName}:`, analyticsError);
      }

      // Get achievements
      const { data: achievementsData, error: achievementsError } = await this.supabase.rpc('get_recent_achievements', {
        days_back: 30
      });

      if (achievementsError) {
        console.error('Error getting achievements:', achievementsError);
      }

      // Get current stats
      const currentStats = await this.getCurrentStats();

      return {
        analytics: analyticsData || [],
        achievements: achievementsData || [],
        currentStats: currentStats || {} as GamingStats
      };

    } catch (error) {
      console.error('Error getting analytics:', error);
      // Return null to trigger demo data
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
      const currentStats = await this.getCurrentStats();
      if (!currentStats) return;

      // Call the achievement checking function
      const { error } = await this.supabase.rpc('check_and_unlock_achievements', {
        user_uuid: currentStats.user_id
      });

      if (error) {
        console.log('Achievements function not available:', error.message);
      }
    } catch (error) {
      console.log('Failed to check achievements:', error);
    }
  }

  static async getDailyHistory(days: number = 30): Promise<DailyStatsHistory[]> {
    try {
      const currentStats = await this.getCurrentStats();
      if (!currentStats) return [];

      const { data, error } = await this.supabase
        .from('daily_stats_history')
        .select('*')
        .eq('user_id', currentStats.user_id)
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
      const currentStats = await this.getCurrentStats();
      if (!currentStats) return [];

      const { data, error } = await this.supabase
        .from('achievement_history')
        .select('*')
        .eq('user_id', currentStats.user_id)
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

  // Helper method to add XP and check for level ups
  static async addXP(amount: number): Promise<void> {
    try {
      const currentStats = await this.getCurrentStats();
      if (!currentStats) return;

      let newXP = currentStats.xp + amount;
      let newLevel = currentStats.level;
      let newXPToNext = currentStats.xp_to_next;

      // Check for level up
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel++;
        newXPToNext = newLevel * 100; // Simple progression: level * 100
      }

      await this.updateStats({
        xp: newXP,
        level: newLevel,
        xp_to_next: newXPToNext
      });
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  }
}