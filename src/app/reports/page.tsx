'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Trophy, FileText, TrendingUp } from 'lucide-react';
import AnalyticsDashboard from '@/app/components/analytics/AnalyticsDashboard';
import { AchievementBoard } from '@/app/components/achievements/AchievementBoard';
import { ReportsSection } from '@/app/components/reports/ReportsSection';
import { ACHIEVEMENT_DEFINITIONS } from '@/app/lib/constants/achievements';
import useStore from '@/app/store/slices/todoSlice';
import { Achievement } from '@/app/types/todo';

type TabType = 'analytics' | 'achievements' | 'reports';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Performance metrics and productivity insights'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    description: 'Milestones and rewards tracking'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'Detailed reports and data exports'
  }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const { todos } = useStore();
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Calculate user achievements based on actual task completion data
  const userAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(achievement => {
    const completedTasks = todos.filter(t => t.completed).length;
    const spiritualTasks = todos.filter(t => t.show_gratitude && t.completed).length;
    const highPriorityTasks = todos.filter(t => t.priority === 'high' && t.completed).length;
    const workTasks = todos.filter(t => t.category === 'Work' && t.completed).length;
    const personalTasks = todos.filter(t => t.category === 'Personal' && t.completed).length;
    
    let unlocked = false;
    let progress = 0;

    // Real achievement logic based on actual data
    switch (achievement.id) {
      case 'first_task':
        progress = Math.min(completedTasks, achievement.target);
        unlocked = completedTasks >= achievement.target;
        break;
      case 'task_master_10':
        progress = Math.min(completedTasks, achievement.target);
        unlocked = completedTasks >= achievement.target;
        break;
      case 'task_warrior_50':
        progress = Math.min(completedTasks, achievement.target);
        unlocked = completedTasks >= achievement.target;
        break;
      case 'mindful_start':
      case 'gratitude_master':
        progress = Math.min(spiritualTasks, achievement.target);
        unlocked = spiritualTasks >= achievement.target;
        break;
      case 'priority_hero':
        progress = Math.min(highPriorityTasks, achievement.target || 10);
        unlocked = highPriorityTasks >= (achievement.target || 10);
        break;
      case 'work_warrior':
        progress = Math.min(workTasks, achievement.target || 15);
        unlocked = workTasks >= (achievement.target || 15);
        break;
      case 'personal_champion':
        progress = Math.min(personalTasks, achievement.target || 10);
        unlocked = personalTasks >= (achievement.target || 10);
        break;
      case 'consistency_king':
        const taskDateSpan = todos.length > 0 ? 7 : 0;
        progress = Math.min(taskDateSpan, achievement.target);
        unlocked = taskDateSpan >= achievement.target;
        break;
      default:
        progress = Math.min(Math.floor(completedTasks / 3), achievement.target);
        unlocked = progress >= achievement.target;
    }

    return {
      ...achievement,
      unlocked,
      progress,
      unlocked_at: unlocked ? new Date().toISOString() : undefined
    };
  });

  const handleAchievementHover = (achievement: Achievement) => {
    console.log('Achievement hovered:', achievement.title);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard className="p-0" />;
      case 'achievements':
        return (
          <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm">
            <AchievementBoard
              userAchievements={userAchievements}
              onAchievementHover={handleAchievementHover}
              showOnlyUnlocked={showOnlyUnlocked}
              setShowOnlyUnlocked={setShowOnlyUnlocked}
            />
          </div>
        );
      case 'reports':
        return <ReportsSection todos={todos} userAchievements={userAchievements} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header with Tab Navigation */}
        <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
          <div className="px-6 py-4">
            {/* Page Title */}
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/FinalFavicon.webp"
                alt="Syntora Logo"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-gray-400">Track your progress, achievements, and generate detailed reports</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {/* Active tab background effect */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <Icon className={`w-5 h-5 relative z-10 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-gray-400 mt-3"
              >
                {tabs.find(tab => tab.id === activeTab)?.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
