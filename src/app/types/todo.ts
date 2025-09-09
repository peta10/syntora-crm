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
  project_id?: string;
  // Time tracking fields
  time_tracking_enabled?: boolean;
  time_started_at?: string;
  time_stopped_at?: string;
  total_time_spent?: number; // in minutes
  is_currently_tracking?: boolean;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  replies?: ProjectComment[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  project_manager_id?: string;
  client_id?: string;
  contact_id?: string;
  deal_id?: string;
  is_public: boolean;
  updated_at?: string;
  created_at?: string;
  icon?: string;
  color?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived' | 'cancelled';
  progress_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  category?: string;
  tags?: string[];
  estimated_hours?: number;
  actual_hours: number;
  due_date?: string;
  start_date?: string;
  budget?: number;
  priority?: 'low' | 'medium' | 'high';
  project_type?: string;
  billing_type?: 'fixed_price' | 'time_and_materials' | 'retainer';
  payment_terms?: string;
  risk_level?: 'low' | 'medium' | 'high';
  complexity_level?: 'low' | 'medium' | 'high';
  strategic_value?: 'low' | 'medium' | 'high';
  success_criteria?: string[];
  assumptions?: string[];
  constraints?: string[];
  lessons_learned?: string;
  cancellation_reason?: string;
  health_status?: 'on_track' | 'at_risk' | 'off_track';
  health_notes?: string;
  last_health_check_at?: string;
  comments?: ProjectComment[];
  contract_value?: number;
  currency?: string;
  project_code?: string;
  custom_fields?: Record<string, any>;
}

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

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  permissions: {
    [key: string]: boolean;
  };
  joined_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectTimeEntry {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  billable: boolean;
  billing_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  risk_type: 'technical' | 'schedule' | 'cost' | 'resource' | 'scope' | 'quality' | 'other';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'resolved';
  mitigation_plan?: string;
  contingency_plan?: string;
  owner_id?: string;
  due_date?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectResource {
  id: string;
  project_id: string;
  resource_type: 'human' | 'material' | 'equipment' | 'software' | 'facility' | 'other';
  name: string;
  description?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  status: 'available' | 'in_use' | 'unavailable';
  allocation_start_date?: string;
  allocation_end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectBudgetItem {
  id: string;
  project_id: string;
  category: string;
  description: string;
  estimated_amount: number;
  actual_amount?: number;
  variance?: number;
  status: 'planned' | 'approved' | 'spent' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectKPI {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  metric_type: 'number' | 'percentage' | 'currency' | 'time' | 'boolean';
  target_value: number;
  actual_value?: number;
  unit?: string;
  status: 'on_track' | 'at_risk' | 'off_track';
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  last_measured_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectStakeholder {
  id: string;
  project_id: string;
  contact_id?: string;
  name: string;
  role: string;
  influence_level: 'low' | 'medium' | 'high';
  interest_level: 'low' | 'medium' | 'high';
  engagement_strategy?: string;
  communication_preference?: string;
  last_contacted_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  contacts?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    status?: string;
  };
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  title?: string;
  description?: string;
  file_type?: string;
  file_size?: number;
  storage_path?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDependency {
  id: string;
  project_id: string;
  dependent_project_id: string;
  dependency_type: 'blocks' | 'required_by' | 'related_to';
  notes?: string;
  created_at?: string;
}

// Project Activity
export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
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