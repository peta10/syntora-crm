import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Project } from '@/app/types/todo';

export interface CreateProjectData {
  title: string;
  description: string;
  color: string;
  icon: string;
  status?: 'active' | 'completed' | 'on_hold' | 'archived';
  category?: string;
  tags?: string[];
  estimated_hours?: number;
  is_public?: boolean;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: 'active' | 'completed' | 'on_hold' | 'archived';
  category?: string;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  is_public?: boolean;
  total_tasks?: number;
  completed_tasks?: number;
  progress_percentage?: number;
}

class ProjectsService {
  private supabase = createClientComponentClient();

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  }

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    return data;
  }

  async createProject(projectData: CreateProjectData): Promise<Project> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create projects');
    }

    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        ...projectData,
        owner_id: user.id,
        progress_percentage: 0,
        total_tasks: 0,
        completed_tasks: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  }

  async updateProject(id: string, updates: UpdateProjectData): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  }

  async deleteProject(id: string): Promise<void> {
    // First, remove project_id from all tasks
    await this.supabase
      .from('tasks')
      .update({ project_id: null })
      .eq('project_id', id);

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async assignTaskToProject(taskId: string, projectId: string | null): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .update({ project_id: projectId })
      .eq('id', taskId);

    if (error) {
      console.error('Error assigning task to project:', error);
      throw error;
    }
  }

  async getProjectTasks(projectId: string) {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }

    return data || [];
  }

  async updateProjectProgress(projectId: string): Promise<void> {
    // This will be handled automatically by the database trigger
    // But we can call it manually if needed
    const tasks = await this.getProjectTasks(projectId);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    await this.updateProject(projectId, {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percentage: progressPercentage,
    });
  }

  // Real-time subscription for project changes
  subscribeToProjects(callback: (payload: any) => void) {
    return this.supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        callback
      )
      .subscribe();
  }

  // Batch operations
  async createMultipleProjects(projects: CreateProjectData[]): Promise<Project[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create projects');
    }

    const projectsWithOwner = projects.map(project => ({
      ...project,
      owner_id: user.id,
      progress_percentage: 0,
      total_tasks: 0,
      completed_tasks: 0,
    }));

    const { data, error } = await this.supabase
      .from('projects')
      .insert(projectsWithOwner)
      .select();

    if (error) {
      console.error('Error creating multiple projects:', error);
      throw error;
    }

    return data;
  }

  async duplicateProject(id: string, newTitle?: string): Promise<Project> {
    const originalProject = await this.getProjectById(id);
    
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const duplicateData: CreateProjectData = {
      title: newTitle || `${originalProject.title} (Copy)`,
      description: originalProject.description || '',
      color: originalProject.color || '#6E86FF',
      icon: originalProject.icon || '📁',
      status: 'active',
      category: originalProject.category,
      tags: originalProject.tags,
      estimated_hours: originalProject.estimated_hours,
      is_public: false,
    };

    return this.createProject(duplicateData);
  }

  async getProjectStatistics(projectId: string) {
    const tasks = await this.getProjectTasks(projectId);
    const project = await this.getProjectById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'todo').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;

    const totalEstimatedTime = tasks.reduce((sum, task) => {
      return sum + (task.estimated_duration || 0);
    }, 0);

    const totalActualTime = tasks.reduce((sum, task) => {
      return sum + (task.actual_duration || 0);
    }, 0);

    return {
      project,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      progressPercentage: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
      totalEstimatedTime,
      totalActualTime,
      efficiency: totalEstimatedTime === 0 ? 0 : Math.round((totalEstimatedTime / totalActualTime) * 100),
    };
  }
}

export const projectsService = new ProjectsService(); 