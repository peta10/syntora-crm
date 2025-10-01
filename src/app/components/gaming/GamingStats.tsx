'use client';

import React from 'react';
import { Award, Flame, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useGaming } from '@/app/contexts/GamingContext';

export const GamingStats: React.FC = () => {
  const {
    level,
    xp,
    xpToNext,
    todayPoints,
    streakCount,
    combo,
    showStreakBurst,
    showPointsBurst,
    showCombo,
    soundEnabled,
    updateSettings,
  } = useGaming();

  const progressPercentage = (xp / xpToNext) * 100;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sound Toggle */}
      <button
        onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
        className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Combo counter */}
      {combo > 1 && (
        <div className={`relative flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 ${showCombo ? 'animate-pulse scale-110' : ''} transition-all duration-500`}>
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-purple-300">{combo}x combo!</span>
          {showCombo && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-purple-400 font-bold animate-bounce">
              🔥 COMBO!
            </div>
          )}
        </div>
      )}
      
      {/* Level and XP */}
      <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
        <Award className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-bold text-indigo-300">Level {level}</span>
        <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Points display */}
      <div className={`relative flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#6E86FF]/20 to-[#FF6BBA]/20 border border-[#6E86FF]/30 ${showPointsBurst ? 'animate-pulse scale-110' : ''} transition-all duration-500`}>
        <Zap className="w-4 h-4 text-[#6E86FF]" />
        <span className="text-sm font-bold bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] bg-clip-text text-transparent">
          Today {todayPoints} pts
        </span>
        {showPointsBurst && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] bg-clip-text text-transparent font-bold animate-bounce">
            +{combo > 1 ? combo * 5 : 15}
          </div>
        )}
      </div>
    </div>
  );
}; 