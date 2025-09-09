'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function Input({ error, label, className, ...props }: InputProps) {
  const inputId = React.useId();

  return (
    <div className="relative">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-5 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[#6E86FF] focus:border-transparent',
          'transition-all duration-200 hover:bg-gray-800/70',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500/50 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
