'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import type { XpGainEvent } from '@/app/components/gaming/XpNotification';

interface TaskCompletionPayload {
  id: string;
  status: string;
  metadata?: {
    xp_earned?: number;
  };
  assigned_to?: string;
}

export function useTaskCompletion(userId?: string) {
  const [xpEvent, setXpEvent] = useState<XpGainEvent | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to task updates
    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${userId}`
        },
        async (payload: { new: Record<string, any>; old: Record<string, any> }) => {
          const newTask = payload.new as TaskCompletionPayload;
          const oldTask = payload.old as TaskCompletionPayload;

          // Check if task was just completed
          if (newTask.status === 'done' && oldTask.status !== 'done') {
            const xpEarned = newTask.metadata?.xp_earned || 10;

            // Check for achievements
            const { data: achievements } = await supabase
              .from('achievement_history')
              .select('*')
              .eq('user_id', userId)
              .order('unlocked_at', { ascending: false })
              .limit(1);

            const latestAchievement = achievements?.[0];
            const isNewAchievement = latestAchievement && 
              new Date(latestAchievement.unlocked_at).getTime() > Date.now() - 5000;

            // Check for level up
            const { data: gamingStats } = await supabase
              .from('gaming_stats')
              .select('level, xp, xp_to_next')
              .eq('user_id', userId)
              .single();

            const leveledUp = gamingStats && 
              gamingStats.xp >= gamingStats.xp_to_next;

            // Create XP event
            const event: XpGainEvent = {
              xp: xpEarned,
              reason: 'Task completed',
              achievement: isNewAchievement ? {
                name: latestAchievement.achievement_name,
                icon: latestAchievement.achievement_icon,
                points: latestAchievement.points_awarded
              } : undefined,
              levelUp: leveledUp ? {
                newLevel: gamingStats.level
              } : undefined
            };

            setXpEvent(event);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const clearXpEvent = () => setXpEvent(null);

  return { xpEvent, clearXpEvent };
}
