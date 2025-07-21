import { supabase } from '@/lib/supabase';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  show_gratitude: boolean;
  created_at: string;
  updated_at: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  description?: string;
  due_date?: string;
  estimated_duration?: number;
  from_reflection?: boolean;
  reflection_date?: string;
  order?: number;
}

// Database schema interface
interface DbTodo {
  id: string;
  title: string;
  completed: boolean;
  show_gratitude: boolean;
  created_at: string;
  updated_at: string;
  priority: number;
  category?: string;
  tags?: string[];
  description?: string;
  estimated_duration?: number;
  sort_order?: number;
  date: string;
}

// Database schema mapping helper functions
const mapPriorityFromDb = (priority: number): 'high' | 'medium' | 'low' => {
  if (priority >= 4) return 'high';
  if (priority >= 2) return 'medium';
  return 'low';
};

const mapPriorityToDb = (priority: 'high' | 'medium' | 'low'): number => {
  switch (priority) {
    case 'high': return 5;
    case 'medium': return 3;
    case 'low': return 1;
    default: return 3;
  }
};

const mapTodoFromDb = (dbTodo: DbTodo): Todo => ({
  id: dbTodo.id,
  title: dbTodo.title,
  completed: dbTodo.completed,
  show_gratitude: dbTodo.show_gratitude,
  created_at: dbTodo.created_at,
  updated_at: dbTodo.updated_at,
  priority: mapPriorityFromDb(dbTodo.priority),
  category: dbTodo.category,
  tags: dbTodo.tags,
  description: dbTodo.description,
  due_date: undefined, // Not available in current schema
  estimated_duration: dbTodo.estimated_duration,
  from_reflection: false, // Not available in current schema
  reflection_date: undefined, // Not available in current schema
  order: dbTodo.sort_order,
});

const mapTodoToDb = (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => ({
  title: todo.title,
  completed: todo.completed,
  show_gratitude: todo.show_gratitude,
  priority: mapPriorityToDb(todo.priority),
  category: todo.category,
  tags: todo.tags,
  description: todo.description,
  estimated_duration: todo.estimated_duration,
  sort_order: todo.order || 0,
  date: new Date().toISOString().split('T')[0], // Required field in daily_todos
});

const api = {
  getTodos: async (): Promise<Todo[]> => {
    const { data, error } = await supabase
      .from('daily_todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch todos: ${error.message}`);
    }
    
    return data ? data.map(mapTodoFromDb) : [];
  },

  createTodo: async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> => {
    const dbTodo = mapTodoToDb(todo);
    
    const { data, error } = await supabase
      .from('daily_todos')
      .insert([dbTodo])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create todo: ${error.message}`);
    }
    
    return mapTodoFromDb(data);
  },

  updateTodo: async (id: string, updates: Partial<Todo>): Promise<Todo> => {
    const dbUpdates: Partial<DbTodo> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.show_gratitude !== undefined) dbUpdates.show_gratitude = updates.show_gratitude;
    if (updates.priority !== undefined) dbUpdates.priority = mapPriorityToDb(updates.priority);
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.estimated_duration !== undefined) dbUpdates.estimated_duration = updates.estimated_duration;
    if (updates.order !== undefined) dbUpdates.sort_order = updates.order;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('daily_todos')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
    
    return mapTodoFromDb(data);
  },

  deleteTodo: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('daily_todos')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }
};

export default api; 