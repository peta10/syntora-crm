'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Star, Zap, Settings, User, Palette, Gamepad2, Trophy, Flame, Sparkles, Save, RotateCcw, Bell, BellOff, Monitor, Moon, Sun, Activity, Target, Timer, Award, Play, Music, LogIn, LogOut, Shield, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useGaming } from '@/app/contexts/GamingContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { SoundEngine } from '@/app/utils/sounds';
import { useRouter } from 'next/navigation';

interface ProductivitySettings {
  dailyGoal: number;
  pointsPerTask: {
    low: number;
    medium: number;
    high: number;
    spiritual: number;
  };
  notifications: {
    enabled: boolean;
    reminderInterval: number;
    motivationalMessages: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    soundEnabled,
    volume,
    animationsEnabled,
    updateSettings: updateGamingSettings,
  } = useGaming();
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [productivitySettings, setProductivitySettings] = useState<ProductivitySettings>({
    dailyGoal: 5,
    pointsPerTask: {
      low: 10,
      medium: 15,
      high: 20,
      spiritual: 25,
    },
    notifications: {
      enabled: true,
      reminderInterval: 30,
      motivationalMessages: true,
    },
    theme: 'dark',
  });

  const [activeTab, setActiveTab] = useState('account');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);

  const soundEffects = [
    { id: 'complete', name: 'Task Complete', icon: <Star className="w-4 h-4" />, description: 'Fortnite-like chest opening sound' },
    { id: 'levelup', name: 'Level Up', icon: <Trophy className="w-4 h-4" />, description: 'Epic achievement sound' },
    { id: 'combo', name: 'Combo', icon: <Zap className="w-4 h-4" />, description: 'Increasing pitch with combo count' },
    { id: 'streak', name: 'Streak', icon: <Play className="w-4 h-4" />, description: 'Satisfying streak continuation' },
    { id: 'spiritual', name: 'Spiritual Task', icon: <Music className="w-4 h-4" />, description: 'Mystical/ethereal sound' },
    { id: 'achievement', name: 'Achievement', icon: <Trophy className="w-4 h-4" />, description: 'Epic achievement unlock' },
    { id: 'points', name: 'Points Gain', icon: <Sparkles className="w-4 h-4" />, description: 'Quick ascending notes' },
  ];

  // Initialize sound engine once
  useEffect(() => {
    if (soundEnabled) {
      SoundEngine.initialize(volume);
    }
  }, [soundEnabled]);

  // Update volume when it changes
  useEffect(() => {
    if (soundEnabled) {
      SoundEngine.setVolume(volume);
    }
  }, [volume]);

  const playTestSound = (soundType: string) => {
    if (!soundEnabled) return;
    setSelectedSound(soundType);
    
    switch (soundType) {
      case 'complete':
        SoundEngine.playTaskComplete();
        break;
      case 'levelup':
        SoundEngine.playLevelUp();
        break;
      case 'combo':
        SoundEngine.playCombo(3); // Example combo count
        break;
      case 'streak':
        SoundEngine.playStreak();
        break;
      case 'spiritual':
        SoundEngine.playSpiritual();
        break;
      case 'achievement':
        SoundEngine.playAchievement();
        break;
      case 'points':
        SoundEngine.playPointsGain();
        break;
    }

    // Reset selected sound after animation
    setTimeout(() => setSelectedSound(null), 1000);
  };

  const updateGamingSetting = (key: 'soundEnabled' | 'volume' | 'animationsEnabled', value: boolean | number) => {
    updateGamingSettings({ [key]: value });
    setHasUnsavedChanges(true);
  };

  const updateProductivitySetting = (key: keyof ProductivitySettings, value: number | string) => {
    setProductivitySettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const updatePointsSetting = (priority: keyof typeof productivitySettings.pointsPerTask, value: number) => {
    setProductivitySettings(prev => ({
      ...prev,
      pointsPerTask: { ...prev.pointsPerTask, [priority]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const updateNotificationSetting = (key: keyof typeof productivitySettings.notifications, value: boolean | number) => {
    setProductivitySettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    // In a real app, save to backend/localStorage
    localStorage.setItem('syntora-productivity-settings', JSON.stringify(productivitySettings));
    
    setHasUnsavedChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const resetToDefaults = () => {
    updateGamingSettings({
      soundEnabled: true,
      volume: 75,
      animationsEnabled: true,
    });
    
    setProductivitySettings({
      dailyGoal: 5,
      pointsPerTask: {
        low: 10,
        medium: 15,
        high: 20,
        spiritual: 25,
      },
      notifications: {
        enabled: true,
        reminderInterval: 30,
        motivationalMessages: true,
      },
      theme: 'dark',
    });
    
    setHasUnsavedChanges(true);
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedProductivitySettings = localStorage.getItem('syntora-productivity-settings');
    
    if (savedProductivitySettings) {
      setProductivitySettings(JSON.parse(savedProductivitySettings));
    }
  }, []);

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'productivity', label: 'Productivity', icon: Target },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6E86FF]/10 via-transparent to-[#FF6BBA]/10" />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-xl flex items-center justify-center relative shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400">Customize your productivity experience</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-3"
              >
                <button
                  onClick={resetToDefaults}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg hover:bg-gray-700/50 hover:scale-105 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={saveSettings}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Save success notification */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-8 right-8 z-50 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm rounded-xl p-4 border border-green-400/50 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Settings Saved!</h3>
                  <p className="text-green-200 text-sm">Your preferences have been updated</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 hover:bg-gray-800/50 transition-all duration-300">
              <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-left group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#6E86FF]/20 to-[#FF6BBA]/20 border border-[#6E86FF]/30 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        activeTab === tab.id ? 'text-[#6E86FF]' : ''
                      }`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-all duration-300">
              <AnimatePresence mode="wait">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2 text-[#6E86FF]" />
                        Account & Authentication
                      </h3>
                    </div>

                    {user ? (
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white">
                                {user.user_metadata?.first_name && user.user_metadata?.last_name 
                                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                  : 'User'}
                              </h4>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                              <p className="text-gray-500 text-xs">
                                Signed in since {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-sm">Active</span>
                            </div>
                          </div>
                        </div>

                        {/* Account Actions */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-medium text-white">Account Actions</h4>
                          
                          <button
                            onClick={handleSignOut}
                            disabled={authLoading}
                            className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>{authLoading ? 'Signing out...' : 'Sign Out'}</span>
                          </button>
                        </div>

                        {/* Security Info */}
                        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                          <div className="flex items-center space-x-3 mb-3">
                            <Shield className="w-5 h-5 text-green-400" />
                            <h4 className="font-medium text-white">Security</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center justify-between">
                              <span>Two-Factor Authentication</span>
                              <span className="text-yellow-400">Not enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Last sign-in</span>
                              <span>{new Date(user.last_sign_in_at || '').toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Authentication method</span>
                              <span className="capitalize">{user.app_metadata?.provider || 'email'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Key className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Not signed in</h3>
                        <p className="text-gray-400 mb-6">
                          Sign in to access your personalized settings and sync your data across devices.
                        </p>
                        <button
                          onClick={handleSignIn}
                          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
                        >
                          <LogIn className="w-5 h-5" />
                          <span>Sign In</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Gaming Settings */}
                {activeTab === 'gaming' && (
                  <motion.div
                    key="gaming"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <Gamepad2 className="w-5 h-5 mr-2 text-[#6E86FF]" />
                        Gaming Experience
                      </h3>
                    </div>

                    {/* Sound Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Audio Settings</h4>
                      
                      {/* Main Sound Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          {soundEnabled ? 
                            <Volume2 className="w-5 h-5 text-blue-400" /> : 
                            <VolumeX className="w-5 h-5 text-gray-400" />
                          }
                          <div>
                            <p className="text-white font-medium">Sound Effects</p>
                            <p className="text-gray-400 text-sm">Enable completion sounds and audio feedback</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateGamingSetting('soundEnabled', !soundEnabled)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            soundEnabled ? 'bg-[#6E86FF]' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                            soundEnabled ? 'left-6' : 'left-0.5'
                          }`} />
                        </button>
                      </div>

                      {/* Volume Slider */}
                      {soundEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-white font-medium">Volume</label>
                            <span className="text-gray-400">{volume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => updateGamingSetting('volume', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #6E86FF 0%, #6E86FF ${volume}%, #374151 ${volume}%, #374151 100%)`
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Sound Effects Preview Grid */}
                      {soundEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                        >
                          {[
                            { id: 'complete', name: 'Task Complete', icon: Star, description: 'Fortnite-like chest opening', color: 'text-yellow-400' },
                            { id: 'levelup', name: 'Level Up', icon: Trophy, description: 'Epic achievement sound', color: 'text-purple-400' },
                            { id: 'combo', name: 'Combo', icon: Zap, description: 'Increasing pitch combo', color: 'text-blue-400' },
                            { id: 'streak', name: 'Streak', icon: Flame, description: 'Streak continuation', color: 'text-orange-400' },
                            { id: 'spiritual', name: 'Spiritual Task', icon: Music, description: 'Mystical/ethereal sound', color: 'text-indigo-400' },
                            { id: 'achievement', name: 'Achievement', icon: Award, description: 'Epic achievement unlock', color: 'text-emerald-400' },
                            { id: 'points', name: 'Points Gain', icon: Sparkles, description: 'Quick ascending notes', color: 'text-pink-400' }
                          ].map((effect) => {
                            const Icon = effect.icon;
                            return (
                              <div
                                key={effect.id}
                                className={`p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 transition-all duration-200 ${
                                  selectedSound === effect.id ? 'bg-gray-700/50 border-gray-600/50 scale-102' : 'hover:bg-gray-700/30 hover:border-gray-600/30'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg bg-gray-700/50 ${effect.color}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">{effect.name}</h4>
                                      <p className="text-sm text-gray-400">{effect.description}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => playTestSound(effect.id)}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                      selectedSound === effect.id
                                        ? 'bg-[#6E86FF] text-white'
                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                    }`}
                                  >
                                    Preview
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>

                    {/* Animation Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Visual Effects</h4>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">Animations</p>
                            <p className="text-gray-400 text-sm">Enable smooth animations and transitions</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateGamingSetting('animationsEnabled', !animationsEnabled)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            animationsEnabled ? 'bg-[#6E86FF]' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                            animationsEnabled ? 'left-6' : 'left-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Productivity Settings */}
                {activeTab === 'productivity' && (
                  <motion.div
                    key="productivity"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-[#6E86FF]" />
                        Productivity Settings
                      </h3>
                    </div>

                    {/* Daily Goal */}
                    <div className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white font-medium">Daily Task Goal</p>
                          <p className="text-gray-400 text-sm">Number of tasks to complete each day</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={productivitySettings.dailyGoal}
                            onChange={(e) => updateProductivitySetting('dailyGoal', parseInt(e.target.value))}
                            className="w-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:border-[#6E86FF] outline-none"
                          />
                          <span className="text-gray-400">tasks</span>
                        </div>
                      </div>
                    </div>

                    {/* Points System */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Points System</h4>
                      
                      {[
                        { key: 'low', label: 'Low Priority', color: 'from-green-500 to-green-600' },
                        { key: 'medium', label: 'Medium Priority', color: 'from-yellow-500 to-yellow-600' },
                        { key: 'high', label: 'High Priority', color: 'from-red-500 to-red-600' },
                        { key: 'spiritual', label: 'Spiritual/Gratitude', color: 'from-amber-500 to-amber-600' },
                      ].map(({ key, label, color }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color}`} />
                            <span className="text-white font-medium">{label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={productivitySettings.pointsPerTask[key as keyof typeof productivitySettings.pointsPerTask]}
                              onChange={(e) => updatePointsSetting(key as keyof typeof productivitySettings.pointsPerTask, parseInt(e.target.value))}
                              className="w-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:border-[#6E86FF] outline-none"
                            />
                            <span className="text-gray-400">pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-[#6E86FF]" />
                        Appearance
                      </h3>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Theme</h4>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'system', label: 'System', icon: Monitor },
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => {
                              setTheme(value);
                              updateProductivitySetting('theme', value as 'light' | 'dark' | 'system');
                            }}
                            className={`p-4 rounded-xl border transition-all text-center group hover:scale-105 duration-200 ${
                              theme === value
                                ? 'bg-gradient-to-r from-[#6E86FF]/20 to-[#FF6BBA]/20 border-[#6E86FF]/30 text-white shadow-lg'
                                : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600/50'
                            }`}
                          >
                            <Icon className="w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110" />
                            <p className="font-medium">{label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Scheme Preview */}
                    <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200">
                      <h4 className="text-lg font-medium text-white mb-4">Color Preview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Primary', color: 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]' },
                          { name: 'Success', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
                          { name: 'Warning', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
                          { name: 'Spiritual', color: 'bg-gradient-to-r from-amber-500 to-yellow-500' },
                        ].map(({ name, color }) => (
                          <div key={name} className="text-center group">
                            <div className={`w-full h-12 rounded-lg ${color} mb-2 transition-all group-hover:scale-105 group-hover:shadow-lg`} />
                            <p className="text-gray-400 text-sm group-hover:text-white transition-colors">{name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-[#6E86FF]" />
                        Notifications
                      </h3>
                    </div>

                    {/* Notification Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        {productivitySettings.notifications.enabled ? 
                          <Bell className="w-5 h-5 text-blue-400" /> : 
                          <BellOff className="w-5 h-5 text-gray-400" />
                        }
                        <div>
                          <p className="text-white font-medium">Enable Notifications</p>
                          <p className="text-gray-400 text-sm">Receive task reminders and motivational messages</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateNotificationSetting('enabled', !productivitySettings.notifications.enabled)}
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          productivitySettings.notifications.enabled ? 'bg-[#6E86FF]' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                          productivitySettings.notifications.enabled ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {productivitySettings.notifications.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        {/* Reminder Interval */}
                        <div className="p-4 bg-gray-800/30 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-white font-medium">Reminder Interval</p>
                              <p className="text-gray-400 text-sm">How often to remind you about pending tasks</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input
                                type="number"
                                min="5"
                                max="120"
                                step="5"
                                value={productivitySettings.notifications.reminderInterval}
                                onChange={(e) => updateNotificationSetting('reminderInterval', parseInt(e.target.value))}
                                className="w-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:border-[#6E86FF] outline-none"
                              />
                              <span className="text-gray-400">min</span>
                            </div>
                          </div>
                        </div>

                        {/* Motivational Messages */}
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <Activity className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-white font-medium">Motivational Messages</p>
                              <p className="text-gray-400 text-sm">Receive encouraging messages and productivity tips</p>
                            </div>
                          </div>
                          <button
                            onClick={() => updateNotificationSetting('motivationalMessages', !productivitySettings.notifications.motivationalMessages)}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              productivitySettings.notifications.motivationalMessages ? 'bg-[#6E86FF]' : 'bg-gray-600'
                            }`}
                          >
                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                              productivitySettings.notifications.motivationalMessages ? 'left-6' : 'left-0.5'
                            }`} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 