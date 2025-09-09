import { supabase } from './client';
import { ProjectBudgetItem } from '@/app/types/todo';

export interface CreateBudgetItemData {
  project_id: string;
  category: string;
  description: string;
  estimated_amount: number;
  actual_amount?: number;
  variance?: number;
  status: 'planned' | 'approved' | 'spent' | 'cancelled';
  notes?: string;
}

export interface UpdateBudgetItemData {
  category?: string;
  description?: string;
  estimated_amount?: number;
  actual_amount?: number;
  variance?: number;
  status?: 'planned' | 'approved' | 'spent' | 'cancelled';
  notes?: string;
}

export const budgetService = {
  getBudgetItems: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getBudgetItemById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createBudgetItem: async (item: CreateBudgetItemData) => {
    const { data, error } = await supabase
      .from('project_budget_items')
      .insert({
        ...item,
        variance: item.actual_amount !== undefined 
          ? item.actual_amount - item.estimated_amount 
          : undefined
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateBudgetItem: async (id: string, updates: UpdateBudgetItemData) => {
    const { data: currentItem, error: fetchError } = await supabase
      .from('project_budget_items')
      .select('estimated_amount')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!currentItem) throw new Error('Budget item not found');

    const variance = updates.actual_amount !== undefined
      ? updates.actual_amount - (updates.estimated_amount || currentItem.estimated_amount)
      : undefined;

    const { data, error } = await supabase
      .from('project_budget_items')
      .update({
        ...updates,
        variance,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteBudgetItem: async (id: string) => {
    const { error } = await supabase
      .from('project_budget_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get budget summary
  getBudgetSummary: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('estimated_amount, actual_amount, status')
      .eq('project_id', projectId);

    if (error) throw error;

    return {
      total_estimated: data.reduce((sum: number, item: any) => sum + item.estimated_amount, 0),
      total_actual: data.reduce((sum: number, item: any) => sum + (item.actual_amount || 0), 0),
      total_variance: data.reduce((sum: number, item: any) => sum + (item.actual_amount || 0) - item.estimated_amount, 0),
      items_by_status: {
        planned: data.filter((item: any) => item.status === 'planned').length,
        approved: data.filter((item: any) => item.status === 'approved').length,
        spent: data.filter((item: any) => item.status === 'spent').length,
        cancelled: data.filter((item: any) => item.status === 'cancelled').length
      }
    };
  },

  // Get budget items by category
  getBudgetByCategory: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('category, estimated_amount, actual_amount')
      .eq('project_id', projectId);

    if (error) throw error;

    const categories = [...new Set(data.map((item: any) => item.category))];
    return categories.map(category => {
      const items = data.filter((item: any) => item.category === category);
      return {
        category,
        total_estimated: items.reduce((sum: number, item: any) => sum + item.estimated_amount, 0),
        total_actual: items.reduce((sum: number, item: any) => sum + (item.actual_amount || 0), 0),
        item_count: items.length
      };
    });
  },

  // Get over-budget items
  getOverBudgetItems: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('project_id', projectId)
      .gt('actual_amount', 'estimated_amount');

    if (error) throw error;
    return data;
  }
}; 