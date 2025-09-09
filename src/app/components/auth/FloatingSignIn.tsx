'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { validateEmail } from '@/app/utils/validation';

export function FloatingSignIn() {
  const [step, setStep] = useState<'email' | 'password' | 'complete'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Focus management
  useEffect(() => {
    if (step === 'email') {
      setTimeout(() => emailRef.current?.focus(), 100);
    } else if (step === 'password') {
      setTimeout(() => passwordRef.current?.focus(), 100);
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && validateEmail(email)) {
      setError('');
      setStep('password');
    } else {
      setError('Please enter a valid email address');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await signIn(email, password);
      
      if (authError) {
        setError(authError.message || 'Sign in failed. Please try again.');
      } else {
        setStep('complete');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await signInWithGoogle();
      
      if (authError) {
        setError('Failed to sign in with Google. Please try again.');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepConfig = {
    email: {
      title: "What's your email?",
      subtitle: "Enter your email to get started",
      progress: 50,
    },
    password: {
      title: `Welcome back!`,
      subtitle: `Hi ${email.split('@')[0]}, please enter your password`,
      progress: 100,
    },
    complete: {
      title: "You're all set!",
      subtitle: "Redirecting you to your dashboard...",
      progress: 100,
    },
  };

  const currentConfig = stepConfig[step];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <motion.div
        className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-3xl relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] mb-6 shadow-2xl p-4">
            <img 
              src="/FinalFavicon.webp" 
              alt="Syntora"
              className="w-full h-full object-contain filter brightness-110"
            />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent text-center leading-tight">
            Welcome Back
          </h1>
          
          <p className="text-gray-400 text-center mt-2 text-sm">
            Sign in to your Syntora account
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="h-1 bg-gray-700/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentConfig.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Dynamic Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-2 mb-6"
          >
            <h2 className="text-xl font-semibold text-white">
              {currentConfig.title}
            </h2>
            <p className="text-sm text-gray-400">
              {currentConfig.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {/* Email Step */}
          {step === 'email' && (
            <motion.form
              key="email-form"
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className="w-full px-5 py-4 pl-12 rounded-xl text-white placeholder-gray-400 text-sm font-medium relative z-10 bg-gray-800/50 border-2 border-gray-700/30 backdrop-blur-sm hover:bg-gray-800/70 hover:border-gray-600/40 focus:bg-gray-800/80 focus:border-[#6E86FF] focus:outline-none focus:ring-2 focus:ring-[#6E86FF]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={!email || !validateEmail(email) || isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-[#6E86FF]/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6E86FF]/50 flex items-center justify-center gap-3"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900/95 text-gray-400">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gray-800/50 border-2 border-gray-700/50 text-white font-medium backdrop-blur-sm rounded-xl shadow-md transition-all duration-300 hover:bg-gray-700/60 hover:border-gray-600/60 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500/50 flex items-center justify-center gap-3"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </button>
              </div>
            </motion.form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <motion.form
              key="password-form"
              onSubmit={handlePasswordSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Email Display */}
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-medium">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="ml-auto text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className="w-full px-5 py-4 pl-12 pr-12 rounded-xl text-white placeholder-gray-400 text-sm font-medium relative z-10 bg-gray-800/50 border-2 border-gray-700/30 backdrop-blur-sm hover:bg-gray-800/70 hover:border-gray-600/40 focus:bg-gray-800/80 focus:border-[#6E86FF] focus:outline-none focus:ring-2 focus:ring-[#6E86FF]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-20"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!password || isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-[#6E86FF]/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6E86FF]/50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Welcome back!
                </h3>
                <p className="text-sm text-gray-400">
                  Taking you to your dashboard...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Footer Links */}
        {step !== 'complete' && (
          <div className="text-center space-y-2 pt-4 mt-6 border-t border-gray-700/30">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-[#6E86FF] hover:text-[#FF6BBA] transition-colors underline"
                disabled={isLoading}
              >
                Sign up for free
              </button>
            </p>
            
            <button
              type="button"
              onClick={() => router.push('/reset-password')}
              className="block w-full text-xs text-gray-400 hover:text-[#6E86FF] transition-colors"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
