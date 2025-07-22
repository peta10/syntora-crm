import { supabase } from './client';
import { ProjectResource } from '@/app/types/todo';

export interface CreateResourceData {
  project_id: string;
  resource_type: 'human' | 'material' | 'equipment' | 'software' | 'facility' | 'other';
  name: string;
  description?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  status: 'available' | 'in_use' | 'unavailable';
  allocation_start_date?: string;
  allocation_end_date?: string;
}

export interface UpdateResourceData {
  resource_type?: 'human' | 'material' | 'equipment' | 'software' | 'facility' | 'other';
  name?: string;
  description?: string;
  quantity?: number;
  unit_cost?: number;
  total_cost?: number;
  status?: 'available' | 'in_use' | 'unavailable';
  allocation_start_date?: string;
  allocation_end_date?: string;
}

export const resourcesService = {
  getResources: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_resources')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getResourceById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createResource: async (resource: CreateResourceData) => {
    const { data, error } = await supabase
      .from('project_resources')
      .insert(resource)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateResource: async (id: string, updates: UpdateResourceData) => {
    const { data, error } = await supabase
      .from('project_resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteResource: async (id: string) => {
    const { error } = await supabase
      .from('project_resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Calculate total cost for all resources in a project
  calculateTotalCost: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_resources')
      .select('total_cost')
      .eq('project_id', projectId);

    if (error) throw error;
    return data.reduce((sum, resource) => sum + (resource.total_cost || 0), 0);
  },

  // Get resource allocation for a date range
  getResourceAllocation: async (projectId: string, startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('project_resources')
      .select('*')
      .eq('project_id', projectId)
      .gte('allocation_start_date', startDate)
      .lte('allocation_end_date', endDate);

    if (error) throw error;
    return data;
  },

  // Get available resources for a date range
  getAvailableResources: async (projectId: string, startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('project_resources')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'available')
      .or(`allocation_start_date.gt.${endDate},allocation_end_date.lt.${startDate}`);

    if (error) throw error;
    return data;
  }
}; 