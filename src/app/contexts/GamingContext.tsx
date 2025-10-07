'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GamingStatsAPI } from '@/app/lib/api/gaming-stats';
import { SoundEngine } from '@/app/utils/sounds';

// Types for gaming state
interface Achievement {
  id: string;
  title: string;
  desc: string;
}

interface ConfettiParticle {
  id: string;
  color: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  isSpecial: boolean;
}

interface CompletionParticle {
  id: string;
  x: number;
  y: number;
  delay: number;
  color: string;
}

interface GamingState {
  // Level system
  level: number;
  xp: number;
  xpToNext: number;
  
  // Points and streaks
  todayPoints: number;
  streakCount: number;
  combo: number;
  
  // Milestones
  allDayComplete: boolean;
  achievements: string[];
  
  // Visual effects
  confettiParticles: ConfettiParticle[];
  completionParticles: CompletionParticle[];
  
  // UI states
  showStreakBurst: boolean;
  showPointsBurst: boolean;
  showLevelUp: boolean;
  showCombo: boolean;
  showAchievement: Achievement | null;
  
  // Settings
  soundEnabled: boolean;
  volume: number;
  animationsEnabled: boolean;

  // Analytics
  totalDaysActive: number;
  bestStreak: number;
  totalAchievementsUnlocked: number;
  weeklyXpGoal: number;
  monthlyXpGoal: number;
  loading: boolean;
  error: string | null;
  isPublicMode: boolean;
}

interface GamingContextType extends GamingState {
  // Actions
  addXP: (amount: number) => void;
  addPoints: (amount: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  triggerConfetti: (type?: string) => void;
  triggerScratchEffect: (id: string) => void;
  playSound: (type: string) => void;
  checkAchievements: (achievements: string[]) => void;
  updateSettings: (settings: Partial<{ soundEnabled: boolean; volume: number; animationsEnabled: boolean }>) => void;
  
  // Analytics actions
  refreshStats: () => Promise<void>;
  triggerReset: () => Promise<void>;
  getAnalytics: (period: 'weekly' | 'monthly', lookback?: number) => Promise<any>;
}

const GamingContext = createContext<GamingContextType | undefined>(undefined);

export const useGaming = () => {
  const context = useContext(GamingContext);
  if (!context) {
    throw new Error('useGaming must be used within a GamingProvider');
  }
  return context;
};

interface GamingProviderProps {
  children: ReactNode;
}

export const GamingProvider: React.FC<GamingProviderProps> = ({ children }) => {
  const [gamingState, setGamingState] = useState<GamingState>({
    level: 1,
    xp: 0,
    xpToNext: 100,
    todayPoints: 0,
    streakCount: 0,
    combo: 0,
    allDayComplete: false,
    achievements: [],
    confettiParticles: [],
    completionParticles: [],
    showStreakBurst: false,
    showPointsBurst: false,
    showLevelUp: false,
    showCombo: false,
    showAchievement: null,
    soundEnabled: true,
    volume: 75,
    animationsEnabled: true,
    totalDaysActive: 0,
    bestStreak: 0,
    totalAchievementsUnlocked: 0,
    weeklyXpGoal: 500,
    monthlyXpGoal: 2000,
    loading: true,
    error: null,
    isPublicMode: false
  });

  // Initialize sound engine
  useEffect(() => {
    if (gamingState.soundEnabled) {
      SoundEngine.initialize(gamingState.volume);
    }
  }, [gamingState.soundEnabled]);

  // Update volume when it changes
  useEffect(() => {
    if (gamingState.soundEnabled) {
      SoundEngine.setVolume(gamingState.volume);
    }
  }, [gamingState.volume]);

  // Load gaming state from Supabase
  useEffect(() => {
    const loadGamingStats = async () => {
      try {
        // Small delay to let auth settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let stats = await GamingStatsAPI.getCurrentStats();
        
        if (!stats) {
          // If no stats found, try initializing
          stats = await GamingStatsAPI.initializeStats();
          
          // If still no stats, switch to public mode
          if (!stats) {
            console.log('GamingProvider: No stats available, using public mode');
            setGamingState(prev => ({
              ...prev,
              loading: false,
              isPublicMode: true
            }));
            return;
          }
        }

        if (stats) {
          setGamingState(prev => ({
            ...prev,
            level: stats.level,
            xp: stats.xp,
            xpToNext: stats.xp_to_next,
            todayPoints: stats.today_points,
            streakCount: stats.streak_count,
            combo: stats.combo,
            allDayComplete: stats.all_day_complete,
            achievements: stats.achievements,
            soundEnabled: stats.sound_enabled,
            volume: stats.volume,
            animationsEnabled: stats.animations_enabled,
            loading: false,
            isPublicMode: false
          }));
        }
      } catch (err) {
        console.error('Error loading gaming stats:', err);
        // Switch to public mode on error
        setGamingState(prev => ({
          ...prev,
          loading: false,
          isPublicMode: true
        }));
      }
    };

    loadGamingStats();
  }, []);

  // Save gaming state to Supabase whenever it changes
  useEffect(() => {
    // Don't save if in public mode
    if (gamingState.isPublicMode) return;

    const saveGamingStats = async () => {
      await GamingStatsAPI.updateStats({
        level: gamingState.level,
        xp: gamingState.xp,
        xp_to_next: gamingState.xpToNext,
        today_points: gamingState.todayPoints,
        streak_count: gamingState.streakCount,
        combo: gamingState.combo,
        all_day_complete: gamingState.allDayComplete,
        achievements: gamingState.achievements,
        sound_enabled: gamingState.soundEnabled,
        volume: gamingState.volume,
        animations_enabled: gamingState.animationsEnabled,
      });
    };

    saveGamingStats();
  }, [gamingState.level, gamingState.xp, gamingState.xpToNext, gamingState.todayPoints, 
      gamingState.streakCount, gamingState.combo, gamingState.allDayComplete, 
      gamingState.achievements, gamingState.soundEnabled, gamingState.volume, 
      gamingState.animationsEnabled, gamingState.isPublicMode]);

  // Check and reset daily stats if needed
  useEffect(() => {
    const checkDailyReset = async () => {
      await GamingStatsAPI.triggerDailyReset();
    };

    checkDailyReset();
  }, []);

  const playSound = (type: string) => {
    if (!gamingState.soundEnabled) return;

    switch (type) {
      case 'complete':
        SoundEngine.playTaskComplete();
        break;
      case 'spiritual':
        SoundEngine.playSpiritual();
        break;
      case 'levelup':
        SoundEngine.playLevelUp();
        break;
      case 'combo':
        SoundEngine.playCombo(gamingState.combo);
        break;
      case 'streak':
        SoundEngine.playStreak();
        break;
      case 'achievement':
        SoundEngine.playAchievement();
        break;
      case 'points':
        SoundEngine.playPointsGain();
        break;
    }
  };

  const triggerConfetti = (type = 'normal') => {
    if (!gamingState.animationsEnabled) return;
    
    const colors = {
      normal: ['#6E86FF', '#FF6BBA', '#B279DB', '#4F46E5', '#EC4899'],
      spiritual: ['#FCD34D', '#F59E0B', '#D97706', '#FBBF24'],
      allday: ['#10B981', '#059669', '#047857', '#34D399', '#6EE7B7'],
      levelup: ['#8B5CF6', '#A855F7', '#9333EA', '#C084FC', '#DDD6FE']
    };
    
    const particleCount = {
      normal: 30,
      spiritual: 40,
      allday: 80,
      levelup: 100
    };
    
    const selectedColors = colors[type as keyof typeof colors] || colors.normal;
    const count = particleCount[type as keyof typeof particleCount] || 30;
    
    const newParticles: ConfettiParticle[] = Array.from({ length: count }, (_, i) => ({
      id: `confetti-${Date.now()}-${i}`,
      color: selectedColors[Math.floor(Math.random() * selectedColors.length)],
      left: 20 + Math.random() * 60,
      delay: Math.random() * 800,
      duration: 2000 + Math.random() * 1500,
      size: 3 + Math.random() * 8,
      rotation: Math.random() * 360,
      isSpecial: type === 'allday' || type === 'levelup'
    }));
    
    setGamingState(prev => ({
      ...prev,
      confettiParticles: [...prev.confettiParticles, ...newParticles]
    }));
    
    setTimeout(() => {
      setGamingState(prev => ({
        ...prev,
        confettiParticles: prev.confettiParticles.filter(p => !newParticles.some(np => np.id === p.id))
      }));
    }, 4000);
  };

  const triggerScratchEffect = (id: string) => {
    if (!gamingState.animationsEnabled) return;
    
    const particles: CompletionParticle[] = Array.from({ length: 12 }, (_, i) => ({
      id: `${id}-${i}`,
      x: 45 + Math.random() * 10,
      y: 45 + Math.random() * 10,
      delay: i * 30,
      color: ['#6E86FF', '#FF6BBA', '#34D399'][Math.floor(Math.random() * 3)]
    }));
    
    setGamingState(prev => ({
      ...prev,
      completionParticles: [...prev.completionParticles, ...particles]
    }));
    
    setTimeout(() => {
      setGamingState(prev => ({
        ...prev,
        completionParticles: prev.completionParticles.filter(p => !p.id.startsWith(`${id}-`))
      }));
    }, 1200);
  };

  const addXP = (amount: number) => {
    setGamingState(prev => {
      const newXP = prev.xp + amount;
      if (newXP >= prev.xpToNext) {
        const newLevel = prev.level + 1;
        const remainingXP = newXP - prev.xpToNext;
        const newXpToNext = Math.floor(prev.xpToNext * 1.5);
        
        // Trigger level up effects
        setTimeout(() => {
          setGamingState(current => ({ ...current, showLevelUp: true }));
          playSound('levelup');
          triggerConfetti('levelup');
          setTimeout(() => {
            setGamingState(current => ({ ...current, showLevelUp: false }));
          }, 3000);
        }, 100);
        
        return {
          ...prev,
          level: newLevel,
          xp: remainingXP,
          xpToNext: newXpToNext,
        };
      }
      
      return { ...prev, xp: newXP };
    });
  };

  const addPoints = (amount: number) => {
    setGamingState(prev => ({ ...prev, todayPoints: prev.todayPoints + amount }));
    playSound('points');
    
    setTimeout(() => {
      setGamingState(current => ({ ...current, showPointsBurst: true }));
      setTimeout(() => {
        setGamingState(current => ({ ...current, showPointsBurst: false }));
      }, 2000);
    }, 100);
  };

  const incrementCombo = () => {
    setGamingState(prev => {
      const newCombo = prev.combo + 1;
      if (newCombo > 1) {
        setTimeout(() => {
          setGamingState(current => ({ ...current, showCombo: true }));
          playSound('combo');
          setTimeout(() => {
            setGamingState(current => ({ ...current, showCombo: false }));
          }, 1500);
        }, 100);
      }
      return { ...prev, combo: newCombo };
    });
  };

  const resetCombo = () => {
    setGamingState(prev => ({ ...prev, combo: 0 }));
  };

  const checkAchievements = (newAchievements: string[]) => {
    const unlockedAchievements = newAchievements.filter(id => !gamingState.achievements.includes(id));
    
    if (unlockedAchievements.length > 0) {
      setGamingState(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...unlockedAchievements]
      }));
      
      // Show first achievement
      const achievementData = {
        first_task: { title: 'Early Bird', desc: 'Complete your first task!' },
        spiritual_master: { title: 'Spiritual Master', desc: '3 spiritual tasks in one day!' },
        perfect_day: { title: 'Perfect Day', desc: 'Completed all tasks for today!' },
        combo_master: { title: 'Combo Master', desc: '5 tasks in a row!' },
      };
      
      const achievement = achievementData[unlockedAchievements[0] as keyof typeof achievementData];
      if (achievement) {
        setTimeout(() => {
          setGamingState(current => ({ 
            ...current, 
            showAchievement: { id: unlockedAchievements[0], ...achievement }
          }));
          playSound('levelup');
          triggerConfetti('levelup');
          setTimeout(() => {
            setGamingState(current => ({ ...current, showAchievement: null }));
          }, 4000);
        }, 100);
      }
    }
  };

  const updateSettings = (settings: Partial<{ soundEnabled: boolean; volume: number; animationsEnabled: boolean }>) => {
    setGamingState(prev => ({ ...prev, ...settings }));
  };

  const refreshStats = async () => {
    try {
      setGamingState(prev => ({ ...prev, loading: true, error: null }));
      
      let stats = await GamingStatsAPI.getCurrentStats();
      
      if (!stats) {
        stats = await GamingStatsAPI.initializeStats();
        
        // If still no stats, switch to public mode
        if (!stats) {
          setGamingState(prev => ({
            ...prev,
            loading: false,
            isPublicMode: true
          }));
          return;
        }
      }
      
      if (stats) {
        setGamingState(prev => ({
          ...prev,
          level: stats.level,
          xp: stats.xp,
          xpToNext: stats.xp_to_next,
          todayPoints: stats.today_points,
          streakCount: stats.streak_count,
          combo: stats.combo,
          allDayComplete: stats.all_day_complete,
          achievements: stats.achievements,
          soundEnabled: stats.sound_enabled,
          volume: stats.volume,
          animationsEnabled: stats.animations_enabled,
          totalDaysActive: stats.total_days_active,
          bestStreak: stats.best_streak,
          totalAchievementsUnlocked: stats.total_achievements_unlocked,
          weeklyXpGoal: stats.weekly_xp_goal,
          monthlyXpGoal: stats.monthly_xp_goal,
          loading: false,
          isPublicMode: false
        }));
      }
    } catch (err) {
      console.error('Error loading gaming stats:', err);
      setGamingState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load gaming stats',
        isPublicMode: true
      }));
    }
  };

  const triggerReset = async () => {
    try {
      const result = await GamingStatsAPI.triggerDailyReset();
      console.log('Reset completed:', result);
      await refreshStats();
      return result;
    } catch (err) {
      console.error('Error triggering reset:', err);
      setGamingState(prev => ({
        ...prev,
        error: 'Failed to trigger daily reset'
      }));
      throw err;
    }
  };

  const getAnalytics = async (period: 'weekly' | 'monthly' = 'weekly', lookback: number = 12) => {
    try {
      // If in public mode, return demo data
      if (gamingState.isPublicMode) {
        return {
          analytics: period === 'weekly' ? [
            {
              week_start: '2024-01-01',
              total_points: 500,
              total_tasks: 20,
              average_productivity: 85,
              days_active: 5,
              week_number: 1
            },
            {
              week_start: '2024-01-08',
              total_points: 750,
              total_tasks: 30,
              average_productivity: 90,
              days_active: 6,
              week_number: 2
            }
          ] : [
            {
              month_start: '2024-01-01',
              total_points: 2000,
              total_tasks: 80,
              average_productivity: 88,
              days_active: 22,
              best_day_points: 150
            }
          ],
          achievements: [
            {
              id: 'demo1',
              achievement_name: 'Getting Started',
              achievement_description: 'Complete your first task!',
              achievement_icon: '🎯',
              points_awarded: 50,
              unlocked_at: new Date().toISOString(),
              unlock_condition: 'Complete first task'
            }
          ],
          currentStats: gamingState
        };
      }

      return await GamingStatsAPI.getAnalytics(period, lookback);
    } catch (err) {
      console.error('Error getting analytics:', err);
      return null;
    }
  };

  const contextValue: GamingContextType = {
    ...gamingState,
    addXP,
    addPoints,
    incrementCombo,
    resetCombo,
    triggerConfetti,
    triggerScratchEffect,
    playSound,
    checkAchievements,
    updateSettings,
    refreshStats,
    triggerReset,
    getAnalytics,
  };

  return (
    <GamingContext.Provider value={contextValue}>
      {children}
    </GamingContext.Provider>
  );
}; 