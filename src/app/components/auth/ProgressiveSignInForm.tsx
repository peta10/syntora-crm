'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, AlertCircle, Sparkles } from 'lucide-react';
import { SignInFormErrors } from '@/app/types/auth';
import { EnhancedInput } from './ui/EnhancedInput';
import { EnhancedButton } from './ui/EnhancedButton';
import { ErrorMessage } from './ui/ErrorMessage';
import { validateEmail } from '@/app/utils/validation';

interface ProgressiveSignInFormProps {
  step: 'email' | 'password' | 'complete';
  email: string;
  emailSuggestion?: string;
  isLoading: boolean;
  errors: SignInFormErrors;
  attemptCount: number;
  onEmailSubmit: (email: string) => Promise<void>;
  onPasswordSubmit: (password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onBack: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  onNavigateToSignUp: () => void;
  onNavigateToReset: () => void;
}

export function ProgressiveSignInForm({
  step,
  email,
  emailSuggestion,
  isLoading,
  errors,
  attemptCount,
  onEmailSubmit,
  onPasswordSubmit,
  onGoogleSignIn,
  onBack,
  onSuggestionClick,
  onNavigateToSignUp,
  onNavigateToReset,
}: ProgressiveSignInFormProps) {
  const [emailInput, setEmailInput] = useState(email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    if (step === 'email') {
      emailRef.current?.focus();
    } else if (step === 'password') {
      passwordRef.current?.focus();
    }
  }, [step]);

  // Step configurations
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput && validateEmail(emailInput)) {
      await onEmailSubmit(emailInput);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      await onPasswordSubmit(password);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !isLoading) {
      action();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="w-full">
        <motion.div
          className="h-1 bg-gray-700/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${currentConfig.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
      </div>

      {/* Dynamic Title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-2"
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
            <EnhancedInput
              ref={emailRef}
              type="email"
              placeholder="Enter your email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              required
              icon="email"
            />

            {/* Email Suggestion */}
            {emailSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-400 text-center"
              >
                Did you mean{' '}
                <button
                  type="button"
                  onClick={() => onSuggestionClick?.(emailSuggestion)}
                  className="text-[#6E86FF] hover:text-[#FF6BBA] underline transition-colors"
                >
                  {emailSuggestion}
                </button>?
              </motion.div>
            )}

            <div className="space-y-3">
              <EnhancedButton
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!emailInput || !validateEmail(emailInput)}
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </EnhancedButton>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900/50 text-gray-400">or</span>
                </div>
              </div>

              <EnhancedButton
                type="button"
                variant="secondary"
                onClick={onGoogleSignIn}
                disabled={isLoading}
                fullWidth
                icon={
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                }
              >
                Continue with Google
              </EnhancedButton>
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
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{email}</span>
              <button
                type="button"
                onClick={onBack}
                className="ml-auto text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </motion.div>

            <div className="relative">
              <EnhancedInput
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, () => handlePasswordSubmit(e as any))}
                error={errors.password}
                disabled={isLoading}
                autoComplete="current-password"
                autoFocus
                required
                icon="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <ErrorMessage message={errors.general} />

            <div className="space-y-3">
              <EnhancedButton
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!password}
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </EnhancedButton>

              {attemptCount >= 2 && (
                <motion.button
                  type="button"
                  onClick={onNavigateToReset}
                  className="w-full text-sm text-[#6E86FF] hover:text-[#FF6BBA] transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  disabled={isLoading}
                >
                  Forgot your password? Reset it here
                </motion.button>
              )}
            </div>
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
            <motion.div
              className="w-20 h-20 mx-auto bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-full flex items-center justify-center relative overflow-hidden"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <Sparkles className="w-8 h-8 text-white relative z-10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                Welcome back!
              </h3>
              <p className="text-sm text-gray-400">
                Taking you to your dashboard...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Links */}
      {step !== 'complete' && (
        <motion.div
          className="text-center space-y-2 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="text-[#6E86FF] hover:text-[#FF6BBA] transition-colors underline"
              disabled={isLoading}
            >
              Sign up for free
            </button>
          </p>
          
          {step === 'email' && (
            <button
              type="button"
              onClick={onNavigateToReset}
              className="block w-full text-xs text-gray-400 hover:text-[#6E86FF] transition-colors"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
