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
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  }

  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      console.log('Creating project with data:', projectData);

      // Generate a random UUID for owner_id since we don't have auth
      const randomOwnerId = crypto.randomUUID();

      const projectToInsert = {
        ...projectData,
        owner_id: randomOwnerId,
        progress_percentage: 0,
        total_tasks: 0,
        completed_tasks: 0,
        actual_hours: 0,
      };

      const { data, error } = await this.supabase
        .from('projects')
        .insert(projectToInsert)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating project:', error);
        throw new Error(`Failed to create project: ${error.message}`);
      }

      console.log('Project created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: UpdateProjectData): Promise<Project> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
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
        throw new Error(`Failed to delete project: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async assignTaskToProject(taskId: string, projectId: string | null): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .update({ project_id: projectId })
        .eq('id', taskId);

      if (error) {
        console.error('Error assigning task to project:', error);
        throw new Error(`Failed to assign task: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to assign task to project:', error);
      throw error;
    }
  }

  async getProjectTasks(projectId: string) {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project tasks:', error);
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
      throw error;
    }
  }

  async updateProjectProgress(projectId: string): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Failed to update project progress:', error);
      throw error;
    }
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
    try {
      const randomOwnerId = crypto.randomUUID();

      const projectsWithOwner = projects.map(project => ({
        ...project,
        owner_id: randomOwnerId,
        progress_percentage: 0,
        total_tasks: 0,
        completed_tasks: 0,
        actual_hours: 0,
      }));

      const { data, error } = await this.supabase
        .from('projects')
        .insert(projectsWithOwner)
        .select();

      if (error) {
        console.error('Error creating multiple projects:', error);
        throw new Error(`Failed to create projects: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to create multiple projects:', error);
      throw error;
    }
  }

  async duplicateProject(id: string, newTitle?: string): Promise<Project> {
    try {
      const originalProject = await this.getProjectById(id);
      if (!originalProject) {
        throw new Error('Project not found');
      }

      const { id: _, created_at, updated_at, ...projectData } = originalProject;
      
      const duplicatedProject = await this.createProject({
        ...projectData,
        title: newTitle || `${originalProject.title} (Copy)`,
      });

      return duplicatedProject;
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      throw error;
    }
  }
}

export const projectsService = new ProjectsService(); 