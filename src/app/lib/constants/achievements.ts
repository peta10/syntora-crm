import { Achievement } from '@/app/types/todo';

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Productivity Achievements
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'productivity',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 10,
    special_effects: ['confetti']
  },
  {
    id: 'task_master_10',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⚡',
    category: 'productivity',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 10,
    xp_reward: 50,
    special_effects: ['confetti', 'level_glow']
  },
  {
    id: 'task_warrior_50',
    title: 'Task Warrior',
    description: 'Complete 50 tasks',
    icon: '⚔️',
    category: 'productivity',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 50,
    xp_reward: 150,
    special_effects: ['epic_confetti', 'achievement_sound']
  },
  {
    id: 'task_legend_100',
    title: 'Task Legend',
    description: 'Complete 100 tasks',
    icon: '👑',
    category: 'productivity',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 100,
    xp_reward: 300,
    special_effects: ['legendary_animation', 'golden_glow']
  },
  {
    id: 'productivity_god',
    title: 'Productivity God',
    description: 'Complete 500 tasks',
    icon: '🏆',
    category: 'productivity',
    difficulty: 'legendary',
    unlocked: false,
    progress: 0,
    target: 500,
    xp_reward: 1000,
    special_effects: ['divine_animation', 'screen_shake', 'rainbow_confetti']
  },

  // Consistency Achievements
  {
    id: 'daily_grind_3',
    title: 'Daily Grind',
    description: 'Complete tasks for 3 consecutive days',
    icon: '🔥',
    category: 'consistency',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 3,
    xp_reward: 30,
    special_effects: ['flame_effect']
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Complete tasks for 7 consecutive days',
    icon: '💪',
    category: 'consistency',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 7,
    xp_reward: 100,
    special_effects: ['power_surge', 'muscle_flex']
  },
  {
    id: 'unstoppable_30',
    title: 'Unstoppable',
    description: 'Complete tasks for 30 consecutive days',
    icon: '🚀',
    category: 'consistency',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 30,
    xp_reward: 500,
    special_effects: ['rocket_launch', 'space_particles']
  },
  {
    id: 'consistency_legend',
    title: 'Consistency Legend',
    description: 'Complete tasks for 100 consecutive days',
    icon: '💎',
    category: 'consistency',
    difficulty: 'platinum',
    unlocked: false,
    progress: 0,
    target: 100,
    xp_reward: 1500,
    special_effects: ['diamond_sparkle', 'eternal_flame']
  },

  // Wellness Achievements
  {
    id: 'mindful_start',
    title: 'Mindful Start',
    description: 'Complete your first spiritual/gratitude task',
    icon: '🧘',
    category: 'wellness',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 25,
    special_effects: ['zen_particles', 'peaceful_glow']
  },
  {
    id: 'gratitude_master',
    title: 'Gratitude Master',
    description: 'Complete 25 spiritual/gratitude tasks',
    icon: '🙏',
    category: 'wellness',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 25,
    xp_reward: 200,
    special_effects: ['blessing_rain', 'golden_light']
  },
  {
    id: 'spiritual_warrior',
    title: 'Spiritual Warrior',
    description: 'Complete 100 spiritual/gratitude tasks',
    icon: '✨',
    category: 'wellness',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 100,
    xp_reward: 750,
    special_effects: ['starlight_cascade', 'divine_aura']
  },
  {
    id: 'zen_master',
    title: 'Zen Master',
    description: 'Achieve perfect work-life balance for a week',
    icon: '☯️',
    category: 'wellness',
    difficulty: 'platinum',
    unlocked: false,
    progress: 0,
    target: 7,
    xp_reward: 400,
    special_effects: ['yin_yang_rotation', 'harmony_waves']
  },

  // Goals Achievements
  {
    id: 'project_starter',
    title: 'Project Starter',
    description: 'Create your first project',
    icon: '📋',
    category: 'goals',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 20,
    special_effects: ['blueprint_unfold']
  },
  {
    id: 'project_finisher',
    title: 'Project Finisher',
    description: 'Complete your first project',
    icon: '🎯',
    category: 'goals',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 100,
    special_effects: ['target_hit', 'victory_fanfare']
  },
  {
    id: 'deadline_destroyer',
    title: 'Deadline Destroyer',
    description: 'Complete 10 tasks before their due date',
    icon: '⏰',
    category: 'goals',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 10,
    xp_reward: 150,
    special_effects: ['clock_explosion', 'time_mastery']
  },
  {
    id: 'high_priority_hero',
    title: 'High Priority Hero',
    description: 'Complete 20 high-priority tasks',
    icon: '🦸',
    category: 'goals',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 20,
    xp_reward: 250,
    special_effects: ['hero_cape', 'power_surge']
  },

  // Special/Fun Achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    category: 'special',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 15,
    special_effects: ['moon_glow', 'owl_hoot'],
    hidden: true
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task before 6 AM',
    icon: '🌅',
    category: 'special',
    difficulty: 'bronze',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 15,
    special_effects: ['sunrise_glow', 'bird_chirp'],
    hidden: true
  },
  {
    id: 'lightning_round',
    title: 'Lightning Round',
    description: 'Complete 10 tasks in one hour',
    icon: '⚡',
    category: 'special',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 10,
    xp_reward: 300,
    special_effects: ['lightning_strike', 'speed_lines']
  },
  {
    id: 'perfectionist',
    title: 'The Perfectionist',
    description: 'Rate 5 tasks as maximum difficulty and complete them',
    icon: '💎',
    category: 'special',
    difficulty: 'platinum',
    unlocked: false,
    progress: 0,
    target: 5,
    xp_reward: 400,
    special_effects: ['crystal_formation', 'perfection_aura']
  },
  {
    id: 'comeback_king',
    title: 'Comeback King',
    description: 'Complete a task that was overdue by more than a week',
    icon: '👑',
    category: 'special',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 100,
    special_effects: ['phoenix_rise', 'redemption_glow'],
    hidden: true
  },
  {
    id: 'multitasker',
    title: 'Master Multitasker',
    description: 'Have tasks in 5 different categories',
    icon: '🎭',
    category: 'special',
    difficulty: 'silver',
    unlocked: false,
    progress: 0,
    target: 5,
    xp_reward: 120,
    special_effects: ['juggling_balls', 'rainbow_trail']
  },
  {
    id: 'focus_master',
    title: 'Focus Master',
    description: 'Complete a 2-hour focus session without interruption',
    icon: '🎯',
    category: 'special',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 1,
    xp_reward: 250,
    special_effects: ['laser_focus', 'concentration_aura']
  },
  {
    id: 'habit_builder',
    title: 'Habit Builder',
    description: 'Maintain a daily habit for 21 consecutive days',
    icon: '🏗️',
    category: 'special',
    difficulty: 'gold',
    unlocked: false,
    progress: 0,
    target: 21,
    xp_reward: 350,
    special_effects: ['building_blocks', 'foundation_solid']
  }
];

// Achievement categories for filtering/display
export const ACHIEVEMENT_CATEGORIES = {
  productivity: { name: 'Productivity', color: 'blue', icon: '⚡' },
  consistency: { name: 'Consistency', color: 'orange', icon: '🔥' },
  wellness: { name: 'Wellness', color: 'green', icon: '🧘' },
  goals: { name: 'Goals', color: 'purple', icon: '🎯' },
  special: { name: 'Special', color: 'pink', icon: '✨' }
};

// Difficulty levels with styling
export const DIFFICULTY_LEVELS = {
  bronze: { name: 'Bronze', color: '#CD7F32', glow: '#CD7F32' },
  silver: { name: 'Silver', color: '#C0C0C0', glow: '#C0C0C0' },
  gold: { name: 'Gold', color: '#FFD700', glow: '#FFD700' },
  platinum: { name: 'Platinum', color: '#E5E4E2', glow: '#E5E4E2' },
  legendary: { name: 'Legendary', color: '#FF6B6B', glow: '#FF6B6B' }
};

// Helper functions for achievement logic
export const ACHIEVEMENT_HELPERS = {
  checkTaskCompletion: (taskCount: number): Achievement[] => {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => 
      achievement.id.includes('task_') && taskCount >= achievement.target
    );
  },
  
  checkConsistency: (streak: number): Achievement[] => {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => 
      achievement.category === 'consistency' && streak >= achievement.target
    );
  },
  
  checkWellness: (spiritualTaskCount: number): Achievement[] => {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => 
      achievement.category === 'wellness' && spiritualTaskCount >= achievement.target
    );
  },
  
  checkSpecialConditions: (context: {
    timeOfDay?: string;
    tasksInHour?: number;
    overdueCompletion?: boolean;
    categoryCount?: number;
    focusSessionDuration?: number;
    habitStreak?: number;
  }): Achievement[] => {
    const unlocked: Achievement[] = [];
    
    if (context.timeOfDay) {
      const hour = new Date(context.timeOfDay).getHours();
      if (hour >= 22 || hour <= 2) {
        unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'night_owl')!);
      }
      if (hour <= 6) {
        unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'early_bird')!);
      }
    }
    
    if (context.tasksInHour && context.tasksInHour >= 10) {
      unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'lightning_round')!);
    }
    
    if (context.overdueCompletion) {
      unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'comeback_king')!);
    }
    
    if (context.categoryCount && context.categoryCount >= 5) {
      unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'multitasker')!);
    }
    
    if (context.focusSessionDuration && context.focusSessionDuration >= 120) {
      unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'focus_master')!);
    }
    
    if (context.habitStreak && context.habitStreak >= 21) {
      unlocked.push(ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'habit_builder')!);
    }
    
    return unlocked.filter(Boolean);
  }
}; 