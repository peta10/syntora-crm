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

export const sendTaskNotification = async (title: string, body: string) => {
  // Implementation will be added later
}; 