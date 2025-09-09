import { supabase } from '@/app/lib/supabase/client';
import {
  CrmActivity,
  CreateActivityRequest,
  ActivityFilters,
  PaginatedResponse,
  ActivityWithRelations
} from '@/app/types/crm';

export class ActivitiesAPI {
  /**
   * Get all activities with optional filtering and pagination
   */
  static async getAll(filters: ActivityFilters = {}): Promise<PaginatedResponse<ActivityWithRelations>> {
    try {
      let query = supabase
        .from('crm_activities')
        .select(`
          *,
          contact:crm_contacts(*),
          deal:crm_deals(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.activity_type) {
        query = query.eq('activity_type', filters.activity_type);
      }

      if (filters.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }

      if (filters.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
      }

      if (filters.is_completed !== undefined) {
        query = query.eq('is_completed', filters.is_completed);
      }

      if (filters.activity_date_after) {
        query = query.gte('activity_date', filters.activity_date_after);
      }

      if (filters.activity_date_before) {
        query = query.lte('activity_date', filters.activity_date_before);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('activity_date', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        success: true,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }
  }

  /**
   * Get activities for today (for integration with todo system)
   */
  static async getTodayActivities(): Promise<ActivityWithRelations[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('crm_activities')
        .select(`
          *,
          contact:crm_contacts(*),
          deal:crm_deals(*)
        `)
        .gte('activity_date', today.toISOString())
        .lt('activity_date', tomorrow.toISOString())
        .order('activity_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today activities:', error);
      return [];
    }
  }

  /**
   * Get upcoming activities (next 7 days)
   */
  static async getUpcomingActivities(): Promise<ActivityWithRelations[]> {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { data, error } = await supabase
        .from('crm_activities')
        .select(`
          *,
          contact:crm_contacts(*),
          deal:crm_deals(*)
        `)
        .gte('activity_date', today.toISOString())
        .lte('activity_date', nextWeek.toISOString())
        .eq('is_completed', false)
        .order('activity_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
      return [];
    }
  }

  /**
   * Get a single activity by ID
   */
  static async getById(id: string): Promise<ActivityWithRelations> {
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .select(`
          *,
          contact:crm_contacts(*),
          deal:crm_deals(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Activity not found');

      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity');
    }
  }

  /**
   * Create a new activity
   */
  static async create(activityData: CreateActivityRequest): Promise<CrmActivity> {
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw new Error('Failed to create activity');
    }
  }

  /**
   * Update an existing activity
   */
  static async update(id: string, updates: Partial<CreateActivityRequest>): Promise<CrmActivity> {
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw new Error('Failed to update activity');
    }
  }

  /**
   * Mark activity as completed
   */
  static async markCompleted(id: string, outcome?: string): Promise<CrmActivity> {
    try {
      const updates: Partial<CrmActivity> = {
        is_completed: true
      };

      if (outcome) {
        updates.outcome = outcome;
      }

      const { data, error } = await supabase
        .from('crm_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking activity as completed:', error);
      throw new Error('Failed to mark activity as completed');
    }
  }

  /**
   * Delete an activity
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('crm_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw new Error('Failed to delete activity');
    }
  }

  /**
   * Get activity analytics
   */
  static async getAnalytics(): Promise<{
    totalActivities: number;
    completedToday: number;
    pendingActivities: number;
    overdue: number;
    byType: { type: string; count: number }[];
    byPriority: { priority: string; count: number }[];
  }> {
    try {
      // Get total activities
      const { count: totalActivities } = await supabase
        .from('crm_activities')
        .select('*', { count: 'exact', head: true });

      // Get completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: completedToday } = await supabase
        .from('crm_activities')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .gte('updated_at', today.toISOString())
        .lt('updated_at', tomorrow.toISOString());

      // Get pending activities
      const { count: pendingActivities } = await supabase
        .from('crm_activities')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false);

      // Get overdue activities
      const { count: overdue } = await supabase
        .from('crm_activities')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false)
        .lt('activity_date', new Date().toISOString());

      // Get activities by type
      const { data: byTypeData } = await supabase
        .from('crm_activities')
        .select('activity_type');

      const byType = (byTypeData as { activity_type: string }[] || []).reduce<Record<string, number>>((acc, activity) => {
        const type = activity.activity_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Get activities by priority
      const { data: byPriorityData } = await supabase
        .from('crm_activities')
        .select('priority');

      const byPriority = (byPriorityData as { priority: string | null }[] || []).reduce<Record<string, number>>((acc, activity) => {
        const priority = activity.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {});

      return {
        totalActivities: totalActivities || 0,
        completedToday: completedToday || 0,
        pendingActivities: pendingActivities || 0,
        overdue: overdue || 0,
        byType: Object.entries(byType).map(([type, count]) => ({ type, count: count as number })),
        byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count: count as number }))
      };
    } catch (error) {
      console.error('Error getting activity analytics:', error);
      throw new Error('Failed to get activity analytics');
    }
  }

  /**
   * Create follow-up activity from a completed activity
   */
  static async createFollowUp(
    parentActivityId: string, 
    followUpData: Omit<CreateActivityRequest, 'contact_id' | 'deal_id'>
  ): Promise<CrmActivity> {
    try {
      // Get parent activity to inherit contact and deal
      const parentActivity = await this.getById(parentActivityId);

      const activityData: CreateActivityRequest = {
        ...followUpData,
        contact_id: parentActivity.contact_id,
        deal_id: parentActivity.deal_id
      };

      return await this.create(activityData);
    } catch (error) {
      console.error('Error creating follow-up activity:', error);
      throw new Error('Failed to create follow-up activity');
    }
  }

  /**
   * Batch update activities (useful for bulk operations)
   */
  static async batchUpdate(
    activityIds: string[], 
    updates: Partial<CreateActivityRequest>
  ): Promise<CrmActivity[]> {
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .update(updates)
        .in('id', activityIds)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error batch updating activities:', error);
      throw new Error('Failed to batch update activities');
    }
  }
} 