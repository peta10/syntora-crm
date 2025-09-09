'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  gradient?: boolean;
}

export function EnhancedButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  gradient = false,
  className,
  children,
  disabled,
  ...props
}: EnhancedButtonProps) {
  const variants = {
    primary: [
      'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold',
      'hover:shadow-xl hover:shadow-[#6E86FF]/25',
      'active:scale-[0.98] active:shadow-lg',
      'disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none',
      'relative overflow-hidden'
    ],
    secondary: [
      'bg-gray-800/50 border-2 border-gray-700/50 text-white font-medium backdrop-blur-sm',
      'hover:bg-gray-700/60 hover:border-gray-600/60 hover:shadow-lg',
      'active:scale-[0.98] active:bg-gray-700/80',
      'disabled:bg-gray-800/30 disabled:border-gray-700/30'
    ],
    outline: [
      'border-2 border-gray-600 text-gray-300 font-medium bg-transparent',
      'hover:bg-gray-800/50 hover:text-white hover:border-gray-500',
      'active:scale-[0.98] active:bg-gray-800/80',
      'disabled:border-gray-700 disabled:text-gray-500'
    ],
    ghost: [
      'text-gray-400 hover:text-white hover:bg-gray-800/50 font-medium',
      'active:scale-[0.98] active:bg-gray-800/80',
      'disabled:text-gray-600 disabled:hover:bg-transparent'
    ],
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-4 text-sm',
    lg: 'px-8 py-5 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      className={cn(
        // Base styles
        'rounded-xl shadow-md transition-all duration-300 ease-out',
        'flex items-center justify-center gap-3 relative',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:cursor-not-allowed disabled:opacity-60',
        
        // Variant styles
        ...variants[variant],
        
        // Size styles
        sizes[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Focus ring color based on variant
        variant === 'primary' && 'focus:ring-[#6E86FF]/50',
        variant === 'secondary' && 'focus:ring-gray-500/50',
        variant === 'outline' && 'focus:ring-gray-400/50',
        variant === 'ghost' && 'focus:ring-gray-400/30',
        
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { 
        scale: 1.02,
        y: -1,
      } : {}}
      whileTap={!isDisabled ? { 
        scale: 0.98,
        y: 0,
      } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Animated background for primary buttons */}
      {variant === 'primary' && !isDisabled && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] opacity-0 hover:opacity-100"
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : icon ? (
          <motion.span
            animate={!isDisabled ? {
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {icon}
          </motion.span>
        ) : null}
        
        {children && (
          <span className="font-inherit">
            {children}
          </span>
        )}
      </span>

      {/* Ripple effect */}
      <motion.span
        className="absolute inset-0 rounded-xl"
        whileTap={!isDisabled ? {
          background: [
            "radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)",
            "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
            "radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)"
          ]
        } : {}}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
}
