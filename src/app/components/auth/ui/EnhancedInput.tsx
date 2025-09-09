'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  error?: string;
  label?: string;
  icon?: 'email' | 'password' | 'user' | React.ReactNode;
  success?: boolean;
  helperText?: string;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ error, label, icon, success, helperText, className, ...props }, ref) => {
    const inputId = React.useId();
    
    // Icon mapping
    const iconMap = {
      email: Mail,
      password: Lock,
      user: User,
    };

    const IconComponent = typeof icon === 'string' && icon in iconMap ? iconMap[icon as keyof typeof iconMap] : null;

    return (
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Label */}
        {label && (
          <motion.label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative group">
          {/* Icon */}
          {(IconComponent || (typeof icon !== 'string' && icon)) && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
              {IconComponent ? (
                <IconComponent 
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    error ? "text-red-400" : 
                    success ? "text-green-400" : 
                    "text-gray-400 group-focus-within:text-[#6E86FF]"
                  )}
                />
              ) : (
                icon
              )}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full px-5 py-4 rounded-xl text-white placeholder-gray-400 text-sm font-medium relative z-10',
              'transition-all duration-300 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              
              // Icon padding
              (IconComponent || (typeof icon !== 'string' && icon)) && 'pl-12',
              
              // State-based styling
              error ? [
                'bg-red-500/10 border-2 border-red-500/30',
                'focus:border-red-500 focus:ring-red-500/20',
                'hover:border-red-500/50'
              ] : success ? [
                'bg-green-500/10 border-2 border-green-500/30',
                'focus:border-green-500 focus:ring-green-500/20',
                'hover:border-green-500/50'
              ] : [
                'bg-gray-800/50 border-2 border-gray-700/30 backdrop-blur-sm',
                'hover:bg-gray-800/70 hover:border-gray-600/40',
                'focus:bg-gray-800/80 focus:border-[#6E86FF] focus:ring-[#6E86FF]/20',
                'group-hover:shadow-lg group-hover:shadow-[#6E86FF]/5'
              ],
              
              className
            )}
            {...props}
          />

          {/* Status Icons */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none"
              >
                {error ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : success ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Border Effect */}
          <div className="absolute inset-0 rounded-xl pointer-events-none -z-10">
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100"
              style={{
                background: 'linear-gradient(90deg, #6E86FF, #FF6BBA, #6E86FF)',
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <div className="absolute inset-[2px] bg-gray-900 rounded-[10px]" />
          </div>
        </div>

        {/* Error/Helper Text */}
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.div
              key={error ? 'error' : 'helper'}
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "mt-2 text-sm flex items-center gap-2 px-1",
                error ? "text-red-400" : "text-gray-400"
              )}>
                {error && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{error || helperText}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';
