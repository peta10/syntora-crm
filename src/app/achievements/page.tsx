'use client';

import React, { useState } from 'react';
import { AchievementBoard } from '@/app/components/achievements/AchievementBoard';
import { ACHIEVEMENT_DEFINITIONS } from '@/app/lib/constants/achievements';
import useStore from '@/app/store/slices/todoSlice';
import { Achievement } from '@/app/types/todo';

export default function AchievementsPage() {
  const { todos } = useStore();
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Mock user achievements with some unlocked for demonstration
  const [userAchievements] = useState<Achievement[]>(
    ACHIEVEMENT_DEFINITIONS.map(achievement => {
      // Mock some achievements as unlocked based on current todo data
      const completedTasks = todos.filter(t => t.completed).length;
      const spiritualTasks = todos.filter(t => t.show_gratitude && t.completed).length;
      
      let unlocked = false;
      let progress = 0;

      if (achievement.id === 'first_task' && completedTasks > 0) {
        unlocked = true;
        progress = achievement.target;
      } else if (achievement.id === 'task_master_10' && completedTasks >= 10) {
        unlocked = true;
        progress = achievement.target;
      } else if (achievement.id === 'mindful_start' && spiritualTasks > 0) {
        unlocked = true;
        progress = achievement.target;
      } else {
        // Set progress for other achievements
        switch (achievement.id) {
          case 'task_warrior_50':
            progress = Math.min(completedTasks, achievement.target);
            unlocked = completedTasks >= achievement.target;
            break;
          case 'gratitude_master':
            progress = Math.min(spiritualTasks, achievement.target);
            unlocked = spiritualTasks >= achievement.target;
            break;
          default:
            progress = Math.floor(Math.random() * achievement.target);
            unlocked = Math.random() > 0.8; // 20% chance of being unlocked
        }
      }

      return {
        ...achievement,
        unlocked,
        progress,
        unlocked_at: unlocked ? new Date().toISOString() : undefined
      };
    })
  );

  const handleAchievementHover = (achievement: Achievement) => {
    console.log('Achievement hovered:', achievement.title);
    // Could show detailed tooltip or play sound effect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <AchievementBoard
        userAchievements={userAchievements}
        onAchievementHover={handleAchievementHover}
        showOnlyUnlocked={showOnlyUnlocked}
        setShowOnlyUnlocked={setShowOnlyUnlocked}
      />
    </div>
  );
} 