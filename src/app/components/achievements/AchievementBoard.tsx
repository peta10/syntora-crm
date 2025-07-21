'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, CheckCircle, Filter, Search, Sparkles } from 'lucide-react';
import { Achievement } from '@/app/types/todo';
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_CATEGORIES, DIFFICULTY_LEVELS } from '@/app/lib/constants/achievements';

interface AchievementBoardProps {
  userAchievements: Achievement[];
  onAchievementHover?: (achievement: Achievement) => void;
  showOnlyUnlocked?: boolean;
  setShowOnlyUnlocked?: (value: boolean) => void;
}

export const AchievementBoard: React.FC<AchievementBoardProps> = ({
  userAchievements,
  onAchievementHover,
  showOnlyUnlocked = false,
  setShowOnlyUnlocked
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  // Merge user achievements with definitions to get current progress
  const mergedAchievements = ACHIEVEMENT_DEFINITIONS.map(def => {
    const userAchievement = userAchievements.find(ua => ua.id === def.id);
    return userAchievement || def;
  });

  // Filter achievements
  const filteredAchievements = mergedAchievements.filter(achievement => {
    if (showOnlyUnlocked && !achievement.unlocked) return false;
    if (!showHidden && achievement.hidden && !achievement.unlocked) return false;
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && achievement.difficulty !== selectedDifficulty) return false;
    if (searchTerm && !achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Group by category
  const groupedAchievements = Object.keys(ACHIEVEMENT_CATEGORIES).reduce((acc, category) => {
    acc[category] = filteredAchievements.filter(a => a.category === category);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const [isHovered, setIsHovered] = useState(false);
    const difficultyStyle = DIFFICULTY_LEVELS[achievement.difficulty];
    const progressPercentage = (achievement.progress / achievement.target) * 100;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className={`
          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
          ${achievement.unlocked 
            ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-transparent shadow-lg' 
            : 'bg-gray-900/50 border-gray-700/50'
          }
        `}
        style={{
          boxShadow: achievement.unlocked && isHovered 
            ? `0 0 20px ${difficultyStyle.glow}40` 
            : undefined
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          onAchievementHover?.(achievement);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Special effects for unlocked achievements */}
        {achievement.unlocked && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(45deg, ${difficultyStyle.color}20, transparent)`
              }}
            />
          </div>
        )}

        {/* Achievement icon */}
        <div className="flex items-center justify-between mb-3">
          <div className={`
            text-4xl p-3 rounded-full 
            ${achievement.unlocked 
              ? 'bg-gradient-to-br from-gray-700 to-gray-600' 
              : 'bg-gray-800/50 grayscale'
            }
          `}>
            {achievement.unlocked ? achievement.icon : <Lock className="w-8 h-8 text-gray-500" />}
          </div>
          
          {/* Difficulty badge */}
          <div 
            className="px-2 py-1 rounded-full text-xs font-bold border"
            style={{
              color: difficultyStyle.color,
              borderColor: `${difficultyStyle.color}50`,
              backgroundColor: `${difficultyStyle.color}20`
            }}
          >
            {difficultyStyle.name}
          </div>
        </div>

        {/* Achievement title and description */}
        <div className="mb-3">
          <h3 className={`font-bold text-lg mb-1 ${
            achievement.unlocked ? 'text-white' : 'text-gray-400'
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm ${
            achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {achievement.description}
          </p>
        </div>

        {/* Progress bar */}
        {!achievement.unlocked && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{achievement.progress}/{achievement.target}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* XP reward */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">{achievement.xp_reward} XP</span>
          </div>
          
          {achievement.unlocked && (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Unlocked</span>
            </div>
          )}
        </div>

        {/* Special effects indicator */}
        {achievement.special_effects && achievement.special_effects.length > 0 && achievement.unlocked && (
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
        )}

        {/* Hidden achievement indicator */}
        {achievement.hidden && !achievement.unlocked && (
          <div className="absolute top-2 left-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Achievement Board</h1>
        </div>
        <p className="text-gray-400">
          Track your productivity milestones and unlock special rewards!
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {userAchievements.filter(a => a.unlocked).length}
          </div>
          <div className="text-sm text-gray-400">Unlocked</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {ACHIEVEMENT_DEFINITIONS.length - userAchievements.filter(a => a.unlocked).length}
          </div>
          <div className="text-sm text-gray-400">Remaining</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {userAchievements.reduce((sum, a) => sum + (a.unlocked ? a.xp_reward : 0), 0)}
          </div>
          <div className="text-sm text-gray-400">Total XP</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round((userAchievements.filter(a => a.unlocked).length / ACHIEVEMENT_DEFINITIONS.length) * 100)}%
          </div>
          <div className="text-sm text-gray-400">Complete</div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.name}</option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
              <option key={key} value={key}>{level.name}</option>
            ))}
          </select>

          {/* Toggle options */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showOnlyUnlocked}
                onChange={(e) => setShowOnlyUnlocked?.(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span>Unlocked only</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <span>Show hidden</span>
            </label>
          </div>
        </div>
      </div>

      {/* Achievement grid */}
      <div className="space-y-8">
        {selectedCategory === 'all' ? (
          // Show by category
          Object.entries(groupedAchievements).map(([category, achievements]) => {
            if (achievements.length === 0) return null;
            const categoryInfo = ACHIEVEMENT_CATEGORIES[category as keyof typeof ACHIEVEMENT_CATEGORIES];
            
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <h2 className="text-xl font-bold text-white">{categoryInfo.name}</h2>
                  <div className="text-sm text-gray-400">
                    ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {achievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        ) : (
          // Show single category
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* No results */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No achievements found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}; 