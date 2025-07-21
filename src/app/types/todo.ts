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
  
  // Enhanced productivity metadata
  project_id?: string;
  actual_duration?: number;
  difficulty_rating?: 1 | 2 | 3 | 4 | 5;
  energy_level_before?: 1 | 2 | 3 | 4 | 5;
  energy_level_after?: 1 | 2 | 3 | 4 | 5;
  mood_impact?: 'positive' | 'neutral' | 'negative';
  context_tags?: string[]; // location, weather, day type
  reflection_notes?: string;
  focus_session_id?: string;
  completion_celebration?: boolean;
  impact_score?: number; // 1-10 based on importance/urgency
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  progress_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  category?: string;
  is_overdue?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'consistency' | 'wellness' | 'goals' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  target: number;
  xp_reward: number;
  special_effects?: string[];
  hidden?: boolean;
}

export interface FocusSession {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  planned_duration: number; // minutes
  actual_duration?: number; // minutes
  task_ids: string[];
  interruptions: number;
  flow_rating?: 1 | 2 | 3 | 4 | 5;
  environment_notes?: string;
  productivity_score?: number;
  session_type: 'pomodoro' | 'deep_work' | 'sprint' | 'planning';
  completed: boolean;
}

export interface ProductivityMetrics {
  date: string;
  focus_score: number;      // 0-100, based on deep work sessions
  consistency_score: number; // 0-100, daily habit tracking
  impact_score: number;     // 0-100, high-priority task completion
  wellness_score: number;   // 0-100, spiritual/self-care balance
  total_score: number;      // overall productivity score
  tasks_completed: number;
  time_focused: number;     // minutes
  achievements_unlocked: number;
  mood_rating?: 1 | 2 | 3 | 4 | 5;
  energy_rating?: 1 | 2 | 3 | 4 | 5;
  stress_level?: 1 | 2 | 3 | 4 | 5;
}

export interface WeeklyInsight {
  id: string;
  week_start: string;
  insight_type: 'pattern' | 'achievement' | 'suggestion' | 'celebration';
  title: string;
  description: string;
  data: Record<string, unknown>;
  importance: 'low' | 'medium' | 'high';
  action_suggested?: string;
}

export interface YearlyReport {
  year: number;
  total_tasks_completed: number;
  total_hours_focused: number;
  top_categories: { category: string; count: number }[];
  achievements_unlocked: Achievement[];
  best_streak: number;
  most_productive_month: string;
  growth_highlights: string[];
  goals_achieved: number;
  gratitude_tasks_completed: number;
  average_productivity_score: number;
  key_insights: string[];
}

export interface UserStats {
  level: number;
  xp: number;
  xp_to_next: number;
  total_tasks_completed: number;
  current_streak: number;
  best_streak: number;
  achievements_unlocked: number;
  total_focus_time: number; // minutes
  average_productivity_score: number;
  spiritual_tasks_completed: number;
  projects_completed: number;
  habits_maintained: number;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimated_duration: number;
  reasoning: string;
  confidence_score: number;
  tags: string[];
  suggested_time?: string;
} 