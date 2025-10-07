'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, TrendingUp } from 'lucide-react';

export interface XpGainEvent {
  xp: number;
  reason: string;
  achievement?: {
    name: string;
    icon: string;
    points: number;
  };
  levelUp?: {
    newLevel: number;
  };
}

interface XpNotificationProps {
  event: XpGainEvent | null;
  onComplete: () => void;
}

export default function XpNotification({ event, onComplete }: XpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for exit animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  if (!event) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 right-6 z-50 pointer-events-none"
        >
          {/* XP Gain Notification */}
          <div className="bg-gradient-to-r from-[#6E86FF]/95 to-[#FF6BBA]/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 min-w-[280px]">
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-white/20 p-2 rounded-lg"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                    className="text-2xl font-bold text-white"
                  >
                    +{event.xp}
                  </motion.span>
                  <span className="text-sm text-white/80">XP</span>
                </div>
                <p className="text-xs text-white/70 mt-1">{event.reason}</p>
              </div>
            </div>
          </div>

          {/* Level Up Notification */}
          {event.levelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 bg-gradient-to-r from-yellow-500/95 to-orange-500/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="bg-white/20 p-2 rounded-lg"
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                
                <div>
                  <div className="text-lg font-bold text-white">
                    Level {event.levelUp.newLevel}!
                  </div>
                  <p className="text-xs text-white/80">You leveled up!</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievement Unlocked */}
          {event.achievement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 bg-gradient-to-r from-purple-500/95 to-pink-500/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl"
                >
                  {event.achievement.icon}
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-bold text-white">
                      Achievement Unlocked!
                    </span>
                  </div>
                  <p className="text-white font-semibold mt-1">
                    {event.achievement.name}
                  </p>
                  <p className="text-xs text-white/70">
                    +{event.achievement.points} points
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sparkle Effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: 1 }}
            className="absolute -top-2 -right-2"
          >
            ✨
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, delay: 0.3, repeat: 1 }}
            className="absolute -bottom-2 -left-2"
          >
            ✨
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
