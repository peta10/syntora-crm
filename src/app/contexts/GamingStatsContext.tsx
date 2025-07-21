'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GamingStats, GamingStatsAPI } from '@/app/lib/api/gaming-stats';

interface GamingStatsContextType {
  stats: GamingStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  addPoints: (points: number, source?: string) => Promise<void>;
  triggerReset: () => Promise<void>;
}

const GamingStatsContext = createContext<GamingStatsContextType | undefined>(undefined);

export function GamingStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<GamingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let currentStats = await GamingStatsAPI.getCurrentStats();
      
      if (!currentStats) {
        currentStats = await GamingStatsAPI.initializeStats();
      }
      
      setStats(currentStats);
    } catch (err) {
      console.error('Error loading gaming stats:', err);
      setError('Failed to load gaming stats');
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points: number, source: string = 'task_completion') => {
    try {
      await GamingStatsAPI.addPoints(points, source);
      await refreshStats();
    } catch (err) {
      console.error('Error adding points:', err);
      setError('Failed to add points');
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
      setError('Failed to trigger daily reset');
      throw err;
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <GamingStatsContext.Provider value={{
      stats,
      loading,
      error,
      refreshStats,
      addPoints,
      triggerReset
    }}>
      {children}
    </GamingStatsContext.Provider>
  );
}

export function useGamingStats() {
  const context = useContext(GamingStatsContext);
  if (context === undefined) {
    throw new Error('useGamingStats must be used within a GamingStatsProvider');
  }
  return context;
} 