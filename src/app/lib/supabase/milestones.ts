import { supabase } from '@/app/lib/supabase/client';

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  weight?: number;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMilestoneData {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
  weight?: number;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  icon?: string;
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
  weight?: number;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  icon?: string;
}

class MilestonesService {
  private supabase = supabase;

  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching milestones:', error);
        throw new Error(`Failed to fetch milestones: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  }

  async getMilestoneById(id: string): Promise<ProjectMilestone | null> {
    try {
      const { data, error } = await this.supabase
        .from('project_milestones')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching milestone:', error);
        throw new Error(`Failed to fetch milestone: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch milestone:', error);
      throw error;
    }
  }

  async createMilestone(milestoneData: CreateMilestoneData): Promise<ProjectMilestone> {
    try {
      console.log('Creating milestone with data:', milestoneData);

      const { data, error } = await this.supabase
        .from('project_milestones')
        .insert(milestoneData)
        .select()
        .single();

      if (error) {
        console.error('Error creating milestone:', error);
        throw new Error(`Failed to create milestone: ${error.message}`);
      }

      console.log('Milestone created successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to create milestone:', error);
      throw error;
    }
  }

  async updateMilestone(id: string, updates: UpdateMilestoneData): Promise<ProjectMilestone> {
    try {
      const { data, error } = await this.supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating milestone:', error);
        throw new Error(`Failed to update milestone: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to update milestone:', error);
      throw error;
    }
  }

  async deleteMilestone(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('project_milestones')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting milestone:', error);
        throw new Error(`Failed to delete milestone: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      throw error;
    }
  }
}

export const milestonesService = new MilestonesService(); 