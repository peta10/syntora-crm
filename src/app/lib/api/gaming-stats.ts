import { createClient } from '@supabase/supabase-js';

interface GamingStats {
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
}

export class GamingStatsAPI {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  static async getUserStats(): Promise<GamingStats | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('gaming_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching gaming stats:', error);
      return null;
    }

    return data;
  }

  static async initializeUserStats(): Promise<GamingStats | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const defaultStats = {
      user_id: user.id,
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
      last_active_date: new Date().toISOString().split('T')[0]
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
  }

  static async updateStats(updates: Partial<GamingStats>): Promise<GamingStats | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('gaming_stats')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gaming stats:', error);
      return null;
    }

    return data;
  }

  static async resetDailyStats(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase.rpc('reset_daily_gaming_stats');
    
    if (error) {
      console.error('Error resetting daily stats:', error);
    }
  }
} 