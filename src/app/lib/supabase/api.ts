import { supabase } from '@/app/lib/supabase/client';

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
  // Time tracking fields
  time_tracking_enabled?: boolean;
  time_started_at?: string;
  time_stopped_at?: string;
  total_time_spent?: number;
  is_currently_tracking?: boolean;
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
  // Time tracking fields
  time_tracking_enabled?: boolean;
  time_started_at?: string;
  time_stopped_at?: string;
  total_time_spent?: number;
  is_currently_tracking?: boolean;
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
  due_date: dbTodo.date, // Map the date field to due_date
  estimated_duration: dbTodo.estimated_duration,
  from_reflection: false,
  reflection_date: undefined,
  order: dbTodo.sort_order,
  // Time tracking fields
  time_tracking_enabled: dbTodo.time_tracking_enabled,
  time_started_at: dbTodo.time_started_at,
  time_stopped_at: dbTodo.time_stopped_at,
  total_time_spent: dbTodo.total_time_spent,
  is_currently_tracking: dbTodo.is_currently_tracking,
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
  date: todo.due_date || new Date().toISOString().split('T')[0], // Use provided due_date or today's date
  // Time tracking fields
  time_tracking_enabled: todo.time_tracking_enabled,
  time_started_at: todo.time_started_at,
  time_stopped_at: todo.time_stopped_at,
  total_time_spent: todo.total_time_spent,
  is_currently_tracking: todo.is_currently_tracking,
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
    if (updates.due_date !== undefined) dbUpdates.date = updates.due_date; // Map due_date to date field
    // Time tracking updates
    if (updates.time_tracking_enabled !== undefined) dbUpdates.time_tracking_enabled = updates.time_tracking_enabled;
    if (updates.time_started_at !== undefined) dbUpdates.time_started_at = updates.time_started_at;
    if (updates.time_stopped_at !== undefined) dbUpdates.time_stopped_at = updates.time_stopped_at;
    if (updates.total_time_spent !== undefined) dbUpdates.total_time_spent = updates.total_time_spent;
    if (updates.is_currently_tracking !== undefined) dbUpdates.is_currently_tracking = updates.is_currently_tracking;
    
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
  },

  // Time tracking functions
  startTimeTracking: async (id: string): Promise<Todo> => {
    const now = new Date().toISOString();
    
    // Stop any currently tracking tasks first
    await supabase
      .from('daily_todos')
      .update({ 
        is_currently_tracking: false,
        time_stopped_at: now,
        updated_at: now
      })
      .eq('is_currently_tracking', true);
    
    // Start tracking this task
    const { data, error } = await supabase
      .from('daily_todos')
      .update({ 
        time_tracking_enabled: true,
        time_started_at: now,
        is_currently_tracking: true,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to start time tracking: ${error.message}`);
    }
    
    return mapTodoFromDb(data);
  },

  stopTimeTracking: async (id: string): Promise<Todo> => {
    const now = new Date().toISOString();
    
    // Get current task to calculate time spent
    const { data: currentTask, error: fetchError } = await supabase
      .from('daily_todos')
      .select('time_started_at, total_time_spent')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to fetch task: ${fetchError.message}`);
    }
    
    // Calculate time spent
    let additionalTime = 0;
    if (currentTask.time_started_at) {
      const startTime = new Date(currentTask.time_started_at);
      const endTime = new Date(now);
      additionalTime = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Convert to minutes
    }
    
    const newTotalTime = (currentTask.total_time_spent || 0) + additionalTime;
    
    const { data, error } = await supabase
      .from('daily_todos')
      .update({ 
        time_stopped_at: now,
        is_currently_tracking: false,
        total_time_spent: newTotalTime,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to stop time tracking: ${error.message}`);
    }
    
    return mapTodoFromDb(data);
  },

  // Bible verse functions
  getDailyBibleVerse: async (): Promise<{ verse: string; reference: string } | null> => {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('text, reference')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Failed to fetch bible verse:', error);
      return null;
    }
    
    return data ? { verse: data.text, reference: data.reference } : null;
  },

  markBibleVerseShown: async (): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Get today's bible verse
    const { data: verse } = await supabase
      .from('bible_verses')
      .select('id, text, reference')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!verse) return;
    
    // Insert or update notification record
    const { error } = await supabase
      .from('daily_bible_verse_notifications')
      .upsert({
        user_id: user.id,
        date: today,
        verse_id: verse.id,
        verse_text: verse.text,
        verse_reference: verse.reference
      });
    
    if (error) {
      console.error('Failed to mark bible verse as shown:', error);
    }
  },

  hasShownBibleVerseToday: async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('daily_bible_verse_notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Failed to check bible verse status:', error);
      return false;
    }
    
    return !!data;
  }
};

export default api; 