'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernSignInLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'floating';
}

export function ModernSignInLayout({ 
  children, 
  variant = 'default' 
}: ModernSignInLayoutProps) {
  const layouts = {
    default: {
      container: "min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] relative overflow-hidden",
      card: "relative z-10 w-full max-w-md rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl p-8",
      background: true
    },
    minimal: {
      container: "min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] relative",
      card: "w-full max-w-sm bg-gray-900/30 backdrop-blur-sm border border-gray-700/20 rounded-2xl p-6",
      background: false
    },
    floating: {
      container: "fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4",
      card: "w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-3xl relative z-60",
      background: false
    }
  };

  const currentLayout = layouts[variant];

  return (
    <div className={currentLayout.container}>
      {/* Enhanced Background Effects */}
      {currentLayout.background && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#6E86FF]/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-[#FF6BBA]/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Additional floating elements */}
          <motion.div
            className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-[#6E86FF]/10 to-[#FF6BBA]/10 rounded-full blur-2xl"
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(110,134,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(110,134,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
      )}

      {/* Main Card with Enhanced Animations */}
      <motion.div
        className={currentLayout.card}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ 
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Enhanced Logo Section */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] mb-6 shadow-2xl p-4 relative overflow-hidden"
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
            <img 
              src="/FinalFavicon.webp" 
              alt="Syntora"
              className="w-full h-full object-contain filter brightness-110 relative z-10"
            />
          </motion.div>

          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent text-center leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Welcome Back
          </motion.h1>
          
          <motion.p 
            className="text-gray-400 text-center mt-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sign in to your Syntora account
          </motion.p>
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key="form-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating Elements for Enhanced Ambiance */}
      {currentLayout.background && (
        <>
          <motion.div
            className="fixed top-10 right-10 w-2 h-2 bg-[#6E86FF] rounded-full opacity-60"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="fixed bottom-10 left-10 w-1 h-1 bg-[#FF6BBA] rounded-full opacity-40"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </>
      )}
    </div>
  );
}
