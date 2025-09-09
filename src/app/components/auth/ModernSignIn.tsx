'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { ModernSignInLayout } from './ModernSignInLayout';
import { ProgressiveSignInForm } from './ProgressiveSignInForm';
import { SignInFormData, SignInFormErrors } from '@/app/types/auth';
import { validateSignInForm, hasValidationErrors } from '@/app/utils/validation';
import { SmartValidation } from './utils/SmartValidation';

interface ModernSignInProps {
  onSuccess?: () => void;
  redirectTo?: string;
  variant?: 'default' | 'minimal' | 'floating';
}

export function ModernSignIn({ 
  onSuccess, 
  redirectTo = '/', 
  variant = 'floating' 
}: ModernSignInProps) {
  const [errors, setErrors] = useState<SignInFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password' | 'complete'>('email');
  const [email, setEmail] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [emailSuggestion, setEmailSuggestion] = useState<string>('');
  
  const { signIn, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const smartValidation = new SmartValidation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      onSuccess?.() || router.push(redirectTo);
    }
  }, [user, router, redirectTo, onSuccess]);

  // Progressive form handlers
  const handleEmailSubmit = async (emailValue: string) => {
    setEmail(emailValue);
    setEmailSuggestion('');
    
    // Smart email validation with domain suggestions
    const emailValidation = await smartValidation.validateEmailAdvanced(emailValue);
    
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.message });
      if (emailValidation.suggestion) {
        setEmailSuggestion(emailValidation.suggestion);
      }
      return;
    }

    // Check if email exists (optional UX enhancement)
    const emailExists = await smartValidation.checkEmailExists(emailValue);
    if (!emailExists) {
      setErrors({ 
        email: 'No account found with this email. Would you like to sign up instead?' 
      });
      return;
    }

    setErrors({});
    setStep('password');
  };

  const handlePasswordSubmit = async (password: string) => {
    const formData: SignInFormData = { email, password };
    
    // Clear previous errors
    setErrors({});
    
    // Client-side validation
    const validationErrors = validateSignInForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setAttemptCount(prev => prev + 1);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Smart error handling with contextual messages
        const contextualError = smartValidation.getContextualError(error, attemptCount);
        setErrors({ general: contextualError });
        
        // If too many attempts, suggest password reset
        if (attemptCount >= 2) {
          setErrors({ 
            general: contextualError,
            password: 'Having trouble? Try resetting your password instead.' 
          });
        }
      } else {
        setStep('complete');
        setTimeout(() => {
          onSuccess?.() || router.push(redirectTo);
        }, 1000);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setErrors({ 
          general: 'Failed to sign in with Google. Please try again.' 
        });
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setErrors({ 
        general: 'Failed to sign in with Google. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setErrors({});
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEmail(suggestion);
    setEmailSuggestion('');
    handleEmailSubmit(suggestion);
  };

  return (
    <ModernSignInLayout variant={variant}>
      <ProgressiveSignInForm
        step={step}
        email={email}
        emailSuggestion={emailSuggestion}
        isLoading={isLoading}
        errors={errors}
        attemptCount={attemptCount}
        onEmailSubmit={handleEmailSubmit}
        onPasswordSubmit={handlePasswordSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        onBack={handleBack}
        onSuggestionClick={handleSuggestionClick}
        onNavigateToSignUp={() => router.push('/signup')}
        onNavigateToReset={() => router.push('/reset-password')}
      />
    </ModernSignInLayout>
  );
}
