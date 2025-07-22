import { supabase } from './client';
import { ProjectStakeholder } from '@/app/types/todo';

export interface CreateStakeholderData {
  project_id: string;
  contact_id?: string;
  name: string;
  role: string;
  influence_level: 'low' | 'medium' | 'high';
  interest_level: 'low' | 'medium' | 'high';
  engagement_strategy?: string;
  communication_preference?: string;
  notes?: string;
}

export interface UpdateStakeholderData {
  name?: string;
  role?: string;
  influence_level?: 'low' | 'medium' | 'high';
  interest_level?: 'low' | 'medium' | 'high';
  engagement_strategy?: string;
  communication_preference?: string;
  notes?: string;
  last_contacted_at?: string;
}

export const stakeholdersService = {
  getStakeholders: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_stakeholders')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          phone,
          company,
          position,
          status
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getStakeholderById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_stakeholders')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          phone,
          company,
          position,
          status
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createStakeholder: async (stakeholder: CreateStakeholderData) => {
    const { data, error } = await supabase
      .from('project_stakeholders')
      .insert(stakeholder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateStakeholder: async (id: string, updates: UpdateStakeholderData) => {
    const { data, error } = await supabase
      .from('project_stakeholders')
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

  deleteStakeholder: async (id: string) => {
    const { error } = await supabase
      .from('project_stakeholders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get all contacts that can be added as stakeholders
  getAvailableContacts: async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email, company, position')
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get all deals associated with a contact
  getContactDeals: async (contactId: string) => {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update last contacted timestamp
  updateLastContacted: async (id: string) => {
    const { data, error } = await supabase
      .from('project_stakeholders')
      .update({
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 