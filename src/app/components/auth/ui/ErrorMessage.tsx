'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'info' | 'critical';
  className?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function ErrorMessage({ 
  message, 
  type = 'error',
  className = '', 
  showIcon = true,
  dismissible = false,
  onDismiss
}: ErrorMessageProps) {
  if (!message) return null;

  const typeConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      iconColor: 'text-red-400',
      glowColor: 'shadow-red-500/10'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      iconColor: 'text-yellow-400',
      glowColor: 'shadow-yellow-500/10'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400',
      glowColor: 'shadow-blue-500/10'
    },
    critical: {
      icon: XCircle,
      bgColor: 'bg-red-600/15',
      borderColor: 'border-red-600/40',
      textColor: 'text-red-300',
      iconColor: 'text-red-300',
      glowColor: 'shadow-red-600/20'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      <motion.div 
        className={`
          ${config.bgColor} ${config.borderColor} ${config.textColor} 
          border rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm
          shadow-lg ${config.glowColor} relative overflow-hidden
          ${className}
        `}
        role="alert"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        layout
      >
        {/* Animated background pulse for critical errors */}
        {type === 'critical' && (
          <motion.div
            className="absolute inset-0 bg-red-600/5"
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Icon */}
        {showIcon && IconComponent && (
          <motion.div
            className="flex-shrink-0 relative z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <IconComponent 
              className={`w-5 h-5 ${config.iconColor}`}
            />
          </motion.div>
        )}

        {/* Message */}
        <motion.div 
          className="flex-1 relative z-10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="text-sm font-medium leading-relaxed">
            {message}
          </span>
        </motion.div>

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <motion.button
            type="button"
            onClick={onDismiss}
            className={`
              flex-shrink-0 ${config.textColor} hover:text-white 
              transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg
              relative z-10
            `}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        )}

        {/* Subtle border glow animation */}
        <motion.div
          className={`absolute inset-0 rounded-xl opacity-0 border-2 ${config.borderColor}`}
          animate={{
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}