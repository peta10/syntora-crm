import { supabase } from './client';
import { ProjectDependency } from '@/app/types/todo';

export interface CreateDependencyData {
  project_id: string;
  dependent_project_id: string;
  dependency_type: 'blocks' | 'required_by' | 'related_to';
  notes?: string;
}

export interface UpdateDependencyData {
  dependency_type?: 'blocks' | 'required_by' | 'related_to';
  notes?: string;
}

export const dependenciesService = {
  getDependencies: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_dependencies')
      .select(`
        *,
        dependent_project:projects!dependent_project_id (
          id,
          title,
          description,
          status,
          progress_percentage
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getDependencyById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_dependencies')
      .select(`
        *,
        dependent_project:projects!dependent_project_id (
          id,
          title,
          description,
          status,
          progress_percentage
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createDependency: async (dependency: CreateDependencyData) => {
    // Check if dependency already exists
    const { data: existing } = await supabase
      .from('project_dependencies')
      .select('id')
      .match({
        project_id: dependency.project_id,
        dependent_project_id: dependency.dependent_project_id
      })
      .single();

    if (existing) {
      throw new Error('Dependency already exists between these projects');
    }

    // Create the dependency
    const { data, error } = await supabase
      .from('project_dependencies')
      .insert(dependency)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateDependency: async (id: string, updates: UpdateDependencyData) => {
    const { data, error } = await supabase
      .from('project_dependencies')
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

  deleteDependency: async (id: string) => {
    const { error } = await supabase
      .from('project_dependencies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get projects that depend on this project
  getDependentProjects: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_dependencies')
      .select(`
        *,
        project:projects!project_id (
          id,
          title,
          description,
          status,
          progress_percentage
        )
      `)
      .eq('dependent_project_id', projectId);

    if (error) throw error;
    return data;
  },

  // Get projects that this project depends on
  getProjectDependencies: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_dependencies')
      .select(`
        *,
        dependent_project:projects!dependent_project_id (
          id,
          title,
          description,
          status,
          progress_percentage
        )
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  },

  // Check for circular dependencies
  checkCircularDependency: async (projectId: string, dependentProjectId: string) => {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const traverse = async (currentId: string): Promise<boolean> => {
      if (stack.has(currentId)) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);
      stack.add(currentId);

      const { data: dependencies } = await supabase
        .from('project_dependencies')
        .select('dependent_project_id')
        .eq('project_id', currentId);

      if (dependencies) {
        for (const dep of dependencies) {
          if (await traverse(dep.dependent_project_id)) {
            return true;
          }
        }
      }

      stack.delete(currentId);
      return false;
    };

    // Add the potential new dependency to check if it would create a cycle
    visited.add(projectId);
    stack.add(projectId);

    const { data: dependencies } = await supabase
      .from('project_dependencies')
      .select('dependent_project_id')
      .eq('project_id', dependentProjectId);

    if (dependencies) {
      for (const dep of dependencies) {
        if (await traverse(dep.dependent_project_id)) {
          return true;
        }
      }
    }

    return false;
  }
}; 