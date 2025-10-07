import { supabase } from '@/app/lib/supabase/client';
import {
  CrmDeal,
  CreateDealRequest,
  DealFilters,
  PaginatedResponse,
  DealWithRelations,
  PipelineStage
} from '@/app/types/crm';

export class DealsAPI {
  /**
   * Get all deals with optional filtering and pagination
   */
  static async getAll(filters: DealFilters = {}): Promise<PaginatedResponse<DealWithRelations>> {
    try {
      let query = supabase
        .from('crm_deals')
        .select(`
          *,
          contact:crm_contacts(*),
          activities:crm_activities(count),
          invoices:crm_invoices(count)
        `, { count: 'exact' });

      // Apply filters
      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      if (filters.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }

      if (filters.value_min) {
        query = query.gte('value', filters.value_min);
      }

      if (filters.value_max) {
        query = query.lte('value', filters.value_max);
      }

      if (filters.expected_close_after) {
        query = query.gte('expected_close_date', filters.expected_close_after);
      }

      if (filters.expected_close_before) {
        query = query.lte('expected_close_date', filters.expected_close_before);
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

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
      console.error('Error fetching deals:', error);
      throw new Error('Failed to fetch deals');
    }
  }

  /**
   * Get a single deal by ID with all related data
   */
  static async getById(id: string): Promise<DealWithRelations> {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select(`
          *,
          contact:crm_contacts(*),
          activities:crm_activities(*),
          invoices:crm_invoices(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Deal not found');

      return data as DealWithRelations;
    } catch (error) {
      console.error('Error fetching deal:', error);
      throw new Error('Failed to fetch deal');
    }
  }

  /**
   * Create a new deal
   */
  static async create(dealData: CreateDealRequest): Promise<CrmDeal> {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .insert([dealData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw new Error('Failed to create deal');
    }
  }

  /**
   * Update an existing deal
   */
  static async update(id: string, updates: Partial<CreateDealRequest>): Promise<CrmDeal> {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw new Error('Failed to update deal');
    }
  }

  /**
   * Delete a deal
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw new Error('Failed to delete deal');
    }
  }

  /**
   * Get all pipeline stages
   * NOTE: Temporarily disabled - crm_pipeline_stages table doesn't exist yet
   * TODO: Create crm_pipeline_stages table in Supabase, then uncomment this method
   */
  /* 
  static async getStages(): Promise<PipelineStage[]> {
    try {
      const { data, error } = await supabase
        .from('crm_pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
      throw new Error('Failed to fetch pipeline stages');
    }
  }
  */

  /**
   * Update deal stage
   */
  static async updateStage(id: string, newStage: string): Promise<CrmDeal> {
    try {
      // Get the stage probability
      const { data: stage } = await supabase
        .from('crm_pipeline_stages')
        .select('probability')
        .eq('stage_name', newStage)
        .single();

      const { data, error } = await supabase
        .from('crm_deals')
        .update({
          stage: newStage,
          probability: stage?.probability || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating deal stage:', error);
      throw new Error('Failed to update deal stage');
    }
  }

  /**
   * Get deals by stage for pipeline view
   */
  static async getByStage(stage: string): Promise<CrmDeal[]> {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*, contact:crm_contacts(*)')
        .eq('stage', stage)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching deals by stage:', error);
      throw new Error('Failed to fetch deals by stage');
    }
  }

  /**
   * Get analytics/stats for deals
   */
  static async getAnalytics(): Promise<{
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    wonValue: number;
    averageDealSize: number;
    byStage: { stage: string; count: number; value: number }[];
  }> {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*');

      if (error) throw error;

      const deals = data || [];
      const totalDeals = deals.length;
      const totalValue = deals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
      const wonDeals = deals.filter((d: any) => d.is_won).length;
      const wonValue = deals.filter((d: any) => d.is_won).reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
      const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

      // Group by stage
      const stageMap = new Map<string, { count: number; value: number }>();
      deals.forEach((deal: any) => {
        const existing = stageMap.get(deal.stage) || { count: 0, value: 0 };
        stageMap.set(deal.stage, {
          count: existing.count + 1,
          value: existing.value + (deal.value || 0)
        });
      });

      const byStage = Array.from(stageMap.entries()).map(([stage, data]) => ({
        stage,
        ...data
      }));

      return {
        totalDeals,
        totalValue,
        wonDeals,
        wonValue,
        averageDealSize,
        byStage
      };
    } catch (error) {
      console.error('Error getting deal analytics:', error);
      return {
        totalDeals: 0,
        totalValue: 0,
        wonDeals: 0,
        wonValue: 0,
        averageDealSize: 0,
        byStage: []
      };
    }
  }
}
