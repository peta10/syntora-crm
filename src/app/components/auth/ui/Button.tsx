'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white hover:shadow-lg hover:scale-105',
    secondary: 'bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 hover:scale-105',
    outline: 'border-2 border-gray-700 text-white hover:bg-gray-800/50',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800/50',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  return (
    <button
      className={cn(
        'font-medium rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6E86FF]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isLoading && 'cursor-wait',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && !isLoading && icon}
      {children}
    </button>
  );
}
