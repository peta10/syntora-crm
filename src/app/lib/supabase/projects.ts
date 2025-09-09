import { supabase } from './client';
import { Project } from '@/app/types/todo';

export const projectsService = {
  // Project CRUD
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:profiles!project_manager_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        client:crm_contacts!client_id (
          id,
          first_name,
          last_name,
          company
        ),
        contact:crm_contacts!contact_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        deal:crm_deals!deal_id (
          id,
          deal_name,
          value,
          stage
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getProjectById: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:profiles!project_manager_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        client:crm_contacts!client_id (
          id,
          first_name,
          last_name,
          company
        ),
        contact:crm_contacts!contact_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        deal:crm_deals!deal_id (
          id,
          deal_name,
          value,
          stage
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createProject: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
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

  deleteProject: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Milestones
  getMilestones: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  createMilestone: async (milestone: any) => {
    const { data, error } = await supabase
      .from('project_milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateMilestone: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('project_milestones')
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

  deleteMilestone: async (id: string) => {
    const { error } = await supabase
      .from('project_milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Project Health
  updateProjectHealth: async (id: string, status: Project['health_status'], notes?: string) => {
    const { data, error } = await supabase
      .from('projects')
      .update({
        health_status: status,
        health_notes: notes,
        last_health_check_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Project Progress
  updateProjectProgress: async (id: string, progressPercentage: number) => {
    const { data, error } = await supabase
      .from('projects')
      .update({
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Project Status
  updateProjectStatus: async (id: string, status: Project['status'], reason?: string) => {
    const { data, error } = await supabase
      .from('projects')
      .update({
        status,
        cancellation_reason: status === 'cancelled' ? reason : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Project Filters
  getProjectsByStatus: async (status: Project['status']) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getProjectsByClient: async (clientId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getProjectsByContact: async (contactId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getProjectsByDeal: async (dealId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Project Analytics
  getProjectAnalytics: async (projectId: string) => {
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    const { data: milestones } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId);

    const { data: tasks } = await supabase
      .from('todos')
      .select('*')
      .eq('project_id', projectId);

    const { data: timeEntries } = await supabase
      .from('project_time_entries')
      .select('*')
      .eq('project_id', projectId);

    const { data: budgetItems } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('project_id', projectId);

    return {
      project,
      metrics: {
        total_milestones: milestones?.length || 0,
        completed_milestones: milestones?.filter((m: any) => m.status === 'completed').length || 0,
        total_tasks: tasks?.length || 0,
        completed_tasks: tasks?.filter((t: any) => t.status === 'completed').length || 0,
        total_hours: timeEntries?.reduce((sum: number, entry: any) => sum + (entry.duration_minutes || 0) / 60, 0) || 0,
        total_budget: budgetItems?.reduce((sum: number, item: any) => sum + item.estimated_amount, 0) || 0,
        total_spent: budgetItems?.reduce((sum: number, item: any) => sum + (item.actual_amount || 0), 0) || 0
      },
      progress: {
        milestone_progress: milestones?.length 
          ? (milestones.filter((m: any) => m.status === 'completed').length / milestones.length) * 100 
          : 0,
        task_progress: tasks?.length 
          ? (tasks.filter((t: any) => t.status === 'completed').length / tasks.length) * 100 
          : 0,
        budget_progress: budgetItems?.length && project?.budget
          ? (budgetItems.reduce((sum: number, item: any) => sum + (item.actual_amount || 0), 0) / project.budget) * 100
          : 0
      }
    };
  }
}; 